"use client"

import { useState } from "react"
import {
  ArrowUpRight,
  Shield,
  Target,
  Zap,
} from "lucide-react"

const tacticalModes = [
  {
    id: "press",
    label: "High Press",
    icon: Zap,
    description: "Aggressive forward pressure orchestration enabled.",
  },
  {
    id: "shape",
    label: "Compact Shape",
    icon: Shield,
    description: "Defensive compactness and spatial control enabled.",
  },
  {
    id: "attack",
    label: "Transition Attack",
    icon: ArrowUpRight,
    description: "Fast attacking transition logic activated.",
  },
  {
    id: "control",
    label: "Possession Control",
    icon: Target,
    description: "Tempo stabilization and control sequencing active.",
  },
]

export default function LiveTacticalControlCenter() {
  const [activeMode, setActiveMode] = useState("press")

  const active = tacticalModes.find((mode) => mode.id === activeMode)

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
      <div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          LIVE MATCH ORCHESTRATION
        </div>

        <div style={{ fontSize: 26, fontWeight: 900 }}>
          Tactical Control Center
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {tacticalModes.map((mode) => {
          const Icon = mode.icon
          const activeState = activeMode === mode.id

          return (
            <button
              key={mode.id}
              onClick={() => setActiveMode(mode.id)}
              style={{
                border: "none",
                borderRadius: 22,
                padding: 18,
                background: activeState
                  ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                  : "rgba(15,23,42,0.82)",
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 12,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon size={20} />
              </div>

              <div style={{ fontWeight: 900, fontSize: 16 }}>
                {mode.label}
              </div>
            </button>
          )
        })}
      </div>

      <div
        style={{
          borderRadius: 24,
          padding: 20,
          background: "rgba(15,23,42,0.82)",
          border: "1px solid rgba(148,163,184,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 22 }}>
            {active?.label}
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
            ACTIVE
          </div>
        </div>

        <div
          style={{
            lineHeight: 1.7,
            opacity: 0.9,
            fontWeight: 700,
          }}
        >
          {active?.description}
        </div>
      </div>
    </div>
  )
}
