"use client"

import { Activity, AlertTriangle, Waves, Wind } from "lucide-react"

const pressureWaves = [
  {
    zone: "Left Defensive Corridor",
    intensity: 82,
    trend: "Escalating",
    icon: AlertTriangle,
  },
  {
    zone: "Central Transition Lane",
    intensity: 68,
    trend: "Stable",
    icon: Waves,
  },
  {
    zone: "Right Attacking Channel",
    intensity: 91,
    trend: "Dominant",
    icon: Wind,
  },
]

export default function PressureWaveEngine() {
  return (
    <div
      style={{
        borderRadius: 28,
        padding: 20,
        background: "rgba(2,6,23,0.9)",
        border: "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(22px)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            LIVE PRESSURE ORCHESTRATION
          </div>

          <div style={{ fontSize: 24, fontWeight: 900 }}>
            Pressure Wave Engine
          </div>
        </div>

        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: "rgba(37,99,235,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Activity size={20} />
        </div>
      </div>

      {pressureWaves.map((wave) => {
        const Icon = wave.icon

        return (
          <div
            key={wave.zone}
            style={{
              borderRadius: 20,
              padding: 18,
              background: "rgba(15,23,42,0.82)",
              border: "1px solid rgba(148,163,184,0.08)",
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    background: "rgba(37,99,235,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={18} />
                </div>

                <div>
                  <div style={{ fontWeight: 900 }}>{wave.zone}</div>
                  <div style={{ opacity: 0.72, marginTop: 4 }}>
                    {wave.trend}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                {wave.intensity}%
              </div>
            </div>

            <div
              style={{
                height: 10,
                borderRadius: 999,
                overflow: "hidden",
                background: "rgba(148,163,184,0.12)",
              }}
            >
              <div
                style={{
                  width: `${wave.intensity}%`,
                  height: "100%",
                  background:
                    wave.intensity > 80
                      ? "linear-gradient(90deg,#ef4444,#f97316)"
                      : "linear-gradient(90deg,#2563eb,#22c55e)",
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
