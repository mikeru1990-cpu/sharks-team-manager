"use client"

import { useEffect, useMemo, useState } from "react"
import { getActiveU11Players } from "../../lib/realTeamData"

const players = getActiveU11Players()

export default function PremiumMatchCentre() {
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [home, setHome] = useState(0)
  const [away, setAway] = useState(0)
  const [events, setEvents] = useState<string[]>([])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [running])

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`
  const minute = Math.max(1, Math.floor(seconds / 60))
  const starters = players.slice(0, 7)
  const bench = players.slice(7)
  const momentum = home > away ? "Positive" : home === away ? "Balanced" : "Chasing Game"
  const matchPhase = seconds === 0 ? "Pre Match" : running ? "Live" : "Paused"
  const coachAlerts = useMemo(() => [
    "Rotation check: bench group has 3 players ready to enter.",
    "Goalkeeper block: Darcy-Rae is assigned as starting GK.",
    "Shape: 2-3-1 gives wide support and one central striker.",
  ], [])

  function addEvent(text: string) {
    setEvents((current) => [`${minute}' ${text}`, ...current])
  }

  function goal(name: string) {
    setHome((score) => score + 1)
    addEvent(`Goal - ${name}`)
  }

  return (
    <div style={{ display: "grid", gap: 16, paddingBottom: 140, color: "white" }}>
      <section style={hero}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start" }}>
          <div>
            <div style={{ opacity: 0.75, fontSize: 12, fontWeight: 950, letterSpacing: 1 }}>FOOTBALL OS · MATCH CENTRE</div>
            <h1 style={{ margin: "8px 0 4px", fontSize: 34, letterSpacing: -1.2 }}>Leonard Stanley U11</h1>
            <div style={{ color: "rgba(226,232,240,0.72)", fontWeight: 850 }}>Premium touchline console · 2-3-1 shape · live intelligence</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 44, fontWeight: 980 }}>{home}-{away}</div>
            <div style={{ color: running ? "#4ade80" : "#bfdbfe", fontSize: 12, fontWeight: 950 }}>{matchPhase.toUpperCase()}</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 16 }}>
          <TopStat label="Clock" value={clock} />
          <TopStat label="Momentum" value={momentum} />
          <TopStat label="Events" value={events.length.toString()} />
        </div>
      </section>

      <section style={scorePanel}>
        <div>
          <div style={{ color: "rgba(226,232,240,0.62)", fontSize: 12, fontWeight: 950 }}>MATCH CONTROL</div>
          <div style={{ fontSize: 54, fontWeight: 980, letterSpacing: -2 }}>{clock}</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
          <Action label={running ? "Pause" : "Start"} onClick={() => setRunning(!running)} />
          <Action label="Reset" onClick={() => { setRunning(false); setSeconds(0) }} />
          <Action label="Opp Goal" onClick={() => { setAway((score) => score + 1); addEvent("Opposition goal") }} />
        </div>
      </section>

      <section style={aiPanel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ color: "#bfdbfe", fontSize: 12, fontWeight: 950, letterSpacing: 1 }}>AI COACH</div>
            <h2 style={h2}>Tactical Intelligence</h2>
          </div>
          <Pill text="LIVE READ" />
        </div>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          {coachAlerts.map((alert) => <div key={alert} style={intelligenceCard}>{alert}</div>)}
        </div>
      </section>

      <section style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <h2 style={h2}>Tactical Pitch</h2>
            <p style={p}>Starting seven shown in a professional touchline pitch view.</p>
          </div>
          <Pill text="2-3-1" />
        </div>
        <div style={pitch}>
          <div style={halfway} />
          <div style={centreCircle} />
          {starters.map((player, index) => <PlayerDot key={player.id} name={player.name} index={index} />)}
        </div>
      </section>

      <section style={panel}>
        <h2 style={h2}>Touchline Actions</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 12 }}>
          <Action label="Sub" onClick={() => addEvent("Substitution") } />
          <Action label="Injury" onClick={() => addEvent("Injury note") } />
          <Action label="Card" onClick={() => addEvent("Card recorded") } />
          <Action label="Note" onClick={() => addEvent("Coach note") } />
        </div>
      </section>

      <section style={panel}>
        <h2 style={h2}>Record Goal</h2>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {players.map((player) => <button key={player.id} type="button" onClick={() => goal(player.name)} style={playerButton}>⚽ {player.name}</button>)}
        </div>
      </section>

      <section style={panel}>
        <h2 style={h2}>Rotation Bench</h2>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {bench.map((player) => <div key={player.id} style={benchCard}>🔄 {player.name}</div>)}
        </div>
      </section>

      <section style={panel}>
        <h2 style={h2}>Live Timeline</h2>
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {events.length === 0 ? <div style={benchCard}>No events recorded yet.</div> : events.map((event) => <div key={event} style={benchCard}>{event}</div>)}
        </div>
      </section>
    </div>
  )
}

function Action({ label, onClick }: { label: string; onClick: () => void }) { return <button type="button" onClick={onClick} style={action}>{label}</button> }
function Pill({ text }: { text: string }) { return <div style={{ borderRadius: 999, padding: "8px 12px", background: "rgba(37,99,235,0.22)", color: "#bfdbfe", fontWeight: 950 }}>{text}</div> }
function TopStat({ label, value }: { label: string; value: string }) { return <div style={topStat}><div style={{ color: "rgba(226,232,240,0.56)", fontSize: 11, fontWeight: 950 }}>{label}</div><div style={{ marginTop: 5, fontSize: 20, fontWeight: 980 }}>{value}</div></div> }
function PlayerDot({ name, index }: { name: string; index: number }) { const pos = [[50,86],[32,66],[68,66],[50,48],[25,30],[75,30],[50,14]][index] || [50,50]; return <div style={{ position: "absolute", left: `${pos[0]}%`, top: `${pos[1]}%`, transform: "translate(-50%,-50%)", width: 82, minHeight: 58, borderRadius: 20, background: "linear-gradient(135deg,#2563eb,#7c3aed)", border: "1px solid rgba(255,255,255,0.28)", display: "grid", placeItems: "center", textAlign: "center", padding: 7, boxShadow: "0 16px 28px rgba(0,0,0,0.28)", fontWeight: 950, fontSize: 11 }}>{shortName(name)}</div> }
function shortName(name: string) { if (name === "Darcy-Rae Russell") return "Darcy-Rae"; if (name === "Isabella Ogden") return "Bella O"; if (name === "Bella Bainbridge") return "Bella B"; return name.split(" ")[0] }

const hero = { borderRadius: 30, padding: 20, background: "linear-gradient(135deg, rgba(37,99,235,0.48), rgba(88,28,135,0.42), rgba(15,23,42,0.97))", border: "1px solid rgba(147,197,253,0.24)", boxShadow: "0 22px 55px rgba(0,0,0,0.24)" }
const scorePanel = { borderRadius: 28, padding: 18, background: "rgba(15,23,42,0.9)", border: "1px solid rgba(148,163,184,0.14)", display: "grid", gap: 14 }
const panel = { borderRadius: 26, padding: 18, background: "rgba(15,23,42,0.9)", border: "1px solid rgba(148,163,184,0.14)" }
const aiPanel = { borderRadius: 28, padding: 18, background: "linear-gradient(135deg, rgba(30,64,175,0.32), rgba(88,28,135,0.28), rgba(15,23,42,0.94))", border: "1px solid rgba(147,197,253,0.18)" }
const h2 = { margin: 0, fontSize: 24 }
const p = { margin: "6px 0 0", color: "rgba(226,232,240,0.72)", lineHeight: 1.45 }
const action = { border: "1px solid rgba(147,197,253,0.18)", borderRadius: 18, padding: 14, background: "rgba(37,99,235,0.2)", color: "white", fontWeight: 950, cursor: "pointer" }
const pitch = { position: "relative" as const, height: 430, marginTop: 16, borderRadius: 28, background: "linear-gradient(180deg, rgba(22,163,74,0.9), rgba(21,128,61,0.86))", border: "2px solid rgba(255,255,255,0.22)", overflow: "hidden" }
const halfway = { position: "absolute" as const, left: 0, right: 0, top: "50%", height: 2, background: "rgba(255,255,255,0.2)" }
const centreCircle = { position: "absolute" as const, left: "50%", top: "50%", width: 98, height: 98, borderRadius: 999, border: "2px solid rgba(255,255,255,0.2)", transform: "translate(-50%,-50%)" }
const playerButton = { width: "100%", border: "1px solid rgba(34,197,94,0.22)", borderRadius: 18, padding: 14, background: "rgba(5,46,22,0.52)", color: "white", fontWeight: 950, textAlign: "left" as const, cursor: "pointer" }
const benchCard = { borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.48)", border: "1px solid rgba(148,163,184,0.1)", fontWeight: 900 }
const intelligenceCard = { borderRadius: 18, padding: 14, background: "rgba(2,6,23,0.42)", border: "1px solid rgba(147,197,253,0.14)", color: "rgba(226,232,240,0.86)", fontWeight: 850, lineHeight: 1.4 }
const topStat = { borderRadius: 18, padding: 12, background: "rgba(2,6,23,0.38)", border: "1px solid rgba(148,163,184,0.1)" }
