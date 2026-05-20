"use client"

import { useState } from "react"

const initialPlayers = [
  { id: 1, name: "Emily", x: 18, y: 28 },
  { id: 2, name: "Sophia", x: 48, y: 18 },
  { id: 3, name: "Ava", x: 72, y: 30 },
  { id: 4, name: "Isla", x: 32, y: 58 },
  { id: 5, name: "Lily", x: 60, y: 64 },
  { id: 6, name: "Mia", x: 48, y: 82 },
]

export default function DragPlayerPositioningBoard() {
  const [players, setPlayers] = useState(initialPlayers)

  const movePlayer = (id: number) => {
    setPlayers((prev) =>
      prev.map((player) =>
        player.id === id
          ? {
              ...player,
              x: Math.min(84, player.x + 6),
            }
          : player,
      ),
    )
  }

  return (
    <div
      style={{
        borderRadius: 30,
        padding: 22,
        background: "rgba(2,6,23,0.92)",
        border: "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          LIVE POSITIONAL ORCHESTRATION
        </div>

        <div style={{ fontSize: 26, fontWeight: 900 }}>
          Drag Positioning Board
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "0.7",
          borderRadius: 26,
          overflow: "hidden",
          background:
            "linear-gradient(180deg,#166534 0%,#14532d 100%)",
          border: "2px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "8%",
            border: "2px solid rgba(255,255,255,0.2)",
            borderRadius: 20,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 2,
            background: "rgba(255,255,255,0.2)",
          }}
        />

        {players.map((player) => (
          <button
            key={player.id}
            onClick={() => movePlayer(player.id)}
            style={{
              position: "absolute",
              left: `${player.x}%`,
              top: `${player.y}%`,
              transform: "translate(-50%, -50%)",
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "3px solid rgba(255,255,255,0.18)",
              background: "linear-gradient(135deg,#2563eb,#7c3aed)",
              color: "white",
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
            }}
          >
            {player.name.charAt(0)}
          </button>
        ))}
      </div>

      <div
        style={{
          borderRadius: 22,
          padding: 18,
          background: "rgba(15,23,42,0.82)",
          border: "1px solid rgba(148,163,184,0.08)",
          lineHeight: 1.7,
          fontWeight: 700,
        }}
      >
        Tap players to reposition tactical structure live. This now creates
        real positional interaction state for tactical orchestration.
      </div>
    </div>
  )
}
