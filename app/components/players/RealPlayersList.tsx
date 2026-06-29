"use client"

import { getAllKnownPlayers, leonardStanleyPlayers } from "../../lib/realTeamData"

const allPlayers = getAllKnownPlayers()
const pendingPlayers = leonardStanleyPlayers.filter((player) => player.status === "pending")

export default function RealPlayersList() {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
        <Summary label="All Players" value={allPlayers.length.toString()} />
        <Summary label="Pending" value={pendingPlayers.length.toString()} />
      </div>

      <section style={panel}>
        <h2 style={{ margin: 0, fontSize: 24 }}>All Known Players</h2>
        <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
          {allPlayers.map((player) => (
            <article key={player.id} style={card}>
              <div style={{ fontSize: 21, fontWeight: 950 }}>{player.name}</div>
              <div style={{ marginTop: 4, color: "#7dd3fc", fontWeight: 900 }}>{player.knownAs ?? player.team}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 12 }}>
                <Mini label="Team" value={player.team} />
                <Mini label="Role" value={player.id === "darcy-rae-russell" ? "GK" : "Player"} />
                <Mini label="Status" value={player.status} />
              </div>
              {player.notes && <p style={{ margin: "12px 0 0", color: "rgba(226,232,240,0.72)", lineHeight: 1.45 }}>{player.notes}</p>}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div style={panel}><div style={{ color: "rgba(226,232,240,0.62)", fontSize: 12, fontWeight: 900 }}>{label}</div><div style={{ marginTop: 8, fontSize: 32, fontWeight: 950 }}>{value}</div></div>
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div style={{ borderRadius: 16, padding: 12, background: "rgba(15,23,42,0.84)", minWidth: 0 }}><div style={{ fontSize: 11, color: "rgba(226,232,240,0.58)", fontWeight: 900 }}>{label}</div><div style={{ marginTop: 6, fontWeight: 950 }}>{value}</div></div>
}

const panel = { borderRadius: 24, padding: 18, background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.14)" }
const card = { borderRadius: 22, padding: 16, background: "rgba(2,6,23,0.5)", border: "1px solid rgba(148,163,184,0.14)" }
