"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Clock3,
  FilePenLine,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Users,
} from "lucide-react"
import EventsScreen from "../events/EventsScreen"
import PremiumWorkspaceHeader from "../ui/PremiumWorkspaceHeader"
import { useSquadPlayers } from "../../lib/useSquadPlayers"

type Block = {
  id: string
  name: string
  minutes: number
  focus: string
  category?: string
}

type Attendance = "Present" | "Late" | "Absent" | "Unmarked"
type Marks = Record<string, Attendance>
type Notes = Record<string, string>
type TrainingView = "plan" | "register" | "run" | "schedule"

const key = "football-os-training-plan-v3"
const legacyKey = "football-os-training-plan-v2"
const historyKey = "football-os-training-history-v1"

const defaults: Block[] = [
  { id: "arrival", name: "Arrival & ball mastery", minutes: 10, focus: "Touches, movement and confidence", category: "Arrival" },
  { id: "warmup", name: "Dynamic warm-up", minutes: 10, focus: "Prepare to move, turn and accelerate", category: "Warm-up" },
  { id: "practice", name: "Main practice", minutes: 20, focus: "Technical theme under pressure", category: "Practice" },
  { id: "game", name: "Small-sided game", minutes: 20, focus: "Transfer the theme into football", category: "Game" },
  { id: "finish", name: "Cool-down & review", minutes: 5, focus: "Recover and reinforce learning", category: "Review" },
]

function normaliseBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) return defaults
  return value.map((block, index) => {
    const candidate = block as Partial<Block>
    return {
      id: candidate.id ?? `block-${index}`,
      name: candidate.name ?? "Training activity",
      minutes: Number.isFinite(candidate.minutes) ? Math.max(5, Number(candidate.minutes)) : 10,
      focus: candidate.focus ?? "",
      category: candidate.category ?? "Activity",
    }
  })
}

function formatTimer(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

export default function TrainingScreen() {
  const [view, setView] = useState<TrainingView>("plan")
  const [sessionTitle, setSessionTitle] = useState("U11 Girls training")
  const [sessionGoal, setSessionGoal] = useState("Confidence, sharp decisions and lots of touches")
  const [blocks, setBlocks] = useState<Block[]>(defaults)
  const players = useSquadPlayers()
  const [marks, setMarks] = useState<Marks>({})
  const [notes, setNotes] = useState<Notes>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [notePlayerId, setNotePlayerId] = useState<string | null>(null)
  const [saved, setSaved] = useState(true)
  const [running, setRunning] = useState<string | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [completed, setCompleted] = useState<string[]>([])
  const [sessionDone, setSessionDone] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key) ?? localStorage.getItem(legacyKey)
      if (!raw) return
      const value = JSON.parse(raw)
      setSessionTitle(value.sessionTitle ?? "U11 Girls training")
      setSessionGoal(value.sessionGoal ?? "Confidence, sharp decisions and lots of touches")
      setBlocks(normaliseBlocks(value.blocks))
      setMarks(value.marks ?? {})
      setNotes(value.notes ?? {})
      setCompleted(Array.isArray(value.completed) ? value.completed : [])
    } catch {}
  }, [])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000)
    return () => window.clearInterval(timer)
  }, [running])

  const total = useMemo(() => blocks.reduce((sum, block) => sum + block.minutes, 0), [blocks])
  const present = players.filter((player) => ["Present", "Late"].includes(marks[player.id] ?? "Unmarked")).length
  const marked = players.filter((player) => (marks[player.id] ?? "Unmarked") !== "Unmarked").length
  const runningBlock = blocks.find((block) => block.id === running) ?? null
  const runningIndex = running ? blocks.findIndex((block) => block.id === running) : -1
  const liveProgress = runningBlock ? Math.min(100, (elapsed / Math.max(1, runningBlock.minutes * 60)) * 100) : 0
  const completion = blocks.length ? Math.round((completed.length / blocks.length) * 100) : 0

  function dirty() {
    setSaved(false)
    setSessionDone(false)
  }

  function persist() {
    localStorage.setItem(
      key,
      JSON.stringify({ sessionTitle, sessionGoal, blocks, marks, notes, completed })
    )
    setSaved(true)
  }

  function move(index: number, direction: number) {
    const target = index + direction
    if (target < 0 || target >= blocks.length) return
    setBlocks((current) => {
      const next = [...current]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    dirty()
  }

  function add() {
    const id = `custom-${Date.now()}`
    setBlocks((current) => [
      ...current,
      {
        id,
        name: "New activity",
        minutes: 10,
        focus: "Add the coaching detail players need",
        category: "Activity",
      },
    ])
    setExpandedId(id)
    dirty()
  }

  function update(id: string, field: keyof Block, value: string | number) {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, [field]: value } : block))
    )
    dirty()
  }

  function mark(id: string, value: Attendance) {
    setMarks((current) => ({ ...current, [id]: value }))
    dirty()
  }

  function startBlock(id: string) {
    if (running === id) {
      setRunning(null)
      return
    }
    setRunning(id)
    setElapsed(0)
    setView("run")
  }

  function completeCurrent() {
    if (!runningBlock) return
    const currentId = runningBlock.id
    setCompleted((current) => (current.includes(currentId) ? current : [...current, currentId]))
    const next = blocks[runningIndex + 1]
    if (next) {
      setRunning(next.id)
      setElapsed(0)
    } else {
      setRunning(null)
      setElapsed(0)
    }
    dirty()
  }

  function finish() {
    const record = {
      id: Date.now(),
      date: new Date().toISOString(),
      title: sessionTitle,
      goal: sessionGoal,
      duration: total,
      blocks,
      completed,
      attendance: marks,
      notes,
    }
    try {
      const old = JSON.parse(localStorage.getItem(historyKey) ?? "[]")
      localStorage.setItem(historyKey, JSON.stringify([record, ...old].slice(0, 50)))
      persist()
      setRunning(null)
      setSessionDone(true)
    } catch {}
  }

  function resetPlan() {
    setBlocks(defaults)
    setCompleted([])
    setRunning(null)
    setElapsed(0)
    setExpandedId(null)
    dirty()
  }

  return (
    <div style={shell}>
      <PremiumWorkspaceHeader
        eyebrow="TRAINING WORKSPACE"
        title="Training Command"
        description="Plan quickly, run cleanly and capture development without fighting a long form on the touchline."
        badge={`${total} min plan`}
        meta={`${present} here · ${marked}/${players.length} marked · ${completion}% complete`}
      />

      <section style={missionCard}>
        <div style={{ minWidth: 0 }}>
          <small style={eyebrow}>TODAY'S SESSION</small>
          <input
            aria-label="Session title"
            value={sessionTitle}
            onChange={(event) => {
              setSessionTitle(event.target.value)
              dirty()
            }}
            style={missionTitle}
          />
          <input
            aria-label="Session objective"
            value={sessionGoal}
            onChange={(event) => {
              setSessionGoal(event.target.value)
              dirty()
            }}
            style={missionGoal}
          />
        </div>
        <div style={durationBadge}>
          <Clock3 size={16} />
          <strong>{total}</strong>
          <span>min</span>
        </div>
      </section>

      <nav aria-label="Training workspace" style={segmented}>
        <ViewButton active={view === "plan"} onClick={() => setView("plan")} icon={<FilePenLine size={15} />} label="Plan" />
        <ViewButton active={view === "register"} onClick={() => setView("register")} icon={<Users size={15} />} label="Register" />
        <ViewButton active={view === "run"} onClick={() => setView("run")} icon={<Play size={15} />} label="Run" />
        <ViewButton active={view === "schedule"} onClick={() => setView("schedule")} icon={<CalendarDays size={15} />} label="Schedule" />
      </nav>

      {view === "plan" && (
        <section style={panel}>
          <div style={head}>
            <div>
              <small style={eyebrow}>SESSION BUILDER</small>
              <h2 style={title}>Activities</h2>
              <p style={copy}>Compact by default. Open only the activity you need to change.</p>
            </div>
            <span style={statusPill}>{blocks.length} BLOCKS</span>
          </div>

          <div style={activityList}>
            {blocks.map((block, index) => {
              const expanded = expandedId === block.id
              const done = completed.includes(block.id)
              return (
                <article key={block.id} style={expanded ? activityOpen : activityRow}>
                  <div style={activityNumber}>{done ? <Check size={14} /> : index + 1}</div>
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : block.id)}
                    style={activityMain}
                    aria-expanded={expanded}
                  >
                    <span style={activityTitle}>
                      <strong>{block.name}</strong>
                      <small>{block.category ?? "Activity"} · {block.focus}</small>
                    </span>
                    <span style={activityMinutes}>{block.minutes}m</span>
                  </button>
                  <div style={reorder}>
                    <button type="button" aria-label={`Move ${block.name} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                      <ChevronUp size={16} />
                    </button>
                    <button type="button" aria-label={`Move ${block.name} down`} disabled={index === blocks.length - 1} onClick={() => move(index, 1)}>
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {expanded && (
                    <div style={editor}>
                      <label style={fieldLabel}>
                        Activity
                        <input value={block.name} onChange={(event) => update(block.id, "name", event.target.value)} />
                      </label>
                      <div style={editorGrid}>
                        <label style={fieldLabel}>
                          Category
                          <input value={block.category ?? ""} onChange={(event) => update(block.id, "category", event.target.value)} />
                        </label>
                        <div style={minuteEditor}>
                          <button type="button" onClick={() => update(block.id, "minutes", Math.max(5, block.minutes - 5))}>−5</button>
                          <strong>{block.minutes} min</strong>
                          <button type="button" onClick={() => update(block.id, "minutes", block.minutes + 5)}>+5</button>
                        </div>
                      </div>
                      <label style={fieldLabel}>
                        Coaching focus
                        <textarea
                          rows={2}
                          value={block.focus}
                          onChange={(event) => update(block.id, "focus", event.target.value)}
                        />
                      </label>
                      <div style={editorActions}>
                        <button type="button" style={runButton} onClick={() => startBlock(block.id)}>
                          <Play size={15} /> Run this
                        </button>
                        <button
                          type="button"
                          style={deleteButton}
                          onClick={() => {
                            setBlocks((current) => current.filter((item) => item.id !== block.id))
                            setCompleted((current) => current.filter((id) => id !== block.id))
                            setExpandedId(null)
                            dirty()
                          }}
                        >
                          <Trash2 size={15} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>

          <div style={planActions}>
            <button type="button" style={secondary} onClick={add}><Plus size={16} /> Add activity</button>
            <button type="button" style={secondary} onClick={resetPlan}><RotateCcw size={16} /> Reset plan</button>
          </div>
        </section>
      )}

      {view === "register" && (
        <section style={panel}>
          <div style={head}>
            <div>
              <small style={eyebrow}>ATTENDANCE</small>
              <h2 style={title}>Pitch register</h2>
              <p style={copy}>One tap to mark attendance. Notes stay tucked away until you need them.</p>
            </div>
            <span style={statusPill}>{present} HERE</span>
          </div>

          <div style={registerSummary}>
            <Metric value={String(players.length)} label="Squad" />
            <Metric value={String(marked)} label="Marked" />
            <Metric value={String(present)} label="Here" />
          </div>

          <div style={playerList}>
            {players.map((player) => {
              const current = marks[player.id] ?? "Unmarked"
              const noteOpen = notePlayerId === player.id
              return (
                <article key={player.id} style={playerCard}>
                  <div style={playerTop}>
                    <div>
                      <strong>{player.knownAs ?? player.name}</strong>
                      <small>{player.primaryPosition} · {current}</small>
                    </div>
                    <button
                      type="button"
                      style={noteToggle}
                      onClick={() => setNotePlayerId(noteOpen ? null : player.id)}
                      aria-expanded={noteOpen}
                    >
                      <FilePenLine size={15} />
                    </button>
                  </div>
                  <div style={markGrid}>
                    {(["Present", "Late", "Absent"] as Attendance[]).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => mark(player.id, value)}
                        style={current === value ? activeMark : markButton}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  {noteOpen && (
                    <textarea
                      rows={2}
                      placeholder="Development note…"
                      value={notes[player.id] ?? ""}
                      onChange={(event) => {
                        setNotes((currentNotes) => ({ ...currentNotes, [player.id]: event.target.value }))
                        dirty()
                      }}
                    />
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}

      {view === "run" && (
        <section style={panel}>
          <div style={head}>
            <div>
              <small style={eyebrow}>PITCH MODE</small>
              <h2 style={title}>{runningBlock ? runningBlock.name : "Run the session"}</h2>
              <p style={copy}>{runningBlock ? runningBlock.focus : "Choose an activity and keep the phone interaction minimal."}</p>
            </div>
            <span style={running ? livePill : statusPill}>{running ? "LIVE" : "READY"}</span>
          </div>

          {runningBlock ? (
            <div style={liveCard}>
              <div style={liveClock}>{formatTimer(elapsed)}</div>
              <div style={progressTrack}><span style={{ ...progressFill, width: `${liveProgress}%` }} /></div>
              <div style={liveMeta}>
                <span>{runningBlock.minutes} min target</span>
                <span>{Math.round(liveProgress)}%</span>
              </div>
              <div style={liveActions}>
                <button type="button" style={secondary} onClick={() => setRunning(null)}><Pause size={16} /> Pause</button>
                <button type="button" style={completeButton} onClick={completeCurrent}><CircleCheck size={16} /> Complete & next</button>
              </div>
            </div>
          ) : (
            <div style={readyCard}>
              <Play size={22} />
              <strong>Ready when you are</strong>
              <span>Tap any activity below to start its timer.</span>
            </div>
          )}

          <div style={runList}>
            {blocks.map((block, index) => {
              const done = completed.includes(block.id)
              const active = running === block.id
              return (
                <button
                  key={block.id}
                  type="button"
                  style={active ? runRowActive : runRow}
                  onClick={() => startBlock(block.id)}
                >
                  <span style={runIndex}>{done ? <Check size={14} /> : index + 1}</span>
                  <span style={runCopy}>
                    <strong>{block.name}</strong>
                    <small>{block.focus}</small>
                  </span>
                  <b>{active ? formatTimer(elapsed) : done ? "Done" : `${block.minutes}m`}</b>
                </button>
              )
            })}
          </div>

          <button type="button" style={finishButton} onClick={finish}>
            <Check size={18} />
            {sessionDone ? "Session recorded ✓" : "Finish & record session"}
          </button>
        </section>
      )}

      {view === "schedule" && (
        <section style={scheduleShell}>
          <EventsScreen />
        </section>
      )}

      <div style={stickySave}>
        <div>
          <small style={eyebrow}>SESSION STATE</small>
          <strong>{saved ? "Saved on this device" : "Unsaved changes"}</strong>
        </div>
        <button type="button" style={primary} onClick={persist}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Saved" : "Save session"}
        </button>
      </div>
    </div>
  )
}

function ViewButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}) {
  return (
    <button type="button" aria-pressed={active} onClick={onClick} style={active ? segmentActive : segment}>
      {icon}
      <span>{label}</span>
    </button>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div style={metric}>
      <strong>{value}</strong>
      <small>{label}</small>
    </div>
  )
}

const shell: CSSProperties = { display: "grid", gap: 12, paddingBottom: 150, color: "white" }
const panel: CSSProperties = { borderRadius: 24, padding: 14, background: "rgba(8,15,32,.88)", border: "1px solid rgba(148,163,184,.12)", display: "grid", gap: 12 }
const missionCard: CSSProperties = { display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "center", padding: 14, borderRadius: 22, background: "linear-gradient(145deg,#0d2039,#0a1729)", border: "1px solid #203650" }
const missionTitle: CSSProperties = { width: "100%", marginTop: 5, minHeight: 38, padding: 0, border: "0!important", background: "transparent!important", color: "white", fontSize: 22, fontWeight: 950, letterSpacing: "-.03em" }
const missionGoal: CSSProperties = { width: "100%", marginTop: 2, minHeight: 34, padding: 0, border: "0!important", background: "transparent!important", color: "#8fa1b8", fontSize: 12, fontWeight: 700 }
const durationBadge: CSSProperties = { minWidth: 70, minHeight: 70, borderRadius: 18, display: "grid", gridTemplateColumns: "auto auto", placeItems: "center", alignContent: "center", gap: "0 5px", background: "rgba(37,99,235,.15)", color: "#bfdbfe" }
const segmented: CSSProperties = { position: "sticky", top: 72, zIndex: 25, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, padding: 4, borderRadius: 17, background: "rgba(7,16,31,.96)", border: "1px solid #1f3048", backdropFilter: "blur(18px)" }
const segment: CSSProperties = { minHeight: 44, border: 0, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "transparent", color: "#71839b", fontWeight: 900, fontSize: 11 }
const segmentActive: CSSProperties = { ...segment, background: "#173b70", color: "white" }
const head: CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }
const eyebrow: CSSProperties = { color: "#93c5fd", fontSize: 9, fontWeight: 950, letterSpacing: 1.1 }
const title: CSSProperties = { margin: "4px 0 0", fontSize: 21 }
const copy: CSSProperties = { margin: "5px 0 0", color: "rgba(226,232,240,.58)", fontSize: 12, lineHeight: 1.4 }
const statusPill: CSSProperties = { borderRadius: 999, padding: "7px 9px", background: "#10274b", color: "#bfdbfe", fontSize: 9, fontWeight: 950, whiteSpace: "nowrap" }
const livePill: CSSProperties = { ...statusPill, background: "rgba(220,38,38,.18)", color: "#fca5a5" }
const activityList: CSSProperties = { display: "grid", gap: 7 }
const activityRow: CSSProperties = { display: "grid", gridTemplateColumns: "34px minmax(0,1fr) 34px", alignItems: "center", gap: 8, minHeight: 64, padding: 8, borderRadius: 17, background: "rgba(15,23,42,.58)", border: "1px solid rgba(148,163,184,.08)" }
const activityOpen: CSSProperties = { ...activityRow, background: "rgba(15,32,58,.9)", borderColor: "rgba(96,165,250,.22)" }
const activityNumber: CSSProperties = { width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: 10, background: "#173b70", color: "#dbeafe", fontSize: 11, fontWeight: 950 }
const activityMain: CSSProperties = { minWidth: 0, minHeight: 48, border: 0, background: "transparent", color: "white", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 8, alignItems: "center", textAlign: "left", padding: 0 }
const activityTitle: CSSProperties = { minWidth: 0, display: "grid", gap: 3 }
const activityMinutes: CSSProperties = { minWidth: 42, padding: "5px 7px", borderRadius: 999, background: "rgba(37,99,235,.14)", color: "#bfdbfe", textAlign: "center", fontSize: 10, fontWeight: 950 }
const reorder: CSSProperties = { display: "grid", gap: 3 }
const editor: CSSProperties = { gridColumn: "1/-1", display: "grid", gap: 9, padding: 10, borderRadius: 14, background: "rgba(2,6,23,.38)" }
const fieldLabel: CSSProperties = { display: "grid", gap: 5, color: "#8ea0b7", fontSize: 9, fontWeight: 900, letterSpacing: ".04em" }
const editorGrid: CSSProperties = { display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "end" }
const minuteEditor: CSSProperties = { display: "grid", gridTemplateColumns: "42px 76px 42px", gap: 4, alignItems: "center", textAlign: "center" }
const editorActions: CSSProperties = { display: "grid", gridTemplateColumns: "1fr auto", gap: 7 }
const planActions: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }
const baseButton: CSSProperties = { minHeight: 46, borderRadius: 13, border: "1px solid rgba(148,163,184,.12)", color: "white", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }
const secondary: CSSProperties = { ...baseButton, background: "rgba(2,6,23,.48)" }
const primary: CSSProperties = { ...baseButton, minWidth: 122, background: "linear-gradient(135deg,#2563eb,#5b4fe9)" }
const runButton: CSSProperties = { ...baseButton, minHeight: 42, background: "rgba(37,99,235,.18)", color: "#bfdbfe" }
const deleteButton: CSSProperties = { ...baseButton, minHeight: 42, padding: "0 12px", background: "rgba(127,29,29,.22)", color: "#fca5a5" }
const registerSummary: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }
const metric: CSSProperties = { display: "grid", gap: 2, padding: 10, borderRadius: 14, textAlign: "center", background: "rgba(2,6,23,.4)", border: "1px solid rgba(148,163,184,.08)" }
const playerList: CSSProperties = { display: "grid", gap: 7 }
const playerCard: CSSProperties = { display: "grid", gap: 8, padding: 10, borderRadius: 16, background: "rgba(2,6,23,.38)", border: "1px solid rgba(148,163,184,.07)" }
const playerTop: CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }
const noteToggle: CSSProperties = { width: 42, minHeight: 42, border: "1px solid rgba(148,163,184,.1)", borderRadius: 12, background: "#10243d", color: "#bfdbfe", display: "grid", placeItems: "center" }
const markGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5 }
const markButton: CSSProperties = { minHeight: 38, borderRadius: 11, border: "1px solid rgba(148,163,184,.12)", background: "rgba(15,23,42,.6)", color: "rgba(255,255,255,.7)", fontWeight: 850, fontSize: 10 }
const activeMark: CSSProperties = { ...markButton, background: "linear-gradient(135deg,#2563eb,#5b4fe9)", color: "white" }
const liveCard: CSSProperties = { display: "grid", gap: 10, padding: 16, borderRadius: 20, background: "radial-gradient(circle at 50% 0%,rgba(59,130,246,.2),transparent 45%),#091729", border: "1px solid rgba(96,165,250,.2)" }
const liveClock: CSSProperties = { textAlign: "center", fontSize: 50, lineHeight: 1, fontWeight: 950, fontVariantNumeric: "tabular-nums", letterSpacing: "-.05em" }
const progressTrack: CSSProperties = { height: 7, overflow: "hidden", borderRadius: 999, background: "#142033" }
const progressFill: CSSProperties = { display: "block", height: "100%", borderRadius: 999, background: "linear-gradient(90deg,#2563eb,#60a5fa)", transition: "width .25s linear" }
const liveMeta: CSSProperties = { display: "flex", justifyContent: "space-between", color: "#8092aa", fontSize: 10, fontWeight: 850 }
const liveActions: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 7 }
const completeButton: CSSProperties = { ...baseButton, background: "linear-gradient(135deg,#15803d,#166534)" }
const readyCard: CSSProperties = { minHeight: 150, display: "grid", placeItems: "center", alignContent: "center", gap: 7, padding: 18, borderRadius: 20, background: "rgba(2,6,23,.38)", color: "#93c5fd", textAlign: "center" }
const runList: CSSProperties = { display: "grid", gap: 6 }
const runRow: CSSProperties = { minHeight: 62, display: "grid", gridTemplateColumns: "32px minmax(0,1fr) auto", gap: 8, alignItems: "center", border: "1px solid rgba(148,163,184,.08)", borderRadius: 15, padding: 8, background: "rgba(2,6,23,.36)", color: "white", textAlign: "left" }
const runRowActive: CSSProperties = { ...runRow, borderColor: "rgba(96,165,250,.35)", background: "rgba(30,64,175,.17)" }
const runIndex: CSSProperties = { width: 28, height: 28, borderRadius: 9, display: "grid", placeItems: "center", background: "#102b50", color: "#bfdbfe", fontSize: 10, fontWeight: 950 }
const runCopy: CSSProperties = { minWidth: 0, display: "grid", gap: 2 }
const finishButton: CSSProperties = { ...baseButton, minHeight: 52, background: "linear-gradient(135deg,#15803d,#166534)" }
const scheduleShell: CSSProperties = { display: "grid", gap: 10 }
const stickySave: CSSProperties = { position: "sticky", bottom: 82, zIndex: 40, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, padding: 10, borderRadius: 16, background: "rgba(7,16,31,.96)", border: "1px solid #29415f", backdropFilter: "blur(18px)", boxShadow: "0 14px 38px rgba(0,0,0,.32)" }
