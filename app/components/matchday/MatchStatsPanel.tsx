"use client"

import { buildMatchSummary, ensurePlayerStats, getTeamStatTotals, type MatchStatsMap } from "../../lib/matchStats"
import type { SquadStorePlayer } from "../../lib/squadStore"

type StatKey = "goals" | "assists" | "saves" | "yellowCards" | "redCards"

type Props = {
  players: SquadStorePlayer[]
  stats: MatchStatsMap
  homeScore: number
  awayScore: number
  format: string
  durationSeconds: number
  opponent: string
  onIncrement: (playerId: string, key: StatKey, amount?: number) => void
  onPlayerOfMatch: (playerId: string) => void
  onOpponentChange: (value: string) => void
}

export default function MatchStatsPanel({ players, stats, homeScore, awayScore, format, durationSeconds, opponent, onIncrement, onPlayerOfMatch, onOpponentChange }: Props) {
  const totals = getTeamStatTotals(stats)
  const names = Object.fromEntries(players.map((player) => [player.id, player.name]))
  const summary = buildMatchSummary({ teamName: "Leonard Stanley U11", opponent: opponent || "Opposition", homeScore, awayScore, format, durationSeconds, stats, playerNames: names })

  return <div style={{ display: "grid", gap: 12 }}>
    <section style={panel}>
      <div style={header}><div><div style={eyebrow}>MATCH REPORT</div><h2 style={title}>Player statistics</h2></div><span style={pill}>{format}</span></div>
      <label style={fieldLabel}>Opposition<input value={opponent} onChange={(event) => onOpponentChange(event.target.value)} placeholder="Enter opposition" style={input} /></label>
      <div style={summaryGrid}><Metric label="Goals" value={totals.goals} /><Metric label="Assists" value={totals.assists} /><Metric label="Saves" value={totals.saves} /><Metric label="Cards" value={totals.yellowCards + totals.redCards} /></div>
    </section>

    <section style={panel}>
      <div style={header}><h2 style={title}>Player events</h2><span style={pill}>Tap to add</span></div>
      <div style={{ display: "grid", gap: 10 }}>{players.map((player) => {
        const playerStats = ensurePlayerStats(stats, player.id)
        return <div key={player.id} style={playerRow}>
          <div><strong>{player.name}</strong><small style={subtle}>{player.primaryPosition}</small></div>
          <div style={actions}>
            <StatButton label="Goal" value={playerStats.goals} onClick={() => onIncrement(player.id, "goals")} />
            <StatButton label="Assist" value={playerStats.assists} onClick={() => onIncrement(player.id, "assists")} />
            <StatButton label="Save" value={playerStats.saves} onClick={() => onIncrement(player.id, "saves")} />
            <StatButton label="YC" value={playerStats.yellowCards} onClick={() => onIncrement(player.id, "yellowCards")} />
            <button type="button" onClick={() => onPlayerOfMatch(player.id)} style={playerStats.playerOfMatch ? selectedPom : pomButton}>{playerStats.playerOfMatch ? "★ POTM" : "☆ POTM"}</button>
          </div>
        </div>
      })}</div>
    </section>

    <section style={reportPanel}>
      <div style={eyebrow}>FULL-TIME SUMMARY</div>
      <h2 style={{ ...title, fontSize: 26 }}>{summary.result}</h2>
      <p style={subtle}>{summary.durationMinutes} minutes · {summary.format}</p>
      <div style={reportGrid}><div><small>Scorers</small><strong>{summary.scorers.length ? summary.scorers.join(" · ") : "None recorded"}</strong></div><div><small>Player of Match</small><strong>{summary.playerOfMatch}</strong></div></div>
    </section>
  </div>
}

function Metric({ label, value }: { label: string; value: number }) { return <div style={metric}><small>{label}</small><strong>{value}</strong></div> }
function StatButton({ label, value, onClick }: { label: string; value: number; onClick: () => void }) { return <button type="button" onClick={onClick} style={statButton}><span>{label}</span><strong>{value}</strong></button> }

const panel = { borderRadius: 24, padding: 16, background: "rgba(15,23,42,.9)", border: "1px solid rgba(148,163,184,.14)", display: "grid", gap: 12 }
const reportPanel = { ...panel, background: "radial-gradient(circle at top right,rgba(37,99,235,.34),transparent 42%),rgba(15,23,42,.96)", border: "1px solid rgba(147,197,253,.24)" }
const header = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }
const eyebrow = { fontSize: 11, fontWeight: 950, letterSpacing: 1, color: "#bfdbfe" }
const title = { margin: "4px 0 0", fontSize: 21, letterSpacing: -.4 }
const pill = { borderRadius: 999, padding: "7px 10px", background: "rgba(37,99,235,.2)", color: "#bfdbfe", fontSize: 11, fontWeight: 950 }
const fieldLabel = { display: "grid", gap: 6, color: "rgba(226,232,240,.72)", fontSize: 12, fontWeight: 900 }
const input = { border: "1px solid rgba(148,163,184,.16)", borderRadius: 15, padding: 12, background: "rgba(2,6,23,.55)", color: "white", fontWeight: 850 }
const summaryGrid = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }
const metric = { borderRadius: 16, padding: 12, background: "rgba(2,6,23,.44)", display: "grid", gap: 4 }
const playerRow = { borderRadius: 18, padding: 12, background: "rgba(2,6,23,.44)", border: "1px solid rgba(148,163,184,.1)", display: "grid", gap: 10 }
const subtle = { display: "block", color: "rgba(226,232,240,.62)", marginTop: 3 }
const actions = { display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))", gap: 6 }
const statButton = { border: "1px solid rgba(147,197,253,.15)", borderRadius: 13, padding: 9, background: "rgba(15,23,42,.74)", color: "white", display: "grid", gap: 2, cursor: "pointer" }
const pomButton = { ...statButton, color: "#fde68a" }
const selectedPom = { ...pomButton, background: "rgba(120,53,15,.42)", border: "1px solid rgba(251,191,36,.3)" }
const reportGrid = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }
