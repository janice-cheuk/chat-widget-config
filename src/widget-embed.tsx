/**
 * Embeddable widget entry: load on any page via script tag.
 * Query params: configToken, apiBase (e.g. https://our-server.com)
 * Fetches config from apiBase/api/config-snapshots/:token and mounts the chat widget.
 */
import { createRoot } from "react-dom/client";
import { WidgetConfigProvider } from "./context/WidgetConfigContext";
import { ChatWidgetShell } from "./components/ChatWidgetShell";
import type { WidgetConfig } from "./types";
import { ROUNDNESS_TOKENS } from "./theme/roundness";

const DEFAULT_CONFIG: WidgetConfig = {
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
  voice: { enabled: true },
  header: { title: "Chat with Signal", subtitle: undefined, iconURL: undefined },
};

function getScriptParams(): { configToken: string | null; apiBase: string } {
  const script = document.currentScript as HTMLScriptElement | null;
  if (!script?.src) return { configToken: null, apiBase: "" };
  try {
    const url = new URL(script.src);
    const configToken = url.searchParams.get("configToken") || null;
    const apiBase = url.searchParams.get("apiBase") || url.origin;
    return { configToken, apiBase };
  } catch {
    return { configToken: null, apiBase: "" };
  }
}

function applyRoundnessVars(roundness: keyof typeof ROUNDNESS_TOKENS) {
  const v = ROUNDNESS_TOKENS[roundness];
  const r = document.documentElement.style;
  r.setProperty("--r-container", `${v.container}px`);
  r.setProperty("--r-bubble", `${v.bubble}px`);
  r.setProperty("--r-input", `${v.input}px`);
  r.setProperty("--r-launcher", v.launcher === 9999 ? "9999px" : `${v.launcher}px`);
}

function mount(config: WidgetConfig) {
  applyRoundnessVars(config.roundness);
  const rootId = "cresta-chat-widget-root";
  let el = document.getElementById(rootId);
  if (!el) {
    el = document.createElement("div");
    el.id = rootId;
    el.style.cssText =
      "position:fixed;bottom:16px;right:16px;width:415px;height:640px;min-width:320px;min-height:400px;max-width:calc(100vw - 32px);max-height:calc(100vh - 32px);z-index:2147483647;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);border-radius:var(--r-container, 24px);overflow:hidden;";
    document.body.appendChild(el);
  }
  const root = createRoot(el);
  root.render(
    <WidgetConfigProvider initialConfig={config}>
      <ChatWidgetShell />
    </WidgetConfigProvider>
  );
}

async function init() {
  const { configToken, apiBase } = getScriptParams();
  let config: WidgetConfig = DEFAULT_CONFIG;
  if (configToken && apiBase) {
    try {
      const res = await fetch(`${apiBase.replace(/\/$/, "")}/api/config-snapshots/${configToken}`);
      if (res.ok) config = await res.json();
    } catch (_) {}
  }
  mount(config);
}

init();
