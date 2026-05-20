"use client"

import {
  Activity,
  BrainCircuit,
  Shield,
  Users,
  Zap,
} from "lucide-react"

const dockItems = [
  {
    label: "Match",
    icon: Activity,
    active: true,
  },
  {
    label: "Tactics",
    icon: Shield,
  },
  {
    label: "Players",
    icon: Users,
  },
  {
    label: "AI",
    icon: BrainCircuit,
  },
  {
    label: "Actions",
    icon: Zap,
  },
]

export default function BottomCommandDock() {
  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 14,
        zIndex: 120,
        backdropFilter: "blur(22px)",
        background: "rgba(2,6,23,0.88)",
        border: "1px solid rgba(148,163,184,0.14)",
        borderRadius: 28,
        padding: "10px 12px",
        display: "grid",
        gridTemplateColumns: "repeat(5,1fr)",
        gap: 8,
        boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
      }}
    >
      {dockItems.map((item) => {
        const Icon = item.icon

        return (
          <button
            key={item.label}
            style={{
              border: "none",
              background: item.active
                ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                : "transparent",
              borderRadius: 18,
              padding: "12px 6px",
              color: "white",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              fontWeight: 700,
            }}
          >
            <Icon size={18} />
            <span style={{ fontSize: 11 }}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
