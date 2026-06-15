"use client"

import type { TeamIdentity } from "../../lib/teamAccess"
import { getTeamDisplayName } from "../../lib/teamAccess"

type Props = {
  teams?: TeamIdentity[]
  playersCount?: number
  coachesCount?: number
  upcomingEventsCount?: number
  pendingApprovalsCount?: number
}

export default function ClubOverviewPanel({
  teams = [],
  playersCount = 0,
  coachesCount = 0,
  upcomingEventsCount = 0,
  pendingApprovalsCount = 0,
}: Props) {
  const cards = [
    { label: "Teams", value: teams.length, detail: "Active club teams", colour: "#38bdf8" },
    { label: "Players", value: playersCount, detail: "Registered players", colour: "#22c55e" },
    { label: "Coaches", value: coachesCount, detail: "Coaching staff", colour: "#a78bfa" },
    { label: "Upcoming", value: upcomingEventsCount, detail: "Events and fixtures", colour: "#facc15" },
    { label: "Pending", value: pendingApprovalsCount, detail: "Access requests", colour: "#fb7185" },
  ]

  return (
    <section className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 28, padding: 18, display: "grid", gap: 16 }}>
      <div>
        <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>
          Club Dashboard
        </div>
        <div style={{ color: "white", fontSize: 28, fontWeight: 1000, marginTop: 6, letterSpacing: "-0.04em" }}>
          Leonard Stanley Youth FC Overview
        </div>
        <div style={{ color: "#cbd5e1", fontWeight: 750, marginTop: 6 }}>
          A club-wide snapshot for teams, players, coaches, fixtures and access control.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 10 }}>
        {cards.map((card) => (
          <div key={card.label} style={{ borderRadius: 20, padding: 13, background: "rgba(2,6,23,0.44)", border: `1px solid ${card.colour}55` }}>
            <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 1000, letterSpacing: ".09em", textTransform: "uppercase" }}>{card.label}</div>
            <div style={{ color: card.colour, fontSize: 30, fontWeight: 1000, lineHeight: 1, marginTop: 6 }}>{card.value}</div>
            <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 800, marginTop: 6 }}>{card.detail}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ color: "white", fontSize: 16, fontWeight: 1000 }}>Teams</div>
        {teams.length === 0 ? (
          <div style={{ color: "#94a3b8", fontWeight: 800 }}>No teams loaded yet.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
            {teams.slice(0, 8).map((team) => (
              <div key={team.id} style={{ borderRadius: 16, padding: 10, background: "rgba(15,23,42,0.72)", border: `1px solid ${(team.primaryColour || "#38bdf8")}55`, color: "white", fontWeight: 900 }}>
                {getTeamDisplayName(team)}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
