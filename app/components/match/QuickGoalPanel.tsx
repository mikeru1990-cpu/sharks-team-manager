"use client"

import type { Player } from "../../lib/types"

type Props = {
  players: Player[]
  onGoal: (playerId: string) => void
}

export default function QuickGoalPanel({ players, onGoal }: Props) {
  return (
    <div
      style={{
        borderRadius: 30,
        border: "1px solid rgba(148,163,184,0.12)",
        background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))",
        padding: 22,
        boxShadow: "0 24px 60px rgba(0,0,0,0.42)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div>
          <div
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: 22,
              marginBottom: 4,
            }}
          >
            Instant Goal Logging
          </div>

          <div
            style={{
              color: "rgba(226,232,240,0.7)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Tap scorer → goal instantly saved
          </div>
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "8px 14px",
            background: "rgba(34,197,94,0.16)",
            border: "1px solid rgba(34,197,94,0.22)",
            color: "#bbf7d0",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          TOUCHLINE MODE
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
          gap: 14,
        }}
      >
        {players.map((player) => (
          <button
            key={player.id}
            onClick={() => onGoal(player.id)}
            style={{
              borderRadius: 24,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.05)",
              padding: "18px 14px",
              display: "grid",
              gap: 8,
              textAlign: "left",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 16px 36px rgba(34,197,94,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  background: "linear-gradient(135deg,#22c55e,#3b82f6)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 22,
                }}
              >
                ⚽
              </div>

              <div
                style={{
                  borderRadius: 999,
                  padding: "5px 10px",
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(226,232,240,0.8)",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {player.positions.join(" • ")}
              </div>
            </div>

            <div>
              <div
                style={{
                  color: "white",
                  fontWeight: 900,
                  fontSize: 18,
                  lineHeight: 1.1,
                  marginBottom: 6,
                }}
              >
                {player.name}
              </div>

              <div
                style={{
                  color: "#86efac",
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Tap to log goal
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
