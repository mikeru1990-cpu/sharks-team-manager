"use client"

import QuarterPlanner from "../QuarterPlanner"
import MatchCenter from "../MatchCenter"
import MatchReportGenerator from "../MatchReportGenerator"
import { PageCard, SectionHeader, Badge, PrimaryButton, SecondaryButton } from "../ui"
import type { MatchTab, TimelineItem } from "../../lib/types"
import type { EventWithPlan, PeriodMode } from "../../lib/dashboardTypes"

type Props = any

function localToday() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
}

function toLocalDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function getWeekWindow() {
  const start = new Date()
  const day = start.getDay() || 7
  start.setDate(start.getDate() - day + 1)
  start.setHours(0, 0, 0, 0)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start: toLocalDate(start), end: toLocalDate(end) }
}

function isThisWeek(event: EventWithPlan) {
  const { start, end } = getWeekWindow()
  return event.date >= start && event.date <= end
}

function formatShortDate(date: string) {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "2-digit", month: "short" })
  } catch {
    return date
  }
}

function getSmartMatch(events: EventWithPlan[]) {
  const today = localToday()
  const matchEvents = (events || []).filter((event) => event.type === "match")
  const thisWeek = matchEvents.filter(isThisWeek).sort((a, b) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`))
  const todayMatch = thisWeek.find((event) => event.date === today)
  const upcomingThisWeek = thisWeek.find((event) => event.date >= today)
  const nextUpcoming = matchEvents.filter((event) => event.date >= today).sort((a, b) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`))[0]
  return todayMatch || upcomingThisWeek || nextUpcoming || thisWeek[0] || matchEvents[0] || null
}

function getMatchStatus(event: EventWithPlan | null, running: boolean) {
  if (running) return { label: "Live Match", tone: "green" as const }
  if (!event) return { label: "No Match This Week", tone: "yellow" as const }
  if (event.date === localToday()) return { label: "Match Today", tone: "green" as const }
  if (isThisWeek(event)) return { label: "This Week's Match", tone: "blue" as const }
  return { label: "Next Fixture", tone: "blue" as const }
}

function AlertStrip({ tone, children }: { tone: "danger" | "warning"; children: React.ReactNode }) {
  const colour = tone === "danger" ? "#fb7185" : "#f59e0b"
  return <div style={{ borderRadius: 14, padding: "10px 12px", background: `${colour}18`, border: `1px solid ${colour}66`, color: tone === "danger" ? "#fecdd3" : "#fde68a", fontWeight: 900, fontSize: 13 }}>{children}</div>
}

function goalsByPlayer(timeline: TimelineItem[]) {
  const counts: Record<string, number> = {}
  ;(timeline || []).filter((item) => item.type === "goal").forEach((item) => {
    const name = item.text.split(" scored")[0].replace(/^.*-\s*/, "").trim() || item.text
    counts[name] = (counts[name] || 0) + 1
  })
  return counts
}

function ParentReportCard({ event, homeTeam, awayTeam, homeScore, awayScore, timeline, playerOfTheMatch }: { event: EventWithPlan; homeTeam: string; awayTeam: string; homeScore: number; awayScore: number; timeline: TimelineItem[]; playerOfTheMatch?: string }) {
  const goals = goalsByPlayer(timeline)
  const goalLines = Object.keys(goals).length ? Object.entries(goals).map(([name, count]) => `⚽ ${name}${count > 1 ? ` x${count}` : ""}`) : ["Goals: none logged"]
  const text = [`⚽ Match Report`, ``, `${homeTeam} ${homeScore}-${awayScore} ${awayTeam}`, ``, `Date: ${formatShortDate(event.date)}`, event.opponent ? `Opponent: ${event.opponent}` : "", ``, `Goals:`, ...goalLines, ``, playerOfTheMatch ? `🏆 Player of the Match: ${playerOfTheMatch}` : "🏆 Player of the Match: TBC", ``, `Fantastic effort from the team today. Well done everyone!`].filter(Boolean).join("\n")
  return (
    <PageCard>
      <SectionHeader title="Parent WhatsApp Report" subtitle="Copy this after the match." action={<div style={{ minWidth: 120 }}><SecondaryButton onClick={() => { try { void navigator.clipboard.writeText(text) } catch { window.prompt("Copy match report", text) } }}>Copy</SecondaryButton></div>} />
      <pre style={{ whiteSpace: "pre-wrap", margin: 0, color: "#e5eefc", background: "rgba(2,6,23,0.55)", border: "1px solid rgba(125,211,252,0.18)", borderRadius: 18, padding: 14, fontFamily: "inherit", fontWeight: 800, lineHeight: 1.45 }}>{text}</pre>
    </PageCard>
  )
}

function MatchCommandCard({ event, activeMatchEventId, events, smartMatch, setActiveMatchEventId, persistSettings, setMatchTab, available, maybe, unavailable, coaches, running }: any) {
  const matchEvents = (events || []).filter((item: EventWithPlan) => item.type === "match")
  const status = getMatchStatus(event || smartMatch, running)
  const selectedValue = activeMatchEventId || smartMatch?.id || ""
  function chooseMatch(value: string | null) {
    setActiveMatchEventId(value)
    void persistSettings({ activeMatchEventId: value })
  }
  return (
    <div className="sharks-elite-panel sharks-card-shine" style={{ borderRadius: 24, padding: 14, display: "grid", gap: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "start" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: status.tone === "green" ? "#86efac" : status.tone === "yellow" ? "#fde68a" : "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>{status.label}</div>
          <div style={{ color: "white", fontSize: 22, fontWeight: 1000, lineHeight: 1.08, marginTop: 5, overflowWrap: "anywhere" }}>{(event || smartMatch)?.title || "Matchday is clear"}</div>
          {(event || smartMatch)?.opponent ? <div style={{ color: "#cbd5e1", fontWeight: 850, fontSize: 13, marginTop: 4 }}>vs {(event || smartMatch)?.opponent}</div> : null}
        </div>
        {(event || smartMatch) ? <Badge tone={status.tone}>{formatShortDate((event || smartMatch).date)}{(event || smartMatch).startTime ? ` • ${(event || smartMatch).startTime}` : ""}</Badge> : null}
      </div>
      {matchEvents.length ? (
        <select value={selectedValue} onChange={(changeEvent) => chooseMatch(changeEvent.target.value || null)} style={{ padding: 11, borderRadius: 15, border: "1px solid rgba(125,211,252,0.24)", fontSize: 14, width: "100%", background: "rgba(2,6,23,0.66)", color: "white", fontWeight: 900 }}>
          <option value="">Choose match event</option>
          {matchEvents.filter(isThisWeek).length ? <optgroup label="This week">{matchEvents.filter(isThisWeek).map((item: EventWithPlan) => <option key={item.id} value={item.id}>{formatShortDate(item.date)} • {item.startTime || "00:00"} • {item.title}</option>)}</optgroup> : null}
          <optgroup label="Other matches">{matchEvents.filter((item: EventWithPlan) => !isThisWeek(item)).slice().sort((a: EventWithPlan, b: EventWithPlan) => `${a.date}${a.startTime || ""}`.localeCompare(`${b.date}${b.startTime || ""}`)).map((item: EventWithPlan) => <option key={item.id} value={item.id}>{formatShortDate(item.date)} • {item.startTime || "00:00"} • {item.title}</option>)}</optgroup>
        </select>
      ) : <div style={{ color: "#cbd5e1", fontWeight: 800, fontSize: 13 }}>Create a match in Events and it will appear here automatically.</div>}
      <div style={{ borderRadius: 16, padding: "10px 12px", background: "rgba(2,6,23,0.52)", border: "1px solid rgba(125,211,252,0.18)", color: "#e5eefc", fontWeight: 900, fontSize: 13, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span style={{ color: "#86efac" }}>Available {available}</span><span style={{ color: "#fde68a" }}>Maybe {maybe}</span><span style={{ color: "#fecdd3" }}>Out {unavailable}</span><span style={{ color: "#7dd3fc" }}>Coaches {coaches}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 8 }}><PrimaryButton onClick={() => setMatchTab("overview")}>Match</PrimaryButton><SecondaryButton onClick={() => setMatchTab("lineup")}>Lineup</SecondaryButton><SecondaryButton onClick={() => setMatchTab("quarters")}>Quarters</SecondaryButton></div>
    </div>
  )
}

export default function MatchTabContent(props: Props) {
  const { isAdmin, matchTab, setMatchTab, events = [], activeMatchEventId, setActiveMatchEventId, activeMatchEvent, matchPlayers = [], maybePlayers = [], unavailablePlayers = [], noAvailableKeeper, persistSettings, availableCoaches = [], headCoachAvailable, noAvailableCoaches, matchFormat, formation, currentSlots, lineupMap, benchIds, homeTeam, awayTeam, homeScore, awayScore, seconds, running, liveSecondsMap, timeline = [], savedLineups, lineupName, setLineupName, activeDragPlayerId, setActiveDragPlayerId, setHomeTeamState, setAwayTeamState, setHomeScoreState, setAwayScoreState, setRunning, setSeconds, setLiveSecondsMap, persistMatchState, handleSaveMinutes, handleChangeFormation, handleSaveLineup, handleLoadSavedLineup, handleDeleteSavedLineup, handleDragStart, handleDragEnd, openCreateEvent, openEditEvent, handleDeleteTimelineItem, handleEndGame, periodMode, periodLength, currentQuarter, setCurrentQuarterState, setPeriodModeState, setPeriodLengthState, quarterPlans, quarterWarnings, handleSaveCurrentQuarter, handleLoadQuarter, handleAutoGenerate, playerOfMatchMap = {}, players = [], activeTopPerformers, activeGoalsSummary, latestActiveMatchReport, saveMatchReport } = props
  const smartMatch = getSmartMatch(events)
  const current = events.find((event: EventWithPlan) => event.id === activeMatchEventId) || null
  const currentIsRelevant = current && current.type === "match" && (isThisWeek(current) || current.date >= localToday())
  if (!running && smartMatch && (!current || !currentIsRelevant) && activeMatchEventId !== smartMatch.id) {
    window.setTimeout(() => {
      setActiveMatchEventId(smartMatch.id)
      void persistSettings({ activeMatchEventId: smartMatch.id })
    }, 0)
  }
  const shouldShowPostMatch = Boolean(activeMatchEvent && !running && (homeScore > 0 || awayScore > 0 || timeline.length > 0 || latestActiveMatchReport))
  const playerOfMatchName = activeMatchEvent ? players.find((p: any) => p.id === playerOfMatchMap[activeMatchEvent.id])?.name || "" : ""
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <MatchCommandCard event={activeMatchEvent} activeMatchEventId={activeMatchEventId} events={events} smartMatch={smartMatch} setActiveMatchEventId={setActiveMatchEventId} persistSettings={persistSettings} setMatchTab={setMatchTab} available={matchPlayers.length} maybe={maybePlayers.length} unavailable={unavailablePlayers.length} coaches={availableCoaches.length} running={running} />
      {activeMatchEvent ? <div style={{ display: "grid", gap: 8 }}>{noAvailableKeeper ? <AlertStrip tone="danger">No available goalkeeper is marked for this match.</AlertStrip> : null}{noAvailableCoaches ? <AlertStrip tone="danger">No coaches are available for this day.</AlertStrip> : null}{!headCoachAvailable ? <AlertStrip tone="warning">No Head Coach is marked as available.</AlertStrip> : null}</div> : null}
      <MatchCenter isAdmin={isAdmin} matchTab={matchTab || "overview"} setMatchTab={setMatchTab} matchFormat={matchFormat} formation={formation} currentSlots={currentSlots || []} players={matchPlayers} lineupMap={lineupMap || {}} benchIds={benchIds || []} homeTeam={homeTeam} awayTeam={awayTeam} homeScore={homeScore} awayScore={awayScore} seconds={seconds} running={running} liveSecondsMap={liveSecondsMap || {}} timeline={timeline} savedLineups={savedLineups || []} lineupName={lineupName} setLineupName={setLineupName} activeDragPlayerId={activeDragPlayerId} setActiveDragPlayerId={setActiveDragPlayerId} setHomeTeam={async (value: string) => { setHomeTeamState(value); await persistMatchState({ homeTeam: value }) }} setAwayTeam={async (value: string) => { setAwayTeamState(value); await persistMatchState({ awayTeam: value }) }} setHomeScore={async (value: number) => { setHomeScoreState(value); await persistMatchState({ homeScore: value }) }} setAwayScore={async (value: number) => { setAwayScoreState(value); await persistMatchState({ awayScore: value }) }} setRunning={(value: boolean) => { setRunning(value); void persistMatchState({ running: value }) }} resetClock={() => { setRunning(false); setSeconds(0); setLiveSecondsMap({}); void persistMatchState({ running: false, seconds: 0, liveSecondsMap: {} }) }} saveMinutes={handleSaveMinutes} onChangeFormation={handleChangeFormation} onSaveLineup={handleSaveLineup} onLoadSavedLineup={handleLoadSavedLineup} onDeleteSavedLineup={handleDeleteSavedLineup} onDragStartExternal={handleDragStart} onDragEndExternal={handleDragEnd} onOpenCreateEvent={openCreateEvent} onOpenEditEvent={openEditEvent} onDeleteTimelineItem={handleDeleteTimelineItem} onEndGame={handleEndGame} periodMode={periodMode} periodLength={periodLength} currentPeriod={currentQuarter} setCurrentPeriod={(value: number) => { setCurrentQuarterState(value); void persistMatchState({ currentPeriod: value }) }} setPeriodMode={async (value: PeriodMode) => { setPeriodModeState(value); setCurrentQuarterState(1); await persistMatchState({ periodMode: value, currentPeriod: 1 }) }} setPeriodLength={async (value: number) => { const nextValue = Math.max(1, value || 1); setPeriodLengthState(nextValue); await persistMatchState({ periodLength: nextValue }) }} trackingTitle={activeMatchEvent ? `${activeMatchEvent.title}${activeMatchEvent.startTime ? ` • ${activeMatchEvent.startTime}` : ""}` : ""} />
      {(matchTab || "overview") === "quarters" ? <QuarterPlanner isAdmin={isAdmin} currentQuarter={currentQuarter} setCurrentQuarter={(q) => { setCurrentQuarterState(q); void persistMatchState({ currentPeriod: q }) }} quarterPlans={quarterPlans || {}} quarterWarnings={quarterWarnings || []} currentSlots={currentSlots || []} players={matchPlayers} lineupMap={lineupMap || {}} benchIds={benchIds || []} onSaveCurrentQuarter={handleSaveCurrentQuarter} onLoadQuarter={handleLoadQuarter} onAutoGenerate={handleAutoGenerate} periodMode={periodMode} periodLength={periodLength} /> : null}
      {shouldShowPostMatch ? <PageCard tone="softYellow"><SectionHeader title="Match Summary" subtitle="Reports, parent message and post-match notes." /><div style={{ display: "grid", gap: 10 }}>{playerOfMatchName ? <div style={{ color: "#92400e", fontWeight: 900 }}>Player of the Match: {playerOfMatchName}</div> : null}<div style={{ color: "#92400e", fontWeight: 800 }}>This section only appears after match activity so live Matchday stays clean.</div></div></PageCard> : null}
      {shouldShowPostMatch && activeMatchEvent ? <ParentReportCard event={activeMatchEvent} homeTeam={homeTeam} awayTeam={awayTeam} homeScore={homeScore} awayScore={awayScore} timeline={timeline} playerOfTheMatch={playerOfMatchName} /> : null}
      {shouldShowPostMatch && activeMatchEvent ? <MatchReportGenerator isAdmin={isAdmin} activeMatchTitle={activeMatchEvent.title} activeMatchDate={activeMatchEvent.date} opponent={activeMatchEvent.opponent || awayTeam} scoreLine={`${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`} playerOfTheMatch={playerOfMatchName} topPerformers={activeTopPerformers} goalsSummary={activeGoalsSummary} onSaveReport={saveMatchReport} latestReport={latestActiveMatchReport} /> : null}
    </div>
  )
}
