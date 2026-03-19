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

type MainTab = "home" | "players" | "events" | "match" | "stats"
type MatchTab = "overview" | "lineup" | "live" | "quarters" | "stats"
type EventType = "match" | "training" | "none"
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
  mainGK: boolean
  backupGK: boolean
  captain: boolean
  viceCaptain: boolean
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

type QuarterPlan = {
  lineup: Record<string, string | null>
  bench: string[]
}

type SavedLineup = {
  id: string
  name: string
  format: MatchFormat
  formation: string
  lineup: Record<string, string | null>
  bench: string[]
}

const STORAGE_KEY = "sharks-team-manager-upgrade-11"
const ALL_POSITIONS: PitchPosition[] = ["GK", "DEF", "MID", "FWD"]

const TEAM = {
  name: "Sharks Lioness",
  primary: "#06245c",
  secondary: "#00a6fb",
  accent: "#f59e0b",
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
    "3-5-2": ["FWD", "FWD", "MID", "MID", "MID", "MID", "MID", "DEF", "DEF", "DEF", "GK"],
  },
}

const initialPlayers: Player[] = [
  { id: "1", name: "Lyra Twinning", positions: ["FWD"], mainGK: false, backupGK: false, captain: true, viceCaptain: false },
  { id: "2", name: "Bella Bainbridge", positions: ["MID"], mainGK: false, backupGK: false, captain: false, viceCaptain: true },
  { id: "3", name: "Betsy Rowland", positions: ["MID"], mainGK: false, backupGK: false, captain: false, viceCaptain: false },
  { id: "4", name: "Ella Wilson", positions: ["MID", "DEF"], mainGK: false, backupGK: false, captain: false, viceCaptain: false },
  { id: "5", name: "Bailee Dowler-Rowles", positions: ["DEF"], mainGK: false, backupGK: false, captain: false, viceCaptain: false },
  { id: "6", name: "Evelyn Evans", positions: ["DEF"], mainGK: false, backupGK: false, captain: false, viceCaptain: false },
  { id: "7", name: "Darcy-Rae Russell", positions: ["GK"], mainGK: true, backupGK: false, captain: false, viceCaptain: false },
  { id: "8", name: "Isabella Ogden", positions: ["MID", "FWD"], mainGK: false, backupGK: false, captain: false, viceCaptain: false },
  { id: "9", name: "Martha Scrivens", positions: ["MID"], mainGK: false, backupGK: false, captain: false, viceCaptain: false },
  { id: "10", name: "Poppy Bennett", positions: ["GK"], mainGK: false, backupGK: true, captain: false, viceCaptain: false },
]

const initialEvents: EventItem[] = [
  { id: "1", title: "League Game vs Leonard Stanley", date: "2026-03-15", type: "match" },
  { id: "2", title: "Technical Training", date: "2026-03-13", type: "training" },
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

function formatMinutes(seconds: number) {
  return (seconds / 60).toFixed(1)
}

function formatShortDate(date: string) {
  return date.slice(5)
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
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
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
  } as const
}

function buttonPrimary() {
  return {
    padding: "14px 16px",
    borderRadius: 16,
    border: "none",
    background: TEAM.primary,
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
    border: active ? `2px solid ${TEAM.primary}` : "1px solid #cbd5e1",
    background: active ? "#dbeafe" : "white",
    color: active ? TEAM.primary : "#334155",
    fontWeight: 800,
    minWidth: 70,
  } as const
}

function makeSlotId(position: PitchPosition, count: number) {
  return `slot-${position.toLowerCase()}-${count}`
}

function makeLabel(position: PitchPosition, count: number, total: number) {
  if (position === "GK") return "Goalkeeper"
  if (position === "FWD") return total === 1 ? "Striker" : `Forward ${count}`
  if (position === "DEF") return total === 2 ? (count === 1 ? "Left Def" : "Right Def") : `Defender ${count}`
  if (position === "MID") {
    if (total === 3) return count === 1 ? "Left Mid" : count === 2 ? "Center Mid" : "Right Mid"
    return `Midfielder ${count}`
  }
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

function parseDragId(value: string) {
  const parts = value.split("::")
  if (parts.length !== 4) return null
  return { playerId: parts[1], fromId: parts[3] }
}

function isGoalkeeper(player: Player) {
  return player.mainGK || player.backupGK || player.positions.includes("GK")
}

function goalkeeperPriority(player: Player) {
  if (player.mainGK) return 0
  if (player.backupGK) return 1
  if (player.positions.includes("GK")) return 2
  return 99
}

function canPlaySlot(player: Player, slotPosition: PitchPosition) {
  if (slotPosition === "GK") return isGoalkeeper(player)
  return player.positions.includes(slotPosition)
}

function buildAutoLineup(players: Player[], slots: PitchSlot[]) {
  const used = new Set<string>()
  const lineup: Record<string, string | null> = {}

  slots.forEach((slot) => {
    let candidates = players.filter((p) => !used.has(p.id) && canPlaySlot(p, slot.position))

    if (slot.position === "GK") {
      candidates = [...candidates].sort((a, b) => {
        const aRank = goalkeeperPriority(a)
        const bRank = goalkeeperPriority(b)
        if (aRank !== bRank) return aRank - bRank
        return a.name.localeCompare(b.name)
      })
    } else {
      candidates = [...candidates].sort((a, b) => a.name.localeCompare(b.name))
    }

    const chosen = candidates[0]
    lineup[slot.id] = chosen ? chosen.id : null
    if (chosen) used.add(chosen.id)
  })

  return {
    lineup,
    bench: players.filter((p) => !used.has(p.id)).map((p) => p.id),
  }
}

function ShirtBadge({
  label,
  background,
  color = "white",
}: {
  label: string
  background: string
  color?: string
}) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 8px",
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 900,
        background,
        color,
      }}
    >
      {label}
    </span>
  )
}

function PlayerBadges({ player }: { player: Player }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
      {player.mainGK ? <ShirtBadge label="MAIN GK" background="#14532d" /> : null}
      {!player.mainGK && player.backupGK ? <ShirtBadge label="BACKUP GK" background="#0f766e" /> : null}
      {player.captain ? <ShirtBadge label="C" background={TEAM.accent} color="#111827" /> : null}
      {!player.captain && player.viceCaptain ? <ShirtBadge label="VC" background="#7c3aed" /> : null}
    </div>
  )
}

function ShirtMarker({
  player,
  compact = false,
}: {
  player: Player
  compact?: boolean
}) {
  return (
    <div
      style={{
        width: compact ? 54 : 62,
        height: compact ? 54 : 62,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(18% 6%, 32% 6%, 39% 18%, 61% 18%, 68% 6%, 82% 6%, 94% 30%, 79% 38%, 79% 100%, 21% 100%, 21% 38%, 6% 30%)",
          background: `linear-gradient(180deg, ${TEAM.secondary} 0%, ${TEAM.primary} 100%)`,
          border: "2px solid rgba(255,255,255,0.75)",
          boxShadow: "0 8px 16px rgba(2,6,23,0.18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          color: "white",
          fontSize: compact ? 11 : 12,
          fontWeight: 900,
          textShadow: "0 2px 4px rgba(0,0,0,0.25)",
        }}
      >
        {initials(player.name)}
      </div>
    </div>
  )
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
  subtitle,
}: {
  player: Player
  originId: string
  compact?: boolean
  subtitle?: string
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

  const roleText = [
    player.positions.join("/"),
    player.mainGK ? "Main GK" : null,
    !player.mainGK && player.backupGK ? "Backup GK" : null,
  ]
    .filter(Boolean)
    .join(" • ")

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          ...dragStyle,
          width: "100%",
          maxWidth: 155,
          borderRadius: 18,
          background: "rgba(255,255,255,0.16)",
          padding: 10,
          textAlign: "center",
          color: "white",
        }}
      >
        <ShirtMarker player={player} compact />
        <div style={{ marginTop: 8, fontWeight: 900, fontSize: 14, lineHeight: 1.1 }}>{player.name}</div>
        <div style={{ marginTop: 4, fontSize: 11, opacity: 0.95 }}>{roleText}</div>
        <div style={{ marginTop: 6 }}>
          <PlayerBadges player={player} />
        </div>
        {subtitle ? <div style={{ marginTop: 6, fontSize: 11 }}>{subtitle}</div> : null}
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
      <ShirtMarker player={player} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>{player.name}</div>
        <div style={{ color: "#64748b", marginTop: 4 }}>{roleText}</div>
        <div style={{ marginTop: 6 }}>
          <PlayerBadges player={player} />
        </div>
        {subtitle ? <div style={{ color: "#64748b", marginTop: 6 }}>{subtitle}</div> : null}
      </div>
    </div>
  )
}

function PitchDropSlot({
  slot,
  player,
  activePlayer,
  liveSeconds,
}: {
  slot: PitchSlot
  player?: Player
  activePlayer?: Player | null
  liveSeconds?: number
}) {
  const { isOver, setNodeRef } = useDroppable({ id: slot.id })
  const invalid = activePlayer ? !canPlaySlot(activePlayer, slot.position) : false

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 136,
        borderRadius: 22,
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
        <DraggablePlayerCard
          player={player}
          originId={slot.id}
          compact
          subtitle={typeof liveSeconds === "number" ? `${formatMinutes(liveSeconds)} min` : undefined}
        />
      ) : (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.95)" }}>
          <div style={{ fontWeight: 900, fontSize: 12 }}>{slot.label}</div>
          <div style={{ marginTop: 4, fontSize: 12 }}>{slot.position}</div>
          {slot.position === "GK" ? <div style={{ marginTop: 4, fontSize: 11 }}>GK only</div> : null}
          {isOver && invalid ? <div style={{ marginTop: 6, fontSize: 11 }}>Wrong role</div> : null}
        </div>
      )}
    </div>
  )
}

function BenchDropZone({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: "bench" })

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: 14,
        borderRadius: 20,
        border: isOver ? `2px solid ${TEAM.secondary}` : "1px solid #e2e8f0",
        background: isOver ? "#eff6ff" : "#fff7ed",
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

  const [homeTeam, setHomeTeam] = useState(TEAM.name)
  const [awayTeam, setAwayTeam] = useState("Leonard Stanley U10 Lioness")
  const [homeScore, setHomeScore] = useState(1)
  const [awayScore, setAwayScore] = useState(4)

  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)

  const [matchFormat, setMatchFormat] = useState<MatchFormat>("7v7")
  const [formation, setFormation] = useState("2-3-1")
  const currentSlots = useMemo(() => buildPitchSlots(matchFormat, formation), [matchFormat, formation])

  const [lineupMap, setLineupMap] = useState<Record<string, string | null>>({})
  const [benchIds, setBenchIds] = useState<string[]>([])

  const [savedLineups, setSavedLineups] = useState<SavedLineup[]>([])
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
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null)
  const [eventDraft, setEventDraft] = useState<MatchEventDraft>({
    type: "goal",
    playerId: "",
    secondPlayerId: "",
    note: "",
  })

  const [activeDragPlayerId, setActiveDragPlayerId] = useState<string | null>(null)

  const [liveSecondsMap, setLiveSecondsMap] = useState<Record<string, number>>({})
  const [seasonSecondsMap, setSeasonSecondsMap] = useState<Record<string, number>>({})
  const [currentQuarter, setCurrentQuarter] = useState(1)
  const [quarterPlans, setQuarterPlans] = useState<Record<number, QuarterPlan>>({})
  const [quarterWarnings, setQuarterWarnings] = useState<string[]>([])

  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null)
  const [playerForm, setPlayerForm] = useState<{
    name: string
    positions: PitchPosition[]
    mainGK: boolean
    backupGK: boolean
    captain: boolean
    viceCaptain: boolean
  }>({
    name: "",
    positions: ["MID"],
    mainGK: false,
    backupGK: false,
    captain: false,
    viceCaptain: false,
  })

  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw)
        setTab(saved.tab ?? "home")
        setMatchTab(saved.matchTab ?? "overview")
        setPlayers(saved.players ?? initialPlayers)
        setSelectedDate(saved.selectedDate ?? getToday())
        setHomeTeam(saved.homeTeam ?? TEAM.name)
        setAwayTeam(saved.awayTeam ?? "Leonard Stanley U10 Lioness")
        setHomeScore(saved.homeScore ?? 1)
        setAwayScore(saved.awayScore ?? 4)
        setSeconds(saved.seconds ?? 0)
        setMatchFormat(saved.matchFormat ?? "7v7")
        setFormation(saved.formation ?? "2-3-1")
        setLineupMap(saved.lineupMap ?? {})
        setBenchIds(saved.benchIds ?? [])
        setSavedLineups(saved.savedLineups ?? [])
        setLineupName(saved.lineupName ?? "")
        setTimeline(saved.timeline ?? [])
        setSelectedTemplateId(saved.selectedTemplateId ?? initialTrainingTemplates[0].id)
        setTrainingPlan(
          saved.trainingPlan ?? {
            title: "Weekly Training Session",
            warmUp: initialTrainingTemplates[0].warmUp,
            drill1: initialTrainingTemplates[0].drill1,
            drill2: initialTrainingTemplates[0].drill2,
            game: initialTrainingTemplates[0].game,
            notes: initialTrainingTemplates[0].notes,
          }
        )
        setLiveSecondsMap(saved.liveSecondsMap ?? {})
        setSeasonSecondsMap(saved.seasonSecondsMap ?? {})
        setCurrentQuarter(saved.currentQuarter ?? 1)
        setQuarterPlans(saved.quarterPlans ?? {})
        setQuarterWarnings(saved.quarterWarnings ?? [])
      } else {
        const auto = buildAutoLineup(initialPlayers, buildPitchSlots("7v7", "2-3-1"))
        setLineupMap(auto.lineup)
        setBenchIds(auto.bench)
      }
    } catch {
      const auto = buildAutoLineup(initialPlayers, buildPitchSlots("7v7", "2-3-1"))
      setLineupMap(auto.lineup)
      setBenchIds(auto.bench)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tab,
        matchTab,
        players,
        selectedDate,
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        seconds,
        matchFormat,
        formation,
        lineupMap,
        benchIds,
        savedLineups,
        lineupName,
        timeline,
        selectedTemplateId,
        trainingPlan,
        liveSecondsMap,
        seasonSecondsMap,
        currentQuarter,
        quarterPlans,
        quarterWarnings,
      })
    )
  }, [
    hydrated,
    tab,
    matchTab,
    players,
    selectedDate,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    seconds,
    matchFormat,
    formation,
    lineupMap,
    benchIds,
    savedLineups,
    lineupName,
    timeline,
    selectedTemplateId,
    trainingPlan,
    liveSecondsMap,
    seasonSecondsMap,
    currentQuarter,
    quarterPlans,
    quarterWarnings,
  ])

  useEffect(() => {
    if (!running) return

    const interval = window.setInterval(() => {
      setSeconds((prev) => prev + 1)
      setLiveSecondsMap((prev) => {
        const next = { ...prev }
        Object.values(lineupMap)
          .filter(Boolean)
          .forEach((playerId) => {
            const id = playerId as string
            next[id] = (next[id] || 0) + 1
          })
        return next
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [running, lineupMap])

  const visibleEvents = useMemo(() => events.filter((e) => e.date === selectedDate), [events, selectedDate])
  const totalGoals = useMemo(() => timeline.filter((t) => t.type === "goal").length, [timeline])
  const totalAssists = useMemo(() => timeline.filter((t) => t.type === "assist").length, [timeline])
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

  const pitchRows = useMemo(
    () => [
      currentSlots.filter((s) => s.position === "FWD"),
      currentSlots.filter((s) => s.position === "MID"),
      currentSlots.filter((s) => s.position === "DEF"),
      currentSlots.filter((s) => s.position === "GK"),
    ],
    [currentSlots]
  )

  const captains = useMemo(() => players.filter((p) => p.captain || p.viceCaptain), [players])

  function addTimeline(type: TimelineEventType, text: string) {
    const minute = Math.floor(seconds / 60)
    setTimeline((prev) => [...prev, { id: makeId(), minute, type, text }])
  }

  function openCreateEvent() {
    setEditingTimelineId(null)
    setEventDraft({
      type: "goal",
      playerId: "",
      secondPlayerId: "",
      note: "",
    })
    setShowEventModal(true)
  }

  function openEditTimeline(item: TimelineItem) {
    setEditingTimelineId(item.id)
    setEventDraft({
      type: item.type,
      playerId: "",
      secondPlayerId: "",
      note: item.text,
    })
    setShowEventModal(true)
  }

  function deleteTimelineItem(id: string) {
    setTimeline((prev) => prev.filter((item) => item.id !== id))
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

  function rebuildLineupForCurrentShape(nextPlayers: Player[]) {
    const auto = buildAutoLineup(nextPlayers, currentSlots)
    setLineupMap(auto.lineup)
    setBenchIds(auto.bench)
  }

  function onChangeFormation(nextFormat: MatchFormat, nextFormation: string) {
    const nextSlots = buildPitchSlots(nextFormat, nextFormation)
    const auto = buildAutoLineup(players, nextSlots)
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
      const previousSlot = currentSlots.find((s) => s.id === fromId)

      if (swappedPlayer && previousSlot && !canPlaySlot(swappedPlayer, previousSlot.position)) {
        addTimeline("note", `Swap blocked because ${swappedPlayer.name} cannot play ${previousSlot.position}`)
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
        targetPlayerId ? `${player.name} swapped with ${swappedPlayer?.name || "player"}` : `${player.name} moved to ${targetSlot.label}`
      )
    }
  }

  function saveMatchEvent() {
    const player = players.find((p) => p.id === eventDraft.playerId)
    const secondPlayer = players.find((p) => p.id === eventDraft.secondPlayerId)

    const minute = Math.floor(seconds / 60)

    let text = ""
    if (eventDraft.type === "goal") {
      if (!player) return alert("Choose a scorer")
      setHomeScore((prev) => prev + 1)
      text = secondPlayer ? `${player.name} scored, assist ${secondPlayer.name}` : `${player.name} scored`
    } else if (eventDraft.type === "assist") {
      if (!player) return alert("Choose a player")
      text = `${player.name} assist`
    } else if (eventDraft.type === "injury") {
      if (!player) return alert("Choose a player")
      text = `${player.name} injured`
    } else if (eventDraft.type === "sub") {
      if (!player || !secondPlayer) return alert("Choose players")
      text = `${player.name} off, ${secondPlayer.name} on`
    } else {
      if (!eventDraft.note.trim()) return alert("Enter a note")
      text = eventDraft.note.trim()
    }

    if (editingTimelineId) {
      setTimeline((prev) =>
        prev.map((item) =>
          item.id === editingTimelineId ? { ...item, type: eventDraft.type, text } : item
        )
      )
    } else {
      setTimeline((prev) => [...prev, { id: makeId(), minute, type: eventDraft.type, text }])
    }

    setShowEventModal(false)
    setEditingTimelineId(null)
  }

  function saveQuarterPlan(quarterNumber: number) {
    setQuarterPlans((prev) => ({
      ...prev,
      [quarterNumber]: {
        lineup: { ...lineupMap },
        bench: [...benchIds],
      },
    }))
  }

  function loadQuarterPlan(quarterNumber: number) {
    const plan = quarterPlans[quarterNumber]
    if (!plan) {
      alert(`No saved plan for Q${quarterNumber}`)
      return
    }
    setCurrentQuarter(quarterNumber)
    setLineupMap(plan.lineup)
    setBenchIds(plan.bench)
  }

  function commitLiveMinutesToSeason() {
    setSeasonSecondsMap((prev) => {
      const next = { ...prev }
      Object.entries(liveSecondsMap).forEach(([playerId, secs]) => {
        next[playerId] = (next[playerId] || 0) + secs
      })
      return next
    })
    setLiveSecondsMap({})
  }

  function generateQuarterPlans() {
    const quarterCount = 4
    const plans: Record<number, QuarterPlan> = {}
    const benchHistory: Record<string, number[]> = {}
    const projectedSeconds: Record<string, number> = {}

    players.forEach((p) => {
      benchHistory[p.id] = []
      projectedSeconds[p.id] = (seasonSecondsMap[p.id] || 0) + (liveSecondsMap[p.id] || 0)
    })

    for (let quarter = 1; quarter <= quarterCount; quarter++) {
      const lineup: Record<string, string | null> = {}
      const used = new Set<string>()

      currentSlots.forEach((slot) => {
        let eligible = players.filter((p) => !used.has(p.id) && canPlaySlot(p, slot.position))

        if (slot.position === "GK") {
          eligible = [...eligible].sort((a, b) => {
            const aRank = goalkeeperPriority(a)
            const bRank = goalkeeperPriority(b)
            if (aRank !== bRank) return aRank - bRank

            const aSecs = projectedSeconds[a.id] || 0
            const bSecs = projectedSeconds[b.id] || 0
            if (aSecs !== bSecs) return aSecs - bSecs

            return a.name.localeCompare(b.name)
          })
        } else {
          eligible = [...eligible].sort((a, b) => {
            const aConsecutiveBench = benchHistory[a.id].slice(-1)[0] === quarter - 1 ? 1 : 0
            const bConsecutiveBench = benchHistory[b.id].slice(-1)[0] === quarter - 1 ? 1 : 0
            if (aConsecutiveBench !== bConsecutiveBench) return aConsecutiveBench - bConsecutiveBench

            const aSecs = projectedSeconds[a.id] || 0
            const bSecs = projectedSeconds[b.id] || 0
            if (aSecs !== bSecs) return aSecs - bSecs

            return a.name.localeCompare(b.name)
          })
        }

        const chosen = eligible[0]
        lineup[slot.id] = chosen ? chosen.id : null

        if (chosen) {
          used.add(chosen.id)
          projectedSeconds[chosen.id] = (projectedSeconds[chosen.id] || 0) + 15 * 60
        }
      })

      const bench = players.filter((p) => !used.has(p.id)).map((p) => p.id)
      bench.forEach((id) => benchHistory[id].push(quarter))
      plans[quarter] = { lineup, bench }
    }

    const warnings: string[] = []
    Object.entries(benchHistory).forEach(([playerId, history]) => {
      for (let i = 1; i < history.length; i++) {
        if (history[i] === history[i - 1] + 1) {
          const name = players.find((p) => p.id === playerId)?.name || "Player"
          warnings.push(`${name} is benched in consecutive quarters`)
          break
        }
      }
    })

    setQuarterPlans(plans)
    setQuarterWarnings(warnings)
    setCurrentQuarter(1)
    setLineupMap(plans[1].lineup)
    setBenchIds(plans[1].bench)
  }

  function resetPlayerForm() {
    setPlayerForm({
      name: "",
      positions: ["MID"],
      mainGK: false,
      backupGK: false,
      captain: false,
      viceCaptain: false,
    })
    setEditingPlayerId(null)
    setShowPlayerForm(false)
  }

  function togglePlayerPosition(position: PitchPosition) {
    setPlayerForm((prev) => {
      const exists = prev.positions.includes(position)
      let next = exists ? prev.positions.filter((p) => p !== position) : [...prev.positions, position]
      if (next.length === 0) next = [position]
      return { ...prev, positions: next }
    })
  }

  function startEditPlayer(player: Player) {
    setPlayerForm({
      name: player.name,
      positions: player.positions,
      mainGK: player.mainGK,
      backupGK: player.backupGK,
      captain: player.captain,
      viceCaptain: player.viceCaptain,
    })
    setEditingPlayerId(player.id)
    setShowPlayerForm(true)
  }

  function savePlayer() {
    const trimmed = playerForm.name.trim()
    if (!trimmed) {
      alert("Player name required")
      return
    }

    const targetId = editingPlayerId ?? makeId()

    let nextPlayers = players.map((p) => {
      if (p.id !== targetId) return p
      return {
        ...p,
        name: trimmed,
        positions: playerForm.positions,
        mainGK: playerForm.mainGK,
        backupGK: playerForm.backupGK,
        captain: playerForm.captain,
        viceCaptain: playerForm.viceCaptain,
      }
    })

    if (!editingPlayerId) {
      nextPlayers.push({
        id: targetId,
        name: trimmed,
        positions: playerForm.positions,
        mainGK: playerForm.mainGK,
        backupGK: playerForm.backupGK,
        captain: playerForm.captain,
        viceCaptain: playerForm.viceCaptain,
      })
    }

    if (playerForm.mainGK) {
      nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, mainGK: false }))
    }

    if (playerForm.backupGK) {
      nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, backupGK: false }))
    }

    if (playerForm.captain) {
      nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, captain: false }))
    }

    if (playerForm.viceCaptain) {
      nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, viceCaptain: false }))
    }

    setPlayers(nextPlayers)
    rebuildLineupForCurrentShape(nextPlayers)
    resetPlayerForm()
  }

  function deletePlayer(playerId: string) {
    const name = players.find((p) => p.id === playerId)?.name || "Player"
    const nextPlayers = players.filter((p) => p.id !== playerId)

    setPlayers(nextPlayers)
    setBenchIds((prev) => prev.filter((id) => id !== playerId))
    setLineupMap((prev) => {
      const next = { ...prev }
      Object.keys(next).forEach((slotId) => {
        if (next[slotId] === playerId) next[slotId] = null
      })
      return next
    })
    setLiveSecondsMap((prev) => {
      const next = { ...prev }
      delete next[playerId]
      return next
    })
    setSeasonSecondsMap((prev) => {
      const next = { ...prev }
      delete next[playerId]
      return next
    })
    addTimeline("note", `${name} removed from squad`)
  }

  if (!hydrated) {
    return (
      <main style={{ minHeight: "100vh", padding: 24, background: "#f8fafc" }}>
        <div style={{ ...cardStyle(), maxWidth: 720, margin: "0 auto" }}>Loading...</div>
      </main>
    )
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
        <div style={{ color: "#64748b", fontWeight: 800, letterSpacing: 2, fontSize: 13 }}>SHARKS FOOTBALL</div>
        <div style={{ fontSize: 30, fontWeight: 900 }}>Team Manager Pro</div>
      </div>

      <div
        style={{
          ...cardStyle(`linear-gradient(135deg, ${TEAM.primary} 0%, #0c235f 100%)`),
          color: "white",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, opacity: 0.8, fontWeight: 800 }}>CLUB HUB</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 6 }}>{TEAM.name}</div>
            <div style={{ marginTop: 6, opacity: 0.9 }}>Professional matchday, squad and training workflow.</div>
          </div>

          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: "rgba(255,255,255,0.14)",
              display: "grid",
              placeItems: "center",
              border: "1px solid rgba(255,255,255,0.18)",
              fontWeight: 900,
              fontSize: 24,
            }}
          >
            🦈
          </div>
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          left: 16,
          right: 16,
          bottom: 16,
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(12px)",
          border: "1px solid #dbe3ef",
          borderRadius: 28,
          padding: 10,
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 8,
          boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
          zIndex: 50,
        }}
      >
        {[
          ["home", "Home", "⌂"],
          ["players", "Players", "👥"],
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
              background: tab === value ? TEAM.primary : "transparent",
              color: tab === value ? "white" : "#475569",
              fontWeight: 800,
              fontSize: 13,
            }}
          >
            <div style={{ fontSize: 18 }}>{icon}</div>
            <div>{label}</div>
          </button>
        ))}
      </div>

      {tab === "home" ? (
        <div style={{ display: "grid", gap: 16 }}>
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
              <div style={{ color: "#64748b", fontWeight: 800 }}>Goals Logged</div>
              <div style={{ fontSize: 40, fontWeight: 900, marginTop: 8 }}>{totalGoals}</div>
            </div>
            <div style={cardStyle()}>
              <div style={{ color: "#64748b", fontWeight: 800 }}>Saved Quarters</div>
              <div style={{ fontSize: 40, fontWeight: 900, marginTop: 8 }}>{Object.keys(quarterPlans).length}</div>
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Leadership Group</div>
            <div style={{ display: "grid", gap: 10 }}>
              {captains.length === 0 ? (
                <div style={{ color: "#64748b" }}>No captain or vice-captain selected.</div>
              ) : (
                captains.map((player) => (
                  <div
                    key={player.id}
                    style={{
                      padding: 14,
                      borderRadius: 18,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <ShirtMarker player={player} />
                    <div>
                      <div style={{ fontWeight: 900 }}>{player.name}</div>
                      <div style={{ marginTop: 6 }}>
                        <PlayerBadges player={player} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Upcoming Fixtures</div>
            <div style={{ display: "grid", gap: 10 }}>
              {events.map((event) => (
                <div
                  key={event.id}
                  style={{
                    borderRadius: 20,
                    border: "1px solid #e2e8f0",
                    padding: 14,
                    background:
                      event.type === "match"
                        ? "linear-gradient(135deg,#eff6ff 0%,#ffffff 100%)"
                        : "linear-gradient(135deg,#f8fafc 0%,#ffffff 100%)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>{event.title}</div>
                      <div style={{ color: "#64748b", marginTop: 4 }}>{event.date}</div>
                    </div>
                    <div>
                      <ShirtBadge
                        label={event.type.toUpperCase()}
                        background={event.type === "match" ? TEAM.primary : "#cbd5e1"}
                        color={event.type === "match" ? "white" : "#111827"}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {tab === "players" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ ...cardStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>Squad Manager</div>
              <div style={{ color: "#64748b", marginTop: 4 }}>Edit team members, captains and goalkeepers.</div>
            </div>
            <button
              onClick={() => {
                setEditingPlayerId(null)
                setPlayerForm({
                  name: "",
                  positions: ["MID"],
                  mainGK: false,
                  backupGK: false,
                  captain: false,
                  viceCaptain: false,
                })
                setShowPlayerForm(true)
              }}
              style={buttonPrimary()}
            >
              + Add Player
            </button>
          </div>

          {showPlayerForm ? (
            <div style={cardStyle()}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
                {editingPlayerId ? "Edit Player" : "Add Player"}
              </div>

              <input
                value={playerForm.name}
                onChange={(e) => setPlayerForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Player name"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  fontSize: 16,
                  marginBottom: 12,
                }}
              />

              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                {ALL_POSITIONS.map((position) => (
                  <label key={position} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <input
                      type="checkbox"
                      checked={playerForm.positions.includes(position)}
                      onChange={() => {
                        setPlayerForm((prev) => {
                          const exists = prev.positions.includes(position)
                          let next = exists ? prev.positions.filter((p) => p !== position) : [...prev.positions, position]
                          if (next.length === 0) next = [position]
                          return { ...prev, positions: next }
                        })
                      }}
                    />
                    <span style={{ fontWeight: 700 }}>{position}</span>
                  </label>
                ))}
              </div>

              <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={playerForm.mainGK}
                    onChange={(e) =>
                      setPlayerForm((prev) => ({
                        ...prev,
                        mainGK: e.target.checked,
                        backupGK: e.target.checked ? false : prev.backupGK,
                        positions: e.target.checked && !prev.positions.includes("GK") ? [...prev.positions, "GK"] : prev.positions,
                      }))
                    }
                  />
                  <span style={{ fontWeight: 700 }}>Main GK</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={playerForm.backupGK}
                    onChange={(e) =>
                      setPlayerForm((prev) => ({
                        ...prev,
                        backupGK: e.target.checked,
                        mainGK: e.target.checked ? false : prev.mainGK,
                        positions: e.target.checked && !prev.positions.includes("GK") ? [...prev.positions, "GK"] : prev.positions,
                      }))
                    }
                  />
                  <span style={{ fontWeight: 700 }}>Backup GK</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={playerForm.captain}
                    onChange={(e) =>
                      setPlayerForm((prev) => ({
                        ...prev,
                        captain: e.target.checked,
                        viceCaptain: e.target.checked ? false : prev.viceCaptain,
                      }))
                    }
                  />
                  <span style={{ fontWeight: 700 }}>Captain</span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="checkbox"
                    checked={playerForm.viceCaptain}
                    onChange={(e) =>
                      setPlayerForm((prev) => ({
                        ...prev,
                        viceCaptain: e.target.checked,
                        captain: e.target.checked ? false : prev.captain,
                      }))
                    }
                  />
                  <span style={{ fontWeight: 700 }}>Vice-Captain</span>
                </label>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    const trimmed = playerForm.name.trim()
                    if (!trimmed) {
                      alert("Player name required")
                      return
                    }

                    const targetId = editingPlayerId ?? makeId()

                    let nextPlayers = players.map((p) =>
                      p.id === targetId
                        ? {
                            ...p,
                            name: trimmed,
                            positions: playerForm.positions,
                            mainGK: playerForm.mainGK,
                            backupGK: playerForm.backupGK,
                            captain: playerForm.captain,
                            viceCaptain: playerForm.viceCaptain,
                          }
                        : p
                    )

                    if (!editingPlayerId) {
                      nextPlayers.push({
                        id: targetId,
                        name: trimmed,
                        positions: playerForm.positions,
                        mainGK: playerForm.mainGK,
                        backupGK: playerForm.backupGK,
                        captain: playerForm.captain,
                        viceCaptain: playerForm.viceCaptain,
                      })
                    }

                    if (playerForm.mainGK) {
                      nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, mainGK: false }))
                    }
                    if (playerForm.backupGK) {
                      nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, backupGK: false }))
                    }
                    if (playerForm.captain) {
                      nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, captain: false }))
                    }
                    if (playerForm.viceCaptain) {
                      nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, viceCaptain: false }))
                    }

                    setPlayers(nextPlayers)
                    const auto = buildAutoLineup(nextPlayers, currentSlots)
                    setLineupMap(auto.lineup)
                    setBenchIds(auto.bench)
                    setShowPlayerForm(false)
                    setEditingPlayerId(null)
                  }}
                  style={{ ...buttonPrimary(), flex: 1 }}
                >
                  Save
                </button>

                <button
                  onClick={() => {
                    setShowPlayerForm(false)
                    setEditingPlayerId(null)
                  }}
                  style={{ ...buttonSecondary(), flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div style={{ display: "grid", gap: 10 }}>
            {players.map((player) => (
              <div
                key={player.id}
                style={{
                  ...cardStyle(),
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <ShirtMarker player={player} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{player.name}</div>
                  <div style={{ color: "#64748b", marginTop: 4 }}>{player.positions.join("/")}</div>
                  <div style={{ marginTop: 6 }}>
                    <PlayerBadges player={player} />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingPlayerId(player.id)
                    setPlayerForm({
                      name: player.name,
                      positions: player.positions,
                      mainGK: player.mainGK,
                      backupGK: player.backupGK,
                      captain: player.captain,
                      viceCaptain: player.viceCaptain,
                    })
                    setShowPlayerForm(true)
                  }}
                  style={buttonSecondary()}
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    const nextPlayers = players.filter((p) => p.id !== player.id)
                    setPlayers(nextPlayers)
                    setBenchIds((prev) => prev.filter((id) => id !== player.id))
                    setLineupMap((prev) => {
                      const next = { ...prev }
                      Object.keys(next).forEach((slotId) => {
                        if (next[slotId] === player.id) next[slotId] = null
                      })
                      return next
                    })
                  }}
                  style={{
                    ...buttonSecondary(),
                    color: "#b91c1c",
                    border: "1px solid #fecaca",
                    background: "#fff1f2",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
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
                  onClick={() => {
                    setSelectedTemplateId(template.id)
                    setTrainingPlan({
                      title: template.name,
                      warmUp: template.warmUp,
                      drill1: template.drill1,
                      drill2: template.drill2,
                      game: template.game,
                      notes: template.notes,
                    })
                  }}
                  style={{
                    textAlign: "left",
                    padding: 14,
                    borderRadius: 16,
                    border: selectedTemplateId === template.id ? `2px solid ${TEAM.primary}` : "1px solid #dbe3ef",
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
              ...cardStyle(`linear-gradient(135deg, ${TEAM.primary} 0%, #0c235f 100%)`),
              color: "white",
            }}
          >
            <div style={{ fontSize: 14, opacity: 0.82, fontWeight: 800 }}>MATCH CENTER</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginTop: 10 }}>
              <div>
                <input
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    color: "white",
                    border: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.25)",
                    fontSize: 18,
                    fontWeight: 800,
                    padding: "6px 0",
                    outline: "none",
                  }}
                />
              </div>

              <div style={{ fontSize: 22, fontWeight: 900, opacity: 0.8 }}>vs</div>

              <div>
                <input
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  style={{
                    width: "100%",
                    background: "transparent",
                    color: "white",
                    border: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.25)",
                    fontSize: 18,
                    fontWeight: 800,
                    padding: "6px 0",
                    outline: "none",
                    textAlign: "right",
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center", marginTop: 16 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 64, fontWeight: 900 }}>{homeScore}</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
                  <button onClick={() => setHomeScore((s) => s + 1)} style={buttonSecondary()}>
                    +1
                  </button>
                  <button onClick={() => setHomeScore((s) => Math.max(0, s - 1))} style={buttonSecondary()}>
                    -1
                  </button>
                </div>
              </div>

              <div style={{ fontSize: 36, fontWeight: 900, opacity: 0.8 }}>{formatClock(seconds)}</div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 64, fontWeight: 900 }}>{awayScore}</div>
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

            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              {[1, 2, 3, 4].map((q) => (
                <button
                  key={q}
                  onClick={() => setCurrentQuarter(q)}
                  style={{
                    ...chipStyle(currentQuarter === q),
                    background: currentQuarter === q ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.14)",
                    color: currentQuarter === q ? TEAM.primary : "white",
                    border: currentQuarter === q ? "none" : "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  Q{q}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, overflowX: "auto" }}>
            {[
              ["overview", "Overview"],
              ["lineup", "Lineup"],
              ["live", "Live"],
              ["quarters", "Quarters"],
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
              <div style={cardStyle("#ecfccb")}>
                <div style={{ color: "#4d7c0f", fontWeight: 900, fontSize: 16 }}>Match Clock</div>
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
                      setLiveSecondsMap({})
                    }}
                    style={buttonSecondary()}
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => {
                      setSeasonSecondsMap((prev) => {
                        const next = { ...prev }
                        Object.entries(liveSecondsMap).forEach(([playerId, secs]) => {
                          next[playerId] = (next[playerId] || 0) + secs
                        })
                        return next
                      })
                      setLiveSecondsMap({})
                    }}
                    style={buttonSecondary()}
                  >
                    Save
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 1fr" }}>
                <div style={cardStyle()}>
                  <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Starting Group</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {lineupPlayers.map((player) => (
                      <div
                        key={player.id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 18,
                          padding: 12,
                          background: "#f8fafc",
                          display: "flex",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <ShirtMarker player={player} />
                        <div>
                          <div style={{ fontWeight: 900 }}>{player.name}</div>
                          <div style={{ color: "#64748b", marginTop: 4 }}>{player.positions.join("/")}</div>
                          <div style={{ marginTop: 6 }}>
                            <PlayerBadges player={player} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={cardStyle()}>
                  <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Bench</div>
                  <div style={{ display: "grid", gap: 10 }}>
                    {benchPlayers.length === 0 ? (
                      <div style={{ color: "#64748b" }}>No players on the bench.</div>
                    ) : (
                      benchPlayers.map((player) => (
                        <div
                          key={player.id}
                          style={{
                            border: "1px solid #e2e8f0",
                            borderRadius: 18,
                            padding: 12,
                            background: "#fff7ed",
                            display: "flex",
                            gap: 12,
                            alignItems: "center",
                          }}
                        >
                          <ShirtMarker player={player} />
                          <div>
                            <div style={{ fontWeight: 900 }}>{player.name}</div>
                            <div style={{ color: "#64748b", marginTop: 4 }}>{player.positions.join("/")}</div>
                            <div style={{ marginTop: 6 }}>
                              <PlayerBadges player={player} />
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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
                      const nextFormation = Object.keys(FORMATIONS[nextFormat])[0]
                      const nextSlots = buildPitchSlots(nextFormat, nextFormation)
                      const auto = buildAutoLineup(players, nextSlots)
                      setMatchFormat(nextFormat)
                      setFormation(nextFormation)
                      setLineupMap(auto.lineup)
                      setBenchIds(auto.bench)
                    }}
                    style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
                  >
                    <option value="7v7">7v7</option>
                    <option value="9v9">9v9</option>
                    <option value="11v11">11v11</option>
                  </select>

                  <select
                    value={formation}
                    onChange={(e) => {
                      const nextFormation = e.target.value
                      const nextSlots = buildPitchSlots(matchFormat, nextFormation)
                      const auto = buildAutoLineup(players, nextSlots)
                      setFormation(nextFormation)
                      setLineupMap(auto.lineup)
                      setBenchIds(auto.bench)
                    }}
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
                  <button
                    onClick={() => {
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
                    }}
                    style={buttonPrimary()}
                  >
                    Save
                  </button>
                </div>
              </div>

              <div style={cardStyle("#eff6ff")}>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Goalkeeper Rules</div>
                <div style={{ color: "#334155" }}>
                  The GK slot only accepts a goalkeeper. The app always prefers <strong>Main GK</strong>, then <strong>Backup GK</strong>, then any other GK-capable player.
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
                        <button
                          onClick={() => {
                            setMatchFormat(item.format)
                            setFormation(item.formation)
                            setLineupMap(item.lineup)
                            setBenchIds(item.bench)
                          }}
                          style={buttonSecondary()}
                        >
                          Load
                        </button>
                        <button
                          onClick={() => setSavedLineups((prev) => prev.filter((x) => x.id !== item.id))}
                          style={buttonSecondary()}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Real Tactics Board</div>

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
                                liveSeconds={playerId ? liveSecondsMap[playerId] || 0 : 0}
                              />
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Bench</div>
                    <BenchDropZone>
                      <div style={{ display: "grid", gap: 10 }}>
                        {benchPlayers.length === 0 ? (
                          <div style={{ color: "#64748b" }}>No players on the bench.</div>
                        ) : (
                          benchPlayers.map((player) => (
                            <DraggablePlayerCard
                              key={player.id}
                              player={player}
                              originId="bench"
                              subtitle={`${formatMinutes(liveSecondsMap[player.id] || 0)} min live`}
                            />
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
                  <div style={{ fontSize: 22, fontWeight: 900 }}>Match Timeline</div>
                  <button onClick={openCreateEvent} style={buttonPrimary()}>
                    Add Event
                  </button>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {[...timeline]
                    .sort((a, b) => a.minute - b.minute)
                    .map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "60px 1fr auto auto",
                          gap: 12,
                          padding: 12,
                          borderRadius: 14,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontWeight: 900 }}>{t.minute}'</div>
                        <div>
                          <div style={{ fontWeight: 800, textTransform: "capitalize" }}>{t.type}</div>
                          <div style={{ color: "#475569", marginTop: 4 }}>{t.text}</div>
                        </div>
                        <button onClick={() => openEditTimeline(t)} style={buttonSecondary()}>
                          Edit
                        </button>
                        <button onClick={() => deleteTimelineItem(t.id)} style={buttonSecondary()}>
                          Delete
                        </button>
                      </div>
                    ))}
                </div>
              </div>

              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Live Minutes</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {players.map((player) => (
                    <div
                      key={player.id}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <ShirtMarker player={player} compact />
                        <div>
                          <div style={{ fontWeight: 900 }}>{player.name}</div>
                          <div style={{ color: "#64748b", marginTop: 4 }}>{player.positions.join("/")}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 900 }}>{formatMinutes(liveSecondsMap[player.id] || 0)} min</div>
                        <div style={{ color: "#64748b", fontSize: 13 }}>
                          season {formatMinutes(seasonSecondsMap[player.id] || 0)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {matchTab === "quarters" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Quarter Planner Engine</div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
                  {[1, 2, 3, 4].map((q) => (
                    <button
                      key={q}
                      onClick={() => setCurrentQuarter(q)}
                      style={{
                        ...chipStyle(currentQuarter === q),
                        minWidth: 56,
                      }}
                    >
                      Q{q}
                    </button>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                  <button
                    onClick={() =>
                      setQuarterPlans((prev) => ({
                        ...prev,
                        [currentQuarter]: { lineup: { ...lineupMap }, bench: [...benchIds] },
                      }))
                    }
                    style={buttonPrimary()}
                  >
                    Save Q{currentQuarter}
                  </button>

                  <button
                    onClick={() => {
                      const plan = quarterPlans[currentQuarter]
                      if (!plan) return alert(`No saved plan for Q${currentQuarter}`)
                      setLineupMap(plan.lineup)
                      setBenchIds(plan.bench)
                    }}
                    style={buttonSecondary()}
                  >
                    Load Q{currentQuarter}
                  </button>

                  <button
                    onClick={() => {
                      const quarterCount = 4
                      const plans: Record<number, QuarterPlan> = {}
                      const benchHistory: Record<string, number[]> = {}
                      const projectedSeconds: Record<string, number> = {}

                      players.forEach((p) => {
                        benchHistory[p.id] = []
                        projectedSeconds[p.id] = (seasonSecondsMap[p.id] || 0) + (liveSecondsMap[p.id] || 0)
                      })

                      for (let quarter = 1; quarter <= quarterCount; quarter++) {
                        const lineup: Record<string, string | null> = {}
                        const used = new Set<string>()

                        currentSlots.forEach((slot) => {
                          let eligible = players.filter((p) => !used.has(p.id) && canPlaySlot(p, slot.position))

                          if (slot.position === "GK") {
                            eligible = [...eligible].sort((a, b) => {
                              const aRank = goalkeeperPriority(a)
                              const bRank = goalkeeperPriority(b)
                              if (aRank !== bRank) return aRank - bRank

                              const aSecs = projectedSeconds[a.id] || 0
                              const bSecs = projectedSeconds[b.id] || 0
                              if (aSecs !== bSecs) return aSecs - bSecs

                              return a.name.localeCompare(b.name)
                            })
                          } else {
                            eligible = [...eligible].sort((a, b) => {
                              const aConsecutiveBench = benchHistory[a.id].slice(-1)[0] === quarter - 1 ? 1 : 0
                              const bConsecutiveBench = benchHistory[b.id].slice(-1)[0] === quarter - 1 ? 1 : 0
                              if (aConsecutiveBench !== bConsecutiveBench) return aConsecutiveBench - bConsecutiveBench

                              const aSecs = projectedSeconds[a.id] || 0
                              const bSecs = projectedSeconds[b.id] || 0
                              if (aSecs !== bSecs) return aSecs - bSecs

                              return a.name.localeCompare(b.name)
                            })
                          }

                          const chosen = eligible[0]
                          lineup[slot.id] = chosen ? chosen.id : null

                          if (chosen) {
                            used.add(chosen.id)
                            projectedSeconds[chosen.id] = (projectedSeconds[chosen.id] || 0) + 15 * 60
                          }
                        })

                        const bench = players.filter((p) => !used.has(p.id)).map((p) => p.id)
                        bench.forEach((id) => benchHistory[id].push(quarter))
                        plans[quarter] = { lineup, bench }
                      }

                      const warnings: string[] = []
                      Object.entries(benchHistory).forEach(([playerId, history]) => {
                        for (let i = 1; i < history.length; i++) {
                          if (history[i] === history[i - 1] + 1) {
                            const name = players.find((p) => p.id === playerId)?.name || "Player"
                            warnings.push(`${name} is benched in consecutive quarters`)
                            break
                          }
                        }
                      })

                      setQuarterPlans(plans)
                      setQuarterWarnings(warnings)
                      setCurrentQuarter(1)
                      setLineupMap(plans[1].lineup)
                      setBenchIds(plans[1].bench)
                    }}
                    style={buttonSecondary()}
                  >
                    Auto Generate
                  </button>
                </div>
              </div>

              <div style={cardStyle("#eff6ff")}>
                <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 8 }}>Goalkeeper Rules</div>
                <div style={{ color: "#334155" }}>
                  Quarter generation always tries <strong>Main GK</strong> first, then <strong>Backup GK</strong>, then any other GK-capable player.
                </div>
              </div>

              {quarterWarnings.length > 0 ? (
                <div style={{ ...cardStyle("#fff7ed"), border: "1px solid #fed7aa" }}>
                  <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>Quarter Warnings</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    {quarterWarnings.map((warning, index) => (
                      <div key={index} style={{ color: "#9a3412", fontWeight: 700 }}>
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Saved Quarter Plans</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {[1, 2, 3, 4].map((q) => {
                    const plan = quarterPlans[q]
                    return (
                      <div
                        key={q}
                        style={{
                          padding: 14,
                          borderRadius: 16,
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                          <div style={{ fontWeight: 900, fontSize: 18 }}>Quarter {q}</div>
                          <button
                            onClick={() => {
                              const planToLoad = quarterPlans[q]
                              if (!planToLoad) return
                              setCurrentQuarter(q)
                              setLineupMap(planToLoad.lineup)
                              setBenchIds(planToLoad.bench)
                            }}
                            style={buttonSecondary()}
                          >
                            Load
                          </button>
                        </div>

                        {!plan ? (
                          <div style={{ marginTop: 8, color: "#64748b" }}>No saved plan.</div>
                        ) : (
                          <>
                            <div style={{ marginTop: 10, fontWeight: 800 }}>Lineup</div>
                            <div style={{ display: "grid", gap: 6, marginTop: 6 }}>
                              {currentSlots.map((slot) => (
                                <div key={`${q}-${slot.id}`} style={{ color: "#475569" }}>
                                  {slot.label}: {players.find((p) => p.id === plan.lineup[slot.id])?.name || "Empty"}
                                </div>
                              ))}
                            </div>

                            <div style={{ marginTop: 10, fontWeight: 800 }}>Bench</div>
                            <div style={{ color: "#475569", marginTop: 6 }}>
                              {plan.bench.length === 0
                                ? "No bench"
                                : plan.bench.map((id) => players.find((p) => p.id === id)?.name || "").join(", ")}
                            </div>
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : null}

          {matchTab === "stats" ? (
            <div style={{ display: "grid", gap: 16 }}>
              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Player Minutes</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {players.map((player) => (
                    <div
                      key={player.id}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <ShirtMarker player={player} compact />
                        <div>
                          <div style={{ fontWeight: 900 }}>{player.name}</div>
                          <div style={{ color: "#64748b", marginTop: 4 }}>{player.positions.join("/")}</div>
                          <div style={{ marginTop: 6 }}>
                            <PlayerBadges player={player} />
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 900 }}>{formatMinutes(liveSecondsMap[player.id] || 0)} live</div>
                        <div style={{ color: "#64748b", fontSize: 13 }}>{formatMinutes(seasonSecondsMap[player.id] || 0)} season</div>
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
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Club Stats</div>
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 800 }}>Total goals: {totalGoals}</div>
              <div style={{ fontWeight: 800 }}>Total assists: {totalAssists}</div>
              <div style={{ fontWeight: 800 }}>Players: {players.length}</div>
              <div style={{ fontWeight: 800 }}>Main GK: {players.find((p) => p.mainGK)?.name || "Not set"}</div>
              <div style={{ fontWeight: 800 }}>Backup GK: {players.find((p) => p.backupGK)?.name || "Not set"}</div>
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Season Minutes</div>
            <div style={{ display: "grid", gap: 10 }}>
              {players.map((player) => (
                <div
                  key={player.id}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <ShirtMarker player={player} compact />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 900 }}>{player.name}</div>
                    <div style={{ color: "#64748b", marginTop: 4 }}>{formatMinutes(seasonSecondsMap[player.id] || 0)} min</div>
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
            <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>
              {editingTimelineId ? "Edit Match Event" : "Add Match Event"}
            </div>

            <div style={{ display: "grid", gap: 12 }}>
              <select
                value={eventDraft.type}
                onChange={(e) =>
                  setEventDraft({
                    type: e.target.value as TimelineEventType,
                    playerId: "",
                    secondPlayerId: "",
                    note: "",
                  })
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
              <button
                onClick={() => {
                  setShowEventModal(false)
                  setEditingTimelineId(null)
                }}
                style={{ ...buttonSecondary(), flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  )
}
