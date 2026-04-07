"use client"

import nextDynamic from "next/dynamic"
import PlayersManager from "./PlayersManager"
import HomeTab from "./tabs/HomeTab"
import EventsTabContent from "./tabs/EventsTabContent"
import MatchTabContent from "./tabs/MatchTabContent"
import CoachesTabContent from "./tabs/CoachesTabContent"
import EventFormModal from "./modals/EventFormModal"
import MatchEventModal from "./modals/MatchEventModal"
import DashboardHeader from "./layout/DashboardHeader"
import BottomNav from "./layout/BottomNav"

import {
  TEAM,
  type AttendanceStatus,
  type Coach,
  type CoachAvailability,
  type CoachAvailabilityStatus,
  type EventAttendance,
  type LeagueResult,
  type MainTab,
  type MatchEventDraft,
  type MatchFormat,
  type MatchReport,
  type MatchTab,
  type PitchSlot,
  type Player,
  type PlayerMatchRating,
  type QuarterPlan,
  type SavedLineup,
  type TimelineItem,
  type TrainingSession,
  type TrainingSessionRecord,
  type TrainingTemplate,
  cardStyle,
} from "../lib/types"

import type {
  EventWithPlan,
  MatchEventDraftSetter,
  PeriodMode,
  TrainingPlanState,
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

  selectedDate: string
  setSelectedDate: (date: string) => void

  showEventForm: boolean
  setShowEventForm: (value: boolean) => void
  editingCalendarEventId: string | null
  setEditingCalendarEventId: (value: string | null) => void
  selectedEventId: string | null
  setSelectedEventId: (value: string | null) => void
  activeMatchEventId: string | null
  setActiveMatchEventId: (value: string | null) => void

  eventTitle: string
  setEventTitle: (value: string) => void
  eventType: "training" | "match" | "other"
  setEventType: (value: "training" | "match" | "other") => void
  eventStartTime: string
  setEventStartTime: (value: string) => void
  eventLocation: string
  setEventLocation: (value: string) => void
  eventOpponent: string
  setEventOpponent: (value: string) => void
  eventNotes: string
  setEventNotes: (value: string) => void
  selectedDbTrainingPlanId: string
  setSelectedDbTrainingPlanId: (value: string) => void

  homeTeam: string
  setHomeTeamState: (value: string) => void
  awayTeam: string
  setAwayTeamState: (value: string) => void
  homeScore: number
  setHomeScoreState: (value: number) => void
  awayScore: number
  setAwayScoreState: (value: number) => void

  matchFormat: MatchFormat
  formation: string
  currentQuarter: number
  setCurrentQuarterState: (value: number) => void

  periodMode: PeriodMode
  setPeriodModeState: (value: PeriodMode) => void
  periodLength: number
  setPeriodLengthState: (value: number) => void

  seconds: number
  setSeconds: (value: number) => void
  running: boolean
  setRunning: (value: boolean) => void
  liveSecondsMap: Record<string, number>
  setLiveSecondsMap: (value: Record<string, number>) => void

  lineupMap: Record<string, string | null>
  setLineupMap: (value: Record<string, string | null>) => void
  benchIds: string[]
  setBenchIds: (value: string[]) => void
  savedLineups: SavedLineup[]

  lineupName: string
  setLineupName: (value: string) => void

  timeline: TimelineItem[]
  editingTimelineId: string | null
  setEditingTimelineId: (value: string | null) => void
  showMatchEventModal: boolean
  setShowMatchEventModal: (value: boolean) => void
  eventDraft: MatchEventDraft
  setEventDraft: MatchEventDraftSetter

  quarterPlans: Record<number, QuarterPlan>
  quarterWarnings: string[]
  activeDragPlayerId: string | null
  setActiveDragPlayerId: (value: string | null) => void

  allTrainingPlans: TrainingTemplate[]
  selectedTemplateId: string
  setSelectedTemplateId: (value: string) => void
  trainingPlan: TrainingPlanState
  setTrainingPlan: (value: TrainingPlanState) => void

  activeSession: TrainingSession | null
  setActiveSession: (value: TrainingSession | null) => void
  sessionHistory: TrainingSessionRecord[]

  currentSlots: PitchSlot[]
  selectedDateEvents: EventWithPlan[]
  selectedEvent: EventWithPlan | null
  activeMatchEvent: EventWithPlan | null

  activeMatchAvailableIds: string[]
  activeMatchMaybeIds: string[]
  matchPlayers: Player[]
  maybePlayers: Player[]
  unavailablePlayers: Player[]
  noAvailableKeeper: boolean

  selectedDateCoachAvailability: CoachAvailability[]
  matchDateForCoachView: string
  availableCoaches: Coach[]
  unavailableCoachesList: Coach[]
  holidayCoachesList: Coach[]
  headCoachAvailable: boolean
  noAvailableCoaches: boolean

  playerOfMatchMap: Record<string, string>
  activeTopPerformers: string[]
  activeGoalsSummary: string[]
  latestActiveMatchReport: MatchReport | null

  formatFullDate: (date: string) => string
  statusStyle: (status: AttendanceStatus) => any
  normalizeTeamName: (name: string) => string

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

  addEvent: () => Promise<void>
  openAddCalendarEvent: () => void
  openEditCalendarEvent: any
  deleteCalendarEvent: any

  handleChangeFormation: any
  handleSaveLineup: any
  handleLoadSavedLineup: any
  handleDeleteSavedLineup: any

  handleDragStart: any
  handleDragEnd: any

  openCreateEvent: any
  openEditEvent: any
  handleDeleteTimelineItem: any
  saveMatchEvent: any

  handleSaveCurrentQuarter: any
  handleLoadQuarter: any
  handleAutoGenerate: any
  handleSaveMinutes: any
  handleEndGame: any
  saveMatchReport: any
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
    <main style={{ minHeight: "100vh", padding: 16 }}>
      <div style={{ maxWidth: 980, margin: "0 auto", display: "grid", gap: 16 }}>
        <DashboardHeader isAdmin={isAdmin} onSignOut={signOut} />

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

        {tab === "events" && <EventsTabContent {...props} />}
        {tab === "coaches" && <CoachesTabContent {...props} />}
        {tab === "match" && <MatchTabContent {...props} />}

        {tab === "stats" && (
          <StatsTab
            teamName={props.normalizeTeamName(TEAM.name)}
            results={props.leagueResults}
            players={props.players}
            ratings={props.playerRatings}
            timeline={props.timeline}
          />
        )}
      </div>

      <BottomNav tab={props.tab} setTab={props.setTab} />

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
        onClose={() => {
          props.setShowEventForm(false)
          props.setEditingCalendarEventId(null)
        }}
      />

      <MatchEventModal
        open={props.showMatchEventModal}
        editingTimelineId={props.editingTimelineId}
        eventDraft={props.eventDraft}
        setEventDraft={props.setEventDraft}
        matchPlayers={props.matchPlayers}
        onSave={props.saveMatchEvent}
        onClose={() => {
          props.setShowMatchEventModal(false)
          props.setEditingTimelineId(null)
        }}
      />
    </main>
  )
}
