import { createContext, useContext, useState, ReactNode } from "react";
import type { WidgetConfig } from "../types";

const defaultConfig: WidgetConfig = {
  theme: "vibrant",
  brandColor: "#205AE3",
  roundness: "oval",
  fontFamily: "Inter, sans-serif",
  fontSize: "md",
  launcher: {
    color: "#205AE3",
    icon: "animatedWave",
    visibility: "prominent",
    position: "bottom-right",
    title: "Ask anything",
    subtitle: "Signal, your AI Agent",
  },
  voice: {
    enabled: true,
  },
  header: {
    title: "Chat with Signal",
    subtitle: undefined,
    iconURL: undefined,
  },
};

const WidgetConfigContext = createContext<{
  config: WidgetConfig;
  updateConfig: (updates: Partial<WidgetConfig>) => void;
} | null>(null);

export function WidgetConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<WidgetConfig>(defaultConfig);

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    setConfig((prev) => ({ ...prev, ...updates }));
  };

  return (
    <WidgetConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </WidgetConfigContext.Provider>
  );
}

export function useWidgetConfig() {
  const context = useContext(WidgetConfigContext);
  if (!context) {
    throw new Error("useWidgetConfig must be used within WidgetConfigProvider");
  }
  return context;
}

