"use client"

import { getActiveU11Players } from "../../lib/realTeamData"

const players = getActiveU11Players()

const positions = [
  { label: "ST", left: "50%", top: "12%" },
  { label: "LW", left: "25%", top: "30%" },
  { label: "CM", left: "50%", top: "42%" },
  { label: "RW", left: "75%", top: "30%" },
  { label: "LB", left: "35%", top: "64%" },
  { label: "RB", left: "65%", top: "64%" },
  { label: "GK", left: "50%", top: "84%" },
]

export default function FormationPitch({ starters }: { starters: string[] }) {
  const selectedPlayers = players.filter((player) => starters.includes(player.id)).slice(0, 7)

  return (
    <section style={{ borderRadius: 24, padding: 18, background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.14)" }}>
      <h2 style={{ margin: 0, fontSize: 24 }}>Formation Pitch</h2>
      <p style={{ margin: "8px 0 14px", color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>Visual 2-3-1 shape using the selected starting seven.</p>
      <div style={{ position: "relative", height: 390, borderRadius: 24, background: "rgba(22,163,74,0.82)", border: "2px solid rgba(255,255,255,0.22)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 2, background: "rgba(255,255,255,0.22)" }} />
        {positions.map((position, index) => {
          const player = selectedPlayers[index]
          return (
            <div key={position.label} style={{ position: "absolute", left: position.left, top: position.top, transform: "translate(-50%, -50%)", width: 78, minHeight: 54, borderRadius: 18, background: "#2563eb", color: "white", display: "grid", placeItems: "center", textAlign: "center", padding: 6, fontWeight: 900 }}>
              <div style={{ fontSize: 10, opacity: 0.75 }}>{position.label}</div>
              <div style={{ fontSize: 11 }}>{player ? shortName(player.name) : "Empty"}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function shortName(name: string) {
  if (name === "Darcy-Rae Russell") return "Darcy-Rae"
  if (name === "Isabella Ogden") return "Bella O"
  if (name === "Bella Bainbridge") return "Bella B"
  return name.split(" ")[0]
}
