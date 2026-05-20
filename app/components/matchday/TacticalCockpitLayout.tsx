"use client"

import { Activity, Brain, ShieldAlert, Timer, Zap } from "lucide-react"
import FloatingIntelligenceOverlay from "./FloatingIntelligenceOverlay"

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

const tacticalTabs = [
  "Tactical",
  "Players",
  "Match",
  "Intelligence",
]

export default function TacticalCockpitLayout() {
  return (
    <>
      <FloatingIntelligenceOverlay />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
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

        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
          }}
        >
          {tacticalTabs.map((tab, index) => (
            <div
              key={tab}
              style={{
                padding: "12px 18px",
                borderRadius: 999,
                whiteSpace: "nowrap",
                background:
                  index === 0
                    ? "linear-gradient(135deg,#2563eb,#7c3aed)"
                    : "rgba(15,23,42,0.72)",
                border: "1px solid rgba(148,163,184,0.12)",
                fontWeight: 800,
              }}
            >
              {tab}
            </div>
          ))}
        </div>

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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <div
            style={{
              borderRadius: 22,
              padding: 18,
              background: "rgba(15,23,42,0.82)",
              border: "1px solid rgba(148,163,184,0.12)",
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 12 }}>
              Tactical State
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>Shape: Compact Mid Press</div>
              <div>Width: Narrow</div>
              <div>Transition Mode: Fast</div>
              <div>Press Trigger: Active</div>
            </div>
          </div>

          <div
            style={{
              borderRadius: 22,
              padding: 18,
              background: "rgba(15,23,42,0.82)",
              border: "1px solid rgba(148,163,184,0.12)",
            }}
          >
            <div style={{ fontWeight: 900, marginBottom: 12 }}>
              Intelligence Feed
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>Predicted possession swing in 4 mins</div>
              <div>Right-side overload probability rising</div>
              <div>Press efficiency increasing</div>
            </div>
          </div>
        </div>

        <div
          style={{
            borderRadius: 24,
            padding: 18,
            background: "rgba(15,23,42,0.82)",
            border: "1px solid rgba(148,163,184,0.12)",
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
            <div style={{ fontWeight: 900 }}>Invisible Intelligence Layer</div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#22c55e",
                fontWeight: 800,
              }}
            >
              <Brain size={16} />
              12 Systems Active
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 10,
            }}
          >
            {[
              "Prediction",
              "Learning",
              "Tempo",
              "Pressing",
              "Spatial",
              "Chemistry",
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  background: "rgba(2,6,23,0.72)",
                  textAlign: "center",
                  fontWeight: 700,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
