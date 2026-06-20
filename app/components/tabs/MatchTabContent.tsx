"use client"

import { useEffect, useMemo } from "react"
import QuarterPlanner from "../QuarterPlanner"
import MatchCenter from "../MatchCenter"
import MatchReportGenerator from "../MatchReportGenerator"
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
  persistMatchState: (patch?: Partial<{ homeTeam: string; awayTeam: string; homeScore: number; awayScore: number; matchFormat: MatchFormat; formation: string; currentPeriod: number; periodMode: PeriodMode; periodLength: number; seconds: number; running: boolean; liveSecondsMap: Record<string, number>; lineupMap: Record<string, string | null>; benchIds: string[] }>) => Promise<void>
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

function localToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function startOfWeek(date = new Date()) {
  const copy = new Date(date)
  const day = copy.getDay() || 7
  copy.setDate(copy.getDate() - day + 1)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function toLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function getWeekWindow() {
  const start = startOfWeek()
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start: toLocalDate(start), end: toLocalDate(end) }
}

function formatShortDate(date: string) {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
  } catch {
    return date
  }
}

function isThisWeek(event: EventWithPlan) {
  const { start, end } = getWeekWindow()
  return event.date >= start && event.date <= end
}

function getSmartMatch(events: EventWithPlan[]) {
  const today = localToday()
  const matchEvents = events.filter((event) => event.type === "match")
  const thisWeek = matchEvents.filter(isThisWeek).sort((a, b) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`))
  const todayMatch = thisWeek.find((event) => event.date === today)
  const upcomingThisWeek = thisWeek.find((event) => event.date >= today)
  const nextUpcoming = matchEvents.filter((event) => event.date >= today).sort((a, b) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`))[0]
  return todayMatch || upcomingThisWeek || thisWeek[0] || nextUpcoming || matchEvents[0] || null
}

function AlertStrip({ tone, children }: { tone: "danger" | "warning"; children: React.ReactNode }) {
  const colour = tone === "danger" ? "#fb7185" : "#f59e0b"
  return (
    <div style={{ borderRadius: 16, padding: "11px 12px", background: `${colour}18`, border: `1px solid ${colour}66`, color: tone === "danger" ? "#fecdd3" : "#fde68a", fontWeight: 900, fontSize: 13 }}>
      {children}
    </div>
  )
}

function MatchWeekBanner({ event }: { event: EventWithPlan | null }) {
  if (!event) {
    return (
      <div className="sharks-glass" style={{ borderRadius: 20, padding: 14, display: "grid", gap: 5, border: "1px solid rgba(245,158,11,0.30)" }}>
        <div style={{ color: "#facc15", fontSize: 10, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>No match this week</div>
        <div style={{ color: "white", fontWeight: 1000, fontSize: 18 }}>Matchday is clear</div>
        <div style={{ color: "#cbd5e1", fontWeight: 750, fontSize: 13 }}>Create a fixture in Events and it will appear here automatically.</div>
      </div>
    )
  }

  const today = localToday()
  const label = event.date === today ? "Match Today" : isThisWeek(event) ? "This Week's Match" : "Next Fixture"

  return (
    <div className="sharks-glass" style={{ borderRadius: 20, padding: 14, display: "grid", gap: 7, border: event.date === today ? "1px solid rgba(34,197,94,0.46)" : "1px solid rgba(125,211,252,0.28)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <div style={{ color: event.date === today ? "#86efac" : "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>{label}</div>
        <Badge tone={event.date === today ? "green" : "blue"}>{formatShortDate(event.date)}{event.startTime ? ` • ${event.startTime}` : ""}</Badge>
      </div>
      <div style={{ color: "white", fontWeight: 1000, fontSize: 19, lineHeight: 1.15 }}>{event.title}</div>
      {event.opponent ? <div style={{ color: "#cbd5e1", fontWeight: 850, fontSize: 13 }}>vs {event.opponent}</div> : null}
    </div>
  )
}

function CompactMatchSelector({ events, activeMatchEventId, setActiveMatchEventId, persistSettings, smartMatch }: Pick<Props, "events" | "activeMatchEventId" | "setActiveMatchEventId" | "persistSettings"> & { smartMatch: EventWithPlan | null }) {
  const matchEvents = events.filter((event) => event.type === "match")
  const thisWeek = matchEvents.filter(isThisWeek)
  const otherMatches = matchEvents.filter((event) => !isThisWeek(event))

  if (matchEvents.length === 0) {
    return <AlertStrip tone="warning">No match events created yet. Add one from Events.</AlertStrip>
  }

  return (
    <div className="sharks-glass" style={{ borderRadius: 20, padding: 10, display: "grid", gap: 7, border: "1px solid rgba(125,211,252,0.18)" }}>
      <div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>Matchday fixture</div>
      <select
        value={activeMatchEventId || smartMatch?.id || ""}
        onChange={(event) => {
          const value = event.target.value || null
          setActiveMatchEventId(value)
          void persistSettings({ activeMatchEventId: value })
        }}
        style={{ padding: 12, borderRadius: 16, border: "1px solid rgba(125,211,252,0.24)", fontSize: 15, width: "100%", background: "rgba(2,6,23,0.66)", color: "white", fontWeight: 900 }}
      >
        <option value="">Choose match event</option>
        {thisWeek.length ? <optgroup label="This week">{thisWeek.map((event) => <option key={event.id} value={event.id}>{formatShortDate(event.date)} • {event.startTime || "00:00"} • {event.title}</option>)}</optgroup> : null}
        {otherMatches.length ? <optgroup label="Other matches">{otherMatches.slice().sort((a, b) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`)).map((event) => <option key={event.id} value={event.id}>{formatShortDate(event.date)} • {event.startTime || "00:00"} • {event.title}</option>)}</optgroup> : null}
      </select>
    </div>
  )
}

export default function MatchTabContent(props: Props) {
  const {
    isAdmin, matchTab, setMatchTab, events, activeMatchEventId, setActiveMatchEventId, activeMatchEvent,
    matchPlayers, maybePlayers, unavailablePlayers, noAvailableKeeper, persistSettings,
    availableCoaches, headCoachAvailable, noAvailableCoaches,
    matchFormat, formation, currentSlots, lineupMap, benchIds, homeTeam, awayTeam, homeScore, awayScore, seconds, running,
    liveSecondsMap, timeline, savedLineups, lineupName, setLineupName, activeDragPlayerId, setActiveDragPlayerId,
    setHomeTeamState, setAwayTeamState, setHomeScoreState, setAwayScoreState, setRunning, setSeconds, setLiveSecondsMap,
    persistMatchState, handleSaveMinutes, handleChangeFormation, handleSaveLineup, handleLoadSavedLineup, handleDeleteSavedLineup,
    handleDragStart, handleDragEnd, openCreateEvent, openEditEvent, handleDeleteTimelineItem, handleEndGame,
    periodMode, periodLength, currentQuarter, setCurrentQuarterState, setPeriodModeState, setPeriodLengthState,
    quarterPlans, quarterWarnings, handleSaveCurrentQuarter, handleLoadQuarter, handleAutoGenerate,
    playerOfMatchMap, players, activeTopPerformers, activeGoalsSummary, latestActiveMatchReport, saveMatchReport,
  } = props

  const smartMatch = useMemo(() => getSmartMatch(events), [events])
  const shouldShowPostMatch = Boolean(activeMatchEvent && !running && (homeScore > 0 || awayScore > 0 || timeline.length > 0 || latestActiveMatchReport))

  useEffect(() => {
    const current = events.find((event) => event.id === activeMatchEventId) || null
    const currentIsRelevant = current && current.type === "match" && (isThisWeek(current) || current.date >= localToday())
    if (!running && smartMatch && (!current || !currentIsRelevant)) {
      setActiveMatchEventId(smartMatch.id)
      void persistSettings({ activeMatchEventId: smartMatch.id })
    }
  }, [events, activeMatchEventId, running, smartMatch, setActiveMatchEventId, persistSettings])

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <MatchWeekBanner event={activeMatchEvent || smartMatch} />
      <CompactMatchSelector events={events} activeMatchEventId={activeMatchEventId} setActiveMatchEventId={setActiveMatchEventId} persistSettings={persistSettings} smartMatch={smartMatch} />

      {activeMatchEvent ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
            {[
              ["Available", matchPlayers.length, "#22c55e"],
              ["Maybe", maybePlayers.length, "#f59e0b"],
              ["Out", unavailablePlayers.length, "#ef4444"],
              ["Coaches", availableCoaches.length, "#38bdf8"],
            ].map(([label, value, colour]) => (
              <div key={String(label)} style={{ borderRadius: 16, padding: 10, background: "rgba(2,6,23,0.48)", border: `1px solid ${colour}55`, minWidth: 0 }}>
                <div style={{ color: "#94a3b8", fontSize: 9, fontWeight: 1000, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</div>
                <div style={{ color: String(colour), fontSize: 24, fontWeight: 1000, lineHeight: 1, marginTop: 4 }}>{String(value)}</div>
              </div>
            ))}
          </div>
          {noAvailableKeeper ? <AlertStrip tone="danger">No available goalkeeper is marked for this match.</AlertStrip> : null}
          {noAvailableCoaches ? <AlertStrip tone="danger">No coaches are available for this day.</AlertStrip> : null}
          {!headCoachAvailable ? <AlertStrip tone="warning">No Head Coach is marked as available.</AlertStrip> : null}
        </div>
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
        setHomeTeam={async (value: string) => { setHomeTeamState(value); await persistMatchState({ homeTeam: value }) }}
        setAwayTeam={async (value: string) => { setAwayTeamState(value); await persistMatchState({ awayTeam: value }) }}
        setHomeScore={async (value: number) => { setHomeScoreState(value); await persistMatchState({ homeScore: value }) }}
        setAwayScore={async (value: number) => { setAwayScoreState(value); await persistMatchState({ awayScore: value }) }}
        setRunning={(value: boolean) => { setRunning(value); void persistMatchState({ running: value }) }}
        resetClock={() => { setRunning(false); setSeconds(0); setLiveSecondsMap({}); void persistMatchState({ running: false, seconds: 0, liveSecondsMap: {} }) }}
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
        setCurrentPeriod={(value: number) => { setCurrentQuarterState(value); void persistMatchState({ currentPeriod: value }) }}
        setPeriodMode={async (value: PeriodMode) => { setPeriodModeState(value); setCurrentQuarterState(1); await persistMatchState({ periodMode: value, currentPeriod: 1 }) }}
        setPeriodLength={async (value: number) => { const nextValue = Math.max(1, value || 1); setPeriodLengthState(nextValue); await persistMatchState({ periodLength: nextValue }) }}
        trackingTitle={activeMatchEvent ? `${activeMatchEvent.title}${activeMatchEvent.startTime ? ` • ${activeMatchEvent.startTime}` : ""}` : ""}
      />

      {matchTab === "quarters" ? <QuarterPlanner isAdmin={isAdmin} currentQuarter={currentQuarter} setCurrentQuarter={(q) => { setCurrentQuarterState(q); void persistMatchState({ currentPeriod: q }) }} quarterPlans={quarterPlans} quarterWarnings={quarterWarnings} currentSlots={currentSlots} players={matchPlayers} lineupMap={lineupMap} benchIds={benchIds} onSaveCurrentQuarter={handleSaveCurrentQuarter} onLoadQuarter={handleLoadQuarter} onAutoGenerate={handleAutoGenerate} periodMode={periodMode} periodLength={periodLength} /> : null}

      {shouldShowPostMatch ? (
        <PageCard tone="softYellow">
          <SectionHeader title="Post-Match Summary" subtitle="Feedback and match report after the game." />
          <div style={{ display: "grid", gap: 10 }}>
            {activeMatchEventId && playerOfMatchMap[activeMatchEventId] ? <div style={{ color: "#92400e", fontWeight: 900 }}>Player of the Match: {players.find((p) => p.id === playerOfMatchMap[activeMatchEventId])?.name || "Unknown player"}</div> : null}
            <div style={{ color: "#92400e", fontWeight: 800 }}>Player feedback has been moved out of live Matchday so the match screen stays focused while the game is running.</div>
          </div>
        </PageCard>
      ) : null}

      {shouldShowPostMatch && activeMatchEvent ? <MatchReportGenerator isAdmin={isAdmin} activeMatchTitle={activeMatchEvent.title} activeMatchDate={activeMatchEvent.date} opponent={activeMatchEvent.opponent || awayTeam} scoreLine={`${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`} playerOfTheMatch={players.find((p) => p.id === playerOfMatchMap[activeMatchEvent.id])?.name || ""} topPerformers={activeTopPerformers} goalsSummary={activeGoalsSummary} onSaveReport={saveMatchReport} latestReport={latestActiveMatchReport} /> : null}
    </div>
  )
}
