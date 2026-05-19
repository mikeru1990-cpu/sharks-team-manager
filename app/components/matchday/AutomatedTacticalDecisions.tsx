"use client"

import { Bot, ArrowUpRight, Shield } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const decisions = [
  {
    title: "Increase Pressing Intensity",
    detail: "AI engine recommends aggressive midfield press for next 5 mins.",
    icon: ArrowUpRight,
    color: "#ef4444",
  },
  {
    title: "Protect Defensive Shape",
    detail: "Opposition transition speed has increased on left side.",
    icon: Shield,
    color: "#22c55e",
  },
  {
    title: "Activate Tactical AI",
    detail: "Automated tactical orchestration currently enabled.",
    icon: Bot,
    color: "#8b5cf6",
  },
]

export default function AutomatedTacticalDecisions() {
  return (
    <OperationalCard
      title="Automated Tactical Decisions"
      subtitle="AI-driven operational recommendations"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {decisions.map((decision) => {
          const Icon = decision.icon

          return (
            <div
              key={decision.title}
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
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: `${decision.color}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={decision.color} />
              </div>

              <div>
                <div style={{ fontWeight: 800 }}>
                  {decision.title}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    opacity: 0.72,
                    lineHeight: 1.45,
                  }}
                >
                  {decision.detail}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </OperationalCard>
  )
}
