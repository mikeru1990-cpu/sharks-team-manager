"use client"

export default function SharksIdentityBanner() {
  const commandStats = [
    { label: "Matchday", value: "Live", tone: "#22c55e" },
    { label: "Squad Ops", value: "Ready", tone: "#38bdf8" },
    { label: "Tactics", value: "Active", tone: "#facc15" },
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
            SHARKS ELITE PLATFORM v2
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            {commandStats.map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "8px 11px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.055)",
                  border: `1px solid ${item.tone}44`,
                  boxShadow: `0 0 24px ${item.tone}18`,
                  color: "#e2e8f0",
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                <span style={{ color: item.tone }}>{item.value}</span> · {item.label}
              </div>
            ))}
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
              The home of Leonard Stanley Sharks operations — matchday control,
              squad readiness, tactical planning, player development and live coaching workflow in one premium platform.
            </div>
          </div>
        </div>

        <div
          className="sharks-sponsor-strip"
          style={{
            padding: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 10,
            alignItems: "center",
          }}
        >
          {[
            "Fixture Control",
            "Attendance",
            "Lineups",
            "Live Match",
            "Player Form",
            "Reports",
          ].map((label) => (
            <div
              key={label}
              style={{
                borderRadius: 18,
                padding: "12px 10px",
                background: "rgba(2,6,23,0.42)",
                border: "1px solid rgba(148,163,184,0.14)",
                color: "#e2e8f0",
                textAlign: "center",
                fontWeight: 900,
                fontSize: 12,
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
