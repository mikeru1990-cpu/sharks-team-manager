"use client"

import { GaugeCircle, Sparkline, Trophy } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const scoring = [
  {
    title: "Performance Rating",
    value: "8.7",
    icon: Trophy,
    color: "#f59e0b",
  },
  {
    title: "Momentum Score",
    value: "+14",
    icon: Sparkline,
    color: "#22c55e",
  },
  {
    title: "Tactical Efficiency",
    value: "91%",
    icon: GaugeCircle,
    color: "#3b82f6",
  },
]

export default function RealTimeScoringEngine() {
  return (
    <OperationalCard
      title="Real-Time Scoring Engine"
      subtitle="Live tactical and performance scoring"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 12,
        }}
      >
        {scoring.map((item) => {
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
                  <Icon size={20} color={item.color} />
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
                    Live intelligence processing
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontWeight: 900,
                  fontSize: 24,
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
