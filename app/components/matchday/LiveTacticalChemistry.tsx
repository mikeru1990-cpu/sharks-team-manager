"use client"

import { Blend, HeartPulse, Users } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const chemistrySystems = [
  {
    title: "Squad Chemistry",
    value: "Strong",
    icon: Users,
    color: "#22c55e",
  },
  {
    title: "Link-Up Intelligence",
    value: "Adaptive",
    icon: Blend,
    color: "#3b82f6",
  },
  {
    title: "Team Energy",
    value: "Stable",
    icon: HeartPulse,
    color: "#8b5cf6",
  },
]

export default function LiveTacticalChemistry() {
  return (
    <OperationalCard
      title="Live Tactical Chemistry"
      subtitle="Real-time squad cohesion intelligence"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {chemistrySystems.map((system) => {
          const Icon = system.icon

          return (
            <div
              key={system.title}
              style={{
                padding: 16,
                borderRadius: 18,
                background: "rgba(15,23,42,0.62)",
                border: `1px solid ${eliteTheme.colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${system.color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={system.color} />
                </div>

                <div>
                  <div style={{ fontWeight: 800 }}>{system.title}</div>
                  <div style={{ marginTop: 4, fontSize: 12, opacity: 0.72 }}>
                    Team chemistry systems adapting live
                  </div>
                </div>
              </div>

              <div style={{ fontWeight: 900, color: system.color }}>
                {system.value}
              </div>
            </div>
          )
        })}
      </div>
    </OperationalCard>
  )
}
