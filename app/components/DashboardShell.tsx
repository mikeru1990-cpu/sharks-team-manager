"use client"

import nextDynamic from "next/dynamic"
import RollingCalendar from "./RollingCalendar"
import PlayersManager from "./PlayersManager"
import QuarterPlanner from "./QuarterPlanner"
import MatchCenter from "./MatchCenter"
import CoachesManager from "./CoachesManager"
import TrainingPlansManager from "./TrainingPlansManager"
import SessionTimer from "./SessionTimer"
import SessionHistory from "./SessionHistory"
import MatchRatingsManager from "./MatchRatingsManager"
import MatchReportGenerator from "./MatchReportGenerator"
import HomeTab from "./tabs/HomeTab"
import {
  TEAM,
  buttonPrimary,
  buttonSecondary,
  cardStyle,
  type AttendanceStatus,
  type Coach,
  type CoachAvailability,
  type CoachAvailabilityStatus,
  type EventAttendance,
  type EventItem,
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

const StatsTab = nextDynamic(() => import("./tabs/StatsTab"))

type PeriodMode = "quarters" | "halves"

type EventWithPlan = EventItem & {
  trainingPlanId?: string
  trainingPlanName?: string
}

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
  setEventDraft: (
    updater:
      | MatchEventDraft
      | ((prev: MatchEventDraft) => MatchEventDraft)
  ) => void

  quarterPlans: Record<number, QuarterPlan>
  quarterWarnings: string[]
  activeDragPlayerId: string | null
  setActiveDragPlayerId: (value: string | null) => void

  allTrainingPlans: TrainingTemplate[]
  selectedTemplateId: string
  setSelectedTemplateId: (value: string) => void
  trainingPlan: {
    title: string
    warmUp: string
    drill1: string
    drill2: string
    game: string
    notes: string
  }
  setTrainingPlan: (value: {
    title: string
    warmUp: string
    drill1: string
    drill2: string
    game: string
    notes: string
  }) => void

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

  addEvent: () => Promise<void>
  openAddCalendarEvent: () => void
  openEditCalendarEvent: (event: EventWithPlan) => void
  deleteCalendarEvent: (id: string) => Promise<void>

  handleChangeFormation: (nextFormat: MatchFormat, nextFormation: string) => Promise<void>
  handleSaveLineup: () => Promise<void>
  handleLoadSavedLineup: (id: string) => Promise<void>
  handleDeleteSavedLineup: (id: string) => Promise<void>

  handleDragStart: (event: DragStartEvent) => void
  handleDragEnd: (event: DragEndEvent) => void

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
  const {
    isAdmin,
    signOut,
    loading,
    tab,
    setTab,
    matchTab,
    setMatchTab,
    players,
    coaches,
    coachAvailability,
    events,
    attendance,
    leagueResults,
    playerRatings,
    selectedDate,
    setSelectedDate,
    showEventForm,
    setShowEventForm,
    editingCalendarEventId,
    setEditingCalendarEventId,
    selectedEventId,
    setSelectedEventId,
    activeMatchEventId,
    setActiveMatchEventId,
    eventTitle,
    setEventTitle,
    eventType,
    setEventType,
    eventStartTime,
    setEventStartTime,
    eventLocation,
    setEventLocation,
    eventOpponent,
    setEventOpponent,
    eventNotes,
    setEventNotes,
    selectedDbTrainingPlanId,
    setSelectedDbTrainingPlanId,
    homeTeam,
    setHomeTeamState,
    awayTeam,
    setAwayTeamState,
    homeScore,
    setHomeScoreState,
    awayScore,
    setAwayScoreState,
    matchFormat,
    formation,
    currentQuarter,
    setCurrentQuarterState,
    periodMode,
    setPeriodModeState,
    periodLength,
    setPeriodLengthState,
    setSeconds,
    setRunning,
    setLiveSecondsMap,
    liveSecondsMap,
    lineupMap,
    benchIds,
    savedLineups,
    lineupName,
    setLineupName,
    timeline,
    editingTimelineId,
    setEditingTimelineId,
    showMatchEventModal,
    setShowMatchEventModal,
    eventDraft,
    setEventDraft,
    quarterPlans,
    quarterWarnings,
    activeDragPlayerId,
    setActiveDragPlayerId,
    allTrainingPlans,
    selectedTemplateId,
    setSelectedTemplateId,
    trainingPlan,
    setTrainingPlan,
    activeSession,
    setActiveSession,
    sessionHistory,
    currentSlots,
    selectedDateEvents,
    selectedEvent,
    activeMatchEvent,
    matchPlayers,
    maybePlayers,
    unavailablePlayers,
    noAvailableKeeper,
    selectedDateCoachAvailability,
    matchDateForCoachView,
    availableCoaches,
    unavailableCoachesList,
    holidayCoachesList,
    headCoachAvailable,
    noAvailableCoaches,
    playerOfMatchMap,
    activeTopPerformers,
    activeGoalsSummary,
    latestActiveMatchReport,
    totalGoals,
    mainGk,
    backupGk,
    availableCount,
    maybeCount,
    unavailableCount,
    formatFullDate,
    statusStyle,
    normalizeTeamName,
    countAttendance,
    getPlayerStatus,
    loadTrainingPlanFromEvent,
    persistSettings,
    persistMatchState,
    savePlayers,
    saveCoaches,
    saveCoachAvailability,
    saveTrainingPlans,
    saveSessionRecord,
    savePlayerRating,
    addEvent,
    openAddCalendarEvent,
    openEditCalendarEvent,
    deleteCalendarEvent,
    handleChangeFormation,
    handleSaveLineup,
    handleLoadSavedLineup,
    handleDeleteSavedLineup,
    handleDragStart,
    handleDragEnd,
    openCreateEvent,
    openEditEvent,
    handleDeleteTimelineItem,
    saveMatchEvent,
    handleSaveCurrentQuarter,
    handleLoadQuarter,
    handleAutoGenerate,
    handleSaveMinutes,
    handleEndGame,
    saveMatchReport,
    matchReports,
  } = props

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div style={{ ...cardStyle(), maxWidth: 840, margin: "0 auto" }}>Loading club data...</div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        color: "#0f172a",
        paddingBottom: 170,
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          margin: "0 auto",
          display: "grid",
          gap: 16,
          boxSizing: "border-box",
          minWidth: 0,
          overflowX: "clip",
        }}
      >
        <div
          style={{
            ...cardStyle(`linear-gradient(135deg, ${TEAM.primary} 0%, #0c235f 100%)`),
            color: "white",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) auto",
              gap: 12,
              alignItems: "start",
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.8 }}>CLUB HUB</div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  marginTop: 8,
                  lineHeight: 1.1,
                  overflowWrap: "anywhere",
                }}
              >
                {TEAM.name}
              </div>
              <div
                style={{
                  marginTop: 6,
                  opacity: 0.9,
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
              >
                Supabase sync, login, admin mode, weekday calendar and better screen fit.
              </div>
            </div>

            <div style={{ textAlign: "right", minWidth: 110 }}>
              <div style={{ fontSize: 13, opacity: 0.8 }}>{isAdmin ? "ADMIN" : "VIEWER"}</div>
              <button onClick={() => void signOut()} style={{ ...buttonSecondary(), marginTop: 10 }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 16,
            width: "calc(100% - 32px)",
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(12px)",
            border: "1px solid #dbe3ef",
            borderRadius: 28,
            padding: 10,
            display: "grid",
            gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
            gap: 8,
            boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
            zIndex: 50,
            maxWidth: 980,
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {[
            ["home", "Home", "⌂"],
            ["players", "Players", "👥"],
            ["events", "Events", "📅"],
            ["coaches", "Coaches", "🧑‍🏫"],
            ["match", "Match", "⚽"],
            ["stats", "Stats", "📊"],
          ].map(([value, label, icon]) => (
            <button
              key={value}
              onClick={() => setTab(value as MainTab)}
              style={{
                border: "none",
                borderRadius: 18,
                padding: "12px 8px",
                background: tab === value ? TEAM.primary : "transparent",
                color: tab === value ? "white" : "#475569",
                fontWeight: 800,
                fontSize: 13,
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div>{label}</div>
            </button>
          ))}
        </div>

        {tab === "home" && (
          <HomeTab
            teamName={TEAM.name}
            players={players}
            events={events}
            attendance={attendance}
            results={leagueResults}
            ratings={playerRatings}
            activeMatchEventId={activeMatchEventId}
            selectedDate={selectedDate}
            onOpenTab={(nextTab) => setTab(nextTab)}
          />
        )}

        {tab === "players" && (
          <PlayersManager players={players} isAdmin={isAdmin} onSavePlayers={savePlayers} />
        )}

        {tab === "events" && (
          <div style={{ display: "grid", gap: 16 }}>
            <RollingCalendar
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date)
                void persistSettings({ selectedDate: date })
              }}
              events={events}
            />

            <div style={cardStyle()}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                  marginBottom: 12,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 900 }}>Calendar Events</div>
                {isAdmin ? (
                  <button onClick={openAddCalendarEvent} style={buttonPrimary()}>
                    Add Event
                  </button>
                ) : null}
              </div>

              {selectedDateEvents.length === 0 ? (
                <div style={{ color: "#64748b" }}>No calendar events on this day.</div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {selectedDateEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedEventId(event.id)
                        if (event.type === "training") loadTrainingPlanFromEvent(event)
                      }}
                      style={{
                        padding: 12,
                        borderRadius: 16,
                        border:
                          selectedEventId === event.id ? `2px solid ${TEAM.primary}` : "1px solid #e2e8f0",
                        background: "#f8fafc",
                        textAlign: "left",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>{event.title}</div>
                      <div style={{ color: "#64748b", marginTop: 4 }}>
                        {event.type}
                        {event.startTime ? ` • ${event.startTime}` : ""}
                        {event.location ? ` • ${event.location}` : ""}
                      </div>
                      {event.trainingPlanName ? (
                        <div style={{ marginTop: 6, fontSize: 12, color: "#475569" }}>
                          Training plan: {event.trainingPlanName}
                        </div>
                      ) : null}
                      <div style={{ marginTop: 8, fontSize: 12, color: "#475569" }}>
                        Avail {countAttendance(event.id, "available")} • Maybe {countAttendance(event.id, "maybe")} •{" "}
                        Unavail {countAttendance(event.id, "unavailable")}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedEvent ? (
              <div style={cardStyle()}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 900 }}>{formatFullDate(selectedEvent.date)}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>{selectedEvent.title}</div>
                    <div style={{ color: "#64748b", marginTop: 6 }}>
                      {selectedEvent.type}
                      {selectedEvent.startTime ? ` • ${selectedEvent.startTime}` : ""}
                      {selectedEvent.location ? ` • ${selectedEvent.location}` : ""}
                    </div>
                    {selectedEvent.trainingPlanName ? (
                      <div style={{ color: "#475569", marginTop: 8 }}>
                        Training plan: <strong>{selectedEvent.trainingPlanName}</strong>
                      </div>
                    ) : null}
                    {selectedEvent.opponent ? (
                      <div style={{ color: "#64748b", marginTop: 6 }}>Opponent: {selectedEvent.opponent}</div>
                    ) : null}
                    {selectedEvent.notes ? (
                      <div style={{ color: "#475569", marginTop: 8 }}>{selectedEvent.notes}</div>
                    ) : null}
                  </div>

                  {isAdmin ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {selectedEvent.type === "match" ? (
                        <button
                          onClick={() => {
                            setActiveMatchEventId(selectedEvent.id)
                            void persistSettings({ activeMatchEventId: selectedEvent.id })
                          }}
                          style={activeMatchEventId === selectedEvent.id ? buttonPrimary() : buttonSecondary()}
                        >
                          {activeMatchEventId === selectedEvent.id ? "Active Match Day" : "Use for Match Day"}
                        </button>
                      ) : null}

                      <button onClick={() => openEditCalendarEvent(selectedEvent)} style={buttonSecondary()}>
                        Edit
                      </button>
                      <button onClick={() => void deleteCalendarEvent(selectedEvent.id)} style={buttonSecondary()}>
                        Delete
                      </button>
                    </div>
                  ) : null}
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  <div style={{ ...statusStyle("available"), padding: "8px 12px", borderRadius: 999, fontWeight: 800 }}>
                    Available {availableCount}
                  </div>
                  <div style={{ ...statusStyle("maybe"), padding: "8px 12px", borderRadius: 999, fontWeight: 800 }}>
                    Maybe {maybeCount}
                  </div>
                  <div
                    style={{ ...statusStyle("unavailable"), padding: "8px 12px", borderRadius: 999, fontWeight: 800 }}
                  >
                    Unavailable {unavailableCount}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {players.map((player) => {
                    const currentStatus = getPlayerStatus(selectedEvent.id, player.id)

                    return (
                      <div
                        key={player.id}
                        style={{
                          padding: 12,
                          borderRadius: 16,
                          border: "1px solid #e2e8f0",
                          background: "#f8fafc",
                        }}
                      >
                        <div style={{ fontWeight: 900, marginBottom: 8 }}>{player.name}</div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {(["available", "maybe", "unavailable"] as AttendanceStatus[]).map((status) => {
                            const active = currentStatus === status

                            return (
                              <button
                                key={status}
                                onClick={() => void saveAttendance(selectedEvent.id, player.id, status)}
                                style={{
                                  padding: "10px 12px",
                                  borderRadius: 999,
                                  fontWeight: 800,
                                  ...(active
                                    ? statusStyle(status)
                                    : {
                                        border: "1px solid #cbd5e1",
                                        background: "white",
                                        color: "#334155",
                                      }),
                                }}
                              >
                                {status}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <div style={cardStyle()}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Training Templates</div>
              <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                {allTrainingPlans.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setSelectedTemplateId(template.id)
                      setTrainingPlan({
                        title: template.name,
                        warmUp: template.warmUp,
                        drill1: template.drill1,
                        drill2: template.drill2,
                        game: template.game,
                        notes: template.notes,
                      })
                    }}
                    style={{
                      textAlign: "left",
                      padding: 14,
                      borderRadius: 16,
                      border: selectedTemplateId === template.id ? `2px solid ${TEAM.primary}` : "1px solid #dbe3ef",
                      background: selectedTemplateId === template.id ? "#dbeafe" : "#f8fafc",
                      width: "100%",
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{template.name}</div>
                    <div
                      style={{
                        color: "#64748b",
                        marginTop: 4,
                        overflowWrap: "anywhere",
                        wordBreak: "break-word",
                      }}
                    >
                      {template.notes}
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Training Plan</div>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  ["Session Title", trainingPlan.title],
                  ["Warm Up", trainingPlan.warmUp],
                  ["Drill 1", trainingPlan.drill1],
                  ["Drill 2", trainingPlan.drill2],
                  ["Game", trainingPlan.game],
                  ["Coach Notes", trainingPlan.notes],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>{label}</div>
                    <div style={{ color: "#475569", overflowWrap: "anywhere" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={cardStyle()}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 10,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 900 }}>Live Session Builder</div>
                <button
                  onClick={() => {
                    const template = allTrainingPlans.find((plan) => plan.id === selectedTemplateId)
                    if (!template) return
                    setActiveSession(buildSessionFromTemplate(template))
                  }}
                  style={buttonPrimary()}
                >
                  Generate Session
                </button>
              </div>
            </div>

            <SessionTimer session={activeSession} onSaveSession={saveSessionRecord} />

            <TrainingPlansManager
              isAdmin={isAdmin}
              trainingPlans={allTrainingPlans}
              onSaveTrainingPlans={saveTrainingPlans}
              onUsePlan={(plan) => {
                setSelectedTemplateId(plan.id)
                setTrainingPlan({
                  title: plan.name,
                  warmUp: plan.warmUp,
                  drill1: plan.drill1,
                  drill2: plan.drill2,
                  game: plan.game,
                  notes: plan.notes,
                })
                setSelectedDbTrainingPlanId(plan.id)
              }}
            />

            <SessionHistory sessions={sessionHistory} />
          </div>
        )}

        {tab === "coaches" && (
          <div style={{ display: "grid", gap: 16 }}>
            {selectedDateCoachAvailability.length > 0 ? (
              <div style={cardStyle("#eff6ff")}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
                  Coach Availability Snapshot
                </div>
                <div style={{ color: "#475569", marginBottom: 10 }}>{formatFullDate(selectedDate)}</div>
                <div style={{ display: "grid", gap: 8 }}>
                  {selectedDateCoachAvailability.map((item) => {
                    const coach = coaches.find((c) => c.id === item.coachId)
                    return (
                      <div
                        key={item.id}
                        style={{
                          padding: 12,
                          borderRadius: 14,
                          background: "white",
                          border: "1px solid #dbe3ef",
                        }}
                      >
                        <div style={{ fontWeight: 900 }}>{coach?.name || "Unknown coach"}</div>
                        <div style={{ color: "#475569", marginTop: 4 }}>
                          {coach?.role || "No role"} • {item.status}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : null}

            <CoachesManager
              isAdmin={isAdmin}
              selectedDate={selectedDate}
              coaches={coaches}
              coachAvailability={coachAvailability}
              onSaveCoaches={saveCoaches}
              onSaveCoachAvailability={saveCoachAvailability}
            />
          </div>
        )}

        {tab === "match" && (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={cardStyle()}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Selected Match Event</div>

              {events.filter((event) => event.type === "match").length === 0 ? (
                <div style={{ color: "#64748b" }}>No match events created yet.</div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <select
                    value={activeMatchEventId || ""}
                    onChange={(e) => {
                      const value = e.target.value || null
                      setActiveMatchEventId(value)
                      void persistSettings({ activeMatchEventId: value })
                    }}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      border: "1px solid #cbd5e1",
                      fontSize: 16,
                      width: "100%",
                    }}
                  >
                    <option value="">Choose match event</option>
                    {events
                      .filter((event) => event.type === "match")
                      .slice()
                      .sort((a, b) => {
                        const dateCompare = a.date.localeCompare(b.date)
                        if (dateCompare !== 0) return dateCompare
                        const timeCompare = (a.startTime || "").localeCompare(b.startTime || "")
                        if (timeCompare !== 0) return timeCompare
                        return a.title.localeCompare(b.title)
                      })
                      .map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.date} • {event.startTime || "00:00"} • {event.title}
                        </option>
                      ))}
                  </select>

                  {activeMatchEvent ? (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        color: "#475569",
                      }}
                    >
                      Using: <strong>{activeMatchEvent.title}</strong>
                      {activeMatchEvent.startTime ? ` • ${activeMatchEvent.startTime}` : ""}
                      {activeMatchEvent.opponent ? ` • vs ${activeMatchEvent.opponent}` : ""}
                    </div>
                  ) : (
                    <div style={{ color: "#64748b" }}>Choose which match event this screen is tracking.</div>
                  )}
                </div>
              )}
            </div>

            <div style={cardStyle()}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Match Day Availability</div>

              {activeMatchEvent ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ fontWeight: 800 }}>
                    Active event: {activeMatchEvent.title} ({activeMatchEvent.date})
                  </div>

                  <div style={{ color: "#475569" }}>
                    Available: {matchPlayers.length}
                    {maybePlayers.length ? ` • Maybe: ${maybePlayers.length}` : ""}
                    {unavailablePlayers.length ? ` • Unavailable: ${unavailablePlayers.length}` : ""}
                  </div>

                  {noAvailableKeeper ? (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: "#fee2e2",
                        border: "1px solid #fecaca",
                        color: "#991b1b",
                        fontWeight: 800,
                      }}
                    >
                      Warning: no available goalkeeper is marked for this match.
                    </div>
                  ) : null}

                  {unavailablePlayers.length > 0 ? (
                    <div
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        color: "#475569",
                      }}
                    >
                      Unavailable players: {unavailablePlayers.map((p) => p.name).join(", ")}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div style={{ color: "#64748b" }}>No active match event selected.</div>
              )}
            </div>

            <div style={cardStyle("#eff6ff")}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>Coaches for Match Day</div>

              <div style={{ color: "#475569", marginBottom: 10 }}>
                Showing coach availability for <strong>{formatFullDate(matchDateForCoachView)}</strong>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "#dcfce7",
                    border: "1px solid #86efac",
                    color: "#166534",
                    fontWeight: 800,
                  }}
                >
                  Available {availableCoaches.length}
                </div>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "#fee2e2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    fontWeight: 800,
                  }}
                >
                  Unavailable {unavailableCoachesList.length}
                </div>
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: "#fef3c7",
                    border: "1px solid #fcd34d",
                    color: "#92400e",
                    fontWeight: 800,
                  }}
                >
                  Holiday {holidayCoachesList.length}
                </div>
              </div>

              {noAvailableCoaches ? (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "#fee2e2",
                    border: "1px solid #fecaca",
                    color: "#991b1b",
                    fontWeight: 800,
                    marginBottom: 10,
                  }}
                >
                  Warning: no coaches are available for this day.
                </div>
              ) : null}

              {!headCoachAvailable ? (
                <div
                  style={{
                    padding: 12,
                    borderRadius: 12,
                    background: "#fff7ed",
                    border: "1px solid #fdba74",
                    color: "#9a3412",
                    fontWeight: 800,
                    marginBottom: 10,
                  }}
                >
                  Warning: no Head Coach is marked as available.
                </div>
              ) : null}
            </div>

            <MatchCenter
              isAdmin={isAdmin}
              matchTab={matchTab}
              setMatchTab={setMatchTab}
              matchFormat={matchFormat}
              formation={formation}
              currentSlots={currentSlots}
              players={matchPlayers}
              lineupMap={lineupMap}
              benchIds={benchIds}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              homeScore={homeScore}
              awayScore={awayScore}
              seconds={props.seconds}
              running={props.running}
              liveSecondsMap={liveSecondsMap}
              timeline={timeline}
              savedLineups={savedLineups}
              lineupName={lineupName}
              setLineupName={setLineupName}
              activeDragPlayerId={activeDragPlayerId}
              setActiveDragPlayerId={setActiveDragPlayerId}
              setHomeTeam={async (value) => {
                setHomeTeamState(value)
                await persistMatchState({ homeTeam: value })
              }}
              setAwayTeam={async (value) => {
                setAwayTeamState(value)
                await persistMatchState({ awayTeam: value })
              }}
              setHomeScore={async (value) => {
                setHomeScoreState(value)
                await persistMatchState({ homeScore: value })
              }}
              setAwayScore={async (value) => {
                setAwayScoreState(value)
                await persistMatchState({ awayScore: value })
              }}
              setRunning={(value) => {
                setRunning(value)
                void persistMatchState({ running: value })
              }}
              resetClock={() => {
                setRunning(false)
                setSeconds(0)
                setLiveSecondsMap({})
                void persistMatchState({
                  running: false,
                  seconds: 0,
                  liveSecondsMap: {},
                })
              }}
              saveMinutes={handleSaveMinutes}
              onChangeFormation={handleChangeFormation}
              onSaveLineup={handleSaveLineup}
              onLoadSavedLineup={handleLoadSavedLineup}
              onDeleteSavedLineup={handleDeleteSavedLineup}
              onDragStartExternal={handleDragStart}
              onDragEndExternal={handleDragEnd}
              onOpenCreateEvent={openCreateEvent}
              onOpenEditEvent={openEditEvent}
              onDeleteTimelineItem={handleDeleteTimelineItem}
              onEndGame={handleEndGame}
              periodMode={periodMode}
              periodLength={periodLength}
              currentPeriod={currentQuarter}
              setCurrentPeriod={(value) => {
                setCurrentQuarterState(value)
                void persistMatchState({ currentPeriod: value })
              }}
              setPeriodMode={async (value) => {
                setPeriodModeState(value)
                setCurrentQuarterState(1)
                await persistMatchState({ periodMode: value, currentPeriod: 1 })
              }}
              setPeriodLength={async (value) => {
                const nextValue = Math.max(1, value || 1)
                setPeriodLengthState(nextValue)
                await persistMatchState({ periodLength: nextValue })
              }}
              trackingTitle={
                activeMatchEvent
                  ? `${activeMatchEvent.title}${activeMatchEvent.startTime ? ` • ${activeMatchEvent.startTime}` : ""}`
                  : ""
              }
            />

            {matchTab === "quarters" ? (
              <QuarterPlanner
                isAdmin={isAdmin}
                currentQuarter={currentQuarter}
                setCurrentQuarter={(q) => {
                  setCurrentQuarterState(q)
                  void persistMatchState({ currentPeriod: q })
                }}
                quarterPlans={quarterPlans}
                quarterWarnings={quarterWarnings}
                currentSlots={currentSlots}
                players={matchPlayers}
                lineupMap={lineupMap}
                benchIds={benchIds}
                onSaveCurrentQuarter={handleSaveCurrentQuarter}
                onLoadQuarter={handleLoadQuarter}
                onAutoGenerate={handleAutoGenerate}
                periodMode={periodMode}
                periodLength={periodLength}
              />
            ) : null}

            <MatchRatingsManager
              isAdmin={isAdmin}
              players={matchPlayers}
              activeEventId={activeMatchEventId}
              ratings={playerRatings}
              onSaveRating={savePlayerRating}
            />

            {activeMatchEventId && playerOfMatchMap[activeMatchEventId] ? (
              <div style={cardStyle("#fef3c7")}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
                  Auto Player of the Match
                </div>
                <div style={{ color: "#92400e", fontWeight: 800 }}>
                  {players.find((p) => p.id === playerOfMatchMap[activeMatchEventId])?.name || "Unknown player"}
                </div>
              </div>
            ) : null}

            {activeMatchEvent ? (
              <MatchReportGenerator
                isAdmin={isAdmin}
                activeMatchTitle={activeMatchEvent.title}
                activeMatchDate={activeMatchEvent.date}
                opponent={activeMatchEvent.opponent || awayTeam}
                scoreLine={`${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`}
                playerOfTheMatch={
                  players.find((p) => p.id === playerOfMatchMap[activeMatchEvent.id])?.name || ""
                }
                topPerformers={activeTopPerformers}
                goalsSummary={activeGoalsSummary}
                onSaveReport={saveMatchReport}
                latestReport={latestActiveMatchReport}
              />
            ) : null}
          </div>
        )}

        {tab === "stats" && (
          <StatsTab
            teamName={normalizeTeamName(TEAM.name)}
            results={leagueResults}
            players={players}
            ratings={playerRatings}
            timeline={timeline}
          />
        )}
      </div>

      {showEventForm ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div style={{ ...cardStyle(), width: "100%", maxWidth: 460 }}>
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>
              {editingCalendarEventId ? "Edit Calendar Event" : "Add Calendar Event"}
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title"
                style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
              />

              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as "training" | "match" | "other")}
                style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
              >
                <option value="training">Training</option>
                <option value="match">Match</option>
                <option value="other">Other</option>
              </select>

              {eventType === "training" ? (
                <select
                  value={selectedDbTrainingPlanId}
                  onChange={(e) => setSelectedDbTrainingPlanId(e.target.value)}
                  style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
                >
                  <option value="">No linked training plan</option>
                  {allTrainingPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              ) : null}

              <input
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.target.value)}
                placeholder="Start time e.g. 18:00"
                style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
              />

              <input
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Location"
                style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
              />

              <input
                value={eventOpponent}
                onChange={(e) => setEventOpponent(e.target.value)}
                placeholder="Opponent"
                style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
              />

              <textarea
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                placeholder="Notes"
                style={{
                  minHeight: 90,
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  fontSize: 16,
                  resize: "vertical",
                }}
              />

              <div
                style={{
                  padding: 12,
                  borderRadius: 12,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                }}
              >
                Date: <strong>{selectedDate}</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => void addEvent()} style={{ ...buttonPrimary(), flex: 1 }}>
                Save
              </button>
              <button
                onClick={() => {
                  setShowEventForm(false)
                  setEditingCalendarEventId(null)
                  setEventTitle("")
                  setEventType("training")
                  setEventStartTime("")
                  setEventLocation("")
                  setEventOpponent("")
                  setEventNotes("")
                  setSelectedDbTrainingPlanId("")
                }}
                style={{ ...buttonSecondary(), flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showMatchEventModal ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div style={{ ...cardStyle(), width: "100%", maxWidth: 520 }}>
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>
              {editingTimelineId ? "Edit Match Event" : "Add Match Event"}
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <select
                value={eventDraft.type}
                onChange={(e) =>
                  setEventDraft({
                    type: e.target.value as "goal" | "assist" | "sub" | "injury" | "note",
                    playerId: "",
                    secondPlayerId: "",
                    note: "",
                  })
                }
                style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
              >
                <option value="goal">Goal</option>
                <option value="assist">Assist</option>
                <option value="sub">Sub</option>
                <option value="injury">Injury</option>
                <option value="note">Note</option>
              </select>

              {eventDraft.type !== "note" ? (
                <select
                  value={eventDraft.playerId}
                  onChange={(e) => setEventDraft((prev) => ({ ...prev, playerId: e.target.value }))}
                  style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
                >
                  <option value="">Choose player</option>
                  {matchPlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              ) : null}

              {eventDraft.type === "goal" || eventDraft.type === "sub" ? (
                <select
                  value={eventDraft.secondPlayerId}
                  onChange={(e) => setEventDraft((prev) => ({ ...prev, secondPlayerId: e.target.value }))}
                  style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
                >
                  <option value="">
                    {eventDraft.type === "goal" ? "Optional assist" : "Choose second player"}
                  </option>
                  {matchPlayers
                    .filter((player) => player.id !== eventDraft.playerId)
                    .map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                </select>
              ) : null}

              {eventDraft.type === "note" ? (
                <textarea
                  value={eventDraft.note}
                  onChange={(e) => setEventDraft((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Coach note"
                  style={{
                    minHeight: 100,
                    padding: 14,
                    borderRadius: 14,
                    border: "1px solid #cbd5e1",
                    fontSize: 16,
                    resize: "vertical",
                  }}
                />
              ) : null}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={() => void saveMatchEvent()} style={{ ...buttonPrimary(), flex: 1 }}>
                Save Event
              </button>
              <button
                onClick={() => {
                  setShowMatchEventModal(false)
                  setEditingTimelineId(null)
                }}
                style={{ ...buttonSecondary(), flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
