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
  cardStyle,
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

  totalGoals: number
  mainGk?: Player
  backupGk?: Player
  availableCount: number
  maybeCount: number
  unavailableCount: number

  formatFullDate: (date: string) => string
  statusStyle: (status: AttendanceStatus) => {
    border: string
    background: string
    color: string
  }
  normalizeTeamName: (name: string) => string

  countAttendance: (eventId: string, status: AttendanceStatus) => number
  getPlayerStatus: (eventId: string, playerId: string) => AttendanceStatus | null
  loadTrainingPlanFromEvent: (event: EventWithPlan) => void

  persistSettings: (patch?: Partial<{ selectedDate: string; activeMatchEventId: string | null }>) => Promise<void>
  persistMatchState: (
    patch?: Partial<{
      homeTeam: string
      awayTeam: string
      homeScore: number
      awayScore: number
      matchFormat: MatchFormat
      formation: string
      currentPeriod: number
      periodMode: PeriodMode
      periodLength: number
      seconds: number
      running: boolean
      liveSecondsMap: Record<string, number>
      lineupMap: Record<string, string | null>
      benchIds: string[]
    }>
  ) => Promise<void>

  savePlayers: (nextPlayers: Player[]) => Promise<void>
  saveCoaches: (nextCoaches: Coach[]) => Promise<void>
  saveCoachAvailability: (
    coachId: string,
    day: string,
    status: CoachAvailabilityStatus,
    notes?: string
  ) => Promise<void>
  saveTrainingPlans: (nextPlans: TrainingTemplate[]) => Promise<void>
  saveSessionRecord: (record: TrainingSessionRecord) => Promise<void>
  savePlayerRating: (playerId: string, rating: number, notes: string) => Promise<void>
  saveAttendance: (eventId: string, playerId: string, status: AttendanceStatus) => Promise<void>

  addEvent: () => Promise<void>
  openAddCalendarEvent: () => void
  openEditCalendarEvent: (event: EventWithPlan) => void
  deleteCalendarEvent: (id: string) => Promise<void>

  handleChangeFormation: (nextFormat: MatchFormat, nextFormation: string) => Promise<void>
  handleSaveLineup: () => Promise<void>
  handleLoadSavedLineup: (id: string) => Promise<void>
  handleDeleteSavedLineup: (id: string) => Promise<void>

  handleDragStart: (event: any) => void
  handleDragEnd: (event: any) => void

  openCreateEvent: () => void
  openEditEvent: (item: TimelineItem) => void
  handleDeleteTimelineItem: (id: string) => Promise<void>
  saveMatchEvent: () => Promise<void>

  handleSaveCurrentQuarter: () => Promise<void>
  handleLoadQuarter: (quarter: number) => void
  handleAutoGenerate: () => Promise<void>
  handleSaveMinutes: () => Promise<void>
  handleEndGame: () => Promise<void>
  saveMatchReport: (coachNotes: string) => Promise<void>
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
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        paddingBottom: 170,
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gap: 16,
          minWidth: 0,
        }}
      >
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
            allTrainingPlans={props.allTrainingPlans}
            selectedTemplateId={props.selectedTemplateId}
            setSelectedTemplateId={props.setSelectedTemplateId}
            trainingPlan={props.trainingPlan}
            setTrainingPlan={props.setTrainingPlan}
            selectedDbTrainingPlanId={props.selectedDbTrainingPlanId}
            setSelectedDbTrainingPlanId={props.setSelectedDbTrainingPlanId}
            activeSession={props.activeSession}
            setActiveSession={props.setActiveSession}
            sessionHistory={props.sessionHistory}
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
            selectedDateCoachAvailability={props.selectedDateCoachAvailability}
            formatFullDate={props.formatFullDate}
            saveCoaches={props.saveCoaches}
            saveCoachAvailability={props.saveCoachAvailability}
          />
        )}

        {tab === "match" && (
          <MatchTabContent
            isAdmin={props.isAdmin}
            matchTab={props.matchTab}
            setMatchTab={props.setMatchTab}
            events={props.events}
            activeMatchEventId={props.activeMatchEventId}
            setActiveMatchEventId={props.setActiveMatchEventId}
            activeMatchEvent={props.activeMatchEvent}
            matchPlayers={props.matchPlayers}
            maybePlayers={props.maybePlayers}
            unavailablePlayers={props.unavailablePlayers}
            noAvailableKeeper={props.noAvailableKeeper}
            formatFullDate={props.formatFullDate}
            persistSettings={props.persistSettings}
            availableCoaches={props.availableCoaches}
            unavailableCoachesList={props.unavailableCoachesList}
            holidayCoachesList={props.holidayCoachesList}
            headCoachAvailable={props.headCoachAvailable}
            noAvailableCoaches={props.noAvailableCoaches}
            matchDateForCoachView={props.matchDateForCoachView}
            matchFormat={props.matchFormat}
            formation={props.formation}
            currentSlots={props.currentSlots}
            lineupMap={props.lineupMap}
            benchIds={props.benchIds}
            homeTeam={props.homeTeam}
            awayTeam={props.awayTeam}
            homeScore={props.homeScore}
            awayScore={props.awayScore}
            seconds={props.seconds}
            running={props.running}
            liveSecondsMap={props.liveSecondsMap}
            timeline={props.timeline}
            savedLineups={props.savedLineups}
            lineupName={props.lineupName}
            setLineupName={props.setLineupName}
            activeDragPlayerId={props.activeDragPlayerId}
            setActiveDragPlayerId={props.setActiveDragPlayerId}
            setHomeTeamState={props.setHomeTeamState}
            setAwayTeamState={props.setAwayTeamState}
            setHomeScoreState={props.setHomeScoreState}
            setAwayScoreState={props.setAwayScoreState}
            setRunning={props.setRunning}
            setSeconds={props.setSeconds}
            setLiveSecondsMap={props.setLiveSecondsMap}
            persistMatchState={props.persistMatchState}
            handleSaveMinutes={props.handleSaveMinutes}
            handleChangeFormation={props.handleChangeFormation}
            handleSaveLineup={props.handleSaveLineup}
            handleLoadSavedLineup={props.handleLoadSavedLineup}
            handleDeleteSavedLineup={props.handleDeleteSavedLineup}
            handleDragStart={props.handleDragStart}
            handleDragEnd={props.handleDragEnd}
            openCreateEvent={props.openCreateEvent}
            openEditEvent={props.openEditEvent}
            handleDeleteTimelineItem={props.handleDeleteTimelineItem}
            handleEndGame={props.handleEndGame}
            periodMode={props.periodMode}
            periodLength={props.periodLength}
            currentQuarter={props.currentQuarter}
            setCurrentQuarterState={props.setCurrentQuarterState}
            setPeriodModeState={props.setPeriodModeState}
            setPeriodLengthState={props.setPeriodLengthState}
            quarterPlans={props.quarterPlans}
            quarterWarnings={props.quarterWarnings}
            handleSaveCurrentQuarter={props.handleSaveCurrentQuarter}
            handleLoadQuarter={props.handleLoadQuarter}
            handleAutoGenerate={props.handleAutoGenerate}
            playerRatings={props.playerRatings}
            savePlayerRating={props.savePlayerRating}
            playerOfMatchMap={props.playerOfMatchMap}
            players={props.players}
            activeTopPerformers={props.activeTopPerformers}
            activeGoalsSummary={props.activeGoalsSummary}
            latestActiveMatchReport={props.latestActiveMatchReport}
            saveMatchReport={props.saveMatchReport}
          />
        )}

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
          props.setEventTitle("")
          props.setEventType("training")
          props.setEventStartTime("")
          props.setEventLocation("")
          props.setEventOpponent("")
          props.setEventNotes("")
          props.setSelectedDbTrainingPlanId("")
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
