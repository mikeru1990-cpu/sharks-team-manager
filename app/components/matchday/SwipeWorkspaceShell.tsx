"use client"

import { useState } from "react"

const workspaces = [
  {
    title: "Tactical Workspace",
    subtitle: "Live tactical orchestration",
    content: [
      "Compact mid press active",
      "Right-side overload detected",
      "Transition mode optimized",
    ],
  },
  {
    title: "Player Workspace",
    subtitle: "Live player intelligence",
    content: [
      "Emily workload elevated",
      "Sophia recovery optimal",
      "Ava sprint output increasing",
    ],
  },
  {
    title: "AI Workspace",
    subtitle: "Invisible orchestration systems",
    content: [
      "Prediction accuracy 92%",
      "Pressing efficiency rising",
      "Possession stability increasing",
    ],
  },
]

export default function SwipeWorkspaceShell() {
  const [active, setActive] = useState(0)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 10,
          overflowX: "auto",
        }}
      >
        {workspaces.map((workspace, index) => (
          <button
            key={workspace.title}
            onClick={() => setActive(index)}
            style={{
              border: "none",
              borderRadius: 999,
              padding: "12px 18px",
              whiteSpace: "nowrap",
              background:
                active === index
                  ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                  : "rgba(15,23,42,0.72)",
              color: "white",
              fontWeight: 800,
            }}
          >
            {workspace.title}
          </button>
        ))}
      </div>

      <div
        style={{
          borderRadius: 26,
          padding: 20,
          background: "rgba(15,23,42,0.82)",
          border: "1px solid rgba(148,163,184,0.12)",
          minHeight: 220,
          backdropFilter: "blur(18px)",
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 900 }}>
          {workspaces[active].title}
        </div>

        <div
          style={{
            marginTop: 6,
            opacity: 0.72,
            marginBottom: 18,
          }}
        >
          {workspaces[active].subtitle}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {workspaces[active].content.map((item) => (
            <div
              key={item}
              style={{
                padding: 14,
                borderRadius: 16,
                background: "rgba(2,6,23,0.72)",
                border: "1px solid rgba(148,163,184,0.08)",
                fontWeight: 700,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
