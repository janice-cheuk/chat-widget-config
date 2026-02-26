/**
 * Converts hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculates relative luminance per WCAG 2.1
 * https://www.w3.org/WAI/GL/wiki/Relative_luminance
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates contrast ratio between two colors
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
export function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Picks black or white text color for optimal WCAG AA contrast
 * Returns "#000000" or "#FFFFFF"
 */
export function pickTextColor(bgHex: string): "#000000" | "#FFFFFF" {
  const rgb = hexToRgb(bgHex);
  if (!rgb) return "#000000";

  const bgLum = relativeLuminance(rgb.r, rgb.g, rgb.b);
  const whiteLum = relativeLuminance(255, 255, 255);
  const blackLum = relativeLuminance(0, 0, 0);

  const contrastWhite = contrastRatio(bgLum, whiteLum);
  const contrastBlack = contrastRatio(bgLum, blackLum);

  // WCAG AA requires ≥ 4.5:1 for normal text
  const aaThreshold = 4.5;

  const whitePasses = contrastWhite >= aaThreshold;
  const blackPasses = contrastBlack >= aaThreshold;

  if (whitePasses && !blackPasses) return "#FFFFFF";
  if (blackPasses && !whitePasses) return "#000000";
  // If both pass or neither passes, choose higher contrast
  return contrastWhite > contrastBlack ? "#FFFFFF" : "#000000";
}

/**
 * Applies alpha transparency to a hex color
 * Returns rgba() string
 */
export function applyAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(0, 0, 0, ${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

