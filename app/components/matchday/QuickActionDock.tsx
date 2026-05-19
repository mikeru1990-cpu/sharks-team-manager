"use client"

import { Flag, Repeat, ShieldAlert, Trophy } from "lucide-react"
import { eliteTheme } from "../../lib/eliteTheme"

const actions = [
  {
    label: "Goal",
    icon: Trophy,
  },
  {
    label: "Sub",
    icon: Repeat,
  },
  {
    label: "Injury",
    icon: ShieldAlert,
  },
  {
    label: "Quarter",
    icon: Flag,
  },
]

export default function QuickActionDock() {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 90,
        zIndex: 120,
        display: "flex",
        justifyContent: "center",
        marginTop: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          padding: "12px 14px",
          borderRadius: 999,
          background: "rgba(2,6,23,0.84)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${eliteTheme.colors.border}`,
          boxShadow: eliteTheme.shadows.medium,
        }}
      >
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <button
              key={action.label}
              style={{
                border: "none",
                borderRadius: eliteTheme.radius.full,
                background: eliteTheme.gradients.primary,
                color: eliteTheme.colors.text,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: eliteTheme.shadows.glowBlue,
              }}
            >
              <Icon size={16} />
              {action.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
