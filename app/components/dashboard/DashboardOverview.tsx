import CoachDashboard from "./CoachDashboard"
import AnalyticsCharts from "../analytics/AnalyticsCharts"
import FairnessOverview from "../analytics/FairnessOverview"

import type {
  EventAttendance,
  LeagueResult,
  Player,
  PlayerMatchRating,
} from "../../lib/types"

import type { EventWithPlan } from "../../lib/dashboardTypes"

import { TEAM } from "../../lib/types"

type Props = {
  players: Player[]
  events: EventWithPlan[]
  attendance: EventAttendance[]
  results: LeagueResult[]
  ratings: PlayerMatchRating[]
}

export default function DashboardOverview({
  players,
  events,
  attendance,
  results,
  ratings,
}: Props) {
  return (
    <div className="grid gap-6">
      <CoachDashboard
        players={players}
        events={events}
        attendance={attendance}
        results={results}
      />

      <FairnessOverview
        players={players}
        ratings={ratings}
      />

      <AnalyticsCharts
        results={results}
        ratings={ratings}
        players={players}
        teamName={TEAM.name}
      />
    </div>
  )
}
