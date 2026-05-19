"use client"

import { Flag, ShieldAlert, Trophy, UserPlus } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const actions = [
  {
    label: "Goal",
    icon: Trophy,
  },
  {
    label: "Assist",
    icon: UserPlus,
  },
  {
    label: "Injury",
    icon: ShieldAlert,
  },
  {
    label: "Set Piece",
    icon: Flag,
  },
]

export default function EventCreationSheet() {
  return (
    <OperationalCard
      title="Create Match Event"
      subtitle="Live operational event controls"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <button
              key={action.label}
              style={{
                border: "none",
                borderRadius: 18,
                background: eliteTheme.gradients.primary,
                color: eliteTheme.colors.text,
                padding: "18px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                fontWeight: 800,
                cursor: "pointer",
                boxShadow: eliteTheme.shadows.glowBlue,
              }}
            >
              <Icon size={22} />
              {action.label}
            </button>
          )
        })}
      </div>
    </OperationalCard>
  )
}
