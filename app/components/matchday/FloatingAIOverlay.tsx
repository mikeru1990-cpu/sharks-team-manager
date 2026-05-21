"use client"

import { useMemo } from "react"
import {
  AlertTriangle,
  BrainCircuit,
  Shield,
  Zap,
} from "lucide-react"
import { useMatchStateStore } from "../../lib/matchStateStore"

export default function FloatingAIOverlay() {
  const tacticalMode = useMatchStateStore((state) => state.tacticalMode)
  const formation = useMatchStateStore((state) => state.formation)
  const momentum = useMatchStateStore((state) => state.momentum)
  const pressureState = useMatchStateStore((state) => state.pressureState)
  const fatigueLevels = useMatchStateStore((state) => state.fatigueLevels)

  const recommendations = useMemo(() => {
    const items = []

    if (tacticalMode === "high-press") {
      items.push({
        icon: Zap,
        text: "Reduce press intensity by 12% to stabilize workload.",
      })
    }

    if (pressureState.right > 80) {
      items.push({
        icon: AlertTriangle,
        text: "Right-side overload probability increasing rapidly.",
      })
    }

    if ((fatigueLevels.Emily || 0) > 80) {
      items.push({
        icon: BrainCircuit,
        text: "Emily substitution recommended within 4 minutes.",
      })
    }

    if (formation === "3-2-1" && momentum > 70) {
      items.push({
        icon: Shield,
        text: "3-2-1 structure stabilizing defensive compression.",
      })
    }

    return items.slice(0, 3)
  }, [
    tacticalMode,
    formation,
    momentum,
    pressureState,
    fatigueLevels,
  ])

  return (
    <div
      style={{
        position: "fixed",
        top: 110,
        right: 16,
        zIndex: 75,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: 320,
        pointerEvents: "none",
      }}
    >
      {recommendations.map((item, index) => {
        const Icon = item.icon

        return (
          <div
            key={`${item.text}-${index}`}
            style={{
              borderRadius: 22,
              padding: 16,
              background: "rgba(2,6,23,0.88)",
              border: "1px solid rgba(148,163,184,0.12)",
              backdropFilter: "blur(22px)",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
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
                flexShrink: 0,
              }}
            >
              <Icon size={20} />
            </div>

            <div
              style={{
                fontWeight: 800,
                lineHeight: 1.6,
                fontSize: 14,
              }}
            >
              {item.text}
            </div>
          </div>
        )
      })}
    </div>
  )
}
