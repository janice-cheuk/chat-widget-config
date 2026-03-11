import React, { useState } from "react";
import { useWidgetConfig } from "../context/WidgetConfigContext";
import type { Theme, Roundness } from "../types";
import { LauncherControls } from "./controls/LauncherControls";
import { ImageCropModal } from "./ImageCropModal";

export function ConfigPanel() {
  const { config, updateConfig } = useWidgetConfig();
  const [expandedSections, setExpandedSections] = useState({
    style: true,
    launcher: true,
    voice: true,
    header: true,
  });
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [cropType, setCropType] = useState<"header" | "launcher">("header");

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleImageUpload = (
    file: File,
    type: "header" | "launcher"
  ) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setCropImageSrc(dataUrl);
      setCropType(type);
      setCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = (croppedImageDataUrl: string) => {
    if (cropType === "header") {
      updateConfig({
        header: {
          ...config.header,
          iconURL: croppedImageDataUrl,
        },
      });
    } else {
      updateConfig({
        launcher: {
          ...config.launcher,
          customIconURL: croppedImageDataUrl,
        },
      });
    }
    setCropModalOpen(false);
    setCropImageSrc("");
  };

  return (
    <div
      className="config-panel flex flex-col items-start w-full min-h-full flex-shrink-0 overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "#F8F9FA",
        padding: 12,
        gap: 24,
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Style Section — Figma 996:25324 accordion */}
      <div className="w-full flex flex-col">
        <div
          className="flex items-center justify-between cursor-pointer border-b border-solid flex-shrink-0 w-full"
          style={{
            height: 69,
            paddingLeft: 8,
            paddingRight: 8,
            paddingTop: 12,
            paddingBottom: 12,
            borderColor: "#DEE5EB",
          }}
          onClick={() => toggleSection("style")}
        >
          <div className="flex items-center gap-2">
            <div className="w-[18px] h-[18px] flex items-center justify-center">
              <img src="/icons/palette.svg" alt="Palette" className="w-[18px] h-[18px]" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 550, lineHeight: 1.55, color: "#25252A" }}>
              Style
            </h2>
          </div>
          <svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-transform ${expandedSections.style ? "rotate-180" : ""}`}
          >
            <path d="M6 9L12 15L18 9" stroke="#25252A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {expandedSections.style && (
          <div className="w-full flex flex-col gap-2 pt-0" style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 8 }}>
            {/* Theme */}
            <div className="w-full flex flex-col gap-2">
              <h3 style={{ fontSize: 16, fontWeight: 550, lineHeight: 1.55, color: "#25252A", margin: 0 }}>
                Theme
              </h3>
              <p style={{ fontSize: 12, fontWeight: 425, lineHeight: 1.55, color: "#5D666F", margin: 0 }}>
                Choose visual theme that fits your brand
              </p>
              <div className="flex gap-1 w-full overflow-hidden rounded-lg" style={{ gap: 4 }}>
                {(["vibrant", "minimalist", "glass"] as Theme[]).map((theme) => (
                  <ThemeCard
                    key={theme}
                    theme={theme}
                    isSelected={config.theme === theme}
                    onClick={() => updateConfig({ theme })}
                  />
                ))}
              </div>
            </div>

            {/* Brand Color — Figma container h-58, gap 12, px 13 */}
            <div className="w-full flex flex-col gap-2">
              <h3 style={{ fontSize: 16, fontWeight: 550, lineHeight: 1.55, color: "#25252A", margin: 0 }}>
                Brand Color
              </h3>
              <div
                className="flex items-center bg-white border border-solid rounded-lg flex-shrink-0 w-full"
                style={{ height: 58, gap: 12, paddingLeft: 13, paddingRight: 13, borderColor: "#DEE5EB" }}
              >
                <input
                  type="color"
                  value={config.brandColor}
                  onChange={(e) => updateConfig({ brandColor: e.target.value })}
                  className="border border-[#DEE5EB] rounded cursor-pointer flex-shrink-0"
                  style={{ width: 32, height: 32, backgroundColor: config.brandColor, borderRadius: 4 }}
                />
                <input
                  type="text"
                  value={config.brandColor}
                  onChange={(e) => updateConfig({ brandColor: e.target.value })}
                  className="flex-1 min-w-0 border-0 outline-none bg-transparent"
                  style={{ fontSize: 14, color: "#5D666F", fontFamily: "Inter, sans-serif" }}
                />
              </div>
            </div>

            {/* UI Roundness — Figma button group bg #EBF0F5, gap 4, p 4, rounded 8 */}
            <div className="w-full flex flex-col gap-2">
              <h3 style={{ fontSize: 16, fontWeight: 550, lineHeight: 1.55, color: "#25252A", margin: 0 }}>
                UI Roundness
              </h3>
              <p style={{ fontSize: 12, fontWeight: 425, lineHeight: 1.55, color: "#5D666F", margin: 0 }}>
                Choose how rounded or squared the UI elements appear
              </p>
              <div
                className="flex overflow-hidden rounded-lg flex-shrink-0 w-full"
                style={{ gap: 4, padding: 4, backgroundColor: "#EBF0F5" }}
              >
                {(
                  [
                    { value: "circle", name: "Circle", label: "Ultra rounded" },
                    { value: "oval", name: "Oval", label: "Modern rounded" },
                    { value: "rectangle", name: "Rectangle", label: "Subtly rounded" },
                    { value: "square", name: "Square", label: "Flat and sharp" },
                  ] as { value: Roundness; name: string; label: string }[]
                ).map(({ value, name, label }) => (
                  <button
                    key={value}
                    onClick={() => updateConfig({ roundness: value })}
                    className="flex-1 rounded-lg transition-colors flex flex-col items-center justify-center min-h-0"
                    style={{
                      paddingLeft: 16,
                      paddingRight: 16,
                      paddingTop: 4,
                      paddingBottom: 4,
                      backgroundColor: config.roundness === value ? "#FFFFFF" : "transparent",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <span style={{ fontSize: 14, fontWeight: 550, lineHeight: 1.55, color: config.roundness === value ? "#205AE3" : "#25252A" }}>{name}</span>
                    <span style={{ fontSize: 12, fontWeight: 425, lineHeight: 1.55, color: "#5D666F" }}>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography — Figma 14px labels, dropdown 329px, px 12 py 8, rounded 8 */}
            <div className="w-full flex flex-col gap-2">
              <h3 style={{ fontSize: 16, fontWeight: 550, lineHeight: 1.55, color: "#25252A", margin: 0 }}>
                Typography
              </h3>
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center justify-between w-full gap-4">
                  <label style={{ fontSize: 14, fontWeight: 550, lineHeight: 1.55, color: "#25252A", fontFamily: "Inter, sans-serif" }}>
                    Font Family:
                  </label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => updateConfig({ fontFamily: e.target.value })}
                    className="border border-solid rounded-lg bg-white flex-shrink-0"
                    style={{
                      width: 329,
                      height: 38,
                      paddingLeft: 12,
                      paddingRight: 12,
                      paddingTop: 8,
                      paddingBottom: 8,
                      borderColor: "#DEE5EB",
                      fontSize: 14,
                      fontWeight: 425,
                      color: "#25252A",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <option value='Inter, sans-serif'>Inter</option>
                    <option value='Arial, sans-serif'>Arial</option>
                    <option value='Verdana, Geneva, sans-serif'>Verdana</option>
                    <option value='"Times New Roman", Times, serif'>Times New Roman</option>
                    <option value='Georgia, serif'>Georgia</option>
                    <option value='"Courier New", Courier, monospace'>Courier New</option>
                  </select>
                </div>
                <div className="flex items-center justify-between w-full gap-4">
                  <label style={{ fontSize: 14, fontWeight: 550, lineHeight: 1.55, color: "#25252A", fontFamily: "Inter, sans-serif" }}>
                    Font Size:
                  </label>
                  <select
                    value={config.fontSize}
                    onChange={(e) => updateConfig({ fontSize: e.target.value as "sm" | "md" | "lg" })}
                    className="border border-solid rounded-lg bg-white flex-shrink-0"
                    style={{
                      width: 329,
                      height: 38,
                      paddingLeft: 12,
                      paddingRight: 12,
                      paddingTop: 8,
                      paddingBottom: 8,
                      borderColor: "#DEE5EB",
                      fontSize: 14,
                      fontWeight: 425,
                      color: "#25252A",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    <option value="sm">Small</option>
                    <option value="md">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Launcher Experience — Figma accordion */}
      <div className="w-full flex flex-col">
        <div
          className="flex items-center justify-between cursor-pointer border-b border-solid flex-shrink-0 w-full"
          style={{ height: 69, paddingLeft: 8, paddingRight: 8, paddingTop: 12, paddingBottom: 12, borderColor: "#DEE5EB" }}
          onClick={() => toggleSection("launcher")}
        >
          <div className="flex items-center gap-2">
            <div className="w-[18px] h-[18px] flex items-center justify-center">
              <img src="/icons/rocket.svg" alt="Rocket" className="w-[18px] h-[18px]" />
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 550, lineHeight: 1.55, color: "#25252A" }}>
              Launcher Experience
            </h2>
          </div>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" className={`transition-transform ${expandedSections.launcher ? "rotate-180" : ""}`}>
            <path d="M6 9L12 15L18 9" stroke="#25252A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {expandedSections.launcher && (
          <div className="w-full flex flex-col gap-2 pt-2" style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 8 }}>
            <div className="w-full flex flex-col gap-2">
              <label style={{ fontSize: 14, fontWeight: 550, lineHeight: 1.55, color: "#25252A", fontFamily: "Inter, sans-serif" }}>
                Launcher Color
              </label>
              <div
                className="flex items-center bg-white border border-solid rounded-lg w-full"
                style={{ height: 58, gap: 12, paddingLeft: 13, paddingRight: 13, borderColor: "#DEE5EB" }}
              >
                <input
                  type="color"
                  value={config.launcher.color}
                  onChange={(e) => updateConfig({ launcher: { ...config.launcher, color: e.target.value } })}
                  className="border border-[#DEE5EB] rounded cursor-pointer flex-shrink-0"
                  style={{ width: 32, height: 32, backgroundColor: config.launcher.color, borderRadius: 4 }}
                />
                <input
                  type="text"
                  value={config.launcher.color}
                  onChange={(e) => updateConfig({ launcher: { ...config.launcher, color: e.target.value } })}
                  className="flex-1 min-w-0 border-0 outline-none bg-transparent"
                  style={{ fontSize: 14, color: "#5D666F", fontFamily: "Inter, sans-serif" }}
                />
              </div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <label style={{ fontSize: 14, fontWeight: 550, lineHeight: 1.55, color: "#25252A", fontFamily: "Inter, sans-serif" }}>
                Title
              </label>
              <input
                type="text"
                value={config.launcher.title}
                onChange={(e) => updateConfig({ launcher: { ...config.launcher, title: e.target.value } })}
                className="w-full border border-solid rounded-lg bg-white outline-none"
                style={{ height: 36, paddingLeft: 12, paddingRight: 12, borderColor: "#DEE5EB", fontSize: 14, fontWeight: 425, color: "#25252A", fontFamily: "Inter, sans-serif" }}
                placeholder="Ask anything"
              />
            </div>

            <div className="w-full flex flex-col gap-2">
              <div className="flex flex-col">
                <label style={{ fontSize: 14, fontWeight: 550, lineHeight: 1.55, color: "#25252A", fontFamily: "Inter, sans-serif" }}>
                  Subtitle
                </label>
                <span style={{ fontSize: 12, color: "#A1B0B7", fontFamily: "Inter, sans-serif" }}>Optional</span>
              </div>
              <input
                type="text"
                value={config.launcher.subtitle || ""}
                onChange={(e) => updateConfig({ launcher: { ...config.launcher, subtitle: e.target.value || undefined } })}
                className="w-full border border-solid rounded-lg bg-white outline-none"
                style={{ height: 36, paddingLeft: 12, paddingRight: 12, borderColor: "#DEE5EB", fontSize: 14, fontWeight: 425, color: "#25252A", fontFamily: "Inter, sans-serif" }}
                placeholder="Signal, your AI Agent"
              />
            </div>

            <LauncherControls
            icon={config.launcher.icon}
            customIconUrl={config.launcher.customIconURL}
            visibility={config.launcher.visibility}
            position={config.launcher.position}
            onIconChange={(icon) =>
              updateConfig({
                launcher: { ...config.launcher, icon: icon as any },
              })
            }
            onCustomIconUrlChange={(url) =>
              updateConfig({
                launcher: { ...config.launcher, customIconURL: url },
              })
            }
            onCustomIconFileSelect={(file) => {
              handleImageUpload(file, "launcher");
            }}
            onVisibilityChange={(visibility) =>
              updateConfig({
                launcher: { ...config.launcher, visibility },
              })
            }
            onPositionChange={(position) =>
              updateConfig({
                launcher: {
                  ...config.launcher,
                  position: position as "bottom-right" | "bottom-left",
                },
              })
            }
          />
          </div>
        )}
      </div>

      {/* Voice Mode — Figma: title + description + toggle row */}
      <div
        className="w-full flex flex-col border-b border-solid flex-shrink-0"
        style={{ borderColor: "#DEE5EB", paddingBottom: 12 }}
      >
        <div className="flex items-center justify-between w-full gap-4">
          <div className="flex flex-col gap-0 flex-1 min-w-0">
            <h2 style={{ fontSize: 16, fontWeight: 550, lineHeight: 1.55, color: "#25252A", margin: 0, fontFamily: "Inter, sans-serif" }}>
              Voice Mode
            </h2>
            <p style={{ fontSize: 12, fontWeight: 425, lineHeight: 1.55, color: "#5D666F", margin: 0, marginTop: 2, fontFamily: "Inter, sans-serif" }}>
              Enable real-time voice input and responses for seamless spoken interaction.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0" style={{ width: 24, height: 14 }}>
            <input
              type="checkbox"
              checked={config.voice.enabled}
              onChange={(e) => updateConfig({ voice: { enabled: e.target.checked } })}
              className="sr-only peer"
            />
            <div
              className="rounded-full transition-colors"
              style={{
                width: 24,
                height: 14,
                backgroundColor: config.voice.enabled ? "#205AE3" : "#E5E7EB",
              }}
            />
            <div
              className="absolute rounded-full bg-white border border-[#DEE5EB] transition-all pointer-events-none"
              style={{
                width: 10,
                height: 10,
                top: 2,
                left: config.voice.enabled ? 12 : 2,
              }}
            />
          </label>
        </div>
      </div>

      {/* Chat Header — Figma accordion */}
      <div className="w-full flex flex-col">
        <div
          className="flex items-center justify-between cursor-pointer border-b border-solid flex-shrink-0 w-full"
          style={{ height: 69, paddingLeft: 8, paddingRight: 8, paddingTop: 12, paddingBottom: 12, borderColor: "#DEE5EB" }}
          onClick={() => toggleSection("header")}
        >
          <h2 style={{ fontSize: 16, fontWeight: 550, lineHeight: 1.55, color: "#25252A", fontFamily: "Inter, sans-serif" }}>
            Chat Header
          </h2>
          <svg width={24} height={24} viewBox="0 0 24 24" fill="none" className={`transition-transform ${expandedSections.header ? "rotate-180" : ""}`}>
            <path d="M6 9L12 15L18 9" stroke="#25252A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {expandedSections.header && (
          <div className="w-full flex flex-col gap-4 pt-2" style={{ paddingLeft: 8, paddingRight: 8, paddingTop: 8 }}>
            <div className="w-full flex flex-col gap-2">
              <label style={{ fontSize: 14, fontWeight: 550, lineHeight: 1.55, color: "#25252A", fontFamily: "Inter, sans-serif" }}>
                Title
              </label>
              <input
                type="text"
                value={config.header.title}
                onChange={(e) => updateConfig({ header: { ...config.header, title: e.target.value } })}
                className="w-full border border-solid rounded-lg bg-white outline-none"
                style={{ height: 36, paddingLeft: 12, paddingRight: 12, borderColor: "#DEE5EB", fontSize: 14, fontWeight: 425, color: "#25252A", fontFamily: "Inter, sans-serif" }}
              />
            </div>
            <div className="w-full flex flex-col gap-2">
              <div className="flex flex-col">
                <label style={{ fontSize: 14, fontWeight: 550, lineHeight: 1.55, color: "#25252A", fontFamily: "Inter, sans-serif" }}>Subtitle</label>
                <span style={{ fontSize: 12, color: "#A1B0B7", fontFamily: "Inter, sans-serif" }}>Optional</span>
              </div>
              <input
                type="text"
                value={config.header.subtitle || ""}
                onChange={(e) => updateConfig({ header: { ...config.header, subtitle: e.target.value || undefined } })}
                placeholder="AI Agent"
                className="w-full border border-solid rounded-lg bg-white outline-none"
                style={{ height: 36, paddingLeft: 12, paddingRight: 12, borderColor: "#DEE5EB", fontSize: 14, fontWeight: 425, color: "#25252A", fontFamily: "Inter, sans-serif" }}
              />
            </div>
            <div className="w-full flex flex-col gap-2">
              <div className="flex flex-col">
                <label style={{ fontSize: 14, fontWeight: 550, lineHeight: 1.55, color: "#25252A", fontFamily: "Inter, sans-serif" }}>Icon</label>
                <span style={{ fontSize: 12, color: "#A1B0B7", fontFamily: "Inter, sans-serif" }}>Optional</span>
              </div>
              <label
                className="border border-solid rounded-lg bg-white cursor-pointer hover:bg-gray-50 flex items-center gap-2 w-fit"
                style={{ height: 36, paddingLeft: 12, paddingRight: 12, borderColor: "#DEE5EB", fontSize: 14, fontWeight: 550, color: "#25252A", fontFamily: "Inter, sans-serif" }}
              >
                <svg width={16} height={16} viewBox="0 0 16 16" fill="none" style={{ color: "#25252A" }}>
                  <path d="M8 2V14M2 8H14" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
                Upload File
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file, "header");
                  }}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => {
          setCropModalOpen(false);
          setCropImageSrc("");
        }}
        onSave={handleCropSave}
        size={{ width: 24, height: 24 }}
      />
    </div>
  );
}

function ThemeCard({
  theme,
  isSelected,
  onClick,
}: {
  theme: Theme;
  isSelected: boolean;
  onClick: () => void;
}) {
  const themeInfo = {
    vibrant: {
      label: "Vibrant",
      description: "High color usage for brand visibility.",
      color: "#205AE3",
      image: "/Vibrant.png",
    },
    minimalist: {
      label: "Minimalist",
      description: "Light color usage for a soft, neutral feel.",
      color: "#25252A",
      image: "/Minimalist.png",
    },
    glass: {
      label: "Glass",
      description: "Modern design with a universal feel.",
      color: "#25252A",
      image: "/Glass.png",
    },
  };

  const info = themeInfo[theme];

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start flex-1 min-h-0 bg-white rounded-lg transition-all ${
        isSelected ? "border-2 border-[#205AE3]" : "border border-[#DEE5EB]"
      }`}
      style={{
        padding: "12px 16px",
        gap: 8,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div className="w-full flex-1 min-h-0 bg-white border border-[#DEE5EB] rounded overflow-hidden">
        <img
          src={info.image}
          alt={`${info.label} theme preview`}
          className="w-full h-full object-cover"
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            // Fallback if image doesn't exist - show a placeholder
            const target = e.currentTarget;
            target.style.display = "none";
          }}
        />
      </div>
      <div className="flex flex-col items-start w-full flex-shrink-0 text-left">
        <p style={{ fontSize: 14, fontWeight: 550, lineHeight: 1.55, color: isSelected ? "#205AE3" : "#25252A", textAlign: "left" }}>
          {info.label}
        </p>
        <p style={{ fontSize: 12, fontWeight: 425, lineHeight: 1.55, color: "#5D666F", textAlign: "left" }}>
          {info.description}
        </p>
      </div>
    </button>
  );
}

