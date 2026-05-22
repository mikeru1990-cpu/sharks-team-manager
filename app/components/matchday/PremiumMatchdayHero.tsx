"use client"

type Props = {
  homeTeam?: string
  awayTeam?: string
  homeScore?: number
  awayScore?: number
  running?: boolean
  formation?: string
  matchFormat?: string
  onPitchCount?: number
  benchCount?: number
}

export default function PremiumMatchdayHero({
  homeTeam = "Sharks Lioness",
  awayTeam = "Opposition",
  homeScore = 0,
  awayScore = 0,
  running = false,
  formation = "2-3-1",
  matchFormat = "7v7",
  onPitchCount = 0,
  benchCount = 0,
}: Props) {
  return (
    <section
      className="sharks-elite-panel sharks-card-shine"
      style={{
        position: "relative",
        overflow: "hidden",
        padding: 22,
        display: "grid",
        gap: 18,
      }}
    >
      <div className="sharks-hero-watermark" />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "grid", gap: 8 }}>
          <div
            style={{
              color: "#7dd3fc",
              fontSize: 11,
              fontWeight: 1000,
              letterSpacing: ".16em",
            }}
          >
            LIVE MATCHDAY COMMAND
          </div>
          <div
            style={{
              color: "white",
              fontSize: 30,
              fontWeight: 1000,
              letterSpacing: "-0.05em",
              lineHeight: 1,
            }}
          >
            Tactical Match Centre
          </div>
          <div style={{ color: "#aebed4", fontWeight: 700, fontSize: 14 }}>
            Premium live controls, formation shape, player movement and match timeline.
          </div>
        </div>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 999,
            background: running ? "rgba(34,197,94,0.16)" : "rgba(148,163,184,0.14)",
            border: running
              ? "1px solid rgba(134,239,172,0.28)"
              : "1px solid rgba(148,163,184,0.20)",
            color: running ? "#bbf7d0" : "#e2e8f0",
            fontWeight: 900,
          }}
        >
          <span
            style={{
              width: 9,
              height: 9,
              borderRadius: 999,
              background: running ? "#22c55e" : "#94a3b8",
              boxShadow: running ? "0 0 18px rgba(34,197,94,0.9)" : "none",
            }}
          />
          {running ? "LIVE" : "READY"}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div
          className="sharks-glass"
          style={{ borderRadius: 24, padding: 16, textAlign: "center" }}
        >
          <div style={{ color: "#cbd5e1", fontWeight: 900, fontSize: 13 }}>{homeTeam}</div>
          <div style={{ color: "white", fontSize: 56, fontWeight: 1000, lineHeight: 1 }}>{homeScore}</div>
        </div>

        <div
          style={{
            color: "#7dd3fc",
            fontWeight: 1000,
            fontSize: 14,
            letterSpacing: ".16em",
          }}
        >
          VS
        </div>

        <div
          className="sharks-glass"
          style={{ borderRadius: 24, padding: 16, textAlign: "center" }}
        >
          <div style={{ color: "#cbd5e1", fontWeight: 900, fontSize: 13 }}>{awayTeam}</div>
          <div style={{ color: "white", fontSize: 56, fontWeight: 1000, lineHeight: 1 }}>{awayScore}</div>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 10,
        }}
      >
        {[
          ["Format", matchFormat, "#38bdf8"],
          ["Shape", formation, "#7dd3fc"],
          ["On Pitch", onPitchCount, "#22c55e"],
          ["Bench", benchCount, "#facc15"],
        ].map(([label, value, color]) => (
          <div
            key={String(label)}
            className="sharks-glass"
            style={{
              borderRadius: 20,
              padding: 14,
              border: `1px solid ${color}44`,
            }}
          >
            <div
              style={{
                color: "#aebed4",
                fontWeight: 900,
                fontSize: 11,
                letterSpacing: ".10em",
                textTransform: "uppercase",
              }}
            >
              {label}
            </div>
            <div
              style={{
                marginTop: 6,
                color: String(color),
                fontSize: 24,
                fontWeight: 1000,
                lineHeight: 1,
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
