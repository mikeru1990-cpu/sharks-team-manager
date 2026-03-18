"use client"

import { useEffect, useMemo, useState } from "react"
import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"

type EventType = "match" | "training" | "none"
type MainTab = "home" | "events" | "match" | "stats"
type MatchTab = "overview" | "lineup" | "live" | "stats"
type MatchFormat = "7v7" | "9v9" | "11v11"
type PitchPosition = "GK" | "DEF" | "MID" | "FWD"
type TimelineEventType = "goal" | "assist" | "sub" | "injury" | "note"

type EventItem = {
  id: string
  title: string
  date: string
  type: EventType
}

type Player = {
  id: string
  name: string
  positions: PitchPosition[]
  goals: number
  assists: number
}

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

type PitchSlot = {
  id: string
  label: string
  position: PitchPosition
}

type MatchEventDraft = {
  type: TimelineEventType
  playerId: string
  secondPlayerId: string
  note: string
}

const FORMATIONS: Record<MatchFormat, Record<string, PitchPosition[]>> = {
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
  },
}

const initialPlayers: Player[] = [
  { id: "1", name: "Lyra Twinning", positions: ["FWD"], goals: 0, assists: 0 },
  { id: "2", name: "Bella Bainbridge", positions: ["MID"], goals: 0, assists: 0 },
  { id: "3", name: "Betsy Rowland", positions: ["MID"], goals: 0, assists: 0 },
  { id: "4", name: "Ella Wilson", positions: ["MID", "DEF"], goals: 0, assists: 0 },
  { id: "5", name: "Bailee Dowler-Rowles", positions: ["DEF"], goals: 0, assists: 0 },
  { id: "6", name: "Evelyn Evans", positions: ["DEF"], goals: 0, assists: 0 },
  { id: "7", name: "Darcy-Rae Russell", positions: ["GK"], goals: 0, assists: 0 },
  { id: "8", name: "Isabella Ogden", positions: ["MID", "FWD"], goals: 0, assists: 0 },
  { id: "9", name: "Martha Scrivens", positions: ["MID"], goals: 0, assists: 0 },
  { id: "10", name: "Poppy Bennett", positions: ["GK"], goals: 0, assists: 0 },
  { id: "11", name: "Lacey Green", positions: ["DEF", "MID"], goals: 0, assists: 0 },
  { id: "12", name: "Harper Cole", positions: ["FWD", "MID"], goals: 0, assists: 0 },
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
    game: "6v6 protecting mini goals",
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

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function cardStyle(bg = "#ffffff") {
  return {
    background: bg,
    border: "1px solid #dbe3ef",
    borderRadius: 24,
    padding: 16,
    boxShadow: "0 6px 18px rgba(15,23,42,0.06)",
  } as const
}

function buttonPrimary() {
  return {
    padding: "14px 16px",
    borderRadius: 16,
    border: "none",
    background: "#061b5b",
    color: "white",
    fontWeight: 800,
    fontSize: 16,
  } as const
}

function buttonSecondary() {
  return {
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#0f172a",
    fontWeight: 800,
    fontSize: 16,
  } as const
}

function chipStyle(active: boolean) {
  return {
    padding: "10px 14px",
    borderRadius: 999,
    border: active ? "2px solid #061b5b" : "1px solid #cbd5e1",
    background: active ? "#dbeafe" : "white",
    color: active ? "#061b5b" : "#334155",
    fontWeight: 800,
    minWidth: 70,
  } as const
}

function canPlaySlot(player: Player, slotPosition: PitchPosition) {
  return player.positions.includes(slotPosition)
}

function makeSlotId(position: PitchPosition, count: number) {
  return `slot-${position.toLowerCase()}-${count}`
}

function makeLabel(position: PitchPosition, count: number, total: number) {
  if (position === "GK") return "Goalkeeper"
  if (position === "FWD") return total === 1 ? "Striker" : `Forward ${count}`
  if (position === "DEF") return total === 2 ? (count === 1 ? "Left Def" : "Right Def") : `Defender ${count}`
  if (position === "MID") return total === 3 ? (count === 1 ? "Left Mid" : count === 2 ? "Center Mid" : "Right Mid") : `Midfielder ${count}`
  return `${position} ${count}`
}

function buildPitchSlots(format: MatchFormat, formation: string): PitchSlot[] {
  const positions = FORMATIONS[format][formation] || []
  const totals = { GK: 0, DEF: 0, MID: 0, FWD: 0 }
  positions.forEach((pos) => {
    totals[pos]++
  })

  const counters = { GK: 0, DEF: 0, MID: 0, FWD: 0 }
  return positions.map((position) => {
    counters[position]++
    return {
      id: makeSlotId(position, counters[position]),
      label: makeLabel(position, counters[position], totals[position]),
      position,
    }
  })
}

function autoBuildLineup(players: Player[], slots: PitchSlot[]) {
  const used = new Set<string>()
  const lineup: Record<string, string | null> = {}

  slots.forEach((slot) => {
    const player = players.find((p) => !used.has(p.id) && canPlaySlot(p, slot.position))
    lineup[slot.id] = player ? player.id : null
    if (player) used.add(player.id)
  })

  const bench = players.filter((p) => !used.has(p.id)).map((p) => p.id)
  return { lineup, bench }
}

function parseDragId(value: string) {
  const parts = value.split("::")
  if (parts.length !== 4) return null
  return {
    playerId: parts[1],
    fromId: parts[3],
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

function DraggablePlayerCard({
  player,
  originId,
  compact = false,
}: {
  player: Player
  originId: string
  compact?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player::${player.id}::from::${originId}`,
  })

  const dragStyle = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.55 : 1,
    touchAction: "none" as const,
    cursor: "grab",
  }

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          ...dragStyle,
          width: "100%",
          maxWidth: 140,
          borderRadius: 18,
          background: "rgba(255,255,255,0.18)",
          padding: 10,
          textAlign: "center",
          color: "white",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            margin: "0 auto",
            background: "linear-gradient(180deg,#ffffff 0%,#dbeafe 100%)",
            color: "#0f172a",
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
            fontSize: 20,
          }}
        >
          {initials(player.name)}
        </div>
        <div style={{ marginTop: 8, fontWeight: 900, fontSize: 14, lineHeight: 1.1 }}>{player.name}</div>
        <div style={{ marginTop: 4, fontSize: 12, opacity: 0.9 }}>{player.positions.join("/")}</div>
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...dragStyle,
        border: "1px solid #e2e8f0",
        padding: 14,
        borderRadius: 18,
        background: "white",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "linear-gradient(180deg,#ffffff 0%,#dbeafe 100%)",
          color: "#0f172a",
          display: "grid",
          placeItems: "center",
          fontWeight: 900,
          fontSize: 24,
          flexShrink: 0,
          boxShadow: "0 6px 14px rgba(15,23,42,0.08)",
        }}
      >
        {initials(player.name)}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>{player.name}</div>
        <div style={{ color: "#64748b", marginTop: 4 }}>
          {player.positions.join("/")} • {player.goals}G • {player.assists}A
        </div>
      </div>
    </div>
  )
}

function PitchDropSlot({
  slot,
  player,
  activePlayer,
}: {
  slot: PitchSlot
  player?: Player
  activePlayer?: Player | null
}) {
  const { isOver, setNodeRef } = useDroppable({ id: slot.id })
  const invalid = activePlayer ? !canPlaySlot(activePlayer, slot.position) : false

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 122,
        borderRadius: 20,
        border: isOver
          ? invalid
            ? "2px solid #ef4444"
            : "2px solid #93c5fd"
          : "1px solid rgba(255,255,255,0.22)",
        background: isOver
          ? invalid
            ? "rgba(239,68,68,0.22)"
            : "rgba(147,197,253,0.25)"
          : "rgba(255,255,255,0.12)",
        backdropFilter: "blur(3px)",
        display: "grid",
        placeItems: "center",
        padding: 10,
      }}
    >
      {player ? (
        <DraggablePlayerCard player={player} originId={slot.id} compact />
      ) : (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.9)" }}>
          <div style={{ fontWeight: 800, fontSize: 12 }}>{slot.label}</div>
          <div style={{ marginTop: 4, fontSize: 12 }}>{slot.position}</div>
          {isOver && invalid ? <div style={{ marginTop: 4, fontSize: 11 }}>Wrong role</div> : null}
        </div>
      )}
    </div>
  )
}

function BenchDropZone({
  children,
  isActive,
}: {
  children: React.ReactNode
  isActive?: boolean
}) {
  const { isOver, setNodeRef } = useDroppable({ id: "bench" })

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: 14,
        borderRadius: 20,
        border: isOver ? "2px solid #93c5fd" : "1px solid #e2e8f0",
        background: isOver ? "#eff6ff" : isActive ? "#fff7ed" : "#fff7ed",
      }}
    >
      {children}
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

  const [matchFormat, setMatchFormat] = useState<MatchFormat>("7v7")
  const [formation, setFormation] = useState("2-3-1")

  const currentSlots = useMemo(() => buildPitchSlots(matchFormat, formation), [matchFormat, formation])
  const [lineupMap, setLineupMap] = useState<Record<string, string | null>>({})
  const [benchIds, setBenchIds] = useState<string[]>([])

  const [savedLineups, setSavedLineups] = useState<
    { id: string; name: string; format: MatchFormat; formation: string; lineup: Record<string, string | null>; bench: string[] }[]
  >([])
  const [lineupName, setLineupName] = useState("")

  const [timeline, setTimeline] = useState<TimelineItem[]>([
    { id: "ev1", minute: 6, type: "goal", text: "Lyra Twinning scored" },
    { id: "ev2", minute: 10, type: "goal", text: "Bella Bainbridge scored" },
  ])

  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTrainingTemplates[0].id)
  const [trainingTemplates] = useState<TrainingTemplate[]>(initialTrainingTemplates)
  const [trainingPlan, setTrainingPlan] = useState({
    title: "Weekly Training Session",
    warmUp: initialTrainingTemplates[0].warmUp,
    drill1: initialTrainingTemplates[0].drill1,
    drill2: initialTrainingTemplates[0].drill2,
    game: initialTrainingTemplates[0].game,
    notes: initialTrainingTemplates[0].notes,
  })

  const [showEventModal, setShowEventModal] = useState(false)
  const [eventDraft, setEventDraft] = useState<MatchEventDraft>({
    type: "goal",
    playerId: "",
    secondPlayerId: "",
    note: "",
  })

  const [activeDragPlayerId, setActiveDragPlayerId] = useState<string | null>(null)

  useEffect(() => {
    const auto = autoBuildLineup(initialPlayers, currentSlots)
    setLineupMap(auto.lineup)
    setBenchIds(auto.bench)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!running) return
    const interval = window.setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => window.clearInterval(interval)
  }, [running])

  const visibleEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDate)
  }, [events, selectedDate])

  const totalGoals = useMemo(() => players.reduce((a, p) => a + p.goals, 0), [players])
  const totalAssists = useMemo(() => players.reduce((a, p) => a + p.assists, 0), [players])

  const lineupPlayerIds = useMemo(() => Object.values(lineupMap).filter(Boolean) as string[], [lineupMap])

  const lineupPlayers = useMemo(
    () => lineupPlayerIds.map((id) => players.find((p) => p.id === id)).filter(Boolean) as Player[],
    [lineupPlayerIds, players]
  )

  const benchPlayers = useMemo(
    () => benchIds.map((id) => players.find((p) => p.id === id)).filter(Boolean) as Player[],
    [benchIds, players]
  )

  const activeDragPlayer = useMemo(
    () => players.find((p) => p.id === activeDragPlayerId) || null,
    [players, activeDragPlayerId]
  )

  const pitchRows = useMemo(() => {
    return [
      currentSlots.filter((s) => s.position === "FWD"),
      currentSlots.filter((s) => s.position === "MID"),
      currentSlots.filter((s) => s.position === "DEF"),
      currentSlots.filter((s) => s.position === "GK"),
    ]
  }, [currentSlots])

  function stepClock(delta: number) {
    setSeconds((prev) => Math.max(0, prev + delta))
  }

  function addTimeline(type: TimelineEventType, text: string) {
    const minute = Math.floor(seconds / 60)
    setTimeline((prev) => [...prev, { id: makeId(), minute, type, text }])
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

    if (delta > 0 && type === "goal") addTimeline("goal", `${player.name} scored`)
    if (delta > 0 && type === "assist") addTimeline("assist", `${player.name} got an assist`)
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

  function applyCurrentFormationReset() {
    const auto = autoBuildLineup(players, currentSlots)
    setLineupMap(auto.lineup)
    setBenchIds(auto.bench)
    addTimeline("note", `Auto lineup set for ${matchFormat} ${formation}`)
  }

  function onChangeFormation(nextFormat: MatchFormat, nextFormation: string) {
    const slots = buildPitchSlots(nextFormat, nextFormation)
    const auto = autoBuildLineup(players, slots)
    setMatchFormat(nextFormat)
    setFormation(nextFormation)
    setLineupMap(auto.lineup)
    setBenchIds(auto.bench)
    addTimeline("note", `Formation changed to ${nextFormation}`)
  }

  function saveCurrentLineup() {
    const name = lineupName.trim()
    if (!name) {
      alert("Enter a lineup name")
      return
    }

    setSavedLineups((prev) => [
      ...prev,
      {
        id: makeId(),
        name,
        format: matchFormat,
        formation,
        lineup: { ...lineupMap },
        bench: [...benchIds],
      },
    ])
    setLineupName("")
  }

  function loadSavedLineup(id: string) {
    const preset = savedLineups.find((item) => item.id === id)
    if (!preset) return
    setMatchFormat(preset.format)
    setFormation(preset.formation)
    setLineupMap(preset.lineup)
    setBenchIds(preset.bench)
    addTimeline("note", `Loaded lineup "${preset.name}"`)
  }

  function deleteSavedLineup(id: string) {
    setSavedLineups((prev) => prev.filter((item) => item.id !== id))
  }

  function handleDragStart(event: DragStartEvent) {
    const parsed = parseDragId(String(event.active.id))
    setActiveDragPlayerId(parsed?.playerId || null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragPlayerId(null)

    const { active, over } = event
    if (!over) return

    const parsed = parseDragId(String(active.id))
    if (!parsed) return

    const { playerId, fromId } = parsed
    const overId = String(over.id)

    const player = players.find((p) => p.id === playerId)
    if (!player) return

    if (overId === "bench") {
      if (fromId === "bench") return

      setLineupMap((prev) => ({ ...prev, [fromId]: null }))
      setBenchIds((prev) => (prev.includes(playerId) ? prev : [...prev, playerId]))
      addTimeline("sub", `${player.name} moved to bench`)
      return
    }

    const targetSlot = currentSlots.find((slot) => slot.id === overId)
    if (!targetSlot) return

    if (!canPlaySlot(player, targetSlot.position)) {
      addTimeline("note", `${player.name} cannot play ${targetSlot.position}`)
      return
    }

    const targetPlayerId = lineupMap[overId]

    if (fromId === "bench") {
      setBenchIds((prev) => prev.filter((id) => id !== playerId))
      setLineupMap((prev) => ({ ...prev, [overId]: playerId }))

      if (targetPlayerId && targetPlayerId !== playerId) {
        setBenchIds((prev) => [...prev, targetPlayerId])
        const offName = players.find((p) => p.id === targetPlayerId)?.name || "Player"
        addTimeline("sub", `${offName} off, ${player.name} on`)
      } else {
        addTimeline("sub", `${player.name} moved onto the pitch`)
      }
      return
    }

    if (fromId.startsWith("slot-")) {
      if (fromId === overId) return

      const swappedPlayer = targetPlayerId ? players.find((p) => p.id === targetPlayerId) : null
      if (swappedPlayer && !canPlaySlot(swappedPlayer, currentSlots.find((s) => s.id === fromId)?.position || "MID")) {
        addTimeline("note", `Swap blocked because ${swappedPlayer.name} cannot play that role`)
        return
      }

      setLineupMap((prev) => {
        const next = { ...prev }
        next[fromId] = targetPlayerId || null
        next[overId] = playerId
        return next
      })

      addTimeline(
        "sub",
        targetPlayerId
          ? `${player.name} swapped with ${swappedPlayer?.name || "player"}`
          : `${player.name} moved to ${targetSlot.label}`
      )
    }
  }

  function saveMatchEvent() {
    const player = players.find((p) => p.id === eventDraft.playerId)
    const secondPlayer = players.find((p) => p.id === eventDraft.secondPlayerId)

    if (eventDraft.type === "goal") {
      if (!player) return alert("Choose a scorer")
      setHomeScore((prev) => prev + 1)
      updateStat(player.id, "goal", 1)
      if (secondPlayer) updateStat(secondPlayer.id, "assist", 1)
      if (secondPlayer) addTimeline("goal", `${player.name} scored, assist ${secondPlayer.name}`)
      setShowEventModal(false)
      return
    }

    if (eventDraft.type === "assist") {
      if (!player) return alert("Choose a player")
      updateStat(player.id, "assist", 1)
      setShowEventModal(false)
      return
    }

    if (eventDraft.type === "injury") {
      if (!player) return alert("Choose a player")
      addTimeline("injury", `${player.name} injured`)
      setShowEventModal(false)
      return
    }

    if (eventDraft.type === "sub") {
      if (!player || !secondPlayer) return alert("Choose players")
      addTimeline("sub", `${player.name} off, ${secondPlayer.name} on`)
      setShowEventModal(false)
      return
    }

    if (eventDraft.type === "note") {
      if (!eventDraft.note.trim()) return alert("Enter a note")
      addTimeline("note", eventDraft.note.trim())
      setShowEventModal(false)
    }
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

      {tab === "home" ? (
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
              Smarter formations, real tactics board, one event flow, saved lineups.
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
      ) : null}

      {tab === "events" ? (
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
      ) : null}

      {tab === "match" ? (
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

          {matchTab === "overview" ? (
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
                  <button onClick={() => setRunning(true)} style={buttonPrimary()}>
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
          ) : null}

          {matchTab === "lineup" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Formation Engine</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <select
                    value={matchFormat}
                    onChange={(e) => {
                      const nextFormat = e.target.value as MatchFormat
                      const firstFormation = Object.keys(FORMATIONS[nextFormat])[0]
                      onChangeFormation(nextFormat, firstFormation)
                    }}
                    style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
                  >
                    <option value="7v7">7v7</option>
                    <option value="9v9">9v9</option>
                    <option value="11v11">11v11</option>
                  </select>

                  <select
                    value={formation}
                    onChange={(e) => onChangeFormation(matchFormat, e.target.value)}
                    style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
                  >
                    {Object.keys(FORMATIONS[matchFormat]).map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
                  <input
                    value={lineupName}
                    onChange={(e) => setLineupName(e.target.value)}
                    placeholder="Save lineup name"
                    style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
                  />
                  <button onClick={saveCurrentLineup} style={buttonPrimary()}>
                    Save
                  </button>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button onClick={applyCurrentFormationReset} style={buttonSecondary()}>
                    Auto Fill
                  </button>
                </div>
              </div>

              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Saved Lineups</div>
                {savedLineups.length === 0 ? (
                  <div style={{ color: "#64748b" }}>No saved lineups yet.</div>
                ) : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {savedLineups.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: 14,
                          borderRadius: 16,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          display: "grid",
                          gridTemplateColumns: "1fr auto auto",
                          gap: 8,
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 900 }}>{item.name}</div>
                          <div style={{ color: "#64748b", marginTop: 4 }}>
                            {item.format} • {item.formation}
                          </div>
                        </div>
                        <button onClick={() => loadSavedLineup(item.id)} style={buttonSecondary()}>
                          Load
                        </button>
                        <button onClick={() => deleteSavedLineup(item.id)} style={buttonSecondary()}>
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Real Drag-and-Drop Tactics Board</div>
                <div style={{ color: "#64748b", marginBottom: 12 }}>
                  Wrong-role drops are blocked. Keepers only go in GK. Save any lineup you like.
                </div>

                <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                  <div
                    style={{
                      ...cardStyle("linear-gradient(180deg, #1d8a3f 0%, #157435 100%)"),
                      color: "white",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 14,
                        border: "2px solid rgba(255,255,255,0.25)",
                        borderRadius: 26,
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: 14,
                        bottom: 14,
                        width: 2,
                        background: "rgba(255,255,255,0.20)",
                        transform: "translateX(-50%)",
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        width: 110,
                        height: 110,
                        borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.22)",
                        transform: "translate(-50%, -50%)",
                        pointerEvents: "none",
                      }}
                    />

                    <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 18 }}>
                      {pitchRows.map((row, rowIndex) => (
                        <div
                          key={rowIndex}
                          style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                            gap: 12,
                            alignItems: "center",
                          }}
                        >
                          {row.map((slot) => {
                            const playerId = lineupMap[slot.id]
                            const player = players.find((p) => p.id === playerId)
                            return (
                              <PitchDropSlot
                                key={slot.id}
                                slot={slot}
                                player={player}
                                activePlayer={activeDragPlayer}
                              />
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Bench</div>
                    <BenchDropZone isActive={!!activeDragPlayer}>
                      <div style={{ display: "grid", gap: 10 }}>
                        {benchPlayers.length === 0 ? (
                          <div style={{ color: "#64748b" }}>No players on the bench.</div>
                        ) : (
                          benchPlayers.map((player) => (
                            <DraggablePlayerCard key={player.id} player={player} originId="bench" />
                          ))
                        )}
                      </div>
                    </BenchDropZone>
                  </div>
                </DndContext>
              </div>
            </div>
          ) : null}

          {matchTab === "live" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={cardStyle()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 22, fontWeight: 900 }}>Single Match Event System</div>
                  <button
                    onClick={() => setShowEventModal(true)}
                    style={buttonPrimary()}
                  >
                    Add Event
                  </button>
                </div>

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
                        {p.positions.join("/")} • Goals: {p.goals} • Assists: {p.assists}
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
          ) : null}

          {matchTab === "stats" ? (
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
                        {p.positions.join("/")} • {p.goals} goals • {p.assists} assists
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "stats" ? (
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
                    {p.positions.join("/")} • {p.goals}G • {p.assists}A
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {showEventModal ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div style={{ ...cardStyle(), width: "100%", maxWidth: 520 }}>
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>Add Match Event</div>

            <div style={{ display: "grid", gap: 12 }}>
              <select
                value={eventDraft.type}
                onChange={(e) =>
                  setEventDraft((prev) => ({
                    ...prev,
                    type: e.target.value as TimelineEventType,
                    playerId: "",
                    secondPlayerId: "",
                    note: "",
                  }))
                }
                style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
              >
                <option value="goal">Goal</option>
                <option value="assist">Assist</option>
                <option value="sub">Sub</option>
                <option value="injury">Injury</option>
                <option value="note">Note</option>
              </select>

              {eventDraft.type !== "note" ? (
                <select
                  value={eventDraft.playerId}
                  onChange={(e) => setEventDraft((prev) => ({ ...prev, playerId: e.target.value }))}
                  style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
                >
                  <option value="">Choose player</option>
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              ) : null}

              {eventDraft.type === "goal" || eventDraft.type === "sub" ? (
                <select
                  value={eventDraft.secondPlayerId}
                  onChange={(e) => setEventDraft((prev) => ({ ...prev, secondPlayerId: e.target.value }))}
                  style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
                >
                  <option value="">{eventDraft.type === "goal" ? "Optional assist" : "Choose second player"}</option>
                  {players
                    .filter((player) => player.id !== eventDraft.playerId)
                    .map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))}
                </select>
              ) : null}

              {eventDraft.type === "note" ? (
                <textarea
                  value={eventDraft.note}
                  onChange={(e) => setEventDraft((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Coach note"
                  style={{
                    minHeight: 100,
                    padding: 14,
                    borderRadius: 14,
                    border: "1px solid #cbd5e1",
                    fontSize: 16,
                    resize: "vertical",
                  }}
                />
              ) : null}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={saveMatchEvent} style={{ ...buttonPrimary(), flex: 1 }}>
                Save Event
              </button>
              <button onClick={() => setShowEventModal(false)} style={{ ...buttonSecondary(), flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
