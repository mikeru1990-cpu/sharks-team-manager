"use client"

import { Move } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const players = [
  "Emily",
  "Bella",
  "Sophia",
  "Ava",
  "Lily",
  "Grace",
]

export default function TacticalDragBoard() {
  return (
    <OperationalCard
      title="Tactical Drag Board"
      subtitle="Interactive tactical movement layer"
    >
      <div
        style={{
          position: "relative",
          minHeight: 420,
          borderRadius: 22,
          overflow: "hidden",
          background:
            "linear-gradient(180deg,#14532d 0%, #166534 100%)",
          border: `1px solid ${eliteTheme.colors.border}`,
          padding: 20,
        }}
      >
        {players.map((player, index) => (
          <div
            key={player}
            style={{
              position: "absolute",
              top: `${40 + index * 52}px`,
              left: `${40 + (index % 2) * 140}px`,
              width: 88,
              height: 88,
              borderRadius: 999,
              background: eliteTheme.gradients.primary,
              color: eliteTheme.colors.text,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontWeight: 800,
              textAlign: "center",
              cursor: "grab",
              boxShadow: eliteTheme.shadows.glowBlue,
              border: `2px solid ${eliteTheme.colors.border}`,
            }}
          >
            <Move size={16} />
            <span style={{ fontSize: 12 }}>{player}</span>
          </div>
        ))}
      </div>
    </OperationalCard>
  )
}
