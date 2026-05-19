"use client"

import { AlertTriangle, ShieldCheck, Siren } from "lucide-react"
import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const alerts = [
  {
    title: "Bella workload high",
    detail: "Player exceeds 90% workload threshold",
    icon: AlertTriangle,
    color: "#f59e0b",
  },
  {
    title: "Formation stable",
    detail: "Defensive shape currently balanced",
    icon: ShieldCheck,
    color: "#22c55e",
  },
  {
    title: "Press intensity rising",
    detail: "Momentum engine detected increased pressure",
    icon: Siren,
    color: "#ef4444",
  },
]

export default function OperationalAlertsPanel() {
  return (
    <OperationalCard
      title="Operational Alerts"
      subtitle="Live tactical intelligence notifications"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {alerts.map((alert) => {
          const Icon = alert.icon

          return (
            <div
              key={alert.title}
              style={{
                padding: 16,
                borderRadius: 18,
                background: "rgba(15,23,42,0.62)",
                border: `1px solid ${eliteTheme.colors.border}`,
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: `${alert.color}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={20} color={alert.color} />
              </div>

              <div>
                <div style={{ fontWeight: 800 }}>
                  {alert.title}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    opacity: 0.72,
                    marginTop: 4,
                    lineHeight: 1.45,
                  }}
                >
                  {alert.detail}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </OperationalCard>
  )
}
