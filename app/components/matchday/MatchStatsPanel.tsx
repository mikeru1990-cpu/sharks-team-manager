"use client"

import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const stats = [
  {
    label: "Possession",
    value: "62%",
  },
  {
    label: "Shots",
    value: "11",
  },
  {
    label: "Pass Accuracy",
    value: "84%",
  },
  {
    label: "Corners",
    value: "5",
  },
]

export default function MatchStatsPanel() {
  return (
    <OperationalCard
      title="Live Match Statistics"
      subtitle="Real-time performance overview"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: 16,
              borderRadius: 16,
              background: "rgba(15,23,42,0.62)",
              border: `1px solid ${eliteTheme.colors.border}`,
            }}
          >
            <div
              style={{
                fontSize: 13,
                opacity: 0.72,
                marginBottom: 8,
                fontWeight: 700,
              }}
            >
              {stat.label}
            </div>

            <div
              style={{
                fontSize: 28,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
          </div>
        ))}
      </div>
    </OperationalCard>
  )
}
