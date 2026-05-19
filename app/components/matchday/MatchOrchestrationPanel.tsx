"use client"

import { BrainCircuit, Layers3, RadioTower } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

export default function MatchOrchestrationPanel() {
  return (
    <OperationalCard
      title="Match Orchestration"
      subtitle="Live operational intelligence engine"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
        }}
      >
        {[
          {
            icon: BrainCircuit,
            title: "Tactical Intelligence",
            value: "Adaptive",
            color: "#8b5cf6",
          },
          {
            icon: RadioTower,
            title: "Live Match State",
            value: "Synchronized",
            color: "#22c55e",
          },
          {
            icon: Layers3,
            title: "Operational Layers",
            value: "12 Active",
            color: "#3b82f6",
          },
        ].map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.title}
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
                    background: `${item.color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={22} color={item.color} />
                </div>

                <div>
                  <div style={{ fontWeight: 800 }}>
                    {item.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      opacity: 0.72,
                    }}
                  >
                    Core engine operational
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontWeight: 900,
                  color: item.color,
                }}
              >
                {item.value}
              </div>
            </div>
          )
        })}
      </div>
    </OperationalCard>
  )
}
