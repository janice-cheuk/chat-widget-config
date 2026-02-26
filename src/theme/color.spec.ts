import { describe, it, expect } from "vitest";
import {
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  pickTextColor,
  applyAlpha,
} from "./color";

describe("color utilities", () => {
  describe("hexToRgb", () => {
    it("converts valid hex colors", () => {
      expect(hexToRgb("#205AE3")).toEqual({ r: 32, g: 90, b: 227 });
      expect(hexToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("handles hex without #", () => {
      expect(hexToRgb("205AE3")).toEqual({ r: 32, g: 90, b: 227 });
    });

    it("returns null for invalid hex", () => {
      expect(hexToRgb("invalid")).toBeNull();
      expect(hexToRgb("#GGG")).toBeNull();
    });
  });

  describe("relativeLuminance", () => {
    it("calculates luminance for white", () => {
      const lum = relativeLuminance(255, 255, 255);
      expect(lum).toBeCloseTo(1, 2);
    });

    it("calculates luminance for black", () => {
      const lum = relativeLuminance(0, 0, 0);
      expect(lum).toBe(0);
    });

    it("calculates luminance for mid-tone", () => {
      const lum = relativeLuminance(128, 128, 128);
      expect(lum).toBeGreaterThan(0);
      expect(lum).toBeLessThan(1);
    });
  });

  describe("contrastRatio", () => {
    it("calculates maximum contrast (black vs white)", () => {
      const ratio = contrastRatio(0, 1);
      expect(ratio).toBeCloseTo(21, 1);
    });

    it("calculates minimum contrast (same colors)", () => {
      const ratio = contrastRatio(0.5, 0.5);
      expect(ratio).toBe(1);
    });

    it("calculates contrast for different luminances", () => {
      const ratio = contrastRatio(0.1, 0.9);
      expect(ratio).toBeGreaterThan(1);
    });
  });

  describe("pickTextColor", () => {
    it("picks white for dark backgrounds", () => {
      expect(pickTextColor("#000000")).toBe("#FFFFFF");
      expect(pickTextColor("#205AE3")).toBe("#FFFFFF"); // Blue should use white
    });

    it("picks black for light backgrounds", () => {
      expect(pickTextColor("#FFFFFF")).toBe("#000000");
      expect(pickTextColor("#F8F9FA")).toBe("#000000"); // Light gray should use black
    });

    it("picks higher contrast when both pass", () => {
      // Medium gray - both should pass, pick higher contrast
      const result = pickTextColor("#777777");
      expect(["#000000", "#FFFFFF"]).toContain(result);
    });

    it("handles edge cases", () => {
      expect(pickTextColor("#FFB000")).toBe("#000000"); // Orange/yellow should use black
    });

    it("ensures WCAG AA compliance (≥4.5:1)", () => {
      const testColors = ["#205AE3", "#000000", "#FFFFFF", "#777777", "#FFB000"];
      testColors.forEach((color) => {
        const rgb = hexToRgb(color);
        if (!rgb) return;

        const bgLum = relativeLuminance(rgb.r, rgb.g, rgb.b);
        const textColor = pickTextColor(color);
        const textRgb = hexToRgb(textColor);
        if (!textRgb) return;

        const textLum = relativeLuminance(textRgb.r, textRgb.g, textRgb.b);
        const ratio = contrastRatio(bgLum, textLum);

        expect(ratio).toBeGreaterThanOrEqual(4.5);
      });
    });
  });

  describe("applyAlpha", () => {
    it("applies alpha to hex color", () => {
      const result = applyAlpha("#205AE3", 0.8);
      expect(result).toBe("rgba(32, 90, 227, 0.8)");
    });

    it("handles invalid hex", () => {
      const result = applyAlpha("invalid", 0.5);
      expect(result).toBe("rgba(0, 0, 0, 0.5)");
    });

    it("handles different alpha values", () => {
      expect(applyAlpha("#000000", 0)).toBe("rgba(0, 0, 0, 0)");
      expect(applyAlpha("#FFFFFF", 1)).toBe("rgba(255, 255, 255, 1)");
    });
  });
});

