"use client"

export type FormGame = {
  id: string
  opponent: string
  result: "W" | "D" | "L"
  goalsFor: number
  goalsAgainst: number
}

type Props = {
  games: FormGame[]
}

function getResultColor(result: FormGame["result"]) {
  if (result === "W") return "#22c55e"
  if (result === "D") return "#f59e0b"
  return "#ef4444"
}

export default function TeamFormAnalytics({ games }: Props) {
  const totalGames = games.length
  const wins = games.filter((g) => g.result === "W").length
  const draws = games.filter((g) => g.result === "D").length
  const losses = games.filter((g) => g.result === "L").length
  const goalsFor = games.reduce((sum, game) => sum + game.goalsFor, 0)
  const goalsAgainst = games.reduce((sum, game) => sum + game.goalsAgainst, 0)

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
          marginBottom: 24,
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
            Team Form Analytics
          </div>

          <div
            style={{
              color: "rgba(226,232,240,0.7)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Live season performance and recent form trends
          </div>
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
          SEASON INTELLIGENCE
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 16,
          marginBottom: 26,
        }}
      >
        {[
          { label: "Played", value: totalGames },
          { label: "Wins", value: wins },
          { label: "Draws", value: draws },
          { label: "Losses", value: losses },
          { label: "Goals For", value: goalsFor },
          { label: "Goals Against", value: goalsAgainst },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              borderRadius: 22,
              padding: 18,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                color: "rgba(226,232,240,0.72)",
                fontWeight: 700,
                fontSize: 13,
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                color: "white",
                fontWeight: 900,
                fontSize: 32,
                lineHeight: 1,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          overflowX: "auto",
          paddingBottom: 6,
        }}
      >
        {games.map((game) => {
          const color = getResultColor(game.result)

          return (
            <div
              key={game.id}
              style={{
                minWidth: 150,
                borderRadius: 24,
                padding: 18,
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${color}44`,
                boxShadow: `0 16px 36px ${color}22`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontWeight: 800,
                    fontSize: 14,
                  }}
                >
                  {game.opponent}
                </div>

                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 14,
                    background: `${color}22`,
                    border: `1px solid ${color}44`,
                    color,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    fontSize: 16,
                  }}
                >
                  {game.result}
                </div>
              </div>

              <div
                style={{
                  color: "rgba(226,232,240,0.82)",
                  fontWeight: 800,
                  fontSize: 18,
                }}
              >
                {game.goalsFor} - {game.goalsAgainst}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
