"use client"

import { useEffect, useMemo, useState } from "react"
import { getActiveU11Players } from "../../lib/realTeamData"
import { getPlayerRole, getPlayerRoleLabel } from "../../lib/playerRoles"

const players = getActiveU11Players()
const quarterMinutes = 15

function shortName(name: string) {
  if (name === "Darcy-Rae Russell") return "Darcy-Rae"
  if (name === "Isabella Ogden") return "Bella O"
  if (name === "Bella Bainbridge") return "Bella B"
  return name.split(" ")[0]
}

function buildRotation() {
  const q1 = players.slice(0, 7)
  const q2 = [players[0], players[7], players[8], players[3], players[4], players[5], players[9]].filter(Boolean)
  const q3 = [players[0], players[1], players[2], players[7], players[8], players[6], players[9]].filter(Boolean)
  const q4 = [players[0], players[1], players[2], players[3], players[4], players[5], players[6]].filter(Boolean)
  return [q1, q2, q3, q4]
}

export default function MatchdayCockpit() {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [home, setHome] = useState(0)
  const [away, setAway] = useState(0)
  const [activeQuarter, setActiveQuarter] = useState(0)
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [running])

  const rotation = useMemo(() => buildRotation(), [])
  const starters = rotation[activeQuarter]
  const bench = players.filter((player) => !starters.some((starter) => starter.id === player.id))
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
  const minute = Math.max(1, Math.floor(seconds / 60))
  const matchState = seconds === 0 ? "READY" : running ? "LIVE" : "PAUSED"

  const minutesMap = useMemo(() => {
    const map: Record<string, number> = {}
    players.forEach((player) => { map[player.id] = 0 })
    rotation.forEach((quarter) => quarter.forEach((player) => { map[player.id] += quarterMinutes }))
    return map
  }, [rotation])

  const lowestMinutes = Math.min(...Object.values(minutesMap))
  const fairness = players.filter((player) => minutesMap[player.id] === lowestMinutes).map((player) => shortName(player.name)).join(" · ")

  function addEvent(label: string) {
    setEvents((current) => [`${minute}' ${label}`, ...current])
  }

  function scoreGoal(name: string) {
    setHome((value) => value + 1)
    addEvent(`Goal · ${shortName(name)}`)
  }

  return (
    <div style={shell}>
      <section style={scoreboard}>
        <div>
          <div style={eyebrow}>FOOTBALL OS / MATCHDAY</div>
          <h1 style={title}>Leonard Stanley U11</h1>
          <div style={subtle}>Live cockpit · roles restored · rotation engine · 2-3-1 shape</div>
        </div>
        <div style={scoreBlock}>
          <div style={score}>{home}<span style={{ opacity: 0.35 }}>-</span>{away}</div>
          <div style={running ? livePill : readyPill}>{matchState}</div>
        </div>
      </section>

      <section style={controlDock}>
        <div>
          <div style={eyebrow}>MATCH CLOCK</div>
          <div style={clockText}>{clock}</div>
        </div>
        <div style={controlGrid}>
          <button style={primaryAction} onClick={() => setRunning(!running)}>{running ? "Pause" : "Start"}</button>
          <button style={action} onClick={() => { setRunning(false); setSeconds(0); setActiveQuarter(0) }}>Reset</button>
          <button style={dangerAction} onClick={() => { setAway((value) => value + 1); addEvent("Opposition goal") }}>Opp Goal</button>
        </div>
      </section>

      <div style={metricsGrid}>
        <Metric label="Quarter" value={`Q${activeQuarter + 1}`} />
        <Metric label="Squad" value={players.length.toString()} />
        <Metric label="Lowest mins" value={`${lowestMinutes}`} />
        <Metric label="Events" value={events.length.toString()} />
      </div>

      <section style={glassPanel}>
        <div style={sectionHeader}>
          <div>
            <div style={eyebrow}>COACH INTELLIGENCE</div>
            <h2 style={sectionTitle}>Rotation read</h2>
          </div>
          <div style={softPill}>Roles visible</div>
        </div>
        <div style={insightGrid}>
          <Insight title="Active block" text={`Q${activeQuarter + 1}: ${starters.length} on, ${bench.length} rotating.`} />
          <Insight title="Lowest minutes" text={`${fairness} currently planned for ${lowestMinutes} minutes.`} />
          <Insight title="Goalkeeper" text="Darcy-Rae is locked as GK. Player roles are now visible across the match cockpit." />
        </div>
      </section>

      <section style={mainGrid}>
        <div style={pitchCard}>
          <div style={sectionHeader}>
            <div>
              <div style={eyebrow}>TACTICAL PITCH</div>
              <h2 style={sectionTitle}>Q{activeQuarter + 1} lineup</h2>
            </div>
            <div style={softPill}>2-3-1</div>
          </div>
          <div style={pitch}>
            <div style={halfway} />
            <div style={circle} />
            {starters.map((player, index) => <PlayerDot key={player.id} id={player.id} name={player.name} index={index} />)}
          </div>
        </div>

        <div style={rotationCard}>
          <div style={sectionHeader}>
            <div>
              <div style={eyebrow}>ROTATION ENGINE</div>
              <h2 style={sectionTitle}>Q1–Q4 plan</h2>
            </div>
          </div>
          <div style={quarterTabs}>
            {rotation.map((quarter, index) => (
              <button key={index} onClick={() => setActiveQuarter(index)} style={activeQuarter === index ? activeQuarterButton : quarterButton}>
                Q{index + 1}<span>{quarter.length} on</span>
              </button>
            ))}
          </div>
          <div style={rotationList}>
            {rotation.map((quarter, index) => (
              <div key={index} style={index === activeQuarter ? rotationRowActive : rotationRow}>
                <strong>Q{index + 1}</strong>
                <span>{quarter.map((player) => `${shortName(player.name)} (${getPlayerRole(player.id).matchRole})`).join(" · ")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={splitGrid}>
        <div style={glassPanel}>
          <div style={sectionHeader}><h2 style={sectionTitle}>Q{activeQuarter + 1} bench</h2><div style={softPill}>{bench.length} ready</div></div>
          <div style={playerList}>{bench.map((player) => <PlayerChip key={player.id} id={player.id} label={player.name} prefix="↻" minutes={minutesMap[player.id]} />)}</div>
        </div>
        <div style={glassPanel}>
          <div style={sectionHeader}><h2 style={sectionTitle}>Touchline actions</h2><div style={softPill}>One tap</div></div>
          <div style={buttonGrid}>
            <button style={primaryAction} onClick={() => addEvent(`Q${activeQuarter + 1} substitution`)}>Sub</button>
            <button style={action} onClick={() => addEvent("Injury note")}>Injury</button>
            <button style={action} onClick={() => addEvent("Card recorded")}>Card</button>
            <button style={action} onClick={() => addEvent("Coach note")}>Note</button>
          </div>
        </div>
      </section>

      <section style={glassPanel}>
        <div style={sectionHeader}><h2 style={sectionTitle}>Record goal</h2><div style={softPill}>Player picker</div></div>
        <div style={goalGrid}>{players.map((player) => <button key={player.id} style={goalButton} onClick={() => scoreGoal(player.name)}>⚽ <strong>{player.name}</strong><span>{getPlayerRoleLabel(player.id)}</span></button>)}</div>
      </section>

      <section style={glassPanel}>
        <div style={sectionHeader}><h2 style={sectionTitle}>Planned minutes and roles</h2><div style={softPill}>Auto calculated</div></div>
        <div style={minutesGrid}>{players.map((player) => <div key={player.id} style={minuteCard}><span><strong>{shortName(player.name)}</strong><em>{getPlayerRoleLabel(player.id)}</em></span><strong>{minutesMap[player.id]}m</strong></div>)}</div>
      </section>

      <section style={glassPanel}>
        <div style={sectionHeader}><h2 style={sectionTitle}>Timeline</h2><div style={softPill}>{events.length}</div></div>
        <div style={timeline}>{events.length === 0 ? <div style={emptyState}>No match events yet.</div> : events.map((event) => <div key={event} style={eventRow}>{event}</div>)}</div>
      </section>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) { return <div style={metric}><span>{label}</span><strong>{value}</strong></div> }
function Insight({ title, text }: { title: string; text: string }) { return <div style={insight}><strong>{title}</strong><span>{text}</span></div> }
function PlayerChip({ id, label, prefix, minutes }: { id: string; label: string; prefix: string; minutes: number }) { const role = getPlayerRole(id); return <div style={playerChip}><span>{prefix}</span><div><strong>{label}</strong><em>{getPlayerRoleLabel(id)}</em></div><b>{role.matchRole} · {minutes}m</b></div> }
function PlayerDot({ id, name, index }: { id: string; name: string; index: number }) { const pos = [[50,88],[31,67],[69,67],[50,49],[25,30],[75,30],[50,13]][index] || [50,50]; const role = getPlayerRole(id); return <div style={{ ...playerDot, left: `${pos[0]}%`, top: `${pos[1]}%` }}><small>{role.matchRole}</small><strong>{shortName(name)}</strong></div> }

const shell = { display: "grid", gap: 14, paddingBottom: 144, color: "white" }
const scoreboard = { borderRadius: 32, padding: 20, background: "radial-gradient(circle at top left, rgba(59,130,246,0.52), transparent 32%), linear-gradient(135deg, rgba(15,23,42,0.98), rgba(30,41,59,0.94))", border: "1px solid rgba(191,219,254,0.18)", boxShadow: "0 26px 60px rgba(0,0,0,0.35)", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start" }
const eyebrow = { fontSize: 11, letterSpacing: 1.1, fontWeight: 950, color: "rgba(191,219,254,0.86)" }
const title = { margin: "8px 0 4px", fontSize: 33, letterSpacing: -1.2, lineHeight: 1 }
const subtle = { color: "rgba(226,232,240,0.68)", fontSize: 13, fontWeight: 800, lineHeight: 1.35 }
const scoreBlock = { textAlign: "right" as const, minWidth: 86 }
const score = { fontSize: 48, lineHeight: 0.95, fontWeight: 980, letterSpacing: -2 }
const readyPill = { marginTop: 8, borderRadius: 999, padding: "7px 10px", background: "rgba(37,99,235,0.22)", color: "#bfdbfe", fontSize: 11, fontWeight: 950 }
const livePill = { ...readyPill, background: "rgba(22,163,74,0.24)", color: "#86efac" }
const controlDock = { position: "sticky" as const, top: 8, zIndex: 5, borderRadius: 28, padding: 16, background: "rgba(2,6,23,0.86)", border: "1px solid rgba(148,163,184,0.16)", backdropFilter: "blur(18px)", display: "grid", gap: 12, boxShadow: "0 20px 38px rgba(0,0,0,0.28)" }
const clockText = { fontSize: 50, fontWeight: 980, letterSpacing: -2, lineHeight: 1 }
const controlGrid = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }
const metricsGrid = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }
const metric = { borderRadius: 20, padding: 12, background: "rgba(15,23,42,0.76)", border: "1px solid rgba(148,163,184,0.12)", display: "grid", gap: 5 }
const glassPanel = { borderRadius: 28, padding: 16, background: "rgba(15,23,42,0.82)", border: "1px solid rgba(148,163,184,0.13)", boxShadow: "0 18px 42px rgba(0,0,0,0.18)" }
const sectionHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }
const sectionTitle = { margin: 0, fontSize: 22, letterSpacing: -0.5 }
const softPill = { borderRadius: 999, padding: "7px 10px", background: "rgba(37,99,235,0.18)", color: "#bfdbfe", fontSize: 11, fontWeight: 950, whiteSpace: "nowrap" as const }
const insightGrid = { display: "grid", gap: 10, marginTop: 12 }
const insight = { borderRadius: 20, padding: 13, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(147,197,253,0.12)", display: "grid", gap: 5, color: "rgba(226,232,240,0.84)", lineHeight: 1.35 }
const mainGrid = { display: "grid", gap: 14 }
const pitchCard = { ...glassPanel, padding: 14 }
const rotationCard = { ...glassPanel }
const pitch = { position: "relative" as const, height: 420, marginTop: 14, borderRadius: 28, overflow: "hidden", background: "repeating-linear-gradient(90deg, rgba(22,163,74,0.92) 0 52px, rgba(21,128,61,0.92) 52px 104px)", border: "2px solid rgba(255,255,255,0.24)" }
const halfway = { position: "absolute" as const, left: 0, right: 0, top: "50%", height: 2, background: "rgba(255,255,255,0.24)" }
const circle = { position: "absolute" as const, left: "50%", top: "50%", width: 102, height: 102, borderRadius: 999, border: "2px solid rgba(255,255,255,0.24)", transform: "translate(-50%,-50%)" }
const playerDot = { position: "absolute" as const, transform: "translate(-50%,-50%)", width: 86, minHeight: 64, borderRadius: 21, background: "linear-gradient(135deg,#2563eb,#7c3aed)", border: "1px solid rgba(255,255,255,0.30)", display: "grid", placeItems: "center", textAlign: "center" as const, padding: 7, boxShadow: "0 18px 32px rgba(0,0,0,0.32)", fontWeight: 950, fontSize: 11 }
const quarterTabs = { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 14 }
const quarterButton = { border: "1px solid rgba(148,163,184,0.14)", borderRadius: 18, padding: 12, background: "rgba(2,6,23,0.48)", color: "white", cursor: "pointer", fontWeight: 950, display: "grid", gap: 4 }
const activeQuarterButton = { ...quarterButton, background: "linear-gradient(135deg,rgba(37,99,235,0.48),rgba(124,58,237,0.36))", border: "1px solid rgba(147,197,253,0.28)" }
const rotationList = { display: "grid", gap: 8, marginTop: 12 }
const rotationRow = { borderRadius: 18, padding: 13, background: "rgba(2,6,23,0.44)", border: "1px solid rgba(148,163,184,0.10)", display: "grid", gap: 5, color: "rgba(226,232,240,0.76)", lineHeight: 1.35 }
const rotationRowActive = { ...rotationRow, border: "1px solid rgba(147,197,253,0.26)", background: "rgba(37,99,235,0.16)", color: "white" }
const splitGrid = { display: "grid", gap: 14 }
const playerList = { display: "grid", gap: 8, marginTop: 12 }
const playerChip = { borderRadius: 18, padding: 13, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(148,163,184,0.10)", fontWeight: 900, display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 10, alignItems: "center" }
const buttonGrid = { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginTop: 12 }
const action = { border: "1px solid rgba(147,197,253,0.16)", borderRadius: 18, padding: 14, background: "rgba(15,23,42,0.74)", color: "white", fontWeight: 950, cursor: "pointer" }
const primaryAction = { ...action, background: "linear-gradient(135deg,#2563eb,#7c3aed)", boxShadow: "0 14px 28px rgba(37,99,235,0.24)" }
const dangerAction = { ...action, background: "rgba(127,29,29,0.42)", border: "1px solid rgba(248,113,113,0.20)" }
const goalGrid = { display: "grid", gap: 8, marginTop: 12 }
const goalButton = { width: "100%", border: "1px solid rgba(34,197,94,0.18)", borderRadius: 18, padding: 14, background: "rgba(5,46,22,0.46)", color: "white", fontWeight: 950, textAlign: "left" as const, cursor: "pointer", display: "grid", gap: 4 }
const minutesGrid = { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginTop: 12 }
const minuteCard = { borderRadius: 18, padding: 12, background: "rgba(2,6,23,0.46)", border: "1px solid rgba(148,163,184,0.10)", display: "flex", justifyContent: "space-between", gap: 10, fontWeight: 900 }
const timeline = { display: "grid", gap: 8, marginTop: 12 }
const emptyState = { borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.42)", border: "1px solid rgba(148,163,184,0.10)", color: "rgba(226,232,240,0.68)", fontWeight: 850 }
const eventRow = { ...emptyState, color: "white" }
