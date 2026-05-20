"use client"

import { BrainCircuit, Database, Layers3, ShieldCheck } from "lucide-react"

const memoryNodes = [
  {
    title: "Tactical Memory",
    description: "Stores adaptive tactical transitions and shape evolution",
    status: "Synced",
    icon: Layers3,
  },
  {
    title: "Player Intelligence",
    description: "Tracks workload, pressure response and recovery patterns",
    status: "Learning",
    icon: BrainCircuit,
  },
  {
    title: "Operational Persistence",
    description: "Maintains orchestration continuity across match states",
    status: "Stable",
    icon: Database,
  },
  {
    title: "Defensive Resilience",
    description: "Models defensive recovery and spatial resistance patterns",
    status: "Protected",
    icon: ShieldCheck,
  },
]

export default function OrchestrationMemoryCore() {
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
            PERSISTENT MATCH INTELLIGENCE
          </div>

          <div style={{ fontSize: 26, fontWeight: 900 }}>
            Orchestration Memory Core
          </div>
        </div>

        <div
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            background: "rgba(34,197,94,0.18)",
            color: "#22c55e",
            fontWeight: 800,
            fontSize: 12,
          }}
        >
          LIVE MEMORY ACTIVE
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        {memoryNodes.map((node) => {
          const Icon = node.icon

          return (
            <div
              key={node.title}
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
                  width: 48,
                  height: 48,
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
                <div style={{ fontWeight: 900, marginBottom: 8 }}>
                  {node.title}
                </div>

                <div
                  style={{
                    opacity: 0.76,
                    lineHeight: 1.5,
                    fontSize: 14,
                  }}
                >
                  {node.description}
                </div>
              </div>

              <div
                style={{
                  marginTop: "auto",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(59,130,246,0.16)",
                  fontWeight: 800,
                  fontSize: 12,
                  width: "fit-content",
                }}
              >
                {node.status}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
