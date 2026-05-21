"use client"

import { useMatchStateStore } from "../../lib/matchStateStore"

export default function LivePlayerPositionEngine() {
  const players = useMatchStateStore((state) => state.players)

  const movePlayer = useMatchStateStore(
    (state) => state.movePlayer,
  )

  return (
    <div
      style={{
        position: "relative",
        borderRadius: 30,
        overflow: "hidden",
        background:
          "linear-gradient(180deg,#14532d 0%,#166534 100%)",
        border: "2px solid rgba(255,255,255,0.08)",
        minHeight: 520,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 74px)",
        }}
      />

      {players.map((player) => (
        <div
          key={player.id}
          style={{
            position: "absolute",
            left: `${player.x}%`,
            top: `${player.y}%`,
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg,#2563eb,#7c3aed)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              color: "white",
              boxShadow: "0 10px 24px rgba(0,0,0,0.35)",
            }}
          >
            {player.name[0]}
          </div>

          <div
            style={{
              fontWeight: 800,
              color: "white",
              fontSize: 12,
            }}
          >
            {player.name}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 24px)",
              gap: 4,
            }}
          >
            <div />

            <button
              onClick={() => movePlayer(player.id, "up")}
              style={buttonStyle}
            >
              ↑
            </button>

            <div />

            <button
              onClick={() => movePlayer(player.id, "left")}
              style={buttonStyle}
            >
              ←
            </button>

            <button
              onClick={() => movePlayer(player.id, "down")}
              style={buttonStyle}
            >
              ↓
            </button>

            <button
              onClick={() => movePlayer(player.id, "right")}
              style={buttonStyle}
            >
              →
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

const buttonStyle = {
  border: "none",
  borderRadius: 8,
  background: "rgba(2,6,23,0.88)",
  color: "white",
  cursor: "pointer",
  width: 24,
  height: 24,
  fontWeight: 900,
} satisfies React.CSSProperties
