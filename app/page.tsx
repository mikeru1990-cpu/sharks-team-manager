"use client"

import { useMemo, useState } from "react"

type EventType = "match" | "training" | "none"
type MainTab = "home" | "events" | "match" | "stats"
type MatchTab = "overview" | "lineup" | "live" | "stats"

type EventItem = {
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

type TimelineEventType = "goal" | "assist" | "sub" | "injury" | "note"

type TimelineItem = {
  id: string
  minute: number
  type: TimelineEventType
  text: string
}

type TrainingTemplate = {
  id: string
  name: string
  warmUp: string
  drill1: string
  drill2: string
  game: string
  notes: string
}

const initialPlayers: Player[] = [
  { id: "1", name: "Lyra Twinning", position: "FWD", goals: 0, assists: 0 },
  { id: "2", name: "Bella Bainbridge", position: "MID", goals: 0, assists: 0 },
  { id: "3", name: "Betsy Rowland", position: "MID", goals: 0, assists: 0 },
  { id: "4", name: "Ella Wilson", position: "MID", goals: 0, assists: 0 },
  { id: "5", name: "Bailee Dowler-Rowles", position: "DEF", goals: 0, assists: 0 },
  { id: "6", name: "Evelyn Evans", position: "DEF", goals: 0, assists: 0 },
  { id: "7", name: "Darcy-Rae Russell", position: "GK", goals: 0, assists: 0 },
  { id: "8", name: "Isabella Ogden", position: "MID", goals: 0, assists: 0 },
  { id: "9", name: "Martha Scrivens", position: "MID", goals: 0, assists: 0 },
  { id: "10", name: "Poppy Bennett", position: "GK", goals: 0, assists: 0 },
]

const initialEvents: EventItem[] = [
  { id: "1", title: "League Game", date: "2026-03-15", type: "match" },
  { id: "2", title: "Training", date: "2026-03-13", type: "training" },
  { id: "3", title: "Recovery Session", date: "2026-03-16", type: "training" },
]

const initialTrainingTemplates: TrainingTemplate[] = [
  {
    id: "t1",
    name: "Passing Under Pressure",
    warmUp: "Dynamic movement + partner passing gates",
    drill1: "4v1 rondo, 2-touch max",
    drill2: "3v2 overload to target goals",
    game: "5v5 condition game, score after 5 passes",
    notes: "Focus on scanning and body shape before receiving.",
  },
  {
    id: "t2",
    name: "Finishing & Movement",
    warmUp: "Ball mastery + quick finishing pattern",
    drill1: "Combination play around mannequins",
    drill2: "Wide delivery and first-time finishing",
    game: "4-goal game with bonus for one-touch finish",
    notes: "Coach timing of runs and composure in the box.",
  },
  {
    id: "t3",
    name: "Defending Shape",
    warmUp: "Movement prep + mirror defending",
    drill1: "1v1 channel defending",
    drill2: "Back line shifting against 3 attackers",
    game: "6v6 with defending team protecting mini goals",
    notes: "Distances, communication, and delaying the attacker.",
  },
]

function getToday() {
  return new Date().toISOString().split("T")[0]
}

function getNext7Days() {
  const arr: string[] = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    arr.push(d.toISOString().split("T")[0])
  }
  return arr
}

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

function formatShortDate(date: string) {
  return date.slice(5)
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function cardStyle(bg = "#ffffff"): React.CSSProperties {
  return {
    background: bg,
    border: "1px solid #dbe3ef",
    borderRadius: 24,
    padding: 16,
    boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
  }
}

function buttonPrimary(): React.CSSProperties {
  return {
    padding: "14px 16px",
    borderRadius: 16,
    border: "none",
    background: "#061b5b",
    color: "white",
    fontWeight: 800,
    fontSize: 16,
  }
}

function buttonSecondary(): React.CSSProperties {
  return {
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#0f172a",
    fontWeight: 800,
    fontSize: 16,
  }
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: "10px 14px",
    borderRadius: 999,
    border: active ? "2px solid #061b5b" : "1px solid #cbd5e1",
    background: active ? "#dbeafe" : "white",
    color: active ? "#061b5b" : "#334155",
    fontWeight: 800,
    minWidth: 70,
  }
}

function TrainingCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div
      style={{
        padding: 12,
        borderRadius: 16,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <div style={{ color: "#475569" }}>{desc}</div>
    </div>
  )
}

export default function Page() {
  const [tab, setTab] = useState<MainTab>("home")
  const [matchTab, setMatchTab] = useState<MatchTab>("overview")

  const [players, setPlayers] = useState<Player[]>(initialPlayers)
  const [events] = useState<EventItem[]>(initialEvents)
  const [selectedDate, setSelectedDate] = useState(getToday())

  const [homeTeam] = useState("Tewkesbury Town Colts Youth")
  const [awayTeam] = useState("Leonard Stanley U10 Lioness")
  const [homeScore, setHomeScore] = useState(1)
  const [awayScore, setAwayScore] = useState(4)

  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)

  const [lineup, setLineup] = useState<string[]>(["1", "2", "3", "4", "5", "6", "7"])
  const [bench, setBench] = useState<string[]>(["8", "9", "10"])

  const [timeline, setTimeline] = useState<TimelineItem[]>([
    { id: "ev1", minute: 6, type: "goal", text: "Lyra Twinning scored for Lioness" },
    { id: "ev2", minute: 10, type: "goal", text: "Bella Bainbridge scored for Lioness" },
  ])

  const [subOffId, setSubOffId] = useState("")
  const [subOnId, setSubOnId] = useState("")

  const [trainingTemplates] = useState<TrainingTemplate[]>(initialTrainingTemplates)
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTrainingTemplates[0].id)

  const [trainingPlan, setTrainingPlan] = useState({
    title: "Weekly Training Session",
    warmUp: initialTrainingTemplates[0].warmUp,
    drill1: initialTrainingTemplates[0].drill1,
    drill2: initialTrainingTemplates[0].drill2,
    game: initialTrainingTemplates[0].game,
    notes: initialTrainingTemplates[0].notes,
  })

  const visibleEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDate)
  }, [events, selectedDate])

  const totalGoals = useMemo(() => players.reduce((a, p) => a + p.goals, 0), [players])
  const totalAssists = useMemo(() => players.reduce((a, p) => a + p.assists, 0), [players])

  const lineupPlayers = useMemo(
    () => lineup.map((id) => players.find((p) => p.id === id)).filter(Boolean) as Player[],
    [lineup, players]
  )

  const benchPlayers = useMemo(
    () => bench.map((id) => players.find((p) => p.id === id)).filter(Boolean) as Player[],
    [bench, players]
  )

  function stepClock(delta: number) {
    setSeconds((prev) => Math.max(0, prev + delta))
  }

  function addTimeline(type: TimelineEventType, text: string) {
    const minute = Math.floor(seconds / 60)
    setTimeline((prev) => [
      ...prev,
      {
        id: makeId(),
        minute,
        type,
        text,
      },
    ])
  }

  function updateStat(id: string, type: "goal" | "assist", delta: number) {
    const player = players.find((p) => p.id === id)
    if (!player) return

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              goals: type === "goal" ? Math.max(0, p.goals + delta) : p.goals,
              assists: type === "assist" ? Math.max(0, p.assists + delta) : p.assists,
            }
          : p
      )
    )

    if (delta > 0 && type === "goal") {
      addTimeline("goal", `${player.name} scored`)
    }
    if (delta > 0 && type === "assist") {
      addTimeline("assist", `${player.name} got an assist`)
    }
  }

  function doSubstitution() {
    if (!subOffId || !subOnId) return
    if (!lineup.includes(subOffId)) {
      alert("Player off must be on the pitch")
      return
    }
    if (!bench.includes(subOnId)) {
      alert("Player on must be on the bench")
      return
    }

    const offPlayer = players.find((p) => p.id === subOffId)
    const onPlayer = players.find((p) => p.id === subOnId)

    setLineup((prev) => prev.map((id) => (id === subOffId ? subOnId : id)))
    setBench((prev) => prev.map((id) => (id === subOnId ? subOffId : id)))

    addTimeline("sub", `${offPlayer?.name || "Player"} off, ${onPlayer?.name || "Player"} on`)

    setSubOffId("")
    setSubOnId("")
  }

  function loadTrainingTemplate(templateId: string) {
    const template = trainingTemplates.find((t) => t.id === templateId)
    if (!template) return

    setSelectedTemplateId(templateId)
    setTrainingPlan({
      title: template.name,
      warmUp: template.warmUp,
      drill1: template.drill1,
      drill2: template.drill2,
      game: template.game,
      notes: template.notes,
    })
  }

  function startClock() {
    if (running) return
    setRunning(true)
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)

    setTimeout(() => {
      if (!running) clearInterval(interval)
    }, 50)
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        fontFamily: "Arial, sans-serif",
        color: "#0f172a",
        paddingBottom: 110,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ color: "#64748b", fontWeight: 800, letterSpacing: 2, fontSize: 13 }}>SHARKS APP</div>
        <div style={{ fontSize: 30, fontWeight: 900 }}>Team Manager Pro</div>
      </div>

      <div
        style={{
          position: "fixed",
          left: 16,
          right: 16,
          bottom: 16,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          border: "1px solid #dbe3ef",
          borderRadius: 28,
          padding: 10,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 8,
          boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
          zIndex: 50,
        }}
      >
        {[
          ["home", "Home", "⌂"],
          ["events", "Events", "📅"],
          ["match", "Match", "⚽"],
          ["stats", "Stats", "📊"],
        ].map(([value, label, icon]) => (
          <button
            key={value}
            onClick={() => setTab(value as MainTab)}
            style={{
              border: "none",
              borderRadius: 18,
              padding: "12px 8px",
              background: tab === value ? "#061b5b" : "transparent",
              color: tab === value ? "white" : "#475569",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            <div style={{ fontSize: 18 }}>{icon}</div>
            <div>{label}</div>
          </button>
        ))}
      </div>

      {tab === "home" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div
            style={{
              ...cardStyle("linear-gradient(135deg, #061b5b 0%, #0c235f 100%)"),
              color: "white",
            }}
          >
            <div style={{ fontSize: 14, opacity: 0.8, fontWeight: 800 }}>Club Dashboard</div>
            <div style={{ fontSize: 34, fontWeight: 900, marginTop: 8 }}>Ready for Matchday</div>
            <div style={{ marginTop: 10, opacity: 0.9, fontSize: 18 }}>
              Fixtures, live match tools, training plans and squad stats in one place.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            <div style={cardStyle()}>
              <div style={{ color: "#64748b", fontWeight: 800 }}>Players</div>
              <div style={{ fontSize: 40, fontWeight: 900, marginTop: 8 }}>{players.length}</div>
            </div>
            <div style={cardStyle()}>
              <div style={{ color: "#64748b", fontWeight: 800 }}>Events</div>
              <div style={{ fontSize: 40, fontWeight: 900, marginTop: 8 }}>{events.length}</div>
            </div>
            <div style={cardStyle()}>
              <div style={{ color: "#64748b", fontWeight: 800 }}>Goals</div>
              <div style={{ fontSize: 40, fontWeight: 900, marginTop: 8 }}>{totalGoals}</div>
            </div>
            <div style={cardStyle()}>
              <div style={{ color: "#64748b", fontWeight: 800 }}>Assists</div>
              <div style={{ fontSize: 40, fontWeight: 900, marginTop: 8 }}>{totalAssists}</div>
            </div>
          </div>
        </div>
      )}

      {tab === "events" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Rolling Calendar</div>
            <div style={{ display: "flex", overflowX: "auto", gap: 10, paddingBottom: 6 }}>
              {getNext7Days().map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDate(d)}
                  style={{
                    ...chipStyle(d === selectedDate),
                    whiteSpace: "nowrap",
                  }}
                >
                  {formatShortDate(d)}
                </button>
              ))}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Events on {formatShortDate(selectedDate)}</div>
            {visibleEvents.length === 0 ? (
              <div style={{ color: "#64748b" }}>No events on this day.</div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {visibleEvents.map((e) => (
                  <div
                    key={e.id}
                    style={{
                      padding: 14,
                      borderRadius: 16,
                      background: e.type === "match" ? "#dcfce7" : "#dbeafe",
                      border: "1px solid #dbe3ef",
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 18 }}>{e.title}</div>
                    <div style={{ color: "#475569", marginTop: 4, textTransform: "capitalize" }}>{e.type}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Training Templates</div>

            <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
              {trainingTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => loadTrainingTemplate(template.id)}
                  style={{
                    textAlign: "left",
                    padding: 14,
                    borderRadius: 16,
                    border: selectedTemplateId === template.id ? "2px solid #061b5b" : "1px solid #dbe3ef",
                    background: selectedTemplateId === template.id ? "#dbeafe" : "#f8fafc",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{template.name}</div>
                  <div style={{ color: "#64748b", marginTop: 4 }}>{template.notes}</div>
                </button>
              ))}
            </div>

            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Training Plan</div>

            <div style={{ display: "grid", gap: 10 }}>
              <TrainingCard title="Session Title" desc={trainingPlan.title} />
              <TrainingCard title="Warm Up" desc={trainingPlan.warmUp} />
              <TrainingCard title="Drill 1" desc={trainingPlan.drill1} />
              <TrainingCard title="Drill 2" desc={trainingPlan.drill2} />
              <TrainingCard title="Game" desc={trainingPlan.game} />
              <TrainingCard title="Coach Notes" desc={trainingPlan.notes} />
            </div>
          </div>
        </div>
      )}

      {tab === "match" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div
            style={{
              ...cardStyle("linear-gradient(135deg, #061b5b 0%, #0c235f 100%)"),
              color: "white",
            }}
          >
            <div style={{ fontSize: 14, opacity: 0.85, fontWeight: 800 }}>Match Center</div>
            <div style={{ fontSize: 32, fontWeight: 900, marginTop: 8 }}>League Game</div>
            <div style={{ marginTop: 8, opacity: 0.9 }}>Sunday 15/03/2026 • 10:00</div>
          </div>

          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {[
              ["overview", "Overview"],
              ["lineup", "Lineup"],
              ["live", "Live"],
              ["stats", "Stats"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setMatchTab(value as MatchTab)}
                style={{
                  ...chipStyle(matchTab === value),
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {matchTab === "overview" && (
            <div style={{ display: "grid", gap: 16 }}>
              <div
                style={{
                  ...cardStyle("linear-gradient(135deg, #06122f 0%, #091637 100%)"),
                  color: "white",
                }}
              >
                <div style={{ color: "#cbd5e1", fontWeight: 800, fontSize: 14 }}>Live Scoreboard</div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    gap: 12,
                    marginTop: 14,
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: 17 }}>{homeTeam}</div>
                    <div style={{ fontSize: 68, fontWeight: 900, marginTop: 8 }}>{homeScore}</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                      <button onClick={() => setHomeScore((s) => s + 1)} style={buttonSecondary()}>
                        +1
                      </button>
                      <button onClick={() => setHomeScore((s) => Math.max(0, s - 1))} style={buttonSecondary()}>
                        -1
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: 42, fontWeight: 900 }}>v</div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: 17 }}>{awayTeam}</div>
                    <div style={{ fontSize: 68, fontWeight: 900, marginTop: 8 }}>{awayScore}</div>
                    <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                      <button onClick={() => setAwayScore((s) => s + 1)} style={buttonSecondary()}>
                        +1
                      </button>
                      <button onClick={() => setAwayScore((s) => Math.max(0, s - 1))} style={buttonSecondary()}>
                        -1
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={cardStyle("#ecfccb")}>
                <div style={{ color: "#4d7c0f", fontWeight: 900, fontSize: 16 }}>Quarter 1</div>
                <div style={{ fontSize: 52, fontWeight: 900, marginTop: 8 }}>{formatClock(seconds)}</div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 14 }}>
                  <button onClick={startClock} style={buttonPrimary()}>
                    Start
                  </button>
                  <button onClick={() => setRunning(false)} style={buttonSecondary()}>
                    Pause
                  </button>
                  <button
                    onClick={() => {
                      setRunning(false)
                      setSeconds(0)
                    }}
                    style={buttonSecondary()}
                  >
                    Reset
                  </button>
                  <button onClick={() => stepClock(60)} style={buttonSecondary()}>
                    +1 min
                  </button>
                </div>
              </div>
            </div>
          )}

          {matchTab === "lineup" && (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Starting Lineup</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {lineupPlayers.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 900 }}>{p.name}</div>
                        <div style={{ color: "#64748b" }}>{p.position}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Bench</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {benchPlayers.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        background: "#fff7ed",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>{p.name}</div>
                      <div style={{ color: "#64748b" }}>{p.position}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {matchTab === "live" && (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Live Goals & Assists</div>

                <div style={{ display: "grid", gap: 10 }}>
                  {players.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        border: "1px solid #e2e8f0",
                        padding: 14,
                        borderRadius: 18,
                        background: "#ffffff",
                      }}
                    >
                      <div style={{ fontWeight: 900, fontSize: 18 }}>{p.name}</div>
                      <div style={{ color: "#64748b", marginTop: 4 }}>
                        {p.position} • Goals: {p.goals} • Assists: {p.assists}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(4, 1fr)",
                          gap: 8,
                          marginTop: 12,
                        }}
                      >
                        <button onClick={() => updateStat(p.id, "goal", 1)} style={buttonPrimary()}>
                          + Goal
                        </button>
                        <button onClick={() => updateStat(p.id, "goal", -1)} style={buttonSecondary()}>
                          - Goal
                        </button>
                        <button onClick={() => updateStat(p.id, "assist", 1)} style={buttonPrimary()}>
                          + Assist
                        </button>
                        <button onClick={() => updateStat(p.id, "assist", -1)} style={buttonSecondary()}>
                          - Assist
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Substitution History</div>

                <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
                  <select
                    value={subOffId}
                    onChange={(e) => setSubOffId(e.target.value)}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      border: "1px solid #cbd5e1",
                      fontSize: 16,
                    }}
                  >
                    <option value="">Select player off</option>
                    {lineupPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={subOnId}
                    onChange={(e) => setSubOnId(e.target.value)}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      border: "1px solid #cbd5e1",
                      fontSize: 16,
                    }}
                  >
                    <option value="">Select player on</option>
                    {benchPlayers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  <button onClick={doSubstitution} style={buttonPrimary()}>
                    Save Substitution
                  </button>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {timeline.filter((t) => t.type === "sub").length === 0 ? (
                    <div style={{ color: "#64748b" }}>No substitutions yet.</div>
                  ) : (
                    timeline
                      .filter((t) => t.type === "sub")
                      .sort((a, b) => a.minute - b.minute)
                      .map((t) => (
                        <div
                          key={t.id}
                          style={{
                            padding: 12,
                            borderRadius: 14,
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <div style={{ fontWeight: 900 }}>{t.minute}'</div>
                          <div style={{ color: "#475569", marginTop: 4 }}>{t.text}</div>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Match Timeline</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {[...timeline]
                    .sort((a, b) => a.minute - b.minute)
                    .map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "60px 1fr",
                          gap: 12,
                          padding: 12,
                          borderRadius: 14,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ fontWeight: 900 }}>{t.minute}'</div>
                        <div>
                          <div style={{ fontWeight: 800, textTransform: "capitalize" }}>{t.type}</div>
                          <div style={{ color: "#475569", marginTop: 4 }}>{t.text}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {matchTab === "stats" && (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Player Match Stats</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {players.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div style={{ fontWeight: 900 }}>{p.name}</div>
                      <div style={{ color: "#64748b", marginTop: 4 }}>
                        {p.position} • {p.goals} goals • {p.assists} assists
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "stats" && (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Team Stats</div>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 800 }}>Total goals: {totalGoals}</div>
              <div style={{ fontWeight: 800 }}>Total assists: {totalAssists}</div>
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Squad</div>
            <div style={{ display: "grid", gap: 10 }}>
              {players.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{p.name}</div>
                  <div style={{ color: "#64748b", marginTop: 4 }}>
                    {p.position} • {p.goals}G • {p.assists}A
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
