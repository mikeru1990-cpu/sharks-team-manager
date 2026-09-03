"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import TeamScopeBanner from "../layout/TeamScopeBanner"
import { getActiveU11Players } from "../../lib/realTeamData"
import {
  getTeamFormat,
  loadTeamFormat,
  saveTeamFormat,
  teamFormats,
  type PitchSlot,
  type TeamFormatId,
} from "../../lib/teamFormat"

const players = getActiveU11Players()
const tabs = ["Setup", "Squad", "Lineup", "Planner", "Live", "Report"] as const
const key = "football-os-matchday-workflow-v6"
const historyKey = "football-os-match-history-v1"

type Tab = (typeof tabs)[number]
type EventType = "goal" | "sub" | "opp-goal" | "period"
type TimelineEvent = {
  id: number
  minute: number
  type: EventType
  label: string
  scorerId?: string
  offId?: string
  onId?: string
}
type Minutes = Record<string, number>
type Positions = Record<string, string>
type Snapshot = {
  home: number
  away: number
  live: string[]
  positions: Positions
  timeline: TimelineEvent[]
}

function spread(count: number) {
  if (count <= 1) return [50]
  const edge = count >= 4 ? 14 : count === 3 ? 20 : 31
  const width = 100 - edge * 2
  return Array.from({ length: count }, (_, index) => edge + (width * index) / (count - 1))
}

function formationLayout(formation: string): PitchSlot[] {
  const lines = formation
    .split("-")
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0)

  const total = lines.length
  const yPositions =
    total === 4 ? [72, 55, 37, 18] : total === 3 ? [68, 45, 19] : total === 2 ? [64, 24] : [45]

  const slots: PitchSlot[] = [{ key: "GK", label: "GK", x: 50, y: 89 }]

  lines.forEach((count, lineIndex) => {
    const xs = spread(count)
    const prefix = lineIndex === 0 ? "D" : lineIndex === total - 1 ? "F" : total === 4 && lineIndex === 1 ? "DM" : total === 4 && lineIndex === 2 ? "AM" : "M"
    xs.forEach((x, playerIndex) => {
      slots.push({
        key: `${prefix}${playerIndex + 1}`,
        label: count === 1 ? prefix : `${prefix}${playerIndex + 1}`,
        x,
        y: yPositions[lineIndex] ?? 45,
      })
    })
  })

  return slots
}

function firstName(id: string) {
  const player = players.find((item) => item.id === id)
  return player?.knownAs ?? player?.name.split(" ")[0] ?? "Player"
}

function playerName(id: string) {
  return players.find((item) => item.id === id)?.name ?? "Player"
}

export default function MatchCentreWorkflow() {
  const [active, setActive] = useState<Tab>("Setup")
  const [format, setFormat] = useState<TeamFormatId>("7v7")
  const [selected, setSelected] = useState<string[]>(players.map((player) => player.id))
  const [starters, setStarters] = useState<string[]>(players.slice(0, 7).map((player) => player.id))
  const [live, setLive] = useState<string[]>([])
  const [formation, setFormation] = useState<string>(teamFormats["7v7"].defaultFormation)
  const [positions, setPositions] = useState<Positions>({})
  const [minutes, setMinutes] = useState<Minutes>({})
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [undo, setUndo] = useState<Snapshot | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [period, setPeriod] = useState(0)
  const [home, setHome] = useState(0)
  const [away, setAway] = useState(0)
  const [finished, setFinished] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const config = getTeamFormat(format)
  const required = config.playersOnPitch
  const layout = useMemo(() => formationLayout(formation), [formation])
  const minute = Math.floor(seconds / 60)
  const clock = useMemo(
    () => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`,
    [seconds],
  )
  const bench = selected.filter((id) => !live.includes(id))
  const least = bench.slice().sort((a, b) => (minutes[a] ?? 0) - (minutes[b] ?? 0))[0]
  const most = live
    .filter((id) => positions[id] !== "GK")
    .slice()
    .sort((a, b) => (minutes[b] ?? 0) - (minutes[a] ?? 0))[0]
  const matchUnderway = period > 0 && !finished
  const lineupReady = starters.length === required

  useEffect(() => {
    try {
      const savedFormat = loadTeamFormat()
      const savedConfig = getTeamFormat(savedFormat)
      const raw = localStorage.getItem(key)
      const saved = raw ? JSON.parse(raw) : null

      setFormat(savedFormat)
      setSelected(saved?.selected ?? players.map((player) => player.id))

      const savedSelected: string[] = saved?.selected ?? players.map((player) => player.id)
      const validStarters: string[] = (saved?.starters ?? []).filter((id: string) => savedSelected.includes(id))
      const fitted = [...validStarters]
      for (const id of savedSelected) {
        if (fitted.length >= savedConfig.playersOnPitch) break
        if (!fitted.includes(id)) fitted.push(id)
      }
      setStarters(fitted.slice(0, savedConfig.playersOnPitch))

      const savedFormation = typeof saved?.formation === "string" && savedConfig.formations.includes(saved.formation)
        ? saved.formation
        : savedConfig.defaultFormation
      setFormation(savedFormation)
      setLive(saved?.live ?? [])
      setPositions(saved?.positions ?? {})
      setMinutes(saved?.minutes ?? {})
      setTimeline(saved?.timeline ?? [])
      setSeconds(saved?.seconds ?? 0)
      setPeriod(saved?.period ?? 0)
      setHome(saved?.home ?? 0)
      setAway(saved?.away ?? 0)
      setFinished(saved?.finished ?? false)
    } catch {
      const fallback = getTeamFormat("7v7")
      setFormat("7v7")
      setFormation(fallback.defaultFormation)
      setStarters(players.slice(0, fallback.playersOnPitch).map((player) => player.id))
    }
    setLoaded(true)
  }, [])

  useEffect(() => {
    if (!loaded) return
    localStorage.setItem(
      key,
      JSON.stringify({ format, selected, starters, live, formation, positions, minutes, timeline, seconds, period, home, away, finished }),
    )
  }, [loaded, format, selected, starters, live, formation, positions, minutes, timeline, seconds, period, home, away, finished])

  useEffect(() => {
    if (!running || finished) return
    const timer = window.setInterval(() => {
      setSeconds((value) => value + 1)
      setMinutes((current) => {
        const next = { ...current }
        live.forEach((id) => {
          next[id] = (next[id] ?? 0) + 1
        })
        return next
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [running, finished, live])

  function snapshot() {
    setUndo({ home, away, live: [...live], positions: { ...positions }, timeline: [...timeline] })
  }

  function makeEvent(type: EventType, label: string, extra: Partial<TimelineEvent> = {}, forcedMinute = minute): TimelineEvent {
    return {
      id: Date.now(),
      minute: forcedMinute,
      type,
      label: `${forcedMinute}' ${label}`,
      ...extra,
    }
  }

  function event(type: EventType, label: string, extra: Partial<TimelineEvent> = {}) {
    const next = makeEvent(type, label, extra)
    setTimeline((current) => [next, ...current])
  }

  function handleFormatChange(nextFormat: TeamFormatId) {
    if (matchUnderway) return
    const nextConfig = getTeamFormat(nextFormat)
    const fitted = starters.filter((id) => selected.includes(id))
    for (const id of selected) {
      if (fitted.length >= nextConfig.playersOnPitch) break
      if (!fitted.includes(id)) fitted.push(id)
    }

    setFormat(nextFormat)
    saveTeamFormat(nextFormat)
    setFormation(nextConfig.defaultFormation)
    setStarters(fitted.slice(0, nextConfig.playersOnPitch))
    setLive([])
    setPositions({})
  }

  function toggleSelected(id: string) {
    const removing = selected.includes(id)
    setSelected((current) => (removing ? current.filter((item) => item !== id) : [...current, id]))
    if (removing) setStarters((current) => current.filter((item) => item !== id))
  }

  function toggleStarter(id: string) {
    if (!selected.includes(id)) return
    setStarters((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= required
          ? current
          : [...current, id],
    )
  }

  function assign(ids: string[], nextFormation = formation) {
    const slots = formationLayout(nextFormation)
    const next: Positions = {}
    slots.forEach((slot, index) => {
      if (ids[index]) next[ids[index]] = slot.key
    })
    setPositions(next)
  }

  function swap(a: string, b: string) {
    snapshot()
    setPositions((current) => ({ ...current, [a]: current[b], [b]: current[a] }))
  }

  function kickoff() {
    if (!lineupReady || matchUnderway) return
    const kickoffEvent = makeEvent("period", `Kick off · ${format} · ${formation}`, {}, 0)
    setLive([...starters])
    assign(starters)
    setPeriod(1)
    setFinished(false)
    setHome(0)
    setAway(0)
    setSeconds(0)
    setMinutes({})
    setTimeline([kickoffEvent])
    setUndo(null)
    setActive("Live")
    setRunning(true)
  }

  function sub(offId: string, onId: string) {
    snapshot()
    const pos = positions[offId]
    setLive((current) => current.map((id) => (id === offId ? onId : id)))
    setPositions((current) => {
      const next = { ...current }
      delete next[offId]
      if (pos) next[onId] = pos
      return next
    })
    event("sub", `${playerName(offId)} → ${playerName(onId)}`, { offId, onId })
  }

  function goal(scorerId: string) {
    snapshot()
    setHome((value) => value + 1)
    event("goal", `GOAL · ${playerName(scorerId)}`, { scorerId })
  }

  function oppGoal() {
    snapshot()
    setAway((value) => value + 1)
    event("opp-goal", "Opposition goal")
  }

  function undoLast() {
    if (!undo) return
    setHome(undo.home)
    setAway(undo.away)
    setLive(undo.live)
    setPositions(undo.positions)
    setTimeline(undo.timeline)
    setUndo(null)
  }

  function halfTime() {
    setRunning(false)
    setPeriod(2)
    event("period", "Half time")
  }

  function secondHalf() {
    setPeriod(2)
    setRunning(true)
    event("period", "Second half started")
  }

  function fullTime() {
    setRunning(false)
    setFinished(true)
    setPeriod(3)
    const fullTimeEvent = makeEvent("period", `FULL TIME · ${home}-${away}`)
    const finalTimeline = [fullTimeEvent, ...timeline]
    setTimeline(finalTimeline)
    try {
      const old = JSON.parse(localStorage.getItem(historyKey) ?? "[]")
      localStorage.setItem(
        historyKey,
        JSON.stringify(
          [
            {
              id: Date.now(),
              date: new Date().toISOString(),
              format,
              home,
              away,
              seconds,
              formation,
              selected,
              starters,
              minutes,
              timeline: finalTimeline,
            },
            ...old,
          ].slice(0, 100),
        ),
      )
    } catch {}
    setActive("Report")
  }

  function changeFormation(nextFormation: string) {
    if (!config.formations.includes(nextFormation)) return
    snapshot()
    setFormation(nextFormation)
    assign(live.length === required ? live : starters, nextFormation)
  }

  return (
    <div style={{ display: "grid", gap: 14, paddingBottom: 150, color: "white" }}>
      <TeamScopeBanner
        section="Match Centre"
        detail="One match workflow powered by the shared 5v5, 7v7, 9v9 and 11v11 team-format engine."
      />

      <section style={hero}>
        <div>
          <small>{finished ? "FULL TIME" : period === 2 ? "SECOND HALF" : period === 1 ? "FIRST HALF" : "PRE-MATCH"}</small>
          <h2 style={{ margin: "4px 0" }}>{running ? "LIVE" : finished ? "COMPLETE" : seconds ? "PAUSED" : "READY"}</h2>
          <b>{clock}</b>
        </div>
        <div style={{ textAlign: "right" }}>
          <strong style={{ fontSize: 34 }}>{home}-{away}</strong>
          <small style={{ display: "block" }}>LEONARD STANLEY · {format}</small>
        </div>
      </section>

      <div style={tabsStyle}>
        {tabs.map((tabName) => (
          <button key={tabName} onClick={() => setActive(tabName)} style={active === tabName ? tabOn : tab}>
            {tabName}
          </button>
        ))}
      </div>

      {active === "Setup" && (
        <section style={panel}>
          <div style={sectionHead}>
            <div>
              <small style={eyebrow}>MATCH FORMAT</small>
              <h2 style={{ margin: "3px 0 0" }}>Match setup</h2>
            </div>
            <strong>{required} on pitch</strong>
          </div>
          <FormatPicker value={format} change={handleFormatChange} disabled={matchUnderway} />
          <div style={summaryStrip}>
            <span>{config.label}</span>
            <span>{formation}</span>
            <span>{starters.length}/{required} starters</span>
          </div>
          <FormationPicker formations={config.formations} value={formation} change={changeFormation} />
          <button style={primary} disabled={!lineupReady || matchUnderway} onClick={kickoff}>
            {matchUnderway ? "Match already in progress" : lineupReady ? `Kick off ${format}` : `Select ${required - starters.length} more starter${required - starters.length === 1 ? "" : "s"}`}
          </button>
        </section>
      )}

      {active === "Squad" && (
        <section style={panel}>
          <div style={sectionHead}>
            <h2 style={{ margin: 0 }}>Squad selection</h2>
            <strong>{selected.length} available</strong>
          </div>
          {players.map((player) => (
            <button
              key={player.id}
              onClick={() => toggleSelected(player.id)}
              style={{ ...row, background: selected.includes(player.id) ? "rgba(37,99,235,.2)" : "rgba(2,6,23,.48)" }}
            >
              {selected.includes(player.id) ? "✓ SELECTED" : "+ ADD"} · {player.knownAs ?? player.name}
            </button>
          ))}
        </section>
      )}

      {active === "Lineup" && (
        <section style={panel}>
          <div style={sectionHead}>
            <div>
              <small style={eyebrow}>{format} · {formation}</small>
              <h2 style={{ margin: "3px 0 0" }}>Starting lineup</h2>
            </div>
            <strong>{starters.length}/{required}</strong>
          </div>
          <FormationPicker formations={config.formations} value={formation} change={changeFormation} />
          <p style={hint}>Choose the starters, apply the formation, then tap two players on the pitch to swap their roles.</p>
          {players.filter((player) => selected.includes(player.id)).map((player) => (
            <button
              key={player.id}
              onClick={() => toggleStarter(player.id)}
              style={{ ...row, background: starters.includes(player.id) ? "rgba(16,185,129,.22)" : "rgba(2,6,23,.48)" }}
            >
              {starters.includes(player.id) ? "STARTING" : "BENCH"} · {player.knownAs ?? player.name}
            </button>
          ))}
          {lineupReady && (
            <>
              <button style={action} onClick={() => assign(starters)}>Apply {formation}</button>
              <Pitch ids={starters} positions={positions} minutes={minutes} swap={swap} layout={layout} expected={required} />
            </>
          )}
          <button style={primary} disabled={!lineupReady || matchUnderway} onClick={kickoff}>
            {lineupReady ? "Save lineup & kick off" : `Need ${required} starters`}
          </button>
        </section>
      )}

      {active === "Planner" && (
        <section style={panel}>
          <div style={sectionHead}>
            <div>
              <small style={eyebrow}>{format}</small>
              <h2 style={{ margin: "3px 0 0" }}>{formation} tactical shape</h2>
            </div>
            <strong>{required} players</strong>
          </div>
          <FormationPicker formations={config.formations} value={formation} change={changeFormation} />
          <Pitch ids={live.length === required ? live : starters} positions={positions} minutes={minutes} swap={swap} layout={layout} expected={required} />
        </section>
      )}

      {active === "Live" && (
        <Live
          clock={clock}
          running={running}
          setRunning={setRunning}
          home={home}
          away={away}
          live={live}
          bench={bench}
          sub={sub}
          goal={goal}
          oppGoal={oppGoal}
          positions={positions}
          minutes={minutes}
          formation={formation}
          formations={config.formations}
          format={format}
          expected={required}
          layout={layout}
          changeFormation={changeFormation}
          swap={swap}
          undoLast={undoLast}
          canUndo={!!undo}
          least={least}
          most={most}
          period={period}
          halfTime={halfTime}
          secondHalf={secondHalf}
          fullTime={fullTime}
        />
      )}

      {active === "Report" && (
        <section style={panel}>
          <div style={sectionHead}>
            <div>
              <small style={eyebrow}>{format} · {formation}</small>
              <h2 style={{ margin: "3px 0 0" }}>{finished ? "Full-time report" : "Match report"}</h2>
            </div>
            <strong style={{ fontSize: 30 }}>{home}-{away}</strong>
          </div>
          <p style={hint}>{clock} · {timeline.filter((item) => item.type === "goal").length} goals recorded</p>
          {selected
            .slice()
            .sort((a, b) => (minutes[b] ?? 0) - (minutes[a] ?? 0))
            .map((id) => (
              <div key={id} style={playerRow}>
                <strong>{playerName(id)}</strong>
                <em>{Math.floor((minutes[id] ?? 0) / 60)} min</em>
              </div>
            ))}
          <h3>Timeline</h3>
          {timeline.map((item) => <div key={item.id} style={eventStyle}>{item.label}</div>)}
        </section>
      )}
    </div>
  )
}

function FormatPicker({ value, change, disabled }: { value: TeamFormatId; change: (format: TeamFormatId) => void; disabled?: boolean }) {
  return (
    <div style={four}>
      {(Object.keys(teamFormats) as TeamFormatId[]).map((format) => (
        <button key={format} disabled={disabled} onClick={() => change(format)} style={value === format ? primary : action}>
          {format}
        </button>
      ))}
    </div>
  )
}

function FormationPicker({ formations, value, change }: { formations: string[]; value: string; change: (formation: string) => void }) {
  return (
    <div style={formationGrid}>
      {formations.map((formation) => (
        <button key={formation} onClick={() => change(formation)} style={value === formation ? primary : action}>
          {formation}
        </button>
      ))}
    </div>
  )
}

function Pitch({
  ids,
  positions,
  minutes,
  swap,
  layout,
  expected,
}: {
  ids: string[]
  positions: Positions
  minutes: Minutes
  swap: (a: string, b: string) => void
  layout: PitchSlot[]
  expected: number
}) {
  const [picked, setPicked] = useState("")
  const spots = Object.fromEntries(layout.map((slot) => [slot.key, slot])) as Record<string, PitchSlot>

  return (
    <div>
      <div style={pitchHelp}>
        {picked ? `Selected ${playerName(picked)}. Tap another player to swap.` : "Tap a player, then another player to swap positions."}
      </div>
      <div style={pitch}>
        <i style={halfwayLine} />
        <i style={centreCircle} />
        <i style={topBox} />
        <i style={bottomBox} />
        {ids.map((id, index) => {
          const fallback = { x: 28 + (index % 3) * 22, y: 25 + Math.floor(index / 3) * 24, key: "", label: "SET" }
          const spot = spots[positions[id]] ?? fallback
          return (
            <button
              type="button"
              aria-pressed={picked === id}
              key={id}
              onClick={() => {
                if (!picked) return setPicked(id)
                if (picked === id) return setPicked("")
                swap(picked, id)
                setPicked("")
              }}
              style={{
                ...token,
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                background: picked === id ? "linear-gradient(145deg,#f59e0b,#d97706)" : "linear-gradient(145deg,#2563eb,#7c3aed)",
                outline: picked === id ? "3px solid rgba(253,230,138,.72)" : "none",
              }}
            >
              <small>{spot.label}</small>
              <strong>{firstName(id)}</strong>
              <span>{Math.floor((minutes[id] ?? 0) / 60)}m</span>
            </button>
          )
        })}
      </div>
      <div style={pitchFooter}>
        <span>{ids.length}/{expected} on pitch</span>
        <span>{ids.every((id) => positions[id]) ? "Shape ready" : "Apply formation"}</span>
        <span>Tap-to-swap</span>
      </div>
    </div>
  )
}

function Live({
  clock,
  running,
  setRunning,
  home,
  away,
  live,
  bench,
  sub,
  goal,
  oppGoal,
  positions,
  minutes,
  formation,
  formations,
  format,
  expected,
  layout,
  changeFormation,
  swap,
  undoLast,
  canUndo,
  least,
  most,
  period,
  halfTime,
  secondHalf,
  fullTime,
}: {
  clock: string
  running: boolean
  setRunning: (value: boolean) => void
  home: number
  away: number
  live: string[]
  bench: string[]
  sub: (offId: string, onId: string) => void
  goal: (id: string) => void
  oppGoal: () => void
  positions: Positions
  minutes: Minutes
  formation: string
  formations: string[]
  format: TeamFormatId
  expected: number
  layout: PitchSlot[]
  changeFormation: (formation: string) => void
  swap: (a: string, b: string) => void
  undoLast: () => void
  canUndo: boolean
  least?: string
  most?: string
  period: number
  halfTime: () => void
  secondHalf: () => void
  fullTime: () => void
}) {
  const [off, setOff] = useState("")
  const [scoring, setScoring] = useState(false)

  return (
    <section style={panel}>
      <div style={liveHead}>
        <div>
          <small style={eyebrow}>{format} · {formation}</small>
          <h2 style={{ margin: "3px 0 0" }}>{clock} · {home}-{away}</h2>
        </div>
        <button style={primary} onClick={() => setRunning(!running)}>{running ? "Pause" : "Resume"}</button>
      </div>

      <div style={three}>
        <button style={action} onClick={() => setScoring(true)}>⚽ Goal</button>
        <button style={action} onClick={oppGoal}>Opp goal</button>
        <button disabled={!canUndo} style={action} onClick={undoLast}>↶ Undo</button>
      </div>

      {scoring && (
        <div style={chooser}>
          <strong>Who scored?</strong>
          {live.filter((id) => positions[id] !== "GK").map((id) => (
            <button key={id} style={row} onClick={() => { goal(id); setScoring(false) }}>{playerName(id)}</button>
          ))}
          <button style={action} onClick={() => setScoring(false)}>Cancel</button>
        </div>
      )}

      <FormationPicker formations={formations} value={formation} change={changeFormation} />
      <Pitch ids={live} positions={positions} minutes={minutes} swap={swap} layout={layout} expected={expected} />

      {least && most && (
        <div style={fair}>
          <small>FAIR MINUTES SUGGESTION</small>
          <strong>{playerName(least)} ON · {playerName(most)} OFF</strong>
          <span>{Math.floor((minutes[least] ?? 0) / 60)}m vs {Math.floor((minutes[most] ?? 0) / 60)}m</span>
        </div>
      )}

      <h3 style={{ marginBottom: 0 }}>Substitution · OFF then ON</h3>
      <div style={two}>
        {live.map((id) => (
          <button key={id} onClick={() => setOff(id)} style={{ ...row, background: off === id ? "rgba(239,68,68,.25)" : "rgba(2,6,23,.48)" }}>
            OFF · {playerName(id)}
          </button>
        ))}
        {bench.map((id) => (
          <button disabled={!off} key={id} onClick={() => { sub(off, id); setOff("") }} style={row}>
            ON · {playerName(id)}
          </button>
        ))}
      </div>

      <div style={three}>
        {period === 1 ? <button style={action} onClick={halfTime}>Half time</button> : <button style={action} onClick={secondHalf}>2nd half</button>}
        <button style={danger} onClick={fullTime}>Full time</button>
        <button style={action} onClick={() => setOff("")}>Clear</button>
      </div>
    </section>
  )
}

const hero: CSSProperties = {
  borderRadius: 22,
  padding: 16,
  background: "#0d1829",
  border: "1px solid #1f3048",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 12px 35px rgba(0,0,0,.18)",
}
const panel: CSSProperties = {
  borderRadius: 22,
  padding: 14,
  background: "#0d1829",
  border: "1px solid #1f3048",
  display: "grid",
  gap: 9,
}
const sectionHead: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }
const eyebrow: CSSProperties = { color: "#60a5fa", fontSize: 10, fontWeight: 950, letterSpacing: ".08em" }
const hint: CSSProperties = { color: "#94a3b8", fontSize: 13, lineHeight: 1.45, margin: "2px 0 6px" }
const tabsStyle: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", gap: 4 }
const tab: CSSProperties = { minHeight: 42, border: 0, borderRadius: 11, background: "#111c2e", color: "#718096", fontSize: 10, fontWeight: 900, padding: "0 3px" }
const tabOn: CSSProperties = { ...tab, background: "#2563eb", color: "white" }
const row: CSSProperties = { width: "100%", minHeight: 46, border: "1px solid #24344c", borderRadius: 13, padding: "9px 11px", background: "rgba(2,6,23,.48)", color: "white", textAlign: "left", fontWeight: 850 }
const primary: CSSProperties = { minHeight: 46, border: 0, borderRadius: 13, background: "#2563eb", color: "white", fontWeight: 950, padding: "9px 10px" }
const action: CSSProperties = { ...primary, background: "#16243a" }
const danger: CSSProperties = { ...primary, background: "#991b1b" }
const three: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 7 }
const four: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 7 }
const two: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 7 }
const formationGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(72px,1fr))", gap: 7 }
const summaryStrip: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 6, padding: 9, borderRadius: 13, background: "rgba(2,6,23,.48)", color: "#cbd5e1", fontSize: 11, fontWeight: 850, textAlign: "center" }
const pitch: CSSProperties = { position: "relative", width: "100%", height: "min(52vh,430px)", minHeight: 330, overflow: "hidden", borderRadius: 20, border: "2px solid rgba(255,255,255,.72)", background: "linear-gradient(180deg,#177245,#0d5f38)", touchAction: "manipulation" }
const pitchHelp: CSSProperties = { marginBottom: 7, padding: "8px 10px", borderRadius: 11, background: "rgba(37,99,235,.12)", color: "#bfdbfe", fontSize: 12, fontWeight: 800, textAlign: "center" }
const pitchFooter: CSSProperties = { display: "flex", justifyContent: "space-between", gap: 6, marginTop: 7, color: "#94a3b8", fontSize: 10, fontWeight: 800 }
const token: CSSProperties = { position: "absolute", transform: "translate(-50%,-50%)", width: 68, minHeight: 54, border: "1px solid rgba(255,255,255,.28)", borderRadius: 16, color: "white", display: "grid", placeItems: "center", padding: "4px 5px", zIndex: 5, boxShadow: "0 7px 16px rgba(0,0,0,.28)", touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }
const halfwayLine: CSSProperties = { position: "absolute", left: 0, right: 0, top: "50%", height: 2, background: "rgba(255,255,255,.58)" }
const centreCircle: CSSProperties = { position: "absolute", left: "50%", top: "50%", width: 90, height: 90, border: "2px solid rgba(255,255,255,.58)", borderRadius: "50%", transform: "translate(-50%,-50%)" }
const topBox: CSSProperties = { position: "absolute", left: "25%", right: "25%", top: 0, height: "15%", border: "2px solid rgba(255,255,255,.58)", borderTop: 0 }
const bottomBox: CSSProperties = { position: "absolute", left: "25%", right: "25%", bottom: 0, height: "15%", border: "2px solid rgba(255,255,255,.58)", borderBottom: 0 }
const liveHead: CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }
const chooser: CSSProperties = { display: "grid", gap: 7, padding: 10, border: "1px solid #29405f", borderRadius: 15, background: "#101d30" }
const fair: CSSProperties = { display: "grid", gap: 4, borderRadius: 15, padding: 12, background: "rgba(16,185,129,.12)", border: "1px solid rgba(16,185,129,.3)" }
const playerRow: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 10px", borderRadius: 11, background: "rgba(2,6,23,.4)" }
const eventStyle: CSSProperties = { padding: "9px 10px", borderLeft: "3px solid #2563eb", background: "rgba(2,6,23,.36)", borderRadius: "0 10px 10px 0", color: "#dbeafe" }
