import type { WidgetConfig, ThemeTokens } from "../types";
import { pickTextColor } from "./color";
import { ROUNDNESS_TOKENS } from "./roundness";

export function deriveThemeTokens(config: WidgetConfig): ThemeTokens {
  const { theme, brandColor, roundness } = config;

  // Get roundness tokens
  const roundnessTokens = ROUNDNESS_TOKENS[roundness];

  // Neutral colors (always light mode)
  const neutralBg = "#FFFFFF";
  const neutralText = "#25252A";

  let headerBg: string;
  let userBubbleBg: string;
  let inputBorder: string;
  let sendBtnBg: string;

  // Theme-specific brand color bindings
  if (theme === "vibrant") {
    headerBg = brandColor;
    userBubbleBg = brandColor;
    inputBorder = brandColor;
    sendBtnBg = brandColor;
  } else if (theme === "minimalist") {
    headerBg = neutralBg;
    userBubbleBg = brandColor;
    inputBorder = brandColor;
    sendBtnBg = brandColor;
  } else {
    // glass
    headerBg = "rgba(255, 255, 255, 0.8)";
    userBubbleBg = "#3D3D47"; // Glass theme uses specific color for user bubbles
    inputBorder = brandColor;
    sendBtnBg = brandColor;
  }

  // Auto-pick text colors for WCAG AA contrast
  const textOnHeader =
    theme === "vibrant" ? pickTextColor(headerBg) : neutralText;
  const textOnUserBubble = pickTextColor(userBubbleBg);
  const textOnSendBtn = pickTextColor(sendBtnBg);

  return {
    headerBg,
    userBubbleBg,
    inputBorder,
    sendBtnBg,
    textOnHeader,
    textOnUserBubble,
    textOnSendBtn,
    panelChrome: neutralBg,
    borderRadius: `${roundnessTokens.container}px`, // Legacy support
  };
}

