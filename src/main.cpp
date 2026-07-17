#include "board_driver.h"
#include "ble_chessup.h"
#include "chess_bot.h"
#include "chess_connect.h"
#include "chess_engine.h"
#include "chess_moves.h"
#include "chess_utils.h"
#include "led_colors.h"
#include "move_history.h"
#include "ota_updater.h"
#include "sensor_test.h"
#include "version.h"
#include "wifi_manager_esp32.h"
#include <LittleFS.h>
#include <time.h>

// ---------------------------
// Game State and Configuration
// ---------------------------

enum GameMode {
  MODE_SELECTION = 0,
  MODE_CHESS_MOVES = 1,
  MODE_BOT = 2,
  MODE_ONLINE_PLAY = 3,
  MODE_SENSOR_TEST = 4
};

BotConfig botConfig = {StockfishSettings::medium(), true};

BoardDriver boardDriver;
ChessEngine chessEngine;
MoveHistory moveHistory;
WiFiManagerESP32 wifiManager(&boardDriver, &moveHistory);
ChessMoves* chessMoves = nullptr;
ChessBot* chessBot = nullptr;
BleChessUp* bleChessUp = nullptr;
ChessConnect* chessConnect = nullptr;
SensorTest* sensorTest = nullptr;

GameMode currentMode = MODE_SELECTION;
bool modeInitialized = false;
bool resumingGame = false;
bool resetGameSelection = true;

void showGameSelection();
void handleGameSelection();
void handleBotConfigSelection();
void initializeSelectedMode(GameMode mode);
void cleanupCurrentGame();

void setup() {
  Serial.begin(115200);
  delay(3000);
  Serial.println();
  Serial.println("================================================");
  Serial.println("         SeleniumChess Starting Up");
  Serial.println("         Firmware version: " FIRMWARE_VERSION);
  Serial.println("================================================");
  if (!ChessUtils::ensureNvsInitialized())
    Serial.println("WARNING: NVS init failed (Preferences may not work)");
  if (!LittleFS.begin(true))
    Serial.println("ERROR: LittleFS mount failed!");
  else
    Serial.println("LittleFS mounted successfully");
  moveHistory.begin();
  boardDriver.beginHardware();
  boardDriver.powerAnimation(true);
  wifiManager.begin();
  Serial.println();
  // Kick off NTP time sync (non-blocking, will resolve in background)
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");

  // Check for a live game that can be resumed
  uint8_t resumeMode = 0, resumePlayerColor = 0, resumeBotDepth = 0;
  if (moveHistory.hasLiveGame() && moveHistory.getLiveGameInfo(resumeMode, resumePlayerColor, resumeBotDepth)) {
    Serial.println("========== Live game found on flash ==========");
    switch (resumeMode) {
      case GAME_MODE_CHESS_MOVES:
        Serial.println("Resuming Chess Moves game...");
        currentMode = MODE_CHESS_MOVES;
        resumingGame = true;
        break;
      case GAME_MODE_BOT:
        Serial.printf("Resuming Bot game (player=%c, depth=%d)...\n", (char)resumePlayerColor, resumeBotDepth);
        currentMode = MODE_BOT;
        resumingGame = true;
        botConfig.playerIsWhite = (resumePlayerColor == 'w');
        botConfig.stockfishSettings = StockfishSettings(resumeBotDepth);
        break;
      default:
        Serial.println("Unknown live game mode, discarding");
        moveHistory.discardLiveGame();
        break;
    }
    Serial.println("================================================");
    if (currentMode != MODE_SELECTION)
      return; // Skip showing game selection
  }

  showGameSelection();
}

void loop() {
  // Check for pending board edits from WiFi (FEN-based)
  String editFen;
  if (wifiManager.getPendingBoardEdit(editFen)) {
    Serial.println("Applying board edit from WiFi interface...");

    if (currentMode == MODE_CHESS_MOVES && modeInitialized && chessMoves != nullptr) {
      chessMoves->setBoardStateFromFEN(editFen);
      Serial.println("Board edit applied to Chess Moves mode");
    } else if (currentMode == MODE_BOT && modeInitialized && chessBot != nullptr) {
      chessBot->setBoardStateFromFEN(editFen);
      Serial.println("Board edit applied to Chess Bot mode");
    } else if (currentMode == MODE_ONLINE_PLAY && modeInitialized && chessConnect != nullptr) {
      chessConnect->setBoardStateFromFEN(editFen);
      Serial.println("Board edit applied to Online Play mode");
    } else {
      Serial.println("Warning: Board edit received but no active game mode");
    }

    wifiManager.clearPendingEdit();
  }

  // Check for pending resign from WiFi
  char resignColor;
  if (wifiManager.getPendingResign(resignColor)) {
    wifiManager.addLog(String("Resign from web UI: ") + (resignColor == 'w' ? "White" : "Black") + " resigns");
    if (currentMode == MODE_CHESS_MOVES && modeInitialized && chessMoves != nullptr) {
      chessMoves->resignGame(resignColor);
    } else if (currentMode == MODE_BOT && modeInitialized && chessBot != nullptr) {
      chessBot->resignGame(resignColor);
    } else if (currentMode == MODE_ONLINE_PLAY && modeInitialized && chessConnect != nullptr) {
      chessConnect->resignGame(resignColor);
    } else {
      Serial.println("Warning: Resign received but no active game mode");
    }
    wifiManager.clearPendingResign();
  }

  // Check for pending draw from WiFi
  if (wifiManager.getPendingDraw()) {
    wifiManager.addLog("Draw agreed from web UI");
    if (currentMode == MODE_CHESS_MOVES && modeInitialized && chessMoves != nullptr) {
      chessMoves->drawGame();
    } else if (currentMode == MODE_BOT && modeInitialized && chessBot != nullptr) {
      chessBot->drawGame();
    } else if (currentMode == MODE_ONLINE_PLAY && modeInitialized && chessConnect != nullptr) {
      chessConnect->drawGame();
    } else {
      Serial.println("Warning: Draw received but no active game mode");
    }
    wifiManager.clearPendingDraw();
  }

  // Check for pending home request from web UI
  if (wifiManager.getPendingHome()) {
    wifiManager.addLog("Returning to game selection (web request)");
    cleanupCurrentGame();
    showGameSelection();
    wifiManager.clearPendingHome();
    return;
  }

  // Check for WiFi game selection
  int selectedMode = wifiManager.getSelectedGameMode();
  if (selectedMode > 0) {
    wifiManager.addLog("Game mode selected via web: " + String(selectedMode));
    cleanupCurrentGame();
    switch (selectedMode) {
      case 1:
        currentMode = MODE_CHESS_MOVES;
        break;
      case 2:
        currentMode = MODE_BOT;
        botConfig = wifiManager.getBotConfig();
        break;
      case 3:
        currentMode = MODE_ONLINE_PLAY;
        break;
      case 4:
        currentMode = MODE_SENSOR_TEST;
        break;
      default:
        Serial.println("Invalid game mode selected via WiFi");
        selectedMode = 0;
        break;
    }
    if (selectedMode > 0) {
      modeInitialized = false;
      wifiManager.resetGameSelection();
      boardDriver.clearAllLEDs();
    }
  }

  if (currentMode == MODE_SELECTION) {
    wifiManager.setActiveGameMode(0);
    wifiManager.setGameOver(false);
    handleGameSelection();
    return;
  }
  // Game mode selected
  if (!modeInitialized) {
    initializeSelectedMode(currentMode);
    modeInitialized = true;
    wifiManager.setActiveGameMode(currentMode);
    wifiManager.setGameOver(false);
    delay(1); // HACK: Ensure any starting animations acquire the LED mutex before proceeding
  }

  switch (currentMode) {
    case MODE_CHESS_MOVES:
      if (chessMoves != nullptr) {
        if (chessMoves->isGameOver()) {
          wifiManager.addLog("Game over (Chess Moves)");
          wifiManager.setGameOver(true);
          showGameSelection();
        } else
          chessMoves->update();
      }
      break;
    case MODE_BOT:
      if (chessBot != nullptr) {
        if (chessBot->isGameOver()) {
          wifiManager.addLog("Game over (Chess Bot)");
          wifiManager.setGameOver(true);
          showGameSelection();
        } else
          chessBot->update();
      }
      break;
    case MODE_ONLINE_PLAY:
      if (chessConnect != nullptr) {
        if (chessConnect->isGameOver()) {
          wifiManager.addLog("Game over (Online Play)");
          wifiManager.setGameOver(true);
          cleanupCurrentGame();
          showGameSelection();
        } else
          chessConnect->update();
      }
      break;
    case MODE_SENSOR_TEST:
      if (sensorTest != nullptr) {
        if (sensorTest->isComplete())
          showGameSelection();
        else
          sensorTest->update();
      }
      break;
    default:
      showGameSelection();
      break;
  }

  delay(SENSOR_READ_DELAY_MS);
}

void showGameSelection() {
  currentMode = MODE_SELECTION;
  modeInitialized = false;
  resetGameSelection = true;
  boardDriver.acquireLEDs();
  boardDriver.clearAllLEDs(false);
  // Light up the 4 selector positions in the middle of the board
  // Position 1: Human vs Human
  boardDriver.setSquareLED(3, 3, LedColors::ModeHuman);
  // Position 2: Stockfish
  boardDriver.setSquareLED(3, 4, LedColors::ModeStockfish);
  // Position 3: Online Play
  boardDriver.setSquareLED(4, 3, LedColors::ModeOnline);
  // Position 4: Sensor Test
  boardDriver.setSquareLED(4, 4, LedColors::ModeSensor);
  boardDriver.showLEDs();
  boardDriver.releaseLEDs();
  Serial.println("=============== Game Selection Mode ===============");
  Serial.println("Four LEDs are lit in the center of the board:");
  Serial.println("  Cyan:    Chess Moves (Human vs Human)");
  Serial.println("  Gold:    Chess Bot (Human vs AI)");
  Serial.println("  Red:     Online Play (via ChessConnect)");
  Serial.println("  Green:   Sensor Test");
  Serial.println("Place any chess piece on a LED to select that mode");
  Serial.println("===================================================");
}

void handleGameSelection() {
  boardDriver.readSensors();
  bool currState[4] = {boardDriver.getSensorState(3, 3), boardDriver.getSensorState(3, 4), boardDriver.getSensorState(4, 3), boardDriver.getSensorState(4, 4)};

  struct SelectorState {
    int emptyCount;
    int occupiedCount;
    bool readyForSelection;
  };
  const int DEBOUNCE_CYCLES = (DEBOUNCE_MS / SENSOR_READ_DELAY_MS) + 2;
  static SelectorState selectorStates[4] = {};

  if (resetGameSelection) {
    for (int i = 0; i < 4; ++i) {
      selectorStates[i].emptyCount = 0;
      selectorStates[i].occupiedCount = 0;
      selectorStates[i].readyForSelection = false;
    }
    resetGameSelection = false;
  }
  for (int i = 0; i < 4; ++i) {
    if (!currState[i]) {
      if (selectorStates[i].emptyCount < DEBOUNCE_CYCLES)
        selectorStates[i].emptyCount++;
      selectorStates[i].occupiedCount = 0;
      if (selectorStates[i].emptyCount >= DEBOUNCE_CYCLES)
        selectorStates[i].readyForSelection = true;
    } else {
      selectorStates[i].emptyCount = 0;
      if (selectorStates[i].readyForSelection) {
        if (selectorStates[i].occupiedCount < DEBOUNCE_CYCLES)
          selectorStates[i].occupiedCount++;
      } else {
        selectorStates[i].occupiedCount = 0;
      }
    }
  }

  // Check for valid rising edge (empty for DEBOUNCE_CYCLES, then occupied for DEBOUNCE_CYCLES)
  for (int i = 0; i < 4; ++i) {
    if (selectorStates[i].readyForSelection && selectorStates[i].occupiedCount >= DEBOUNCE_CYCLES) {
      switch (i) {
        case 0:
          Serial.println("Mode: 'Chess Moves' selected!");
          currentMode = MODE_CHESS_MOVES;
          modeInitialized = false;
          boardDriver.clearAllLEDs();
          break;
        case 1:
          Serial.println("Mode: 'Chess Bot' Selected! Showing bot configuration...");
          currentMode = MODE_BOT;
          modeInitialized = false;
          boardDriver.clearAllLEDs();
          handleBotConfigSelection();
          break;
        case 2:
          Serial.println("Mode: 'Online Play' Selected!");
          currentMode = MODE_ONLINE_PLAY;
          modeInitialized = false;
          boardDriver.clearAllLEDs();
          break;
        case 3:
          Serial.println("Mode: 'Sensor Test' Selected!");
          currentMode = MODE_SENSOR_TEST;
          modeInitialized = false;
          boardDriver.clearAllLEDs();
          break;
      }
      break;
    }
  }

  delay(SENSOR_READ_DELAY_MS);
}

void initializeSelectedMode(GameMode mode) {
  if (resumingGame)
    resumingGame = false;
  else
    moveHistory.discardLiveGame(); // Discard any incomplete live game that wasn't properly finished or resumed (finishGame already removes live files for completed games)
  switch (mode) {
    case MODE_CHESS_MOVES:
      wifiManager.addLog("Starting Chess Moves");
      if (chessMoves != nullptr)
        delete chessMoves;
      chessMoves = new ChessMoves(&boardDriver, &chessEngine, &wifiManager, &moveHistory);
      chessMoves->begin();
      break;
    case MODE_BOT:
      wifiManager.addLog("Starting Chess Bot (depth " + String(botConfig.stockfishSettings.depth) + ", " + (botConfig.playerIsWhite ? "White" : "Black") + ")");
      if (chessBot != nullptr)
        delete chessBot;
      chessBot = new ChessBot(&boardDriver, &chessEngine, &wifiManager, &moveHistory, botConfig);
      chessBot->begin();
      break;
    case MODE_ONLINE_PLAY:
      wifiManager.addLog("Starting Online Play");
      if (chessConnect != nullptr)
        delete chessConnect;
      if (bleChessUp != nullptr)
        delete bleChessUp;
      bleChessUp = new BleChessUp();
      chessConnect = new ChessConnect(&boardDriver, &chessEngine, &wifiManager, bleChessUp, &moveHistory);
      chessConnect->begin();
      break;
    case MODE_SENSOR_TEST:
      wifiManager.addLog("Starting Sensor Test");
      if (sensorTest != nullptr)
        delete sensorTest;
      sensorTest = new SensorTest(&boardDriver);
      sensorTest->begin();
      break;
    default:
      showGameSelection();
      break;
  }
}

void cleanupCurrentGame() {
  // Save any in-progress game to history before cleanup
  if (moveHistory.isRecording()) {
    wifiManager.addLog("Saving in-progress game to history");
    moveHistory.finishGame(RESULT_IN_PROGRESS, 'd');
  }

  // Clean up all game mode objects safely
  if (bleChessUp) {
    bleChessUp->stop();
    delete bleChessUp;
    bleChessUp = nullptr;
  }
  if (chessConnect) {
    delete chessConnect;
    chessConnect = nullptr;
  }
  if (chessBot) {
    delete chessBot;
    chessBot = nullptr;
  }
  if (chessMoves) {
    delete chessMoves;
    chessMoves = nullptr;
  }
  if (sensorTest) {
    delete sensorTest;
    sensorTest = nullptr;
  }
  wifiManager.setBleConnected(false);
}

void handleBotConfigSelection() {
  Serial.println("====== Bot Configuration Selection ======");
  Serial.println("Select Bot Color:");
  Serial.println("- Rank 6: Bot is Black");
  Serial.println("- Rank 3: Bot is White");
  Serial.println("Select Difficulty:");
  Serial.println("- File B: Easy");
  Serial.println("- File D: Medium");
  Serial.println("- File F: Hard");
  Serial.println("- File H: Expert");
  Serial.println("Example: Place piece at Rank 3, File D = White Bot Medium");

  boardDriver.acquireLEDs();
  // Easy (col 1) - Green
  boardDriver.setSquareLED(2, 1, LedColors::Green);
  boardDriver.setSquareLED(5, 1, LedColors::Green);

  // Medium (col 3) - Orange/Gold
  boardDriver.setSquareLED(2, 3, LedColors::Yellow);
  boardDriver.setSquareLED(5, 3, LedColors::Yellow);

  // Hard (col 5) - Red
  boardDriver.setSquareLED(2, 5, LedColors::Red);
  boardDriver.setSquareLED(5, 5, LedColors::Red);

  // Expert (col 7) - Purple
  boardDriver.setSquareLED(2, 7, LedColors::Purple);
  boardDriver.setSquareLED(5, 7, LedColors::Purple);

  boardDriver.showLEDs();
  boardDriver.releaseLEDs();

  // Wait for selection
  Serial.println("Waiting for bot configuration selection...");

  static bool prevState[2][8] = {};
  bool firstLoop = true;

  while (true) {
    boardDriver.readSensors();

    // Check for home request from web UI (cancel bot config selection)
    if (wifiManager.getPendingHome()) {
      boardDriver.clearAllLEDs();
      currentMode = MODE_SELECTION;
      modeInitialized = true;
      showGameSelection();
      wifiManager.clearPendingHome();
      return;
    }

    for (int rowIdx = 0; rowIdx < 2; ++rowIdx) {
      int row = (rowIdx == 0) ? 2 : 5;
      for (int col : {1, 3, 5, 7}) {
        bool curr = boardDriver.getSensorState(row, col);
        // Only accept selection if square was previously empty and is now occupied
        if (!firstLoop && !prevState[rowIdx][col] && curr) {
          botConfig.playerIsWhite = (row == 2);
          const char* colorName = botConfig.playerIsWhite ? "White" : "Black";
          if (col == 1) {
            botConfig.stockfishSettings = StockfishSettings::easy();
            Serial.printf("Configuration: Play as %s, Easy difficulty\n", colorName);
          } else if (col == 3) {
            botConfig.stockfishSettings = StockfishSettings::medium();
            Serial.printf("Configuration: Play as %s, Medium difficulty\n", colorName);
          } else if (col == 5) {
            botConfig.stockfishSettings = StockfishSettings::hard();
            Serial.printf("Configuration: Play as %s, Hard difficulty\n", colorName);
          } else if (col == 7) {
            botConfig.stockfishSettings = StockfishSettings::expert();
            Serial.printf("Configuration: Play as %s, Expert difficulty\n", colorName);
          }
          firstLoop = true;
          boardDriver.clearAllLEDs();
          return;
        }
        prevState[rowIdx][col] = curr;
      }
    }

    firstLoop = false;
    delay(SENSOR_READ_DELAY_MS);
  }
}