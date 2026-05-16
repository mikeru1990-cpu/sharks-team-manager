"use client"

type PlayerLoad = {
  id: string
  name: string
  minutes: number
  load: number
}

type Props = {
  players: PlayerLoad[]
}

function getLoadColor(load: number) {
  if (load >= 80) return "#ef4444"
  if (load >= 55) return "#f59e0b"
  return "#22c55e"
}

function getLoadLabel(load: number) {
  if (load >= 80) return "High Load"
  if (load >= 55) return "Managing"
  return "Fresh"
}

export default function PlayerLoadRings({ players }: Props) {
  return (
    <div
      style={{
        borderRadius: 30,
        border: "1px solid rgba(148,163,184,0.12)",
        background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))",
        padding: 24,
        boxShadow: "0 26px 60px rgba(0,0,0,0.45)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 22,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: 24,
              marginBottom: 4,
            }}
          >
            Player Load Monitoring
          </div>

          <div
            style={{
              color: "rgba(226,232,240,0.7)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Live fatigue, minutes and workload tracking
          </div>
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "8px 14px",
            background: "rgba(34,197,94,0.16)",
            border: "1px solid rgba(34,197,94,0.24)",
            color: "#bbf7d0",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          LIVE LOAD ENGINE
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
          gap: 18,
        }}
      >
        {players.map((player) => {
          const circumference = 2 * Math.PI * 52
          const offset = circumference - (player.load / 100) * circumference
          const color = getLoadColor(player.load)

          return (
            <div
              key={player.id}
              style={{
                borderRadius: 28,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                padding: 20,
                display: "grid",
                justifyItems: "center",
                textAlign: "center",
                boxShadow: `0 18px 40px ${color}22`,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 130,
                  height: 130,
                  marginBottom: 16,
                }}
              >
                <svg width="130" height="130">
                  <circle
                    cx="65"
                    cy="65"
                    r="52"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="10"
                    fill="none"
                  />

                  <circle
                    cx="65"
                    cy="65"
                    r="52"
                    stroke={color}
                    strokeWidth="10"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    transform="rotate(-90 65 65)"
                    style={{
                      transition: "all 0.4s ease",
                      filter: `drop-shadow(0 0 12px ${color})`,
                    }}
                  />
                </svg>

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        color: "white",
                        fontWeight: 900,
                        fontSize: 30,
                        lineHeight: 1,
                      }}
                    >
                      {player.load}%
                    </div>

                    <div
                      style={{
                        color,
                        fontWeight: 800,
                        fontSize: 12,
                        marginTop: 6,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {getLoadLabel(player.load)}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  color: "white",
                  fontWeight: 900,
                  fontSize: 18,
                  marginBottom: 6,
                }}
              >
                {player.name}
              </div>

              <div
                style={{
                  color: "rgba(226,232,240,0.72)",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {player.minutes} season minutes
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
