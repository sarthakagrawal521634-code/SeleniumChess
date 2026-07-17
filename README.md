# SeleniumChess - Smart Chess Board [![Build & Release](https://github.com/joojoooo/SeleniumChess/actions/workflows/release.yml/badge.svg)](https://github.com/joojoooo/SeleniumChess/actions/workflows/release.yml)

An ESP32-powered smart chessboard that detects piece movements via hall-effect sensors, shows legal moves with LEDs, plays against you using Stockfish, and lets you play online games on Chess.com or Lichess through the [ChessConnect](https://chess-connect.com/) app — all on your physical board.

<p align="center"><img src="docs/BuildGuide/OpenChess - Plastic PCB (Bot config).webp" width="50%"></p>

## ☕ Support the project
Love this project? You can [support it on Ko-fi](https://ko-fi.com/joojooo) — every contribution makes a difference!

[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/joojooo)

## 🛠️ Build Guide
- **👣 [Step-by-step build guide](https://joojoooo.github.io/SeleniumChess)** — covers materials, schematics, assembly, and [software setup](https://joojoooo.github.io/SeleniumChess/index.html#software)
- **⚡ [Web Flasher](https://joojoooo.github.io/SeleniumChess/flash.html)** — flash your ESP32 directly from the browser (Chrome/Edge)

## 🚀 Quick Start

### 1. Flash the firmware
Use the [Web Flasher](https://joojoooo.github.io/SeleniumChess/flash.html) or build from source with PlatformIO (see [Build from Source](#-build-from-source) below).

### 2. Connect to the Web UI
1. Connect to the **SeleniumChess** WiFi network (password: **chess123**)
2. Open **http://seleniumchess.local** in your browser
3. (Optional) Enter your home WiFi credentials in the Settings page so the board connects to your network

### 3. Configure GPIO pins
Go to the **GPIO** section in the Web UI and set the correct pins and transistor type (PNP/NPN) **before** connecting wires to GPIOs. Incorrect configuration with wires connected can cause short circuits.

### 4. Calibrate
On first boot (or after changing pins), the board enters calibration mode. Follow the Serial Monitor instructions (115200 baud) to calibrate sensors and LEDs. This only needs to be done once.

### 5. Play!
After setup, four LEDs light up in the center of the board. Place a piece on a lit square to select a game mode:

| LED Color | Mode | Description |
|-----------|------|-------------|
| 🔵 **Blue** | Chess Moves | Human vs Human — shows legal moves on the board |
| 🟢 **Green** | Chess Bot | Human vs Stockfish AI |
| 🟡 **Yellow** | Online Play | Play on Chess.com or Lichess via ChessConnect (BLE) |
| 🔴 **Red** | Sensor Test | Test hall-effect sensor grid |

## 🎮 How to Play

### Moving pieces
1. **Lift a piece** — the origin square lights up in **cyan** and valid destination squares light up in **white** (empty) or **red** (capture)
2. **Place the piece** on a lit destination square — the move is confirmed with a **green** flash
3. If the king is in check, the king square blinks **yellow**

### Castling
Move the king **2 squares** towards the rook. The board will light up where to move the rook.

### En passant
Lift the pawn — the destination square lights up in **red** and the captured pawn's square lights up in **purple**.

### Pawn promotion
When a pawn reaches the last rank, pick the promotion piece from the Web UI (buttons appear automatically) or the ChessConnect app. If neither is open, a Queen is chosen after 2 minutes.

### Draw & Resign
Use the **Draw** / **Resign** buttons in the Web UI, or lift both kings off the board and hold them for 2 seconds to end the game in a draw.

### Game Over
The board detects checkmate, stalemate, 50-move rule, threefold repetition, and insufficient material. A firework animation plays with the winner's color.

## 🤖 Chess Bot Mode
After selecting Bot mode (green LED), configure the game:
- **Your color**: Place a piece on **rank 6** (bot plays Black) or **rank 3** (bot plays White)
- **Difficulty**: Choose a column — **Easy** (depth 5), **Medium** (depth 8), **Hard** (depth 11), or **Expert** (depth 15)

The bot is powered by the [Stockfish Online API](https://stockfish.online). A blue "thinking" animation plays while waiting for the bot's move, then the board lights up showing where to move the bot's piece.

## 🌐 Online Play (ChessConnect)
Play games from **Chess.com** or **Lichess** on your physical board using the [ChessConnect](https://chess-connect.com/) app.

### How it works
1. Select **Online Play** (yellow LED) on the board
2. The board advertises as a **ChessUp** BLE device
3. Open the ChessConnect app on your phone and connect to the board
4. Start a game on Chess.com or Lichess through the app
5. The board syncs with the game — make your moves physically, and your opponent's moves are shown with LEDs

### During a game
- **Your turn**: Move pieces on the physical board. The move is sent to the online game automatically.
- **Opponent's turn**: A blue "thinking" animation plays. When they move, the board lights up showing the move to execute.
- **Disconnect**: If the BLE connection drops, the board waits 30 seconds for reconnection before ending the game.

## 🖥️ Web UI
Access the board's Web UI at **http://seleniumchess.local** (or the board's IP address). Two pages are available:

- **Control Center** (`index.html`) — Single-page app with Home, Network, Board, and Settings tabs. The Board tab includes a live board with evaluation bar, move history, board editing, move sounds, and customizable piece themes
- **Game Selection** (`game.html`) — Start a game mode from the browser with bot config options

## 💾 Game History
Local games (Chess Moves and Chess Bot) are automatically saved. If power is lost mid-game, the game resumes on reboot. Completed games can be reviewed in the Web UI under the Games section. Up to 50 games are stored.

## ✨ Features

### Gameplay
- **Legal move visualization** with color-coded LEDs (toggleable in settings)
- **Full chess rules**: castling, en passant, promotion, check/checkmate/stalemate
- **50-move rule & threefold repetition** enforcement (Zobrist hashing)
- **Game save/resume** with automatic recovery after power loss
- **Online play** via ChessConnect BLE (Chess.com, Lichess)

### Hardware & Software
- **Auto-calibration** — automatically maps GPIOs, shift-register outputs, and LED indices. No need to care about wiring order.
- **Sensor debounce** — slide pieces without accidental detection. Configurable PNP/NPN transistor support.
- **Async architecture** — non-blocking web server and LED animations (FreeRTOS tasks)
- **WiFi** — up to 3 saved networks, cached BSSID/channel for fast reconnect, AP fallback with captive portal
- **OTA updates** — auto-update from GitHub releases at boot, or manually upload firmware/web assets from the Web UI
- **Adjustable brightness** — dark square dimming (default 70%) makes them appear equally bright as light squares
- **CI/CD** — GitHub Actions builds firmware, LittleFS image, and web assets on tagged releases for the [Web Flasher](https://joojoooo.github.io/SeleniumChess/flash.html) and OTA

## 🔧 Build from Source

### Prerequisites
- [VS Code](https://code.visualstudio.com/) + [PlatformIO IDE](https://platformio.org/install/ide?install=vscode) extension
- (Optional) [Node.js](https://nodejs.org/) + `npm install -g html-minifier-terser clean-css-cli terser` for web asset minification

### Build & Flash
1. Open the `.code-workspace` file in VS Code
2. Connect the ESP32 via USB
3. Hold the **BOOT** button on the ESP32
4. Click **Upload** (<kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>U</kbd>)

The build pipeline automatically minifies web assets and packages them into LittleFS. The `data/` directory is committed to git so the project builds even without Node.js.

### LED Color Reference

| Color | Meaning |
|-------|---------|
| **Cyan** | Piece origin square |
| **White** | Valid move (empty square) |
| **Red** | Capture / error |
| **Purple** | En passant capture |
| **Green** | Move confirmation |
| **Yellow** | King in check / promotion |
| **Blue** | Bot thinking / online opponent thinking |

## 🤝 Contributing
Contributions are welcome! Please read the [Contributing Guidelines](/CONTRIBUTING.md) before submitting a PR.

## 📄 License
This project is based on [Open-Chess](https://github.com/Concept-Bytes/Open-Chess) by [Concept-Bytes](https://github.com/Concept-Bytes), which is licensed under the [MIT License](/LICENSE-MIT).

Original contributions made by [joojoooo](https://github.com/joojoooo) and all modifications in this repository are licensed under the [PolyForm Noncommercial License 1.0.0](/LICENSE.md).

By submitting a pull request to this repository, you agree that your contribution will be licensed under the PolyForm Noncommercial License 1.0.0.