"use client"

import { ArrowRightLeft, Network, Radar, Shuffle } from "lucide-react"

const formations = [
  {
    from: "2-3-1",
    to: "3-2-1",
    trigger: "Defensive pressure spike",
    icon: ArrowRightLeft,
  },
  {
    from: "3-2-1",
    to: "2-2-2",
    trigger: "Counter transition window",
    icon: Shuffle,
  },
  {
    from: "2-2-2",
    to: "2-3-1",
    trigger: "Possession stabilization",
    icon: Network,
  },
]

export default function FormationMorphingEngine() {
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
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          LIVE FORMATION ADAPTATION
        </div>

        <div style={{ fontSize: 24, fontWeight: 900 }}>
          Formation Morphing Engine
        </div>
      </div>

      {formations.map((formation) => {
        const Icon = formation.icon

        return (
          <div
            key={formation.from + formation.to}
            style={{
              borderRadius: 20,
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
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: "rgba(37,99,235,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} />
                </div>

                <div>
                  <div style={{ fontWeight: 900 }}>
                    {formation.from} → {formation.to}
                  </div>

                  <div style={{ opacity: 0.72, marginTop: 4 }}>
                    {formation.trigger}
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
                Adaptive
              </div>
            </div>

            <div
              style={{
                height: 8,
                borderRadius: 999,
                background: "rgba(148,163,184,0.12)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: "74%",
                  height: "100%",
                  background:
                    "linear-gradient(90deg,#2563eb,#7c3aed,#22c55e)",
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
