import { useState, useEffect, useRef } from "react";
import { useInactivityTimer } from "../hooks/useInactivityTimer";
import { pickTextColor } from "../theme/color";
import "../styles/launcher.css";

export type LauncherIcon = "animatedWave" | "chatIcon" | "custom";
export type LauncherVisibility = "prominent" | "hybrid" | "minimal";

export interface LauncherProps {
  icon?: LauncherIcon;
  customIconUrl?: string; // used when icon === "custom"
  visibility?: LauncherVisibility;
  title?: string; // shown only in pill state
  subtitle?: string; // shown only in pill state (optional)
  position?: "bottom-right" | "bottom-left";
  onClick?: () => void;
  brandColor?: string; // for color binding
}

export function Launcher({
  icon = "animatedWave",
  customIconUrl,
  visibility = "prominent",
  title = "Ask anything",
  subtitle,
  position = "bottom-right",
  onClick,
  brandColor = "#205AE3",
}: LauncherProps) {
  const [mode, setMode] = useState<"pill" | "circle">(
    visibility === "minimal" ? "circle" : "pill"
  );
  const [isPaused, setIsPaused] = useState(false);
  const [currentGifIndex, setCurrentGifIndex] = useState(0);
  const launcherRef = useRef<HTMLButtonElement>(null);
  
  const gifSequence = [
    "/icons/animate-1.gif",
    "/icons/animate-2.gif",
    "/icons/animate-3.gif",
  ];

  // Handle visibility changes
  useEffect(() => {
    if (visibility === "prominent") {
      setMode("pill");
    } else if (visibility === "minimal") {
      setMode("circle");
    }
  }, [visibility]);

  // Handle hybrid timer
  const handleInactivity = () => {
    if (visibility === "hybrid" && mode === "pill") {
      setMode("circle");
    }
  };

  const { reset: resetTimer } = useInactivityTimer(
    visibility === "hybrid" && mode === "pill" ? 5000 : null,
    handleInactivity,
    {
      resetOn: ["mousemove", "focusin", "scroll", "keydown"],
      target: window,
    }
  );

  // Reset to pill on launcher interaction (for hybrid)
  const handleMouseEnter = () => {
    if (visibility === "hybrid") {
      if (mode === "circle") {
        setMode("pill");
      }
      resetTimer(); // Reset the timer
    }
  };

  const handleFocus = () => {
    if (visibility === "hybrid") {
      if (mode === "circle") {
        setMode("pill");
      }
      resetTimer(); // Reset the timer
    }
  };

  const handleMouseMove = () => {
    if (visibility === "hybrid" && mode === "pill") {
      resetTimer(); // Reset timer on mouse move over launcher
    }
  };

  // Cycle through GIFs for animated wave
  useEffect(() => {
    if (icon === "animatedWave" && !isPaused) {
      const interval = setInterval(() => {
        setCurrentGifIndex((prev) => (prev + 1) % gifSequence.length);
      }, 1000); // Change GIF every second
      return () => clearInterval(interval);
    }
  }, [icon, isPaused, gifSequence.length]);

  // Pause animation when document is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsPaused(document.hidden);
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const isPill = mode === "pill";

  // Calculate text color for WCAG AA contrast
  const textColor = pickTextColor(brandColor);

  const positionClasses =
    position === "bottom-right"
      ? "bottom-6 right-6"
      : "bottom-6 left-6";

  const renderIcon = () => {
    // Icon size: 56px (3.5rem) for both pill and circle states
    // All icons should fit within the 56x56 container
    const iconSize = "3.5rem"; // 56px for both states
    const iconContainerStyle = {
      width: iconSize,
      height: iconSize,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      // For pill state, wrap icon in brand-colored circle
      ...(isPill && {
        backgroundColor: brandColor,
        borderRadius: "50%",
      }),
    };
    
    // Determine icon filter based on brand color contrast
    // For pill state: icon is on brand color background, so use textColor
    // For circle state: icon is on brand color background, so use textColor
    const iconFilter = textColor === "#FFFFFF" 
      ? "brightness(0) invert(1)" 
      : textColor === "#000000" || textColor === "#25252A" || textColor === "#F9FAFB"
      ? "brightness(0) saturate(100%)"
      : "none";
    
    if (icon === "custom" && customIconUrl) {
      // Check if it's an SVG by file extension or content type
      const isSvg = customIconUrl.startsWith("data:image/svg+xml") || 
                    customIconUrl.endsWith(".svg") ||
                    customIconUrl.includes("<svg");
      
      return (
        <div style={iconContainerStyle}>
          <img
            src={customIconUrl}
            alt=""
            className="object-contain"
            aria-hidden="true"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              // Apply filter for SVG icons to adjust color based on contrast
              filter: isSvg ? iconFilter : "none",
            }}
          />
        </div>
      );
    }

    if (icon === "chatIcon") {
      return (
        <div style={iconContainerStyle}>
          <img
            src="/icons/message-circle-2.svg"
            alt=""
            className="object-contain"
            aria-hidden="true"
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              width: "auto",
              height: "auto",
              filter: iconFilter,
            }}
          />
        </div>
      );
    }

    // animatedWave (default) - cycle through GIFs
    return (
      <div style={iconContainerStyle}>
        <img
          src={gifSequence[currentGifIndex]}
          alt=""
          className="object-contain"
          aria-hidden="true"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width: "auto",
            height: "auto",
            filter: iconFilter,
          }}
        />
      </div>
    );
  };

  const ariaLabel = isPill
    ? `Open chat: ${title}`
    : "Open chat";

  return (
    <button
      ref={launcherRef}
      data-testid="launcher"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      className={`launcher-transition fixed ${positionClasses} z-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand,${brandColor})] ${
        isPill
          ? "inline-flex items-center"
          : "grid place-items-center"
      }`}
      style={{
        ["--brand" as any]: brandColor,
        ["--brand-on" as any]: textColor,
        // Pill state: 80% white background with #DEE5EB border
        ...(isPill && {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          border: "1px solid #DEE5EB",
          color: "#25252A", // Text color for pill state
          padding: "0.5rem 1.5rem 0.5rem 0.5rem",
          gap: "1rem",
          borderRadius: "6.25rem",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15), 0px 2px 4px rgba(0, 0, 0, 0.1)",
        }),
        // Circle state: brand color background
        ...(!isPill && {
          backgroundColor: brandColor,
          color: textColor,
          border: `1px solid ${brandColor}`,
          borderRadius: "var(--r-launcher)",
          width: "56px",
          height: "56px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.15), 0px 2px 4px rgba(0, 0, 0, 0.1)",
        }),
      }}
      aria-label={ariaLabel}
      type="button"
    >
      {renderIcon()}
      {isPill && (
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold leading-[22px] whitespace-nowrap">
            {title}
          </span>
          {subtitle && (
            <span className="text-xs leading-[16px] opacity-80 whitespace-nowrap">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </button>
  );
}

