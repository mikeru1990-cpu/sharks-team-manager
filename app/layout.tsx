"use client"

import { useEffect, useMemo, useState } from "react"
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
  }, [selectedEventId, pitchSlots.length]) // eslint-disable-line react-hooks/exhaustive-deps

  async function loadAll() {
    setLoading(true)
    setErrorMessage("")

    const cachedPlayers = localStorage.getItem("sharks_players")
    const cachedEvents = localStorage.getItem("sharks_events")
    const cachedAttendance = localStorage.getItem("sharks_attendance")
    const cachedStats = localStorage.getItem("sharks_stats")
    const cachedQuarterPlans = localStorage.getItem("sharks_quarter_plans")

    if (cachedPlayers) {
      try {
        setPlayers(JSON.parse(cachedPlayers))
      } catch {}
    }
    if (cachedEvents) {
      try {
        setEvents(JSON.parse(cachedEvents))
      } catch {}
    }
    if (cachedAttendance) {
      try {
        setAttendanceMap(JSON.parse(cachedAttendance))
      } catch {}
    }
    if (cachedStats) {
      try {
        setStatsMap(JSON.parse(cachedStats))
      } catch {}
    }
    if (cachedQuarterPlans) {
      try {
        setQuarterPlans(JSON.parse(cachedQuarterPlans))
      } catch {}
    }

    const [playersRes, eventsRes, attendanceRes, statsRes, quarterRes] = await Promise.all([
      supabase.from("players").select("*").order("name", { ascending: true }),
      supabase.from("events").select("*").order("date", { ascending: true }),
      supabase.from("event_attendance").select("*"),
      supabase.from("player_match_stats").select("*"),
      supabase.from("match_quarter_plans").select("*"),
    ])

    if (playersRes.error) setErrorMessage(playersRes.error.message)
    else if (eventsRes.error) setErrorMessage(eventsRes.error.message)
    else if (attendanceRes.error) setErrorMessage(attendanceRes.error.message)
    else if (statsRes.error) setErrorMessage(statsRes.error.message)
    else if (quarterRes.error) setErrorMessage(quarterRes.error.message)
    else setErrorMessage("")

    if (!playersRes.error && !eventsRes.error && !attendanceRes.error && !statsRes.error && !quarterRes.error) {
      const parsedPlayers: Player[] = ((playersRes.data || []) as DbPlayer[]).map((p) => ({
        id: p.id,
        name: p.name,
        positions: safeParsePositions(p.positions_json),
        mainGK: !!p.main_gk,
        backupGK: !!p.backup_gk,
      }))

      const parsedEvents: EventItem[] = ((eventsRes.data || []) as DbEvent[]).map((e) => ({
        id: e.id,
        day: e.day,
        date: e.date,
        kickOff: e.kick_off,
        type: e.type as EventType,
        title: e.title,
        home: e.home || "",
        away: e.away || "",
        notes: e.notes || "",
      }))

      const nextAttendance: Record<string, Record<string, AttendanceStatus>> = {}
      ;((attendanceRes.data || []) as DbAttendance[]).forEach((row) => {
        if (!nextAttendance[row.event_id]) nextAttendance[row.event_id] = {}
        nextAttendance[row.event_id][row.player_id] = row.status
      })

      const nextStats: Record<string, Record<string, PlayerMatchStat>> = {}
      ;((statsRes.data || []) as DbPlayerMatchStat[]).forEach((row) => {
        if (!nextStats[row.event_id]) nextStats[row.event_id] = {}
        nextStats[row.event_id][row.player_id] = {
          playerId: row.player_id,
          goals: row.goals || 0,
          assists: row.assists || 0,
          minutes: row.minutes || 0,
        }
      })

      const nextQuarterPlans: Record<string, Record<number, (string | null)[]>> = {}
      ;((quarterRes.data || []) as DbQuarterPlan[]).forEach((row) => {
        if (!nextQuarterPlans[row.event_id]) nextQuarterPlans[row.event_id] = {}
        nextQuarterPlans[row.event_id][row.quarter_number] = safeParseLineup(row.lineup_json)
      })

      setPlayers(parsedPlayers)
      setEvents(parsedEvents)
      setAttendanceMap(nextAttendance)
      setStatsMap(nextStats)
      setQuarterPlans(nextQuarterPlans)

      localStorage.setItem("sharks_players", JSON.stringify(parsedPlayers))
      localStorage.setItem("sharks_events", JSON.stringify(parsedEvents))
      localStorage.setItem("sharks_attendance", JSON.stringify(nextAttendance))
      localStorage.setItem("sharks_stats", JSON.stringify(nextStats))
      localStorage.setItem("sharks_quarter_plans", JSON.stringify(nextQuarterPlans))

      if (!selectedEventId && parsedEvents.length > 0) {
        setSelectedEventId(parsedEvents[0].id)
      }
    }

    setLoading(false)
  }

  function resetPlayerForm() {
    setPlayerForm({
      id: "",
      name: "",
      positions: ["MID"],
      mainGK: false,
      backupGK: false,
    })
    setEditingPlayerId(null)
    setShowPlayerForm(false)
  }

  function startEditPlayer(player: Player) {
    setPlayerForm(player)
    setEditingPlayerId(player.id)
    setShowPlayerForm(true)
  }

  function togglePlayerPosition(position: Position) {
    setPlayerForm((prev) => {
      const exists = prev.positions.includes(position)
      let next = exists ? prev.positions.filter((p) => p !== position) : [...prev.positions, position]
      if (next.length === 0) next = [position]
      return { ...prev, positions: next }
    })
  }

  async function savePlayer() {
    const trimmedName = playerForm.name.trim()
    if (!trimmedName) {
      alert("Player name required")
      return
    }

    const id = editingPlayerId || makeId()

    const payload = {
      id,
      name: trimmedName,
      positions_json: JSON
