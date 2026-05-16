"use client"

type Props = {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  currentMinute: number
  currentPeriod: number
  periodMode: "quarters" | "halves"
  momentumLabel?: string
}

export default function LiveMatchHud({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  currentMinute,
  currentPeriod,
  periodMode,
  momentumLabel = "Sharks Momentum",
}: Props) {
  return (
    <div
      style={{
        position: "sticky",
        top: 12,
        zIndex: 45,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          borderRadius: 30,
          overflow: "hidden",
          border: "1px solid rgba(148,163,184,0.12)",
          background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))",
          boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
          backdropFilter: "blur(18px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: 18,
            padding: "20px 22px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(191,219,254,0.75)",
                marginBottom: 8,
              }}
            >
              Home
            </div>

            <div
              style={{
                color: "white",
                fontSize: 20,
                fontWeight: 900,
                lineHeight: 1.1,
              }}
            >
              {homeTeam}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              justifyItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                color: "white",
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {homeScore}
              </span>

              <span
                style={{
                  fontSize: 20,
                  opacity: 0.5,
                  fontWeight: 700,
                }}
              >
                -
              </span>

              <span
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {awayScore}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  borderRadius: 999,
                  padding: "6px 12px",
                  background: "rgba(34,197,94,0.18)",
                  border: "1px solid rgba(34,197,94,0.22)",
                  color: "#bbf7d0",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                LIVE {currentMinute}'
              </div>

              <div
                style={{
                  borderRadius: 999,
                  padding: "6px 12px",
                  background: "rgba(59,130,246,0.16)",
                  border: "1px solid rgba(59,130,246,0.22)",
                  color: "#bfdbfe",
                  fontWeight: 800,
                  fontSize: 13,
                }}
              >
                {periodMode === "quarters" ? "Q" : "H"}
                {currentPeriod}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "rgba(191,219,254,0.75)",
                marginBottom: 8,
              }}
            >
              Away
            </div>

            <div
              style={{
                color: "white",
                fontSize: 20,
                fontWeight: 900,
                lineHeight: 1.1,
              }}
            >
              {awayTeam}
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <div
            style={{
              color: "rgba(226,232,240,0.88)",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {momentumLabel}
          </div>

          <div
            style={{
              width: 140,
              height: 8,
              borderRadius: 999,
              overflow: "hidden",
              background: "rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                width: "72%",
                height: "100%",
                background: "linear-gradient(90deg,#22c55e,#3b82f6)",
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
