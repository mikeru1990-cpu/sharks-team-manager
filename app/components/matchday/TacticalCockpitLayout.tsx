"use client"

import { Activity, ShieldAlert, Zap } from "lucide-react"
import FloatingIntelligenceOverlay from "./FloatingIntelligenceOverlay"
import BottomCommandDock from "./BottomCommandDock"
import SwipeWorkspaceShell from "./SwipeWorkspaceShell"
import TacticalSideSheet from "./TacticalSideSheet"

const alerts = [
  {
    icon: ShieldAlert,
    text: "Defensive shape instability detected on left side",
    level: "warning",
  },
  {
    icon: Zap,
    text: "Counter transition opportunity detected",
    level: "success",
  },
  {
    icon: Activity,
    text: "Emily workload spike detected",
    level: "alert",
  },
]

export default function TacticalCockpitLayout() {
  return (
    <>
      <FloatingIntelligenceOverlay />
      <BottomCommandDock />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          paddingBottom: 120,
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            backdropFilter: "blur(18px)",
            background: "rgba(2,6,23,0.82)",
            border: "1px solid rgba(148,163,184,0.12)",
            borderRadius: 24,
            padding: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                LIVE MATCHDAY
              </div>
              <div style={{ fontSize: 28, fontWeight: 900 }}>
                2 - 1
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 6,
              }}
            >
              <div style={{ fontWeight: 800 }}>Q3 • 11:42</div>
              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(34,197,94,0.18)",
                  color: "#22c55e",
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                Momentum Positive
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 10,
            }}
          >
            {[
              "Sub",
              "Shape",
              "Press",
              "Reset",
            ].map((action) => (
              <button
                key={action}
                style={{
                  border: "none",
                  borderRadius: 14,
                  padding: "12px 8px",
                  background: "rgba(15,23,42,0.88)",
                  color: "white",
                  fontWeight: 800,
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <SwipeWorkspaceShell />

        <TacticalSideSheet />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {alerts.map((alert) => {
            const Icon = alert.icon

            return (
              <div
                key={alert.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 14,
                  borderRadius: 18,
                  background: "rgba(15,23,42,0.82)",
                  border: "1px solid rgba(148,163,184,0.12)",
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(37,99,235,0.16)",
                  }}
                >
                  <Icon size={18} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{alert.text}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
