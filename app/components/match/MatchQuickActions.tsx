"use client"

import type { Player } from "../../lib/types"

type ActionType = "goal" | "assist" | "sub" | "injury" | "note"

type Props = {
  players: Player[]
  onQuickEvent: (
    type: ActionType,
    payload: {
      playerId?: string
      secondPlayerId?: string
    }
  ) => void
}

const actions = [
  {
    key: "goal",
    label: "Goal",
    emoji: "⚽",
    glow: "rgba(34,197,94,0.45)",
  },
  {
    key: "assist",
    label: "Assist",
    emoji: "🎯",
    glow: "rgba(59,130,246,0.45)",
  },
  {
    key: "sub",
    label: "Sub",
    emoji: "🔄",
    glow: "rgba(245,158,11,0.45)",
  },
  {
    key: "injury",
    label: "Injury",
    emoji: "🚑",
    glow: "rgba(239,68,68,0.45)",
  },
] as const

export default function MatchQuickActions({
  players,
  onQuickEvent,
}: Props) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 110,
        zIndex: 40,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,minmax(0,1fr))",
          gap: 12,
          padding: 14,
          borderRadius: 28,
          background: "rgba(15,23,42,0.92)",
          border: "1px solid rgba(148,163,184,0.14)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
        }}
      >
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => {
              const firstPlayer = players[0]

              onQuickEvent(action.key as ActionType, {
                playerId: firstPlayer?.id,
              })
            }}
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 22,
              padding: "18px 10px",
              background: "rgba(255,255,255,0.05)",
              color: "white",
              display: "grid",
              gap: 8,
              justifyItems: "center",
              cursor: "pointer",
              boxShadow: `0 10px 30px ${action.glow}`,
            }}
          >
            <div
              style={{
                fontSize: 28,
                lineHeight: 1,
              }}
            >
              {action.emoji}
            </div>

            <div
              style={{
                fontWeight: 800,
                fontSize: 13,
                letterSpacing: "0.02em",
              }}
            >
              {action.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
