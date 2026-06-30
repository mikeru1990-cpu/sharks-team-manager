"use client"

import TeamScopeBanner from "../layout/TeamScopeBanner"
import { getActiveU11Players } from "../../lib/realTeamData"

const squad = getActiveU11Players()
const workflow = [
  "Fixture details",
  "Squad selection",
  "Lineup",
  "Quarter planner",
  "Live events",
  "Player ratings",
  "Match report",
]

export default function MatchdayScreen() {
  return (
    <div style={{ display: "grid", gap: 16, paddingBottom: 140, color: "white" }}>
      <TeamScopeBanner section="Matchday" detail="Real U11 match workflow. Demo scores, fake players and generated tactical alerts have been removed." />

      <section style={panel}>
        <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 }}>NEXT MATCH</div>
        <h2 style={{ margin: "6px 0 4px", fontSize: 26 }}>No fixture selected</h2>
        <p style={{ margin: 0, color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>
          Create or select a real U11 fixture before starting Matchday. Once a fixture exists, the squad, lineup, events, ratings and report will attach to that match.
        </p>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 }}>
        <Metric label="Squad" value={squad.length.toString()} />
        <Metric label="Score" value="0-0" />
        <Metric label="Status" value="Setup" />
      </div>

      <section style={panel}>
        <h2 style={{ margin: 0, fontSize: 24 }}>Match Workflow</h2>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {workflow.map((item, index) => (
            <button key={item} type="button" style={stepButton}>
              <span style={{ width: 28, height: 28, borderRadius: 999, background: "rgba(37,99,235,0.24)", display: "grid", placeItems: "center", fontWeight: 950 }}>{index + 1}</span>
              <span>{item}</span>
            </button>
          ))}
        </div>
      </section>

      <section style={panel}>
        <h2 style={{ margin: 0, fontSize: 24 }}>Available U11 Squad</h2>
        <p style={{ margin: "6px 0 14px", color: "rgba(226,232,240,0.68)", lineHeight: 1.5 }}>
          This is the current U11 player pool. Availability and matchday squad selection will be saved against the selected fixture.
        </p>
        <div style={{ display: "grid", gap: 8 }}>
          {squad.map((player) => (
            <div key={player.id} style={{ borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(148,163,184,0.1)", fontWeight: 900 }}>
              {player.name}{player.id === "darcy-rae-russell" ? " · GK" : ""}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div style={panel}><div style={{ color: "rgba(226,232,240,0.62)", fontSize: 11, fontWeight: 900 }}>{label}</div><div style={{ marginTop: 8, fontSize: 25, fontWeight: 950 }}>{value}</div></div>
}

const panel = { borderRadius: 24, padding: 18, background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.14)" }
const stepButton = { width: "100%", border: "1px solid rgba(148,163,184,0.14)", borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.48)", color: "white", display: "flex", alignItems: "center", gap: 12, fontWeight: 900, textAlign: "left" as const, cursor: "pointer" }
