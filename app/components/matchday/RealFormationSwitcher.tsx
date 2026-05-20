"use client"

import { useState } from "react"
import { Check, Move3D, Network, SplitSquareVertical } from "lucide-react"

const formations = [
  {
    id: "231",
    name: "2-3-1",
    style: "Balanced Structure",
    icon: Network,
  },
  {
    id: "321",
    name: "3-2-1",
    style: "Defensive Stability",
    icon: SplitSquareVertical,
  },
  {
    id: "222",
    name: "2-2-2",
    style: "Aggressive Transition",
    icon: Move3D,
  },
]

export default function RealFormationSwitcher() {
  const [activeFormation, setActiveFormation] = useState("231")

  const selectedFormation = formations.find(
    (formation) => formation.id === activeFormation,
  )

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
          LIVE FORMATION CONTROL
        </div>

        <div style={{ fontSize: 26, fontWeight: 900 }}>
          Real Formation Switcher
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 12,
        }}
      >
        {formations.map((formation) => {
          const Icon = formation.icon
          const active = activeFormation === formation.id

          return (
            <button
              key={formation.id}
              onClick={() => setActiveFormation(formation.id)}
              style={{
                border: "none",
                borderRadius: 22,
                padding: 18,
                background: active
                  ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                  : "rgba(15,23,42,0.82)",
                color: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
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

              <div style={{ fontWeight: 900 }}>{formation.name}</div>

              {active && <Check size={16} />}
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
            {selectedFormation?.name}
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
            ACTIVE SHAPE
          </div>
        </div>

        <div
          style={{
            lineHeight: 1.7,
            opacity: 0.9,
            fontWeight: 700,
          }}
        >
          {selectedFormation?.style}
        </div>
      </div>
    </div>
  )
}
