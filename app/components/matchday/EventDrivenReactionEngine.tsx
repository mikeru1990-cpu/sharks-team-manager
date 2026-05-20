"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  BrainCircuit,
  ShieldAlert,
  Zap,
} from "lucide-react"
import { useMatchStateStore } from "../../lib/matchStateStore"

const reactionIcons = {
  alert: AlertTriangle,
  tactical: ShieldAlert,
  opportunity: Zap,
  ai: BrainCircuit,
}

export default function EventDrivenReactionEngine() {
  const tacticalMode = useMatchStateStore((state) => state.tacticalMode)
  const formation = useMatchStateStore((state) => state.formation)
  const fatigueLevels = useMatchStateStore((state) => state.fatigueLevels)
  const pressureState = useMatchStateStore((state) => state.pressureState)
  const momentum = useMatchStateStore((state) => state.momentum)

  const [reactionFeed, setReactionFeed] = useState<string[]>([])

  const generatedReactions = useMemo(() => {
    const reactions: string[] = []

    if (tacticalMode === "high-press") {
      reactions.push(
        "⚡ High press active → fatigue acceleration increasing",
      )
    }

    if (formation === "3-2-1") {
      reactions.push(
        "🛡 Defensive compactness improved through structural compression",
      )
    }

    if (pressureState.left > 75) {
      reactions.push(
        "⚠ Left-side pressure corridor escalating",
      )
    }

    if ((fatigueLevels.Emily || 0) > 80) {
      reactions.push(
        "🟠 Emily approaching substitution threshold",
      )
    }

    if (momentum > 70) {
      reactions.push(
        "🚀 Momentum surge detected → transition opportunity emerging",
      )
    }

    return reactions
  }, [
    tacticalMode,
    formation,
    fatigueLevels,
    pressureState,
    momentum,
  ])

  useEffect(() => {
    setReactionFeed(generatedReactions)
  }, [generatedReactions])

  return (
    <div
      style={{
        borderRadius: 30,
        padding: 22,
        background: "rgba(2,6,23,0.94)",
        border: "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div>
        <div style={{ fontSize: 12, opacity: 0.72 }}>
          EVENT-DRIVEN ORCHESTRATION
        </div>

        <div style={{ fontSize: 28, fontWeight: 900 }}>
          Tactical Reaction Engine
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {reactionFeed.map((reaction, index) => {
          const Icon =
            reaction.includes("⚠")
              ? reactionIcons.alert
              : reaction.includes("🛡")
                ? reactionIcons.tactical
                : reaction.includes("🚀")
                  ? reactionIcons.opportunity
                  : reactionIcons.ai

          return (
            <div
              key={`${reaction}-${index}`}
              style={{
                borderRadius: 22,
                padding: 18,
                background: "rgba(15,23,42,0.82)",
                border: "1px solid rgba(148,163,184,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 18,
                  background: "rgba(37,99,235,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={22} />
              </div>

              <div
                style={{
                  fontWeight: 800,
                  lineHeight: 1.6,
                }}
              >
                {reaction}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
