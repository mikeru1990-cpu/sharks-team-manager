"use client"

import { Cpu, Gauge, Orbit, ShieldCheck } from "lucide-react"

const states = [
  {
    label: "Operational Tempo",
    value: "High",
    icon: Gauge,
  },
  {
    label: "Defensive Stability",
    value: "Recovering",
    icon: ShieldCheck,
  },
  {
    label: "AI Orchestration",
    value: "Adaptive",
    icon: Cpu,
  },
  {
    label: "Spatial Control",
    value: "Dominant",
    icon: Orbit,
  },
]

export default function AdaptiveStateEngine() {
  return (
    <div
      style={{
        borderRadius: 28,
        padding: 20,
        background: "rgba(2,6,23,0.9)",
        border: "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(22px)",
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          LIVE OPERATIONAL STATES
        </div>
        <div style={{ fontSize: 24, fontWeight: 900 }}>
          Adaptive State Engine
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {states.map((state) => {
          const Icon = state.icon

          return (
            <div
              key={state.label}
              style={{
                borderRadius: 20,
                padding: 16,
                background: "rgba(15,23,42,0.82)",
                border: "1px solid rgba(148,163,184,0.08)",
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  background: "rgba(37,99,235,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                }}
              >
                <Icon size={18} />
              </div>

              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {state.label}
              </div>

              <div
                style={{
                  marginTop: 6,
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                {state.value}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
