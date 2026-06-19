"use client"

import type { EventAttendance, LeagueResult, MainTab, Player, PlayerMatchRating } from "../../lib/types"
import type { EventWithPlan } from "../../lib/dashboardTypes"
import ClubBadge from "../branding/ClubBadge"

type Props = {
  teamName: string
  players: Player[]
  events: EventWithPlan[]
  attendance: EventAttendance[]
  results: LeagueResult[]
  ratings: PlayerMatchRating[]
  activeMatchEventId?: string | null
  onOpenTab: (tab: MainTab) => void
}

function prettyDate(date?: string) {
  if (!date) return "No date"
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
  } catch {
    return date
  }
}

function nextEvent(events: EventWithPlan[]) {
  const today = new Date().toISOString().split("T")[0]
  return [...events]
    .filter((event) => event.date >= today)
    .sort((a, b) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`))[0]
}

function nextMatch(events: EventWithPlan[]) {
  const today = new Date().toISOString().split("T")[0]
  return [...events]
    .filter((event) => event.type === "match" && event.date >= today)
    .sort((a, b) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`))[0]
}

function MiniStat({ label, value, colour }: { label: string; value: string | number; colour: string }) {
  return (
    <div style={{ borderRadius: 20, padding: 14, background: "rgba(2,6,23,0.52)", border: `1px solid ${colour}55`, minHeight: 94 }}>
      <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ color: colour, fontSize: 34, fontWeight: 1000, lineHeight: 1, marginTop: 8 }}>{value}</div>
    </div>
  )
}

function ActionButton({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ border: "1px solid rgba(125,211,252,0.24)", background: "rgba(15,23,42,0.70)", borderRadius: 18, padding: 13, color: "white", fontWeight: 1000, cursor: "pointer", display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  )
}

export default function FootballHomeDashboard({ teamName, players, events, attendance, results, ratings, activeMatchEventId, onOpenTab }: Props) {
  const event = nextEvent(events)
  const match = nextMatch(events)
  const eventAttendance = event ? attendance.filter((item) => item.eventId === event.id) : []
  const available = eventAttendance.filter((item) => item.status === "available").length
  const maybe = eventAttendance.filter((item) => item.status === "maybe").length
  const unavailable = eventAttendance.filter((item) => item.status === "unavailable").length
  const wins = results.filter((result) => result.homeScore > result.awayScore).length
  const avgRating = ratings.length ? (ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length).toFixed(1) : "—"

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <div className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 28, padding: 18, display: "grid", gap: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center", minWidth: 0 }}>
          <ClubBadge size={64} />
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>Leonard Stanley Youth FC</div>
            <div style={{ color: "white", fontSize: 30, fontWeight: 1000, letterSpacing: "-0.055em", lineHeight: 1, overflowWrap: "anywhere" }}>{teamName}</div>
            <div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 800, marginTop: 4 }}>2025/26 season overview</div>
          </div>
        </div>

        <div style={{ borderRadius: 22, padding: 14, background: "rgba(2,6,23,0.48)", border: "1px solid rgba(125,211,252,0.22)", display: "grid", gap: 8 }}>
          <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase" }}>Next Match</div>
          <div style={{ color: "white", fontSize: 20, fontWeight: 1000 }}>{match?.title || event?.title || "No upcoming fixture"}</div>
          <div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 800 }}>{match || event ? `${prettyDate((match || event)?.date)}${(match || event)?.startTime ? ` • ${(match || event)?.startTime}` : ""}` : "Add a match or training event"}</div>
          {(match || event)?.opponent ? <div style={{ color: "#bae6fd", fontSize: 13, fontWeight: 900 }}>vs {(match || event)?.opponent}</div> : null}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <MiniStat label="Squad" value={players.length} colour="#38bdf8" />
        <MiniStat label="Available" value={available} colour="#22c55e" />
        <MiniStat label="Maybe" value={maybe} colour="#f59e0b" />
        <MiniStat label="Unavailable" value={unavailable} colour="#ef4444" />
      </div>

      <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 14, display: "grid", gap: 10, border: "1px solid rgba(125,211,252,0.22)" }}>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          <ActionButton icon="⚽" label={activeMatchEventId ? "Open Match" : "Matchday"} onClick={() => onOpenTab(activeMatchEventId ? "match" : "events")} />
          <ActionButton icon="📅" label="Events" onClick={() => onOpenTab("events")} />
          <ActionButton icon="👥" label="Players" onClick={() => onOpenTab("players")} />
          <ActionButton icon="📊" label="Stats" onClick={() => onOpenTab("stats")} />
        </div>
      </div>

      <div className="sharks-glass" style={{ borderRadius: 22, padding: 14, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, border: "1px solid rgba(125,211,252,0.18)" }}>
        <MiniStat label="Wins" value={wins} colour="#facc15" />
        <MiniStat label="Avg Rating" value={avgRating} colour="#a78bfa" />
      </div>
    </section>
  )
}
