/**
 * Reusable chat window UI (header, body, input).
 * Used by ChatPreview and by LiveWidget on the test-live page.
 */

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useWidgetConfig } from "../context/WidgetConfigContext";
import { deriveThemeTokens } from "../theme/deriveTokens";
import { buildWidgetColorTokens, pickTextColor } from "../theme/widgetColors";
import { FormPreview } from "./FormPreview";

export interface ChatWidgetShellProps {
  onMinimize?: () => void;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
  /** When true, show the form as one of the message bubbles (same theme as chat). */
  showFormAsMessage?: boolean;
}

export function ChatWidgetShell({
  onMinimize,
  onClose,
  className = "",
  style = {},
  showFormAsMessage = false,
}: ChatWidgetShellProps) {
  const { config } = useWidgetConfig();
  const tokens = deriveThemeTokens(config);
  const widgetColors = buildWidgetColorTokens(config.brandColor, "#FFFFFF");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [sourcesPopoverOpen, setSourcesPopoverOpen] = useState(false);
  const [sourcesModalAnchorRect, setSourcesModalAnchorRect] = useState<DOMRect | null>(null);
  const sourcesPopoverRef = useRef<HTMLDivElement>(null);
  const sourcesModalRef = useRef<HTMLDivElement>(null);

  const inlineSources = [
    { domain: "cresta.com", title: "Blog: Cresta Expands Global Reach with Real-Time Voice Translation and Multilingual AI Across the Platform", description: "This blog post provides information about Cresta's internationalization approach.", url: "https://cresta.com/blog/cresta-expands-glo" },
    { domain: "sourcesite.com", title: "Scaling AI Voice Agents press release", description: "Empathetic automation at scale.", url: "#" },
    { domain: "sourcesite.com", title: "Voice AI Tipping Point webinar", description: "Handles complex conversations.", url: "#" },
  ];
  const [hoveredInlineSourceIndex, setHoveredInlineSourceIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!sourcesPopoverOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sourcesPopoverRef.current?.contains(target) || sourcesModalRef.current?.contains(target)) return;
      setSourcesPopoverOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sourcesPopoverOpen]);

  useLayoutEffect(() => {
    if (!sourcesPopoverOpen) {
      setSourcesModalAnchorRect(null);
      return;
    }
    const rect = sourcesPopoverRef.current?.getBoundingClientRect() ?? null;
    setSourcesModalAnchorRect(rect);
  }, [sourcesPopoverOpen]);

  const headerBgForContrast =
    config.theme === "glass" ? "rgba(255, 255, 255, 0.8)" : tokens.headerBg;
  const headerIconColor = pickTextColor(headerBgForContrast, "#FFFFFF", "#000000", 4.5);

  return (
    <>
    <div
      data-testid="chat-shell"
      className={`shadow-xl flex flex-col overflow-hidden ${config.theme === "glass" ? "bg-transparent" : "bg-white"} ${className}`}
      style={{
        width: "100%",
        minWidth: 320,
        maxWidth: 415,
        height: "100%",
        minHeight: 400,
        maxHeight: "100%",
        borderRadius: "var(--r-container)",
        ...(config.theme === "glass" && {
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }),
        ["--header-bg" as string]: tokens.headerBg,
        ["--user-bubble-bg" as string]: tokens.userBubbleBg,
        ["--input-border" as string]: tokens.inputBorder,
        ["--send-btn-bg" as string]: tokens.sendBtnBg,
        ["--text-on-header" as string]: tokens.textOnHeader,
        ["--text-on-user-bubble" as string]: tokens.textOnUserBubble,
        ["--text-on-send-btn" as string]: tokens.textOnSendBtn,
        ...style,
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between relative"
        style={{
          background: config.theme === "glass" ? "transparent" : "var(--header-bg)",
          color: "var(--text-on-header)",
          borderRadius: "var(--r-container) var(--r-container) 0 0",
          fontFamily: config.fontFamily,
        }}
      >
        <div className="relative z-10 flex items-center gap-2">
          {config.header.iconURL ? (
            <img
              src={config.header.iconURL}
              alt="Header icon"
              className="w-6 h-6 object-contain"
              style={{
                height: 24,
                width: 24,
                filter: headerIconColor === "#FFFFFF" ? "brightness(0) invert(1)" : "brightness(0) saturate(100%)",
              }}
            />
          ) : null}
          <div className="flex flex-col">
            <span className="font-medium" style={{ fontSize: 18, fontFamily: config.fontFamily }}>
              {config.header.title}
            </span>
            {config.header.subtitle ? (
              <span
                className="text-xs opacity-80"
                style={{
                  fontSize: config.fontSize === "sm" ? "0.75rem" : config.fontSize === "lg" ? "0.875rem" : "0.8125rem",
                  fontFamily: config.fontFamily,
                }}
              >
                {config.header.subtitle}
              </span>
            ) : null}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-2">
          <button type="button" className="w-4 h-4 flex items-center justify-center" onClick={onMinimize} aria-label="Minimize">
            <img src="/icons/minimize.svg" alt="Minimize" className="w-4 h-4" style={{ filter: headerIconColor === "#FFFFFF" ? "brightness(0) invert(1)" : "brightness(0) saturate(100%)" }} />
          </button>
          <button type="button" className="w-4 h-4 flex items-center justify-center" onClick={onClose ?? onMinimize} aria-label="Close">
            <img src="/icons/outlines.svg" alt="Close" className="w-4 h-4" style={{ filter: headerIconColor === "#FFFFFF" ? "brightness(0) invert(1)" : "brightness(0) saturate(100%)" }} />
          </button>
        </div>
      </div>

      {/* Chat Body */}
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ padding: "24px 24px 16px", fontFamily: config.fontFamily }}
      >
        <div className="text-xs text-[#898F98] text-center flex items-center justify-center gap-1" style={{ marginBottom: 16, fontFamily: config.fontFamily }}>
          <span>Powered by</span>
          <img src="/icons/CRESTA-logo 1.svg" alt="CRESTA" className="h-3 object-contain" />
        </div>

        {/* Greeting: bubble only, no action bar */}
        <div className="flex flex-col justify-start items-start" style={{ marginBottom: 16, maxWidth: "calc(100% - 64px)" }}>
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: config.theme === "glass" || config.theme === "minimalist" ? "transparent" : "#EBF0F5",
              color: "#25252A",
              borderRadius: "var(--r-bubble)",
              width: "100%",
            }}
          >
            <p style={{ fontSize: config.fontSize === "sm" ? "0.875rem" : config.fontSize === "lg" ? "1.125rem" : "1rem", fontFamily: config.fontFamily, margin: 0, lineHeight: 1.55 }}>
              Hello! I'm Signal, your Cresta AI Agent. How can I help you today?
            </p>
          </div>
        </div>

        <div className="flex justify-end items-start" style={{ marginBottom: 16 }}>
          <div
            data-testid="user-bubble"
            style={{
              padding: "12px 16px",
              backgroundColor: config.theme === "glass" ? "rgba(61, 61, 71, 0.8)" : "var(--user-bubble-bg)",
              color: "var(--text-on-user-bubble)",
              borderRadius: "var(--r-bubble)",
              maxWidth: "calc(100% - 64px)",
            }}
          >
            <p style={{ fontSize: config.fontSize === "sm" ? "0.875rem" : config.fontSize === "lg" ? "1.125rem" : "1rem", fontFamily: config.fontFamily }}>
              Is Cresta HIPAA compliant? We are in the healthcare industry.
            </p>
          </div>
        </div>

        {/* Agent message 2 with inline source pills + action bar */}
        <div className="flex flex-col justify-start items-start" style={{ marginBottom: 16, maxWidth: "calc(100% - 64px)" }}>
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: config.theme === "glass" || config.theme === "minimalist" ? "transparent" : "#EBF0F5",
              color: "#25252A",
              borderRadius: "var(--r-bubble)",
              width: "100%",
            }}
          >
            <p style={{ fontFamily: config.fontFamily, fontSize: config.fontSize === "sm" ? "0.875rem" : config.fontSize === "lg" ? "1.125rem" : "1rem", margin: 0, lineHeight: 1.55, marginBottom: 8 }}>
              Yes, Cresta is HIPAA compliant. We maintain strict security protocols and data encryption standards required for healthcare applications.
            </p>
            <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none", fontFamily: config.fontFamily, fontSize: config.fontSize === "sm" ? "0.875rem" : "1rem", lineHeight: 1.55, color: "#25252A" }}>
              {["Security overview", "Data encryption standards", "Healthcare security protocols"].map((text, idx) => (
                <li key={idx} style={{ marginBottom: idx < 2 ? 8 : 0, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
                  <span style={{ flexShrink: 0, width: 16, textAlign: "center" }} aria-hidden>•</span>
                  <span>{text}</span>
                  <span
                    onMouseEnter={() => setHoveredInlineSourceIndex(idx)}
                    onMouseLeave={() => setHoveredInlineSourceIndex(null)}
                    style={{
                      backgroundColor: hoveredInlineSourceIndex === idx ? "#25252A" : "#F8F9FA",
                      border: "1px solid #DEE5EB",
                      borderRadius: 8,
                      padding: "4px 6px",
                      fontFamily: config.fontFamily,
                      fontWeight: 500,
                      fontSize: 8,
                      color: hoveredInlineSourceIndex === idx ? "#FFFFFF" : "#8EA3AD",
                      lineHeight: 1,
                      flexShrink: 0,
                      cursor: "pointer",
                      position: "relative",
                    }}
                  >
                    {inlineSources[idx].domain}
                    {hoveredInlineSourceIndex === idx && (
                      <div
                        role="tooltip"
                        style={{
                          position: "absolute",
                          left: 0,
                          bottom: "100%",
                          marginBottom: 8,
                          width: 320,
                          padding: 16,
                          backgroundColor: "#F8F9FA",
                          border: "1px solid #DEE5EB",
                          borderRadius: 16,
                          boxShadow: "0px 7px 7px 0px rgba(0,0,0,0.04), 0px 10px 15px 0px rgba(0,0,0,0.05), 0px 1px 3px 0px rgba(0,0,0,0.05)",
                          zIndex: 20,
                          pointerEvents: "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#5D666F", flexShrink: 0 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                          <span style={{ fontFamily: config.fontFamily, fontWeight: 500, fontSize: 10, color: "#5D666F", lineHeight: 1 }}>{inlineSources[idx].domain}</span>
                        </div>
                        <a href={inlineSources[idx].url} style={{ display: "block", fontFamily: config.fontFamily, fontWeight: 550, fontSize: 12, color: "#25252A", lineHeight: 1.55, textDecoration: "none", marginBottom: 4 }}>{inlineSources[idx].title}</a>
                        <p style={{ margin: 0, fontFamily: config.fontFamily, fontWeight: 425, fontSize: 12, color: "#25252A", lineHeight: 1.55 }}>{inlineSources[idx].description}<span style={{ fontWeight: 550 }}>..</span></p>
                      </div>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {/* Action bar: Copy, Thumbs up, Thumbs down, Sources (modal above button, #F8F9FA) */}
          <div className="flex items-center" style={{ gap: 12, paddingLeft: 8, marginTop: 8 }}>
            <div className="flex items-center" style={{ gap: 8 }}>
              <button type="button" aria-label="Copy" className="flex items-center justify-center" style={{ width: 16, height: 16, padding: 0, border: "none", background: "transparent", color: "#5D666F", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              </button>
              <button type="button" aria-label="Thumbs up" className="flex items-center justify-center" style={{ width: 16, height: 16, padding: 0, border: "none", background: "transparent", color: "#5D666F", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
              </button>
              <button type="button" aria-label="Thumbs down" className="flex items-center justify-center" style={{ width: 16, height: 16, padding: 0, border: "none", background: "transparent", color: "#5D666F", cursor: "pointer" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" /></svg>
              </button>
            </div>
            <div ref={sourcesPopoverRef} style={{ position: "relative" }}>
              <button
                type="button"
                aria-label="Sources"
                aria-expanded={sourcesPopoverOpen}
                onClick={() => setSourcesPopoverOpen((v) => !v)}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: sourcesPopoverOpen ? "1px solid #205AE3" : "1px solid #DEE5EB",
                  borderRadius: 8,
                  padding: "6px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  fontFamily: config.fontFamily,
                  fontWeight: 500,
                  fontSize: 11,
                  color: "#25252A",
                  lineHeight: 1,
                }}
              >
                Sources
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
              </button>
            </div>
          </div>
        </div>

        {showFormAsMessage ? (
          <div className="flex justify-start items-stretch" style={{ marginBottom: 16, width: "100%", minWidth: 0 }}>
            <div
              style={{
                width: "100%",
                maxWidth: "calc(100% - 64px)",
                minWidth: 0,
                padding: "12px 16px",
                backgroundColor: config.theme === "glass" || config.theme === "minimalist" ? "transparent" : "#EBF0F5",
                color: "#25252A",
                borderRadius: "var(--r-bubble)",
                boxSizing: "border-box",
              }}
            >
              <FormPreview embedded brandColor={config.brandColor} />
            </div>
          </div>
        ) : null}
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: 16,
          borderTop: config.theme === "glass" ? "1px solid rgba(222, 229, 235, 0.5)" : "1px solid rgb(222, 229, 235)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            data-testid="input-bar"
            className="flex items-center gap-2 border flex-1"
            style={{
              borderColor: isInputFocused ? widgetColors.inputFocusOutline : widgetColors.inputStroke,
              backgroundColor: "#FFFFFF",
              borderRadius: "var(--r-input)",
              padding: "8px 16px",
              ...(config.theme === "glass" && { backgroundColor: "rgba(255, 255, 255, 0.8)" }),
            }}
          >
            <input
              type="text"
              placeholder="Ask a question"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              className="flex-1 outline-none bg-transparent"
              style={{
                color: widgetColors.inputPlaceholder,
                fontSize: config.fontSize === "sm" ? "0.875rem" : config.fontSize === "lg" ? "1.125rem" : "1rem",
                fontFamily: config.fontFamily,
              }}
            />
            <button
              type="button"
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                backgroundColor: inputValue.trim().length > 0 ? widgetColors.sendBgActive : widgetColors.sendBg,
                borderRadius: "var(--r-input)",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.89453 0.454221C5.37393 -0.0250892 6.08787 -0.124564 6.66602 0.153439V1.93762L6.66406 1.93567V11.9728H5.31445V1.9425L0.955078 6.30285L0 5.34778L4.89453 0.454221ZM11.9854 5.34778L11.5088 5.82531L11.0312 6.30285L8.01562 3.28723V1.37805L11.9854 5.34778Z" fill={inputValue.trim().length > 0 ? widgetColors.sendIconActive : widgetColors.sendIcon} />
              </svg>
            </button>
          </div>
          {config.voice.enabled && (
            <button type="button" className="flex items-center justify-center" style={{ width: 32, height: 32, backgroundColor: config.theme === "glass" ? "#000000" : widgetColors.callBgActive, borderRadius: "var(--r-input)", flexShrink: 0 }} title="Voice call">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: "block", flexShrink: 0 }}>
                <path d="M8.76701 3.3508C9.12611 3.3508 9.4705 3.49345 9.72442 3.74738C9.97835 4.0013 10.121 4.34569 10.121 4.70479M8.76701 0.642822C9.84431 0.642822 10.8775 1.07078 11.6393 1.83255C12.401 2.59431 12.829 3.62749 12.829 4.70479M1.99706 1.31982H4.70504L6.05903 4.70479L4.36654 5.72029C5.09157 7.1904 6.2814 8.38023 7.75152 9.10526L8.76701 7.41277L12.152 8.76676V11.4747C12.152 11.8338 12.0093 12.1782 11.7554 12.4322C11.5015 12.6861 11.1571 12.8287 10.798 12.8287C8.15722 12.6683 5.66647 11.5468 3.79572 9.67608C1.92496 7.80533 0.803548 5.31459 0.643066 2.67381C0.643066 2.31471 0.785718 1.97031 1.03964 1.71639C1.29356 1.46247 1.63796 1.31982 1.99706 1.31982Z" stroke={config.theme === "glass" ? "#FFFFFF" : widgetColors.callTextActive} strokeWidth="1.28579" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
    {sourcesPopoverOpen &&
      sourcesModalAnchorRect &&
      createPortal(
        <div
          ref={sourcesModalRef}
          role="dialog"
          aria-label="Sources list"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "fixed",
            left: sourcesModalAnchorRect.left + sourcesModalAnchorRect.width / 2,
            transform: "translateX(-50%)",
            bottom: window.innerHeight - sourcesModalAnchorRect.top + 8,
            width: "min(360px, calc(100vw - 32px))",
            maxHeight: "min(400px, calc(100vh - 120px))",
            overflow: "auto",
            backgroundColor: "#F8F9FA",
            border: "1px solid #DEE5EB",
            borderRadius: 16,
            boxShadow: "0px 7px 7px 0px rgba(0,0,0,0.04), 0px 10px 15px 0px rgba(0,0,0,0.05), 0px 1px 3px 0px rgba(0,0,0,0.05)",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div style={{ fontFamily: config.fontFamily, fontWeight: 600, fontSize: 14, color: "#25252A", marginBottom: 16 }}>Sources</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {inlineSources.map((src, idx) => (
              <div
                key={idx}
                style={{
                  paddingBottom: idx < inlineSources.length - 1 ? 16 : 0,
                  borderBottom: idx < inlineSources.length - 1 ? "1px solid #F1F5FE" : undefined,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "#5D666F", flexShrink: 0 }}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                  <span style={{ fontWeight: 500, fontSize: 10, color: "#5D666F", lineHeight: 1 }}>{src.domain}</span>
                </div>
                <a href={src.url} style={{ display: "block", fontFamily: config.fontFamily, fontWeight: 550, fontSize: 12, color: "#25252A", lineHeight: 1.55, textDecoration: "none", marginBottom: 4 }}>{src.title}</a>
                <p style={{ margin: 0, fontFamily: config.fontFamily, fontWeight: 425, fontSize: 12, color: "#25252A", lineHeight: 1.55 }}>{src.description}<span style={{ fontWeight: 550 }}>..</span></p>
              </div>
            ))}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
