import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "FormPilot — Auto-fill Google Forms with smart answer distributions";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "radial-gradient(900px 500px at 10% -10%, #6d5efc55, transparent), radial-gradient(800px 500px at 100% 0%, #a855f755, transparent), #07070d",
          color: "#e9eaf2",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 22,
              background: "linear-gradient(135deg, #6d5efc, #a855f7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12.5l5 5L20 6.5"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            FormPilot
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 900,
            }}
          >
            Auto-fill Google Forms with smart answer distributions
          </div>
          <div style={{ fontSize: 30, color: "#9aa0b5", maxWidth: 900 }}>
            Paste a link · review the parsed questions · set weighted answers ·
            submit real responses.
          </div>
        </div>

        <div style={{ display: "flex", gap: 16 }}>
          {["Paste", "Review", "Configure", "Run"].map((step, i) => (
            <div
              key={step}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 22px",
                borderRadius: 999,
                border: "1px solid #24242f",
                background: "#101018",
                fontSize: 26,
                color: "#c7cae0",
              }}
            >
              <span style={{ color: "#8b7bff", fontWeight: 700 }}>{i + 1}</span>
              {step}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
