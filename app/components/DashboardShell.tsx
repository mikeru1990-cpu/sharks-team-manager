"use client"

import nextDynamic from "next/dynamic"

import PlayersManager from "./PlayersManager"
import HomeTab from "./tabs/HomeTab"
import EventsTabContent from "./tabs/EventsTabContent"
import MatchTabContent from "./tabs/MatchTabContent"
import CoachesTabContent from "./tabs/CoachesTabContent"

import EventFormModal from "./modals/EventFormModal"
import MatchEventModal from "./modals/MatchEventModal"
import SeasonModal from "./modals/SeasonModal"

import DashboardHeader from "./layout/DashboardHeader"
import BottomNav from "./layout/BottomNav"
import SeasonSwitcher from "./layout/SeasonSwitcher"

import {
  TEAM,
  cardStyle,
  type AttendanceStatus,
  type Coach,
  type CoachAvailability,
  type EventAttendance,
  type LeagueResult,
  type MainTab,
  type MatchEventDraft,
  type MatchReport,
  type MatchTab,
  type Player,
  type PlayerMatchRating,
} from "../lib/types"

import type {
  EventWithPlan,
  MatchEventDraftSetter,
} from "../lib/dashboardTypes"

const StatsTab = nextDynamic(() => import("./tabs/StatsTab"))

type Props = {
  isAdmin: boolean
  signOut: () => Promise<void>
  loading: boolean

  tab: MainTab
  setTab: (tab: MainTab) => void
  matchTab: MatchTab
  setMatchTab: (tab: MatchTab) => void

  players: Player[]
  coaches: Coach[]
  coachAvailability: CoachAvailability[]
  events: EventWithPlan[]
  attendance: EventAttendance[]
  leagueResults: LeagueResult[]
  playerRatings: PlayerMatchRating[]
  matchReports: MatchReport[]

  // ✅ SEASONS
  seasons: any[]
  activeSeasonId: string
  setActiveSeasonId: (id: string) => void
  showSeasonModal: boolean
  setShowSeasonModal: (v: boolean) => void
  seasonForm: any
  setSeasonForm: (v: any) => void
  handleCreateSeason: () => Promise<void>

  selectedDate: string
  setSelectedDate: (date: string) => void

  selectedDateEvents: EventWithPlan[]
  selectedEvent: EventWithPlan | null
  selectedEventId: string | null
  setSelectedEventId: (value: string | null) => void

  activeMatchEventId: string | null
  setActiveMatchEventId: (value: string | null) => void
  activeMatchEvent: EventWithPlan | null

  // helpers
  formatFullDate: (date: string) => string
  statusStyle: (status: AttendanceStatus) => any
  countAttendance: any
  getPlayerStatus: any
  loadTrainingPlanFromEvent: any

  persistSettings: any
  persistMatchState: any

  savePlayers: any
  saveCoaches: any
  saveCoachAvailability: any
  saveTrainingPlans: any
  saveSessionRecord: any
  savePlayerRating: any
  saveAttendance: any

  addEvent: any
  openAddCalendarEvent: any
  openEditCalendarEvent: any
  deleteCalendarEvent: any

  saveMatchEvent: any
  saveMatchReport: any

  // optional
  availableCount?: number
}

export default function DashboardShell(props: Props) {
  const { loading, tab, isAdmin, signOut } = props

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div style={{ ...cardStyle(), maxWidth: 840, margin: "0 auto" }}>
          Loading club data...
        </div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        paddingBottom: 120,
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 16 }}>

        {/* HEADER */}
        <DashboardHeader
          teamName={TEAM.name}
          isAdmin={isAdmin}
          onSignOut={signOut}
          nextEventTitle={props.selectedDateEvents?.[0]?.title || "No upcoming event"}
          nextEventDateLabel={
            props.selectedDateEvents?.[0]
              ? `${props.selectedDateEvents[0].date}${
                  props.selectedDateEvents[0].startTime
                    ? ` • ${props.selectedDateEvents[0].startTime}`
                    : ""
                }`
              : "Select a day in the planner"
          }
          availablePlayersCount={props.availableCount}
          totalPlayersCount={props.players?.length}
        />

        {/* ✅ SEASON SWITCHER */}
        {props.seasons && props.setActiveSeasonId ? (
          <SeasonSwitcher
            seasons={props.seasons}
            activeSeasonId={props.activeSeasonId}
            onChange={props.setActiveSeasonId}
            onCreate={() => props.setShowSeasonModal(true)}
          />
        ) : null}

        {/* TABS */}

        {tab === "home" && (
          <HomeTab
            teamName={TEAM.name}
            players={props.players}
            events={props.events}
            attendance={props.attendance}
            results={props.leagueResults}
            ratings={props.playerRatings}
            activeMatchEventId={props.activeMatchEventId}
            selectedDate={props.selectedDate}
            onOpenTab={props.setTab}
          />
        )}

        {tab === "players" && (
          <PlayersManager
            players={props.players}
            isAdmin={props.isAdmin}
            onSavePlayers={props.savePlayers}
          />
        )}

        {tab === "events" && (
          <EventsTabContent
            isAdmin={props.isAdmin}
            selectedDate={props.selectedDate}
            setSelectedDate={props.setSelectedDate}
            events={props.events}
            selectedDateEvents={props.selectedDateEvents}
            selectedEvent={props.selectedEvent}
            selectedEventId={props.selectedEventId}
            setSelectedEventId={props.setSelectedEventId}
            activeMatchEventId={props.activeMatchEventId}
            setActiveMatchEventId={props.setActiveMatchEventId}
            players={props.players}
            attendance={props.attendance}
            formatFullDate={props.formatFullDate}
            statusStyle={props.statusStyle}
            countAttendance={props.countAttendance}
            getPlayerStatus={props.getPlayerStatus}
            loadTrainingPlanFromEvent={props.loadTrainingPlanFromEvent}
            persistSettings={props.persistSettings}
            saveAttendance={props.saveAttendance}
            saveTrainingPlans={props.saveTrainingPlans}
            saveSessionRecord={props.saveSessionRecord}
            openAddCalendarEvent={props.openAddCalendarEvent}
            openEditCalendarEvent={props.openEditCalendarEvent}
            deleteCalendarEvent={props.deleteCalendarEvent}
          />
        )}

        {tab === "coaches" && (
          <CoachesTabContent
            isAdmin={props.isAdmin}
            selectedDate={props.selectedDate}
            coaches={props.coaches}
            coachAvailability={props.coachAvailability}
            selectedDateCoachAvailability={[]}
            formatFullDate={props.formatFullDate}
            saveCoaches={props.saveCoaches}
            saveCoachAvailability={props.saveCoachAvailability}
          />
        )}

        {tab === "match" && (
          <MatchTabContent {...props} />
        )}

        {tab === "stats" && (
          <StatsTab
            teamName={TEAM.name}
            results={props.leagueResults}
            players={props.players}
            ratings={props.playerRatings}
            timeline={[]}
          />
        )}
      </div>

      {/* ✅ FIXED NAV */}
      <BottomNav tab={props.tab} setTab={props.setTab} />

      {/* MODALS */}

      <EventFormModal
        open={props.showEventForm}
        editingCalendarEventId={props.editingCalendarEventId}
        eventTitle={props.eventTitle}
        setEventTitle={props.setEventTitle}
        eventType={props.eventType}
        setEventType={props.setEventType}
        selectedDbTrainingPlanId={props.selectedDbTrainingPlanId}
        setSelectedDbTrainingPlanId={props.setSelectedDbTrainingPlanId}
        allTrainingPlans={props.allTrainingPlans}
        eventStartTime={props.eventStartTime}
        setEventStartTime={props.setEventStartTime}
        eventLocation={props.eventLocation}
        setEventLocation={props.setEventLocation}
        eventOpponent={props.eventOpponent}
        setEventOpponent={props.setEventOpponent}
        eventNotes={props.eventNotes}
        setEventNotes={props.setEventNotes}
        selectedDate={props.selectedDate}
        onSave={props.addEvent}
        onClose={() => props.setShowEventForm(false)}
      />

      <MatchEventModal
        open={false}
        editingTimelineId={null}
        eventDraft={{} as MatchEventDraft}
        setEventDraft={props.setEventDraft as MatchEventDraftSetter}
        matchPlayers={props.players}
        onSave={props.saveMatchEvent}
        onClose={() => {}}
      />

      {/* ✅ SEASON MODAL */}
      <SeasonModal
        open={props.showSeasonModal}
        value={props.seasonForm}
        setValue={props.setSeasonForm}
        onSave={props.handleCreateSeason}
        onClose={() => props.setShowSeasonModal(false)}
      />
    </main>
  )
}
