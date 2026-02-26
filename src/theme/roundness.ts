export type RoundnessKey = "circle" | "oval" | "rectangle" | "square";

export const ROUNDNESS_TOKENS: Record<RoundnessKey, {
  container: number; // chat window outer corners
  bubble: number;    // visitor/user message bubble
  input: number;     // input bar
  launcher: number;  // launcher button
}> = {
  circle:    { container: 32, bubble: 24, input: 32, launcher: 9999 }, // full circle
  oval:      { container: 24, bubble: 16, input: 24, launcher: 24   },
  rectangle: { container: 16, bubble: 12, input: 16, launcher: 16   },
  square:    { container:  8, bubble:  4, input:  8, launcher:  8   },
};

/**
 * Sets CSS variables for roundness tokens on the document root
 */
export const setRoundnessVars = (t: RoundnessKey) => {
  const v = ROUNDNESS_TOKENS[t];
  const r = document.documentElement.style;
  r.setProperty("--r-container", `${v.container}px`);
  r.setProperty("--r-bubble", `${v.bubble}px`);
  r.setProperty("--r-input", `${v.input}px`);
  r.setProperty("--r-launcher", v.launcher === 9999 ? "9999px" : `${v.launcher}px`);
};

