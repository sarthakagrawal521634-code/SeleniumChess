#include "chess_moves.h"
#include "chess_utils.h"
#include "led_colors.h"
#include "move_history.h"
#include "wifi_manager_esp32.h"
#include <Arduino.h>

ChessMoves::ChessMoves(BoardDriver* bd, ChessEngine* ce, WiFiManagerESP32* wm, MoveHistory* mh)
    : ChessGame(bd, ce, wm, mh), clockWhiteMs(0), clockBlackMs(0), incrementMs(0), clockEnabled(false), lastClockTick(0) {}

void ChessMoves::begin() {
  Serial.println("=== Starting Chess Moves Mode ===");
  initializeBoard();

  // Initialize time control from web config
  int timeMins = wifiManager->getHvhTimeMinutes();
  int timeInc = wifiManager->getHvhTimeIncrement();
  if (timeMins > 0) {
    clockEnabled = true;
    clockWhiteMs = (long)timeMins * 60L * 1000L;
    clockBlackMs = clockWhiteMs;
    incrementMs = timeInc * 1000;
    wifiManager->clockWhiteMs = clockWhiteMs;
    wifiManager->clockBlackMs = clockBlackMs;
    wifiManager->clockRunning = true;
    Serial.printf("Time control: %d+%d\n", timeMins, timeInc);
  }
  if (moveHistory->hasLiveGame()) {
    Serial.println("Resuming live game...");
    replaying = true;
    moveHistory->replayIntoGame(this);
    replaying = false;
    wifiManager->updateBoardState(ChessUtils::boardToFEN(board, currentTurn, chessEngine), ChessUtils::evaluatePosition(board));
  } else {
    moveHistory->startGame(GAME_MODE_CHESS_MOVES, (uint8_t)timeMins, (uint8_t)timeInc);
    moveHistory->addFen(ChessUtils::boardToFEN(board, currentTurn, chessEngine));
  }
  waitForBoardSetup(board);
  if (clockEnabled)
    lastClockTick = millis();
  wifiManager->setPlayerNames("White", "Black");
}

void ChessMoves::update() {
  boardDriver->readSensors();

  // Tick the clock
  if (clockEnabled && !gameOver) {
    unsigned long now = millis();
    if (lastClockTick > 0) {
      long elapsed = (long)(now - lastClockTick);
      if (currentTurn == 'w')
        clockWhiteMs -= elapsed;
      else
        clockBlackMs -= elapsed;
      wifiManager->clockWhiteMs = clockWhiteMs;
      wifiManager->clockBlackMs = clockBlackMs;

      // Time forfeit
      if (clockWhiteMs <= 0 || clockBlackMs <= 0) {
        clockWhiteMs = max(0L, clockWhiteMs);
        clockBlackMs = max(0L, clockBlackMs);
        wifiManager->clockWhiteMs = clockWhiteMs;
        wifiManager->clockBlackMs = clockBlackMs;
        wifiManager->clockRunning = false;
        char loser = (clockWhiteMs <= 0) ? 'w' : 'b';
        Serial.printf("%s ran out of time!\n", loser == 'w' ? "White" : "Black");
        boardDriver->flashBoardAnimation(LedColors::Red);
        timeoutGame(loser);
        return;
      }
    }
    lastClockTick = now;
  }

  // Check for physical resign/draw gesture (both kings lifted)
  if (checkPhysicalResignOrDraw()) return;

  int fromRow, fromCol, toRow, toCol;
  char prevTurn = currentTurn;
  if (tryPlayerMove(currentTurn, fromRow, fromCol, toRow, toCol)) {
    applyMove(fromRow, fromCol, toRow, toCol);
    // Add increment to the player who just moved
    if (clockEnabled && currentTurn != prevTurn) {
      if (prevTurn == 'w')
        clockWhiteMs += incrementMs;
      else
        clockBlackMs += incrementMs;
      wifiManager->clockWhiteMs = clockWhiteMs;
      wifiManager->clockBlackMs = clockBlackMs;
    }
    updateGameStatus();
    wifiManager->updateBoardState(ChessUtils::boardToFEN(board, currentTurn, chessEngine), ChessUtils::evaluatePosition(board));
  }

  waitForBoardConsistency();
  boardDriver->updateSensorPrev();
}
