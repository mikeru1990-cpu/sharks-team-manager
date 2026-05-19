"use client"

import { ArrowUpDown, BarChart3, TimerReset } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const flowSystems = [
  {
    title: "Game Flow Tracking",
    value: "Realtime",
    icon: BarChart3,
    color: "#3b82f6",
  },
  {
    title: "Momentum Transition",
    value: "Adaptive",
    icon: ArrowUpDown,
    color: "#22c55e",
  },
  {
    title: "Tempo Recovery",
    value: "Stable",
    icon: TimerReset,
    color: "#8b5cf6",
  },
]

export default function AdaptiveGameFlowEngine() {
  return (
    <OperationalCard
      title="Adaptive Game Flow Engine"
      subtitle="Live game tempo and momentum orchestration"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {flowSystems.map((system) => {
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
                  <div style={{ fontWeight: 800 }}>
                    {system.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      opacity: 0.72,
                    }}
                  >
                    Match flow systems adapting live
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontWeight: 900,
                  color: system.color,
                }}
              >
                {system.value}
              </div>
            </div>
          )}
        )}
      </div>
    </OperationalCard>
  )
}
