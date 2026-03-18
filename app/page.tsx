"use client"

import { useEffect, useState } from "react"

type EventType = "match" | "training" | "none"

type Event = {
  id: string
  title: string
  date: string
  type: EventType
}

type Player = {
  id: string
  name: string
  position: string
  goals: number
  assists: number
}

const initialPlayers: Player[] = [
  { id: "1", name: "Lyra Twinning", position: "FWD", goals: 0, assists: 0 },
  { id: "2", name: "Bella Bainbridge", position: "MID", goals: 0, assists: 0 },
  { id: "3", name: "Betsy Rowland", position: "MID", goals: 0, assists: 0 },
  { id: "4", name: "Ella Wilson", position: "MID", goals: 0, assists: 0 },
  { id: "5", name: "Bailee Dowler-Rowles", position: "DEF", goals: 0, assists: 0 },
  { id: "6", name: "Evelyn Evans", position: "DEF", goals: 0, assists: 0 },
  { id: "7", name: "Darcy-Rae Russell", position: "GK", goals: 0, assists: 0 },
]

export default function Page() {
  const [tab, setTab] = useState("home")
  const [matchTab, setMatchTab] = useState("overview")

  const [players, setPlayers] = useState(initialPlayers)

  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      title: "League Game",
      date: "2026-03-15",
      type: "match",
    },
    {
      id: "2",
      title: "Training",
      date: "2026-03-13",
      type: "training",
    },
  ])

  const [selectedDate, setSelectedDate] = useState(getToday())

  const [homeScore, setHomeScore] = useState(1)
  const [awayScore, setAwayScore] = useState(4)

  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    const i = setInterval(() => {
      setSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(i)
  }, [running])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, "0")}`
  }

  function updateStat(id: string, type: "goal" | "assist", delta: number) {
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              goals: type === "goal" ? Math.max(0, p.goals + delta) : p.goals,
              assists:
                type === "assist"
                  ? Math.max(0, p.assists + delta)
                  : p.assists,
            }
          : p
      )
    )
  }

  const visibleEvents = events.filter((e) => e.date === selectedDate)

  return (
    <main style={{ padding: 16, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28 }}>Team Manager Pro</h1>

      {/* NAV */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["home", "events", "match", "stats"].map((t) => (
          <button key={t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* HOME */}
      {tab === "home" && (
        <div>
          <h2>Dashboard</h2>
          <p>Players: {players.length}</p>
          <p>Events: {events.length}</p>
        </div>
      )}

      {/* EVENTS (ROLLING CALENDAR) */}
      {tab === "events" && (
        <div>
          <h2>Calendar</h2>

          {/* DATE STRIP */}
          <div
            style={{
              display: "flex",
              overflowX: "auto",
              gap: 10,
              marginBottom: 20,
            }}
          >
            {getNext7Days().map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  background: d === selectedDate ? "#111" : "#eee",
                  color: d === selectedDate ? "white" : "black",
                }}
              >
                {d.slice(5)}
              </button>
            ))}
          </div>

          {/* EVENTS */}
          {visibleEvents.map((e) => (
            <div
              key={e.id}
              style={{
                padding: 12,
                marginBottom: 10,
                borderRadius: 10,
                background:
                  e.type === "match" ? "#d1f7d6" : "#d6e8ff",
              }}
            >
              <b>{e.title}</b>
              <div>{e.type}</div>
            </div>
          ))}

          {/* TRAINING PLAN */}
          <div style={{ marginTop: 30 }}>
            <h3>Training Plan</h3>

            <TrainingCard
              title="Warm Up"
              desc="Dynamic movement + passing"
            />
            <TrainingCard
              title="Rondo"
              desc="Quick passing under pressure"
            />
            <TrainingCard
              title="Small Game"
              desc="5v5 with 2-touch rule"
            />
          </div>
        </div>
      )}

      {/* MATCH */}
      {tab === "match" && (
        <div>
          {/* SUB NAV */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            {["overview", "lineup", "live", "stats"].map((t) => (
              <button key={t} onClick={() => setMatchTab(t)}>
                {t}
              </button>
            ))}
          </div>

          {/* OVERVIEW */}
          {matchTab === "overview" && (
            <div>
              <h2>Scoreboard</h2>

              <h1>
                {homeScore} - {awayScore}
              </h1>

              <button onClick={() => setHomeScore(homeScore + 1)}>
                Home +
              </button>
              <button onClick={() => setAwayScore(awayScore + 1)}>
                Away +
              </button>

              <h3>{formatTime(seconds)}</h3>

              <button onClick={() => setRunning(true)}>Start</button>
              <button onClick={() => setRunning(false)}>Pause</button>
              <button onClick={() => setSeconds(0)}>Reset</button>
            </div>
          )}

          {/* LINEUP */}
          {matchTab === "lineup" && (
            <div>
              <h2>Lineup</h2>
              {players.map((p) => (
                <div key={p.id}>{p.name}</div>
              ))}
            </div>
          )}

          {/* LIVE */}
          {matchTab === "live" && (
            <div>
              <h2>Live Actions</h2>

              {players.map((p) => (
                <div
                  key={p.id}
                  style={{
                    border: "1px solid #ccc",
                    padding: 10,
                    marginBottom: 10,
                    borderRadius: 10,
                  }}
                >
                  <b>{p.name}</b>
                  <div>
                    Goals: {p.goals} | Assists: {p.assists}
                  </div>

                  <button onClick={() => updateStat(p.id, "goal", 1)}>
                    + Goal
                  </button>
                  <button onClick={() => updateStat(p.id, "goal", -1)}>
                    - Goal
                  </button>

                  <button onClick={() => updateStat(p.id, "assist", 1)}>
                    + Assist
                  </button>
                  <button onClick={() => updateStat(p.id, "assist", -1)}>
                    - Assist
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* STATS */}
          {matchTab === "stats" && (
            <div>
              <h2>Stats</h2>

              {players.map((p) => (
                <div key={p.id}>
                  {p.name} — {p.goals}G / {p.assists}A
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STATS TAB */}
      {tab === "stats" && (
        <div>
          <h2>Team Stats</h2>
          <p>Total goals: {players.reduce((a, p) => a + p.goals, 0)}</p>
        </div>
      )}
    </main>
  )
}

/* ------------------ HELPERS ------------------ */

function getToday() {
  return new Date().toISOString().split("T")[0]
}

function getNext7Days() {
  const arr = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    arr.push(d.toISOString().split("T")[0])
  }
  return arr
}

function TrainingCard({ title, desc }: any) {
  return (
    <div
      style={{
        padding: 12,
        marginBottom: 10,
        borderRadius: 10,
        background: "#eee",
      }}
    >
      <b>{title}</b>
      <div>{desc}</div>
    </div>
  )
}
