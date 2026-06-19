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
  return {
    strengthArea: text.match(/Strength:\s*(.*)/i)?.[1]?.trim() || "",
    focusArea: text.match(/Focus:\s*(.*)/i)?.[1]?.trim() || "",
    coachNote: text.match(/Coach note:\s*([\s\S]*)/i)?.[1]?.trim() || "",
  }
}

function AlertStrip({ tone, children }: { tone: "danger" | "warning"; children: React.ReactNode }) {
  const colour = tone === "danger" ? "#fb7185" : "#f59e0b"
  return (
    <div style={{ borderRadius: 16, padding: "11px 12px", background: `${colour}18`, border: `1px solid ${colour}66`, color: tone === "danger" ? "#fecdd3" : "#fde68a", fontWeight: 900, fontSize: 13 }}>
      {children}
    </div>
  )
}

function CompactMatchSelector({ events, activeMatchEventId, setActiveMatchEventId, persistSettings }: Pick<Props, "events" | "activeMatchEventId" | "setActiveMatchEventId" | "persistSettings">) {
  const matchEvents = events.filter((event) => event.type === "match")
  if (matchEvents.length === 0) {
    return <AlertStrip tone="warning">No match events created yet. Add one from Events.</AlertStrip>
  }

  return (
    <div className="sharks-glass" style={{ borderRadius: 20, padding: 10, display: "grid", gap: 7, border: "1px solid rgba(125,211,252,0.18)" }}>
      <div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>Active match</div>
      <select
        value={activeMatchEventId || ""}
        onChange={(event) => {
          const value = event.target.value || null
          setActiveMatchEventId(value)
          void persistSettings({ activeMatchEventId: value })
        }}
        style={{ padding: 12, borderRadius: 16, border: "1px solid rgba(125,211,252,0.24)", fontSize: 15, width: "100%", background: "rgba(2,6,23,0.66)", color: "white", fontWeight: 900 }}
      >
        <option value="">Choose match event</option>
        {matchEvents.slice().sort((a, b) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`)).map((event) => (
          <option key={event.id} value={event.id}>{event.date} • {event.startTime || "00:00"} • {event.title}</option>
        ))}
      </select>
    </div>
  )
}

export default function MatchTabContent(props: Props) {
  const {
    isAdmin, matchTab, setMatchTab, events, activeMatchEventId, setActiveMatchEventId, activeMatchEvent,
    matchPlayers, maybePlayers, unavailablePlayers, noAvailableKeeper, persistSettings,
    availableCoaches, unavailableCoachesList, holidayCoachesList, headCoachAvailable, noAvailableCoaches,
    matchFormat, formation, currentSlots, lineupMap, benchIds, homeTeam, awayTeam, homeScore, awayScore, seconds, running,
    liveSecondsMap, timeline, savedLineups, lineupName, setLineupName, activeDragPlayerId, setActiveDragPlayerId,
    setHomeTeamState, setAwayTeamState, setHomeScoreState, setAwayScoreState, setRunning, setSeconds, setLiveSecondsMap,
    persistMatchState, handleSaveMinutes, handleChangeFormation, handleSaveLineup, handleLoadSavedLineup, handleDeleteSavedLineup,
    handleDragStart, handleDragEnd, openCreateEvent, openEditEvent, handleDeleteTimelineItem, handleEndGame,
    periodMode, periodLength, currentQuarter, setCurrentQuarterState, setPeriodModeState, setPeriodLengthState,
    quarterPlans, quarterWarnings, handleSaveCurrentQuarter, handleLoadQuarter, handleAutoGenerate,
    playerRatings, savePlayerRating, playerOfMatchMap, players, activeTopPerformers, activeGoalsSummary, latestActiveMatchReport, saveMatchReport,
  } = props

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <CompactMatchSelector events={events} activeMatchEventId={activeMatchEventId} setActiveMatchEventId={setActiveMatchEventId} persistSettings={persistSettings} />

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

      <PageCard>
        <SectionHeader title="Player Feedback" subtitle="Development-focused notes instead of match ratings." />
        {!activeMatchEvent ? <div style={{ color: "#64748b" }}>Choose an active match event to record player feedback.</div> : matchPlayers.length === 0 ? <div style={{ color: "#64748b" }}>No available players for the selected match.</div> : (
          <div style={{ display: "grid", gap: 14 }}>
            {matchPlayers.map((player) => {
              const existing = playerRatings.find((item) => item.eventId === activeMatchEventId && item.playerId === player.id)
              const parsed = parseExistingFeedback(existing?.notes)
              return <PlayerFeedbackCard key={player.id} playerName={player.name} initialValue={{ overallStatus: mapRatingToOverall(existing?.rating), strengthArea: parsed.strengthArea, focusArea: parsed.focusArea, coachNote: parsed.coachNote }} onSave={async (value) => { if (!value.overallStatus) { window.alert("Please choose Overall today before saving."); return } await savePlayerRating(player.id, mapOverallToRating(value.overallStatus), [`Strength: ${value.strengthArea || ""}`, `Focus: ${value.focusArea || ""}`, `Coach note: ${value.coachNote || ""}`].join("\n")) }} />
            })}
          </div>
        )}
      </PageCard>

      {activeMatchEventId && playerOfMatchMap[activeMatchEventId] ? <PageCard tone="softYellow"><SectionHeader title="Player of the Match" /><div style={{ color: "#92400e", fontWeight: 800 }}>{players.find((p) => p.id === playerOfMatchMap[activeMatchEventId])?.name || "Unknown player"}</div></PageCard> : null}

      {activeMatchEvent ? <MatchReportGenerator isAdmin={isAdmin} activeMatchTitle={activeMatchEvent.title} activeMatchDate={activeMatchEvent.date} opponent={activeMatchEvent.opponent || awayTeam} scoreLine={`${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`} playerOfTheMatch={players.find((p) => p.id === playerOfMatchMap[activeMatchEvent.id])?.name || ""} topPerformers={activeTopPerformers} goalsSummary={activeGoalsSummary} onSaveReport={saveMatchReport} latestReport={latestActiveMatchReport} /> : null}
    </div>
  )
}
