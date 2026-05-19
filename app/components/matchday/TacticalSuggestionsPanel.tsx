"use client"

import { Brain, ChevronRight, Sparkles } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const suggestions = [
  {
    title: "Increase midfield pressure",
    detail: "Momentum engine detects space between midfield lines.",
  },
  {
    title: "Rotate Bella within 4 mins",
    detail: "Player workload has exceeded optimal threshold.",
  },
  {
    title: "Push Grace higher",
    detail: "Opposition defensive shape is collapsing centrally.",
  },
]

export default function TacticalSuggestionsPanel() {
  return (
    <OperationalCard
      title="Tactical Suggestions"
      subtitle="AI-assisted live coaching intelligence"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.title}
            style={{
              padding: 16,
              borderRadius: 18,
              background: "rgba(15,23,42,0.62)",
              border: `1px solid ${eliteTheme.colors.border}`,
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: "rgba(139,92,246,0.18)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Brain size={20} color="#8b5cf6" />
            </div>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <div style={{ fontWeight: 800 }}>
                  {suggestion.title}
                </div>

                <Sparkles size={16} color="#8b5cf6" />
              </div>

              <div
                style={{
                  fontSize: 12,
                  opacity: 0.72,
                  marginTop: 6,
                  lineHeight: 1.45,
                }}
              >
                {suggestion.detail}
              </div>
            </div>

            <ChevronRight size={18} opacity={0.6} />
          </div>
        ))}
      </div>
    </OperationalCard>
  )
}
