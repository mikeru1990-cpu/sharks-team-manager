import type {
  EventAttendance,
  LeagueResult,
  Player,
  PlayerMatchRating,
} from "../../lib/types"

import type { EventWithPlan } from "../../lib/dashboardTypes"

type Props = {
  players: Player[]
  events: EventWithPlan[]
  attendance: EventAttendance[]
  results: LeagueResult[]
  ratings: PlayerMatchRating[]
}

function formatDate(date?: string) {
  if (!date) return "—"
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

function getNextEvent(events: EventWithPlan[]) {
  const today = new Date().toISOString().split("T")[0]
  return [...events]
    .filter((event) => event.date >= today)
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return (a.startTime || "").localeCompare(b.startTime || "")
    })[0]
}

function StatCard({ label, value, detail, colour }: { label: string; value: string | number; detail: string; colour: string }) {
  return (
    <div
      style={{
        borderRadius: 22,
        padding: 14,
        background: "rgba(2,6,23,0.52)",
        border: `1px solid ${colour}55`,
        boxShadow: `0 16px 34px ${colour}12`,
        display: "grid",
        gap: 6,
        minHeight: 112,
      }}
    >
      <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ color: colour, fontSize: 34, fontWeight: 1000, lineHeight: 1, letterSpacing: "-0.04em" }}>
        {value}
      </div>
      <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 800, lineHeight: 1.35 }}>
        {detail}
      </div>
    </div>
  )
}

export default function DashboardOverview({
  players,
  events,
  attendance,
  results,
  ratings,
}: Props) {
  const nextEvent = getNextEvent(events)
  const nextEventAttendance = nextEvent ? attendance.filter((item) => item.eventId === nextEvent.id) : []
  const available = nextEventAttendance.filter((item) => item.status === "available").length
  const unavailable = nextEventAttendance.filter((item) => item.status === "unavailable").length
  const wins = results.filter((result) => result.homeScore > result.awayScore).length
  const averageRating = ratings.length > 0 ? (ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length).toFixed(1) : "—"

  return (
    <section className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 28, padding: 16, display: "grid", gap: 14 }}>
      <div>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>
          Team Snapshot
        </div>
        <div style={{ color: "white", fontSize: 24, fontWeight: 1000, marginTop: 4, letterSpacing: "-0.04em" }}>
          Key information
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        <StatCard label="Squad" value={players.length} detail="registered players" colour="#38bdf8" />
        <StatCard label="Available" value={available} detail={nextEvent ? "for next event" : "no event selected"} colour="#22c55e" />
        <StatCard label="Wins" value={wins} detail="season victories" colour="#facc15" />
        <StatCard label="Avg rating" value={averageRating} detail="recent match ratings" colour="#a78bfa" />
      </div>

      <div style={{ borderRadius: 20, padding: 13, background: "rgba(15,23,42,0.62)", border: "1px solid rgba(125,211,252,0.20)", display: "grid", gap: 5 }}>
        <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase" }}>
          Next Event
        </div>
        <div style={{ color: "white", fontSize: 18, fontWeight: 1000 }}>
          {nextEvent?.title || "No upcoming event"}
        </div>
        <div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 800 }}>
          {nextEvent ? `${formatDate(nextEvent.date)}${nextEvent.startTime ? ` • ${nextEvent.startTime}` : ""}` : "Create one in Events"}
        </div>
      </div>

      {unavailable > 0 ? (
        <div style={{ color: "#fca5a5", fontSize: 12, fontWeight: 850 }}>
          {unavailable} marked unavailable for the next event.
        </div>
      ) : null}
    </section>
  )
}
