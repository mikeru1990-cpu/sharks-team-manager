"use client"

import { useState } from "react"
import TeamScopeBanner from "../layout/TeamScopeBanner"
import { getActiveU11Players } from "../../lib/realTeamData"

const players = getActiveU11Players()
const tabs = ["Setup", "Squad", "Lineup", "Planner", "Live", "Report"] as const

type Tab = typeof tabs[number]

type TimelineEvent = { id: number; label: string }

export default function MatchCentreWorkflow() {
  const [active, setActive] = useState<Tab>("Setup")
  const [selected, setSelected] = useState<string[]>(players.map((player) => player.id))
  const [starters, setStarters] = useState<string[]>(players.slice(0, 7).map((player) => player.id))
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])

  function toggleSelected(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  function toggleStarter(id: string) {
    setStarters((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 7 ? current : [...current, id])
  }

  function addEvent(label: string) {
    setTimeline((current) => [{ id: Date.now(), label }, ...current])
  }

  return (
    <div style={{ display: "grid", gap: 16, paddingBottom: 140, color: "white" }}>
      <TeamScopeBanner section="Match Centre" detail="Working U11 matchday flow: squad, lineup, quarter planning, live events and report preparation." />

      <section style={heroPanel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <div>
            <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 }}>MATCH STATUS</div>
            <h2 style={{ margin: "6px 0 0", fontSize: 28 }}>Fixture not selected</h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 30, fontWeight: 950 }}>0-0</div>
            <div style={{ color: "rgba(226,232,240,0.62)", fontSize: 12, fontWeight: 900 }}>PRE-MATCH</div>
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 6 }}>
        {tabs.map((tab) => (
          <button key={tab} type="button" onClick={() => setActive(tab)} style={{ border: "1px solid rgba(148,163,184,0.14)", borderRadius: 14, padding: "10px 4px", background: active === tab ? "#2563eb" : "rgba(15,23,42,0.86)", color: "white", fontSize: 11, fontWeight: 900 }}>
            {tab}
          </button>
        ))}
      </div>

      {active === "Setup" && <SetupPanel selectedCount={selected.length} starterCount={starters.length} />}
      {active === "Squad" && <SquadPanel selected={selected} onToggle={toggleSelected} />}
      {active === "Lineup" && <LineupPanel selected={selected} starters={starters} onToggle={toggleStarter} />}
      {active === "Planner" && <PlannerPanel starters={starters} />}
      {active === "Live" && <LivePanel timeline={timeline} onAdd={addEvent} />}
      {active === "Report" && <ReportPanel timeline={timeline} selectedCount={selected.length} />}
    </div>
  )
}

function SetupPanel({ selectedCount, starterCount }: { selectedCount: number; starterCount: number }) {
  return <section style={panel}><h2 style={h2}>Match Setup</h2><p style={p}>Start here before matchday. Select the fixture, confirm squad, then move through lineup and planner.</p><div style={grid3}><Metric label="Squad" value={selectedCount.toString()} /><Metric label="Starters" value={`${starterCount}/7`} /><Metric label="Events" value="0" /></div></section>
}

function SquadPanel({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return <section style={panel}><h2 style={h2}>Squad Selection</h2><p style={p}>Tap players in or out of the matchday squad.</p><div style={{ display: "grid", gap: 8 }}>{players.map((player) => <button key={player.id} type="button" onClick={() => onToggle(player.id)} style={{ ...rowButton, background: selected.includes(player.id) ? "rgba(37,99,235,0.28)" : "rgba(2,6,23,0.48)" }}>{selected.includes(player.id) ? "✓ " : "+ "}{player.name}{player.id === "darcy-rae-russell" ? " · GK" : ""}</button>)}</div></section>
}

function LineupPanel({ selected, starters, onToggle }: { selected: string[]; starters: string[]; onToggle: (id: string) => void }) {
  const squad = players.filter((player) => selected.includes(player.id))
  return <section style={panel}><h2 style={h2}>Starting Lineup</h2><p style={p}>Select up to 7 starters. This is the foundation for the formation and quarter planner.</p><div style={{ display: "grid", gap: 8 }}>{squad.map((player) => <button key={player.id} type="button" onClick={() => onToggle(player.id)} style={{ ...rowButton, background: starters.includes(player.id) ? "rgba(16,185,129,0.24)" : "rgba(2,6,23,0.48)" }}>{starters.includes(player.id) ? "STARTING · " : "BENCH · "}{player.name}</button>)}</div></section>
}

function PlannerPanel({ starters }: { starters: string[] }) {
  const starterNames = players.filter((player) => starters.includes(player.id)).map((player) => player.name)
  return <section style={panel}><h2 style={h2}>Quarter Planner</h2><p style={p}>Current starters are copied into Q1. Next build will make Q2-Q4 editable with fair rotation checks.</p><div style={{ display: "grid", gap: 10 }}>{["Q1", "Q2", "Q3", "Q4"].map((quarter) => <div key={quarter} style={row}><strong>{quarter}</strong><div style={{ marginTop: 6, color: "rgba(226,232,240,0.72)", lineHeight: 1.4 }}>{quarter === "Q1" ? starterNames.join(", ") || "No starters selected" : "Rotation to plan"}</div></div>)}</div></section>
}

function LivePanel({ timeline, onAdd }: { timeline: TimelineEvent[]; onAdd: (label: string) => void }) {
  return <section style={panel}><h2 style={h2}>Live Match</h2><p style={p}>Quick touchline event logging. Player-specific goal/assist selection comes next.</p><div style={grid3}><Action label="Goal" onClick={() => onAdd("Goal recorded")} /><Action label="Sub" onClick={() => onAdd("Substitution recorded")} /><Action label="Injury" onClick={() => onAdd("Injury noted")} /></div><Timeline timeline={timeline} /></section>
}

function ReportPanel({ timeline, selectedCount }: { timeline: TimelineEvent[]; selectedCount: number }) {
  return <section style={panel}><h2 style={h2}>Report</h2><p style={p}>Report will be generated from the real fixture, selected squad, ratings and live timeline.</p><div style={grid3}><Metric label="Squad" value={selectedCount.toString()} /><Metric label="Events" value={timeline.length.toString()} /><Metric label="Status" value="Draft" /></div></section>
}

function Timeline({ timeline }: { timeline: TimelineEvent[] }) {
  return <div style={{ display: "grid", gap: 8, marginTop: 14 }}>{timeline.length === 0 ? <div style={row}>No live events recorded yet.</div> : timeline.map((event) => <div key={event.id} style={row}>{event.label}</div>)}</div>
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div style={mini}><div style={{ color: "rgba(226,232,240,0.58)", fontSize: 11, fontWeight: 900 }}>{label}</div><div style={{ marginTop: 6, fontSize: 22, fontWeight: 950 }}>{value}</div></div>
}

function Action({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} style={{ ...mini, color: "white", cursor: "pointer" }}><div style={{ fontSize: 18, fontWeight: 950 }}>{label}</div></button>
}

const heroPanel = { borderRadius: 28, padding: 18, background: "linear-gradient(135deg, rgba(37,99,235,0.36), rgba(15,23,42,0.94))", border: "1px solid rgba(147,197,253,0.2)" }
const panel = { borderRadius: 24, padding: 18, background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.14)" }
const h2 = { margin: 0, fontSize: 24 }
const p = { margin: "8px 0 14px", color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }
const row = { borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.48)", border: "1px solid rgba(148,163,184,0.1)", fontWeight: 900 }
const rowButton = { ...row, width: "100%", color: "white", textAlign: "left" as const, cursor: "pointer" }
const mini = { borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.48)", border: "1px solid rgba(148,163,184,0.1)" }
const grid3 = { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 10 }
