"use client"

import type { TimelineItem } from "../../lib/types"

type Props = {
  timeline?: TimelineItem[]
  playersUsed?: number
  benchCount?: number
  formation?: string
  homeScore?: number
  awayScore?: number
  homeTeam?: string
  awayTeam?: string
}

function countType(timeline: TimelineItem[], type: string) {
  return timeline.filter((item) => item.type === type).length
}

export default function MatchSummaryCard({
  timeline = [],
  playersUsed = 0,
  benchCount = 0,
  formation = "",
  homeScore = 0,
  awayScore = 0,
  homeTeam = "Sharks",
  awayTeam = "Opposition",
}: Props) {
  const stats = [
    { label: "Goals", value: countType(timeline, "goal"), colour: "#22c55e" },
    { label: "Assists", value: countType(timeline, "assist"), colour: "#38bdf8" },
    { label: "Subs", value: countType(timeline, "sub"), colour: "#facc15" },
    { label: "Notes", value: countType(timeline, "note"), colour: "#a78bfa" },
    { label: "Players", value: playersUsed, colour: "#2dd4bf" },
  ]

  return (
    <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 28, padding: 16, display: "grid", gap: 14, border: "1px solid rgba(125,211,252,0.22)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".15em" }}>LIVE MATCH SUMMARY</div>
          <div style={{ color: "white", fontSize: 22, fontWeight: 1000, marginTop: 4 }}>{homeTeam} {homeScore} - {awayScore} {awayTeam}</div>
        </div>
        <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 900, border: "1px solid rgba(148,163,184,0.22)", borderRadius: 999, padding: "7px 10px" }}>{formation || "Formation not set"}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(92px, 1fr))", gap: 10 }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ borderRadius: 18, padding: 12, background: "rgba(2,6,23,0.46)", border: `1px solid ${stat.colour}44`, boxShadow: `0 10px 28px ${stat.colour}10` }}>
            <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 1000, letterSpacing: ".09em", textTransform: "uppercase" }}>{stat.label}</div>
            <div style={{ color: stat.colour, fontSize: 28, fontWeight: 1000, lineHeight: 1, marginTop: 6 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        <div style={{ borderRadius: 18, padding: 12, background: "rgba(2,6,23,0.38)", border: "1px solid rgba(148,163,184,0.18)", color: "#cbd5e1", fontWeight: 800 }}>Bench players: <strong style={{ color: "white" }}>{benchCount}</strong></div>
        <div style={{ borderRadius: 18, padding: 12, background: "rgba(2,6,23,0.38)", border: "1px solid rgba(148,163,184,0.18)", color: "#cbd5e1", fontWeight: 800 }}>Events logged: <strong style={{ color: "white" }}>{timeline.length}</strong></div>
      </div>
    </div>
  )
}
