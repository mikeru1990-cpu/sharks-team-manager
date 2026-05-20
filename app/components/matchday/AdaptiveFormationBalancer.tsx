"use client"

import { Compass, MoveHorizontal, ShieldCheck } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const formationSystems = [
  {
    title: "Formation Balance",
    value: "Stable",
    icon: Compass,
    color: "#3b82f6",
  },
  {
    title: "Shape Transition",
    value: "Adaptive",
    icon: MoveHorizontal,
    color: "#22c55e",
  },
  {
    title: "Defensive Structure",
    value: "Protected",
    icon: ShieldCheck,
    color: "#8b5cf6",
  },
]

export default function AdaptiveFormationBalancer() {
  return (
    <OperationalCard
      title="Adaptive Formation Balancer"
      subtitle="Live formation stability orchestration"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {formationSystems.map((system) => {
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
                    Formation systems adapting live
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
