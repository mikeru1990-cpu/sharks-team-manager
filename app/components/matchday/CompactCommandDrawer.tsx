"use client"

import { useState } from "react"
import {
  BrainCircuit,
  ChevronUp,
  Shield,
  TimerReset,
  Users,
  Zap,
} from "lucide-react"

const commands = [
  {
    title: "Increase Press",
    icon: Zap,
  },
  {
    title: "Stabilize Shape",
    icon: Shield,
  },
  {
    title: "Reset Tempo",
    icon: TimerReset,
  },
  {
    title: "Manage Workload",
    icon: Users,
  },
  {
    title: "AI Tactical Sync",
    icon: BrainCircuit,
  },
]

export default function CompactCommandDrawer() {
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        position: "fixed",
        bottom: 88,
        right: 18,
        zIndex: 60,
        width: open ? 320 : 72,
        transition: "all 0.25s ease",
      }}
    >
      <div
        style={{
          borderRadius: 28,
          background: "rgba(2,6,23,0.94)",
          border: "1px solid rgba(148,163,184,0.12)",
          backdropFilter: "blur(22px)",
          overflow: "hidden",
          boxShadow: "0 10px 40px rgba(0,0,0,0.45)",
        }}
      >
        <button
          onClick={() => setOpen((prev) => !prev)}
          style={{
            width: "100%",
            border: "none",
            background: "transparent",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: open ? "space-between" : "center",
            padding: 18,
            cursor: "pointer",
          }}
        >
          {open ? (
            <>
              <div style={{ fontWeight: 900 }}>Command Drawer</div>
              <ChevronUp size={20} />
            </>
          ) : (
            <ChevronUp size={22} />
          )}
        </button>

        {open && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: "0 16px 16px",
            }}
          >
            {commands.map((command) => {
              const Icon = command.icon

              return (
                <button
                  key={command.title}
                  style={{
                    border: "none",
                    borderRadius: 18,
                    padding: "14px 16px",
                    background: "rgba(15,23,42,0.82)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      background: "rgba(37,99,235,0.18)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} />
                  </div>

                  {command.title}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
