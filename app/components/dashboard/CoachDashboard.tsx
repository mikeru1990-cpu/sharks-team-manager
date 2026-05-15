import StatTile from "../ui/StatTile"
import PageCard from "../ui/PageCard"
import SectionHeader from "../ui/SectionHeader"

import type {
  EventAttendance,
  EventWithPlan,
  LeagueResult,
  Player,
} from "../../lib/dashboardTypes"

type Props = {
  players: Player[]
  events: EventWithPlan[]
  attendance: EventAttendance[]
  results: LeagueResult[]
}

function getNextMatch(events: EventWithPlan[]) {
  const now = new Date()

  return events
    .filter((event) => event.type === "match")
    .filter((event) => new Date(event.date) >= now)
    .sort((a, b) => a.date.localeCompare(b.date))[0]
}

export default function CoachDashboard({
  players,
  events,
  attendance,
  results,
}: Props) {
  const nextMatch = getNextMatch(events)

  const availableCount = attendance.filter(
    (a) => a.status === "available"
  ).length

  const unavailableCount = attendance.filter(
    (a) => a.status === "unavailable"
  ).length

  const wins = results.filter((r) => r.homeScore > r.awayScore).length

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile
          label="Squad Size"
          value={players.length}
          subtitle="Registered players"
        />

        <StatTile
          label="Available"
          value={availableCount}
          subtitle="Ready for selection"
        />

        <StatTile
          label="Unavailable"
          value={unavailableCount}
          subtitle="Current absences"
        />

        <StatTile
          label="Wins"
          value={wins}
          subtitle="Season victories"
        />
      </div>

      <PageCard>
        <SectionHeader
          title="Next Match"
          subtitle="Upcoming fixture overview"
        />

        {nextMatch ? (
          <div className="grid gap-2">
            <div className="text-2xl font-black text-slate-900">
              {nextMatch.title}
            </div>

            <div className="text-slate-500">
              {nextMatch.date}
            </div>

            {nextMatch.location && (
              <div className="text-slate-600 font-medium">
                {nextMatch.location}
              </div>
            )}
          </div>
        ) : (
          <div className="text-slate-500">
            No upcoming fixtures scheduled.
          </div>
        )}
      </PageCard>
    </div>
  )
}
