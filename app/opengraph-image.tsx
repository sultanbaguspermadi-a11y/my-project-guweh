import { ImageResponse } from "next/og";

export const alt = "Sultan’s Project Playground: Arabic Scrabble and Lughoti Vokasi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Latin-only on purpose: the OG renderer can't shape Arabic reliably, so tiles carry the playful part.
export default function Image() {
  const tile = (c: string, v: number, rot: number) => (
    <div style={{ display: "flex", position: "relative", width: 150, height: 150, borderRadius: 18, background: "linear-gradient(160deg,#fcf5de,#e6d4a0)", color: "#14532d", fontSize: 96, fontWeight: 800, alignItems: "center", justifyContent: "center", transform: `rotate(${rot}deg)`, boxShadow: "0 8px 0 #5a3a1a, 0 20px 30px rgba(0,0,0,.45)" }}>
      <div style={{ display: "flex" }}>{c}</div>
      <div style={{ display: "flex", position: "absolute", right: 14, bottom: 8, fontSize: 28 }}>{String(v)}</div>
    </div>
  );
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#4a2d1b,#1a0f08)", color: "#f6ecd2" }}>
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: "#d4af37" }}>A little digital playground</div>
        <div style={{ display: "flex", flexDirection: "row", gap: 28 }}>{tile("P", 3, -6)}{tile("L", 1, 3)}{tile("A", 1, -3)}{tile("Y", 4, 6)}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800 }}>Sultan’s Project Playground</div>
          <div style={{ display: "flex", fontSize: 32, opacity: 0.8, marginTop: 8 }}>Arabic Scrabble · Lughoti Vokasi</div>
        </div>
      </div>
    ),
    size,
  );
}
