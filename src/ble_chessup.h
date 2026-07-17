#ifndef BLE_CHESSUP_H
#define BLE_CHESSUP_H

#include <Arduino.h>
#include <NimBLEDevice.h>
#include <freertos/FreeRTOS.h>
#include <freertos/semphr.h>

// Nordic UART Service UUIDs
#define BLE_SERVICE_UUID "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
#define BLE_TX_CHAR_UUID "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
#define BLE_RX_CHAR_UUID "6e400002-b5a3-f393-e0a9-e50e24dcca9e"

// Commands from host (ChessConnect → board)
#define CMD_RESET 100
#define CMD_SET_POSITION 102
#define CMD_SEND_MOVE 153
#define CMD_PROMOTION 151
#define CMD_GAME_SETTINGS 185

// Messages from board (board → ChessConnect)
#define CMD_MOVE_FROM_BOARD 163
#define CMD_PROMOTION_FROM_BOARD 151
#define CMD_PIECE_TOUCHED 184

// Acknowledgment bytes
#define ACK_MOVE_RECEIVED 33
#define ACK_MOVE_SENT 34
#define ACK_PROMOTION 35
#define ACK_SETTINGS 36
#define ACK_POSITION 177

class BleChessUp {
 public:
  BleChessUp();
  ~BleChessUp();

  void begin();
  void stop();
  bool isConnected() const { return connected; }

  // Incoming commands (polled from game loop, mutex-protected)
  bool hasPendingReset();
  bool hasPendingFEN(String& fen, int& halfmove, int& fullmove);
  bool hasPendingMove(int& fromRow, int& fromCol, int& toRow, int& toCol);
  bool hasPendingPromotion(char& piece);
  bool hasPendingSettings(bool& playerIsWhite);

  // Outgoing messages (called from game loop)
  void sendMove(int fromRow, int fromCol, int toRow, int toCol);
  void sendPromotion(char piece);
  void sendAck(uint8_t type);
  void sendPositionConfirm();
  void restartAdvertising();

 private:
  NimBLEServer* pServer;
  NimBLECharacteristic* txChar;
  NimBLECharacteristic* rxChar;
  volatile bool connected;
  volatile bool stopping;  // guard against callbacks during teardown

  // Mutex protecting pending command buffers
  SemaphoreHandle_t mutex;

  // Pending incoming command buffers
  struct {
    volatile bool pending;
  } pendingReset;

  struct {
    volatile bool pending;
    String fen;
    int halfmove;
    int fullmove;
  } pendingFEN;

  struct {
    volatile bool pending;
    int fromRow, fromCol, toRow, toCol;
  } pendingMove;

  struct {
    volatile bool pending;
    char piece;
  } pendingPromotion;

  struct {
    volatile bool pending;
    bool playerIsWhite;
  } pendingSettings;

  // Protocol timing
  unsigned long lastSendTime;
  static const unsigned long MIN_SEND_INTERVAL_MS = 25;
  void ensureSendInterval();
  void sendData(const uint8_t* data, size_t len);

  // Parse incoming data
  void processIncoming(const uint8_t* data, size_t len);
  void parseFENCommand(const uint8_t* data, size_t len);
  void parseMoveCommand(const uint8_t* data, size_t len);
  void parsePromotionCommand(const uint8_t* data, size_t len);
  void parseSettingsCommand(const uint8_t* data, size_t len);

  // NimBLE callbacks
  class ServerCallbacks : public NimBLEServerCallbacks {
   public:
    BleChessUp* parent;
    ServerCallbacks(BleChessUp* p) : parent(p) {}
    void onConnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo) override;
    void onDisconnect(NimBLEServer* pServer, NimBLEConnInfo& connInfo, int reason) override;
  };

  class RxCallbacks : public NimBLECharacteristicCallbacks {
   public:
    BleChessUp* parent;
    RxCallbacks(BleChessUp* p) : parent(p) {}
    void onWrite(NimBLECharacteristic* pCharacteristic, NimBLEConnInfo& connInfo) override;
  };

  ServerCallbacks* serverCallbacks;
  RxCallbacks* rxCallbacks;
};

#endif // BLE_CHESSUP_H
