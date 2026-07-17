#ifndef CHESS_CONNECT_H
#define CHESS_CONNECT_H

#include "ble_chessup.h"
#include "chess_game.h"

class ChessConnect : public ChessGame {
 private:
  BleChessUp* bleChessUp;
  char myColor;            // 'w' or 'b'
  bool gameActive;
  bool waitingForRemoteMove;

  // Disconnect handling
  unsigned long disconnectTime;
  static const unsigned long DISCONNECT_TIMEOUT_MS = 30000;

  void resetWaitingState();

 protected:
  void waitForRemoteMoveCompletion(int fromRow, int fromCol, int toRow, int toCol, bool isCapture, bool isEnPassant = false, int enPassantCapturedPawnRow = -1) override;

 public:
  ChessConnect(BoardDriver* bd, ChessEngine* ce, WiFiManagerESP32* wm, BleChessUp* ble, MoveHistory* mh = nullptr);
  void begin() override;
  void update() override;
  void resignGame(char resigningColor);
  void drawGame();
};

#endif // CHESS_CONNECT_H
