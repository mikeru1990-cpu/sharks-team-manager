"use client"

import { useEffect, useMemo, useState } from "react"
import { isMainGoalkeeper, loadSquadPlayers, positionLine, type SquadStorePlayer } from "../../lib/squadStore"
import { getTeamFormat, loadTeamFormat, saveTeamFormat, teamFormats, type TeamFormatId } from "../../lib/teamFormat"

const storageKey = "football-os-matchday-state-v1"
const matchModes = ["Control", "Lineup", "Live", "Quarters", "Stats"] as const

type MatchMode = typeof matchModes[number]
type MatchEventType = "goal" | "opp-goal" | "sub" | "injury" | "card" | "note"
type MatchEvent = { id: number; minute: number; quarter: number; type: MatchEventType; label: string; score: string }
type SavedMatchState = { seconds: number; home: number; away: number; activeQuarter: number; events: MatchEvent[]; liveLineupIds?: string[] }

function shortName(name: string) {
  if (name === "Darcy-Rae Russell") return "Darcy-Rae"
  if (name === "Isabella Ogden") return "Bella O"
  if (name === "Bella Bainbridge") return "Bella B"
  return name.split(" ")[0]
}

function availablePlayers(players: SquadStorePlayer[]) {
  return players.filter((player) => player.availability !== "Unavailable" && player.availability !== "Injured")
}

function buildRotation(players: SquadStorePlayer[], playersOnPitch: number, periods: number) {
  const available = availablePlayers(players)
  const goalkeeper = available.find(isMainGoalkeeper) ?? available.find((player) => player.primaryPosition === "GK") ?? available[0]
  const outfield = available.filter((player) => player.id !== goalkeeper?.id)
  const outfieldSlots = Math.max(0, playersOnPitch - 1)
  return Array.from({ length: periods }, (_, periodIndex) => {
    const offset = (periodIndex * outfieldSlots) % Math.max(outfield.length, 1)
    const rotated = [...outfield.slice(offset), ...outfield.slice(0, offset)]
    return [goalkeeper, ...rotated].filter(Boolean).slice(0, playersOnPitch) as SquadStorePlayer[]
  })
}

export default function MatchdayCockpit() {
  const [players, setPlayers] = useState<SquadStorePlayer[]>([])
  const [teamFormatId, setTeamFormatId] = useState<TeamFormatId>("7v7")
  const format = getTeamFormat(teamFormatId)
  const [mode, setMode] = useState<MatchMode>("Control")
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [home, setHome] = useState(0)
  const [away, setAway] = useState(0)
  const [activeQuarter, setActiveQuarter] = useState(0)
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [selectedGoalPlayer, setSelectedGoalPlayer] = useState<string | null>(null)
  const [liveLineupIds, setLiveLineupIds] = useState<string[]>([])
  const [subOffId, setSubOffId] = useState<string | null>(null)
  const [subOnId, setSubOnId] = useState<string | null>(null)
  const [subModeOpen, setSubModeOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setPlayers(loadSquadPlayers())
    setTeamFormatId(loadTeamFormat())
    const refreshSquad = () => setPlayers(loadSquadPlayers())
    const refreshFormat = () => setTeamFormatId(loadTeamFormat())
    window.addEventListener("storage", refreshSquad)
    window.addEventListener("focus", refreshSquad)
    window.addEventListener("football-os-team-format-change", refreshFormat)
    return () => {
      window.removeEventListener("storage", refreshSquad)
      window.removeEventListener("focus", refreshSquad)
      window.removeEventListener("football-os-team-format-change", refreshFormat)
    }
  }, [])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw) as SavedMatchState
        setSeconds(saved.seconds ?? 0)
        setHome(saved.home ?? 0)
        setAway(saved.away ?? 0)
        setActiveQuarter(saved.activeQuarter ?? 0)
        setEvents(Array.isArray(saved.events) ? saved.events : [])
        setLiveLineupIds(Array.isArray(saved.liveLineupIds) ? saved.liveLineupIds : [])
      }
    } catch {}
    setLoaded(true)
  }, [])

  const rotation = useMemo(() => buildRotation(players, format.playersOnPitch, format.defaultPeriods), [players, format.playersOnPitch, format.defaultPeriods])
  const safeQuarter = Math.min(activeQuarter, Math.max(rotation.length - 1, 0))
  const plannedStarters = rotation[safeQuarter] ?? []

  useEffect(() => {
    const validIds = new Set(players.map((player) => player.id))
    const validLive = liveLineupIds.filter((id) => validIds.has(id))
    if (validLive.length !== liveLineupIds.length) setLiveLineupIds(validLive)
    if (validLive.length === 0 && plannedStarters.length) setLiveLineupIds(plannedStarters.map((player) => player.id))
    if (validLive.length > format.playersOnPitch) setLiveLineupIds(validLive.slice(0, format.playersOnPitch))
  }, [players, plannedStarters, liveLineupIds, format.playersOnPitch])

  useEffect(() => {
    if (!loaded) return
    const saved: SavedMatchState = { seconds, home, away, activeQuarter, events, liveLineupIds }
    window.localStorage.setItem(storageKey, JSON.stringify(saved))
  }, [loaded, seconds, home, away, activeQuarter, events, liveLineupIds])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [running])

  const starters = liveLineupIds.map((id) => players.find((player) => player.id === id)).filter(Boolean) as SquadStorePlayer[]
  const bench = availablePlayers(players).filter((player) => !starters.some((starter) => starter.id === player.id))
  const goalkeeper = players.find(isMainGoalkeeper) ?? players.find((player) => player.primaryPosition === "GK")
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
  const minute = Math.max(1, Math.floor(seconds / 60))
  const matchState = seconds === 0 ? "READY" : running ? "LIVE" : "PAUSED"
  const latestEvent = events[0]
  const hasEnoughPlayers = availablePlayers(players).length >= format.playersOnPitch
  const hasGoalkeeperOnPitch = starters.some((player) => isMainGoalkeeper(player) || player.primaryPosition === "GK")

  const minutesMap = useMemo(() => {
    const map: Record<string, number> = {}
    players.forEach((player) => { map[player.id] = 0 })
    rotation.forEach((period) => period.forEach((player) => { map[player.id] = (map[player.id] ?? 0) + format.defaultPeriodMinutes }))
    return map
  }, [players, rotation, format.defaultPeriodMinutes])

  const lowestMinutes = Object.values(minutesMap).length ? Math.min(...Object.values(minutesMap)) : 0
  const fairnessPlayers = players.filter((player) => minutesMap[player.id] === lowestMinutes)
  const nextQuarterIndex = Math.min(safeQuarter + 1, Math.max(rotation.length - 1, 0))
  const nextRotationText = nextQuarterIndex === safeQuarter ? "Final period active" : `${bench[0] ? shortName(bench[0].name) : "Bench"} ready for period ${nextQuarterIndex + 1}`
  const subOffPlayer = players.find((player) => player.id === subOffId)
  const subOnPlayer = players.find((player) => player.id === subOnId)
  const subWarning = subOffPlayer && (isMainGoalkeeper(subOffPlayer) || subOffPlayer.primaryPosition === "GK") && subOnPlayer && !(isMainGoalkeeper(subOnPlayer) || subOnPlayer.primaryPosition === "GK")

  function changeFormat(formatId: TeamFormatId) {
    setTeamFormatId(formatId)
    saveTeamFormat(formatId)
    setActiveQuarter(0)
    setLiveLineupIds([])
  }

  function addEvent(type: MatchEventType, label: string, nextScore = `${home}-${away}`) {
    setEvents((current) => [{ id: Date.now(), minute, quarter: safeQuarter + 1, type, label, score: nextScore }, ...current])
  }

  function scoreGoal(playerId: string) {
    const player = players.find((item) => item.id === playerId)
    if (!player) return
    const nextHome = home + 1
    setHome(nextHome)
    addEvent("goal", `Goal · ${shortName(player.name)}`, `${nextHome}-${away}`)
    setSelectedGoalPlayer(null)
  }

  function confirmSubstitution() {
    if (!subOffPlayer || !subOnPlayer) return
    setLiveLineupIds((current) => current.map((id) => id === subOffPlayer.id ? subOnPlayer.id : id).slice(0, format.playersOnPitch))
    addEvent("sub", `Sub · ${shortName(subOffPlayer.name)} off, ${shortName(subOnPlayer.name)} on`)
    setSubOffId(null); setSubOnId(null); setSubModeOpen(false)
  }

  function oppositionGoal() {
    const nextAway = away + 1
    setAway(nextAway)
    addEvent("opp-goal", "Opposition goal", `${home}-${nextAway}`)
  }

  function undoLastEvent() {
    const last = events[0]
    if (!last) return
    if (last.type === "goal") setHome((value) => Math.max(0, value - 1))
    if (last.type === "opp-goal") setAway((value) => Math.max(0, value - 1))
    setEvents((current) => current.slice(1))
  }

  function resetMatch() {
    setRunning(false); setSeconds(0); setHome(0); setAway(0); setActiveQuarter(0); setEvents([]); setSelectedGoalPlayer(null); setLiveLineupIds([]); setSubOffId(null); setSubOnId(null); setSubModeOpen(false); setMode("Control"); window.localStorage.removeItem(storageKey)
  }

  function loadPeriod(index: number) {
    setActiveQuarter(index)
    setLiveLineupIds((rotation[index] ?? []).map((player) => player.id))
  }

  return (
    <div style={shell}>
      <section style={scoreboard}><div><div style={eyebrow}>FOOTBALL OS / MATCHDAY</div><h1 style={title}>Leonard Stanley U11</h1><div style={subtle}>{format.label} · {format.defaultFormation} · {format.playersOnPitch} on pitch · live substitutions enabled</div></div><div style={scoreBlock}><div style={score}>{home}<span style={{ opacity: 0.35 }}>-</span>{away}</div><div style={running ? livePill : readyPill}>{matchState}</div></div></section>
      <section style={glassPanel}><div style={sectionHeader}><h2 style={sectionTitle}>Team format</h2><div style={softPill}>{format.defaultFormation}</div></div><div style={formatGrid}>{Object.keys(teamFormats).map((id) => <button key={id} type="button" onClick={() => changeFormat(id as TeamFormatId)} style={teamFormatId === id ? activeFormatButton : formatButton}>{id}</button>)}</div></section>
      <nav style={modeBar}>{matchModes.map((item) => <button key={item} type="button" onClick={() => setMode(item)} style={mode === item ? activeModeButton : modeButton}>{item}</button>)}</nav>

      {mode === "Control" && <><section style={controlDock}><div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}><div><div style={eyebrow}>P{safeQuarter + 1} · MATCH CLOCK</div><div style={clockText}>{clock}</div></div><div style={{ textAlign: "right" }}><div style={{ color: "rgba(226,232,240,0.62)", fontSize: 12, fontWeight: 900 }}>ON PITCH</div><div style={{ fontSize: 28, fontWeight: 950 }}>{starters.length}/{format.playersOnPitch}</div></div></div><div style={controlGrid}><button style={primaryAction} onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</button><button style={goalAction} onClick={() => setMode("Live")}>Goal +</button><button style={dangerAction} onClick={oppositionGoal}>Opp Goal</button></div></section>{!hasEnoughPlayers && <section style={warningPanel}>Not enough available players for {format.label}. You need {format.playersOnPitch} available players.</section>}{!hasGoalkeeperOnPitch && <section style={warningPanel}>No goalkeeper is currently on the pitch.</section>}<section style={glassPanel}><div style={sectionHeader}><h2 style={sectionTitle}>On pitch · period {safeQuarter + 1}</h2><div style={softPill}>{format.label}</div></div><div style={{ ...compactPlayerRow, gridTemplateColumns: `repeat(${Math.min(format.playersOnPitch, 7)},minmax(0,1fr))` }}>{starters.map((player, index) => <PlayerMini key={player.id} player={player} number={index + 1} />)}</div></section><section style={glassPanel}><div style={coachAlertIcon}>↻</div><div><div style={eyebrow}>NEXT ROTATION</div><h2 style={{ ...sectionTitle, marginTop: 4 }}>{nextRotationText}</h2><p style={paragraph}>{fairnessPlayers.map((player) => shortName(player.name)).join(" · ")} lowest planned minutes at {lowestMinutes}m. GK: {goalkeeper?.name ?? "not set"}.</p></div><button style={primaryAction} onClick={() => setMode("Quarters")}>Open planner</button></section><section style={glassPanel}><div style={sectionHeader}><h2 style={sectionTitle}>Last action</h2><button style={action} onClick={undoLastEvent} disabled={!latestEvent}>Undo</button></div><p style={paragraph}>{latestEvent ? `${latestEvent.minute}' · ${latestEvent.label} · ${latestEvent.score}` : "No match actions recorded yet."}</p></section></>}

      {mode === "Lineup" && <><section style={pitchCard}><div style={sectionHeader}><div><div style={eyebrow}>TACTICAL PITCH</div><h2 style={sectionTitle}>{format.label} · {format.defaultFormation}</h2></div><div style={softPill}>{format.playersOnPitch} players</div></div><div style={pitch}><div style={halfway} /><div style={circle} />{starters.map((player, index) => <PlayerDot key={player.id} player={player} slot={format.pitchSlots[index]} />)}</div></section><section style={glassPanel}><div style={sectionHeader}><h2 style={sectionTitle}>Bench tray</h2><div style={softPill}>{bench.length} ready</div></div><div style={benchTray}>{bench.map((player) => <PlayerChip key={player.id} player={player} minutes={minutesMap[player.id] ?? 0} />)}</div></section></>}

      {mode === "Live" && <><section style={controlDock}><div style={sectionHeader}><div><div style={eyebrow}>LIVE ACTIONS</div><h2 style={sectionTitle}>Record key moments</h2></div><div style={softPill}>P{safeQuarter + 1} · {clock}</div></div><div style={liveActionGrid}><button style={primaryAction} onClick={() => setSubModeOpen(!subModeOpen)}>Substitution</button><button style={goalAction} onClick={() => setSelectedGoalPlayer(selectedGoalPlayer ? null : "open")}>Goal</button><button style={dangerAction} onClick={oppositionGoal}>Opp Goal</button><button style={injuryAction} onClick={() => addEvent("injury", "Injury note")}>Injury</button><button style={cardAction} onClick={() => addEvent("card", "Card recorded")}>Card</button><button style={action} onClick={() => addEvent("note", "Coach note")}>Note</button></div></section>{subModeOpen && <section style={glassPanel}><div style={sectionHeader}><h2 style={sectionTitle}>Make substitution</h2><div style={softPill}>Off → On</div></div><div style={subGrid}><div><h3 style={smallTitle}>Player off</h3>{starters.map((player) => <button key={player.id} style={subOffId === player.id ? activeSubButton : subButton} onClick={() => setSubOffId(player.id)}>{player.name}<span>{positionLine(player)}</span></button>)}</div><div><h3 style={smallTitle}>Player on</h3>{bench.map((player) => <button key={player.id} style={subOnId === player.id ? activeSubButton : subButton} onClick={() => setSubOnId(player.id)}>{player.name}<span>{positionLine(player)}</span></button>)}</div></div>{subWarning && <p style={warningText}>Warning: this removes your goalkeeper without replacing with another GK.</p>}<button style={primaryAction} onClick={confirmSubstitution} disabled={!subOffId || !subOnId}>Confirm substitution</button></section>}{selectedGoalPlayer && <section style={glassPanel}><div style={sectionHeader}><h2 style={sectionTitle}>Who scored?</h2><button style={action} onClick={() => setSelectedGoalPlayer(null)}>Close</button></div><div style={goalPickerGrid}>{players.map((player) => <button key={player.id} style={goalButton} onClick={() => scoreGoal(player.id)}>⚽ <strong>{player.name}</strong><span>{positionLine(player)}</span></button>)}</div></section>}<TimelinePanel events={events} onUndo={undoLastEvent} /></>}

      {mode === "Quarters" && <><section style={glassPanel}><div style={sectionHeader}><div><div style={eyebrow}>ROTATION PLANNER</div><h2 style={sectionTitle}>{format.defaultPeriods} periods · {format.label}</h2></div><div style={softPill}>{format.defaultPeriodMinutes}m blocks</div></div><div style={quarterTabs}>{rotation.map((quarter, index) => <button key={index} onClick={() => loadPeriod(index)} style={safeQuarter === index ? activeQuarterButton : quarterButton}>P{index + 1}<span>{quarter.length} on</span></button>)}</div><div style={quickControls}><button style={primaryAction} onClick={() => addEvent("note", `Saved P${safeQuarter + 1} plan`)}>Save</button><button style={action} onClick={() => setPlayers(loadSquadPlayers())}>Refresh Squad</button><button style={action} onClick={() => { setLiveLineupIds((rotation[safeQuarter] ?? []).map((player) => player.id)); addEvent("note", `Auto-loaded ${format.label} period plan`) }}>Auto</button></div></section><section style={glassPanel}><div style={sectionHeader}><h2 style={sectionTitle}>Current period</h2><div style={softPill}>P{safeQuarter + 1}</div></div><div style={summaryPills}><span>Starters {starters.length}</span><span>Bench {bench.length}</span><span>GK {goalkeeper?.name ?? "Not set"}</span></div></section><section style={glassPanel}><div style={sectionHeader}><h2 style={sectionTitle}>Period plans</h2><div style={softPill}>{format.label}</div></div><div style={rotationList}>{rotation.map((period, index) => <div key={index} style={index === safeQuarter ? rotationRowActive : rotationRow}><strong>Period {index + 1}</strong><span>{period.map((player) => `${shortName(player.name)} (${player.primaryPosition})`).join(" · ")}</span><button style={action} onClick={() => loadPeriod(index)}>Load</button></div>)}</div></section></>}

      {mode === "Stats" && <><section style={statsGrid}><Metric label="Format" value={format.label} /><Metric label="Score" value={`${home}-${away}`} /><Metric label="Events" value={events.length.toString()} /><Metric label="Lowest mins" value={`${lowestMinutes}`} /></section><section style={glassPanel}><div style={sectionHeader}><h2 style={sectionTitle}>Player minutes</h2><div style={softPill}>Format aware</div></div><div style={minutesList}>{players.map((player) => <div key={player.id} style={minuteRow}><span><strong>{player.name}</strong><em>{positionLine(player)}</em></span><strong>{minutesMap[player.id] ?? 0}m</strong></div>)}</div></section><TimelinePanel events={events} onUndo={undoLastEvent} /><section style={glassPanel}><div style={sectionHeader}><h2 style={sectionTitle}>Match state</h2><button style={dangerAction} onClick={resetMatch}>Clear match</button></div><p style={paragraph}>Score, clock, period, live lineup and timeline are saved on this device.</p></section></>}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) { return <div style={metric}><span>{label}</span><strong>{value}</strong></div> }
function PlayerMini({ player, number }: { player: SquadStorePlayer; number: number }) { return <div style={playerMini}><span>{number}</span><strong>{shortName(player.name)}</strong><em>{player.primaryPosition}</em></div> }
function PlayerChip({ player, minutes }: { player: SquadStorePlayer; minutes: number }) { return <div style={playerChip}><div><strong>{player.name}</strong><em>{positionLine(player)}</em></div><b>{player.primaryPosition} · {minutes}m</b></div> }
function PlayerDot({ player, slot }: { player: SquadStorePlayer; slot?: { x: number; y: number; label: string } }) { const pos = slot ?? { x: 50, y: 50, label: player.primaryPosition }; return <div style={{ ...playerDot, left: `${pos.x}%`, top: `${pos.y}%` }}><small>{pos.label}</small><strong>{shortName(player.name)}</strong></div> }
function TimelinePanel({ events, onUndo }: { events: MatchEvent[]; onUndo: () => void }) { return <section style={glassPanel}><div style={sectionHeader}><h2 style={sectionTitle}>Match timeline</h2><button style={action} onClick={onUndo} disabled={events.length === 0}>Undo last</button></div><div style={timeline}>{events.length === 0 ? <div style={emptyState}>No match events yet.</div> : events.map((event) => <div key={event.id} style={eventRow}><span>{event.minute}' · P{event.quarter}</span><strong>{event.label}</strong><b>{event.score}</b></div>)}</div></section> }

const shell = { display: "grid", gap: 14, paddingBottom: 144, color: "white" }
const scoreboard = { borderRadius: 32, padding: 20, background: "radial-gradient(circle at top left, rgba(59,130,246,0.52), transparent 32%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.94))", border: "1px solid rgba(191,219,254,0.18)", boxShadow: "0 26px 60px rgba(0,0,0,0.35)", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }
const eyebrow = { fontSize: 11, letterSpacing: 1.1, fontWeight: 950, color: "rgba(191,219,254,0.86)" }
const title = { margin: "8px 0 4px", fontSize: 33, letterSpacing: -1.2, lineHeight: 1 }
const subtle = { color: "rgba(226,232,240,0.68)", fontSize: 13, fontWeight: 800, lineHeight: 1.35 }
const scoreBlock = { textAlign: "right" as const, minWidth: 86 }
const score = { fontSize: 48, lineHeight: 0.95, fontWeight: 980, letterSpacing: -2 }
const readyPill = { marginTop: 8, borderRadius: 999, padding: "7px 10px", background: "rgba(37,99,235,0.22)", color: "#bfdbfe", fontSize: 11, fontWeight: 950 }
const livePill = { ...readyPill, background: "rgba(22,163,74,0.24)", color: "#86efac" }
const modeBar = { position: "sticky" as const, top: 8, zIndex: 8, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 7, padding: 6, borderRadius: 22, background: "rgba(2,6,23,0.84)", border: "1px solid rgba(148,163,184,0.14)", backdropFilter: "blur(18px)" }
const modeButton = { border: "1px solid transparent", borderRadius: 16, padding: "11px 4px", background: "transparent", color: "rgba(226,232,240,0.72)", fontSize: 11, fontWeight: 950, cursor: "pointer" }
const activeModeButton = { ...modeButton, background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", border: "1px solid rgba(191,219,254,0.26)", boxShadow: "0 12px 26px rgba(37,99,235,0.24)" }
const controlDock = { borderRadius: 28, padding: 16, background: "rgba(2,6,23,0.86)", border: "1px solid rgba(148,163,184,0.16)", display: "grid", gap: 12, boxShadow: "0 20px 38px rgba(0,0,0,0.28)" }
const clockText = { fontSize: 54, fontWeight: 980, letterSpacing: -2, lineHeight: 1 }
const controlGrid = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }
const glassPanel = { borderRadius: 28, padding: 16, background: "rgba(15,23,42,0.82)", border: "1px solid rgba(148,163,184,0.13)", boxShadow: "0 18px 42px rgba(0,0,0,0.18)" }
const warningPanel = { ...glassPanel, background: "rgba(120,53,15,0.42)", color: "#fde68a", fontWeight: 950 }
const pitchCard = { ...glassPanel, padding: 14 }
const sectionHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }
const sectionTitle = { margin: 0, fontSize: 22, letterSpacing: -0.5 }
const smallTitle = { margin: "0 0 10px", fontSize: 16 }
const softPill = { borderRadius: 999, padding: "7px 10px", background: "rgba(37,99,235,0.18)", color: "#bfdbfe", fontSize: 11, fontWeight: 950, whiteSpace: "nowrap" as const }
const paragraph = { margin: "8px 0 0", color: "rgba(226,232,240,0.72)", lineHeight: 1.4 }
const compactPlayerRow = { display: "grid", gap: 8, marginTop: 14 }
const playerMini = { minWidth: 0, borderRadius: 18, padding: 10, background: "rgba(2,6,23,0.48)", border: "1px solid rgba(148,163,184,0.12)", display: "grid", gap: 4, textAlign: "center" as const, fontSize: 11 }
const coachAlertIcon = { width: 42, height: 42, borderRadius: 16, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#2563eb,#7c3aed)", fontSize: 24, float: "left" as const, marginRight: 12 }
const action = { border: "1px solid rgba(147,197,253,0.16)", borderRadius: 18, padding: 14, background: "rgba(15,23,42,0.74)", color: "white", fontWeight: 950, cursor: "pointer" }
const primaryAction = { ...action, background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 14px 28px rgba(37,99,235,0.24)" }
const goalAction = { ...action, background: "rgba(22,101,52,0.58)", border: "1px solid rgba(34,197,94,0.24)" }
const dangerAction = { ...action, background: "rgba(127,29,29,0.42)", border: "1px solid rgba(248,113,113,0.20)" }
const injuryAction = { ...action, background: "rgba(127,29,29,0.32)" }
const cardAction = { ...action, background: "rgba(120,53,15,0.42)", border: "1px solid rgba(251,191,36,0.22)" }
const pitch = { position: "relative" as const, height: 420, marginTop: 14, borderRadius: 28, overflow: "hidden", background: "repeating-linear-gradient(90deg, rgba(22,163,74,0.92) 0 52px, rgba(21,128,61,0.92) 52px 104px)", border: "2px solid rgba(255,255,255,0.24)" }
const halfway = { position: "absolute" as const, left: 0, right: 0, top: "50%", height: 2, background: "rgba(255,255,255,0.24)" }
const circle = { position: "absolute" as const, left: "50%", top: "50%", width: 102, height: 102, borderRadius: 999, border: "2px solid rgba(255,255,255,0.24)", transform: "translate(-50%,-50%)" }
const playerDot = { position: "absolute" as const, transform: "translate(-50%,-50%)", width: 86, minHeight: 64, borderRadius: 21, background: "linear-gradient(135deg,#2563eb,#7c3aed)", border: "1px solid rgba(255,255,255,0.30)", display: "grid", placeItems: "center", textAlign: "center" as const, padding: 7, boxShadow: "0 18px 32px rgba(0,0,0,0.32)", fontWeight: 950, fontSize: 11 }
const benchTray = { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginTop: 12 }
const playerChip = { borderRadius: 18, padding: 13, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(148,163,184,0.10)", fontWeight: 900, display: "grid", gap: 6 }
const liveActionGrid = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }
const subGrid = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginTop: 12 }
const subButton = { ...action, width: "100%", textAlign: "left" as const, display: "grid", gap: 4, marginBottom: 8 }
const activeSubButton = { ...subButton, background: "rgba(37,99,235,0.38)", border: "1px solid rgba(147,197,253,0.34)" }
const warningText = { color: "#fde68a", fontWeight: 950, margin: "10px 0" }
const goalPickerGrid = { display: "grid", gap: 8, marginTop: 12 }
const goalButton = { width: "100%", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 18, padding: 14, background: "rgba(5,46,22,0.46)", color: "white", fontWeight: 950, textAlign: "left" as const, cursor: "pointer", display: "grid", gap: 4 }
const quarterTabs = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 14 }
const quarterButton = { border: "1px solid rgba(148,163,184,0.14)", borderRadius: 18, padding: 12, background: "rgba(2,6,23,0.48)", color: "white", cursor: "pointer", fontWeight: 950, display: "grid", gap: 4 }
const activeQuarterButton = { ...quarterButton, background: "linear-gradient(135deg,rgba(37,99,235,0.48),rgba(124,58,237,0.36))", border: "1px solid rgba(147,197,253,0.28)" }
const quickControls = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 12 }
const summaryPills = { display: "flex", flexWrap: "wrap" as const, gap: 8, marginTop: 12 }
const rotationList = { display: "grid", gap: 8, marginTop: 12 }
const rotationRow = { borderRadius: 18, padding: 13, background: "rgba(2,6,23,0.44)", border: "1px solid rgba(148,163,184,0.10)", display: "grid", gap: 7, color: "rgba(226,232,240,0.76)", lineHeight: 1.35 }
const rotationRowActive = { ...rotationRow, border: "1px solid rgba(147,197,253,0.26)", background: "rgba(37,99,235,0.16)", color: "white" }
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }
const metric = { borderRadius: 20, padding: 12, background: "rgba(15,23,42,0.76)", border: "1px solid rgba(148,163,184,0.12)", display: "grid", gap: 5 }
const minutesList = { display: "grid", gap: 8, marginTop: 12 }
const minuteRow = { borderRadius: 18, padding: 13, background: "rgba(2,6,23,0.44)", border: "1px solid rgba(148,163,184,0.10)", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }
const timeline = { display: "grid", gap: 8, marginTop: 12 }
const emptyState = { borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.42)", border: "1px solid rgba(148,163,184,0.10)", color: "rgba(226,232,240,0.68)", fontWeight: 850 }
const eventRow = { ...emptyState, color: "white", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center" }
const formatGrid = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 12 }
const formatButton = { ...action, padding: "11px 8px" }
const activeFormatButton = { ...primaryAction, padding: "11px 8px" }
