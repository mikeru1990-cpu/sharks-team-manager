"use client"

import type { EventAttendance, LeagueResult, Player } from "../../lib/types"
import type { EventWithPlan } from "../../lib/dashboardTypes"
import type { TeamIdentity } from "../../lib/teamAccess"
import { getTeamDisplayName } from "../../lib/teamAccess"
import ClubBadge from "../branding/ClubBadge"

type Props = {
  teams: TeamIdentity[]
  players: Player[]
  events: EventWithPlan[]
  attendance: EventAttendance[]
  results: LeagueResult[]
  onOpenTeam?: (teamId: string) => void
}

function nextFixture(events: EventWithPlan[]) {
  const today = new Date().toISOString().split("T")[0]
  return [...events]
    .filter((event) => event.date >= today)
    .sort((a, b) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`))[0]
}

function prettyDate(date?: string) {
  if (!date) return "No fixture"
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

function statCard(label: string, value: string | number, colour: string) {
  return (
    <div style={{ borderRadius: 20, padding: 14, background: "rgba(2,6,23,0.52)", border: `1px solid ${colour}55` }}>
      <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ color: colour, fontSize: 34, fontWeight: 1000, lineHeight: 1, marginTop: 7 }}>{value}</div>
    </div>
  )
}

function teamEvents(events: EventWithPlan[], teamId: string) {
  return events.filter((event: any) => !event.teamId || event.teamId === teamId)
}

export default function ClubDashboard({ teams, players, events, attendance, results, onOpenTeam }: Props) {
  const upcoming = [...events]
    .filter((event) => event.date >= new Date().toISOString().split("T")[0])
    .sort((a, b) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`))
    .slice(0, 5)

  return (
    <section style={{ display: "grid", gap: 14 }}>
      <div className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 28, padding: 18, display: "grid", gap: 16, overflow: "hidden" }}>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <ClubBadge size={64} />
          <div style={{ minWidth: 0 }}>
            <div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>Club Command Centre</div>
            <div style={{ color: "white", fontSize: 30, fontWeight: 1000, letterSpacing: "-0.055em", lineHeight: 1 }}>Leonard Stanley Sharks</div>
            <div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 800, marginTop: 4 }}>All teams overview for fixtures, squads and availability.</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
          {statCard("Teams", teams.length, "#38bdf8")}
          {statCard("Players", players.length, "#22c55e")}
          {statCard("Fixtures", upcoming.length, "#facc15")}
          {statCard("Results", results.length, "#a78bfa")}
        </div>
      </div>

      <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 24, padding: 14, display: "grid", gap: 12, border: "1px solid rgba(125,211,252,0.22)" }}>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>Teams</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
          {teams.map((team) => {
            const fixtures = teamEvents(events, team.id)
            const fixture = nextFixture(fixtures)
            const eventAttendance = fixture ? attendance.filter((item) => item.eventId === fixture.id) : []
            const available = eventAttendance.filter((item) => item.status === "available").length
            const total = eventAttendance.length || players.length
            const percent = total > 0 ? Math.round((available / total) * 100) : 0
            const colour = percent >= 75 ? "#22c55e" : percent >= 50 ? "#f59e0b" : "#ef4444"
            return (
              <button key={team.id} onClick={() => onOpenTeam?.(team.id)} style={{ borderRadius: 22, padding: 14, background: "rgba(2,6,23,0.48)", border: `1px solid ${(team.primaryColour || colour)}66`, color: "white", textAlign: "left", cursor: "pointer", display: "grid", gap: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: team.primaryColour || "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".10em", textTransform: "uppercase" }}>{team.ageGroup || "Team"} • {team.section || "club"}</div>
                    <div style={{ fontSize: 18, fontWeight: 1000, lineHeight: 1.1, marginTop: 4 }}>{getTeamDisplayName(team)}</div>
                  </div>
                  <div style={{ color: colour, fontWeight: 1000 }}>{percent}%</div>
                </div>
                <div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 800 }}>{fixture ? `${prettyDate(fixture.date)}${fixture.startTime ? ` • ${fixture.startTime}` : ""}` : "No upcoming fixture"}</div>
                <div style={{ height: 9, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(100, percent)}%`, height: "100%", background: colour, borderRadius: 999 }} />
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="sharks-glass" style={{ borderRadius: 24, padding: 14, display: "grid", gap: 10, border: "1px solid rgba(125,211,252,0.18)" }}>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>Upcoming Fixtures</div>
        {upcoming.length ? upcoming.map((event) => (
          <div key={event.id} style={{ borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(148,163,184,0.16)", display: "grid", gap: 3 }}>
            <div style={{ color: "white", fontWeight: 1000 }}>{event.title}</div>
            <div style={{ color: "#cbd5e1", fontSize: 13, fontWeight: 800 }}>{prettyDate(event.date)}{event.startTime ? ` • ${event.startTime}` : ""}{event.opponent ? ` • vs ${event.opponent}` : ""}</div>
          </div>
        )) : <div style={{ color: "#94a3b8", fontWeight: 850 }}>No upcoming fixtures yet.</div>}
      </div>
    </section>
  )
}
