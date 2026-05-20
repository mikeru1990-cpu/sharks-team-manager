"use client"

import { useState } from "react"
import { BrainCircuit, Shield, Target, Users } from "lucide-react"

const tabs = [
  {
    id: "tactical",
    label: "Tactical",
    icon: Shield,
    content: "Live tactical orchestration controls active.",
  },
  {
    id: "players",
    label: "Players",
    icon: Users,
    content: "Player workload and substitution intelligence active.",
  },
  {
    id: "strategy",
    label: "Strategy",
    icon: Target,
    content: "Adaptive strategy orchestration and pressure mapping active.",
  },
  {
    id: "ai",
    label: "AI",
    icon: BrainCircuit,
    content: "Autonomous tactical intelligence systems synchronized.",
  },
]

export default function InteractiveWorkspaceTabs() {
  const [activeTab, setActiveTab] = useState("tactical")

  const activeContent = tabs.find((tab) => tab.id === activeTab)

  return (
    <div
      style={{
        borderRadius: 28,
        padding: 18,
        background: "rgba(2,6,23,0.9)",
        border: "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(22px)",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
          marginBottom: 18,
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                border: "none",
                borderRadius: 18,
                padding: "12px 16px",
                background: active
                  ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                  : "rgba(15,23,42,0.82)",
                color: "white",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: 800,
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        style={{
          borderRadius: 22,
          padding: 20,
          background: "rgba(15,23,42,0.82)",
          border: "1px solid rgba(148,163,184,0.08)",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
          {activeContent?.label}
        </div>

        <div
          style={{
            lineHeight: 1.6,
            opacity: 0.9,
            fontWeight: 700,
          }}
        >
          {activeContent?.content}
        </div>
      </div>
    </div>
  )
}
