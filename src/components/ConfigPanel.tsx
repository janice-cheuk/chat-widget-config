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
      className="bg-[#F8F9FA] rounded-2xl config-panel"
      style={{
        display: "flex",
        padding: "1.25rem",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "var(--Spacing-XL, 1.5rem)",
        flexShrink: 0,
        alignSelf: "stretch",
        width: "100%",
        minHeight: "100%",
      }}
    >
      {/* Style Section */}
      <div className="w-full">
        <div
          className="flex items-center justify-between mb-2 cursor-pointer"
          onClick={() => toggleSection("style")}
        >
          <div className="flex items-center gap-2">
            <div className="w-[18px] h-[18px] flex items-center justify-center">
              <img
                src="/icons/palette.svg"
                alt="Palette"
                className="w-[18px] h-[18px]"
              />
            </div>
            <h2 className="text-base font-semibold leading-[155%] text-[#25252A]">
              Style
            </h2>
          </div>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-transform ${
              expandedSections.style ? "rotate-180" : ""
            }`}
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {expandedSections.style && (
          <div className="space-y-6 pt-6">
            {/* Theme Section */}
            <div className="w-full">
              <h3 className="text-base font-semibold leading-[155%] text-[#25252A] mb-2">
                Theme
              </h3>
              <p className="text-xs font-normal leading-[155%] text-[#5D666F] mb-2">
                Choose visual theme that fits your brand
              </p>
              <div className="flex gap-1 w-full">
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

            {/* Brand Color Section */}
            <div className="w-full">
              <h3 className="text-base font-semibold leading-[155%] text-[#25252A] mb-2">
                Brand Color
              </h3>
              <div className="flex items-center gap-3 px-3 py-0 h-[58px] bg-white border border-[#DEE5EB] rounded-lg">
                <input
                  type="color"
                  value={config.brandColor}
                  onChange={(e) => updateConfig({ brandColor: e.target.value })}
                  className="w-8 h-8 border border-[#DEE5EB] rounded cursor-pointer"
                  style={{ backgroundColor: config.brandColor }}
                />
                <input
                  type="text"
                  value={config.brandColor}
                  onChange={(e) => updateConfig({ brandColor: e.target.value })}
                  className="flex-1 text-sm font-normal leading-[17px] text-[#5D666F] border-0 outline-none bg-transparent"
                />
              </div>
            </div>

            {/* UI Roundness Section */}
            <div className="w-full">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-semibold leading-[155%] text-[#25252A]">
                  UI Roundness
                </h3>
              </div>
              <p className="text-xs font-normal leading-[155%] text-[#5D666F] mb-2">
                Choose how rounded or squared the UI elements appear
              </p>
              <div className="flex gap-1 p-1 bg-[#EBF0F5] rounded-lg">
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
                    className={`flex-1 px-4 py-1 h-[49px] rounded-lg transition-colors flex flex-col items-center justify-center ${
                      config.roundness === value
                        ? "bg-white text-[#205AE3]"
                        : "bg-transparent text-[#25252A]"
                    }`}
                  >
                    <span className="text-sm font-semibold leading-[155%]">{name}</span>
                    <span className="text-xs font-normal leading-[155%]">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Typography Section */}
            <div className="w-full">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-base font-semibold leading-[155%] text-[#25252A]">
                  Typography
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold leading-[155%] text-[#25252A]">
                    Font Family:
                  </label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) => updateConfig({ fontFamily: e.target.value })}
                    className="px-3 py-2 w-[329px] h-[38px] border border-[#DEE5EB] rounded-lg text-sm font-normal leading-[155%] text-[#25252A] bg-white"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  >
                    <option value='Inter, sans-serif'>Inter</option>
                    <option value='Arial, sans-serif'>Arial</option>
                    <option value='Verdana, Geneva, sans-serif'>Verdana</option>
                    <option value='"Times New Roman", Times, serif'>Times New Roman</option>
                    <option value='Georgia, serif'>Georgia</option>
                    <option value='"Courier New", Courier, monospace'>Courier New</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold leading-[155%] text-[#25252A]">
                    Font Size:
                  </label>
                  <select
                    value={config.fontSize}
                    onChange={(e) =>
                      updateConfig({
                        fontSize: e.target.value as "sm" | "md" | "lg",
                      })
                    }
                    className="px-3 py-2 w-[329px] h-[38px] border border-[#DEE5EB] rounded-lg text-sm font-normal leading-[155%] text-[#25252A] bg-white"
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

      {/* Launcher Experience Section */}
      <div className="w-full">
        <div
          className="flex items-center justify-between mb-2 cursor-pointer"
          onClick={() => toggleSection("launcher")}
        >
          <div className="flex items-center gap-2">
            <div className="w-[18px] h-[18px] flex items-center justify-center">
              <img
                src="/icons/rocket.svg"
                alt="Rocket"
                className="w-[18px] h-[18px]"
              />
            </div>
            <h2 className="text-base font-semibold leading-[155%] text-[#25252A]">
              Launcher experience
            </h2>
          </div>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-transform ${
              expandedSections.launcher ? "rotate-180" : ""
            }`}
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {expandedSections.launcher && (
          <div className="space-y-6 pt-6">
            <div className="w-full">
              <label className="text-sm font-semibold leading-[155%] text-[#25252A] mb-2 block">
                Launcher Color
              </label>
              <div className="flex items-center gap-3 px-3 py-0 h-[58px] bg-white border border-[#DEE5EB] rounded-lg">
                <input
                  type="color"
                  value={config.launcher.color}
                  onChange={(e) =>
                    updateConfig({
                      launcher: { ...config.launcher, color: e.target.value },
                    })
                  }
                  className="w-8 h-8 border border-[#DEE5EB] rounded cursor-pointer"
                  style={{ backgroundColor: config.launcher.color }}
                />
                <input
                  type="text"
                  value={config.launcher.color}
                  onChange={(e) =>
                    updateConfig({
                      launcher: { ...config.launcher, color: e.target.value },
                    })
                  }
                  className="flex-1 text-sm font-normal leading-[17px] text-[#5D666F] border-0 outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="w-full">
              <label className="text-sm font-semibold leading-[155%] text-[#25252A] mb-2 block">
                Title
              </label>
              <input
                type="text"
                value={config.launcher.title}
                onChange={(e) =>
                  updateConfig({
                    launcher: { ...config.launcher, title: e.target.value },
                  })
                }
                className="w-full px-3 py-2 h-[38px] border border-[#DEE5EB] rounded-lg text-sm font-normal leading-[155%] text-[#25252A] bg-white"
                placeholder="Ask anything"
              />
            </div>

            <div className="w-full">
              <label className="text-sm font-semibold leading-[155%] text-[#25252A] mb-2 block">
                Subtitle
                <span className="text-xs font-normal text-[#5D666F] ml-1">
                  (Optional)
                </span>
              </label>
              <input
                type="text"
                value={config.launcher.subtitle || ""}
                onChange={(e) =>
                  updateConfig({
                    launcher: {
                      ...config.launcher,
                      subtitle: e.target.value || undefined,
                    },
                  })
                }
                className="w-full px-3 py-2 h-[38px] border border-[#DEE5EB] rounded-lg text-sm font-normal leading-[155%] text-[#25252A] bg-white"
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

      {/* Voice Mode Section */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold leading-[155%] text-[#25252A]">
            Voice Mode
          </h2>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.voice.enabled}
              onChange={(e) =>
                updateConfig({
                  voice: { enabled: e.target.checked },
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#205AE3] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#205AE3"></div>
          </label>
        </div>
      </div>

      {/* Chat Header Section */}
      <div className="w-full">
        <div
          className="flex items-center justify-between mb-2 cursor-pointer"
          onClick={() => toggleSection("header")}
        >
          <h2 className="text-base font-semibold leading-[155%] text-[#25252A]">
            Chat Header
          </h2>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className={`transition-transform ${
              expandedSections.header ? "rotate-180" : ""
            }`}
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="#000000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {expandedSections.header && (
          <div className="space-y-4 pt-6">
            <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold leading-[155%] text-[#25252A] mb-2 block">
              Title
            </label>
            <input
              type="text"
              value={config.header.title}
              onChange={(e) =>
                updateConfig({
                  header: { ...config.header, title: e.target.value },
                })
              }
              className="w-full px-3 py-2 h-[38px] border border-[#DEE5EB] rounded-lg text-sm font-normal leading-[155%] text-[#25252A] bg-white"
            />
          </div>

          <div>
            <label className="text-sm font-semibold leading-[155%] text-[#25252A] mb-2 block">
              Subtitle
              <span className="text-xs font-normal text-[#5D666F] ml-1">
                (Optional)
              </span>
            </label>
            <input
              type="text"
              value={config.header.subtitle || ""}
              onChange={(e) =>
                updateConfig({
                  header: {
                    ...config.header,
                    subtitle: e.target.value || undefined,
                  },
                })
              }
              placeholder="AI Agent"
              className="w-full px-3 py-2 h-[38px] border border-[#DEE5EB] rounded-lg text-sm font-normal leading-[155%] text-[#25252A] bg-white"
            />
          </div>

          <div>
            <label className="text-sm font-semibold leading-[155%] text-[#25252A] mb-2 block">
              Icon
              <span className="text-xs font-normal text-[#5D666F] ml-1">
                (Optional)
              </span>
            </label>
            <label className="px-4 py-2 h-[38px] border border-[#DEE5EB] rounded-lg text-sm font-semibold leading-[155%] text-[#25252A] bg-white cursor-pointer hover:bg-gray-50 flex items-center gap-2 w-fit">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-[#25252A]"
              >
                <path
                  d="M8 2V14M2 8H14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Upload File
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleImageUpload(file, "header");
                  }
                }}
              />
            </label>
          </div>
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
      description: "Colorful flat design to let your colors show",
      color: "#205AE3",
      image: "/Vibrant.png",
    },
    minimalist: {
      label: "Minimalist",
      description: "Light feeling design with low use of color",
      color: "#25252A",
      image: "/Minimalist.png",
    },
    glass: {
      label: "Glass",
      description: "Contemporary design with a glass-like finish",
      color: "#25252A",
      image: "/Glass.png",
    },
  };

  const info = themeInfo[theme];

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start p-3 gap-2 flex-1 h-[164px] bg-white rounded-lg transition-all ${
        isSelected
          ? "border-2 border-[#205AE3]"
          : "border border-[#DEE5EB]"
      }`}
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
      <div className="flex flex-col items-start w-full flex-shrink-0">
        <p
          className={`text-sm font-semibold leading-[155%] text-left ${
            isSelected ? "text-[#205AE3]" : "text-[#25252A]"
          }`}
        >
          {info.label}
        </p>
        <p className="text-xs font-normal leading-[155%] text-[#5D666F] text-left">
          {info.description}
        </p>
      </div>
    </button>
  );
}

