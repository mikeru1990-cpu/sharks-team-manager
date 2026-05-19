"use client"

import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const workload = [
  {
    player: "Ava",
    load: 82,
  },
  {
    player: "Emily",
    load: 67,
  },
  {
    player: "Bella",
    load: 91,
  },
]

export default function PlayerWorkloadPanel() {
  return (
    <OperationalCard
      title="Player Load"
      subtitle="Live workload monitoring"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {workload.map((item) => (
          <div key={item.player}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
                fontWeight: 800,
              }}
            >
              <span>{item.player}</span>
              <span>{item.load}%</span>
            </div>

            <div
              style={{
                width: "100%",
                height: 10,
                borderRadius: 999,
                background: "rgba(15,23,42,0.62)",
                overflow: "hidden",
                border: `1px solid ${eliteTheme.colors.border}`,
              }}
            >
              <div
                style={{
                  width: `${item.load}%`,
                  height: "100%",
                  background:
                    item.load > 85
                      ? "#ef4444"
                      : item.load > 70
                      ? "#f59e0b"
                      : "#22c55e",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </OperationalCard>
  )
}
