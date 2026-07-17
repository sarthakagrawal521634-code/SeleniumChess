#include "chess_bot.h"
#include "chess_utils.h"
#include "led_colors.h"
#include "move_history.h"
#include "stockfish_api.h"
#include "wifi_manager_esp32.h"
#include <Arduino.h>

ChessBot::ChessBot(BoardDriver* bd, ChessEngine* ce, WiFiManagerESP32* wm, MoveHistory* mh, BotConfig cfg) : ChessGame(bd, ce, wm, mh), botConfig(cfg), currentEvaluation(0.0) {}

void ChessBot::begin() {
  Serial.println("=== Starting Chess Bot Mode ===");
  Serial.printf("Player plays: %s\n", botConfig.playerIsWhite ? "White" : "Black");
  Serial.printf("Bot plays: %s\n", botConfig.playerIsWhite ? "Black" : "White");
  Serial.printf("Bot Difficulty: Depth %d, Timeout %dms\n", botConfig.stockfishSettings.depth, botConfig.stockfishSettings.timeoutMs);
  Serial.printf("Engine source: %s\n", botConfig.engineSource == BotEngineSource::LocalEngine ? "Local (fallback active)" : "Remote Stockfish API");
  Serial.println("====================================");
  if (wifiManager->ensureConnected()) {
    initializeBoard();
    if (moveHistory->hasLiveGame()) {
      Serial.println("Resuming live bot game...");
      replaying = true;
      moveHistory->replayIntoGame(this);
      replaying = false;
      wifiManager->updateBoardState(ChessUtils::boardToFEN(board, currentTurn, chessEngine), ChessUtils::evaluatePosition(board));
    } else {
      moveHistory->startGame(GAME_MODE_BOT, botConfig.playerIsWhite ? 'w' : 'b', (uint8_t)botConfig.stockfishSettings.depth);
      moveHistory->addFen(ChessUtils::boardToFEN(board, currentTurn, chessEngine));
    }
    waitForBoardSetup(board);
    const char* levels[] = {"Easy","Medium","Hard","Expert"};
    const int depths[] = {5, 8, 11, 15};
    String levelName = "Stockfish";
    for (int i = 0; i < 4; i++) { if (botConfig.stockfishSettings.depth == depths[i]) { levelName = String(levels[i]); break; } }
    if (botConfig.playerIsWhite)
      wifiManager->setPlayerNames("User", "Stockfish (" + levelName + ")");
    else
      wifiManager->setPlayerNames("Stockfish (" + levelName + ")", "User");
  } else {
    Serial.println("Failed to connect to WiFi. Bot mode unavailable.");
    boardDriver->flashBoardAnimation(LedColors::Red);
    gameOver = true;
    return;
  }
}

void ChessBot::update() {
  if (gameOver)
    return;

  boardDriver->readSensors();

  // Check for physical resign/draw gesture (both kings lifted)
  if (checkPhysicalResignOrDraw()) return;

  if ((botConfig.playerIsWhite && currentTurn == 'w') || (!botConfig.playerIsWhite && currentTurn == 'b')) {
    // Player's turn
    int fromRow, fromCol, toRow, toCol;
    char piece;
    if (tryPlayerMove(currentTurn, fromRow, fromCol, toRow, toCol)) {
      applyMove(fromRow, fromCol, toRow, toCol);
      updateGameStatus();
      wifiManager->updateBoardState(ChessUtils::boardToFEN(board, currentTurn, chessEngine), currentEvaluation);
    }
  } else {
    // Bot's turn
    makeBotMove();
    updateGameStatus();
    wifiManager->updateBoardState(ChessUtils::boardToFEN(board, currentTurn, chessEngine), currentEvaluation);
  }

  waitForBoardConsistency();
  boardDriver->updateSensorPrev();
}

String ChessBot::makeStockfishRequest(const String& fen) {
  WiFiSSLClient client;
  // Set insecure mode for SSL (or add proper certificate validation)
  client.setInsecure();
  String path = StockfishAPI::buildRequestURL(fen, botConfig.stockfishSettings.depth);
  Serial.println("Stockfish request: " STOCKFISH_API_URL + path);
  // Retry logic
  for (int attempt = 1; attempt <= botConfig.stockfishSettings.maxRetries; attempt++) {
    if (attempt > 1)
      Serial.println("Attempt: " + String(attempt) + "/" + String(botConfig.stockfishSettings.maxRetries));
    if (client.connect(STOCKFISH_API_URL, STOCKFISH_API_PORT)) {
      client.println("GET " + path + " HTTP/1.1");
      client.println("Host: " STOCKFISH_API_URL);
      client.println("Connection: close");
      client.println();
      // Wait for response
      unsigned long startTime = millis();
      String response = "";
      bool gotResponse = false;
      while (client.connected() && (millis() - startTime < botConfig.stockfishSettings.timeoutMs)) {
        if (client.available()) {
          response = client.readString();
          gotResponse = true;
          break;
        }
        delay(10);
      }
      client.stop();

      if (gotResponse && response.length() > 0)
        return response;
    }

    Serial.println("API request timeout or empty response");
    if (attempt < botConfig.stockfishSettings.maxRetries) {
      Serial.println("Retrying...");
      delay(500);
    }
  }

  Serial.println("All API request attempts failed");
  return "";
}

bool ChessBot::parseStockfishResponse(const String& response, String& bestMove, float& evaluation) {
  StockfishResponse stockfishResp;
  if (!StockfishAPI::parseResponse(response, stockfishResp)) {
    Serial.printf("Failed to parse Stockfish response: %s\n", stockfishResp.errorMessage.c_str());
    return false;
  }
  bestMove = stockfishResp.bestMove;
  if (stockfishResp.hasMate) {
    Serial.printf("Mate in %d moves\n", stockfishResp.mateInMoves);
    // Convert mate to a large evaluation (positive or negative based on direction)
    evaluation = stockfishResp.mateInMoves > 0 ? 100.0f : -100.0f;
  } else {
    // Regular evaluation (already in pawns from API)
    evaluation = stockfishResp.evaluation;
  }
  return true;
}

void ChessBot::makeBotMove() {
  Serial.println("=== BOT MOVE CALCULATION ===");
  if (botConfig.engineSource == BotEngineSource::LocalEngine)
    Serial.println("Local engine requested but not integrated yet. Using remote Stockfish API fallback.");
  boardDriver->configureThinkingAnimation(ChessUtils::colorLed(currentTurn), currentTurn == 'b');
  std::atomic<bool>* stopAnimation = boardDriver->startThinkingAnimation();
  String bestMove;
  String response = makeStockfishRequest(ChessUtils::boardToFEN(board, currentTurn, chessEngine));
  if (stopAnimation) stopAnimation->store(true);
  if (parseStockfishResponse(response, bestMove, currentEvaluation)) {
    Serial.println("=== STOCKFISH EVALUATION ===");
    Serial.printf("%s advantage: %.2f pawns\n", currentEvaluation > 0 ? "White" : "Black", currentEvaluation);

    int fromRow, fromCol, toRow, toCol;
    char promotion;
    if (ChessUtils::parseUCIMove(bestMove, fromRow, fromCol, toRow, toCol, promotion)) {
      Serial.printf("Stockfish UCI move: %s = (%d,%d) -> (%d,%d)%s%c\n", bestMove.c_str(), fromRow, fromCol, toRow, toCol, promotion == ' ' ? "" : " Promotion to: ", promotion);
      Serial.println("============================");
      // Verify the move is from the correct color piece
      char piece = board[fromRow][fromCol];
      bool botPlaysWhite = !botConfig.playerIsWhite;
      bool isBotPiece = (botPlaysWhite && piece >= 'A' && piece <= 'Z') || (!botPlaysWhite && piece >= 'a' && piece <= 'z');
      if (!isBotPiece) {
        Serial.printf("ERROR: Bot tried to move a %s piece, but bot plays %s. Piece at source: %c\n", (piece >= 'A' && piece <= 'Z') ? "WHITE" : "BLACK", botPlaysWhite ? "WHITE" : "BLACK", piece);
        return;
      }
      if (piece == ' ') {
        Serial.println("ERROR: Bot tried to move from an empty square!");
        return;
      }
      applyMove(fromRow, fromCol, toRow, toCol, (bestMove.length() >= 5) ? bestMove[4] : ' ', true);
    } else {
      Serial.println("Failed to parse Stockfish UCI move: " + bestMove);
    }
  }
}

void ChessBot::waitForRemoteMoveCompletion(int fromRow, int fromCol, int toRow, int toCol, bool isCapture, bool isEnPassant, int enPassantCapturedPawnRow) {
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
      boardDriver->clearAllLEDs();
      boardDriver->releaseLEDs();
      resignGame(resignColor);
      return;
    }
    if (wifiManager->getPendingDraw()) {
      wifiManager->clearPendingDraw();
      boardDriver->clearAllLEDs();
      boardDriver->releaseLEDs();
      drawGame();
      return;
    }

    // For capture moves, ensure captured piece is removed first
    // For en passant, check the actual captured pawn square (not the destination)
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
    // For captures: wait until captured piece is removed AND piece is placed
    // For normal moves: just wait for piece to be placed
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