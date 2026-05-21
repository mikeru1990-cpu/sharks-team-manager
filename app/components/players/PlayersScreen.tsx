"use client"

import { useMatchStateStore } from "../../lib/matchStateStore"

export default function PlayersScreen() {
  const players = useMatchStateStore((state) => state.players)
  const fatigueLevels = useMatchStateStore(
    (state) => state.fatigueLevels,
  )

  return (
    <div
      style={{
        padding: 16,
        paddingBottom: 140,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        color: "white",
      }}
    >
      <div>
        <div style={{ opacity: 0.7, fontSize: 12 }}>
          OPERATIONAL SQUAD MANAGEMENT
        </div>

        <h1 style={{ margin: "6px 0 0", fontSize: 32 }}>
          Players
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 12,
        }}
      >
        {[
          {
            label: "Available",
            value: players.length,
          },
          {
            label: "Fatigue Alerts",
            value: Object.values(fatigueLevels).filter(
              (v) => v > 75,
            ).length,
          },
          {
            label: "Match Ready",
            value: players.length - 1,
          },
          {
            label: "Pending",
            value: 2,
          },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              borderRadius: 24,
              padding: 18,
              background: "rgba(15,23,42,0.88)",
              border: "1px solid rgba(148,163,184,0.12)",
            }}
          >
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {card.label}
            </div>

            <div
              style={{
                marginTop: 8,
                fontSize: 28,
                fontWeight: 900,
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {players.map((player) => {
          const fatigue = fatigueLevels[player.name] ?? 48

          return (
            <div
              key={player.id}
              style={{
                borderRadius: 26,
                padding: 18,
                background: "rgba(15,23,42,0.88)",
                border: "1px solid rgba(148,163,184,0.12)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", gap: 14 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg,#2563eb,#7c3aed)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: 20,
                    }}
                  >
                    {player.name[0]}
                  </div>

                  <div>
                    <div
                      style={{ fontSize: 20, fontWeight: 900 }}
                    >
                      {player.name}
                    </div>

                    <div style={{ opacity: 0.72 }}>
                      Tactical Squad Player
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background:
                      fatigue > 75
                        ? "rgba(220,38,38,0.22)"
                        : fatigue > 60
                          ? "rgba(234,179,8,0.22)"
                          : "rgba(34,197,94,0.22)",
                    fontWeight: 800,
                    fontSize: 12,
                  }}
                >
                  {fatigue > 75
                    ? "Fatigue Risk"
                    : fatigue > 60
                      ? "High Workload"
                      : "Match Ready"}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 10,
                }}
              >
                <Metric label="Fatigue" value={`${fatigue}%`} />
                <Metric label="Minutes" value="248" />
                <Metric label="Attendance" value="92%" />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  overflowX: "auto",
                }}
              >
                {[
                  "Start",
                  "Bench",
                  "Captain",
                  "Unavailable",
                ].map((action) => (
                  <button
                    key={action}
                    style={{
                      border: "none",
                      borderRadius: 16,
                      padding: "12px 16px",
                      background: "rgba(30,41,59,0.92)",
                      color: "white",
                      fontWeight: 800,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: 12,
        background: "rgba(2,6,23,0.7)",
      }}
    >
      <div style={{ fontSize: 12, opacity: 0.65 }}>
        {label}
      </div>

      <div
        style={{
          marginTop: 6,
          fontWeight: 900,
          fontSize: 18,
        }}
      >
        {value}
      </div>
    </div>
  )
}
