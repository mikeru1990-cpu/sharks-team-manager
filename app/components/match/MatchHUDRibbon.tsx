"use client"

type Props = {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  minute: number
  momentum: "up" | "down" | "neutral"
  pressure: "Low" | "Medium" | "High"
}

function momentumColor(momentum: Props["momentum"]) {
  if (momentum === "up") return "#22c55e"
  if (momentum === "down") return "#ef4444"
  return "#94a3b8"
}

function momentumLabel(momentum: Props["momentum"]) {
  if (momentum === "up") return "Momentum ↑"
  if (momentum === "down") return "Momentum ↓"
  return "Momentum Balanced"
}

export default function MatchHUDRibbon({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  minute,
  momentum,
  pressure,
}: Props) {
  const accent = momentumColor(momentum)

  return (
    <div
      style={{
        position: "sticky",
        top: 12,
        zIndex: 100,
        borderRadius: 28,
        border: "1px solid rgba(148,163,184,0.12)",
        background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))",
        padding: "18px 22px",
        boxShadow: `0 24px 60px ${accent}22`,
        backdropFilter: "blur(18px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              borderRadius: 999,
              padding: "8px 14px",
              background: "rgba(239,68,68,0.14)",
              border: "1px solid rgba(239,68,68,0.22)",
              color: "#fecaca",
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: "0.08em",
            }}
          >
            LIVE
          </div>

          <div
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            {minute}'
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              color: "rgba(226,232,240,0.92)",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            {homeTeam}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderRadius: 18,
              padding: "10px 18px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                color: "white",
                fontWeight: 900,
                fontSize: 28,
                lineHeight: 1,
              }}
            >
              {homeScore}
            </div>

            <div
              style={{
                color: "rgba(226,232,240,0.5)",
                fontWeight: 700,
              }}
            >
              -
            </div>

            <div
              style={{
                color: "white",
                fontWeight: 900,
                fontSize: 28,
                lineHeight: 1,
              }}
            >
              {awayScore}
            </div>
          </div>

          <div
            style={{
              color: "rgba(226,232,240,0.92)",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            {awayTeam}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              borderRadius: 999,
              padding: "8px 14px",
              background: `${accent}22`,
              border: `1px solid ${accent}44`,
              color: accent,
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            {momentumLabel(momentum)}
          </div>

          <div
            style={{
              borderRadius: 999,
              padding: "8px 14px",
              background: "rgba(59,130,246,0.16)",
              border: "1px solid rgba(59,130,246,0.24)",
              color: "#bfdbfe",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            Pressure {pressure}
          </div>
        </div>
      </div>
    </div>
  )
}
