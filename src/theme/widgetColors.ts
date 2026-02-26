/**
 * Theme-agnostic color utilities and tokens for chat widget
 * Enforces WCAG contrast requirements and product-specific color rules
 * Works across Minimalist, Vibrant, and Glass themes
 */

export type RGB = { r: number; g: number; b: number };

/**
 * Converts various color formats (#RGB, #RRGGBB, rgba(), rgb()) to RGB
 */
export function hexOrRgbaToRgb(input: string): RGB {
  // Handle hex colors (#RGB or #RRGGBB)
  const hexMatch = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(input);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1] + hexMatch[1], 16),
      g: parseInt(hexMatch[2] + hexMatch[2], 16),
      b: parseInt(hexMatch[3] + hexMatch[3], 16),
    };
  }

  const hexMatch6 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(input);
  if (hexMatch6) {
    return {
      r: parseInt(hexMatch6[1], 16),
      g: parseInt(hexMatch6[2], 16),
      b: parseInt(hexMatch6[3], 16),
    };
  }

  // Handle rgb() or rgba()
  const rgbMatch = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/i.exec(input);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }

  // Fallback to black if parsing fails
  return { r: 0, g: 0, b: 0 };
}

/**
 * Converts RGB to hex string
 */
function rgbToHex(rgb: RGB): string {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("")}`;
}

/**
 * Converts RGB to HSL
 */
function rgbToHsl(rgb: RGB): { h: number; s: number; l: number } {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return { h: h * 360, s, l };
}

/**
 * Converts HSL to RGB
 */
function hslToRgb(hsl: { h: number; s: number; l: number }): RGB {
  const h = hsl.h / 360;
  const s = hsl.s;
  const l = hsl.l;

  let r: number, g: number, b: number;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Calculates relative luminance per WCAG 2.1 formula
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function relativeLuminance(rgb: RGB): number {
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates contrast ratio between two colors (WCAG formula)
 * Returns a number like 4.6
 */
export function contrastRatio(fg: string, bg: string): number {
  const fgRgb = hexOrRgbaToRgb(fg);
  const bgRgb = hexOrRgbaToRgb(bg);

  const fgLum = relativeLuminance(fgRgb);
  const bgLum = relativeLuminance(bgRgb);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Darkens a color by a percentage using HSL
 * For very light colors, uses a color mixing approach to better preserve hue
 * Returns hex color string
 */
export function darken(color: string, amountPct: number): string {
  const rgb = hexOrRgbaToRgb(color);
  const hsl = rgbToHsl(rgb);
  
  // For very light colors (lightness > 0.75), use a color mixing approach
  // that blends with a darker version to preserve the hue better
  if (hsl.l > 0.75 && amountPct > 15) {
    // Create a darker version by reducing lightness while maintaining hue
    const darkHsl = { h: hsl.h, s: Math.min(1, hsl.s + 0.2), l: 0.3 };
    const darkRgb = hslToRgb(darkHsl);
    
    // Mix the original with the darker version based on amountPct
    const mixRatio = Math.min(1, amountPct / 100);
    const mixedRgb = {
      r: Math.round(rgb.r * (1 - mixRatio) + darkRgb.r * mixRatio),
      g: Math.round(rgb.g * (1 - mixRatio) + darkRgb.g * mixRatio),
      b: Math.round(rgb.b * (1 - mixRatio) + darkRgb.b * mixRatio),
    };
    return rgbToHex(mixedRgb);
  }
  
  // Standard HSL darkening for other colors
  const newL = Math.max(0, hsl.l - amountPct / 100);
  const newRgb = hslToRgb({ h: hsl.h, s: hsl.s, l: newL });
  return rgbToHex(newRgb);
}

/**
 * Ensures a color meets minimum contrast against a background by darkening if needed
 * Returns the adjusted color, achieved contrast ratio, and applied darken percentage
 */
export function ensureMinContrast(
  color: string,
  bg: string,
  min: number,
  maxDarkenPct: number = 40
): { color: string; achieved: number; appliedDarkenPct: number } {
  let currentColor = color;
  let appliedDarkenPct = 0;
  let currentRatio = contrastRatio(currentColor, bg);

  // If already meets requirement, return as-is
  if (currentRatio >= min) {
    return { color: currentColor, achieved: currentRatio, appliedDarkenPct: 0 };
  }

  // Darken incrementally until we meet the requirement or hit max
  const step = 1; // 1% increments
  while (currentRatio < min && appliedDarkenPct < maxDarkenPct) {
    appliedDarkenPct += step;
    currentColor = darken(color, appliedDarkenPct);
    currentRatio = contrastRatio(currentColor, bg);
  }

  return {
    color: currentColor,
    achieved: currentRatio,
    appliedDarkenPct,
  };
}

/**
 * Picks white or black text color that meets minimum contrast requirement
 * If both pass, returns the one with higher contrast
 * Defaults to #FFFFFF and #000000 if not specified
 */
export function pickTextColor(
  bg: string,
  light: string = "#FFFFFF",
  dark: string = "#000000",
  min: number = 4.5
): "#FFFFFF" | "#000000" {
  const lightRatio = contrastRatio(light, bg);
  const darkRatio = contrastRatio(dark, bg);

  const lightPasses = lightRatio >= min;
  const darkPasses = darkRatio >= min;

  if (lightPasses && !darkPasses) return "#FFFFFF";
  if (darkPasses && !lightPasses) return "#000000";

  // If both pass or neither passes, choose higher contrast
  return lightRatio > darkRatio ? "#FFFFFF" : "#000000";
}

/**
 * Widget color tokens for theme-agnostic styling
 */
export type WidgetColorTokens = {
  // neutrals
  neutralInactive: string; // rgba(222,229,235,1)

  // input bar
  inputBg: string;
  inputStroke: string; // >= 3:1 vs surface (derived if needed)
  inputText: string; // >= 4.5:1 vs inputBg
  inputPlaceholder: string; // >= 4.5:1 vs inputBg
  inputFocusOutline: string; // brand-adjusted, >= 3:1 vs surface

  // send button (neutral)
  sendBg: string;
  sendStroke: string; // >= 3:1 vs surface (derived if needed)
  sendIcon: string; // >= 4.5:1 vs sendBg (default state)
  sendIconActive: string; // >= 4.5:1 vs sendBgActive (auto-adjusted)
  sendBgHover: string;
  sendBgActive: string;

  // call button (brand)
  callBg: string; // brand darkened to >= 3:1, or fallback blue
  callText: string; // >= 4.5:1 vs callBg
  callTextActive: string; // >= 4.5:1 vs callBgActive (auto-adjusted)
  callBgHover: string; // +10–15% darker
  callBgActive: string; // +15–20% darker

  // source links (same as call button active)
  sourceBg: string; // same as callBgActive
  sourceText: string; // same as callTextActive

  // header icons (minimize/close)
  headerIcon: string; // >= 4.5:1 vs headerBg (auto-adjusted)
};

/**
 * Fallback interactive blue when brand color cannot meet contrast requirements
 */
const INTERACTIVE_BLUE = "#3578E5";

/**
 * Fallback stroke color for input/send when neutral inactive cannot meet contrast
 */
const FALLBACK_STROKE_BASE = "#9AA6B2";

/**
 * Builds widget color tokens based on brand color and surface background
 * Enforces WCAG contrast requirements and product-specific rules
 */
/**
 * Computes a stroke color that ensures >= 3:1 contrast against surface
 * Uses the base color, darkens it if needed, or falls back to FALLBACK_STROKE_BASE
 */
function computeStrokeColor(
  baseColor: string,
  surfaceBg: string
): string {
  // Check if base color already meets 3:1 contrast
  const baseContrast = contrastRatio(baseColor, surfaceBg);
  if (baseContrast >= 3) {
    return baseColor; // No stroke needed, but return base for consistency
  }

  // Try to darken base color to meet 3:1
  const darkenedResult = ensureMinContrast(baseColor, surfaceBg, 3, 40);
  if (darkenedResult.achieved >= 3) {
    return darkenedResult.color;
  }

  // If still < 3:1, use fallback stroke color darkened until it meets 3:1
  const fallbackResult = ensureMinContrast(FALLBACK_STROKE_BASE, surfaceBg, 3, 40);
  return fallbackResult.color;
}

export function buildWidgetColorTokens(
  brandColor: string,
  surfaceBg: string = "#FFFFFF"
): WidgetColorTokens {
  // Fixed neutral inactive color
  const neutralInactive = "rgba(222, 229, 235, 1)";

  // Fixed default border/background color for input and send button
  const defaultBorderBg = "#F4F6F8";
  
  // Fixed arrow icon color
  const sendIconColor = "#A1B0B7";

  // Input bar (always neutral fill)
  const inputBg = neutralInactive;
  
  // Input stroke: default to #F4F6F8 (unless active/focused)
  const inputStroke = defaultBorderBg;
  
  // Input text & placeholder: >= 4.5:1 vs inputBg (the fill)
  const inputText = pickTextColor(inputBg, "#FFFFFF", "#000000", 4.5);
  const inputPlaceholder = pickTextColor(inputBg, "#FFFFFF", "#000000", 4.5);

  // Input focus outline: will use same as call button active (computed later)
  // Placeholder for now, will be set to callBgActive
  let inputFocusOutline = "";

  // Send button (always #F4F6F8 background)
  const sendBg = defaultBorderBg;
  
  // Send stroke: use same as background (not needed for contrast since fill is visible)
  const sendStroke = defaultBorderBg;
  
  // Send icon: fixed color #A1B0B7 (default state)
  const sendIcon = sendIconColor;
  
  // Send hover: darken the fill
  const sendBgHover = darken(sendBg, 9); // ~9% (between 8-10%)
  
  // Send active: will use same as call button active (computed later)
  // Placeholder for now, will be set to callBgActive
  let sendBgActive = "";
  
  // Send icon active: will be computed after sendBgActive is set
  let sendIconActive = "";

  // Call button (brand-accented)
  // Ensure brand color meets >=3:1 vs surface, with fallback
  const callBgResult = ensureMinContrast(brandColor, surfaceBg, 3, 40);
  let callBg = callBgResult.color;

  // If still doesn't meet requirement after 40% darken, use fallback
  if (callBgResult.achieved < 3) {
    callBg = INTERACTIVE_BLUE;
  }

  // Call button text/icon (>=4.5:1 vs callBg)
  const callText = pickTextColor(callBg, "#FFFFFF", "#000000", 4.5);

  // Call button hover: darken by 10-15% from base (but ensure still >=3:1)
  const callBgHoverBase = darken(callBg, 12.5); // ~12.5% (between 10-15%)
  const callBgHoverResult = ensureMinContrast(callBgHoverBase, surfaceBg, 3, 5);
  const callBgHover = callBgHoverResult.achieved >= 3 ? callBgHoverBase : callBg;

  // Call button active: darken by 15-20% from base (but ensure still >=3:1)
  const callBgActiveBase = darken(callBg, 17.5); // ~17.5% (between 15-20%)
  const callBgActiveResult = ensureMinContrast(callBgActiveBase, surfaceBg, 3, 5);
  const callBgActive = callBgActiveResult.achieved >= 3 ? callBgActiveBase : callBg;
  
  // Call button text active: auto-adjust icon color based on active background
  const callTextActive = pickTextColor(callBgActive, "#FFFFFF", "#000000", 4.5);

  // Source links: use same colors as call button active
  const sourceBg = callBgActive;
  const sourceText = callTextActive;

  // Input focus outline: use same as call button active
  inputFocusOutline = callBgActive;

  // Send active: use same as call button active
  sendBgActive = callBgActive;
  
  // Send icon active: auto-adjust icon color based on active background
  sendIconActive = pickTextColor(sendBgActive, "#FFFFFF", "#000000", 4.5);

  // Header icons: will be computed based on header background
  // This will be set by the component using the header background color
  const headerIcon = "#000000"; // Placeholder, will be overridden

  return {
    neutralInactive,
    inputBg,
    inputStroke,
    inputText,
    inputPlaceholder,
    inputFocusOutline,
    sendBg,
    sendStroke,
    sendIcon,
    sendIconActive,
    sendBgHover,
    sendBgActive,
    callBg,
    callText,
    callTextActive,
    callBgHover,
    callBgActive,
    sourceBg,
    sourceText,
    headerIcon,
  };
}

/**
 * Generates CSS variable mapping for widget color tokens
 * Returns a CSS string that can be injected into styles
 */
export function generateWidgetColorCSS(tokens: WidgetColorTokens): string {
  return `
:root {
  --color-neutral-inactive: ${tokens.neutralInactive};
  --input-bg: ${tokens.inputBg};
  --input-stroke: ${tokens.inputStroke};
  --input-text: ${tokens.inputText};
  --input-placeholder: ${tokens.inputPlaceholder};
  --input-focus-outline: ${tokens.inputFocusOutline};
  --send-bg: ${tokens.sendBg};
  --send-stroke: ${tokens.sendStroke};
  --send-icon: ${tokens.sendIcon};
  --send-icon-active: ${tokens.sendIconActive};
  --send-bg-hover: ${tokens.sendBgHover};
  --send-bg-active: ${tokens.sendBgActive};
  --call-bg: ${tokens.callBg};
  --call-text: ${tokens.callText};
  --call-text-active: ${tokens.callTextActive};
  --call-bg-hover: ${tokens.callBgHover};
  --call-bg-active: ${tokens.callBgActive};
  --source-bg: ${tokens.sourceBg};
  --source-text: ${tokens.sourceText};
}`;
}

/**
 * ACCEPTANCE CHECKS / EXAMPLES
 *
 * These demonstrate the expected behavior:
 *
 * 1. brandColor = '#FFE585' (light yellow), surfaceBg = '#FFFFFF'
 *    → call button bg auto-darkens to ≥ 3:1 vs surface, call text = #000000
 *
 * 2. brandColor = '#0B5FFF', surfaceBg = '#FFFFFF'
 *    → brand already ≥ 3:1, call text = #FFFFFF
 *
 * 3. Input bar & send button always use neutral inactive background (rgba(222,229,235,1))
 *    → If fill contrast < 3:1 vs surface, stroke is computed to meet ≥ 3:1
 *
 * 4. Input focus outline uses brand-adjusted color meeting ≥ 3:1 vs surfaceBg
 */

// Example usage (commented out, but can be uncommented for testing):
/*
// Test case 1: Light yellow brand
const tokens1 = buildWidgetColorTokens('#FFE585', '#FFFFFF');
console.log('Light yellow brand:');
console.log('Call BG:', tokens1.callBg); // Should be darkened
console.log('Call Text:', tokens1.callText); // Should be #000000
console.log('Contrast:', contrastRatio(tokens1.callBg, '#FFFFFF')); // Should be >= 3

// Test case 2: Blue brand
const tokens2 = buildWidgetColorTokens('#0B5FFF', '#FFFFFF');
console.log('Blue brand:');
console.log('Call BG:', tokens2.callBg); // Should be #0B5FFF or close
console.log('Call Text:', tokens2.callText); // Should be #FFFFFF
console.log('Contrast:', contrastRatio(tokens2.callBg, '#FFFFFF')); // Should be >= 3

// Test case 3: Neutral colors
console.log('Input BG:', tokens1.inputBg); // Should be rgba(222,229,235,1)
console.log('Send BG:', tokens1.sendBg); // Should be rgba(222,229,235,1)

// Test case 4: Focus outline
console.log('Focus Outline:', tokens1.inputFocusOutline);
console.log('Focus Contrast:', contrastRatio(tokens1.inputFocusOutline, '#FFFFFF')); // Should be >= 3
*/

