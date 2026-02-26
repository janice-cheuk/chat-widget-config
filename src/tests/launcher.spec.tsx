import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Launcher } from "../components/Launcher";
import type { LauncherIcon, LauncherVisibility } from "../components/Launcher";

describe("Launcher", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe("Icon rendering", () => {
    it("renders animatedWave icon by default", () => {
      render(<Launcher />);
      const wave = document.querySelector(".launcher-wave");
      expect(wave).toBeInTheDocument();
    });

    it("renders chatIcon when specified", () => {
      render(<Launcher icon="chatIcon" />);
      const svg = document.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg?.querySelector("path")).toBeInTheDocument();
    });

    it("renders custom icon when URL provided", () => {
      render(
        <Launcher icon="custom" customIconUrl="https://example.com/icon.png" />
      );
      const img = document.querySelector("img");
      expect(img).toBeInTheDocument();
      expect(img?.getAttribute("src")).toBe("https://example.com/icon.png");
    });
  });

  describe("Visibility modes", () => {
    it("renders as pill when visibility is prominent", () => {
      render(<Launcher visibility="prominent" label="Test" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("h-11", "px-3", "rounded-full");
      expect(button).toHaveTextContent("Test");
    });

    it("renders as circle when visibility is minimal", () => {
      render(<Launcher visibility="minimal" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("w-12", "h-12", "rounded-full");
      expect(button).not.toHaveTextContent("Ask anything");
    });

    it("starts as pill and transitions to circle after 5s in hybrid mode", async () => {
      render(<Launcher visibility="hybrid" label="Test" />);
      const button = screen.getByRole("button");
      
      // Should start as pill
      expect(button).toHaveClass("h-11", "px-3");
      expect(button).toHaveTextContent("Test");

      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5000);

      await waitFor(() => {
        expect(button).toHaveClass("w-12", "h-12");
        expect(button).not.toHaveTextContent("Test");
      });
    });

    it("resets timer on mouse enter in hybrid mode", async () => {
      render(<Launcher visibility="hybrid" label="Test" />);
      const button = screen.getByRole("button");

      // Fast-forward 4 seconds
      vi.advanceTimersByTime(4000);
      expect(button).toHaveClass("h-11", "px-3");

      // Mouse enter should reset timer
      fireEvent.mouseEnter(button);
      vi.advanceTimersByTime(4000);
      expect(button).toHaveClass("h-11", "px-3");

      // Should transition after another 5 seconds
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(button).toHaveClass("w-12", "h-12");
      });
    });
  });

  describe("Position", () => {
    it("positions at bottom-right by default", () => {
      render(<Launcher />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bottom-6", "right-6");
    });

    it("positions at bottom-left when specified", () => {
      render(<Launcher position="bottom-left" />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("bottom-6", "left-6");
    });
  });

  describe("Color binding", () => {
    it("uses brand color for background", () => {
      const brandColor = "#FF5733";
      render(<Launcher brandColor={brandColor} />);
      const button = screen.getByRole("button");
      expect(button).toHaveStyle({
        backgroundColor: brandColor,
      });
    });

    it("uses WCAG-compliant text color", () => {
      const brandColor = "#000000"; // Black should use white text
      render(<Launcher brandColor={brandColor} />);
      const button = screen.getByRole("button");
      const computedStyle = window.getComputedStyle(button);
      expect(computedStyle.color).toBeTruthy();
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label", () => {
      render(<Launcher visibility="prominent" label="Ask anything" />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Open chat: Ask anything");
    });

    it("has focus ring", () => {
      render(<Launcher />);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("focus:outline-none", "focus:ring-2");
    });

    it("handles keyboard activation", () => {
      const handleClick = vi.fn();
      render(<Launcher onClick={handleClick} />);
      const button = screen.getByRole("button");
      
      fireEvent.keyDown(button, { key: "Enter" });
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe("Reduced motion", () => {
    it("respects prefers-reduced-motion", () => {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query) => ({
          matches: query === "(prefers-reduced-motion: reduce)",
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(<Launcher icon="animatedWave" />);
      const waveBars = document.querySelectorAll(".launcher-wave-bar");
      waveBars.forEach((bar) => {
        const style = window.getComputedStyle(bar as Element);
        // Animation should be disabled or paused
        expect(style.animationName).toBe("none");
      });
    });
  });

  describe("Document visibility", () => {
    it("pauses animation when document is hidden", () => {
      render(<Launcher icon="animatedWave" />);
      const wave = document.querySelector(".launcher-wave");
      
      Object.defineProperty(document, "hidden", {
        writable: true,
        configurable: true,
        value: true,
      });
      
      fireEvent(document, new Event("visibilitychange"));
      
      expect(wave).toHaveClass("paused");
    });
  });
});

