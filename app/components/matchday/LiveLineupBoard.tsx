"use client"

import OperationalCard from "../ui/OperationalCard"
import { eliteTheme } from "../../lib/eliteTheme"

const lineup = [
  { name: "Emily", role: "GK" },
  { name: "Bella", role: "DEF" },
  { name: "Sophia", role: "DEF" },
  { name: "Ava", role: "MID" },
  { name: "Lily", role: "MID" },
  { name: "Grace", role: "FWD" },
]

export default function LiveLineupBoard() {
  return (
    <OperationalCard
      title="Live Lineup"
      subtitle="Current tactical setup"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {lineup.map((player) => (
          <div
            key={player.name}
            style={{
              padding: 14,
              borderRadius: 14,
              background: "rgba(15,23,42,0.62)",
              border: `1px solid ${eliteTheme.colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontWeight: 800 }}>
                {player.name}
              </div>

              <div
                style={{
                  opacity: 0.7,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {player.role}
              </div>
            </div>

            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#22c55e",
              }}
            />
          </div>
        ))}
      </div>
    </OperationalCard>
  )
}
