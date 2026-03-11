import type { LauncherIcon, LauncherVisibility } from "../Launcher";

export interface LauncherControlsProps {
  icon: LauncherIcon;
  customIconUrl?: string;
  visibility: LauncherVisibility;
  position: "bottom-right" | "bottom-left";
  onIconChange: (icon: LauncherIcon) => void;
  onCustomIconUrlChange: (url: string) => void;
  onCustomIconFileSelect: (file: File) => void;
  onVisibilityChange: (visibility: LauncherVisibility) => void;
  onPositionChange: (position: "bottom-right" | "bottom-left") => void;
}

export function LauncherControls({
  icon,
  customIconUrl,
  visibility,
  position,
  onIconChange,
  onCustomIconUrlChange,
  onCustomIconFileSelect,
  onVisibilityChange,
  onPositionChange,
}: LauncherControlsProps) {
  const labelStyle = { fontSize: 14, fontWeight: 550, lineHeight: 1.55, color: "#25252A", fontFamily: "Inter, sans-serif" } as const;
  const inputStyle = { height: 36, paddingLeft: 12, paddingRight: 12, border: "1px solid #DEE5EB", borderRadius: 8, fontSize: 14, fontWeight: 425, color: "#25252A", fontFamily: "Inter, sans-serif" };

  return (
    <div className="flex flex-col gap-4">
      {/* Launcher Icon */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Launcher icon</label>
        <div className="flex flex-col gap-2">
          {(
            [
              { value: "animatedWave" as const, label: "Animated wave" },
              { value: "chatIcon" as const, label: "Chat icon" },
              { value: "custom" as const, label: "Use your own" },
            ] as const
          ).map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="launcher-icon"
                value={value}
                checked={icon === value}
                onChange={() => onIconChange(value)}
                className="w-[14px] h-[14px]"
              />
              <span style={{ fontSize: 14, color: "#25252A", fontFamily: "Inter, sans-serif" }}>{label}</span>
            </label>
          ))}
        </div>
        {icon === "custom" && (
          <div className="mt-2 flex flex-col gap-2">
            <input
              type="url"
              value={customIconUrl ?? ""}
              onChange={(e) => onCustomIconUrlChange(e.target.value)}
              placeholder="Paste icon URL (SVG recommended)"
              className="w-full border border-solid rounded-lg bg-white outline-none"
              style={inputStyle}
            />
            <label
              className="border border-solid rounded-lg bg-white cursor-pointer hover:bg-gray-50 flex items-center gap-2 w-fit"
              style={{ ...inputStyle, fontWeight: 550 }}
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
                  if (file) onCustomIconFileSelect(file);
                }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Launcher Visibility */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Launcher visibility</label>
        <div className="flex flex-col gap-2">
          {(
            [
              { value: "prominent" as const, label: "Prominent: Pill stays still" },
              { value: "hybrid" as const, label: "Hybrid: Pill transitions to circle after 5 seconds" },
              { value: "minimal" as const, label: "Minimal: Circle" },
            ] as const
          ).map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="launcher-visibility"
                value={value}
                checked={visibility === value}
                onChange={() => onVisibilityChange(value)}
                className="w-[14px] h-[14px]"
              />
              <span style={{ fontSize: 14, color: "#25252A", fontFamily: "Inter, sans-serif" }}>{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Position */}
      <div className="flex flex-col gap-2">
        <label style={labelStyle}>Position</label>
        <select
          value={position}
          onChange={(e) => onPositionChange(e.target.value as "bottom-right" | "bottom-left")}
          className="w-full border border-solid rounded-lg bg-white outline-none"
          style={inputStyle}
        >
          <option value="bottom-right">bottom right</option>
          <option value="bottom-left">bottom left</option>
        </select>
      </div>
    </div>
  );
}

