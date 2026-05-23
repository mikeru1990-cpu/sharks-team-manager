"use client"

export default function SharksIdentityBanner() {
  const homeActions = [
    "Next Fixture",
    "Attendance",
    "Live Match",
    "Player Form",
  ]

  return (
    <div
      className="sharks-elite-panel sharks-card-shine"
      style={{
        borderRadius: 34,
        padding: 24,
        overflow: "hidden",
        position: "relative",
        display: "grid",
        gap: 20,
      }}
    >
      <div className="sharks-hero-watermark" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 76% 18%, rgba(56,189,248,0.22), transparent 30%), radial-gradient(circle at 14% 90%, rgba(37,99,235,0.20), transparent 34%)",
        }}
      />

      <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 14px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(125,211,252,0.22)",
              color: "#dbeafe",
              fontWeight: 1000,
              fontSize: 11,
              letterSpacing: ".16em",
            }}
          >
            SHARKS HOME DASHBOARD
          </div>

          <div
            style={{
              padding: "8px 11px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.055)",
              border: "1px solid rgba(34,197,94,0.44)",
              boxShadow: "0 0 24px rgba(34,197,94,0.18)",
              color: "#e2e8f0",
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            <span style={{ color: "#22c55e" }}>LIVE</span> · MATCHDAY READY
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "96px minmax(0, 1fr)",
            gap: 20,
            alignItems: "center",
          }}
        >
          <div
            className="sharks-app-badge"
            style={{
              width: 96,
              height: 96,
              borderRadius: 26,
              border: "1px solid rgba(125,211,252,0.28)",
              backgroundColor: "rgba(255,255,255,0.045)",
              boxShadow:
                "0 22px 50px rgba(0,0,0,0.36), 0 0 34px rgba(56,189,248,0.16), inset 0 1px 0 rgba(255,255,255,0.10)",
            }}
          />

          <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
            <div
              style={{
                fontSize: 40,
                lineHeight: 1,
                fontWeight: 1000,
                letterSpacing: "-0.055em",
                color: "white",
                textShadow: "0 16px 36px rgba(56,189,248,0.18)",
              }}
            >
              SHARKS COMMAND CENTER
            </div>

            <div
              style={{
                color: "#cbd5e1",
                fontWeight: 650,
                lineHeight: 1.65,
                maxWidth: 760,
              }}
            >
              Elite football operations console focused on live fixtures, squad readiness, tactical planning and player development.
            </div>
          </div>
        </div>

        <div
          className="sharks-sponsor-strip"
          style={{
            padding: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 10,
            alignItems: "center",
          }}
        >
          {homeActions.map((label) => (
            <div
              key={label}
              style={{
                borderRadius: 18,
                padding: "14px 12px",
                background: "rgba(2,6,23,0.42)",
                border: "1px solid rgba(148,163,184,0.14)",
                color: "#e2e8f0",
                textAlign: "center",
                fontWeight: 900,
                fontSize: 13,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
