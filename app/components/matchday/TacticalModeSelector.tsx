"use client"

import { useMatchStateStore } from "../../lib/matchStateStore"

const tacticalModes = [
  {
    key: "high-press",
    title: "High Press",
    description: "Aggressive pressure and transition intensity",
  },
  {
    key: "balanced",
    title: "Balanced",
    description: "Stable tactical equilibrium",
  },
  {
    key: "compact-block",
    title: "Compact Block",
    description: "Deep defensive shape with compression focus",
  },
  {
    key: "counter",
    title: "Counter",
    description: "Fast transition attacks after recovery",
  },
  {
    key: "possession",
    title: "Possession",
    description: "Controlled circulation and spacing retention",
  },
] as const

export default function TacticalModeSelector() {
  const tacticalMode = useMatchStateStore(
    (state) => state.tacticalMode,
  )

  const setTacticalMode = useMatchStateStore(
    (state) => state.setTacticalMode,
  )

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div>
        <div style={{ fontSize: 12, opacity: 0.72 }}>
          LIVE TACTICAL ORCHESTRATION
        </div>

        <div style={{ fontSize: 24, fontWeight: 900 }}>
          Tactical Modes
        </div>
      </div>

      {tacticalModes.map((mode) => {
        const active = tacticalMode === mode.key

        return (
          <button
            key={mode.key}
            onClick={() => setTacticalMode(mode.key)}
            style={{
              border: "none",
              borderRadius: 22,
              padding: 18,
              background: active
                ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                : "rgba(15,23,42,0.82)",
              color: "white",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s ease",
              boxShadow: active
                ? "0 12px 30px rgba(37,99,235,0.35)"
                : "none",
            }}
          >
            <div style={{ fontWeight: 900, fontSize: 18 }}>
              {mode.title}
            </div>

            <div
              style={{
                marginTop: 6,
                opacity: 0.82,
                lineHeight: 1.5,
                fontSize: 13,
              }}
            >
              {mode.description}
            </div>
          </button>
        )
      })}
    </div>
  )
}
