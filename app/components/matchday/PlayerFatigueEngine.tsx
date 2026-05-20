"use client"

import { useState } from "react"
import { BatteryMedium, HeartPulse, TriangleAlert } from "lucide-react"

const initialPlayers = [
  {
    id: 1,
    name: "Emily",
    fatigue: 84,
    status: "Critical",
  },
  {
    id: 2,
    name: "Sophia",
    fatigue: 61,
    status: "Stable",
  },
  {
    id: 3,
    name: "Ava",
    fatigue: 72,
    status: "Elevated",
  },
]

export default function PlayerFatigueEngine() {
  const [players] = useState(initialPlayers)

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
            LIVE PLAYER LOAD MONITORING
          </div>

          <div style={{ fontSize: 26, fontWeight: 900 }}>
            Player Fatigue Engine
          </div>
        </div>

        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: 18,
            background: "rgba(37,99,235,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HeartPulse size={24} />
        </div>
      </div>

      {players.map((player) => {
        const highRisk = player.fatigue > 80

        return (
          <div
            key={player.id}
            style={{
              borderRadius: 22,
              padding: 18,
              background: "rgba(15,23,42,0.82)",
              border: "1px solid rgba(148,163,184,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
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
                    width: 46,
                    height: 46,
                    borderRadius: 16,
                    background: highRisk
                      ? "rgba(239,68,68,0.18)"
                      : "rgba(37,99,235,0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {highRisk ? (
                    <TriangleAlert size={20} />
                  ) : (
                    <BatteryMedium size={20} />
                  )}
                </div>

                <div>
                  <div style={{ fontWeight: 900 }}>
                    {player.name}
                  </div>

                  <div style={{ opacity: 0.76, marginTop: 4 }}>
                    {player.status}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                }}
              >
                {player.fatigue}%
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
                  width: `${player.fatigue}%`,
                  height: "100%",
                  background: highRisk
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
