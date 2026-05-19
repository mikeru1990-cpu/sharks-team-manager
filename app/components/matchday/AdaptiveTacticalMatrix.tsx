"use client"

import { BrainCircuit, Move3D, ScanSearch } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const matrix = [
  {
    title: "Shape Adaptation",
    value: "Dynamic",
    icon: Move3D,
    color: "#3b82f6",
  },
  {
    title: "AI Tactical Mapping",
    value: "Scanning",
    icon: ScanSearch,
    color: "#8b5cf6",
  },
  {
    title: "Decision Matrix",
    value: "Adaptive",
    icon: BrainCircuit,
    color: "#22c55e",
  },
]

export default function AdaptiveTacticalMatrix() {
  return (
    <OperationalCard
      title="Adaptive Tactical Matrix"
      subtitle="Live adaptive tactical intelligence"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {matrix.map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.title}
              style={{
                padding: 16,
                borderRadius: 18,
                background: "rgba(15,23,42,0.62)",
                border: `1px solid ${eliteTheme.colors.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: `${item.color}22`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color={item.color} />
                </div>

                <div>
                  <div style={{ fontWeight: 800 }}>
                    {item.title}
                  </div>

                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      opacity: 0.72,
                    }}
                  >
                    Tactical intelligence adapting live
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontWeight: 900,
                  color: item.color,
                }}
              >
                {item.value}
              </div>
            </div>
          )
        })}
      </div>
    </OperationalCard>
  )
}
