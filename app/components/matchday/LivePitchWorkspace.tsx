"use client"

import { useMemo } from "react"
import { AlertTriangle, Zap } from "lucide-react"
import { useMatchStateStore } from "../../lib/matchStateStore"

const formationLayouts = {
  "2-3-1": [
    { x: 28, y: 22 },
    { x: 68, y: 22 },
    { x: 18, y: 48 },
    { x: 50, y: 42 },
    { x: 82, y: 48 },
    { x: 50, y: 78 },
  ],
  "3-2-1": [
    { x: 18, y: 24 },
    { x: 50, y: 20 },
    { x: 82, y: 24 },
    { x: 32, y: 52 },
    { x: 68, y: 52 },
    { x: 50, y: 80 },
  ],
  "2-2-2": [
    { x: 28, y: 24 },
    { x: 72, y: 24 },
    { x: 32, y: 52 },
    { x: 68, y: 52 },
    { x: 32, y: 80 },
    { x: 68, y: 80 },
  ],
}

const playerNames = ["Emily", "Sophia", "Ava", "Isla", "Lily", "Mia"]

export default function LivePitchWorkspace() {
  const formation = useMatchStateStore((state) => state.formation)
  const tacticalMode = useMatchStateStore((state) => state.tacticalMode)
  const fatigueLevels = useMatchStateStore((state) => state.fatigueLevels)
  const pressureState = useMatchStateStore((state) => state.pressureState)

  const layout = useMemo(() => {
    return formationLayouts[formation]
  }, [formation])

  return (
    <div
      style={{
        borderRadius: 34,
        padding: 20,
        background: "rgba(2,6,23,0.94)",
        border: "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        overflow: "hidden",
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
          <div style={{ fontSize: 12, opacity: 0.72 }}>
            LIVE TACTICAL BATTLEFIELD
          </div>

          <div style={{ fontSize: 28, fontWeight: 900 }}>
            Live Pitch Workspace
          </div>
        </div>

        <div
          style={{
            padding: "10px 14px",
            borderRadius: 999,
            background: "rgba(37,99,235,0.18)",
            fontWeight: 800,
            textTransform: "uppercase",
          }}
        >
          {tacticalMode}
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "0.72",
          borderRadius: 30,
          overflow: "hidden",
          background:
            "linear-gradient(180deg,#166534 0%,#14532d 100%)",
          border: "2px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "8%",
            border: "2px solid rgba(255,255,255,0.18)",
            borderRadius: 22,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            height: 2,
            background: "rgba(255,255,255,0.18)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pressureState.left}%`,
            background: "rgba(239,68,68,0.12)",
            filter: "blur(40px)",
          }}
        />

        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: `${pressureState.right}%`,
            background: "rgba(59,130,246,0.12)",
            filter: "blur(40px)",
          }}
        />

        {layout.map((position, index) => {
          const player = playerNames[index]
          const fatigue = fatigueLevels[player] || 50
          const highRisk = fatigue > 80

          return (
            <div
              key={player}
              style={{
                position: "absolute",
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: "translate(-50%, -50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 70,
                  height: 70,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: -6,
                    borderRadius: "50%",
                    border: `4px solid ${
                      highRisk ? "#ef4444" : "#22c55e"
                    }`,
                    opacity: 0.8,
                  }}
                />

                <button
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    border: "3px solid rgba(255,255,255,0.18)",
                    background:
                      "linear-gradient(135deg,#2563eb,#7c3aed)",
                    color: "white",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                  }}
                >
                  {player.charAt(0)}
                </button>
              </div>

              <div
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "rgba(2,6,23,0.78)",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {player} · {fatigue}%
              </div>
            </div>
          )
        })}

        <div
          style={{
            position: "absolute",
            left: 18,
            top: 18,
            padding: 14,
            borderRadius: 18,
            background: "rgba(2,6,23,0.84)",
            border: "1px solid rgba(239,68,68,0.28)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            maxWidth: 220,
          }}
        >
          <AlertTriangle size={18} color="#ef4444" />

          <div style={{ fontSize: 12, fontWeight: 700 }}>
            Left defensive corridor destabilizing.
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            right: 18,
            bottom: 18,
            padding: 14,
            borderRadius: 18,
            background: "rgba(2,6,23,0.84)",
            border: "1px solid rgba(34,197,94,0.28)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            maxWidth: 220,
          }}
        >
          <Zap size={18} color="#22c55e" />

          <div style={{ fontSize: 12, fontWeight: 700 }}>
            Transition lane opening on right side.
          </div>
        </div>
      </div>
    </div>
  )
}
