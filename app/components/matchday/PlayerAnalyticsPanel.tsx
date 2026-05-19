"use client"

import { Activity, Gauge, TrendingUp } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const analytics = [
  {
    player: "Ava",
    metric: "Impact",
    value: "9.1",
    icon: TrendingUp,
    color: "#22c55e",
  },
  {
    player: "Emily",
    metric: "Intensity",
    value: "87%",
    icon: Activity,
    color: "#3b82f6",
  },
  {
    player: "Bella",
    metric: "Efficiency",
    value: "94%",
    icon: Gauge,
    color: "#f59e0b",
  },
]

export default function PlayerAnalyticsPanel() {
  return (
    <OperationalCard
      title="Player Analytics"
      subtitle="Advanced live performance intelligence"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {analytics.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.player}
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
                    background: `${item.color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={item.color} />
                </div>

                <div>
                  <div style={{ fontWeight: 800 }}>
                    {item.player}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      opacity: 0.72,
                      marginTop: 4,
                    }}
                  >
                    {item.metric}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 22,
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
