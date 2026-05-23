"use client"

export default function MatchCenter() {
  return (
    <div
      className="sharks-elite-panel sharks-card-shine"
      style={{
        padding: 24,
        borderRadius: 28,
        color: "white",
      }}
    >
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ color: "#7dd3fc", fontSize: 12, fontWeight: 1000, letterSpacing: ".16em" }}>
          MATCH COMMAND CENTER
        </div>

        <div style={{ fontSize: 34, fontWeight: 1000, lineHeight: 1 }}>
          Tactical Matchday Rebuild Active
        </div>

        <div style={{ color: "#cbd5e1", lineHeight: 1.6, maxWidth: 760 }}>
          The match engine is currently being rebuilt into a full tactical control centre with live timeline tracking, elite pitch visuals, quarter management and advanced matchday controls.
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginTop: 10,
          }}
        >
          {[
            ["Live Match", "Ready"],
            ["Tactical Pitch", "Rebuilding"],
            ["Quarter Planner", "Ready"],
            ["Timeline Engine", "Rebuilding"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="sharks-glass"
              style={{
                padding: 18,
                borderRadius: 20,
                border: "1px solid rgba(125,211,252,0.24)",
              }}
            >
              <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 900, letterSpacing: ".08em" }}>
                {label}
              </div>

              <div style={{ marginTop: 8, fontSize: 24, fontWeight: 1000 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
