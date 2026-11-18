import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Vidhun Vijayakumar Suja, software engineer in AI infrastructure and systems research";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  const blocks = [3, 3, 3, 1, 1, 2, 2, 2, 2, 0, 0, 3, 1, 2, 0, -1, -1, 0, -1, -1, -1, -1, -1, -1];
  const colors = ["#c9821a", "#6089ea", "#2fa68c", "#b59cf5"];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#0b0b0c", color: "#ecebe6", padding: 72, fontFamily: "Georgia, serif" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 22, color: "#a3a19a", fontFamily: "monospace", letterSpacing: 2 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 12, height: 12, borderRadius: 12, background: "#f2a93b" }} />
            SOFTWARE ENGINEER
          </span>
          <span>EDINBURGH, UK</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, lineHeight: 0.95 }}>Vidhun</div>
          <div style={{ fontSize: 120, lineHeight: 0.95, color: "#a3a19a", fontStyle: "italic" }}>Vijayakumar Suja</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ fontSize: 30, color: "#a3a19a", maxWidth: 640, lineHeight: 1.35, fontFamily: "sans-serif" }}>
            LLM serving, adaptive runtime control and weak memory verification.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", width: 300, gap: 6 }}>
            {blocks.map((b, i) => (
              <div key={i} style={{ width: 32, height: 26, borderRadius: 4, border: "1px solid #2a2a2d", background: b < 0 ? "transparent" : colors[b] }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
