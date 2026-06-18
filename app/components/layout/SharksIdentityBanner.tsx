"use client"

export default function SharksIdentityBanner() {
  return (
    <div
      className="sharks-elite-panel sharks-card-shine"
      style={{
        borderRadius: 26,
        padding: 16,
        overflow: "hidden",
        position: "relative",
        display: "grid",
        gap: 12,
      }}
    >
      <div className="sharks-hero-watermark" style={{ opacity: 0.04 }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
        <div
          className="sharks-app-badge"
          style={{
            width: 56,
            height: 56,
            flex: "0 0 auto",
            borderRadius: 18,
            border: "1px solid rgba(125,211,252,0.28)",
            backgroundColor: "rgba(255,255,255,0.06)",
            boxShadow: "0 14px 28px rgba(0,0,0,0.30)",
          }}
        />

        <div style={{ minWidth: 0, display: "grid", gap: 4 }}>
          <div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".15em", textTransform: "uppercase" }}>
            Home Dashboard
          </div>
          <div style={{ color: "white", fontSize: 24, fontWeight: 1000, letterSpacing: "-0.045em", lineHeight: 1 }}>
            Sharks Lioness
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 750, lineHeight: 1.35 }}>
            Quick club overview, availability and matchday access.
          </div>
        </div>
      </div>
    </div>
  )
}
