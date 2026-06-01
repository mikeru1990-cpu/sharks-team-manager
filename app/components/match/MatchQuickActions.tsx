"use client"

import type { Player, TimelineEventType } from "../../lib/types"

type Props = {
  players?: Player[]
  timelineCount?: number
  onQuickEvent?: (
    type: TimelineEventType,
    payload: {
      playerId?: string
      secondPlayerId?: string
    }
  ) => void
  setEventDraft?: (value: {
    type: TimelineEventType
    playerId: string
    secondPlayerId: string
    note: string
  }) => void
  openCreateEvent?: () => void
}

const actions: Array<{
  key: TimelineEventType
  label: string
  emoji: string
  glow: string
  border: string
}> = [
  { key: "goal", label: "Goal", emoji: "⚽", glow: "rgba(34,197,94,0.45)", border: "rgba(34,197,94,0.60)" },
  { key: "assist", label: "Assist", emoji: "🎯", glow: "rgba(59,130,246,0.45)", border: "rgba(56,189,248,0.60)" },
  { key: "sub", label: "Sub", emoji: "🔄", glow: "rgba(245,158,11,0.45)", border: "rgba(250,204,21,0.62)" },
  { key: "injury", label: "Injury", emoji: "🚑", glow: "rgba(239,68,68,0.45)", border: "rgba(251,113,133,0.62)" },
  { key: "note", label: "Note", emoji: "📝", glow: "rgba(167,139,250,0.45)", border: "rgba(167,139,250,0.62)" },
]

export default function MatchQuickActions({
  players = [],
  timelineCount = 0,
  onQuickEvent,
  setEventDraft,
  openCreateEvent,
}: Props) {
  function openAction(type: TimelineEventType) {
    const firstPlayer = players[0]

    setEventDraft?.({ type, playerId: firstPlayer?.id || "", secondPlayerId: "", note: "" })
    onQuickEvent?.(type, { playerId: firstPlayer?.id })
    openCreateEvent?.()
  }

  return (
    <div
      className="sharks-glass sharks-card-shine"
      style={{
        position: "sticky",
        bottom: 110,
        zIndex: 40,
        borderRadius: 28,
        padding: 14,
        border: "1px solid rgba(125,211,252,0.22)",
        boxShadow: "0 24px 60px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap", marginBottom: 12 }}>
        <div>
          <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".15em" }}>
            MATCHDAY QUICK ACTIONS
          </div>
          <div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 750, marginTop: 4 }}>
            One-tap capture for goals, assists, subs, injuries and notes.
          </div>
        </div>
        <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 900 }}>{timelineCount} events logged</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,minmax(0,1fr))",
          gap: 10,
        }}
      >
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => openAction(action.key)}
            className="sharks-touch-target"
            style={{
              border: `1px solid ${action.border}`,
              borderRadius: 22,
              padding: "16px 8px",
              background: "linear-gradient(135deg, rgba(255,255,255,0.075), rgba(2,6,23,0.52))",
              color: "white",
              display: "grid",
              gap: 7,
              justifyItems: "center",
              cursor: "pointer",
              boxShadow: `0 10px 30px ${action.glow}`,
              minWidth: 0,
            }}
          >
            <div style={{ fontSize: 26, lineHeight: 1 }}>{action.emoji}</div>
            <div style={{ fontWeight: 1000, fontSize: 12, letterSpacing: "0.02em" }}>{action.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
