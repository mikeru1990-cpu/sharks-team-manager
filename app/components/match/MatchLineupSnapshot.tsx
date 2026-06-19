"use client"

import type { MatchFormat, PitchSlot, Player } from "../../lib/types"
import { formatClock } from "../../lib/types"

type Props = {
  activeMatchEvent?: { title?: string; startTime?: string; opponent?: string } | null
  homeTeam?: string
  awayTeam?: string
  homeScore?: number
  awayScore?: number
  seconds?: number
  currentQuarter?: number
  periodMode?: "quarters" | "halves"
  matchFormat?: MatchFormat
  formation?: string
  currentSlots?: PitchSlot[]
  players?: Player[]
  lineupMap?: Record<string, string | null>
  benchIds?: string[]
}

function playerName(players: Player[], id?: string | null) {
  if (!id) return "Empty"
  return players.find((player) => player.id === id)?.name || "Unknown"
}

function shortName(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length <= 2) return name
  return `${parts[0]} ${parts[1]}`
}

export default function MatchLineupSnapshot({
  activeMatchEvent = null,
  homeTeam = "Sharks",
  awayTeam = "Opposition",
  homeScore = 0,
  awayScore = 0,
  seconds = 0,
  currentQuarter = 1,
  periodMode = "quarters",
  matchFormat = "7v7",
  formation = "2-3-1",
  currentSlots = [],
  players = [],
  lineupMap = {},
  benchIds = [],
}: Props) {
  const periodLabel = periodMode === "halves" ? `H${currentQuarter}` : `Q${currentQuarter}`
  const orderedSlots = [...currentSlots].sort((a, b) => {
    const order: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 }
    return (order[a.position] ?? 99) - (order[b.position] ?? 99)
  })
  const lineup = orderedSlots.map((slot) => ({
    slot,
    name: playerName(players, lineupMap[slot.id]),
  }))
  const bench = benchIds.map((id) => playerName(players, id)).filter(Boolean)

  return (
    <section className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 26, padding: 14, display: "grid", gap: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".15em", textTransform: "uppercase" }}>
            Match Summary
          </div>
          <div style={{ color: "white", fontSize: 17, fontWeight: 1000, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {activeMatchEvent?.title || `${homeTeam} v ${awayTeam}`}
            {activeMatchEvent?.startTime ? ` • ${activeMatchEvent.startTime}` : ""}
          </div>
        </div>
        <div style={{ borderRadius: 999, padding: "8px 11px", background: "rgba(2,6,23,0.55)", border: "1px solid rgba(125,211,252,0.24)", color: "white", fontWeight: 1000 }}>
          {periodLabel} • {formatClock(seconds)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)", gap: 10, alignItems: "center" }}>
        <div style={{ minWidth: 0, textAlign: "center" }}>
          <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{homeTeam}</div>
          <div style={{ color: "white", fontSize: 36, fontWeight: 1000, lineHeight: 1 }}>{homeScore}</div>
        </div>
        <div style={{ color: "#7dd3fc", fontWeight: 1000 }}>v</div>
        <div style={{ minWidth: 0, textAlign: "center" }}>
          <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{awayTeam}</div>
          <div style={{ color: "white", fontSize: 36, fontWeight: 1000, lineHeight: 1 }}>{awayScore}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
        {[["Format", matchFormat], ["Shape", formation], ["Playing", lineup.filter((item) => item.name !== "Empty").length], ["Bench", bench.length]].map(([label, value]) => (
          <div key={String(label)} style={{ borderRadius: 16, padding: 10, background: "rgba(2,6,23,0.48)", border: "1px solid rgba(125,211,252,0.20)" }}>
            <div style={{ color: "#94a3b8", fontSize: 9, fontWeight: 1000, letterSpacing: ".10em", textTransform: "uppercase" }}>{label}</div>
            <div style={{ color: "white", fontSize: 18, fontWeight: 1000, marginTop: 3 }}>{String(value)}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>
          Starting Lineup
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 8 }}>
          {lineup.length ? lineup.map(({ slot, name }) => (
            <div key={slot.id} style={{ borderRadius: 14, padding: "9px 10px", background: "rgba(15,23,42,0.72)", border: "1px solid rgba(148,163,184,0.18)", minWidth: 0 }}>
              <div style={{ color: "#94a3b8", fontSize: 9, fontWeight: 1000 }}>{slot.position}</div>
              <div style={{ color: name === "Empty" ? "#64748b" : "white", fontSize: 13, fontWeight: 1000, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{shortName(name)}</div>
            </div>
          )) : <div style={{ color: "#94a3b8", fontWeight: 850 }}>No lineup selected yet.</div>}
        </div>
      </div>
    </section>
  )
}
