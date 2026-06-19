"use client"

import nextDynamic from "next/dynamic"
import PlayersManager from "./PlayersManager"
import EventsTabContent from "./tabs/EventsTabContent"
import MatchTabContent from "./tabs/MatchTabContent"
import CoachesTabContent from "./tabs/CoachesTabContent"
import UserApprovalCentre from "./admin/UserApprovalCentre"
import TeamsAdminPanel from "./admin/TeamsAdminPanel"
import EventFormModal from "./modals/EventFormModal"
import MatchEventModal from "./modals/MatchEventModal"
import SeasonModal from "./modals/SeasonModal"
import BottomNav from "./layout/BottomNav"
import ClubBrandBackdrop from "./layout/ClubBrandBackdrop"
import TeamLocationBadge from "./layout/TeamLocationBadge"
import TeamSwitcherBar from "./layout/TeamSwitcherBar"
import AppPolishFrame from "./layout/AppPolishFrame"
import FootballHomeDashboard from "./dashboard/FootballHomeDashboard"
import MatchLineupSnapshot from "./match/MatchLineupSnapshot"

import { defaultClubTeams } from "../lib/defaultTeams"
import {
  TEAM,
  cardStyle,
  type MainTab,
  type MatchEventDraft,
} from "../lib/types"

import type { MatchEventDraftSetter } from "../lib/dashboardTypes"

const StatsTab = nextDynamic(() => import("./tabs/StatsTab"))

type Props = any

function ShellSection({ children }: { children: React.ReactNode }) {
  return <section style={{ minWidth: 0, display: "grid", gap: 14 }}>{children}</section>
}

function PageIntro({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="sharks-elite-panel sharks-card-shine" style={{ padding: 18, borderRadius: 24, display: "grid", gap: 7, overflow: "hidden" }}>
      <div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".16em", textTransform: "uppercase" }}>{eyebrow}</div>
      <div style={{ color: "white", fontSize: 28, fontWeight: 1000, lineHeight: 1, letterSpacing: "-0.045em" }}>{title}</div>
      <div style={{ color: "#cbd5e1", fontWeight: 700, lineHeight: 1.45, maxWidth: 760 }}>{subtitle}</div>
    </div>
  )
}

function titleCase(value?: string) {
  const safe = String(value || "Home")
  return safe.charAt(0).toUpperCase() + safe.slice(1)
}

export default function DashboardShell(props: Props) {
  const { loading, tab, isAdmin } = props

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 24, background: "radial-gradient(circle at top, rgba(37,99,235,0.28), transparent 34%), linear-gradient(180deg, #020617 0%, #0f172a 100%)" }}>
        <ClubBrandBackdrop />
        <AppPolishFrame />
        <div style={{ ...cardStyle(), position: "relative", zIndex: 1, maxWidth: 840, margin: "0 auto", borderRadius: 30, padding: 30, background: "rgba(15,23,42,0.86)", color: "white", border: "1px solid rgba(125,211,252,0.20)", boxShadow: "0 25px 70px rgba(0,0,0,0.42)", fontWeight: 900 }}>Loading Sharks Coaching Console...</div>
      </main>
    )
  }

  const switcherTeams = props.clubTeams || defaultClubTeams
  const activeTeamId = props.activeTeamId || "all"

  return (
    <main style={{ minHeight: "100vh", padding: 16, paddingBottom: 118, background: "radial-gradient(circle at top left, rgba(37,99,235,0.24), transparent 34%), radial-gradient(circle at top right, rgba(14,165,233,0.18), transparent 34%), linear-gradient(180deg, #020617 0%, #07111f 48%, #020617 100%)", overflowX: "hidden", boxSizing: "border-box", position: "relative", color: "#e5eefc" }}>
      <ClubBrandBackdrop />
      <AppPolishFrame />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1140, margin: "0 auto", display: "grid", gap: 14, minWidth: 0 }}>
        <TeamLocationBadge teamName={props.activeTeamName || TEAM.name} roleLabel={isAdmin ? "Club Admin" : "Coach"} sectionLabel={titleCase(tab)} modeLabel={isAdmin ? "Club-wide view" : "Team workspace"} />
        <TeamSwitcherBar teams={switcherTeams} activeTeamId={activeTeamId} canSwitch={Boolean(isAdmin)} onChangeTeam={props.setActiveTeamId} />

        {tab === "home" && (
          <FootballHomeDashboard teamName={TEAM.name} players={props.players} events={props.events} attendance={props.attendance} results={props.leagueResults} ratings={props.playerRatings} activeMatchEventId={props.activeMatchEventId} onOpenTab={props.setTab} />
        )}

        {tab === "players" && <ShellSection><PageIntro eyebrow="Players" title="Squad Manager" subtitle="Player database, positions, development notes and squad management." /><PlayersManager players={props.players} isAdmin={props.isAdmin} onSavePlayers={props.savePlayers} /></ShellSection>}

        {tab === "events" && (
          <ShellSection>
            <PageIntro eyebrow="Events" title="Events Command" subtitle="Training, fixtures, attendance and recurring weekly sessions." />
            <EventsTabContent isAdmin={props.isAdmin} selectedDate={props.selectedDate} setSelectedDate={props.setSelectedDate} events={props.events} selectedDateEvents={props.selectedDateEvents} selectedEvent={props.selectedEvent} selectedEventId={props.selectedEventId} setSelectedEventId={props.setSelectedEventId} activeMatchEventId={props.activeMatchEventId} setActiveMatchEventId={props.setActiveMatchEventId} players={props.players} attendance={props.attendance} allTrainingPlans={props.allTrainingPlans} selectedTemplateId={props.selectedTemplateId} setSelectedTemplateId={props.setSelectedTemplateId} trainingPlan={props.trainingPlan} setTrainingPlan={props.setTrainingPlan} selectedDbTrainingPlanId={props.selectedDbTrainingPlanId} setSelectedDbTrainingPlanId={props.setSelectedDbTrainingPlanId} activeSession={props.activeSession} setActiveSession={props.setActiveSession} sessionHistory={props.sessionHistory} formatFullDate={props.formatFullDate} statusStyle={props.statusStyle} countAttendance={props.countAttendance} getPlayerStatus={props.getPlayerStatus} loadTrainingPlanFromEvent={props.loadTrainingPlanFromEvent} persistSettings={props.persistSettings} saveAttendance={props.saveAttendance} saveTrainingPlans={props.saveTrainingPlans} saveSessionRecord={props.saveSessionRecord} openAddCalendarEvent={props.openAddCalendarEvent} openEditCalendarEvent={props.openEditCalendarEvent} deleteCalendarEvent={props.deleteCalendarEvent} />
          </ShellSection>
        )}

        {tab === "coaches" && <ShellSection><PageIntro eyebrow="Admin" title="Club Admin" subtitle="Coaches, team setup, approvals and club management." /><CoachesTabContent isAdmin={props.isAdmin} selectedDate={props.selectedDate} coaches={props.coaches} coachAvailability={props.coachAvailability} selectedDateCoachAvailability={props.selectedDateCoachAvailability || []} formatFullDate={props.formatFullDate} saveCoaches={props.saveCoaches} saveCoachAvailability={props.saveCoachAvailability} />{props.isAdmin ? <><TeamsAdminPanel teams={switcherTeams} /><UserApprovalCentre /></> : null}</ShellSection>}

        {tab === "match" && <ShellSection><MatchLineupSnapshot {...props} /><MatchTabContent {...props} /></ShellSection>}

        {tab === "stats" && <ShellSection><PageIntro eyebrow="Stats" title="Analytics Hub" subtitle="Team form, results, head-to-head records and performance trends." /><StatsTab teamName={props.normalizeTeamName ? props.normalizeTeamName(TEAM.name) : TEAM.name} results={props.leagueResults} players={props.players} ratings={props.playerRatings} timeline={props.timeline || []} /></ShellSection>}
      </div>

      <BottomNav tab={props.tab as MainTab} setTab={props.setTab} />

      <EventFormModal open={props.showEventForm} editingCalendarEventId={props.editingCalendarEventId} eventTitle={props.eventTitle} setEventTitle={props.setEventTitle} eventType={props.eventType} setEventType={props.setEventType} selectedDbTrainingPlanId={props.selectedDbTrainingPlanId} setSelectedDbTrainingPlanId={props.setSelectedDbTrainingPlanId} allTrainingPlans={props.allTrainingPlans} eventStartTime={props.eventStartTime} setEventStartTime={props.setEventStartTime} eventLocation={props.eventLocation} setEventLocation={props.setEventLocation} eventOpponent={props.eventOpponent} setEventOpponent={props.setEventOpponent} eventNotes={props.eventNotes} setEventNotes={props.setEventNotes} selectedDate={props.selectedDate} onSave={props.addEvent} onClose={() => { props.setShowEventForm(false); props.setEditingCalendarEventId(null); props.setEventTitle(""); props.setEventType("training"); props.setEventStartTime(""); props.setEventLocation(""); props.setEventOpponent(""); props.setEventNotes(""); props.setSelectedDbTrainingPlanId("") }} />
      <MatchEventModal open={props.showMatchEventModal} editingTimelineId={props.editingTimelineId} eventDraft={props.eventDraft || ({} as MatchEventDraft)} setEventDraft={props.setEventDraft as MatchEventDraftSetter} matchPlayers={props.matchPlayers || props.players} onSave={props.saveMatchEvent} onClose={() => { props.setShowMatchEventModal(false); props.setEditingTimelineId(null) }} />
      {props.setShowSeasonModal ? <SeasonModal open={props.showSeasonModal} value={props.seasonForm} setValue={props.setSeasonForm} onSave={props.handleCreateSeason} onClose={() => props.setShowSeasonModal(false)} /> : null}
    </main>
  )
}
