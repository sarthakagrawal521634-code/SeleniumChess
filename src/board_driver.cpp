#include "board_driver.h"
#include "chess_utils.h"
#include "led_colors.h"
#include <Arduino.h>
#include <Preferences.h>
#include <math.h>
#include <string.h>

static uint32_t packLedColor(LedRGB c) {
  return ((uint32_t)c.r << 16) | ((uint32_t)c.g << 8) | c.b;
}

static LedRGB unpackLedColor(uint32_t packed) {
  return {(uint8_t)((packed >> 16) & 0xFF), (uint8_t)((packed >> 8) & 0xFF), (uint8_t)(packed & 0xFF)};
}

// Static members for animation queue system
QueueHandle_t BoardDriver::animationQueue = nullptr;
TaskHandle_t BoardDriver::animationTaskHandle = nullptr;
SemaphoreHandle_t BoardDriver::ledMutex = nullptr;
BoardDriver* BoardDriver::instance = nullptr;

EventPriority BoardDriver::animationPriority(AnimationType type) {
  switch (type) {
    case AnimationType::CAPTURE:
    case AnimationType::PROMOTION:
    case AnimationType::FIREWORK:
    case AnimationType::CHECK_BEAM:
    case AnimationType::CHECKMATE:
      return EventPriority::SUPERIOR;
    case AnimationType::POWER:
      return EventPriority::SPECIAL;
    case AnimationType::BLINK:
    case AnimationType::WAITING:
    case AnimationType::THINKING:
    case AnimationType::FLASH:
    default:
      return EventPriority::NORMAL;
  }
}

void BoardDriver::enqueueAnimationJob(AnimationJob job) {
  const EventPriority incomingPriority = animationPriority(job.type);
  if (incomingPriority != EventPriority::NORMAL) {
    AnimationJob kept[8];
    int keptCount = 0;
    AnimationJob queued;
    while (xQueueReceive(animationQueue, &queued, 0) == pdTRUE) {
      const EventPriority queuedPriority = animationPriority(queued.type);
      const bool keepQueued = (incomingPriority == EventPriority::SUPERIOR && queuedPriority != EventPriority::NORMAL);
      if (keepQueued && keptCount < 8) {
        kept[keptCount++] = queued;
      } else if (queued.stopFlag) {
        delete queued.stopFlag;
      }
    }
    for (int i = 0; i < keptCount; i++)
      xQueueSend(animationQueue, &kept[i], portMAX_DELAY);
  }
  xQueueSend(animationQueue, &job, portMAX_DELAY);
}

// ---------------------------
// LED Strip Row/Col to Pixel index mapping
// Serpentine layout starting from h8 (col 7) going down to h1, then g1 up to g8, etc.
// ---------------------------
static constexpr int DefaultRowColToLEDindexMap[NUM_ROWS][NUM_COLS] = {
    {63, 48, 47, 32, 31, 16, 15, 0},
    {62, 49, 46, 33, 30, 17, 14, 1},
    {61, 50, 45, 34, 29, 18, 13, 2},
    {60, 51, 44, 35, 28, 19, 12, 3},
    {59, 52, 43, 36, 27, 20, 11, 4},
    {58, 53, 42, 37, 26, 21, 10, 5},
    {57, 54, 41, 38, 25, 22,  9, 6},
    {56, 55, 40, 39, 24, 23,  8, 7},
};

BoardDriver::BoardDriver() : strip(nullptr), lastEnabledCol(-2), brightness(BRIGHTNESS), dimMultiplier(70), thinkingColor(LedColors::PlayerWhite), thinkingTopHalf(true), hwConfig(HardwareConfig::defaults()) {
  for (int row = 0; row < NUM_ROWS; row++)
    for (int col = 0; col < NUM_COLS; col++) {
      ledIndexMap[row][col] = DefaultRowColToLEDindexMap[row][col];
      currentColors[row][col] = LedColors::Off;
      thinkingAlertMask[row][col] = false;
    }
}

void BoardDriver::beginHardware() {
  // Initialize animation queue system
  instance = this;
  ledMutex = xSemaphoreCreateMutex();
  animationQueue = xQueueCreate(8, sizeof(AnimationJob));
  xTaskCreatePinnedToCore(animationWorkerTask, "AnimWorker", 4096, nullptr, 1, &animationTaskHandle, 1);
  // Load hardware pin configuration from NVS (must happen before any GPIO or strip init)
  loadHardwareConfig();
  // https://github.com/Makuna/NeoPixelBus/wiki/ESP32-NeoMethods
  strip = new NeoPixelBusLg<NeoGrbFeature, NeoEsp32I2s1Ws2812xMethod, NeoGammaNullMethod>(LED_COUNT, hwConfig.ledPin);
  strip->Begin();
  showLEDs();        // turn off all LEDs
  loadLedSettings(); // Load LED settings from NVS (brightness, dim multiplier)
  strip->SetLuminance(brightness);
  // Shift register pins as outputs
  pinMode(hwConfig.srDataPin, OUTPUT);
  pinMode(hwConfig.srClkPin, OUTPUT);
  pinMode(hwConfig.srLatchPin, OUTPUT);
  disableAllCols();
  // Row pins as inputs
  for (int c = 0; c < NUM_ROWS; c++)
    pinMode(hwConfig.rowPins[c], INPUT);
  // Initialize sensors state without debouncing to prevent brief LED flashes at boot (live game recover board setup)
  // Axes are swapped: hardware row (GPIO) = board col (file), hardware col (shift reg) = board row (rank)
  bool initialRawState[NUM_ROWS][NUM_COLS];
  readRawSensors(initialRawState);
  unsigned long now = millis();
  for (int col = 0; col < NUM_COLS; col++) {
    for (int row = 0; row < NUM_ROWS; row++) {
      uint8_t logicalRow = col; // shift register col → board row (rank)
      uint8_t logicalCol = row; // GPIO row → board col (file)
      sensorState[logicalRow][logicalCol] = initialRawState[row][col];
      sensorPrev[logicalRow][logicalCol] = initialRawState[row][col];
      sensorRaw[logicalRow][logicalCol] = initialRawState[row][col];
      sensorDebounceTime[logicalRow][logicalCol] = now;
    }
  }
}

// Animation worker task - processes jobs from queue
void BoardDriver::animationWorkerTask(void* param) {
  AnimationJob job;
  while (true) {
    if (xQueueReceive(animationQueue, &job, portMAX_DELAY) == pdTRUE) {
      xSemaphoreTake(ledMutex, portMAX_DELAY);
      instance->executeAnimation(job);
      xSemaphoreGive(ledMutex);
    }
  }
}

void BoardDriver::executeAnimation(const AnimationJob& job) {
  switch (job.type) {
    case AnimationType::CAPTURE:
      doCapture(job.params.capture.row, job.params.capture.col);
      break;
    case AnimationType::PROMOTION:
      doPromotion(job.params.promotion.row, job.params.promotion.col);
      break;
    case AnimationType::BLINK:
      doBlink(job.params.blink.row, job.params.blink.col, job.params.blink.color, job.params.blink.times, job.params.blink.clearAfter);
      break;
    case AnimationType::WAITING:
      doWaiting(job.stopFlag);
      break;
    case AnimationType::THINKING:
      doThinking(job.stopFlag);
      break;
    case AnimationType::FIREWORK:
      doFirework(job.params.firework.color);
      break;
    case AnimationType::FLASH:
      doFlash(job.params.flash.color, job.params.flash.times);
      break;
    case AnimationType::POWER:
      doPower(job.params.flash.times != 0);
      break;
    case AnimationType::CHECK_BEAM:
      doCheckBeam(job.params.checkBeam.attackerRow, job.params.checkBeam.attackerCol, job.params.checkBeam.kingRow, job.params.checkBeam.kingCol);
      break;
    case AnimationType::CHECKMATE:
      doCheckmate(job.params.checkmate.winKingRow, job.params.checkmate.winKingCol, job.params.checkmate.loseKingRow, job.params.checkmate.loseKingCol);
      break;
  }
}

void BoardDriver::readRawSensors(bool rawState[NUM_ROWS][NUM_COLS]) {
  for (int row = 0; row < NUM_ROWS; row++)
    for (int col = 0; col < NUM_COLS; col++)
      rawState[row][col] = false;

  for (int col = 0; col < NUM_COLS; col++) {
    enableCol(col);
    for (int row = 0; row < NUM_ROWS; row++)
      rawState[row][col] = (digitalRead(hwConfig.rowPins[row]) == LOW);
  }
  disableAllCols();
}

void BoardDriver::loadShiftRegister(byte data, int bits) {
  if (hwConfig.srInvertOutputs)
    data = ~data;
  // Make sure latch is low before shifting data
  digitalWrite(hwConfig.srLatchPin, LOW);
  // Shift bits MSB first
  for (int i = bits - 1; i >= 0; i--) {
    digitalWrite(hwConfig.srDataPin, !!(data & (1 << i)));
    delayMicroseconds(10);
    digitalWrite(hwConfig.srClkPin, HIGH);
    delayMicroseconds(10);
    digitalWrite(hwConfig.srClkPin, LOW);
    delayMicroseconds(10);
  }
  // Latch the data to output pins
  digitalWrite(hwConfig.srLatchPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(hwConfig.srLatchPin, LOW);
}

void BoardDriver::disableAllCols() {
  if (lastEnabledCol == 7) {
    // Sequential wrap-around: shift in a single 0 to push the 1 out of QH
    loadShiftRegister(0x00, 1);
  } else {
    // Non-sequential or startup: load full byte of zeros
    loadShiftRegister(0);
  }
  lastEnabledCol = -1; // Make next enableCol(0) call use optimized 1-bit shift because register is now all zeros
}

void BoardDriver::enableCol(int col) {
  if (col == lastEnabledCol + 1) {
    if (col == 0)
      loadShiftRegister(0x01, 1); // Sequential wrap-around: register should be all zeros already, shift in a single 1 bit into QA
    else
      loadShiftRegister(0x00, 1); // Sequential access: shift in a single 0 bit to move the 1 we shifted earlier to the next column position (towards QH)
  } else {
    // Due to above logic, this condition should never occur, but just in case...
    loadShiftRegister((byte)(1 << col));
  }
  lastEnabledCol = col;
  delayMicroseconds(100); // Allow time for the column to stabilize, otherwise random readings might occur
}

void BoardDriver::readSensors() {
  unsigned long currentTime = millis();

  for (int col = 0; col < NUM_COLS; col++) {
    enableCol(col);
    for (int row = 0; row < NUM_ROWS; row++) {
      bool newReading = digitalRead(hwConfig.rowPins[row]) == LOW;
      // Axes are swapped: hardware col (shift reg) → board row, hardware row (GPIO) → board col
      uint8_t logicalRow = col;
      uint8_t logicalCol = row;
      // Debounce logic
      if (newReading != sensorState[logicalRow][logicalCol]) {
        if (newReading != sensorRaw[logicalRow][logicalCol]) {
          sensorRaw[logicalRow][logicalCol] = newReading;
          sensorDebounceTime[logicalRow][logicalCol] = currentTime;
        } else if (currentTime - sensorDebounceTime[logicalRow][logicalCol] >= DEBOUNCE_MS) {
          sensorState[logicalRow][logicalCol] = newReading;
        }
      } else {
        sensorRaw[logicalRow][logicalCol] = newReading;
        sensorDebounceTime[logicalRow][logicalCol] = currentTime;
      }
    }
  }
  disableAllCols();
}

bool BoardDriver::getSensorState(int row, int col) {
  return sensorState[row][col];
}

bool BoardDriver::getSensorPrev(int row, int col) {
  return sensorPrev[row][col];
}

void BoardDriver::updateSensorPrev() {
  for (int row = 0; row < NUM_ROWS; row++)
    for (int col = 0; col < NUM_COLS; col++)
      sensorPrev[row][col] = sensorState[row][col];
}

int BoardDriver::getPixelIndex(int row, int col) {
  return ledIndexMap[row][col];
}

void BoardDriver::acquireLEDs() {
  xSemaphoreTake(ledMutex, portMAX_DELAY);
}

void BoardDriver::releaseLEDs() {
  xSemaphoreGive(ledMutex);
}

void BoardDriver::clearAllLEDs(bool show) {
  for (int row = 0; row < NUM_ROWS; row++)
    for (int col = 0; col < NUM_COLS; col++)
      currentColors[row][col] = LedColors::Off;
  for (int i = 0; i < LED_COUNT; i++)
    strip->SetPixelColor(i, RgbColor(0));
  if (show)
    showLEDs();
}

void BoardDriver::setSquareLED(int row, int col, LedRGB color) {
  currentColors[row][col] = color; // Track the intended color
  float multiplier = 1.0f;
  if ((row + col) % 2 == 1)
    multiplier = dimMultiplier / 100.0f; // Dim dark squares based on user setting
  strip->SetPixelColor(getPixelIndex(row, col), RgbColor(color.r * multiplier, color.g * multiplier, color.b * multiplier));
}

void BoardDriver::showLEDs() {
  strip->Show();
}

void BoardDriver::setThinkingAlertMask(const bool mask[NUM_ROWS][NUM_COLS]) {
  for (int row = 0; row < NUM_ROWS; row++)
    for (int col = 0; col < NUM_COLS; col++)
      thinkingAlertMask[row][col] = mask[row][col];
}

void BoardDriver::clearThinkingAlertMask() {
  for (int row = 0; row < NUM_ROWS; row++)
    for (int col = 0; col < NUM_COLS; col++)
      thinkingAlertMask[row][col] = false;
}

void BoardDriver::showConnectingAnimation() {
  acquireLEDs();
  // Save current LED state
  LedRGB savedColors[NUM_ROWS][NUM_COLS];
  memcpy(savedColors, currentColors, sizeof(currentColors));

  // Perimeter path (clockwise, 28 squares)
  static const int perimeter[][2] = {
      {0, 0}, {0, 1}, {0, 2}, {0, 3}, {0, 4}, {0, 5}, {0, 6}, {0, 7},
      {1, 7}, {2, 7}, {3, 7}, {4, 7}, {5, 7}, {6, 7}, {7, 7}, {7, 6},
      {7, 5}, {7, 4}, {7, 3}, {7, 2}, {7, 1}, {7, 0}, {6, 0}, {5, 0},
      {4, 0}, {3, 0}, {2, 0}, {1, 0}};
  const int total = sizeof(perimeter) / sizeof(perimeter[0]);

  // Smooth 6-LED trail with exponential decay for natural dimming
  const float trailBrightness[6] = {1.0f, 0.62f, 0.38f, 0.22f, 0.12f, 0.05f};
  const LedRGB baseColor = LedColors::PowerCyan;

  for (int frame = 0; frame < total * 3; frame++) {
    clearAllLEDs(false);
    for (int t = 0; t < 6; t++) {
      int idx = (frame - t + total * 6) % total;
      const int row = perimeter[idx][0];
      const int col = perimeter[idx][1];
      setSquareLED(row, col, scaleLedRGB(baseColor, trailBrightness[t]));
    }
    showLEDs();
    vTaskDelay(pdMS_TO_TICKS(55));
  }

  // Restore previous LED state
  for (int r = 0; r < NUM_ROWS; r++)
    for (int c = 0; c < NUM_COLS; c++)
      setSquareLED(r, c, savedColors[r][c]);
  showLEDs();
  releaseLEDs();
}

void BoardDriver::blinkSquare(int row, int col, LedRGB color, int times, bool clearAfter) {
  AnimationJob job = {AnimationType::BLINK, nullptr, {}};
  job.params.blink = {row, col, color, times, clearAfter};
  enqueueAnimationJob(job);
}

void BoardDriver::doBlink(int row, int col, LedRGB color, int times, bool clearAfter) {
  // Smooth fade-in / fade-out blink using sinusoidal easing
  const int fadeSteps = 16;
  const int fadeDelay = 14; // ~224ms per blink (fade-in + fade-out)
  for (int i = 0; i < times; i++) {
    // Fade in
    for (int s = 0; s <= fadeSteps; s++) {
      float t = (float)s / fadeSteps;
      float ease = t * t * (3.0f - 2.0f * t); // smoothstep
      setSquareLED(row, col, scaleLedRGB(color, ease));
      showLEDs();
      vTaskDelay(pdMS_TO_TICKS(fadeDelay));
    }
    // Fade out
    for (int s = fadeSteps; s >= 0; s--) {
      float t = (float)s / fadeSteps;
      float ease = t * t * (3.0f - 2.0f * t);
      setSquareLED(row, col, scaleLedRGB(color, ease));
      showLEDs();
      vTaskDelay(pdMS_TO_TICKS(fadeDelay));
    }
  }
  if (!clearAfter) {
    setSquareLED(row, col, color);
    showLEDs();
  }
}

void BoardDriver::fireworkAnimation(LedRGB color) {
  AnimationJob job = {AnimationType::FIREWORK, nullptr, {}};
  job.params.firework = {color};
  enqueueAnimationJob(job);
}

void BoardDriver::doFirework(LedRGB color) {
  // Game start/end animation (3s, #520075):
  // Phase A: wave lights rings 0→3big, all staying on, expanding to "big circle" (no 3-corner squares per corner)
  // Wait 500ms at full big circle
  // Phase B: wave turns rings 3big→0 off, inward collapse

  // Center 4
  static const int ring0[][2] = {{3,3},{3,4},{4,3},{4,4}};
  // Inner ring
  static const int ring1[][2] = {{2,2},{2,3},{2,4},{2,5},{3,2},{3,5},{4,2},{4,5},{5,2},{5,3},{5,4},{5,5}};
  // Middle ring
  static const int ring2[][2] = {{1,1},{1,2},{1,3},{1,4},{1,5},{1,6},{2,1},{2,6},{3,1},{3,6},{4,1},{4,6},{5,1},{5,6},{6,1},{6,2},{6,3},{6,4},{6,5},{6,6}};
  // Big circle boundary (edge minus 3-squares per corner = 16 squares)
  static const int ring3b[][2] = {{0,2},{0,3},{0,4},{0,5},{7,2},{7,3},{7,4},{7,5},{2,0},{3,0},{4,0},{5,0},{2,7},{3,7},{4,7},{5,7}};

  struct RingDef { const int (*sq)[2]; int n; };
  RingDef rings[] = {{ring0,4},{ring1,12},{ring2,20},{ring3b,16}};
  constexpr int NR = 4;
  constexpr int STEPS = 12;    // steps per ring fade (12 × 25ms = 300ms per ring)
  constexpr int HOLD_MS = 500; // pause at full big circle

  clearAllLEDs(false);

  // Phase A: Outward expansion — each ring fades in, previous stay bright
  for (int ri = 0; ri < NR; ri++) {
    for (int s = 0; s <= STEPS; s++) {
      float t = (float)s / STEPS;
      float ease = t * t * (3.0f - 2.0f * t);
      LedRGB c = scaleLedRGB(color, ease);
      for (int i = 0; i < rings[ri].n; i++)
        setSquareLED(rings[ri].sq[i][0], rings[ri].sq[i][1], c);
      showLEDs();
      vTaskDelay(pdMS_TO_TICKS(25));
    }
  }

  // Hold full big circle
  vTaskDelay(pdMS_TO_TICKS(HOLD_MS));

  // Phase B: Inward collapse — each ring fades out from outermost inward
  for (int ri = NR - 1; ri >= 0; ri--) {
    for (int s = STEPS; s >= 0; s--) {
      float t = (float)s / STEPS;
      float ease = t * t * (3.0f - 2.0f * t);
      LedRGB c = scaleLedRGB(color, ease);
      for (int i = 0; i < rings[ri].n; i++)
        setSquareLED(rings[ri].sq[i][0], rings[ri].sq[i][1], c);
      showLEDs();
      vTaskDelay(pdMS_TO_TICKS(25));
    }
  }

  clearAllLEDs();
}

void BoardDriver::captureAnimation(int row, int col) {
  AnimationJob job = {AnimationType::CAPTURE, nullptr, {}};
  job.params.capture = {row, col};
  enqueueAnimationJob(job);
}

void BoardDriver::doCapture(int centerRow, int centerCol) {
  // Shockwave ring: single expanding ring from capture point to board edges
  // with dimming trails, running until every edge is hit.
  const float centerX = centerCol + 0.5f;
  const float centerY = centerRow + 0.5f;
  const float maxRadius = 11.0f; // ensure all edges are hit
  const float step = 0.28f;
  const float ringWidth = 1.2f;
  const int trailCount = 8;
  const float trailDecay[8] = {1.0f, 0.65f, 0.42f, 0.26f, 0.15f, 0.08f, 0.03f, 0.01f};
  const LedRGB baseColor = LedColors::Capture;

  clearAllLEDs(false);
  for (float radius = 0.0f; radius <= maxRadius; radius += step) {
    for (int row = 0; row < 8; row++) {
      for (int col = 0; col < 8; col++) {
        float dx = (col + 0.5f) - centerX;
        float dy = (row + 0.5f) - centerY;
        float dist = sqrtf(dx * dx + dy * dy);
        float bestIntensity = 0.0f;

        for (int t = 0; t < trailCount; t++) {
          float ringPos = radius - (t * step * 2.5f);
          if (ringPos < 0.0f) continue;
          float d = fabsf(dist - ringPos);
          if (d < ringWidth) {
            // Smooth falloff within ring width
            float ringFade = 1.0f - (d / ringWidth);
            ringFade = ringFade * ringFade; // quadratic falloff for smooth edges
            float intensity = ringFade * trailDecay[t];
            if (intensity > bestIntensity) bestIntensity = intensity;
          }
        }
        setSquareLED(row, col, scaleLedRGB(baseColor, bestIntensity));
      }
    }
    showLEDs();
    vTaskDelay(pdMS_TO_TICKS(30));
  }

  // Smooth fade-out of remaining trails
  for (int s = 10; s >= 0; s--) {
    float fade = (float)s / 10.0f;
    fade = fade * fade; // ease-out
    for (int row = 0; row < 8; row++)
      for (int col = 0; col < 8; col++)
        setSquareLED(row, col, scaleLedRGB(currentColors[row][col], fade));
    showLEDs();
    vTaskDelay(pdMS_TO_TICKS(25));
  }

  clearAllLEDs();
}

void BoardDriver::promotionAnimation(int row, int col) {
  AnimationJob job = {AnimationType::PROMOTION, nullptr, {}};
  job.params.promotion.row = row;
  job.params.promotion.col = col;
  enqueueAnimationJob(job);
}

void BoardDriver::doPromotion(int row, int col) {
  // LED trail along the file from the opposite side to the promotion square
  // White promotes on row 0 → trail from row 7 to row 0
  // Black promotes on row 7 → trail from row 0 to row 7
  const LedRGB baseColor = LedColors::GameStartEnd;
  const float trailBrightness[4] = {1.0f, 0.55f, 0.25f, 0.08f};
  const int trailLen = 4;
  const int startRow = (row == 0) ? 7 : 0;
  const int endRow = row;
  const int step = (endRow > startRow) ? 1 : -1;
  const int totalSquares = abs(endRow - startRow) + 1; // 8 squares

  clearAllLEDs(false);
  // Trail moves from startRow towards endRow
  for (int head = 0; head < totalSquares + trailLen; head++) {
    clearAllLEDs(false);
    for (int t = 0; t < trailLen; t++) {
      int pos = head - t;
      if (pos < 0 || pos >= totalSquares) continue;
      int r = startRow + pos * step;
      setSquareLED(r, col, scaleLedRGB(baseColor, trailBrightness[t]));
    }
    showLEDs();
    vTaskDelay(pdMS_TO_TICKS(70));
  }

  // Hold promotion square lit
  clearAllLEDs(false);
  setSquareLED(row, col, baseColor);
  showLEDs();
}

void BoardDriver::flashBoardAnimation(LedRGB color, int times) {
  AnimationJob job = {AnimationType::FLASH, nullptr, {}};
  job.params.flash = {color, times};
  enqueueAnimationJob(job);
}

void BoardDriver::doFlash(LedRGB color, int times) {
  const int fadeSteps = 16;
  const int fadeDelay = 12;
  for (int i = 0; i < times; i++) {
    // Fade in
    for (int s = 0; s <= fadeSteps; s++) {
      float t = (float)s / fadeSteps;
      float ease = t * t * (3.0f - 2.0f * t);
      LedRGB c = scaleLedRGB(color, ease);
      for (int row = 0; row < 8; row++)
        for (int col = 0; col < 8; col++)
          setSquareLED(row, col, c);
      showLEDs();
      vTaskDelay(pdMS_TO_TICKS(fadeDelay));
    }
    // Fade out
    for (int s = fadeSteps; s >= 0; s--) {
      float t = (float)s / fadeSteps;
      float ease = t * t * (3.0f - 2.0f * t);
      LedRGB c = scaleLedRGB(color, ease);
      for (int row = 0; row < 8; row++)
        for (int col = 0; col < 8; col++)
          setSquareLED(row, col, c);
      showLEDs();
      vTaskDelay(pdMS_TO_TICKS(fadeDelay));
    }
  }
  clearAllLEDs();
}

std::atomic<bool>* BoardDriver::startThinkingAnimation() {
  auto* stopFlag = new std::atomic<bool>(false);
  AnimationJob job = {AnimationType::THINKING, stopFlag, {}};
  enqueueAnimationJob(job);
  return stopFlag;
}

void BoardDriver::configureThinkingAnimation(LedRGB color, bool topHalf) {
  thinkingColor = color;
  thinkingTopHalf = topHalf;
}

void BoardDriver::doThinking(std::atomic<bool>* stopFlag) {
  // Running trail around perimeter of opponent's 4 ranks
  // Top half perimeter (rows 0-3): 20 positions clockwise
  static const int topPath[][2] = {
      {0, 0}, {0, 1}, {0, 2}, {0, 3}, {0, 4}, {0, 5}, {0, 6}, {0, 7},
      {1, 7}, {2, 7}, {3, 7},
      {3, 6}, {3, 5}, {3, 4}, {3, 3}, {3, 2}, {3, 1}, {3, 0},
      {2, 0}, {1, 0}};
  // Bottom half perimeter (rows 4-7): 20 positions clockwise
  static const int botPath[][2] = {
      {4, 0}, {4, 1}, {4, 2}, {4, 3}, {4, 4}, {4, 5}, {4, 6}, {4, 7},
      {5, 7}, {6, 7}, {7, 7},
      {7, 6}, {7, 5}, {7, 4}, {7, 3}, {7, 2}, {7, 1}, {7, 0},
      {6, 0}, {5, 0}};
  static const int numPositions = 20;

  const auto* path = thinkingTopHalf ? topPath : botPath;
  const float trailBrightness[6] = {1.0f, 0.62f, 0.38f, 0.22f, 0.12f, 0.05f};

  int frame = 0;
  while (!stopFlag || !stopFlag->load()) {
    clearAllLEDs(false);
    for (int t = 0; t < 6; t++) {
      const int idx = (frame - t + numPositions * 6) % numPositions;
      setSquareLED(path[idx][0], path[idx][1], scaleLedRGB(thinkingColor, trailBrightness[t]));
    }

    // Overlay alert mask (error indicators for misplaced pieces)
    for (int row = 0; row < NUM_ROWS; row++)
      for (int col = 0; col < NUM_COLS; col++)
        if (thinkingAlertMask[row][col])
          setSquareLED(row, col, LedColors::Error);

    showLEDs();
    frame = (frame + 1) % numPositions;
    vTaskDelay(pdMS_TO_TICKS(80));
  }
  clearThinkingAlertMask();
  clearAllLEDs();
  delete stopFlag;
}

std::atomic<bool>* BoardDriver::startWaitingAnimation() {
  auto* stopFlag = new std::atomic<bool>(false);
  AnimationJob job = {AnimationType::WAITING, stopFlag, {}};
  enqueueAnimationJob(job);
  return stopFlag;
}

void BoardDriver::doWaiting(std::atomic<bool>* stopFlag) {
  // "Big circle" path: perimeter with 3 squares cut from each corner
  static const int positions[][2] = {
      {0, 2}, {0, 3}, {0, 4}, {0, 5},
      {1, 6}, {2, 7}, {3, 7}, {4, 7}, {5, 7},
      {6, 6}, {7, 5}, {7, 4}, {7, 3}, {7, 2},
      {6, 1}, {5, 0}, {4, 0}, {3, 0}, {2, 0},
      {1, 1}};
  static const int numPositions = sizeof(positions) / sizeof(positions[0]);

  // Smooth 6-LED trail with exponential decay
  const float trailBrightness[6] = {1.0f, 0.62f, 0.38f, 0.22f, 0.12f, 0.05f};
  const LedRGB baseColor = LedColors::PowerCyan;

  int frame = 0;
  while (!stopFlag || !stopFlag->load()) {
    clearAllLEDs(false);
    for (int t = 0; t < 6; t++) {
      const int idx = (frame - t + numPositions * 6) % numPositions;
      setSquareLED(positions[idx][0], positions[idx][1], scaleLedRGB(baseColor, trailBrightness[t]));
    }
    showLEDs();
    frame = (frame + 1) % numPositions;
    vTaskDelay(pdMS_TO_TICKS(80));
  }
  clearAllLEDs();
  delete stopFlag;
}

void BoardDriver::powerAnimation(bool turnOn) {
  AnimationJob job = {AnimationType::POWER, nullptr, {}};
  job.params.flash = {LedColors::PowerCyan, turnOn ? 1 : 0};
  enqueueAnimationJob(job);
}

void BoardDriver::doPower(bool turnOn) {
  // Boot animation: 5-second pulse animation (#00F0FF)
  // Phase 1 (~2s): Core glows in, fast pulse wave radiates outward (rings fade as wave passes), phase ends dark
  // Phase 2 (~3s): Core re-glows, pulse goes outward THEN returns inward to core, core fades out

  static const int r0[][2] = {{3,3},{3,4},{4,3},{4,4}};
  static const int r1[][2] = {{2,2},{2,3},{2,4},{2,5},{3,2},{3,5},{4,2},{4,5},{5,2},{5,3},{5,4},{5,5}};
  static const int r2[][2] = {{1,1},{1,2},{1,3},{1,4},{1,5},{1,6},{2,1},{2,6},{3,1},{3,6},{4,1},{4,6},{5,1},{5,6},{6,1},{6,2},{6,3},{6,4},{6,5},{6,6}};
  static const int r3[][2] = {{0,0},{0,1},{0,2},{0,3},{0,4},{0,5},{0,6},{0,7},{1,0},{1,7},{2,0},{2,7},{3,0},{3,7},{4,0},{4,7},{5,0},{5,7},{6,0},{6,7},{7,0},{7,1},{7,2},{7,3},{7,4},{7,5},{7,6},{7,7}};
  const int rn[] = {4, 12, 20, 28};
  const int (*rp[4])[2] = {r0, r1, r2, r3};
  const LedRGB C = LedColors::PowerCyan;

  auto setRing = [&](int ri, float b) {
    LedRGB c = scaleLedRGB(C, b);
    for (int i = 0; i < rn[ri]; i++)
      setSquareLED(rp[ri][i][0], rp[ri][i][1], c);
  };

  // Helper: pulse a single ring with bell-curve brightness, prev rings trail off
  // STEPS frames at DLY ms each
  constexpr int STEPS = 10;
  constexpr int DLY   = 30; // 300ms per ring

  auto pulseSweepOut = [&](float coreDimStart) {
    float coreB = coreDimStart;
    for (int ri = 0; ri < 4; ri++) {
      float coreEnd = coreDimStart * (1.0f - (ri + 1) / 4.0f);
      for (int s = 0; s <= STEPS; s++) {
        float t = (float)s / STEPS;
        float pulse = (t < 0.5f) ? (2.0f * t) : (2.0f - 2.0f * t); // triangle
        pulse = pulse * pulse;
        clearAllLEDs(false);
        setRing(0, coreB + (coreEnd - coreB) * t);
        if (ri > 0) setRing(ri - 1, 0.0f); // previous ring off
        setRing(ri, pulse);
        showLEDs();
        vTaskDelay(pdMS_TO_TICKS(DLY));
      }
      coreB = coreEnd;
    }
    clearAllLEDs(false); showLEDs();
  };

  auto pulseSweepIn = [&]() {
    for (int ri = 3; ri >= 0; ri--) {
      for (int s = 0; s <= STEPS; s++) {
        float t = (float)s / STEPS;
        float pulse = (t < 0.5f) ? (2.0f * t) : (2.0f - 2.0f * t);
        pulse = pulse * pulse;
        clearAllLEDs(false);
        setRing(ri, pulse);
        showLEDs();
        vTaskDelay(pdMS_TO_TICKS(DLY));
      }
    }
  };

  clearAllLEDs(false); showLEDs();

  // === PHASE 1: Outward Pulse (~2s) ===
  // Core fades in (15 steps × 25ms = 375ms)
  for (int s = 0; s <= 15; s++) {
    float t = (float)s / 15.0f;
    float ease = t * t * (3.0f - 2.0f * t);
    clearAllLEDs(false);
    setRing(0, ease);
    showLEDs();
    vTaskDelay(pdMS_TO_TICKS(25));
  }
  // Pulse wave outward, core dims as it travels (4×300ms = 1200ms)
  pulseSweepOut(1.0f);
  vTaskDelay(pdMS_TO_TICKS(100)); // brief dark pause

  // === PHASE 2: Inward Collapse (~1.6s) ===
  // Pulse wave inward (4×300ms = 1200ms)
  pulseSweepIn();
  // Core fades out (13 steps × 30ms = 390ms)
  for (int s = 13; s >= 0; s--) {
    float t = (float)s / 13.0f;
    float ease = t * t * (3.0f - 2.0f * t);
    clearAllLEDs(false);
    setRing(0, ease);
    showLEDs();
    vTaskDelay(pdMS_TO_TICKS(30));
  }

  if (!turnOn)
    clearAllLEDs();
  else { clearAllLEDs(false); showLEDs(); }
}

void BoardDriver::checkBeamAnimation(int attackerRow, int attackerCol, int kingRow, int kingCol) {
  AnimationJob job = {AnimationType::CHECK_BEAM, nullptr, {}};
  job.params.checkBeam = {attackerRow, attackerCol, kingRow, kingCol};
  enqueueAnimationJob(job);
}

void BoardDriver::doCheckBeam(int attackerRow, int attackerCol, int kingRow, int kingCol) {
  // Warning Beam: line of light connecting attacker to king
  // Fade in from attacker towards king, hold 1 sec, fade out from attacker
  const LedRGB beamColor = LedColors::CheckSharpRed;

  // Build path of squares from attacker to king
  int lineSquares[16][2];
  int lineCount = 0;

  int dRow = kingRow - attackerRow;
  int dCol = kingCol - attackerCol;
  bool isStraightLine = (dRow == 0 || dCol == 0 || abs(dRow) == abs(dCol));

  if (isStraightLine) {
    // Straight line for rook, bishop, queen, pawn
    int dr = (dRow > 0) ? 1 : ((dRow < 0) ? -1 : 0);
    int dc = (dCol > 0) ? 1 : ((dCol < 0) ? -1 : 0);
    int r = attackerRow, c = attackerCol;
    while (lineCount < 16) {
      lineSquares[lineCount][0] = r;
      lineSquares[lineCount][1] = c;
      lineCount++;
      if (r == kingRow && c == kingCol) break;
      r += dr;
      c += dc;
    }
  } else {
    // L-shape for knight: long leg first, then short leg
    int r = attackerRow, c = attackerCol;
    lineSquares[lineCount][0] = r;
    lineSquares[lineCount][1] = c;
    lineCount++;
    if (abs(dRow) >= abs(dCol)) {
      int stepR = (dRow > 0) ? 1 : -1;
      for (int i = 0; i < abs(dRow); i++) {
        r += stepR;
        lineSquares[lineCount][0] = r;
        lineSquares[lineCount][1] = c;
        lineCount++;
      }
      int stepC = (dCol > 0) ? 1 : -1;
      for (int i = 0; i < abs(dCol); i++) {
        c += stepC;
        lineSquares[lineCount][0] = r;
        lineSquares[lineCount][1] = c;
        lineCount++;
      }
    } else {
      int stepC = (dCol > 0) ? 1 : -1;
      for (int i = 0; i < abs(dCol); i++) {
        c += stepC;
        lineSquares[lineCount][0] = r;
        lineSquares[lineCount][1] = c;
        lineCount++;
      }
      int stepR = (dRow > 0) ? 1 : -1;
      for (int i = 0; i < abs(dRow); i++) {
        r += stepR;
        lineSquares[lineCount][0] = r;
        lineSquares[lineCount][1] = c;
        lineCount++;
      }
    }
  }

  if (lineCount < 2) {
    doBlink(attackerRow, attackerCol, beamColor, 3, true);
    return;
  }

  // Phase 1: Fade in from attacker towards king (progressive reveal)
  const int revealSteps = 24;
  const int revealDelay = 20;
  clearAllLEDs(false);
  for (int s = 0; s <= revealSteps; s++) {
    float progress = (float)s / revealSteps;
    for (int i = 0; i < lineCount; i++) {
      float squarePos = (lineCount > 1) ? (float)i / (lineCount - 1) : 0.0f;
      float localT = (progress - squarePos * 0.6f) / 0.4f;
      if (localT < 0.0f) localT = 0.0f;
      if (localT > 1.0f) localT = 1.0f;
      float ease = localT * localT * (3.0f - 2.0f * localT);
      setSquareLED(lineSquares[i][0], lineSquares[i][1], scaleLedRGB(beamColor, ease));
    }
    showLEDs();
    vTaskDelay(pdMS_TO_TICKS(revealDelay));
  }

  // Phase 2: Hold full beam for 1 second
  vTaskDelay(pdMS_TO_TICKS(1000));

  // Phase 3: Fade out from attacker towards king (attacker fades first)
  const int fadeOutSteps = 30;
  const int fadeOutDelay = 18;
  for (int s = 0; s <= fadeOutSteps; s++) {
    float progress = (float)s / fadeOutSteps;
    for (int i = 0; i < lineCount; i++) {
      float squarePos = (lineCount > 1) ? (float)i / (lineCount - 1) : 0.0f;
      float localT = (progress - squarePos * 0.5f) / 0.5f;
      if (localT < 0.0f) localT = 0.0f;
      if (localT > 1.0f) localT = 1.0f;
      float ease = localT * localT * (3.0f - 2.0f * localT);
      setSquareLED(lineSquares[i][0], lineSquares[i][1], scaleLedRGB(beamColor, 1.0f - ease));
    }
    showLEDs();
    vTaskDelay(pdMS_TO_TICKS(fadeOutDelay));
  }

  clearAllLEDs();
}

void BoardDriver::checkmateAnimation(int winKingRow, int winKingCol, int loseKingRow, int loseKingCol) {
  AnimationJob job = {AnimationType::CHECKMATE, nullptr, {}};
  job.params.checkmate = {winKingRow, winKingCol, loseKingRow, loseKingCol};
  enqueueAnimationJob(job);
}

void BoardDriver::doCheckmate(int winKingRow, int winKingCol, int loseKingRow, int loseKingCol) {
  // Golden circular wave from winning king outward, then king indicators for 3 seconds
  const LedRGB waveColor = LedColors::CheckmateWave;
  const float centerX = winKingCol + 0.5f;
  const float centerY = winKingRow + 0.5f;
  const float maxRadius = 11.0f;
  const float step = 0.3f;
  const float ringWidth = 1.5f;
  const int trailCount = 6;
  const float trailDecay[6] = {1.0f, 0.55f, 0.30f, 0.15f, 0.06f, 0.02f};

  clearAllLEDs(false);
  for (float radius = 0.0f; radius <= maxRadius; radius += step) {
    for (int row = 0; row < 8; row++) {
      for (int col = 0; col < 8; col++) {
        float dx = (col + 0.5f) - centerX;
        float dy = (row + 0.5f) - centerY;
        float dist = sqrtf(dx * dx + dy * dy);
        float bestIntensity = 0.0f;

        for (int t = 0; t < trailCount; t++) {
          float ringPos = radius - (t * step * 2.0f);
          if (ringPos < 0.0f) continue;
          float d = fabsf(dist - ringPos);
          if (d < ringWidth) {
            float ringFade = 1.0f - (d / ringWidth);
            ringFade = ringFade * ringFade;
            float intensity = ringFade * trailDecay[t];
            if (intensity > bestIntensity) bestIntensity = intensity;
          }
        }
        setSquareLED(row, col, scaleLedRGB(waveColor, bestIntensity));
      }
    }
    showLEDs();
    vTaskDelay(pdMS_TO_TICKS(30));
  }

  // Fade out wave then show king indicators
  for (int s = 12; s >= 0; s--) {
    float fade = (float)s / 12.0f;
    fade = fade * fade;
    for (int row = 0; row < 8; row++)
      for (int col = 0; col < 8; col++)
        setSquareLED(row, col, scaleLedRGB(currentColors[row][col], fade));
    showLEDs();
    vTaskDelay(pdMS_TO_TICKS(25));
  }

  // Smooth fade in: winning king green, losing king red
  clearAllLEDs(false);
  const int kingFadeSteps = 20;
  for (int s = 0; s <= kingFadeSteps; s++) {
    float t = (float)s / kingFadeSteps;
    float ease = t * t * (3.0f - 2.0f * t);
    setSquareLED(winKingRow, winKingCol, scaleLedRGB(LedColors::CheckmateWin, ease));
    setSquareLED(loseKingRow, loseKingCol, scaleLedRGB(LedColors::CheckmateLose, ease));
    showLEDs();
    vTaskDelay(pdMS_TO_TICKS(20));
  }

  // Hold for 3 seconds
  vTaskDelay(pdMS_TO_TICKS(3000));

  // Smooth fade out
  for (int s = kingFadeSteps; s >= 0; s--) {
    float t = (float)s / kingFadeSteps;
    float ease = t * t * (3.0f - 2.0f * t);
    setSquareLED(winKingRow, winKingCol, scaleLedRGB(LedColors::CheckmateWin, ease));
    setSquareLED(loseKingRow, loseKingCol, scaleLedRGB(LedColors::CheckmateLose, ease));
    showLEDs();
    vTaskDelay(pdMS_TO_TICKS(20));
  }

  clearAllLEDs();
}

// LED settings methods
void BoardDriver::setBrightness(uint8_t value) {
  brightness = value > 255 ? 255 : (value < 10 ? 10 : value);
  strip->SetLuminance(brightness);
  showLEDs();
}

void BoardDriver::setDimMultiplier(uint8_t value) {
  dimMultiplier = value > 100 ? 100 : (value < 20 ? 20 : value);
  // Re-apply all current colors with new dim multiplier
  for (int row = 0; row < NUM_ROWS; row++)
    for (int col = 0; col < NUM_COLS; col++)
      setSquareLED(row, col, currentColors[row][col]);
  showLEDs();
}

void BoardDriver::loadLedSettings() {
  if (!ChessUtils::ensureNvsInitialized()) {
    Serial.println("NVS init failed - LED settings not loaded");
    return;
  }
  Preferences prefs;
  prefs.begin("ledSettings", false);
  brightness = prefs.getUChar("brightness", BRIGHTNESS);
  dimMultiplier = prefs.getUChar("dimMult", 70);
  LedColors::PlayerWhite = unpackLedColor(prefs.getUInt("pWhite", packLedColor(LedColors::DefaultPlayerWhite)));
  LedColors::PlayerBlack = unpackLedColor(prefs.getUInt("pBlack", packLedColor(LedColors::DefaultPlayerBlack)));
  LedColors::ModeHuman = unpackLedColor(prefs.getUInt("mHuman", packLedColor(LedColors::DefaultModeHuman)));
  LedColors::ModeOnline = unpackLedColor(prefs.getUInt("mOnline", packLedColor(LedColors::DefaultModeOnline)));
  LedColors::ModeSensor = unpackLedColor(prefs.getUInt("mSensor", packLedColor(LedColors::DefaultModeSensor)));
  LedColors::ModeStockfish = unpackLedColor(prefs.getUInt("mStockf", packLedColor(LedColors::DefaultModeStockfish)));
  LedColors::GameStartEnd = unpackLedColor(prefs.getUInt("gStart", packLedColor(LedColors::DefaultGameStartEnd)));
  LedColors::Error = unpackLedColor(prefs.getUInt("error", packLedColor(LedColors::DefaultError)));
  LedColors::Check = unpackLedColor(prefs.getUInt("check", packLedColor(LedColors::DefaultCheck)));
  LedColors::CheckSharpRed = unpackLedColor(prefs.getUInt("chkRed", packLedColor(LedColors::DefaultCheckSharpRed)));
  LedColors::Capture = unpackLedColor(prefs.getUInt("captur", packLedColor(LedColors::DefaultCapture)));
  LedColors::CheckmateWave = unpackLedColor(prefs.getUInt("cmWave", packLedColor(LedColors::DefaultCheckmateWave)));
  LedColors::CheckmateWin = unpackLedColor(prefs.getUInt("cmWin", packLedColor(LedColors::DefaultCheckmateWin)));
  LedColors::CheckmateLose = unpackLedColor(prefs.getUInt("cmLose", packLedColor(LedColors::DefaultCheckmateLose)));
  LedColors::Draw = unpackLedColor(prefs.getUInt("draw", packLedColor(LedColors::DefaultDraw)));
  LedColors::Confirm = unpackLedColor(prefs.getUInt("confirm", packLedColor(LedColors::DefaultConfirm)));
  LedColors::PowerCyan = unpackLedColor(prefs.getUInt("power", packLedColor(LedColors::DefaultPowerCyan)));
  prefs.end();
  Serial.printf("LED settings loaded: brightness=%d, dimMultiplier=%d\n", brightness, dimMultiplier);
}

void BoardDriver::saveLedSettings() {
  if (!ChessUtils::ensureNvsInitialized()) {
    Serial.println("NVS init failed - LED settings not saved");
    return;
  }
  Preferences prefs;
  prefs.begin("ledSettings", false);
  prefs.putUChar("brightness", brightness);
  prefs.putUChar("dimMult", dimMultiplier);
  prefs.putUInt("pWhite", packLedColor(LedColors::PlayerWhite));
  prefs.putUInt("pBlack", packLedColor(LedColors::PlayerBlack));
  prefs.putUInt("mHuman", packLedColor(LedColors::ModeHuman));
  prefs.putUInt("mOnline", packLedColor(LedColors::ModeOnline));
  prefs.putUInt("mSensor", packLedColor(LedColors::ModeSensor));
  prefs.putUInt("mStockf", packLedColor(LedColors::ModeStockfish));
  prefs.putUInt("gStart", packLedColor(LedColors::GameStartEnd));
  prefs.putUInt("error", packLedColor(LedColors::Error));
  prefs.putUInt("check", packLedColor(LedColors::Check));
  prefs.putUInt("chkRed", packLedColor(LedColors::CheckSharpRed));
  prefs.putUInt("captur", packLedColor(LedColors::Capture));
  prefs.putUInt("cmWave", packLedColor(LedColors::CheckmateWave));
  prefs.putUInt("cmWin", packLedColor(LedColors::CheckmateWin));
  prefs.putUInt("cmLose", packLedColor(LedColors::CheckmateLose));
  prefs.putUInt("draw", packLedColor(LedColors::Draw));
  prefs.putUInt("confirm", packLedColor(LedColors::Confirm));
  prefs.putUInt("power", packLedColor(LedColors::PowerCyan));
  prefs.end();
  Serial.printf("LED settings saved: brightness=%d, dimMultiplier=%d\n", brightness, dimMultiplier);
}

LedRGB BoardDriver::getPaletteColor(const char* key) const {
  if (strcmp(key, "playerWhite") == 0) return LedColors::PlayerWhite;
  if (strcmp(key, "playerBlack") == 0) return LedColors::PlayerBlack;
  if (strcmp(key, "modeHuman") == 0) return LedColors::ModeHuman;
  if (strcmp(key, "modeOnline") == 0) return LedColors::ModeOnline;
  if (strcmp(key, "modeSensor") == 0) return LedColors::ModeSensor;
  if (strcmp(key, "modeStockfish") == 0) return LedColors::ModeStockfish;
  if (strcmp(key, "gameStartEnd") == 0) return LedColors::GameStartEnd;
  if (strcmp(key, "error") == 0) return LedColors::Error;
  if (strcmp(key, "check") == 0) return LedColors::Check;
  if (strcmp(key, "checkSharpRed") == 0) return LedColors::CheckSharpRed;
  if (strcmp(key, "capture") == 0) return LedColors::Capture;
  if (strcmp(key, "checkmateWave") == 0) return LedColors::CheckmateWave;
  if (strcmp(key, "checkmateWin") == 0) return LedColors::CheckmateWin;
  if (strcmp(key, "checkmateLose") == 0) return LedColors::CheckmateLose;
  if (strcmp(key, "draw") == 0) return LedColors::Draw;
  if (strcmp(key, "confirm") == 0) return LedColors::Confirm;
  if (strcmp(key, "powerCyan") == 0) return LedColors::PowerCyan;
  return LedColors::Off;
}

bool BoardDriver::setPaletteColor(const char* key, LedRGB color) {
  if (strcmp(key, "playerWhite") == 0) LedColors::PlayerWhite = color;
  else if (strcmp(key, "playerBlack") == 0) LedColors::PlayerBlack = color;
  else if (strcmp(key, "modeHuman") == 0) LedColors::ModeHuman = color;
  else if (strcmp(key, "modeOnline") == 0) LedColors::ModeOnline = color;
  else if (strcmp(key, "modeSensor") == 0) LedColors::ModeSensor = color;
  else if (strcmp(key, "modeStockfish") == 0) LedColors::ModeStockfish = color;
  else if (strcmp(key, "gameStartEnd") == 0) LedColors::GameStartEnd = color;
  else if (strcmp(key, "error") == 0) LedColors::Error = color;
  else if (strcmp(key, "check") == 0) LedColors::Check = color;
  else if (strcmp(key, "checkSharpRed") == 0) LedColors::CheckSharpRed = color;
  else if (strcmp(key, "capture") == 0) LedColors::Capture = color;
  else if (strcmp(key, "checkmateWave") == 0) LedColors::CheckmateWave = color;
  else if (strcmp(key, "checkmateWin") == 0) LedColors::CheckmateWin = color;
  else if (strcmp(key, "checkmateLose") == 0) LedColors::CheckmateLose = color;
  else if (strcmp(key, "draw") == 0) LedColors::Draw = color;
  else if (strcmp(key, "confirm") == 0) LedColors::Confirm = color;
  else if (strcmp(key, "powerCyan") == 0) LedColors::PowerCyan = color;
  else return false;
  return true;
}

void BoardDriver::resetPaletteDefaults() {
  LedColors::PlayerWhite = LedColors::DefaultPlayerWhite;
  LedColors::PlayerBlack = LedColors::DefaultPlayerBlack;
  LedColors::ModeHuman = LedColors::DefaultModeHuman;
  LedColors::ModeOnline = LedColors::DefaultModeOnline;
  LedColors::ModeSensor = LedColors::DefaultModeSensor;
  LedColors::ModeStockfish = LedColors::DefaultModeStockfish;
  LedColors::GameStartEnd = LedColors::DefaultGameStartEnd;
  LedColors::Error = LedColors::DefaultError;
  LedColors::Check = LedColors::DefaultCheck;
  LedColors::CheckSharpRed = LedColors::DefaultCheckSharpRed;
  LedColors::Capture = LedColors::DefaultCapture;
  LedColors::CheckmateWave = LedColors::DefaultCheckmateWave;
  LedColors::CheckmateWin = LedColors::DefaultCheckmateWin;
  LedColors::CheckmateLose = LedColors::DefaultCheckmateLose;
  LedColors::Draw = LedColors::DefaultDraw;
  LedColors::Confirm = LedColors::DefaultConfirm;
  LedColors::PowerCyan = LedColors::DefaultPowerCyan;
}

void BoardDriver::loadHardwareConfig() {
  hwConfig = HardwareConfig::defaults();
  if (!ChessUtils::ensureNvsInitialized()) return;

  Preferences prefs;
  prefs.begin("hwConfig", false);
  if (!prefs.isKey("ver")) {
    prefs.end();
    Serial.println("No saved hardware config, using compile-time defaults");
    return;
  }
  hwConfig.ledPin = prefs.getUChar("ledPin", LED_PIN);
  hwConfig.srClkPin = prefs.getUChar("srClk", SR_CLK_PIN);
  hwConfig.srLatchPin = prefs.getUChar("srLatch", SR_LATCH_PIN);
  hwConfig.srDataPin = prefs.getUChar("srData", SR_SER_DATA_PIN);
  hwConfig.srInvertOutputs = prefs.getBool("srInvert", SR_INVERT_OUTPUTS != 0);
  size_t len = prefs.getBytesLength("rowPins");
  if (len == sizeof(hwConfig.rowPins))
    prefs.getBytes("rowPins", hwConfig.rowPins, sizeof(hwConfig.rowPins));
  prefs.end();
  Serial.printf("Hardware config loaded: LED=%d, SR_CLK=%d, SR_LATCH=%d, SR_DATA=%d, SR_INVERT=%d\n", hwConfig.ledPin, hwConfig.srClkPin, hwConfig.srLatchPin, hwConfig.srDataPin, hwConfig.srInvertOutputs);
}

void BoardDriver::saveHardwareConfig(const HardwareConfig& config) {
  if (!ChessUtils::ensureNvsInitialized()) {
    Serial.println("NVS init failed - hardware config not saved");
    return;
  }
  Preferences prefs;
  prefs.begin("hwConfig", false);
  prefs.putUChar("ver", 1);
  prefs.putUChar("ledPin", config.ledPin);
  prefs.putUChar("srClk", config.srClkPin);
  prefs.putUChar("srLatch", config.srLatchPin);
  prefs.putUChar("srData", config.srDataPin);
  prefs.putBool("srInvert", config.srInvertOutputs);
  prefs.putBytes("rowPins", config.rowPins, sizeof(config.rowPins));
  prefs.end();
  // Don't update hwConfig in memory, the new config takes effect after reboot. Modifying it here would race with calibration or gameplay reading the pins.
  Serial.println("Hardware config saved to NVS");
}