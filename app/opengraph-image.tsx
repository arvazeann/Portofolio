import { ImageResponse } from "next/og";

export const alt = "Portofolio Rafif Arvazean";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: "radial-gradient(ellipse at 78% 14%, #273323 0%, #101310 48%, #0c0f0c 100%)",
          color: "#e8ebe5",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", color: "#b7d6a5", fontSize: 24, fontWeight: 600 }}>
          <span style={{ display: "flex", width: "42px", height: "42px", alignItems: "center", justifyContent: "center", border: "1px solid #66765e", borderRadius: "50%", fontFamily: "monospace" }}>r.</span>
          <span>RAFIF ARVAZEAN</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ color: "#b7d6a5", fontSize: 20, letterSpacing: "0.12em" }}>MAHASISWA INFORMATIKA</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 66, fontWeight: 700, letterSpacing: "-0.06em", lineHeight: 1.05 }}>
            <span>Belajar, membangun,</span>
            <span>lalu belajar lagi.</span>
          </div>
          <div style={{ color: "#aeb6ab", fontSize: 24 }}>Portofolio dan dokumentasi perjalanan belajar</div>
        </div>
        <div style={{ width: "88px", height: "3px", background: "#b7d6a5" }} />
      </div>
    ),
    { ...size },
  );
}
