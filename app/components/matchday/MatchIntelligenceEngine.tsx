"use client"

import { Cpu, Radar, Zap } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const engines = [
  {
    title: "Pressure Detection",
    status: "Active",
    icon: Radar,
    color: "#3b82f6",
  },
  {
    title: "Transition Analysis",
    status: "Monitoring",
    icon: Zap,
    color: "#f59e0b",
  },
  {
    title: "AI Match Core",
    status: "Operational",
    icon: Cpu,
    color: "#8b5cf6",
  },
]

export default function MatchIntelligenceEngine() {
  return (
    <OperationalCard
      title="Match Intelligence Engine"
      subtitle="Real-time tactical processing core"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {engines.map((engine) => {
          const Icon = engine.icon

          return (
            <div
              key={engine.title}
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
                    width: 46,
                    height: 46,
                    borderRadius: 14,
                    background: `${engine.color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={engine.color} />
                </div>

                <div>
                  <div style={{ fontWeight: 800 }}>
                    {engine.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      opacity: 0.72,
                    }}
                  >
                    Tactical engine processing
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontWeight: 900,
                  color: engine.color,
                }}
              >
                {engine.status}
              </div>
            </div>
          )
        })}
      </div>
    </OperationalCard>
  )
}
