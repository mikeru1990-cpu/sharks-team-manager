"use client"

export type TacticalPlayerState = {
  id: string
  name: string
  x: number
  y: number
  load: "fresh" | "warning" | "critical"
  pressure: number
}

type Props = {
  players: TacticalPlayerState[]
}

function glow(load: TacticalPlayerState["load"]) {
  if (load === "critical") return "#ef4444"
  if (load === "warning") return "#f59e0b"
  return "#22c55e"
}

export default function TacticalHeatStates({ players }: Props) {
  return (
    <div
      style={{
        borderRadius: 30,
        border: "1px solid rgba(148,163,184,0.12)",
        background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))",
        padding: 24,
        boxShadow: "0 26px 60px rgba(0,0,0,0.45)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 22,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: 24,
              marginBottom: 4,
            }}
          >
            Tactical Heat States
          </div>

          <div
            style={{
              color: "rgba(226,232,240,0.7)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Live tactical pressure and fatigue positioning
          </div>
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "8px 14px",
            background: "rgba(239,68,68,0.16)",
            border: "1px solid rgba(239,68,68,0.24)",
            color: "#fecaca",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          LIVE TACTICAL ENGINE
        </div>
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1.6 / 1",
          borderRadius: 28,
          overflow: "hidden",
          background: "linear-gradient(180deg,#14532d,#166534)",
          border: "2px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 20,
            border: "2px solid rgba(255,255,255,0.2)",
            borderRadius: 20,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 20,
            bottom: 20,
            width: 2,
            background: "rgba(255,255,255,0.2)",
            transform: "translateX(-50%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.2)",
            transform: "translate(-50%, -50%)",
          }}
        />

        {players.map((player) => {
          const color = glow(player.load)

          return (
            <div
              key={player.id}
              style={{
                position: "absolute",
                left: `${player.x}%`,
                top: `${player.y}%`,
                transform: "translate(-50%, -50%)",
                display: "grid",
                justifyItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: 72,
                  height: 72,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    background: `${color}22`,
                    filter: `blur(${12 + player.pressure / 5}px)`,
                    transform: "scale(1.2)",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: `3px solid ${color}`,
                    background: "rgba(15,23,42,0.92)",
                    display: "grid",
                    placeItems: "center",
                    color: "white",
                    fontWeight: 900,
                    fontSize: 12,
                    boxShadow: `0 0 28px ${color}`,
                  }}
                >
                  {player.pressure}%
                </div>
              </div>

              <div
                style={{
                  borderRadius: 999,
                  padding: "6px 10px",
                  background: "rgba(15,23,42,0.9)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 11,
                  whiteSpace: "nowrap",
                }}
              >
                {player.name}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
