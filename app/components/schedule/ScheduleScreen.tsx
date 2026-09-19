"use client"

import { CalendarDays, ChevronRight, Dumbbell, MapPin, Trophy } from "lucide-react"
import EventsScreen from "../events/EventsScreen"
import { useTeamAccess } from "../system/TeamAccessProvider"
import type { WorkspaceTab } from "../../lib/workspaces"

type Props = { onNavigate: (tab: WorkspaceTab) => void }

export default function ScheduleScreen({ onNavigate }: Props) {
  const { activeTeam } = useTeamAccess()

  return (
    <div className="fos-everyday-page">
      <section className="fos-page-intro">
        <div>
          <span className="fos-page-kicker">SCHEDULE</span>
          <h1>Everything coming up.</h1>
          <p>{activeTeam?.teamName ?? "Your team"} · matches, training and club events in one place.</p>
        </div>
        <div className="fos-page-icon"><CalendarDays /></div>
      </section>

      <div className="fos-schedule-actions">
        <button type="button" onClick={() => onNavigate("training")}>
          <span className="fos-schedule-action-icon training"><Dumbbell /></span>
          <span><strong>Plan training</strong><small>Build and run the next session</small></span>
          <ChevronRight />
        </button>
        <button type="button" onClick={() => onNavigate("matchday")}>
          <span className="fos-schedule-action-icon match"><Trophy /></span>
          <span><strong>Prepare Matchday</strong><small>Squad, formation and rotations</small></span>
          <ChevronRight />
        </button>
      </div>

      <section className="fos-schedule-card">
        <div className="fos-section-heading">
          <div>
            <span>TEAM CALENDAR</span>
            <h2>Matches, training & events</h2>
          </div>
          <MapPin />
        </div>
        <EventsScreen />
      </section>
    </div>
  )
}
