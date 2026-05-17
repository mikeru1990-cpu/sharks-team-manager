"use client"

import { eliteTheme } from "../../lib/eliteTheme"

type Props = {
  onGoal?: () => void
  onAssist?: () => void
  onSub?: () => void
  onInjury?: () => void
  onCard?: () => void
}

const actions = [
  {
    key: "goal",
    icon: "⚽",
    label: "Goal",
  },
  {
    key: "assist",
    icon: "🎯",
    label: "Assist",
  },
  {
    key: "sub",
    icon: "🔄",
    label: "Sub",
  },
  {
    key: "injury",
    icon: "🚑",
    label: "Injury",
  },
  {
    key: "card",
    icon: "🟨",
    label: "Card",
  },
] as const

export default function FloatingMatchActionDock({
  onGoal,
  onAssist,
  onSub,
  onInjury,
  onCard,
}: Props) {
  const handlePress = (key: string) => {
    if (key === "goal") onGoal?.()
    if (key === "assist") onAssist?.()
    if (key === "sub") onSub?.()
    if (key === "injury") onInjury?.()
    if (key === "card") onCard?.()
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 22,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "calc(100% - 28px)",
        maxWidth: 560,
        padding: 10,
        borderRadius: eliteTheme.radius.xl,
        background: "rgba(15,23,42,0.72)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: `1px solid ${eliteTheme.colors.border}`,
        boxShadow: `${eliteTheme.shadows.large}, ${eliteTheme.shadows.glowBlue}`,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 10,
        }}
      >
        {actions.map((action) => (
          <button
            key={action.key}
            onClick={() => handlePress(action.key)}
            style={{
              border: `1px solid ${eliteTheme.colors.border}`,
              background: "rgba(30,41,59,0.72)",
              borderRadius: eliteTheme.radius.md,
              padding: "12px 8px",
              color: eliteTheme.colors.text,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              boxShadow: eliteTheme.shadows.soft,
              transition: eliteTheme.animation.fast,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                fontSize: 24,
                lineHeight: 1,
              }}
            >
              {action.icon}
            </span>

            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: eliteTheme.colors.textMuted,
              }}
            >
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
