"use client"

import { Clock3, GaugeCircle, Radar, Sparkles } from "lucide-react"

const timeline = [
  {
    minute: "08:14",
    event: "Pressing efficiency spike detected",
    type: "Momentum",
    icon: GaugeCircle,
  },
  {
    minute: "10:32",
    event: "Right-side overload increasing",
    type: "Spatial",
    icon: Radar,
  },
  {
    minute: "11:05",
    event: "AI transition window predicted",
    type: "Prediction",
    icon: Sparkles,
  },
  {
    minute: "11:42",
    event: "Workload threshold reached for Emily",
    type: "Player",
    icon: Clock3,
  },
]

export default function TacticalTimelineEngine() {
  return (
    <div
      style={{
        borderRadius: 28,
        padding: 20,
        background: "rgba(2,6,23,0.9)",
        border: "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(22px)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          MATCH ORCHESTRATION MEMORY
        </div>

        <div style={{ fontSize: 24, fontWeight: 900 }}>
          Tactical Timeline Engine
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {timeline.map((entry) => {
          const Icon = entry.icon

          return (
            <div
              key={entry.minute + entry.event}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: "rgba(37,99,235,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </div>

                <div
                  style={{
                    width: 2,
                    flex: 1,
                    background: "rgba(148,163,184,0.18)",
                  }}
                />
              </div>

              <div
                style={{
                  flex: 1,
                  borderRadius: 18,
                  padding: 16,
                  background: "rgba(15,23,42,0.82)",
                  border: "1px solid rgba(148,163,184,0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{entry.type}</div>
                  <div style={{ opacity: 0.72 }}>{entry.minute}</div>
                </div>

                <div style={{ fontWeight: 700 }}>{entry.event}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
