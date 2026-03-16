"use client"

import { useEffect, useMemo, useState } from "react"
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  type DragEndEvent,
} from "@dnd-kit/core"
import { supabase } from "../supabase"

type Position = "GK" | "DEF" | "MID" | "FWD"
type MatchFormat = "7v7" | "9v9" | "11v11"
type EventType = "MATCH" | "TRAINING" | "NO_GAME" | "HOLIDAY"
type AttendanceStatus = "P" | "R" | "NO" | "OFF" | "INJ"
type AppTab = "home" | "players" | "events" | "match" | "stats"

type Player = {
  id: string
  name: string
  positions: Position[]
  mainGK: boolean
  backupGK: boolean
}

type DbPlayer = {
  id: string
  name: string
  positions_json: string
  main_gk: boolean
  backup_gk: boolean
}

type EventItem = {
  id: string
  day: string
  date: string
  kickOff: string
  type: EventType
  title: string
  home: string
  away: string
  notes: string
}

type DbEvent = {
  id: string
  day: string
  date: string
  kick_off: string
  type: string
  title: string
  home: string | null
  away: string | null
  notes: string | null
}

type DbAttendance = {
  event_id: string
  player_id: string
  status: AttendanceStatus
}

type PlayerMatchStat = {
  playerId: string
  goals: number
  assists: number
  minutes: number
}

type DbPlayerMatchStat = {
  event_id: string
  player_id: string
  goals: number
  assists: number
  minutes: number
}

type DbQuarterPlan = {
  event_id: string
  quarter_number: number
  lineup_json: string
}

const ALL_POSITIONS: Position[] = ["GK", "DEF", "MID", "FWD"]
const ATTENDANCE_OPTIONS: AttendanceStatus[] = ["P", "R", "NO", "OFF", "INJ"]

const FORMATIONS: Record<MatchFormat, Record<string, Position[]>> = {
  "7v7": {
    "2-3-1": ["FWD", "MID", "MID", "MID", "DEF", "DEF", "GK"],
    "3-2-1": ["FWD", "MID", "MID", "DEF", "DEF", "DEF", "GK"],
  },
  "9v9": {
    "3-3-2": ["FWD", "FWD", "MID", "MID", "MID", "DEF", "DEF", "DEF", "GK"],
    "3-4-1": ["FWD", "MID", "MID", "MID", "MID", "DEF", "DEF", "DEF", "GK"],
  },
  "11v11": {
    "4-3-3": ["FWD", "FWD", "FWD", "MID", "MID", "MID", "DEF", "DEF", "DEF", "DEF", "GK"],
    "4-4-2": ["FWD", "FWD", "MID", "MID", "MID", "MID", "DEF", "DEF", "DEF", "DEF", "GK"],
    "3-5-2": ["FWD", "FWD", "MID", "MID", "MID", "MID", "MID", "DEF", "DEF", "DEF", "GK"],
  },
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function formatSeconds(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function safeParsePositions(value: string | null | undefined): Position[] {
  try {
    const parsed = JSON.parse(value || "[]")
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is Position => ALL_POSITIONS.includes(x as Position))
  } catch {
    return []
  }
}

function safeParseLineup(value: string | null | undefined): (string | null)[] {
  try {
    const parsed = JSON.parse(value || "[]")
    if (!Array.isArray(parsed)) return []
    return parsed.map((x) => (typeof x === "string" ? x : null))
  } catch {
    return []
  }
}

function normalizeLineup(lineup: (string | null)[], length: number) {
  const next = Array(length).fill(null) as (string | null)[]
  for (let i = 0; i < length; i++) next[i] = lineup[i] || null
  return next
}

function eventTypeColor(type: EventType) {
  if (type === "MATCH") return "#22c55e"
  if (type === "TRAINING") return "#cbd5e1"
  if (type === "NO_GAME") return "#ef4444"
  return "#84cc16"
}

function attendanceColor(status: AttendanceStatus) {
  if (status === "P") return "#22c55e"
  if (status === "R") return "#facc15"
  if (status === "NO") return "#ef4444"
  if (status === "INJ") return "#fb923c"
  return "#cbd5e1"
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return "0%"
  return `${Math.round((numerator / denominator) * 100)}%`
}

function playerCanPlaySlot(player: Player, slot: Position) {
  if (slot === "GK") {
    return player.positions.includes("GK") || player.mainGK || player.backupGK
  }
  return player.positions.includes(slot)
}

function cardStyle(background = "#ffffff") {
  return {
    background,
    borderRadius: 20,
    border: "1px solid #e5e7eb",
    padding: 16,
    boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
  } as const
}

function smallActionBtn(background: string, color: string) {
  return {
    padding: "12px 10px",
    borderRadius: 12,
    border: background === "white" ? "1px solid #d1d5db" : "none",
    background,
    color,
    fontWeight: 800,
  } as const
}

function pitchBtnStyle() {
  return {
    padding: "8px 10px",
    borderRadius: 999,
    border: "none",
    background: "white",
    color: "#0f172a",
    fontWeight: 800,
    fontSize: 12,
  } as const
}

function DraggablePlayerCard({
  id,
  name,
  subtitle,
  background = "#fef3c7",
}: {
  id: string
  name: string
  subtitle?: string
  background?: string
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.6 : 1,
    touchAction: "none" as const,
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...style,
        width: "100%",
        boxSizing: "border-box",
        padding: "16px 14px",
        borderRadius: 16,
        border: "1px solid #d1d5db",
        background,
        fontSize: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontWeight: 700,
        cursor: "grab",
      }}
    >
      <span>{name}</span>
      {subtitle ? <span>{subtitle}</span> : null}
    </div>
  )
}

function DroppablePitchSlot({
  dropId,
  slot,
  player,
  selected,
  onClick,
  onBench,
  onInjure,
  timeText,
}: {
  dropId: string
  slot: Position
  player: Player | null
  selected: boolean
  onClick: () => void
  onBench: () => void
  onInjure: () => void
  timeText: string
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: dropId,
  })

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      style={{
        minHeight: 122,
        borderRadius: 18,
        border: selected ? "3px solid #fde68a" : isOver ? "3px solid #93c5fd" : "2px solid rgba(255,255,255,0.65)",
        background: isOver ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.12)",
        padding: 10,
        textAlign: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {player ? (
        <div style={{ width: "100%" }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{slot}</div>
          <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800 }}>{player.name}</div>
          <div style={{ marginTop: 6, fontSize: 14 }}>{timeText}</div>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onBench()
              }}
              style={pitchBtnStyle()}
            >
              Bench
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onInjure()
              }}
              style={pitchBtnStyle()}
            >
              Injured
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{slot}</div>
          <div style={{ marginTop: 8, fontSize: 18 }}>Drop Here</div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const [tab, setTab] = useState<AppTab>("home")

  const [players, setPlayers] = useState<Player[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Record<string, AttendanceStatus>>>({})
  const [statsMap, setStatsMap] = useState<Record<string, Record<string, PlayerMatchStat>>>({})
  const [quarterPlans, setQuarterPlans] = useState<Record<string, Record<number, (string | null)[]>>>({})
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const [playerForm, setPlayerForm] = useState<Player>({
    id: "",
    name: "",
    positions: ["MID"],
    mainGK: false,
    backupGK: false,
  })

  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [eventForm, setEventForm] = useState<EventItem>({
    id: "",
    day: "",
    date: "",
    kickOff: "",
    type: "MATCH",
    title: "",
    home: "",
    away: "",
    notes: "",
  })

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [matchFormat, setMatchFormat] = useState<MatchFormat>("7v7")
  const [formation, setFormation] = useState("2-3-1")

  const [pitchIds, setPitchIds] = useState<(string | null)[]>(Array(7).fill(null))
  const [selectedBenchId, setSelectedBenchId] = useState<string | null>(null)
  const [selectedPitchSlot, setSelectedPitchSlot] = useState<number | null>(null)

  const [matchSeconds, setMatchSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [playerSeconds, setPlayerSeconds] = useState<Record<string, number>>({})
  const [currentQuarter, setCurrentQuarter] = useState(1)

  const pitchSlots = useMemo(() => FORMATIONS[matchFormat][formation] || [], [matchFormat, formation])

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || null
  }, [events, selectedEventId])

  useEffect(() => {
    void loadAll()
  }, [])

  useEffect(() => {
    setPitchIds(Array(pitchSlots.length).fill(null))
    setSelectedBenchId(null)
    setSelectedPitchSlot(null)
  }, [pitchSlots.length])

  useEffect(() => {
    if (!timerRunning || !selectedEvent) return

    const interval = setInterval(() => {
      setMatchSeconds((prev) => prev + 1)
      setPlayerSeconds((prev) => {
        const next = { ...prev }
        pitchIds.forEach((id) => {
          if (!id) return
          next[id] = (next[id] || 0) + 1
        })
        return next
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timerRunning, selectedEvent, pitchIds])

  useEffect(() => {
    if (!selectedEvent) return
    setCurrentQuarter(1)
    setTimerRunning(false)
    setMatchSeconds(0)
    setPlayerSeconds({})
    const saved = quarterPlans[selectedEvent.id]?.[1]
    setPitchIds(saved ? normalizeLineup(saved, pitchSlots.length) : Array(pitchSlots.length).fill(null))
    setSelectedBenchId(null)
    setSelectedPitchSlot(null)
  }, [selectedEventId, pitchSlots.length]) // eslint-disable

function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  if (!over) return

  const activeId = String(active.id)
  const overId = String(over.id)

  if (!overId.startsWith("slot-")) return

  const slotIndex = Number(overId.replace("slot-", ""))
  if (Number.isNaN(slotIndex)) return

  const draggedPlayer = availablePlayers.find((p) => p.id === activeId)
  if (!draggedPlayer) return

  const slot = pitchSlots[slotIndex]
  if (!slot) return

  if (!playerCanPlaySlot(draggedPlayer, slot)) {
    alert(`${draggedPlayer.name} cannot play ${slot}`)
    return
  }

  const next = [...pitchIds]

  const existingIndex = next.findIndex((id) => id === activeId)
  const occupyingId = next[slotIndex]

  if (existingIndex !== -1) {
    next[existingIndex] = occupyingId || null
    next[slotIndex] = activeId
  } else {
    next[slotIndex] = activeId
  }

  setPitchIds(next)
  setSelectedBenchId(null)
  setSelectedPitchSlot(null)
}

return (
  <main style={{ padding: 20 }}>

    <h1 style={{ fontSize: 28, fontWeight: 800 }}>
      Sharks Team Manager
    </h1>

    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>

      <div style={{ marginTop: 30 }}>

        <h2>Pitch</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12
          }}
        >
          {pitchSlots.map((slot, index) => {
            const player = pitchPlayers[index]

            return (
              <DroppablePitchSlot
                key={index}
                dropId={`slot-${index}`}
                slot={slot}
                player={player}
                selected={false}
                onClick={() => {}}
                onBench={() => removeFromPitch(index)}
                onInjure={() => {}}
                timeText=""
              />
            )
          })}
        </div>

      </div>

      <div style={{ marginTop: 40 }}>

        <h2>Bench</h2>

        <div style={{ display: "grid", gap: 10 }}>
          {benchPlayers.map((player) => (
            <DraggablePlayerCard
              key={player.id}
              id={player.id}
              name={player.name}
            />
          ))}
        </div>

      </div>

    </DndContext>

  </main>
)
} 
