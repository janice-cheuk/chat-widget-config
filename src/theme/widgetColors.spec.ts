import { describe, it, expect } from "vitest";
import {
  hexOrRgbaToRgb,
  relativeLuminance,
  contrastRatio,
  darken,
  ensureMinContrast,
  pickTextColor,
  buildWidgetColorTokens,
  generateWidgetColorCSS,
} from "./widgetColors";

describe("widgetColors", () => {
  describe("hexOrRgbaToRgb", () => {
    it("converts #RRGGBB hex", () => {
      expect(hexOrRgbaToRgb("#205AE3")).toEqual({ r: 32, g: 90, b: 227 });
      expect(hexOrRgbaToRgb("#000000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexOrRgbaToRgb("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("converts #RGB hex", () => {
      expect(hexOrRgbaToRgb("#FFF")).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexOrRgbaToRgb("#000")).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexOrRgbaToRgb("#F00")).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("converts rgb() format", () => {
      expect(hexOrRgbaToRgb("rgb(32, 90, 227)")).toEqual({ r: 32, g: 90, b: 227 });
      expect(hexOrRgbaToRgb("rgb(255, 255, 255)")).toEqual({ r: 255, g: 255, b: 255 });
    });

    it("converts rgba() format", () => {
      expect(hexOrRgbaToRgb("rgba(32, 90, 227, 0.8)")).toEqual({ r: 32, g: 90, b: 227 });
      expect(hexOrRgbaToRgb("rgba(222, 229, 235, 1)")).toEqual({ r: 222, g: 229, b: 235 });
    });
  });

  describe("relativeLuminance", () => {
    it("calculates luminance for white", () => {
      const lum = relativeLuminance({ r: 255, g: 255, b: 255 });
      expect(lum).toBeCloseTo(1, 2);
    });

    it("calculates luminance for black", () => {
      const lum = relativeLuminance({ r: 0, g: 0, b: 0 });
      expect(lum).toBe(0);
    });
  });

  describe("contrastRatio", () => {
    it("calculates maximum contrast (black vs white)", () => {
      const ratio = contrastRatio("#000000", "#FFFFFF");
      expect(ratio).toBeCloseTo(21, 1);
    });

    it("calculates minimum contrast (same colors)", () => {
      const ratio = contrastRatio("#808080", "#808080");
      expect(ratio).toBe(1);
    });
  });

  describe("darken", () => {
    it("darkens a color by percentage", () => {
      const result = darken("#FFFFFF", 50);
      const rgb = hexOrRgbaToRgb(result);
      expect(rgb.r).toBeLessThan(255);
      expect(rgb.g).toBeLessThan(255);
      expect(rgb.b).toBeLessThan(255);
    });

    it("darkens blue color", () => {
      const result = darken("#205AE3", 20);
      const original = hexOrRgbaToRgb("#205AE3");
      const darkened = hexOrRgbaToRgb(result);
      expect(darkened.r).toBeLessThan(original.r);
      expect(darkened.g).toBeLessThan(original.g);
      expect(darkened.b).toBeLessThan(original.b);
    });
  });

  describe("ensureMinContrast", () => {
    it("returns original color if already meets requirement", () => {
      const result = ensureMinContrast("#000000", "#FFFFFF", 3);
      expect(result.color).toBe("#000000");
      expect(result.achieved).toBeGreaterThanOrEqual(3);
      expect(result.appliedDarkenPct).toBe(0);
    });

    it("darkens light color to meet contrast", () => {
      const result = ensureMinContrast("#FFE585", "#FFFFFF", 3);
      expect(result.achieved).toBeGreaterThanOrEqual(3);
      expect(result.appliedDarkenPct).toBeGreaterThan(0);
    });

    it("respects maxDarkenPct limit", () => {
      const result = ensureMinContrast("#FFFFFF", "#FFFFFF", 3, 10);
      expect(result.appliedDarkenPct).toBeLessThanOrEqual(10);
    });
  });

  describe("pickTextColor", () => {
    it("picks white for dark backgrounds", () => {
      expect(pickTextColor("#000000")).toBe("#FFFFFF");
      expect(pickTextColor("#205AE3")).toBe("#FFFFFF");
    });

    it("picks black for light backgrounds", () => {
      expect(pickTextColor("#FFFFFF")).toBe("#000000");
      expect(pickTextColor("rgba(222, 229, 235, 1)")).toBe("#000000");
    });

    it("respects minimum contrast requirement", () => {
      const result = pickTextColor("#808080", "#FFFFFF", "#000000", 4.5);
      expect(["#000000", "#FFFFFF"]).toContain(result);
      const ratio = contrastRatio(result, "#808080");
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });

  describe("buildWidgetColorTokens", () => {
    it("returns all required tokens", () => {
      const tokens = buildWidgetColorTokens("#205AE3", "#FFFFFF");
      expect(tokens).toHaveProperty("neutralInactive");
      expect(tokens).toHaveProperty("inputBg");
      expect(tokens).toHaveProperty("inputBorder");
      expect(tokens).toHaveProperty("inputText");
      expect(tokens).toHaveProperty("inputPlaceholder");
      expect(tokens).toHaveProperty("inputFocusOutline");
      expect(tokens).toHaveProperty("sendBg");
      expect(tokens).toHaveProperty("sendIcon");
      expect(tokens).toHaveProperty("sendBgHover");
      expect(tokens).toHaveProperty("sendBgActive");
      expect(tokens).toHaveProperty("callBg");
      expect(tokens).toHaveProperty("callText");
      expect(tokens).toHaveProperty("callBgHover");
      expect(tokens).toHaveProperty("callBgActive");
    });

    it("uses fixed neutral inactive color", () => {
      const tokens = buildWidgetColorTokens("#205AE3", "#FFFFFF");
      expect(tokens.neutralInactive).toBe("rgba(222, 229, 235, 1)");
      expect(tokens.inputBg).toBe("rgba(222, 229, 235, 1)");
      expect(tokens.inputBorder).toBe("rgba(222, 229, 235, 1)");
      expect(tokens.sendBg).toBe("rgba(222, 229, 235, 1)");
    });

    // ACCEPTANCE CHECK 1: Light yellow brand
    it("auto-darkens light yellow brand to meet contrast (acceptance check 1)", () => {
      const tokens = buildWidgetColorTokens("#FFE585", "#FFFFFF");
      const callBgContrast = contrastRatio(tokens.callBg, "#FFFFFF");
      expect(callBgContrast).toBeGreaterThanOrEqual(3);
      expect(tokens.callText).toBe("#000000");
    });

    // ACCEPTANCE CHECK 2: Blue brand
    it("uses blue brand that already meets contrast (acceptance check 2)", () => {
      const tokens = buildWidgetColorTokens("#0B5FFF", "#FFFFFF");
      const callBgContrast = contrastRatio(tokens.callBg, "#FFFFFF");
      expect(callBgContrast).toBeGreaterThanOrEqual(3);
      expect(tokens.callText).toBe("#FFFFFF");
    });

    // ACCEPTANCE CHECK 3: Input and send always neutral
    it("always uses neutral inactive for input and send (acceptance check 3)", () => {
      const tokens1 = buildWidgetColorTokens("#FFE585", "#FFFFFF");
      const tokens2 = buildWidgetColorTokens("#0B5FFF", "#FFFFFF");
      const tokens3 = buildWidgetColorTokens("#000000", "#FFFFFF");

      const neutral = "rgba(222, 229, 235, 1)";
      [tokens1, tokens2, tokens3].forEach((tokens) => {
        expect(tokens.inputBg).toBe(neutral);
        expect(tokens.inputBorder).toBe(neutral);
        expect(tokens.sendBg).toBe(neutral);
      });
    });

    // ACCEPTANCE CHECK 4: Focus outline meets contrast
    it("ensures focus outline meets >=3:1 contrast (acceptance check 4)", () => {
      const tokens = buildWidgetColorTokens("#FFE585", "#FFFFFF");
      const focusContrast = contrastRatio(tokens.inputFocusOutline, "#FFFFFF");
      expect(focusContrast).toBeGreaterThanOrEqual(3);
    });

    it("ensures call button text meets >=4.5:1 contrast", () => {
      const tokens = buildWidgetColorTokens("#205AE3", "#FFFFFF");
      const textContrast = contrastRatio(tokens.callText, tokens.callBg);
      expect(textContrast).toBeGreaterThanOrEqual(4.5);
    });

    it("ensures input text meets >=4.5:1 contrast", () => {
      const tokens = buildWidgetColorTokens("#205AE3", "#FFFFFF");
      const textContrast = contrastRatio(tokens.inputText, tokens.inputBg);
      expect(textContrast).toBeGreaterThanOrEqual(4.5);
    });

    it("darkens send button on hover and active", () => {
      const tokens = buildWidgetColorTokens("#205AE3", "#FFFFFF");
      const hoverLum = relativeLuminance(hexOrRgbaToRgb(tokens.sendBgHover));
      const activeLum = relativeLuminance(hexOrRgbaToRgb(tokens.sendBgActive));
      const baseLum = relativeLuminance(hexOrRgbaToRgb(tokens.sendBg));

      expect(hoverLum).toBeLessThan(baseLum);
      expect(activeLum).toBeLessThan(hoverLum);
    });

    it("darkens call button on hover and active", () => {
      const tokens = buildWidgetColorTokens("#205AE3", "#FFFFFF");
      const hoverLum = relativeLuminance(hexOrRgbaToRgb(tokens.callBgHover));
      const activeLum = relativeLuminance(hexOrRgbaToRgb(tokens.callBgActive));
      const baseLum = relativeLuminance(hexOrRgbaToRgb(tokens.callBg));

      expect(hoverLum).toBeLessThan(baseLum);
      expect(activeLum).toBeLessThan(hoverLum);
    });
  });

  describe("generateWidgetColorCSS", () => {
    it("generates CSS with all variables", () => {
      const tokens = buildWidgetColorTokens("#205AE3", "#FFFFFF");
      const css = generateWidgetColorCSS(tokens);

      expect(css).toContain("--color-neutral-inactive");
      expect(css).toContain("--input-bg");
      expect(css).toContain("--input-border");
      expect(css).toContain("--input-text");
      expect(css).toContain("--input-placeholder");
      expect(css).toContain("--input-focus-outline");
      expect(css).toContain("--send-bg");
      expect(css).toContain("--send-icon");
      expect(css).toContain("--send-bg-hover");
      expect(css).toContain("--send-bg-active");
      expect(css).toContain("--call-bg");
      expect(css).toContain("--call-text");
      expect(css).toContain("--call-bg-hover");
      expect(css).toContain("--call-bg-active");
    });

    it("includes actual token values in CSS", () => {
      const tokens = buildWidgetColorTokens("#205AE3", "#FFFFFF");
      const css = generateWidgetColorCSS(tokens);

      expect(css).toContain(tokens.neutralInactive);
      expect(css).toContain(tokens.inputBg);
      expect(css).toContain(tokens.callBg);
    });
  });
});

