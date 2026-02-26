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
  return (
    <div className="space-y-4">
      {/* Launcher Icon */}
      <div>
        <label className="text-sm font-semibold leading-[155%] text-[#25252A] mb-2 block">
          Launcher icon
        </label>
        <div className="space-y-2">
          {(
            [
              { value: "animatedWave" as const, label: "Animated wave" },
              { value: "chatIcon" as const, label: "Chat icon" },
              { value: "custom" as const, label: "Use your own" },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="launcher-icon"
                value={value}
                checked={icon === value}
                onChange={() => onIconChange(value)}
                className="w-[14px] h-[14px]"
              />
              <span className="text-sm font-normal leading-[14px] text-[#25252A]">
                {label}
              </span>
            </label>
          ))}
        </div>
        {icon === "custom" && (
          <div className="mt-2">
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
                    onCustomIconFileSelect(file);
                  }
                }}
              />
            </label>
          </div>
        )}
      </div>

      {/* Launcher Visibility */}
      <div>
        <label className="text-sm font-semibold leading-[155%] text-[#25252A] mb-2 block">
          Launcher visibility
        </label>
        <div className="space-y-2">
          {(
            [
              {
                value: "prominent" as const,
                label: "Prominent: Pill stays still",
              },
              {
                value: "hybrid" as const,
                label: "Hybrid: Pill transitions to circle after 5 seconds",
              },
              {
                value: "minimal" as const,
                label: "Minimal: Circle",
              },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="launcher-visibility"
                value={value}
                checked={visibility === value}
                onChange={() => onVisibilityChange(value)}
                className="w-[14px] h-[14px]"
              />
              <span className="text-sm font-normal leading-[14px] text-[#25252A]">
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="text-sm font-semibold leading-[155%] text-[#25252A] mb-2 block">
          Position
        </label>
        <select
          value={position}
          onChange={(e) =>
            onPositionChange(e.target.value as "bottom-right" | "bottom-left")
          }
          className="w-full px-3 py-2 h-[38px] border border-[#DEE5EB] rounded-lg text-sm font-normal leading-[155%] text-[#25252A] bg-white"
        >
          <option value="bottom-right">bottom right</option>
          <option value="bottom-left">bottom left</option>
        </select>
      </div>
    </div>
  );
}

