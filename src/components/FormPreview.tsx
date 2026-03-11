/**
 * Form preview — matches Figma Chat-Widget-Config-V2 Form.
 * Renders the form as it appears in the widget. When embedded, only the form content is rendered (no outer wrapper).
 */

const FORM_FIELDS = [
  { id: "first", label: "First Name", required: true },
  { id: "last", label: "Last Name", required: true },
  { id: "phone", label: "Phone Number", required: true },
  { id: "email", label: "Business Email", required: true },
  { id: "job", label: "Job Title", required: true },
  { id: "company", label: "Company", required: true },
  { id: "agents", label: "Number of Agents", required: true, placeholder: "1-9", isSelect: true },
] as const;

export interface FormPreviewProps {
  /** When true, render only the form content for embedding inside a message bubble (no centering wrapper). */
  embedded?: boolean;
  /** When embedded, use this for the Submit button to match theme (e.g. config.brandColor). */
  brandColor?: string;
}

export function FormPreview({ embedded = false, brandColor = "#205AE3" }: FormPreviewProps) {
  const formContent = (
    <div
      style={{
        width: embedded ? "100%" : 367,
        maxWidth: embedded ? "100%" : 367,
        minWidth: embedded ? 0 : undefined,
        boxSizing: "border-box",
        backgroundColor: "#EBF0F5",
        borderRadius: 16,
        padding: 16,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FORM_FIELDS.map((field) => {
          const { id, label, required } = field;
          const placeholder = "placeholder" in field ? field.placeholder : undefined;
          const isSelect = "isSelect" in field ? field.isSelect : false;
          return (
            <div
              key={id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 650,
                  color: "#25252A",
                  lineHeight: 1.55,
                }}
              >
                {label}{" "}
                {required && <span style={{ color: "#F03E3E" }}>*</span>}
              </label>
              <div
                style={{
                  height: 30,
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #DEE5EB",
                  borderRadius: 4,
                  paddingLeft: 12,
                  paddingRight: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {isSelect ? (
                  <>
                    <span style={{ fontSize: 12, color: "#25252A", flex: 1 }}>
                      {placeholder}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{ opacity: 0.6, flexShrink: 0 }}
                      aria-hidden
                    >
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                ) : (
                  <input
                    type="text"
                    readOnly
                    placeholder=""
                    style={{
                      flex: 1,
                      border: "none",
                      background: "transparent",
                      fontSize: 12,
                      color: "#25252A",
                      outline: "none",
                      minWidth: 0,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        disabled
        style={{
          marginTop: 16,
          width: "100%",
          height: 30,
          backgroundColor: brandColor,
          color: "#FFFFFF",
          fontSize: 12,
          fontWeight: 550,
          lineHeight: 1.55,
          border: "none",
          borderRadius: 4,
          cursor: "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Submit
      </button>
    </div>
  );

  if (embedded) return formContent;
  return (
    <div className="flex items-center justify-center w-full h-full min-h-0" style={{ fontFamily: "Inter, sans-serif" }}>
      {formContent}
    </div>
  );
}
