"use client"

import { Brain, Cpu, GraduationCap } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const learningSystems = [
  {
    title: "Pattern Recognition",
    value: "Learning",
    icon: Brain,
    color: "#8b5cf6",
  },
  {
    title: "AI Tactical Memory",
    value: "Expanding",
    icon: Cpu,
    color: "#3b82f6",
  },
  {
    title: "Coaching Intelligence",
    value: "Adaptive",
    icon: GraduationCap,
    color: "#22c55e",
  },
]

export default function TacticalLearningCore() {
  return (
    <OperationalCard
      title="Tactical Learning Core"
      subtitle="Adaptive AI coaching memory engine"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {learningSystems.map((system) => {
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
                    Tactical intelligence evolving live
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
          )
        })}
      </div>
    </OperationalCard>
  )
}
