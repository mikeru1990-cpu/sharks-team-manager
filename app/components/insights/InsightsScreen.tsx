"use client"

import { getActiveU11Players } from "../../lib/realTeamData"

const players = getActiveU11Players()
const seasonStats = {
  played: 0,
  won: 0,
  drawn: 0,
  lost: 0,
  goalsFor: 0,
  goalsAgainst: 0,
}

export default function InsightsScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 132 }}>
      <div>
        <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 }}>REAL INSIGHTS</div>
        <h1 style={{ margin: "6px 0 4px", fontSize: 34, letterSpacing: -1.2 }}>Insights</h1>
        <p style={{ margin: 0, color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>
          Real Leonard Stanley U11 Girls season data only. Fake results, league tables and generated statistics have been removed.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 12 }}>
        <Tile label="Squad" value={players.length.toString()} note="active U11 players" />
        <Tile label="Played" value={seasonStats.played.toString()} note="recorded matches" />
        <Tile label="Goal Diff" value="0" note="from recorded results" />
      </div>

      <section style={panelStyle}>
        <h2 style={{ margin: 0, fontSize: 24 }}>2026/27 Season</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10, marginTop: 14 }}>
          <Mini label="W" value={seasonStats.won.toString()} />
          <Mini label="D" value={seasonStats.drawn.toString()} />
          <Mini label="L" value={seasonStats.lost.toString()} />
          <Mini label="GF" value={seasonStats.goalsFor.toString()} />
          <Mini label="GA" value={seasonStats.goalsAgainst.toString()} />
          <Mini label="GD" value="0" />
        </div>
      </section>

      <section style={panelStyle}>
        <h2 style={{ margin: 0, fontSize: 24 }}>Match Results</h2>
        <p style={{ margin: "8px 0 0", color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>
          No completed matches have been recorded for this season yet. Results will appear here once they are entered through Matchday.
        </p>
      </section>

      <section style={panelStyle}>
        <h2 style={{ margin: 0, fontSize: 24 }}>Head-to-Head</h2>
        <p style={{ margin: "8px 0 0", color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>
          No opponent history yet for this season. Opponent records will be generated from real match results only.
        </p>
      </section>
    </div>
  )
}

function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  return <div style={panelStyle}><div style={{ color: "rgba(226,232,240,0.65)", fontSize: 12, fontWeight: 800 }}>{label}</div><div style={{ marginTop: 8, fontSize: 30, fontWeight: 950 }}>{value}</div><div style={{ marginTop: 6, color: "rgba(226,232,240,0.68)", fontSize: 13, lineHeight: 1.35 }}>{note}</div></div>
}

function Mini({ label, value }: { label: string; value: string }) {
  return <div style={{ borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(148,163,184,0.1)" }}><div style={{ color: "rgba(226,232,240,0.58)", fontSize: 11, fontWeight: 900 }}>{label}</div><div style={{ marginTop: 6, fontSize: 21, fontWeight: 950 }}>{value}</div></div>
}

const panelStyle = { borderRadius: 24, padding: 18, background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.14)" }
