"use client"

import { useEffect, useState } from "react"
import {
  AlertTriangle,
  ShieldAlert,
  Zap,
} from "lucide-react"

const alerts = [
  {
    title: "Defensive shape instability detected",
    detail: "Left-side recovery lag increasing under pressure.",
    level: "critical",
    icon: ShieldAlert,
  },
  {
    title: "Transition opportunity emerging",
    detail: "Right-side overload channel becoming available.",
    level: "active",
    icon: Zap,
  },
  {
    title: "Player workload threshold nearing",
    detail: "Emily approaching fatigue escalation point.",
    level: "warning",
    icon: AlertTriangle,
  },
]

export default function ContextualAlertOverlay() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % alerts.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const alert = alerts[activeIndex]
  const Icon = alert.icon

  const glowColor =
    alert.level === "critical"
      ? "rgba(239,68,68,0.45)"
      : alert.level === "warning"
        ? "rgba(245,158,11,0.45)"
        : "rgba(34,197,94,0.45)"

  return (
    <div
      style={{
        position: "sticky",
        top: 12,
        zIndex: 50,
        borderRadius: 24,
        padding: 18,
        background: "rgba(2,6,23,0.94)",
        border: `1px solid ${glowColor}`,
        backdropFilter: "blur(22px)",
        boxShadow: `0 0 30px ${glowColor}`,
        display: "flex",
        alignItems: "center",
        gap: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 18,
          background: glowColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={24} />
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 12,
            opacity: 0.72,
            marginBottom: 6,
            fontWeight: 700,
          }}
        >
          LIVE CONTEXTUAL INTELLIGENCE
        </div>

        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            marginBottom: 6,
          }}
        >
          {alert.title}
        </div>

        <div
          style={{
            lineHeight: 1.6,
            opacity: 0.88,
            fontWeight: 700,
          }}
        >
          {alert.detail}
        </div>
      </div>

      <div
        style={{
          padding: "8px 12px",
          borderRadius: 999,
          background: glowColor,
          fontWeight: 900,
          fontSize: 12,
          textTransform: "uppercase",
        }}
      >
        {alert.level}
      </div>
    </div>
  )
}
