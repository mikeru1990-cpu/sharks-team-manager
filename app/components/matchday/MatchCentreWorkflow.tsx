"use client"

import { useState } from "react"
import TeamScopeBanner from "../layout/TeamScopeBanner"
import { getActiveU11Players } from "../../lib/realTeamData"

const players = getActiveU11Players()
const tabs = ["Setup", "Squad", "Lineup", "Planner", "Live", "Report"] as const

type Tab = typeof tabs[number]

export default function MatchCentreWorkflow() {
  const [active, setActive] = useState<Tab>("Setup")

  return (
    <div style={{ display: "grid", gap: 16, paddingBottom: 140, color: "white" }}>
      <TeamScopeBanner section="Match Centre" detail="Guided U11 matchday workflow. Select a fixture, choose squad, plan rotation, record events and create the report." />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 6 }}>
        {tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActive(tab)} style={{ border: "1px solid rgba(148,163,184,0.14)", borderRadius: 14, padding: "10px 4px", background: active === tab ? "#2563eb" : "rgba(15,23,42,0.86)", color: "white", fontSize: 11, fontWeight: 900 }}>
            {tab}
          </button>
        ))}
      </div>

      {active === "Setup" && <SetupPanel />}
      {active === "Squad" && <SquadPanel />}
      {active === "Lineup" && <LineupPanel />}
      {active === "Planner" && <PlannerPanel />}
      {active === "Live" && <LivePanel />}
      {active === "Report" && <ReportPanel />}
    </div>
  )
}

function SetupPanel() {
  return <Panel title="Fixture Setup" text="No real fixture is selected yet. The next build will connect this to fixtures so every event, lineup and report saves against the correct match." items={["Create/select fixture", "Confirm venue and kick-off", "Request availability", "Lock match squad"]} />
}

function SquadPanel() {
  return <section style={panel}><h2 style={h2}>Squad Selection</h2><p style={p}>Current U11 player pool. Selection toggles will be connected next.</p><div style={{ display: "grid", gap: 8 }}>{players.map((player) => <div key={player.id} style={row}>{player.name}{player.id === "darcy-rae-russell" ? " · GK" : ""}</div>)}</div></section>
}

function LineupPanel() {
  return <Panel title="Lineup" text="Choose starting shape and assign players. This will replace the old demo tactical cockpit with real U11 players only." items={["Formation: 2-3-1", "Goalkeeper", "Defence", "Midfield", "Forward"]} />
}

function PlannerPanel() {
  return <Panel title="Quarter Planner" text="Plan fair rotation across Q1, Q2, Q3 and Q4 before kick-off." items={["Q1 lineup", "Q2 changes", "Q3 changes", "Q4 finishers", "Goalkeeper rules"]} />
}

function LivePanel() {
  return <Panel title="Live Match" text="During the match this will record real events only." items={["Start clock", "Goal", "Assist", "Substitution", "Card", "Injury", "Timeline"]} />
}

function ReportPanel() {
  return <Panel title="Full Time Report" text="After full time the report will generate from the real match timeline." items={["Final score", "Player ratings", "Coach notes", "Parent summary", "Update season stats"]} />
}

function Panel({ title, text, items }: { title: string; text: string; items: string[] }) {
  return <section style={panel}><h2 style={h2}>{title}</h2><p style={p}>{text}</p><div style={{ display: "grid", gap: 10 }}>{items.map((item) => <div key={item} style={row}>{item}</div>)}</div></section>
}

const panel = { borderRadius: 24, padding: 18, background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.14)" }
const h2 = { margin: 0, fontSize: 24 }
const p = { margin: "8px 0 14px", color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }
const row = { borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.48)", border: "1px solid rgba(148,163,184,0.1)", fontWeight: 900 }
