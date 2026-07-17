#include "chess_connect.h"
#include "move_history.h"
#include "chess_utils.h"
#include "led_colors.h"
#include "wifi_manager_esp32.h"
#include <Arduino.h>

ChessConnect::ChessConnect(BoardDriver* bd, ChessEngine* ce, WiFiManagerESP32* wm, BleChessUp* ble, MoveHistory* mh)
    : ChessGame(bd, ce, wm, mh), bleChessUp(ble), myColor('w'), gameActive(false), waitingForRemoteMove(false), disconnectTime(0) {}

void ChessConnect::resetWaitingState() {
  waitingForRemoteMove = false;
  boardDriver->clearThinkingAlertMask();
  if (stopAnimation) {
    stopAnimation->store(true);
    stopAnimation = nullptr;
  }
}

void ChessConnect::resignGame(char resigningColor) {
  resetWaitingState();
  ChessGame::resignGame(resigningColor);
}

void ChessConnect::drawGame() {
  resetWaitingState();
  ChessGame::drawGame();
}

void ChessConnect::begin() {
  wifiManager->addLog("Online Play: Waiting for BLE connection...");

  // Start BLE advertising
  bleChessUp->begin();

  // Show waiting animation while waiting for connection
  stopAnimation = boardDriver->startWaitingAnimation();

  Serial.println("Waiting for ChessConnect app to connect via BLE...");

  // Wait for BLE connection
  while (!bleChessUp->isConnected()) {
    delay(100);
    if (gameOver) return;
    if (wifiManager->getPendingHome()) {
      resetWaitingState();
      gameOver = true;
      return;
    }
  }

  wifiManager->setBleConnected(true);
  wifiManager->addLog("ChessConnect connected, waiting for game setup...");

  // Wait for reset command (100)
  while (!bleChessUp->hasPendingReset()) {
    if (!bleChessUp->isConnected()) {
      Serial.println("BLE disconnected during setup");
      resetWaitingState();
      boardDriver->flashBoardAnimation(LedColors::Red);
      gameOver = true;
      return;
    }
    if (wifiManager->getPendingHome()) {
      resetWaitingState();
      gameOver = true;
      return;
    }
    delay(50);
  }
  Serial.println("Reset command received");

  // Wait for FEN position (102)
  String fen;
  int halfmove, fullmove;
  while (!bleChessUp->hasPendingFEN(fen, halfmove, fullmove)) {
    if (!bleChessUp->isConnected()) {
      Serial.println("BLE disconnected during setup");
      resetWaitingState();
      boardDriver->flashBoardAnimation(LedColors::Red);
      gameOver = true;
      return;
    }
    if (wifiManager->getPendingHome()) {
      resetWaitingState();
      gameOver = true;
      return;
    }
    delay(50);
  }
  Serial.printf("Position received: %s\n", fen.c_str());

  // Apply the FEN position (skip internal waitForBoardSetup — we'll do it after animation is cancelled)
  replaying = true;
  setBoardStateFromFEN(fen);
  replaying = false;

  // Send position confirm
  bleChessUp->sendPositionConfirm();

  // Wait for game settings (185) with timeout — ChessConnect may not send this
  bool playerIsWhite = true; // default; overridden by settings command
  bool gotSettings = false;
  unsigned long settingsStart = millis();
  while (millis() - settingsStart < 4000) {
    if (bleChessUp->hasPendingSettings(playerIsWhite)) {
      gotSettings = true;
      break;
    }
    if (!bleChessUp->isConnected()) {
      Serial.println("BLE disconnected during setup");
      resetWaitingState();
      boardDriver->flashBoardAnimation(LedColors::Red);
      gameOver = true;
      return;
    }
    if (wifiManager->getPendingHome()) {
      resetWaitingState();
      gameOver = true;
      return;
    }
    delay(50);
  }

  myColor = playerIsWhite ? 'w' : 'b';
  if (gotSettings) {
    bleChessUp->sendAck(ACK_SETTINGS);
    Serial.printf("Playing as: %s (from settings)\n", playerIsWhite ? "White" : "Black");
  } else {
    Serial.printf("Playing as: %s (defaulting to side to move)\n", playerIsWhite ? "White" : "Black");
  }

  // Cancel waiting animation before board setup
  resetWaitingState();

  // Wait for physical board to match position
  waitForBoardSetup(board);

  if (moveHistory) {
    moveHistory->startGame(GAME_MODE_CONNECT, myColor);
    moveHistory->addFen(ChessUtils::boardToFEN(board, currentTurn, chessEngine));
  }
  gameActive = true;
  wifiManager->updateBoardState(ChessUtils::boardToFEN(board, currentTurn, chessEngine), ChessUtils::evaluatePosition(board));
  wifiManager->setPlayerNames(myColor == 'w' ? "User" : "Opponent", myColor == 'w' ? "Opponent" : "User");
  wifiManager->addLog("Game started! Playing as " + String(myColor == 'w' ? "White" : "Black"));

  Serial.println("=== Game started! ===");
}

void ChessConnect::update() {
  if (gameOver || !gameActive) return;

  // Handle BLE disconnect
  if (!bleChessUp->isConnected()) {
    wifiManager->setBleConnected(false);
    if (disconnectTime == 0) {
      disconnectTime = millis();
      wifiManager->addLog("BLE disconnected, waiting for reconnect...");
      bleChessUp->restartAdvertising();
      boardDriver->clearThinkingAlertMask();
      stopAnimation = boardDriver->startWaitingAnimation();
    } else if (millis() - disconnectTime > DISCONNECT_TIMEOUT_MS) {
      Serial.println("BLE disconnect timeout, ending game");
      resetWaitingState();
      boardDriver->flashBoardAnimation(LedColors::Red);
      gameOver = true;
      return;
    }
    delay(100);
    return;
  }

  // Reconnected after disconnect
  if (disconnectTime > 0) {
    wifiManager->addLog("BLE reconnected!");
    disconnectTime = 0;
    wifiManager->setBleConnected(true);
    resetWaitingState();
  }

  // Poll for reset command mid-game
  if (bleChessUp->hasPendingReset()) {
    Serial.println("Reset received mid-game, restarting...");
    resetWaitingState();
    gameActive = false;
    gameOver = true;
    return;
  }

  // Poll for new FEN (board position update)
  {
    String fen;
    int halfmove, fullmove;
    if (bleChessUp->hasPendingFEN(fen, halfmove, fullmove)) {
      Serial.printf("New position received: %s\n", fen.c_str());
      setBoardStateFromFEN(fen);
      bleChessUp->sendPositionConfirm();
      wifiManager->updateBoardState(ChessUtils::boardToFEN(board, currentTurn, chessEngine), ChessUtils::evaluatePosition(board));
    }
  }

  // Poll for settings update
  {
    bool playerIsWhite;
    if (bleChessUp->hasPendingSettings(playerIsWhite)) {
      myColor = playerIsWhite ? 'w' : 'b';
      bleChessUp->sendAck(ACK_SETTINGS);
      Serial.printf("Color updated: %s\n", playerIsWhite ? "White" : "Black");
    }
  }

  boardDriver->readSensors();

  // Check for physical resign/draw gesture
  if (checkPhysicalResignOrDraw()) return;

  bool isMyTurn = (currentTurn == myColor);

  if (isMyTurn) {
    // Player's turn - detect piece moves
    int fromRow, fromCol, toRow, toCol;
    if (tryPlayerMove(myColor, fromRow, fromCol, toRow, toCol)) {
      // Check if this is a promotion (pawn reaching last rank)
      char piece = board[fromRow][fromCol];
      bool isPromotion = chessEngine->isPawnPromotion(piece, toRow);

      // Log the move in algebraic notation
      char moveStr[6];
      snprintf(moveStr, sizeof(moveStr), "%c%d%c%d", 'a' + fromCol, 8 - fromRow, 'a' + toCol, 8 - toRow);
      wifiManager->addLog(String("Move: ") + moveStr);

      applyMove(fromRow, fromCol, toRow, toCol);

      // Send the move to ChessConnect
      bleChessUp->sendMove(fromRow, fromCol, toRow, toCol);

      // If promotion, send the promotion piece
      if (isPromotion) {
        char promotedPiece = board[toRow][toCol];
        bleChessUp->sendPromotion(promotedPiece);
      }

      updateGameStatus();
      wifiManager->updateBoardState(ChessUtils::boardToFEN(board, currentTurn, chessEngine), ChessUtils::evaluatePosition(board));
    }
  } else {
    // Opponent's turn - wait for remote move via BLE
    if (!waitingForRemoteMove) {
      waitingForRemoteMove = true;
      boardDriver->clearThinkingAlertMask();
      boardDriver->configureThinkingAnimation(ChessUtils::colorLed(currentTurn), currentTurn == 'b');
      stopAnimation = boardDriver->startThinkingAnimation();
    }

    // Check for web resign/draw while waiting for opponent
    char resignColor;
    if (wifiManager->getPendingResign(resignColor)) {
      wifiManager->clearPendingResign();
      wifiManager->addLog(String("Resign from web UI: ") + (resignColor == 'w' ? "White" : "Black") + " resigns");
      resignGame(resignColor);
      return;
    }
    if (wifiManager->getPendingDraw()) {
      wifiManager->clearPendingDraw();
      wifiManager->addLog("Draw agreed from web UI");
      drawGame();
      return;
    }

    bool discrepancyMask[8][8] = {};
    for (int r = 0; r < 8; r++)
      for (int c = 0; c < 8; c++)
        discrepancyMask[r][c] = ((board[r][c] != ' ') != boardDriver->getSensorState(r, c));
    boardDriver->setThinkingAlertMask(discrepancyMask);

    int fromRow, fromCol, toRow, toCol;
    if (bleChessUp->hasPendingMove(fromRow, fromCol, toRow, toCol)) {
      resetWaitingState();

      // Log opponent move
      char moveStr[6];
      snprintf(moveStr, sizeof(moveStr), "%c%d%c%d", 'a' + fromCol, 8 - fromRow, 'a' + toCol, 8 - toRow);
      wifiManager->addLog(String("Opponent: ") + moveStr);

      // Ack the move
      bleChessUp->sendAck(ACK_MOVE_SENT);

      // Check for promotion
      char piece = board[fromRow][fromCol];
      bool isPromotion = chessEngine->isPawnPromotion(piece, toRow);
      char promotionPiece = ' ';

      if (isPromotion) {
        // Wait for promotion command from ChessConnect
        unsigned long promoStart = millis();
        while (!bleChessUp->hasPendingPromotion(promotionPiece)) {
          if (wifiManager->getPendingHome()) {
            resetWaitingState();
            gameOver = true;
            return;
          }
          if (wifiManager->getPendingResign(resignColor)) {
            wifiManager->clearPendingResign();
            resignGame(resignColor);
            return;
          }
          if (wifiManager->getPendingDraw()) {
            wifiManager->clearPendingDraw();
            drawGame();
            return;
          }
          if (millis() - promoStart > 10000) {
            Serial.println("Promotion timeout, defaulting to queen");
            promotionPiece = 'q';
            break;
          }
          delay(50);
        }
        if (promotionPiece != ' ') {
          bleChessUp->sendAck(ACK_PROMOTION);
        }
      }

      applyMove(fromRow, fromCol, toRow, toCol, promotionPiece, true);

      // Echo the opponent's move back as CMD_MOVE_FROM_BOARD so ChessConnect
      // updates its tracked physical board state (lastPositionReceived).
      // Without this, the next board move shows extra modified fields and
      // isLegalMove=false because ChessConnect still has the pre-move state.
      bleChessUp->sendMove(fromRow, fromCol, toRow, toCol);

      updateGameStatus();
      wifiManager->updateBoardState(ChessUtils::boardToFEN(board, currentTurn, chessEngine), ChessUtils::evaluatePosition(board));
    }
  }

  // Only check board consistency when it's the player's turn.
  // During opponent's turn, the thinking animation's alert mask already
  // shows misplaced pieces, and blocking here would prevent BLE polling.
  if (!waitingForRemoteMove) {
    waitForBoardConsistency();
  }
  boardDriver->updateSensorPrev();
}

void ChessConnect::waitForRemoteMoveCompletion(int fromRow, int fromCol, int toRow, int toCol, bool isCapture, bool isEnPassant, int enPassantCapturedPawnRow) {
  boardDriver->acquireLEDs();
  boardDriver->clearAllLEDs(false);
  // Show source square (where to pick up from)
  boardDriver->setSquareLED(fromRow, fromCol, LedColors::Cyan);
  // Show destination square (where to place)
  if (isCapture)
    boardDriver->setSquareLED(toRow, toCol, LedColors::Red);
  else
    boardDriver->setSquareLED(toRow, toCol, LedColors::White);
  if (isEnPassant)
    boardDriver->setSquareLED(enPassantCapturedPawnRow, toCol, LedColors::Purple);
  boardDriver->showLEDs();

  // Build set of squares involved in this move (don't flag these as discrepancies)
  bool moveSquares[8][8] = {};
  moveSquares[fromRow][fromCol] = true;
  moveSquares[toRow][toCol] = true;
  if (isEnPassant)
    moveSquares[enPassantCapturedPawnRow][toCol] = true;

  bool piecePickedUp = false;
  bool capturedPieceRemoved = false;
  bool moveCompleted = false;
  bool hadDiscrepancy = false;

  Serial.println("Waiting for you to complete the remote move...");

  while (!moveCompleted) {
    boardDriver->readSensors();

    // Check for home request from web UI
    if (wifiManager->getPendingHome()) {
      boardDriver->clearAllLEDs();
      boardDriver->releaseLEDs();
      gameOver = true;
      return;
    }

    // Check for web resign/draw while waiting
    char resignColor;
    if (wifiManager->getPendingResign(resignColor)) {
      wifiManager->clearPendingResign();
      wifiManager->addLog(String("Resign from web UI during remote move: ") + (resignColor == 'w' ? "White" : "Black") + " resigns");
      boardDriver->clearAllLEDs();
      boardDriver->releaseLEDs();
      resignGame(resignColor);
      return;
    }
    if (wifiManager->getPendingDraw()) {
      wifiManager->clearPendingDraw();
      wifiManager->addLog("Draw agreed from web UI during remote move");
      boardDriver->clearAllLEDs();
      boardDriver->releaseLEDs();
      drawGame();
      return;
    }

    // For capture moves, ensure captured piece is removed first
    if (isCapture && !capturedPieceRemoved) {
      int captureCheckRow = isEnPassant ? enPassantCapturedPawnRow : toRow;
      if (!boardDriver->getSensorState(captureCheckRow, toCol)) {
        capturedPieceRemoved = true;
        if (isEnPassant)
          Serial.println("En passant captured pawn removed, now complete the move...");
        else
          Serial.println("Captured piece removed, now complete the move...");
      }
    }

    // Check if piece was picked up from source
    if (!piecePickedUp && !boardDriver->getSensorState(fromRow, fromCol)) {
      piecePickedUp = true;
      Serial.println("Piece picked up, now place it on the destination...");
    }

    // Check if piece was placed on destination
    if (piecePickedUp && boardDriver->getSensorState(toRow, toCol))
      if (!isCapture || (isCapture && capturedPieceRemoved)) {
        moveCompleted = true;
        Serial.println("Move completed on physical board!");
      }

    // Monitor for knocked-off pieces (show red for discrepancies on non-move squares)
    if (!moveCompleted) {
      bool discrepancyFound = false;
      for (int r = 0; r < 8; r++) {
        for (int c = 0; c < 8; c++) {
          if (moveSquares[r][c]) continue;
          bool sensorOn = boardDriver->getSensorState(r, c);
          bool shouldHavePiece = (board[r][c] != ' ');
          if (shouldHavePiece != sensorOn) {
            boardDriver->setSquareLED(r, c, LedColors::Red);
            discrepancyFound = true;
          } else {
            boardDriver->setSquareLED(r, c, LedColors::Off);
          }
        }
      }
      if (discrepancyFound || hadDiscrepancy) boardDriver->showLEDs();
      hadDiscrepancy = discrepancyFound;
    }

    delay(SENSOR_READ_DELAY_MS);
    boardDriver->updateSensorPrev();
  }

  boardDriver->clearAllLEDs();
  boardDriver->releaseLEDs();
}
