"use client"

import { AlertTriangle, BrainCircuit, Zap } from "lucide-react"

const insights = [
  {
    icon: AlertTriangle,
    title: "Defensive instability",
    detail: "Left-side overload risk increasing",
    color: "#ef4444",
  },
  {
    icon: Zap,
    title: "Transition opportunity",
    detail: "Fast break available through right channel",
    color: "#22c55e",
  },
  {
    icon: BrainCircuit,
    title: "Tactical AI recommendation",
    detail: "Reduce defensive width by 8%",
    color: "#3b82f6",
  },
]

export default function FloatingIntelligenceOverlay() {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 100,
        right: 18,
        width: 320,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        zIndex: 100,
      }}
    >
      {insights.map((insight) => {
        const Icon = insight.icon

        return (
          <div
            key={insight.title}
            style={{
              padding: 14,
              borderRadius: 18,
              background: "rgba(2,6,23,0.92)",
              backdropFilter: "blur(18px)",
              border: `1px solid ${insight.color}55`,
              boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: `${insight.color}22`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={18} color={insight.color} />
            </div>

            <div>
              <div style={{ fontWeight: 800 }}>{insight.title}</div>
              <div
                style={{
                  marginTop: 4,
                  opacity: 0.72,
                  fontSize: 13,
                  lineHeight: 1.4,
                }}
              >
                {insight.detail}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
