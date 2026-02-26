export type Theme = "vibrant" | "minimalist" | "glass";
export type Roundness = "circle" | "oval" | "rectangle" | "square";

export type WidgetConfig = {
  theme: Theme;
  brandColor: string;          // hex (#RRGGBB) from a color picker
  roundness: Roundness;
  fontFamily: string;          // e.g., Inter
  fontSize: "sm" | "md" | "lg";
  launcher: {
    color: string;             // can default to brandColor
    icon: "animatedWave" | "chatIcon" | "custom";
    customIconURL?: string;
    visibility: "prominent" | "hybrid" | "minimal";
    position: "bottom-right" | "bottom-left";
    title: string;             // launcher title text
    subtitle?: string;        // launcher subtitle text (optional)
  };
  voice: {
    enabled: boolean;
  };
  header: {
    title: string;
    subtitle?: string;
    iconURL?: string;
  };
};

export type ThemeTokens = {
  headerBg: string;
  userBubbleBg: string;
  inputBorder: string;
  sendBtnBg: string;
  textOnHeader: string;
  textOnUserBubble: string;
  textOnSendBtn: string;
  panelChrome: string;
  borderRadius: string;
};

