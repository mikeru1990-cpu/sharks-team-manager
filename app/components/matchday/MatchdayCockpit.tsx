"use client"

import { useEffect, useMemo, useState } from "react"
import { isMainGoalkeeper, loadSquadPlayers, positionLine, type SquadStorePlayer } from "../../lib/squadStore"
import { getTeamFormat, loadTeamFormat, saveTeamFormat, teamFormats, type TeamFormatId } from "../../lib/teamFormat"

const storageKey = "football-os-matchday-state-v2"
const matchModes = ["Control", "Lineup", "Live", "Quarters", "Stats"] as const

type MatchMode = typeof matchModes[number]
type MatchEventType = "goal" | "opp-goal" | "sub" | "injury" | "card" | "note"
type MatchEvent = { id: number; minute: number; period: number; type: MatchEventType; label: string; score: string }
type SavedMatchState = {
  seconds: number
  home: number
  away: number
  activePeriod: number
  events: MatchEvent[]
  liveLineupIds: string[]
  actualSeconds: Record<string, number>
}

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

  return Array.from({ length: periods }, (_, index) => {
    const offset = (index * outfieldSlots) % Math.max(outfield.length, 1)
    const rotated = [...outfield.slice(offset), ...outfield.slice(0, offset)]
    return [goalkeeper, ...rotated].filter(Boolean).slice(0, playersOnPitch) as SquadStorePlayer[]
  })
}

function formatMinutes(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
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
  const [activePeriod, setActivePeriod] = useState(0)
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [liveLineupIds, setLiveLineupIds] = useState<string[]>([])
  const [actualSeconds, setActualSeconds] = useState<Record<string, number>>({})
  const [selectedGoalPlayer, setSelectedGoalPlayer] = useState(false)
  const [subModeOpen, setSubModeOpen] = useState(false)
  const [subOffId, setSubOffId] = useState<string | null>(null)
  const [subOnId, setSubOnId] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setPlayers(loadSquadPlayers())
    setTeamFormatId(loadTeamFormat())
    const refresh = () => setPlayers(loadSquadPlayers())
    const refreshFormat = () => setTeamFormatId(loadTeamFormat())
    window.addEventListener("focus", refresh)
    window.addEventListener("storage", refresh)
    window.addEventListener("football-os-team-format-change", refreshFormat)
    return () => {
      window.removeEventListener("focus", refresh)
      window.removeEventListener("storage", refresh)
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
        setActivePeriod(saved.activePeriod ?? 0)
        setEvents(Array.isArray(saved.events) ? saved.events : [])
        setLiveLineupIds(Array.isArray(saved.liveLineupIds) ? saved.liveLineupIds : [])
        setActualSeconds(saved.actualSeconds ?? {})
      }
    } catch {}
    setLoaded(true)
  }, [])

  const rotation = useMemo(() => buildRotation(players, format.playersOnPitch, format.defaultPeriods), [players, format.playersOnPitch, format.defaultPeriods])
  const safePeriod = Math.min(activePeriod, Math.max(rotation.length - 1, 0))
  const plannedStarters = rotation[safePeriod] ?? []

  useEffect(() => {
    const valid = new Set(players.map((player) => player.id))
    const cleaned = liveLineupIds.filter((id) => valid.has(id)).slice(0, format.playersOnPitch)
    if (cleaned.length !== liveLineupIds.length) setLiveLineupIds(cleaned)
    if (!cleaned.length && plannedStarters.length) setLiveLineupIds(plannedStarters.map((player) => player.id))
  }, [players, plannedStarters, format.playersOnPitch, liveLineupIds])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1)
      setActualSeconds((current) => {
        const next = { ...current }
        liveLineupIds.forEach((id) => { next[id] = (next[id] ?? 0) + 1 })
        return next
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running, liveLineupIds])

  useEffect(() => {
    if (!loaded) return
    const saved: SavedMatchState = { seconds, home, away, activePeriod: safePeriod, events, liveLineupIds, actualSeconds }
    window.localStorage.setItem(storageKey, JSON.stringify(saved))
  }, [loaded, seconds, home, away, safePeriod, events, liveLineupIds, actualSeconds])

  const starters = liveLineupIds.map((id) => players.find((player) => player.id === id)).filter(Boolean) as SquadStorePlayer[]
  const bench = availablePlayers(players).filter((player) => !liveLineupIds.includes(player.id))
  const goalkeeper = players.find(isMainGoalkeeper) ?? players.find((player) => player.primaryPosition === "GK")
  const hasGoalkeeper = starters.some((player) => isMainGoalkeeper(player) || player.primaryPosition === "GK")
  const hasEnoughPlayers = availablePlayers(players).length >= format.playersOnPitch
  const clock = formatMinutes(seconds)
  const minute = Math.max(1, Math.floor(seconds / 60))
  const matchState = seconds === 0 ? "READY" : running ? "LIVE" : "PAUSED"

  const plannedMinutes = useMemo(() => {
    const map: Record<string, number> = {}
    players.forEach((player) => { map[player.id] = 0 })
    rotation.forEach((period) => period.forEach((player) => {
      map[player.id] = (map[player.id] ?? 0) + format.defaultPeriodMinutes
    }))
    return map
  }, [players, rotation, format.defaultPeriodMinutes])

  const eligible = availablePlayers(players)
  const averageActualSeconds = eligible.length ? Math.round(eligible.reduce((sum, player) => sum + (actualSeconds[player.id] ?? 0), 0) / eligible.length) : 0
  const lowestActual = [...eligible].sort((a, b) => (actualSeconds[a.id] ?? 0) - (actualSeconds[b.id] ?? 0))[0]
  const highestActual = [...eligible].sort((a, b) => (actualSeconds[b.id] ?? 0) - (actualSeconds[a.id] ?? 0))[0]
  const recommendedOn = [...bench].sort((a, b) => (actualSeconds[a.id] ?? 0) - (actualSeconds[b.id] ?? 0))[0]
  const recommendedOff = [...starters].filter((player) => !(isMainGoalkeeper(player) || player.primaryPosition === "GK")).sort((a, b) => (actualSeconds[b.id] ?? 0) - (actualSeconds[a.id] ?? 0))[0]
  const fairnessGap = highestActual && lowestActual ? (actualSeconds[highestActual.id] ?? 0) - (actualSeconds[lowestActual.id] ?? 0) : 0

  const subOffPlayer = players.find((player) => player.id === subOffId)
  const subOnPlayer = players.find((player) => player.id === subOnId)
  const subWarning = !!subOffPlayer && !!subOnPlayer && (isMainGoalkeeper(subOffPlayer) || subOffPlayer.primaryPosition === "GK") && !(isMainGoalkeeper(subOnPlayer) || subOnPlayer.primaryPosition === "GK")

  function addEvent(type: MatchEventType, label: string, score = `${home}-${away}`) {
    setEvents((current) => [{ id: Date.now(), minute, period: safePeriod + 1, type, label, score }, ...current])
  }

  function changeFormat(id: TeamFormatId) {
    saveTeamFormat(id)
    setTeamFormatId(id)
    setActivePeriod(0)
    setLiveLineupIds([])
  }

  function scoreGoal(playerId: string) {
    const player = players.find((item) => item.id === playerId)
    if (!player) return
    const next = home + 1
    setHome(next)
    addEvent("goal", `Goal · ${shortName(player.name)}`, `${next}-${away}`)
    setSelectedGoalPlayer(false)
  }

  function oppositionGoal() {
    const next = away + 1
    setAway(next)
    addEvent("opp-goal", "Opposition goal", `${home}-${next}`)
  }

  function confirmSubstitution() {
    if (!subOffPlayer || !subOnPlayer) return
    setLiveLineupIds((current) => current.map((id) => id === subOffPlayer.id ? subOnPlayer.id : id))
    addEvent("sub", `Sub · ${shortName(subOffPlayer.name)} off, ${shortName(subOnPlayer.name)} on`)
    setSubOffId(null)
    setSubOnId(null)
    setSubModeOpen(false)
  }

  function useRecommendation() {
    if (!recommendedOff || !recommendedOn) return
    setSubOffId(recommendedOff.id)
    setSubOnId(recommendedOn.id)
    setSubModeOpen(true)
    setMode("Live")
  }

  function loadPeriod(index: number) {
    setActivePeriod(index)
    setLiveLineupIds((rotation[index] ?? []).map((player) => player.id))
  }

  function undoLastEvent() {
    const last = events[0]
    if (!last) return
    if (last.type === "goal") setHome((value) => Math.max(0, value - 1))
    if (last.type === "opp-goal") setAway((value) => Math.max(0, value - 1))
    setEvents((current) => current.slice(1))
  }

  function resetMatch() {
    setRunning(false)
    setSeconds(0)
    setHome(0)
    setAway(0)
    setActivePeriod(0)
    setEvents([])
    setLiveLineupIds([])
    setActualSeconds({})
    setSelectedGoalPlayer(false)
    setSubModeOpen(false)
    setSubOffId(null)
    setSubOnId(null)
    setMode("Control")
    window.localStorage.removeItem(storageKey)
  }

  return (
    <div style={shell}>
      <section style={hero}>
        <div><div style={eyebrow}>FOOTBALL OS / MATCHDAY</div><h1 style={title}>Leonard Stanley U11</h1><p style={muted}>{format.label} · {format.defaultFormation} · live actual minutes</p></div>
        <div style={{ textAlign: "right" }}><div style={score}>{home}–{away}</div><span style={running ? livePill : pill}>{matchState}</span></div>
      </section>

      <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>Team format</h2><span style={pill}>{format.defaultFormation}</span></div><div style={formatGrid}>{Object.keys(teamFormats).map((id) => <button key={id} onClick={() => changeFormat(id as TeamFormatId)} style={teamFormatId === id ? primaryButton : button}>{id}</button>)}</div></section>
      <nav style={modeBar}>{matchModes.map((item) => <button key={item} onClick={() => setMode(item)} style={mode === item ? activeMode : modeButton}>{item}</button>)}</nav>

      {mode === "Control" && <>
        <section style={panel}><div style={sectionHeader}><div><div style={eyebrow}>P{safePeriod + 1} · MATCH CLOCK</div><div style={clockText}>{clock}</div></div><div style={{ textAlign: "right" }}><small>ON PITCH</small><div style={{ fontSize: 28, fontWeight: 950 }}>{starters.length}/{format.playersOnPitch}</div></div></div><div style={threeGrid}><button style={primaryButton} onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</button><button style={goalButton} onClick={() => { setSelectedGoalPlayer(true); setMode("Live") }}>Goal +</button><button style={dangerButton} onClick={oppositionGoal}>Opp Goal</button></div></section>
        {!hasEnoughPlayers && <section style={warning}>Not enough available players for {format.label}.</section>}
        {!hasGoalkeeper && <section style={warning}>No goalkeeper is currently on the pitch.</section>}
        <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>Live fairness</h2><span style={pill}>{formatMinutes(fairnessGap)} gap</span></div><p style={muted}>{lowestActual ? `${shortName(lowestActual.name)} has the lowest actual time at ${formatMinutes(actualSeconds[lowestActual.id] ?? 0)}.` : "Start the clock to track live minutes."}</p>{recommendedOn && recommendedOff && <button style={primaryButton} onClick={useRecommendation}>Recommend: {shortName(recommendedOff.name)} off → {shortName(recommendedOn.name)} on</button>}</section>
        <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>On pitch</h2><span style={pill}>Actual minutes</span></div><div style={playerGrid}>{starters.map((player) => <PlayerCard key={player.id} player={player} seconds={actualSeconds[player.id] ?? 0} />)}</div></section>
      </>}

      {mode === "Lineup" && <>
        <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>{format.label} · {format.defaultFormation}</h2><span style={pill}>{format.playersOnPitch} players</span></div><div style={pitch}><div style={halfway} /><div style={circle} />{starters.map((player, index) => <PlayerDot key={player.id} player={player} slot={format.pitchSlots[index]} seconds={actualSeconds[player.id] ?? 0} />)}</div></section>
        <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>Bench</h2><span style={pill}>{bench.length}</span></div><div style={playerGrid}>{bench.map((player) => <PlayerCard key={player.id} player={player} seconds={actualSeconds[player.id] ?? 0} />)}</div></section>
      </>}

      {mode === "Live" && <>
        <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>Live actions</h2><span style={pill}>P{safePeriod + 1} · {clock}</span></div><div style={threeGrid}><button style={primaryButton} onClick={() => setSubModeOpen(!subModeOpen)}>Substitution</button><button style={goalButton} onClick={() => setSelectedGoalPlayer(!selectedGoalPlayer)}>Goal</button><button style={dangerButton} onClick={oppositionGoal}>Opp Goal</button><button style={button} onClick={() => addEvent("injury", "Injury note")}>Injury</button><button style={button} onClick={() => addEvent("card", "Card recorded")}>Card</button><button style={button} onClick={() => addEvent("note", "Coach note")}>Note</button></div></section>
        {subModeOpen && <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>Make substitution</h2><span style={pill}>Off → On</span></div><div style={twoGrid}><div><h3>Player off</h3>{starters.map((player) => <button key={player.id} onClick={() => setSubOffId(player.id)} style={subOffId === player.id ? selectedButton : listButton}><strong>{player.name}</strong><span>{formatMinutes(actualSeconds[player.id] ?? 0)} · {positionLine(player)}</span></button>)}</div><div><h3>Player on</h3>{bench.map((player) => <button key={player.id} onClick={() => setSubOnId(player.id)} style={subOnId === player.id ? selectedButton : listButton}><strong>{player.name}</strong><span>{formatMinutes(actualSeconds[player.id] ?? 0)} · {positionLine(player)}</span></button>)}</div></div>{subWarning && <p style={warningText}>This removes the goalkeeper without another goalkeeper coming on.</p>}<button disabled={!subOffId || !subOnId} style={primaryButton} onClick={confirmSubstitution}>Confirm substitution</button></section>}
        {selectedGoalPlayer && <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>Who scored?</h2><button style={button} onClick={() => setSelectedGoalPlayer(false)}>Close</button></div><div style={playerGrid}>{starters.map((player) => <button key={player.id} style={goalChoice} onClick={() => scoreGoal(player.id)}>⚽ <strong>{player.name}</strong><span>{positionLine(player)}</span></button>)}</div></section>}
        <Timeline events={events} onUndo={undoLastEvent} />
      </>}

      {mode === "Quarters" && <>
        <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>Rotation planner</h2><span style={pill}>{format.defaultPeriodMinutes}m blocks</span></div><div style={periodGrid}>{rotation.map((period, index) => <button key={index} style={safePeriod === index ? primaryButton : button} onClick={() => loadPeriod(index)}>P{index + 1}<small>{period.length} on</small></button>)}</div></section>
        <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>Period plans</h2><span style={pill}>{format.label}</span></div><div style={list}>{rotation.map((period, index) => <div key={index} style={row}><strong>P{index + 1}</strong><span>{period.map((player) => `${shortName(player.name)} (${player.primaryPosition})`).join(" · ")}</span><button style={button} onClick={() => loadPeriod(index)}>Load</button></div>)}</div></section>
      </>}

      {mode === "Stats" && <>
        <section style={statsGrid}><Metric label="Format" value={format.label} /><Metric label="Score" value={`${home}-${away}`} /><Metric label="Average actual" value={formatMinutes(averageActualSeconds)} /><Metric label="Fairness gap" value={formatMinutes(fairnessGap)} /></section>
        <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>Actual vs planned</h2><span style={pill}>Live tracking</span></div><div style={list}>{players.map((player) => { const actual = actualSeconds[player.id] ?? 0; const planned = (plannedMinutes[player.id] ?? 0) * 60; const behind = actual < averageActualSeconds - 120; return <div key={player.id} style={behind ? alertRow : row}><div><strong>{player.name}</strong><small>{positionLine(player)}{behind ? " · behind average" : ""}</small></div><div style={{ textAlign: "right" }}><strong>{formatMinutes(actual)}</strong><small>planned {formatMinutes(planned)}</small></div></div> })}</div></section>
        <Timeline events={events} onUndo={undoLastEvent} />
        <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>Match state</h2><button style={dangerButton} onClick={resetMatch}>Clear match</button></div><p style={muted}>Clock, score, live lineup, events and actual player minutes are saved on this device.</p></section>
      </>}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div style={panel}><small>{label}</small><strong style={{ fontSize: 24 }}>{value}</strong></div>
}

function PlayerCard({ player, seconds }: { player: SquadStorePlayer; seconds: number }) {
  return <div style={playerCard}><strong>{shortName(player.name)}</strong><span>{player.primaryPosition}</span><b>{formatMinutes(seconds)}</b></div>
}

function PlayerDot({ player, slot, seconds }: { player: SquadStorePlayer; slot?: { x: number; y: number; label: string }; seconds: number }) {
  const position = slot ?? { x: 50, y: 50, label: player.primaryPosition }
  return <div style={{ ...playerDot, left: `${position.x}%`, top: `${position.y}%` }}><small>{position.label}</small><strong>{shortName(player.name)}</strong><span>{formatMinutes(seconds)}</span></div>
}

function Timeline({ events, onUndo }: { events: MatchEvent[]; onUndo: () => void }) {
  return <section style={panel}><div style={sectionHeader}><h2 style={sectionTitle}>Timeline</h2><button style={button} disabled={!events.length} onClick={onUndo}>Undo last</button></div><div style={list}>{events.length ? events.map((event) => <div key={event.id} style={row}><span>{event.minute}' · P{event.period}</span><strong>{event.label}</strong><b>{event.score}</b></div>) : <p style={muted}>No events yet.</p>}</div></section>
}

const shell = { display: "grid", gap: 14, paddingBottom: 140, color: "white" }
const hero = { borderRadius: 30, padding: 20, background: "radial-gradient(circle at top left,rgba(59,130,246,.55),transparent 34%),linear-gradient(135deg,#0f172a,#1e293b)", border: "1px solid rgba(191,219,254,.18)", display: "flex", justifyContent: "space-between", gap: 16 }
const panel = { borderRadius: 24, padding: 16, background: "rgba(15,23,42,.88)", border: "1px solid rgba(148,163,184,.14)", display: "grid", gap: 12 }
const eyebrow = { fontSize: 11, fontWeight: 950, letterSpacing: 1, color: "#bfdbfe" }
const title = { margin: "7px 0 0", fontSize: 32, letterSpacing: -1 }
const muted = { margin: "5px 0 0", color: "rgba(226,232,240,.68)", lineHeight: 1.4 }
const score = { fontSize: 46, fontWeight: 950, letterSpacing: -2 }
const pill = { borderRadius: 999, padding: "7px 10px", background: "rgba(37,99,235,.2)", color: "#bfdbfe", fontSize: 11, fontWeight: 950, display: "inline-block" }
const livePill = { ...pill, background: "rgba(22,163,74,.28)", color: "#86efac" }
const modeBar = { position: "sticky" as const, top: 8, zIndex: 10, display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, padding: 6, borderRadius: 20, background: "rgba(2,6,23,.86)", backdropFilter: "blur(16px)" }
const modeButton = { border: 0, borderRadius: 14, padding: "11px 3px", background: "transparent", color: "rgba(226,232,240,.72)", fontSize: 11, fontWeight: 950 }
const activeMode = { ...modeButton, color: "white", background: "linear-gradient(135deg,#2563eb,#7c3aed)" }
const sectionHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }
const sectionTitle = { margin: 0, fontSize: 21, letterSpacing: -.4 }
const clockText = { fontSize: 54, fontWeight: 950, letterSpacing: -2 }
const button = { border: "1px solid rgba(147,197,253,.16)", borderRadius: 16, padding: 12, background: "rgba(2,6,23,.48)", color: "white", fontWeight: 900, cursor: "pointer" }
const primaryButton = { ...button, background: "linear-gradient(135deg,#2563eb,#7c3aed)" }
const goalButton = { ...button, background: "rgba(22,101,52,.55)" }
const dangerButton = { ...button, background: "rgba(127,29,29,.5)" }
const threeGrid = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }
const twoGrid = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 }
const formatGrid = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }
const periodGrid = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }
const playerGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 8 }
const playerCard = { borderRadius: 17, padding: 12, background: "rgba(2,6,23,.45)", border: "1px solid rgba(148,163,184,.1)", display: "grid", gap: 4 }
const pitch = { position: "relative" as const, height: 430, borderRadius: 26, overflow: "hidden", background: "repeating-linear-gradient(90deg,rgba(22,163,74,.94) 0 52px,rgba(21,128,61,.94) 52px 104px)", border: "2px solid rgba(255,255,255,.24)" }
const halfway = { position: "absolute" as const, left: 0, right: 0, top: "50%", height: 2, background: "rgba(255,255,255,.25)" }
const circle = { position: "absolute" as const, left: "50%", top: "50%", width: 100, height: 100, borderRadius: 999, border: "2px solid rgba(255,255,255,.25)", transform: "translate(-50%,-50%)" }
const playerDot = { position: "absolute" as const, transform: "translate(-50%,-50%)", width: 84, minHeight: 65, borderRadius: 20, padding: 7, display: "grid", placeItems: "center", textAlign: "center" as const, background: "linear-gradient(135deg,#2563eb,#7c3aed)", border: "1px solid rgba(255,255,255,.3)", boxShadow: "0 16px 30px rgba(0,0,0,.3)", fontSize: 11 }
const list = { display: "grid", gap: 8 }
const row = { borderRadius: 16, padding: 12, background: "rgba(2,6,23,.45)", border: "1px solid rgba(148,163,184,.1)", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }
const alertRow = { ...row, border: "1px solid rgba(251,191,36,.34)", background: "rgba(120,53,15,.28)" }
const listButton = { ...button, width: "100%", textAlign: "left" as const, display: "grid", gap: 4, marginBottom: 8 }
const selectedButton = { ...listButton, background: "rgba(37,99,235,.38)", border: "1px solid rgba(147,197,253,.34)" }
const goalChoice = { ...button, textAlign: "left" as const, display: "grid", gap: 4, background: "rgba(5,46,22,.5)" }
const warning = { ...panel, background: "rgba(120,53,15,.4)", color: "#fde68a", fontWeight: 950 }
const warningText = { color: "#fde68a", fontWeight: 950 }
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }
