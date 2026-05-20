"use client"

import { ChevronRight, Shield, Users, Zap } from "lucide-react"

const sheetSections = [
  {
    icon: Shield,
    title: "Tactical Adjustments",
    items: [
      "Reduce defensive width",
      "Increase pressing trigger",
      "Compact midfield shape",
    ],
  },
  {
    icon: Users,
    title: "Player Actions",
    items: [
      "Prepare Emily substitution",
      "Monitor Ava workload",
      "Push Sophia higher",
    ],
  },
  {
    icon: Zap,
    title: "AI Recommendations",
    items: [
      "Counter window detected",
      "Possession swing predicted",
      "Transition efficiency rising",
    ],
  },
]

export default function TacticalSideSheet() {
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
            CONTEXTUAL INTELLIGENCE
          </div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>
            Tactical Side Sheet
          </div>
        </div>

        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            background: "rgba(37,99,235,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ChevronRight size={18} />
        </div>
      </div>

      {sheetSections.map((section) => {
        const Icon = section.icon

        return (
          <div
            key={section.title}
            style={{
              borderRadius: 20,
              padding: 16,
              background: "rgba(15,23,42,0.82)",
              border: "1px solid rgba(148,163,184,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: "rgba(37,99,235,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={18} />
              </div>

              <div style={{ fontWeight: 800 }}>{section.title}</div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {section.items.map((item) => (
                <div
                  key={item}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "rgba(2,6,23,0.72)",
                    fontWeight: 700,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        )}
      })}
    </div>
  )
}
