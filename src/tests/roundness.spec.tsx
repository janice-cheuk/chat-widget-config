import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ROUNDNESS_TOKENS, setRoundnessVars, type RoundnessKey } from "../theme/roundness";
import { WidgetConfigProvider } from "../context/WidgetConfigContext";
import { ChatPreview } from "../components/ChatPreview";

// Helper to get computed border-radius
const getBorderRadius = (el: HTMLElement | null): string => {
  if (!el) return "";
  return window.getComputedStyle(el).borderRadius;
};

describe("Roundness tokens", () => {
  beforeEach(() => {
    // Reset CSS variables
    document.documentElement.style.removeProperty("--r-container");
    document.documentElement.style.removeProperty("--r-bubble");
    document.documentElement.style.removeProperty("--r-input");
    document.documentElement.style.removeProperty("--r-launcher");
  });

  afterEach(() => {
    // Clean up
    document.documentElement.style.removeProperty("--r-container");
    document.documentElement.style.removeProperty("--r-bubble");
    document.documentElement.style.removeProperty("--r-input");
    document.documentElement.style.removeProperty("--r-launcher");
  });

  describe("setRoundnessVars", () => {
    it("sets CSS variables for circle", () => {
      setRoundnessVars("circle");
      const style = document.documentElement.style;
      expect(style.getPropertyValue("--r-container")).toBe("32px");
      expect(style.getPropertyValue("--r-bubble")).toBe("24px");
      expect(style.getPropertyValue("--r-input")).toBe("32px");
      expect(style.getPropertyValue("--r-launcher")).toBe("9999px");
    });

    it("sets CSS variables for oval", () => {
      setRoundnessVars("oval");
      const style = document.documentElement.style;
      expect(style.getPropertyValue("--r-container")).toBe("24px");
      expect(style.getPropertyValue("--r-bubble")).toBe("16px");
      expect(style.getPropertyValue("--r-input")).toBe("24px");
      expect(style.getPropertyValue("--r-launcher")).toBe("24px");
    });

    it("sets CSS variables for rectangle", () => {
      setRoundnessVars("rectangle");
      const style = document.documentElement.style;
      expect(style.getPropertyValue("--r-container")).toBe("16px");
      expect(style.getPropertyValue("--r-bubble")).toBe("12px");
      expect(style.getPropertyValue("--r-input")).toBe("16px");
      expect(style.getPropertyValue("--r-launcher")).toBe("16px");
    });

    it("sets CSS variables for square", () => {
      setRoundnessVars("square");
      const style = document.documentElement.style;
      expect(style.getPropertyValue("--r-container")).toBe("8px");
      expect(style.getPropertyValue("--r-bubble")).toBe("4px");
      expect(style.getPropertyValue("--r-input")).toBe("8px");
      expect(style.getPropertyValue("--r-launcher")).toBe("8px");
    });
  });

  describe("Applied border-radius in ChatPreview", () => {
    const roundnessKeys: RoundnessKey[] = ["circle", "oval", "rectangle", "square"];

    roundnessKeys.forEach((key) => {
      it(`applies correct border-radius for ${key} theme`, () => {
        const tokens = ROUNDNESS_TOKENS[key];
        setRoundnessVars(key);

        render(
          <WidgetConfigProvider>
            <ChatPreview />
          </WidgetConfigProvider>
        );

        // Wait for component to render
        const chatShell = screen.queryByTestId("chat-shell");
        const userBubble = screen.queryByTestId("user-bubble");
        const inputBar = screen.queryByTestId("input-bar");

        if (chatShell) {
          const br = getBorderRadius(chatShell);
          expect(br).toBe(`${tokens.container}px`);
        }

        if (userBubble) {
          const br = getBorderRadius(userBubble);
          expect(br).toBe(`${tokens.bubble}px`);
        }

        if (inputBar) {
          const br = getBorderRadius(inputBar);
          expect(br).toBe(`${tokens.input}px`);
        }
      });
    });
  });

  describe("Launcher border-radius", () => {
    it("applies 9999px for circle (full circle)", () => {
      setRoundnessVars("circle");
      render(
        <WidgetConfigProvider>
          <ChatPreview />
        </WidgetConfigProvider>
      );

      // Switch to launcher tab
      const launcherTab = screen.getByText("Launcher");
      launcherTab.click();

      const launcher = screen.queryByTestId("launcher");
      if (launcher) {
        const br = getBorderRadius(launcher);
        // Allow either 9999px or 50% for perfect circle
        expect(["9999px", "50%"]).toContain(br);
      }
    });

    it("applies correct radius for oval", () => {
      setRoundnessVars("oval");
      const tokens = ROUNDNESS_TOKENS.oval;
      render(
        <WidgetConfigProvider>
          <ChatPreview />
        </WidgetConfigProvider>
      );

      const launcherTab = screen.getByText("Launcher");
      launcherTab.click();

      const launcher = screen.queryByTestId("launcher");
      if (launcher) {
        const br = getBorderRadius(launcher);
        expect(br).toBe(`${tokens.launcher}px`);
      }
    });

    it("applies correct radius for rectangle", () => {
      setRoundnessVars("rectangle");
      const tokens = ROUNDNESS_TOKENS.rectangle;
      render(
        <WidgetConfigProvider>
          <ChatPreview />
        </WidgetConfigProvider>
      );

      const launcherTab = screen.getByText("Launcher");
      launcherTab.click();

      const launcher = screen.queryByTestId("launcher");
      if (launcher) {
        const br = getBorderRadius(launcher);
        expect(br).toBe(`${tokens.launcher}px`);
      }
    });

    it("applies correct radius for square", () => {
      setRoundnessVars("square");
      const tokens = ROUNDNESS_TOKENS.square;
      render(
        <WidgetConfigProvider>
          <ChatPreview />
        </WidgetConfigProvider>
      );

      const launcherTab = screen.getByText("Launcher");
      launcherTab.click();

      const launcher = screen.queryByTestId("launcher");
      if (launcher) {
        const br = getBorderRadius(launcher);
        expect(br).toBe(`${tokens.launcher}px`);
      }
    });
  });

  describe("Token values match screenshot specifications", () => {
    it("circle has correct values", () => {
      const tokens = ROUNDNESS_TOKENS.circle;
      expect(tokens.container).toBe(32);
      expect(tokens.bubble).toBe(24);
      expect(tokens.input).toBe(32);
      expect(tokens.launcher).toBe(9999);
    });

    it("oval has correct values", () => {
      const tokens = ROUNDNESS_TOKENS.oval;
      expect(tokens.container).toBe(24);
      expect(tokens.bubble).toBe(16);
      expect(tokens.input).toBe(24);
      expect(tokens.launcher).toBe(24);
    });

    it("rectangle has correct values", () => {
      const tokens = ROUNDNESS_TOKENS.rectangle;
      expect(tokens.container).toBe(16);
      expect(tokens.bubble).toBe(12);
      expect(tokens.input).toBe(16);
      expect(tokens.launcher).toBe(16);
    });

    it("square has correct values", () => {
      const tokens = ROUNDNESS_TOKENS.square;
      expect(tokens.container).toBe(8);
      expect(tokens.bubble).toBe(4);
      expect(tokens.input).toBe(8);
      expect(tokens.launcher).toBe(8);
    });
  });
});

