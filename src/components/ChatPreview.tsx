import { useState, useEffect, useRef } from "react";
import { useWidgetConfig } from "../context/WidgetConfigContext";
import { setRoundnessVars } from "../theme/roundness";
import { Launcher } from "./Launcher";
import { ChatWidgetShell } from "./ChatWidgetShell";

type PreviewTab = "chat" | "launcher" | "form" | "voice";

// Icons matching Figma Preview Options (node 442:14540) — 14px for tabs, 16px for header buttons
const IconMessages = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
);
const IconRocket = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" /><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" /><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" /><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" /></svg>
);
const IconClipboardList = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>
);
const IconMicrophone = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
);
const IconPlay = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden><polygon points="5 3 19 12 5 21 5 3" /></svg>
);
const IconCode = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
);

export function ChatPreview() {
  const { config } = useWidgetConfig();
  const [activeTab, setActiveTab] = useState<PreviewTab>("chat");
  
  const launcherConfigKey = [
    config.launcher.color,
    config.launcher.icon,
    config.launcher.customIconURL,
    config.launcher.visibility,
    config.launcher.position,
  ].join("|");
  
  const otherConfigKey = [
    config.theme,
    config.brandColor,
    config.roundness,
    config.fontFamily,
    config.fontSize,
    config.voice.enabled,
    config.header.title,
    config.header.subtitle,
    config.header.iconURL,
  ].join("|");
  
  const prevLauncherConfigRef = useRef<string>(launcherConfigKey);
  const prevOtherConfigRef = useRef<string>(otherConfigKey);

  useEffect(() => {
    if (prevLauncherConfigRef.current !== launcherConfigKey) {
      setActiveTab("launcher");
      prevLauncherConfigRef.current = launcherConfigKey;
    }
  }, [launcherConfigKey]);

  useEffect(() => {
    if (prevOtherConfigRef.current !== otherConfigKey) {
      setActiveTab("chat");
      prevOtherConfigRef.current = otherConfigKey;
    }
  }, [otherConfigKey]);

  useEffect(() => {
    setRoundnessVars(config.roundness);
  }, [config.roundness]);

  // Placeholder handlers — wire functionality later
  const onTestLive = () => { /* placeholder */ };
  const onEmbedCode = () => { /* placeholder */ };

  return (
    <div className="flex flex-col h-full w-full bg-white min-w-0">
      {/* Preview Options — Figma 442:14540 (node 39:14885) */}
      <div
        className="flex flex-col w-full shrink-0 border-b border-solid"
        style={{
          borderColor: "#DEE5EB",
          backgroundColor: "#F1F5FE",
          paddingLeft: 16,
          paddingRight: 8,
          paddingTop: 12,
          gap: 10,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        {/* Heading row: title + Test Live + Embed Code */}
        <div className="flex items-center justify-between w-full" style={{ padding: 2 }}>
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 550,
                fontSize: 16,
                lineHeight: 1.55,
                color: "#25252A",
              }}
            >
              Chat Widget Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onTestLive}
              className="flex items-center justify-center gap-2 rounded cursor-pointer border-none bg-transparent hover:opacity-90"
              style={{
                height: 26,
                paddingLeft: 8,
                paddingRight: 8,
                fontFamily: "Inter, sans-serif",
                fontWeight: 550,
                fontSize: 14,
                lineHeight: 1.55,
                color: "#205AE3",
              }}
            >
              <IconPlay style={{ color: "#205AE3", flexShrink: 0 }} />
              <span>Test Live</span>
            </button>
            <button
              type="button"
              onClick={onEmbedCode}
              className="flex items-center justify-center gap-2 rounded cursor-pointer border hover:bg-gray-50"
              style={{
                height: 26,
                paddingLeft: 8,
                paddingRight: 8,
                backgroundColor: "#FFFFFF",
                borderColor: "#DEE5EB",
                fontFamily: "Inter, sans-serif",
                fontWeight: 550,
                fontSize: 14,
                lineHeight: 1.55,
                color: "#25252A",
              }}
            >
              <IconCode style={{ color: "#25252A", flexShrink: 0 }} />
              <span>Embed Code</span>
            </button>
          </div>
        </div>
        {/* Tab group: Chat Widget, Launcher, Form, Voice */}
        <div
          className="flex items-start w-full border-b border-solid"
          style={{
            borderColor: "#DEE5EB",
            gap: 16,
            height: 34,
            paddingRight: 8,
            paddingTop: 4,
          }}
        >
          {[
            { id: "chat" as const, label: "Chat Widget", Icon: IconMessages },
            { id: "launcher" as const, label: "Launcher", Icon: IconRocket },
            { id: "form" as const, label: "Form", Icon: IconClipboardList },
            { id: "voice" as const, label: "Voice", Icon: IconMicrophone },
          ].map(({ id, label, Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className="flex items-center gap-1.5 cursor-pointer border-0 bg-transparent hover:opacity-90"
                style={{
                  height: 30,
                  paddingLeft: 0,
                  paddingRight: 0,
                  paddingTop: 6,
                  paddingBottom: 6,
                  borderBottom: isActive ? "1.5px solid #205AE3" : "1.5px solid transparent",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 550,
                  fontSize: 12,
                  lineHeight: 1.55,
                  color: isActive ? "#205AE3" : "#5D666F",
                }}
              >
                <Icon
                  style={{
                    width: 14,
                    height: 14,
                    flexShrink: 0,
                    color: isActive ? "#205AE3" : "#5D666F",
                  }}
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Area — no wallpaper */}
      <div 
        className="flex-1 flex items-center justify-center p-8 relative"
        style={{
          // Use image wallpaper for glass theme, otherwise gray-50
          ...(config.theme === "glass" ? {
            backgroundImage: "url('/Glass-bg.png')",
            backgroundSize: "auto 100%",
            backgroundPosition: "left center",
            backgroundRepeat: "no-repeat",
            backgroundColor: "#000000", // Fallback color
          } : {
            backgroundColor: "#F9FAFB", // gray-50 equivalent
          }),
        }}
      >
        {(activeTab === "chat" || activeTab === "form") && (
          <div
            style={{
              width: 415,
              height: 640,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              flexShrink: 0,
            }}
          >
            <ChatWidgetShell showFormAsMessage={activeTab === "form"} />
          </div>
        )}
        {activeTab === "voice" && (
          <div className="flex items-center justify-center w-full h-full text-[#5D666F] text-sm">
            Voice preview (placeholder)
          </div>
        )}

        {activeTab === "launcher" && (
          <div className="w-full h-full relative">
            {/* Launcher Preview */}
            <Launcher
              icon={config.launcher.icon}
              customIconUrl={config.launcher.customIconURL}
              visibility={config.launcher.visibility}
              position={config.launcher.position}
              title={config.launcher.title}
              subtitle={config.launcher.subtitle}
              brandColor={config.launcher.color}
              onClick={() => {
                // Handle launcher click - could open chat widget
                console.log("Launcher clicked");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}


