"use client"

import {
  Bot,
  BrainCircuit,
  Orbit,
  Radar,
} from "lucide-react"

const coordinationSystems = [
  {
    title: "Autonomous Tactical Routing",
    detail: "AI restructuring tactical flows based on live pressure shifts",
    state: "Active",
    icon: Orbit,
  },
  {
    title: "Spatial Prediction Core",
    detail: "Predicting overload migration before transition execution",
    state: "Learning",
    icon: Radar,
  },
  {
    title: "Adaptive Intelligence Mesh",
    detail: "Cross-referencing tactical memory with live orchestration states",
    state: "Synchronized",
    icon: BrainCircuit,
  },
]

export default function AutonomousTacticalCoordinator() {
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
            AUTONOMOUS ORCHESTRATION NETWORK
          </div>

          <div style={{ fontSize: 26, fontWeight: 900 }}>
            Autonomous Tactical Coordinator
          </div>
        </div>

        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            background: "rgba(37,99,235,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Bot size={24} />
        </div>
      </div>

      {coordinationSystems.map((system) => {
        const Icon = system.icon

        return (
          <div
            key={system.title}
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
                  <div style={{ fontWeight: 900 }}>
                    {system.title}
                  </div>

                  <div style={{ opacity: 0.76, marginTop: 4 }}>
                    {system.state}
                  </div>
                </div>
              </div>

              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background:
                    system.state === "Learning"
                      ? "#f59e0b"
                      : "#22c55e",
                  boxShadow:
                    system.state === "Learning"
                      ? "0 0 14px #f59e0b"
                      : "0 0 14px #22c55e",
                }}
              />
            </div>

            <div
              style={{
                lineHeight: 1.6,
                opacity: 0.9,
                fontWeight: 700,
              }}
            >
              {system.detail}
            </div>
          </div>
        )}
      })}
    </div>
  )
}
