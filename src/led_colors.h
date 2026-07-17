#ifndef LED_COLORS_H
#define LED_COLORS_H

#include <stdint.h>

struct LedRGB {
  uint8_t r;
  uint8_t g;
  uint8_t b;
};

// ────────────────────────────────────────────────────────────────────
// INTERNAL GAMMA CORRECTION (Applied "In-Place")
// This bakes the sRGB curve (Gamma 2.2) into the constants.
// ────────────────────────────────────────────────────────────────────
namespace Internal {
  // Faster, more accurate sRGB approximation than (x*x)/255
  constexpr uint8_t gamma(uint8_t color) {
    return (color == 0) ? 0 : 
           (color == 255) ? 255 :
           // Standard sRGB power curve approximation (pow(x, 2.2))
           (uint8_t)(255.0f * __builtin_powf((float)color / 255.0f, 2.2f));
  }

  constexpr LedRGB correct(uint8_t r, uint8_t g, uint8_t b) {
    return { gamma(r), gamma(g), gamma(b) };
  }

  inline uint8_t ungamma(uint8_t corrected) {
    if (corrected == 0) return 0;
    if (corrected == 255) return 255;
    return (uint8_t)(255.0f * __builtin_powf((float)corrected / 255.0f, 1.0f / 2.2f));
  }
}

// Helper: scale an LedRGB by a float brightness factor (0.0–1.0)
inline LedRGB scaleLedRGB(LedRGB c, float f) {
  if (f <= 0.0f) return {0, 0, 0};
  if (f >= 1.0f) return c;
  return {(uint8_t)(c.r * f), (uint8_t)(c.g * f), (uint8_t)(c.b * f)};
}

// Helper: linearly interpolate between two LedRGB colors (t=0→a, t=1→b)
inline LedRGB lerpLedRGB(LedRGB a, LedRGB b, float t) {
  if (t <= 0.0f) return a;
  if (t >= 1.0f) return b;
  return {(uint8_t)(a.r + (b.r - a.r) * t),
          (uint8_t)(a.g + (b.g - a.g) * t),
          (uint8_t)(a.b + (b.b - a.b) * t)};
}

namespace LedColors {
// ────────────────────────────────────────────────────────────────────
// WS2812B Gamma-Corrected Color Constants
// Now using sRGB 2.2 curve baked in-place.
// ────────────────────────────────────────────────────────────────────

// Player colors
static const LedRGB DefaultPlayerWhite = Internal::correct(255, 255, 255); // #FFFFFF (white)
static const LedRGB DefaultPlayerBlack = Internal::correct(75, 92, 9);      // #4B5C09 (olive drab)
extern LedRGB PlayerWhite;
extern LedRGB PlayerBlack;

// Game mode colors
static const LedRGB DefaultModeHuman = Internal::correct(0, 240, 255);      // #00F0FF (cyan)
static const LedRGB DefaultModeOnline = Internal::correct(255, 17, 17);     // #FF1111 (red)
static const LedRGB DefaultModeSensor = Internal::correct(0, 128, 0);       // #008000 (green)
static const LedRGB DefaultModeStockfish = Internal::correct(253, 216, 8);  // #FDD808 (yellow)
extern LedRGB ModeHuman;
extern LedRGB ModeOnline;
extern LedRGB ModeSensor;
extern LedRGB ModeStockfish;

// Event colors
static const LedRGB DefaultGameStartEnd = Internal::correct(82, 0, 117);    // #520075 (purple)
static const LedRGB DefaultError = Internal::correct(255, 17, 17);          // #FF1111 (red)
static const LedRGB DefaultCheck = Internal::correct(236, 88, 0);           // #EC5800 (orange)
static const LedRGB DefaultCheckSharpRed = Internal::correct(255, 4, 4);    // #FF0404 (red)
static const LedRGB DefaultCapture = Internal::correct(82, 0, 117);         // #520075 (purple)
static const LedRGB DefaultCheckmateWave = Internal::correct(253, 216, 8);  // #FDD808 (yellow)
static const LedRGB DefaultCheckmateWin = Internal::correct(0, 128, 0);     // #008000 (green)
static const LedRGB DefaultCheckmateLose = Internal::correct(255, 17, 17);  // #FF1111 (red)
static const LedRGB DefaultDraw = Internal::correct(0, 240, 255);           // #00F0FF (cyan)
static const LedRGB DefaultConfirm = Internal::correct(0, 240, 255);        // #00F0FF (cyan)
static const LedRGB DefaultPowerCyan = Internal::correct(0, 240, 255);      // #00F0FF (cyan)
static const LedRGB Off = {0, 0, 0};
extern LedRGB GameStartEnd;
extern LedRGB Error;
extern LedRGB Check;
extern LedRGB CheckSharpRed;
extern LedRGB Capture;
extern LedRGB CheckmateWave;
extern LedRGB CheckmateWin;
extern LedRGB CheckmateLose;
extern LedRGB Draw;
extern LedRGB Confirm;
extern LedRGB PowerCyan;

// Backward-compatible aliases
static LedRGB& Cyan = ModeHuman;
static LedRGB& White = PlayerWhite;
static LedRGB& Red = Error;
static LedRGB& Purple = GameStartEnd;
static LedRGB& Green = Confirm;
static LedRGB& Yellow = Check;
static LedRGB& Blue = ModeStockfish;
} // namespace LedColors

#endif // LED_COLORS_H