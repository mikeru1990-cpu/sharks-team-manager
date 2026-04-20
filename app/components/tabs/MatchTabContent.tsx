"use client"

import QuarterPlanner from "../QuarterPlanner"
import MatchCenter from "../MatchCenter"
import MatchReportGenerator from "../MatchReportGenerator"
import PlayerFeedbackCard from "../PlayerFeedbackCard"
import { PageCard, SectionHeader, Badge } from "../ui"
import type {
  Coach,
  MatchFormat,
  MatchReport,
  MatchTab,
  PitchSlot,
  Player,
  PlayerMatchRating,
  QuarterPlan,
  SavedLineup,
  TimelineItem,
} from "../../lib/types"
import type { EventWithPlan, PeriodMode } from "../../lib/dashboardTypes"

type OverallStatus = "developing" | "improving" | "strong"

type Props = {
  isAdmin: boolean
  matchTab: MatchTab
  setMatchTab: (tab: MatchTab) => void

  events: EventWithPlan[]
  activeMatchEventId: string | null
  setActiveMatchEventId: (value: string | null) => void
  activeMatchEvent: EventWithPlan | null

  matchPlayers: Player[]
  maybePlayers: Player[]
  unavailablePlayers: Player[]
  noAvailableKeeper: boolean

  formatFullDate: (date: string) => string
  persistSettings: (patch?: Partial<{ selectedDate: string; activeMatchEventId: string | null }>) => Promise<void>

  availableCoaches: Coach[]
  unavailableCoachesList: Coach[]
  holidayCoachesList: Coach[]
  headCoachAvailable: boolean
  noAvailableCoaches: boolean
  matchDateForCoachView: string

  matchFormat: MatchFormat
  formation: string
  currentSlots: PitchSlot[]
  lineupMap: Record<string, string | null>
  benchIds: string[]
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  seconds: number
  running: boolean
  liveSecondsMap: Record<string, number>
  timeline: TimelineItem[]
  savedLineups: SavedLineup[]
  lineupName: string
  setLineupName: (value: string) => void
  activeDragPlayerId: string | null
  setActiveDragPlayerId: (id: string | null) => void

  setHomeTeamState: (value: string) => void
  setAwayTeamState: (value: string) => void
  setHomeScoreState: (value: number) => void
  setAwayScoreState: (value: number) => void
  setRunning: (value: boolean) => void
  setSeconds: (value: number) => void
  setLiveSecondsMap: (value: Record<string, number>) => void

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

  handleSaveMinutes: () => Promise<void>
  handleChangeFormation: (nextFormat: MatchFormat, nextFormation: string) => Promise<void>
  handleSaveLineup: () => Promise<void>
  handleLoadSavedLineup: (id: string) => Promise<void>
  handleDeleteSavedLineup: (id: string) => Promise<void>
  handleDragStart: (event: any) => void
  handleDragEnd: (event: any) => void
  openCreateEvent: () => void
  openEditEvent: (item: TimelineItem) => void
  handleDeleteTimelineItem: (id: string) => Promise<void>
  handleEndGame: () => Promise<void>

  periodMode: PeriodMode
  periodLength: number
  currentQuarter: number
  setCurrentQuarterState: (value: number) => void
  setPeriodModeState: (value: PeriodMode) => void
  setPeriodLengthState: (value: number) => void

  quarterPlans: Record<number, QuarterPlan>
  quarterWarnings: string[]
  handleSaveCurrentQuarter: () => Promise<void>
  handleLoadQuarter: (quarter: number) => void
  handleAutoGenerate: () => Promise<void>

  playerRatings: PlayerMatchRating[]
  savePlayerRating: (playerId: string, rating: number, notes: string) => Promise<void>

  playerOfMatchMap: Record<string, string>
  players: Player[]
  activeTopPerformers: string[]
  activeGoalsSummary: string[]
  latestActiveMatchReport: MatchReport | null
  saveMatchReport: (coachNotes: string) => Promise<void>
}

function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string | number
  tone?: "default" | "success" | "warning" | "danger"
}) {
  const toneStyle =
    tone === "success"
      ? { background: "#dcfce7", border: "1px solid #86efac", color: "#166534" }
      : tone === "warning"
      ? { background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e" }
      : tone === "danger"
      ? { background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b" }
      : { background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155" }

  return (
    <div
      style={{
        ...toneStyle,
        padding: "12px 14px",
        borderRadius: 16,
        fontWeight: 800,
      }}
    >
      {label} {value}
    </div>
  )
}

function InfoBanner({
  tone,
  text,
}: {
  tone: "warning" | "danger"
  text: string
}) {
  const style =
    tone === "danger"
      ? { background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b" }
      : { background: "#fff7ed", border: "1px solid #fdba74", color: "#9a3412" }

  return (
    <div
      style={{
        ...style,
        padding: 12,
        borderRadius: 14,
        fontWeight: 800,
      }}
    >
      {text}
    </div>
  )
}

function mapRatingToOverall(rating?: number): OverallStatus | null {
  if (typeof rating !== "number") return null
  if (rating <= 5) return "developing"
  if (rating <= 7) return "improving"
  return "strong"
}

function mapOverallToRating(status: OverallStatus | null): number {
  if (status === "developing") return 4
  if (status === "improving") return 7
  return 9
}

function parseExistingFeedback(notes?: string) {
  const text = notes || ""

  const strengthMatch = text.match(/Strength:\s*(.*)/i)
  const focusMatch = text.match(/Focus:\s*(.*)/i)
  const coachNoteMatch = text.match(/Coach note:\s*([\s\S]*)/i)

  return {
    strengthArea: strengthMatch?.[1]?.trim() || "",
    focusArea: focusMatch?.[1]?.trim() || "",
    coachNote: coachNoteMatch?.[1]?.trim() || "",
  }
}

export default function MatchTabContent(props: Props) {
  const {
    isAdmin,
    matchTab,
    setMatchTab,
    events,
    activeMatchEventId,
    setActiveMatchEventId,
    activeMatchEvent,
    matchPlayers,
    maybePlayers,
    unavailablePlayers,
    noAvailableKeeper,
    formatFullDate,
    persistSettings,
    availableCoaches,
    unavailableCoachesList,
    holidayCoachesList,
    headCoachAvailable,
    noAvailableCoaches,
    matchDateForCoachView,
    matchFormat,
    formation,
    currentSlots,
    lineupMap,
    benchIds,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    seconds,
    running,
    liveSecondsMap,
    timeline,
    savedLineups,
    lineupName,
    setLineupName,
    activeDragPlayerId,
    setActiveDragPlayerId,
    setHomeTeamState,
    setAwayTeamState,
    setHomeScoreState,
    setAwayScoreState,
    setRunning,
    setSeconds,
    setLiveSecondsMap,
    persistMatchState,
    handleSaveMinutes,
    handleChangeFormation,
    handleSaveLineup,
    handleLoadSavedLineup,
    handleDeleteSavedLineup,
    handleDragStart,
    handleDragEnd,
    openCreateEvent,
    openEditEvent,
    handleDeleteTimelineItem,
    handleEndGame,
    periodMode,
    periodLength,
    currentQuarter,
    setCurrentQuarterState,
    setPeriodModeState,
    setPeriodLengthState,
    quarterPlans,
    quarterWarnings,
    handleSaveCurrentQuarter,
    handleLoadQuarter,
    handleAutoGenerate,
    playerRatings,
    savePlayerRating,
    playerOfMatchMap,
    players,
    activeTopPerformers,
    activeGoalsSummary,
    latestActiveMatchReport,
    saveMatchReport,
  } = props

  const matchEvents = events.filter((event) => event.type === "match")

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard>
        <SectionHeader
          title="Match Hub"
          subtitle="Choose a match, manage the day, and record feedback."
          action={activeMatchEvent ? <Badge tone="blue">Active Match</Badge> : undefined}
        />

        {matchEvents.length === 0 ? (
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
                background: "white",
              }}
            >
              <option value="">Choose match event</option>
              {matchEvents
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
                  padding: 14,
                  borderRadius: 16,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  gap: 6,
                }}
              >
                <div style={{ fontWeight: 900 }}>{activeMatchEvent.title}</div>
                <div style={{ color: "#475569" }}>
                  {formatFullDate(activeMatchEvent.date)}
                  {activeMatchEvent.startTime ? ` • ${activeMatchEvent.startTime}` : ""}
                </div>
                <div style={{ color: "#64748b" }}>
                  {activeMatchEvent.opponent ? `vs ${activeMatchEvent.opponent}` : "Opponent not set"}
                </div>
              </div>
            ) : (
              <div style={{ color: "#64748b" }}>Choose which match event this screen is tracking.</div>
            )}
          </div>
        )}
      </PageCard>

      {activeMatchEvent ? (
        <PageCard>
          <SectionHeader title="Matchday Snapshot" subtitle={`Overview for ${formatFullDate(matchDateForCoachView)}`} />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 10,
            }}
          >
            <StatPill label="Available" value={matchPlayers.length} tone="success" />
            <StatPill label="Maybe" value={maybePlayers.length} tone="warning" />
            <StatPill label="Unavailable" value={unavailablePlayers.length} tone="danger" />
            <StatPill label="Coaches" value={availableCoaches.length} />
          </div>

          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {noAvailableKeeper ? (
              <InfoBanner tone="danger" text="Warning: no available goalkeeper is marked for this match." />
            ) : null}
            {noAvailableCoaches ? (
              <InfoBanner tone="danger" text="Warning: no coaches are available for this day." />
            ) : null}
            {!headCoachAvailable ? (
              <InfoBanner tone="warning" text="Warning: no Head Coach is marked as available." />
            ) : null}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <StatPill label="Available coaches" value={availableCoaches.length} tone="success" />
            <StatPill label="Unavailable coaches" value={unavailableCoachesList.length} tone="danger" />
            <StatPill label="Holiday coaches" value={holidayCoachesList.length} tone="warning" />
          </div>
        </PageCard>
      ) : null}

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
        seconds={seconds}
        running={running}
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

      <PageCard>
        <SectionHeader title="Player Feedback" subtitle="Development-focused notes instead of match ratings." />

        {!activeMatchEvent ? (
          <div style={{ color: "#64748b" }}>Choose an active match event to record player feedback.</div>
        ) : matchPlayers.length === 0 ? (
          <div style={{ color: "#64748b" }}>No available players for the selected match.</div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {matchPlayers.map((player) => {
              const existing = playerRatings.find(
                (item) => item.eventId === activeMatchEventId && item.playerId === player.id
              )

              const parsed = parseExistingFeedback(existing?.notes)

              return (
                <PlayerFeedbackCard
                  key={player.id}
                  playerName={player.name}
                  initialValue={{
                    overallStatus: mapRatingToOverall(existing?.rating),
                    strengthArea: parsed.strengthArea,
                    focusArea: parsed.focusArea,
                    coachNote: parsed.coachNote,
                  }}
                  onSave={async (value) => {
                    if (!value.overallStatus) {
                      window.alert("Please choose Overall today before saving.")
                      return
                    }

                    const noteLines = [
                      `Strength: ${value.strengthArea || ""}`,
                      `Focus: ${value.focusArea || ""}`,
                      `Coach note: ${value.coachNote || ""}`,
                    ]

                    await savePlayerRating(
                      player.id,
                      mapOverallToRating(value.overallStatus),
                      noteLines.join("\n")
                    )
                  }}
                />
              )
            })}
          </div>
        )}
      </PageCard>

      {activeMatchEventId && playerOfMatchMap[activeMatchEventId] ? (
        <PageCard tone="softYellow">
          <SectionHeader title="Player of the Match" />
          <div style={{ color: "#92400e", fontWeight: 800 }}>
            {players.find((p) => p.id === playerOfMatchMap[activeMatchEventId])?.name || "Unknown player"}
          </div>
        </PageCard>
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
  )
}
