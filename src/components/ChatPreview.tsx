import { useState, useEffect, useRef } from "react";
import { useWidgetConfig } from "../context/WidgetConfigContext";
import { deriveThemeTokens } from "../theme/deriveTokens";
import { buildWidgetColorTokens, pickTextColor } from "../theme/widgetColors";
import { setRoundnessVars } from "../theme/roundness";
import { Launcher } from "./Launcher";

export function ChatPreview() {
  const { config } = useWidgetConfig();
  const tokens = deriveThemeTokens(config);
  const widgetColors = buildWidgetColorTokens(config.brandColor, "#FFFFFF");
  const [activeTab, setActiveTab] = useState<"chat" | "launcher">("chat");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [inputValue, setInputValue] = useState("");
  
  // Calculate header icon color with WCAG compliance (≥4.5:1 contrast)
  // For glass theme, use the main container background since header is transparent
  const headerBgForContrast = config.theme === "glass" 
    ? "rgba(255, 255, 255, 0.8)"
    : tokens.headerBg;
  const headerIconColor = pickTextColor(headerBgForContrast, "#FFFFFF", "#000000", 4.5);
  
  // Initialize refs with current config values
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

  // Auto-switch to launcher tab when launcher config changes
  useEffect(() => {
    if (prevLauncherConfigRef.current !== launcherConfigKey) {
      setActiveTab("launcher");
      prevLauncherConfigRef.current = launcherConfigKey;
    }
  }, [launcherConfigKey]);

  // Auto-switch to chat tab when other configs change
  useEffect(() => {
    if (prevOtherConfigRef.current !== otherConfigKey) {
      setActiveTab("chat");
      prevOtherConfigRef.current = otherConfigKey;
    }
  }, [otherConfigKey]);

  // Set roundness CSS variables when roundness changes or on mount
  useEffect(() => {
    setRoundnessVars(config.roundness);
  }, [config.roundness]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#DEE5EB]">
        {/* Left: Tab Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("chat")}
            className={`text-sm font-semibold leading-[155%] transition-colors ${
              activeTab === "chat"
                ? "text-[#205AE3]"
                : "text-[#5D666F] hover:text-[#25252A]"
            }`}
          >
            Chat Widget
          </button>
          <button
            onClick={() => setActiveTab("launcher")}
            className={`text-sm font-semibold leading-[155%] transition-colors ${
              activeTab === "launcher"
                ? "text-[#205AE3]"
                : "text-[#5D666F] hover:text-[#25252A]"
            }`}
          >
            Launcher
          </button>
        </div>

      </div>

      {/* Preview Area */}
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
        {activeTab === "chat" && (
          <div
            data-testid="chat-shell"
            className={`w-[511px] shadow-xl flex flex-col overflow-hidden ${
              config.theme === "glass"
                ? "bg-transparent"
                : "bg-white"
            }`}
            style={{
              height: "87vh",
              maxHeight: "87%",
              borderRadius: "var(--r-container)",
              ...(config.theme === "glass" && {
                background: "rgba(255, 255, 255, 0.8)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
              }),
              ["--header-bg" as any]: tokens.headerBg,
              ["--user-bubble-bg" as any]: tokens.userBubbleBg,
              ["--input-border" as any]: tokens.inputBorder,
              ["--send-btn-bg" as any]: tokens.sendBtnBg,
              ["--text-on-header" as any]: tokens.textOnHeader,
              ["--text-on-user-bubble" as any]: tokens.textOnUserBubble,
              ["--text-on-send-btn" as any]: tokens.textOnSendBtn,
            }}
          >
          {/* Header */}
            <div
              className="px-4 py-3 flex items-center justify-between relative"
              style={{
                background:
                  config.theme === "glass"
                    ? "transparent"
                    : `var(--header-bg)`,
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
                color: `var(--text-on-header)`,
                borderRadius: `var(--r-container) var(--r-container) 0 0`,
                fontFamily: config.fontFamily,
              }}
            >
            <div className="relative z-10 flex items-center gap-2">
              {config.header.iconURL && (
                <img
                  src={config.header.iconURL}
                  alt="Header icon"
                  className="w-6 h-6 object-contain"
                  style={{ 
                    height: "24px", 
                    width: "24px",
                    filter: headerIconColor === "#FFFFFF"
                      ? "brightness(0) invert(1)"
                      : "brightness(0) saturate(100%)",
                  }}
                />
              )}
              <div className="flex flex-col">
                <span
                  className="font-medium"
                  style={{
                    fontSize: "18px",
                    fontFamily: config.fontFamily,
                  }}
                >
                  {config.header.title}
                </span>
                {config.header.subtitle && (
                  <span
                    className="text-xs opacity-80"
                    style={{
                      fontSize:
                        config.fontSize === "sm"
                          ? "0.75rem"
                          : config.fontSize === "lg"
                          ? "0.875rem"
                          : "0.8125rem",
                      fontFamily: config.fontFamily,
                    }}
                  >
                    {config.header.subtitle}
                  </span>
                )}
              </div>
            </div>
            <div className="relative z-10 flex items-center gap-2">
              <button className="w-4 h-4 flex items-center justify-center">
                <img
                  src="/icons/minimize.svg"
                  alt="Minimize"
                  className="w-4 h-4"
                  style={{
                    filter:
                      headerIconColor === "#FFFFFF"
                        ? "brightness(0) invert(1)"
                        : "brightness(0) saturate(100%)",
                  }}
                />
              </button>
              <button className="w-4 h-4 flex items-center justify-center">
                <img
                  src="/icons/outlines.svg"
                  alt="Close"
                  className="w-4 h-4"
                  style={{
                    filter:
                      headerIconColor === "#FFFFFF"
                        ? "brightness(0) invert(1)"
                        : "brightness(0) saturate(100%)",
                  }}
                />
              </button>
            </div>
          </div>

          {/* Chat Body - Following exact spacing specs */}
          <div
            className="flex-1 overflow-y-auto"
            style={{
              paddingTop: "24px",
              paddingLeft: "24px",
              paddingRight: "24px",
              paddingBottom: "16px",
              fontFamily: config.fontFamily,
            }}
          >
            {/* Powered by CRESTA */}
            <div
              className="text-xs text-[#898F98] text-center flex items-center justify-center gap-1"
              style={{ 
                marginBottom: "16px",
                fontFamily: config.fontFamily,
              }}
            >
              <span>Powered by</span>
              <img
                src="/icons/CRESTA-logo 1.svg"
                alt="CRESTA"
                className="h-3 object-contain"
              />
            </div>

            {/* Agent Message - Left aligned */}
            <div
              className="flex justify-start items-start"
              style={{ marginBottom: "16px" }}
            >
              <div
                style={{
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  backgroundColor:
                    config.theme === "glass" || config.theme === "minimalist"
                      ? "transparent"
                      : "#EBF0F5",
                  color: "#25252A",
                  borderRadius: "var(--r-bubble)",
                  marginLeft: "0",
                  maxWidth: "calc(100% - 64px)",
                }}
              >
                <p
                  style={{
                    fontSize:
                      config.fontSize === "sm"
                        ? "0.875rem"
                        : config.fontSize === "lg"
                        ? "1.125rem"
                        : "1rem",
                    fontFamily: config.fontFamily,
                  }}
                >
                  Hello! I'm Signal, your Cresta AI Agent. How can I help you
                  today?
                </p>
              </div>
            </div>

            {/* User Message - Right aligned with brand color */}
            <div
              className="flex justify-end items-start"
              style={{ marginBottom: "16px" }}
            >
              <div
                data-testid="user-bubble"
                style={{
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  backgroundColor: config.theme === "glass" 
                    ? "rgba(61, 61, 71, 0.8)"
                    : `var(--user-bubble-bg)`,
                  color: `var(--text-on-user-bubble)`,
                  borderRadius: "var(--r-bubble)",
                  marginRight: "0",
                  maxWidth: "calc(100% - 64px)",
                }}
              >
                <p
                  style={{
                    fontSize:
                      config.fontSize === "sm"
                        ? "0.875rem"
                        : config.fontSize === "lg"
                        ? "1.125rem"
                        : "1rem",
                    fontFamily: config.fontFamily,
                  }}
                >
                  Is Cresta HIPAA compliant? We are in the healthcare industry.
                </p>
              </div>
            </div>

            {/* Agent Response - Left aligned */}
            <div
              className="flex justify-start items-start"
              style={{ marginBottom: "16px" }}
            >
              <div
                style={{
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  backgroundColor:
                    config.theme === "glass" || config.theme === "minimalist"
                      ? "transparent"
                      : "#EBF0F5",
                  color: "#25252A",
                  borderRadius: "var(--r-bubble)",
                  marginLeft: "0",
                  maxWidth: "calc(100% - 64px)",
                }}
              >
                <p
                  style={{
                    fontSize:
                      config.fontSize === "sm"
                        ? "0.875rem"
                        : config.fontSize === "lg"
                        ? "1.125rem"
                        : "1rem",
                    fontFamily: config.fontFamily,
                  }}
                >
                  Yes, Cresta is HIPAA compliant. We maintain strict security
                  protocols and data encryption standards required for
                  healthcare applications.
                </p>
              </div>
            </div>

            {/* Sources - Left aligned, below agent message */}
            <div
              className="flex justify-start items-center"
              style={{
                marginLeft: "0",
                marginTop: "8px",
                marginBottom: "16px",
                gap: "4px",
              }}
            >
              <span
                className="text-xs"
                style={{
                  paddingLeft: "8px",
                  paddingRight: "8px",
                  paddingTop: "4px",
                  paddingBottom: "4px",
                  color: "#37383E",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #EDEDED",
                  borderRadius: "4px",
                }}
              >
                Sources:
              </span>
              <div className="flex gap-1">
                {[1, 2, 3].map((num) => (
                  <div
                    key={num}
                    className="flex items-center justify-center text-xs"
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor: config.theme === "glass" 
                        ? "rgba(61, 61, 71, 0.8)"
                        : widgetColors.sourceBg,
                      color: config.theme === "glass" ? "#FFFFFF" : widgetColors.sourceText,
                      borderRadius: "4px",
                      flexShrink: 0,
                    }}
                  >
                    {num}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Input Area - Padding: 16px left/right */}
          <div
              style={{
                paddingTop: "16px",
                paddingBottom: "16px",
                paddingLeft: "16px",
                paddingRight: "16px",
                borderTop: config.theme === "glass" 
                  ? "1px solid rgba(222, 229, 235, 0.5)"
                  : "1px solid #DEE5EB",
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
                  paddingLeft: "16px",
                  paddingRight: "16px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  ...(config.theme === "glass" && {
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                  }),
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
                    fontSize:
                      config.fontSize === "sm"
                        ? "0.875rem"
                        : config.fontSize === "lg"
                        ? "1.125rem"
                        : "1rem",
                    fontFamily: config.fontFamily,
                  }}
                />
                <button
                  className="flex items-center justify-center"
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: inputValue.trim().length > 0 ? widgetColors.sendBgActive : widgetColors.sendBg,
                    borderRadius: "var(--r-input)",
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.89453 0.454221C5.37393 -0.0250892 6.08787 -0.124564 6.66602 0.153439V1.93762L6.66406 1.93567V11.9728H5.31445V1.9425L0.955078 6.30285L0 5.34778L4.89453 0.454221ZM11.9854 5.34778L11.5088 5.82531L11.0312 6.30285L8.01562 3.28723V1.37805L11.9854 5.34778Z"
                      fill={inputValue.trim().length > 0 ? widgetColors.sendIconActive : widgetColors.sendIcon}
                    />
                  </svg>
                </button>
              </div>
              {config.voice.enabled && (
                <button
                  className="flex items-center justify-center"
                  style={{
                    width: "32px",
                    height: "32px",
                    backgroundColor: config.theme === "glass" 
                      ? "#000000"
                      : widgetColors.callBgActive,
                    borderRadius: "var(--r-input)",
                    flexShrink: 0,
                  }}
                  title="Voice call"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{
                      display: "block",
                      flexShrink: 0,
                    }}
                  >
                    <path
                      d="M8.76701 3.3508C9.12611 3.3508 9.4705 3.49345 9.72442 3.74738C9.97835 4.0013 10.121 4.34569 10.121 4.70479M8.76701 0.642822C9.84431 0.642822 10.8775 1.07078 11.6393 1.83255C12.401 2.59431 12.829 3.62749 12.829 4.70479M1.99706 1.31982H4.70504L6.05903 4.70479L4.36654 5.72029C5.09157 7.1904 6.2814 8.38023 7.75152 9.10526L8.76701 7.41277L12.152 8.76676V11.4747C12.152 11.8338 12.0093 12.1782 11.7554 12.4322C11.5015 12.6861 11.1571 12.8287 10.798 12.8287C8.15722 12.6683 5.66647 11.5468 3.79572 9.67608C1.92496 7.80533 0.803548 5.31459 0.643066 2.67381C0.643066 2.31471 0.785718 1.97031 1.03964 1.71639C1.29356 1.46247 1.63796 1.31982 1.99706 1.31982Z"
                      stroke={config.theme === "glass" ? "#FFFFFF" : widgetColors.callTextActive}
                      strokeWidth="1.28579"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Wallpaper Options - Floating at bottom center */}
        {activeTab === "chat" && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-sm border border-[#DEE5EB]">
            <span className="text-xs text-[#5D666F]">Wallpaper:</span>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 flex items-center justify-center rounded border border-[#DEE5EB] bg-white hover:bg-gray-50 transition-colors">
                <img
                  src="/icons/background.svg"
                  alt="Pattern"
                  className="w-4 h-4"
                />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-[#DEE5EB] bg-white hover:bg-gray-50 transition-colors">
                <img
                  src="/icons/photo.svg"
                  alt="Photo"
                  className="w-4 h-4"
                />
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded border border-[#DEE5EB] bg-white hover:bg-gray-50 transition-colors">
                <img
                  src="/icons/upload.svg"
                  alt="Upload"
                  className="w-4 h-4"
                />
              </button>
            </div>
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


