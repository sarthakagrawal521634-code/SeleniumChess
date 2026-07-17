#include "ble_chessup.h"
#include <Arduino.h>

BleChessUp::BleChessUp() : pServer(nullptr), txChar(nullptr), rxChar(nullptr), connected(false), stopping(false), lastSendTime(0), serverCallbacks(nullptr), rxCallbacks(nullptr) {
  mutex = xSemaphoreCreateMutex();
  pendingReset.pending = false;
  pendingFEN.pending = false;
  pendingMove.pending = false;
  pendingPromotion.pending = false;
  pendingSettings.pending = false;
}

BleChessUp::~BleChessUp() {
  stop();
  if (mutex) vSemaphoreDelete(mutex);
}

void BleChessUp::begin() {
  Serial.println("BLE: Initializing as ChessUp...");
  stopping = false;

  NimBLEDevice::init("ChessUp");
  NimBLEDevice::setPower(ESP_PWR_LVL_P9);

  pServer = NimBLEDevice::createServer();
  serverCallbacks = new ServerCallbacks(this);
  pServer->setCallbacks(serverCallbacks);

  NimBLEService* pService = pServer->createService(BLE_SERVICE_UUID);

  txChar = pService->createCharacteristic(BLE_TX_CHAR_UUID, NIMBLE_PROPERTY::NOTIFY);
  rxChar = pService->createCharacteristic(BLE_RX_CHAR_UUID, NIMBLE_PROPERTY::WRITE | NIMBLE_PROPERTY::WRITE_NR);
  rxCallbacks = new RxCallbacks(this);
  rxChar->setCallbacks(rxCallbacks);

  NimBLEAdvertising* pAdvertising = NimBLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(BLE_SERVICE_UUID);
  pAdvertising->setName("ChessUp");
  pAdvertising->start();

  Serial.println("BLE: Advertising as 'ChessUp'");
}

void BleChessUp::stop() {
  if (!pServer) return; // Already stopped or never started
  Serial.println("BLE: Stopping...");
  stopping = true;  // Block processIncoming() from touching shared state
  connected = false;

  // Disconnect any connected client before tearing down
  if (pServer->getConnectedCount() > 0) {
    pServer->disconnect(0);
    delay(100);
  }

  NimBLEDevice::stopAdvertising();

  // Wait for any in-flight BLE callbacks to finish and see `stopping`
  delay(300);

  // Clear pending state (especially heap-allocated Strings) under mutex
  // so destruction doesn't race with a callback that just finished writing
  if (xSemaphoreTake(mutex, pdMS_TO_TICKS(500))) {
    pendingFEN.fen = String();  // Release String buffer before deinit
    pendingFEN.pending = false;
    pendingReset.pending = false;
    pendingMove.pending = false;
    pendingPromotion.pending = false;
    pendingSettings.pending = false;
    xSemaphoreGive(mutex);
  }

  NimBLEDevice::deinit(true);

  if (serverCallbacks) {
    delete serverCallbacks;
    serverCallbacks = nullptr;
  }
  if (rxCallbacks) {
    delete rxCallbacks;
    rxCallbacks = nullptr;
  }
  pServer = nullptr;
  txChar = nullptr;
  rxChar = nullptr;
}

void BleChessUp::restartAdvertising() {
  if (pServer && !connected) {
    NimBLEDevice::startAdvertising();
    Serial.println("BLE: Re-advertising for reconnect");
  }
}

// --- NimBLE Callbacks ---

void BleChessUp::ServerCallbacks::onConnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo) {
  Serial.println("BLE: Client connected");
  parent->connected = true;
}

void BleChessUp::ServerCallbacks::onDisconnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo, int reason) {
  Serial.printf("BLE: Client disconnected (reason=%d)\n", reason);
  parent->connected = false;
  // Note: do NOT call startAdvertising() here — it races with stop()/deinit() on the main task.
  // ChessConnect::update() will call restartAdvertising() explicitly when ready.
}

void BleChessUp::RxCallbacks::onWrite(NimBLECharacteristic* pCharacteristic, NimBLEConnInfo& connInfo) {
  NimBLEAttValue value = pCharacteristic->getValue();
  if (value.length() > 0) {
    parent->processIncoming(value.data(), value.length());
  }
}

// --- Incoming command parsing ---

void BleChessUp::processIncoming(const uint8_t* data, size_t len) {
  if (len == 0 || stopping) return;

  uint8_t cmd = data[0];
  Serial.printf("BLE RX: cmd=%d len=%d hex=", cmd, len);
  for (size_t i = 0; i < len && i < 64; i++) Serial.printf("%02x ", data[i]);
  Serial.println();

  switch (cmd) {
    case CMD_RESET:
      if (xSemaphoreTake(mutex, pdMS_TO_TICKS(100))) {
        pendingReset.pending = true;
        xSemaphoreGive(mutex);
      }
      Serial.println("BLE: Reset command received");
      break;

    case CMD_SET_POSITION:
      parseFENCommand(data, len);
      break;

    case CMD_SEND_MOVE:
      parseMoveCommand(data, len);
      break;

    case CMD_PROMOTION:
      parsePromotionCommand(data, len);
      break;

    case CMD_GAME_SETTINGS:
      parseSettingsCommand(data, len);
      break;

    case ACK_MOVE_RECEIVED:
      // ChessConnect sends this after receiving CMD_MOVE_FROM_BOARD — safe to ignore
      Serial.println("BLE: Move acknowledged by ChessConnect");
      break;

    default:
      Serial.printf("BLE: Unknown command %d\n", cmd);
      break;
  }
}

void BleChessUp::parseFENCommand(const uint8_t* data, size_t len) {
  // Command 102: [cmd, length, FEN_text..., halfmove, fullmove_hi, fullmove_lo]
  // Byte 1 is the length of remaining data (= len - 2)
  if (len < 6) {
    Serial.println("BLE: FEN command too short");
    return;
  }

  // Detect length byte: if data[1] matches the remaining byte count, skip it
  size_t fenStart = (data[1] == len - 2) ? 2 : 1;

  // Extract FEN text: skip cmd (+ optional length byte), exclude trailing 3 bytes
  size_t fenLen = len - 3 - fenStart;
  String fenText;
  fenText.reserve(fenLen + 20); // Pre-allocate to avoid repeated heap allocations in BLE callback
  for (size_t i = fenStart; i < len - 3; i++) {
    fenText += (char)data[i];
  }
  fenText.trim();

  // Trailing 3 bytes: halfmove, fullmove_hi, fullmove_lo
  uint8_t halfmove = data[len - 3];
  uint8_t fullmoveHi = data[len - 2];
  uint8_t fullmoveLo = data[len - 1];
  int fullmove = (fullmoveHi << 8) | fullmoveLo;

  // Build complete FEN by appending move counters
  String completeFEN = fenText + " " + String(halfmove) + " " + String(fullmove);

  Serial.printf("BLE: FEN received: %s\n", completeFEN.c_str());

  if (xSemaphoreTake(mutex, pdMS_TO_TICKS(100))) {
    pendingFEN.pending = true;
    pendingFEN.fen = completeFEN;
    pendingFEN.halfmove = halfmove;
    pendingFEN.fullmove = fullmove;
    xSemaphoreGive(mutex);
  }
}

void BleChessUp::parseMoveCommand(const uint8_t* data, size_t len) {
  // Command 153: [153, fromIndex, toIndex]
  // ChessUp index: row 0=rank 1 (bottom), so index = cupRow*8 + col
  // Our board: row 0=rank 8 (top), so we flip: ourRow = 7 - cupRow
  if (len < 3) {
    Serial.println("BLE: Move command too short");
    return;
  }

  uint8_t fromIndex = data[1];
  uint8_t toIndex = data[2];

  int cupFromRow = fromIndex / 8;
  int fromCol = fromIndex % 8;
  int cupToRow = toIndex / 8;
  int toCol = toIndex % 8;

  int fromRow = 7 - cupFromRow;
  int toRow = 7 - cupToRow;

  Serial.printf("BLE: Remote move received: (%d,%d)->(%d,%d) [cup rows: %d->%d]\n", fromRow, fromCol, toRow, toCol, cupFromRow, cupToRow);

  if (xSemaphoreTake(mutex, pdMS_TO_TICKS(100))) {
    pendingMove.pending = true;
    pendingMove.fromRow = fromRow;
    pendingMove.fromCol = fromCol;
    pendingMove.toRow = toRow;
    pendingMove.toCol = toCol;
    xSemaphoreGive(mutex);
  }
}

void BleChessUp::parsePromotionCommand(const uint8_t* data, size_t len) {
  // Command 151: [151, pieceType]
  // 1=Rook, 2=Knight, 3=Bishop, 4=Queen
  if (len < 2) {
    Serial.println("BLE: Promotion command too short");
    return;
  }

  char piece;
  switch (data[1]) {
    case 1: piece = 'r'; break;
    case 2: piece = 'n'; break;
    case 3: piece = 'b'; break;
    case 4: piece = 'q'; break;
    default:
      Serial.printf("BLE: Unknown promotion type %d, defaulting to queen\n", data[1]);
      piece = 'q';
      break;
  }

  Serial.printf("BLE: Promotion received: %c\n", piece);

  if (xSemaphoreTake(mutex, pdMS_TO_TICKS(100))) {
    pendingPromotion.pending = true;
    pendingPromotion.piece = piece;
    xSemaphoreGive(mutex);
  }
}

void BleChessUp::parseSettingsCommand(const uint8_t* data, size_t len) {
  // Command 185: [185, ...settings_bytes...]
  // Byte at index 10 indicates color: 1=white, other=black
  if (len < 11) {
    Serial.println("BLE: Settings command too short");
    return;
  }

  bool isWhite = (data[10] == 1);
  Serial.printf("BLE: Game settings received, player is %s\n", isWhite ? "White" : "Black");

  if (xSemaphoreTake(mutex, pdMS_TO_TICKS(100))) {
    pendingSettings.pending = true;
    pendingSettings.playerIsWhite = isWhite;
    xSemaphoreGive(mutex);
  }
}

// --- Public polling methods ---

bool BleChessUp::hasPendingReset() {
  bool result = false;
  if (xSemaphoreTake(mutex, pdMS_TO_TICKS(50))) {
    result = pendingReset.pending;
    if (result) pendingReset.pending = false;
    xSemaphoreGive(mutex);
  }
  return result;
}

bool BleChessUp::hasPendingFEN(String& fen, int& halfmove, int& fullmove) {
  bool result = false;
  if (xSemaphoreTake(mutex, pdMS_TO_TICKS(50))) {
    result = pendingFEN.pending;
    if (result) {
      fen = pendingFEN.fen;
      halfmove = pendingFEN.halfmove;
      fullmove = pendingFEN.fullmove;
      pendingFEN.pending = false;
    }
    xSemaphoreGive(mutex);
  }
  return result;
}

bool BleChessUp::hasPendingMove(int& fromRow, int& fromCol, int& toRow, int& toCol) {
  bool result = false;
  if (xSemaphoreTake(mutex, pdMS_TO_TICKS(50))) {
    result = pendingMove.pending;
    if (result) {
      fromRow = pendingMove.fromRow;
      fromCol = pendingMove.fromCol;
      toRow = pendingMove.toRow;
      toCol = pendingMove.toCol;
      pendingMove.pending = false;
    }
    xSemaphoreGive(mutex);
  }
  return result;
}

bool BleChessUp::hasPendingPromotion(char& piece) {
  bool result = false;
  if (xSemaphoreTake(mutex, pdMS_TO_TICKS(50))) {
    result = pendingPromotion.pending;
    if (result) {
      piece = pendingPromotion.piece;
      pendingPromotion.pending = false;
    }
    xSemaphoreGive(mutex);
  }
  return result;
}

bool BleChessUp::hasPendingSettings(bool& playerIsWhite) {
  bool result = false;
  if (xSemaphoreTake(mutex, pdMS_TO_TICKS(50))) {
    result = pendingSettings.pending;
    if (result) {
      playerIsWhite = pendingSettings.playerIsWhite;
      pendingSettings.pending = false;
    }
    xSemaphoreGive(mutex);
  }
  return result;
}

// --- Outgoing messages ---

void BleChessUp::ensureSendInterval() {
  unsigned long now = millis();
  unsigned long elapsed = now - lastSendTime;
  if (elapsed < MIN_SEND_INTERVAL_MS) {
    delay(MIN_SEND_INTERVAL_MS - elapsed);
  }
  lastSendTime = millis();
}

void BleChessUp::sendData(const uint8_t* data, size_t len) {
  if (!connected || !txChar) return;
  ensureSendInterval();
  txChar->setValue(data, len);
  txChar->notify();
}

void BleChessUp::sendMove(int fromRow, int fromCol, int toRow, int toCol) {
  // Command 163: [163, 53, fromCol, fromRow, toCol, toRow]
  // ChessUp uses row 0=rank 1 (bottom), our board uses row 0=rank 8 (top)
  uint8_t cupFromRow = 7 - fromRow;
  uint8_t cupToRow = 7 - toRow;
  uint8_t data[6] = {CMD_MOVE_FROM_BOARD, 53, (uint8_t)fromCol, cupFromRow, (uint8_t)toCol, cupToRow};
  Serial.printf("BLE TX: Move (%d,%d)->(%d,%d) [cup rows: %d->%d]\n", fromRow, fromCol, toRow, toCol, cupFromRow, cupToRow);
  sendData(data, 6);
}

void BleChessUp::sendPromotion(char piece) {
  // Command 151: [151, pieceType]
  uint8_t pieceType;
  switch (tolower(piece)) {
    case 'r': pieceType = 1; break;
    case 'n': pieceType = 2; break;
    case 'b': pieceType = 3; break;
    case 'q': pieceType = 4; break;
    default: pieceType = 4; break; // Default to queen
  }
  uint8_t data[2] = {CMD_PROMOTION_FROM_BOARD, pieceType};
  Serial.printf("BLE TX: Promotion %c (type=%d)\n", piece, pieceType);
  sendData(data, 2);
}

void BleChessUp::sendAck(uint8_t type) {
  uint8_t data[1] = {type};
  Serial.printf("BLE TX: Ack %d\n", type);
  sendData(data, 1);
}

void BleChessUp::sendPositionConfirm() {
  uint8_t data[1] = {ACK_POSITION};
  Serial.println("BLE TX: Position confirmed");
  sendData(data, 1);
}
