"use client"

import { useEffect, useState } from "react"
import { Activity, RadioTower, Waves } from "lucide-react"

const animationStates = [
  {
    title: "Press Wave Active",
    detail: "High press animation orchestration expanding",
    icon: Waves,
  },
  {
    title: "Transition Shift",
    detail: "Formation transition sequencing underway",
    icon: Activity,
  },
  {
    title: "Signal Synchronization",
    detail: "AI orchestration pulses synchronized",
    icon: RadioTower,
  },
]

export default function TacticalAnimationStateEngine() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % animationStates.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const activeState = animationStates[activeIndex]
  const Icon = activeState.icon

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
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(135deg,rgba(37,99,235,0.12),rgba(124,58,237,0.08))",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>
          LIVE TACTICAL MOTION STATES
        </div>

        <div style={{ fontSize: 26, fontWeight: 900 }}>
          Tactical Animation Engine
        </div>
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          borderRadius: 24,
          padding: 24,
          background: "rgba(15,23,42,0.82)",
          border: "1px solid rgba(148,163,184,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "pulse 2s infinite",
          }}
        >
          <Icon size={28} />
        </div>

        <div>
          <div style={{ fontWeight: 900, fontSize: 22 }}>
            {activeState.title}
          </div>

          <div
            style={{
              marginTop: 8,
              lineHeight: 1.7,
              opacity: 0.88,
              fontWeight: 700,
            }}
          >
            {activeState.detail}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.02);
          }
          100% {
            opacity: 0.55;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
