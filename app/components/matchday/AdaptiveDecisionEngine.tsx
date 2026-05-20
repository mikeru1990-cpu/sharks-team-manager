"use client"

import {
  Brain,
  CircleAlert,
  Route,
  ShieldPlus,
} from "lucide-react"

const decisions = [
  {
    title: "Defensive Compression",
    recommendation: "Reduce left-side exposure by narrowing midfield spacing",
    confidence: 91,
    icon: ShieldPlus,
  },
  {
    title: "Transition Opportunity",
    recommendation: "Exploit right-side transition lane within next 90 seconds",
    confidence: 87,
    icon: Route,
  },
  {
    title: "Player Load Management",
    recommendation: "Prepare Emily substitution within next phase",
    confidence: 93,
    icon: CircleAlert,
  },
]

export default function AdaptiveDecisionEngine() {
  return (
    <div
      style={{
        borderRadius: 30,
        padding: 22,
        background: "rgba(2,6,23,0.92)",
        border: "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            LIVE DECISION ORCHESTRATION
          </div>

          <div style={{ fontSize: 26, fontWeight: 900 }}>
            Adaptive Decision Engine
          </div>
        </div>

        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            background: "rgba(37,99,235,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Brain size={22} />
        </div>
      </div>

      {decisions.map((decision) => {
        const Icon = decision.icon

        return (
          <div
            key={decision.title}
            style={{
              borderRadius: 22,
              padding: 18,
              background: "rgba(15,23,42,0.82)",
              border: "1px solid rgba(148,163,184,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 16,
                    background: "rgba(37,99,235,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} />
                </div>

                <div>
                  <div style={{ fontWeight: 900 }}>
                    {decision.title}
                  </div>

                  <div style={{ opacity: 0.76, marginTop: 4 }}>
                    AI Confidence {decision.confidence}%
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(34,197,94,0.18)",
                  color: "#22c55e",
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                Recommended
              </div>
            </div>

            <div
              style={{
                lineHeight: 1.6,
                opacity: 0.9,
                fontWeight: 700,
              }}
            >
              {decision.recommendation}
            </div>
          </div>
        )
      })}
    </div>
  )
}
