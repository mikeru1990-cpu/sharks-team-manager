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
      positions_json: JSON.stringify(playerForm.positions),
      main_gk: !!playerForm.mainGK,
      backup_gk: !!playerForm.backupGK,
    }

    const { error } = await supabase.from("players").upsert(payload, { onConflict: "id" })
    if (error) {
      alert(error.message)
      return
    }

    await loadAll()
    resetPlayerForm()
  }

  function resetEventForm() {
    setEventForm({
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
    setEditingEventId(null)
    setShowEventForm(false)
  }

  async function saveEvent() {
    if (!eventForm.day
async function saveEvent() {
  if (!eventForm.day || !eventForm.date || !eventForm.kickOff || !eventForm.title) {
    alert("Day, date, kick off and title are required")
    return
  }

  const id = editingEventId || makeId()

  const payload = {
    id,
    day: eventForm.day,
    date: eventForm.date,
    kick_off: eventForm.kickOff,
    type: eventForm.type,
    title: eventForm.title,
    home: eventForm.home || "",
    away: eventForm.away || "",
    notes: eventForm.notes || "",
  }

  const { error } = await supabase.from("events").upsert(payload, { onConflict: "id" })
  if (error) {
    alert(error.message)
    return
  }

  await loadAll()
  resetEventForm()
  setSelectedEventId(id)
}

function getAttendanceStatus(eventId: string, playerId: string): AttendanceStatus {
  return attendanceMap[eventId]?.[playerId] || "OFF"
}

async function cycleAttendance(playerId: string) {
  if (!selectedEvent) return

  const current = getAttendanceStatus(selectedEvent.id, playerId)
  const currentIndex = ATTENDANCE_OPTIONS.indexOf(current)
  const next = ATTENDANCE_OPTIONS[(currentIndex + 1) % ATTENDANCE_OPTIONS.length]

  const nextAttendanceMap = {
    ...attendanceMap,
    [selectedEvent.id]: {
      ...(attendanceMap[selectedEvent.id] || {}),
      [playerId]: next,
    },
  }

  setAttendanceMap(nextAttendanceMap)
  localStorage.setItem("sharks_attendance", JSON.stringify(nextAttendanceMap))

  const { error } = await supabase.from("event_attendance").upsert(
    {
      event_id: selectedEvent.id,
      player_id: playerId,
      status: next,
    },
    { onConflict: "event_id,player_id" }
  )

  if (error) alert(error.message)
}

async function markPlayerInjured(playerId: string, slotIndex?: number) {
  if (!selectedEvent) return

  const nextAttendanceMap = {
    ...attendanceMap,
    [selectedEvent.id]: {
      ...(attendanceMap[selectedEvent.id] || {}),
      [playerId]: "INJ" as AttendanceStatus,
    },
  }

  setAttendanceMap(nextAttendanceMap)
  localStorage.setItem("sharks_attendance", JSON.stringify(nextAttendanceMap))

  if (typeof slotIndex === "number") {
    const next = [...pitchIds]
    next[slotIndex] = null
    setPitchIds(next)
  } else {
    setPitchIds((prev) => prev.map((id) => (id === playerId ? null : id)))
  }

  const { error } = await supabase.from("event_attendance").upsert(
    {
      event_id: selectedEvent.id,
      player_id: playerId,
      status: "INJ",
    },
    { onConflict: "event_id,player_id" }
  )

  if (error) alert(error.message)
}

async function returnFromInjury(playerId: string) {
  if (!selectedEvent) return

  const nextAttendanceMap = {
    ...attendanceMap,
    [selectedEvent.id]: {
      ...(attendanceMap[selectedEvent.id] || {}),
      [playerId]: "R" as AttendanceStatus,
    },
  }

  setAttendanceMap(nextAttendanceMap)
  localStorage.setItem("sharks_attendance", JSON.stringify(nextAttendanceMap))

  const { error } = await supabase.from("event_attendance").upsert(
    {
      event_id: selectedEvent.id,
      player_id: playerId,
      status: "R",
    },
    { onConflict: "event_id,player_id" }
  )

  if (error) alert(error.message)
}

function getPlayerStat(eventId: string, playerId: string): PlayerMatchStat {
  return (
    statsMap[eventId]?.[playerId] || {
      playerId,
      goals: 0,
      assists: 0,
      minutes: 0,
    }
  )
}

async function savePlayerStat(eventId: string, playerId: string, patch: Partial<PlayerMatchStat>) {
  const current = getPlayerStat(eventId, playerId)
  const next = { ...current, ...patch, playerId }

  const nextStats = {
    ...statsMap,
    [eventId]: {
      ...(statsMap[eventId] || {}),
      [playerId]: next,
    },
  }

  setStatsMap(nextStats)
  localStorage.setItem("sharks_stats", JSON.stringify(nextStats))

  const { error } = await supabase.from("player_match_stats").upsert(
    {
      event_id: eventId,
      player_id: playerId,
      goals: next.goals,
      assists: next.assists,
      minutes: next.minutes,
    },
    { onConflict: "event_id,player_id" }
  )

  if (error) alert(error.message)
}

async function saveQuarterPlan(eventId: string, quarterNumber: number, lineup: (string | null)[]) {
  const nextPlans = {
    ...quarterPlans,
    [eventId]: {
      ...(quarterPlans[eventId] || {}),
      [quarterNumber]: lineup,
    },
  }

  setQuarterPlans(nextPlans)
  localStorage.setItem("sharks_quarter_plans", JSON.stringify(nextPlans))

  const { error } = await supabase.from("match_quarter_plans").upsert(
    {
      event_id: eventId,
      quarter_number: quarterNumber,
      lineup_json: JSON.stringify(lineup),
    },
    { onConflict: "event_id,quarter_number" }
  )

  if (error) alert(error.message)
}

const availablePlayers = useMemo(() => {
  if (!selectedEvent) return players
  return players.filter((p) => getAttendanceStatus(selectedEvent.id, p.id) === "P")
}, [players, selectedEvent, attendanceMap])

const reservePlayers = useMemo(() => {
  if (!selectedEvent) return []
  return players.filter((p) => getAttendanceStatus(selectedEvent.id, p.id) === "R")
}, [players, selectedEvent, attendanceMap])

const injuredPlayers = useMemo(() => {
  if (!selectedEvent) return []
  return players.filter((p) => getAttendanceStatus(selectedEvent.id, p.id) === "INJ")
}, [players, selectedEvent, attendanceMap])

const pitchPlayers = useMemo(() => {
  return pitchIds.map((id) => availablePlayers.find((p) => p.id === id) || null)
}, [pitchIds, availablePlayers])

const benchPlayers = useMemo(() => {
  const onPitchIds = new Set(pitchIds.filter(Boolean) as string[])
  return availablePlayers.filter((p) => !onPitchIds.has(p.id))
}, [availablePlayers, pitchIds])

const projectedSummaryMinutes = useMemo(() => {
  if (!selectedEvent) return {}

  const minutes: Record<string, number> = {}
  players.forEach((p) => {
    minutes[p.id] = getPlayerStat(selectedEvent.id, p.id).minutes || 0
  })

  const eventPlans = quarterPlans[selectedEvent.id] || {}
  Object.values(eventPlans).forEach((lineup) => {
    lineup.forEach((playerId) => {
      if (!playerId) return
      minutes[playerId] = (minutes[playerId] || 0) + 15
    })
  })

  return minutes
}, [players, selectedEvent, quarterPlans, statsMap])

const seasonStats = useMemo(() => {
  return players.map((player) => {
    let attendanceP = 0
    let attendanceR = 0
    let attendanceNo = 0
    let attendanceOff = 0
    let attendanceInj = 0
    let goals = 0
    let assists = 0
    let minutes = 0

    events.forEach((event) => {
      const status = getAttendanceStatus(event.id, player.id)
      if (status === "P") attendanceP++
      if (status === "R") attendanceR++
      if (status === "NO") attendanceNo++
      if (status === "OFF") attendanceOff++
      if (status === "INJ") attendanceInj++

      const stat = getPlayerStat(event.id, player.id)
      goals += stat.goals
      assists += stat.assists
      minutes += stat.minutes
    })

    return {
      player,
      attendanceP,
      attendanceR,
      attendanceNo,
      attendanceOff,
      attendanceInj,
      goals,
      assists,
      minutes,
    }
  })
}, [players, events, attendanceMap, statsMap])

async function generateQuarterPlans() {
  if (!selectedEvent) return
  if (availablePlayers.length === 0) {
    alert("Mark players as P first")
    return
  }

  const nextQuarterPlans: Record<number, (string | null)[]> = {}
  let projectedMinutes: Record<string, number> = {}
  players.forEach((p) => {
    projectedMinutes[p.id] = getPlayerStat(selectedEvent.id, p.id).minutes || 0
  })

  let previousLineup: (string | null)[] = []
  let previousBenchIds: string[] = []

  for (let quarter = 1; quarter <= 4; quarter++) {
    const lineup = Array(pitchSlots.length).fill(null) as (string | null)[]
    const used = new Set<string>()
    const previousOnFieldIds = new Set(previousLineup.filter(Boolean) as string[])

    const priorityPlayers = [...availablePlayers].sort((a, b) => {
      const aWasBenched = previousBenchIds.includes(a.id)
      const bWasBenched = previousBenchIds.includes(b.id)
      if (aWasBenched !== bWasBenched) return aWasBenched ? -1 : 1

      const aMinutes = projectedMinutes[a.id] || 0
      const bMinutes = projectedMinutes[b.id] || 0
      if (aMinutes !== bMinutes) return aMinutes - bMinutes

      const aPlayedLast = previousOnFieldIds.has(a.id)
      const bPlayedLast = previousOnFieldIds.has(b.id)
      if (aPlayedLast !== bPlayedLast) return aPlayedLast ? 1 : -1

      return a.name.localeCompare(b.name)
    })

    for (let i = 0; i < pitchSlots.length; i++) {
      const slot = pitchSlots[i]
      const candidates = priorityPlayers.filter((p) => !used.has(p.id) && playerCanPlaySlot(p, slot))
      if (candidates.length === 0) continue

      const ranked = [...candidates].sort((a, b) => {
        const aMinutes = projectedMinutes[a.id] || 0
        const bMinutes = projectedMinutes[b.id] || 0

        if (slot === "GK") {
          if (aMinutes !== bMinutes) return aMinutes - bMinutes
          if (!!a.backupGK !== !!b.backupGK) return a.backupGK ? -1 : 1
          if (!!a.mainGK !== !!b.mainGK) return a.mainGK ? 1 : -1
          return a.name.localeCompare(b.name)
        }

        if (aMinutes !== bMinutes) return aMinutes - bMinutes
        return a.name.localeCompare(b.name)
      })

      const chosen = ranked[0]
      lineup[i] = chosen.id
      used.add(chosen.id)
    }

    const onFieldIds = new Set(lineup.filter(Boolean) as string[])
    const stillBenched = previousBenchIds.filter((id) => !onFieldIds.has(id))

    for (const benchedId of stillBenched) {
      const benchPlayer = availablePlayers.find((p) => p.id === benchedId)
      if (!benchPlayer) continue

      let bestSwapIndex = -1
      let bestSwapScore = -Infinity

      for (let i = 0; i < pitchSlots.length; i++) {
        const slot = pitchSlots[i]
        const currentId = lineup[i]
        if (!currentId) continue
        if (!playerCanPlaySlot(benchPlayer, slot)) continue

        const currentPlayer = availablePlayers.find((p) => p.id === currentId)
        if (!currentPlayer) continue
        if (previousBenchIds.includes(currentPlayer.id)) continue

        const currentMinutes = projectedMinutes[currentPlayer.id] || 0
        const benchMinutes = projectedMinutes[benchPlayer.id] || 0
        const swapScore = currentMinutes - benchMinutes

        if (swapScore > bestSwapScore) {
          bestSwapScore = swapScore
          bestSwapIndex = i
        }
      }

      if (bestSwapIndex !== -1) {
        lineup[bestSwapIndex] = benchPlayer.id
      }
    }

    lineup.forEach((playerId) => {
      if (!playerId) return
      projectedMinutes[playerId] = (projectedMinutes[playerId] || 0) + 15
    })

    nextQuarterPlans[quarter] = lineup
    previousLineup = lineup
    previousBenchIds = availablePlayers
      .map((p) => p.id)
      .filter((id) => !(new Set(lineup.filter(Boolean) as string[])).has(id))

    await saveQuarterPlan(selectedEvent.id, quarter, lineup)
  }

  const mergedPlans = {
    ...quarterPlans,
    [selectedEvent.id]: nextQuarterPlans,
  }

  setQuarterPlans(mergedPlans)
  localStorage.setItem("sharks_quarter_plans", JSON.stringify(mergedPlans))
  setCurrentQuarter(1)
  setPitchIds(normalizeLineup(nextQuarterPlans[1], pitchSlots.length))
  setSelectedBenchId(null)
  setSelectedPitchSlot(null)

  alert("Smart fair quarter plans generated")
}

function loadQuarter(quarterNumber: number) {
  if (!selectedEvent) return
  const saved = quarterPlans[selectedEvent.id]?.[quarterNumber]
  setCurrentQuarter(quarterNumber)
  setPitchIds(saved ? normalizeLineup(saved, pitchSlots.length) : Array(pitchSlots.length).fill(null))
  setSelectedBenchId(null)
  setSelectedPitchSlot(null)
  setTimerRunning(false)
  setMatchSeconds(0)
  setPlayerSeconds({})
}

function autoFillPitch() {
  const next = Array(pitchSlots.length).fill(null) as (string | null)[]
  const used = new Set<string>()

  pitchSlots.forEach((slot, index) => {
    const candidate =
      [...availablePlayers]
        .filter((p) => !used.has(p.id) && playerCanPlaySlot(p, slot))
        .sort((a, b) => {
          const aMinutes = projectedSummaryMinutes[a.id] || 0
          const bMinutes = projectedSummaryMinutes[b.id] || 0
          return aMinutes - bMinutes
        })[0] || null

    if (candidate) {
      next[index] = candidate.id
      used.add(candidate.id)
    }
  })

  setPitchIds(next)
  setSelectedBenchId(null)
  setSelectedPitchSlot(null)
}

function clearPitch() {
  setPitchIds(Array(pitchSlots.length).fill(null))
  setSelectedBenchId(null)
  setSelectedPitchSlot(null)
  setTimerRunning(false)
  setMatchSeconds(0)
  setPlayerSeconds({})
}

function placeBenchPlayer(slotIndex: number) {
  if (!selectedBenchId) return
  const next = [...pitchIds]
  next[slotIndex] = selectedBenchId
  setPitchIds(next)
  setSelectedBenchId(null)
  setSelectedPitchSlot(null)
}

function removeFromPitch(slotIndex: number) {
  const next = [...pitchIds]
  next[slotIndex] = null
  setPitchIds(next)
}

async function saveLiveMinutesToStats() {
  if (!selectedEvent) return

  for (const [playerId, seconds] of Object.entries(playerSeconds)) {
    const minutes = Math.floor(seconds / 60)
    if (minutes <= 0) continue
    const current = getPlayerStat(selectedEvent.id, playerId)
    await savePlayerStat(selectedEvent.id, playerId, {
      minutes: current.minutes + minutes,
    })
  }

  alert("Minutes saved")
}

const totalMatches = events.filter((e) => e.type === "MATCH").length
const totalTraining = events.filter((e) => e.type === "TRAINING").length
const avgAvailability = selectedEvent ? percent(availablePlayers.length, players.length || 1) : "0%"
const upcomingEvents = [...events].slice(0, 5)

if (loading) {
  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "#f8fafc" }}>
      <div style={{ ...cardStyle(), maxWidth: 800, margin: "0 auto" }}>Loading...</div>
    </main>
  )
}

return (
  <main
    style={{
      minHeight: "100vh",
      background: "#f8fafc",
      color: "#0f172a",
      paddingBottom: 100,
    }}
  >
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "rgba(248,250,252,0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "16px 16px 14px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, color: "#64748b", fontWeight: 700 }}>Sharks App</div>
            <div style={{ fontSize: 28, fontWeight: 800 }}>Team Manager</div>
          </div>

          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              background: "#0f172a",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
            }}
          >
            ⚽
          </div>
        </div>
      </div>
    </div>

    <div style={{ maxWidth: 960, margin: "0 auto", padding: 16 }}>
      {errorMessage ? (
        <div
          style={{
            ...cardStyle("#fff1f2"),
            border: "1px solid #fecdd3",
            marginBottom: 16,
          }}
        >
          {errorMessage}
        </div>
      ) : null}

      {tab === "home" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ ...cardStyle("#0f172a"), color: "white" }}>
            <div style={{ fontSize: 14, opacity: 0.75 }}>Live Overview</div>
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>Ready for Matchday</div>
            <div style={{ marginTop: 10, opacity: 0.85 }}>
              Players, attendance, quarter planning and live minutes in one app.
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
            <div style={cardStyle()}>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>Players</div>
              <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{players.length}</div>
            </div>
            <div style={cardStyle()}>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>Events</div>
              <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{events.length}</div>
            </div>
            <div style={cardStyle()}>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>Matches</div>
              <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{totalMatches}</div>
            </div>
            <div style={cardStyle()}>
              <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>Training</div>
              <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{totalTraining}</div>
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Upcoming</div>
            <div style={{ display: "grid", gap: 10 }}>
              {upcomingEvents.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEventId(event.id)
                    setTab(event.type === "MATCH" ? "match" : "events")
                  }}
                  style={{
                    textAlign: "left",
                    padding: 14,
                    borderRadius: 16,
                    border: "1px solid #e5e7eb",
                    background: "white",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: eventTypeColor(event.type),
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {event.type}
                  </div>
                  <div style={{ marginTop: 8, fontWeight: 800 }}>{event.title}</div>
                  <div style={{ marginTop: 4, color: "#64748b" }}>
                    {event.day} {event.date} • {event.kickOff}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedEvent ? (
            <div style={cardStyle("#fff7ed")}>
              <div style={{ fontSize: 13, color: "#9a3412", fontWeight: 700 }}>Selected Event</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>{selectedEvent.title}</div>
              <div style={{ marginTop: 6, color: "#7c2d12" }}>
                Availability: {avgAvailability} • Playing: {availablePlayers.length} • Reserve: {reservePlayers.length}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {tab === "players" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ ...cardStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>Players</div>
              <div style={{ color: "#64748b", marginTop: 4 }}>Manage squad roles and goalkeeper settings.</div>
            </div>
            <button
              onClick={() => {
                resetPlayerForm()
                setShowPlayerForm(true)
              }}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                background: "#0f172a",
                color: "white",
                fontWeight: 800,
              }}
            >
              + Add
            </button>
          </div>

          {showPlayerForm ? (
            <div style={cardStyle()}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
                {editingPlayerId ? "Edit Player" : "Add Player"}
              </div>

              <input
                placeholder="Player name"
                value={playerForm.name}
                onChange={(e) => setPlayerForm((prev) => ({ ...prev, name: e.target.value }))}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #d1d5db",
                  marginBottom: 12,
                  fontSize: 16,
                }}
              />

              <div style={{ display: "grid", gap: 10, marginBottom: 12 }}>
                {ALL_POSITIONS.map((pos) => (
                  <label key={pos} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 18 }}>
                    <input
                      type="checkbox"
                      checked={playerForm.positions.includes(pos)}
                      onChange={() => togglePlayerPosition(pos)}
                    />
                    {pos}
                  </label>
                ))}
              </div>

              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, fontSize: 18 }}>
                <input
                  type="checkbox"
                  checked={playerForm.mainGK}
                  onChange={(e) =>
                    setPlayerForm((prev) => ({
                      ...prev,
                      mainGK: e.target.checked,
                      positions:
                        e.target.checked && !prev.positions.includes("GK")
                          ? [...prev.positions, "GK"]
                          : prev.positions,
                    }))
                  }
                />
                Main GK
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, fontSize: 18 }}>
                <input
                  type="checkbox"
                  checked={playerForm.backupGK}
                  onChange={(e) => setPlayerForm((prev) => ({ ...prev, backupGK: e.target.checked }))}
                />
                Backup GK
              </label>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => void savePlayer()}
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "none",
                    background: "#0f172a",
                    color: "white",
                    fontWeight: 800,
                  }}
                >
                  Save
                </button>
                <button
                  onClick={resetPlayerForm}
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "1px solid #d1d5db",
                    background: "white",
                    fontWeight: 800,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div style={{ display: "grid", gap: 12 }}>
            {players.map((player) => (
              <div key={player.id} style={cardStyle()}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{player.name}</div>
                <div style={{ marginTop: 6, color: "#64748b" }}>
                  {player.positions.join("/")}
                  {player.mainGK ? " • Main GK" : ""}
                  {!player.mainGK && player.backupGK ? " • Backup GK" : ""}
                </div>

                <button
                  onClick={() => startEditPlayer(player)}
                  style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid #d1d5db",
                    background: "white",
                    fontWeight: 700,
                  }}
                >
                  Edit Player
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {tab === "events" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={{ ...cardStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800 }}>Events</div>
              <div style={{ color: "#64748b", marginTop: 4 }}>Fixtures, training and weekly schedule.</div>
            </div>
            <button
              onClick={() => {
                resetEventForm()
                setShowEventForm(true)
              }}
              style={{
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                background: "#0f172a",
                color: "white",
                fontWeight: 800,
              }}
            >
              + Add
            </button>
          </div>

          {showEventForm ? (
            <div style={cardStyle()}>
              <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>
                {editingEventId ? "Edit Event" : "Add Event"}
              </div>

              {[
                ["Day", "day"],
                ["Date", "date"],
                ["Kick off", "kickOff"],
                ["Title", "title"],
                ["Home", "home"],
                ["Away", "away"],
                ["Notes", "notes"],
              ].map(([label, key]) => (
                <input
                  key={key}
                  placeholder={label}
                  value={(eventForm as any)[key]}
                  onChange={(e) => setEventForm((prev) => ({ ...prev, [key]: e.target.value }))}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 16,
                    borderRadius: 14,
                    border: "1px solid #d1d5db",
                    marginBottom: 12,
                    fontSize: 16,
                  }}
                />
              ))}

              <select
                value={eventForm.type}
                onChange={(e) => setEventForm((prev) => ({ ...prev, type: e.target.value as EventType }))}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: 16,
                  borderRadius: 14,
                  border: "1px solid #d1d5db",
                  marginBottom: 12,
                  fontSize: 16,
                }}
              >
                <option value="MATCH">MATCH</option>
                <option value="TRAINING">TRAINING</option>
                <option value="NO_GAME">NO GAME</option>
                <option value="HOLIDAY">HOLIDAY</option>
              </select>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => void saveEvent()}
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "none",
                    background: "#0f172a",
                    color: "white",
                    fontWeight: 800,
                  }}
                >
                  Save
                </button>
                <button
                  onClick={resetEventForm}
                  style={{
                    flex: 1,
                    padding: "14px 16px",
                    borderRadius: 14,
                    border: "1px solid #d1d5db",
                    background: "white",
                    fontWeight: 800,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          <div style={{ display: "grid", gap: 12 }}>
            {events.map((event) => {
              const selected = selectedEventId === event.id
              return (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  style={{
                    ...cardStyle(),
                    textAlign: "left",
                    border: selected ? "2px solid #0f172a" : "1px solid #e5e7eb",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "5px 10px",
                      borderRadius: 999,
                      background: eventTypeColor(event.type),
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {event.type}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 20, fontWeight: 800 }}>{event.title}</div>
                  <div style={{ marginTop: 6, color: "#64748b" }}>
                    {event.day} {event.date} • {event.kickOff}
                  </div>
                  {event.type === "MATCH" ? (
                    <div style={{ marginTop: 6, color: "#64748b" }}>
                      {event.home} vs {event.away}
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      {tab === "match" ? (
        <div style={{ display: "grid", gap: 16 }}>
          {!selectedEvent ? (
            <div style={cardStyle()}>Choose an event first.</div>
          ) : (
            <>
              <div style={{ ...cardStyle("#0f172a"), color: "white" }}>
                <div style={{ fontSize: 14, opacity: 0.75 }}>Match Center</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>{selectedEvent.title}</div>
                <div style={{ marginTop: 6, opacity: 0.85 }}>
                  {selectedEvent.day} {selectedEvent.date} • {selectedEvent.kickOff}
                </div>
              </div>

              <div style={cardStyle()}>
                <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Attendance</div>
                <div style={{ display: "grid", gap: 10 }}>
                  {players.map((player) => {
                    const status = getAttendanceStatus(selectedEvent.id, player.id)
                    return (
                      <div
                        key={player.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 12,
                          padding: 12,
                          borderRadius: 14,
                          background: "#f8fafc",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800 }}>{player.name}</div>
                          <div style={{ color: "#64748b", fontSize: 14 }}>{player.positions.join("/")}</div>
                        </div>
                        <button
                          onClick={() => void cycleAttendance(player.id)}
                          style={{
                            minWidth: 72,
                            padding: "10px 12px",
                            borderRadius: 999,
                            border: "none",
                            background: attendanceColor(status),
                            fontWeight: 800,
                          }}
                        >
                          {status}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {selectedEvent.type === "MATCH" ? (
                <>
                  <div style={cardStyle()}>
                    <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Quarter Planner</div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
                      <select
                        value={matchFormat}
                        onChange={(e) => {
                          const nextFormat = e.target.value as MatchFormat
                          setMatchFormat(nextFormat)
                          setFormation(Object.keys(FORMATIONS[nextFormat])[0])
                        }}
                        style={{ padding: 14, borderRadius: 14, border: "1px solid #d1d5db" }}
                      >
                        <option value="7v7">7v7</option>
                        <option value="9v9">9v9</option>
                        <option value="11v11">11v11</option>
                      </select>

                      <select
                        value={formation}
                        onChange={(e) => setFormation(e.target.value)}
                        style={{ padding: 14, borderRadius: 14, border: "1px solid #d1d5db" }}
                      >
                        {Object.keys(FORMATIONS[matchFormat]).map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: "grid", gap: 10 }}>
                      <button
                        onClick={() => void generateQuarterPlans()}
                        style={{
                          padding: "14px 16px",
                          borderRadius: 14,
                          border: "none",
                          background: "#0f172a",
                          color: "white",
                          fontWeight: 800,
                        }}
                      >
                        Generate Smart Fair 4 Quarters
                      </button>

                      <button
                        onClick={autoFillPitch}
                        style={{
                          padding: "14px 16px",
                          borderRadius: 14,
                          border: "1px solid #d1d5db",
                          background: "white",
                          fontWeight: 800,
                        }}
                      >
                        Auto Fill Current Quarter
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                      {[1, 2, 3, 4].map((q) => (
                        <button
                          key={q}
                          onClick={() => loadQuarter(q)}
                          style={{
                            padding: "10px 14px",
                            borderRadius: 999,
                            border: currentQuarter === q ? "2px solid #0f172a" : "1px solid #d1d5db",
                            background: currentQuarter === q ? "#e2e8f0" : "white",
                            fontWeight: 800,
                          }}
                        >
                          Q{q}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={cardStyle("#ecfccb")}>
                    <div style={{ fontSize: 14, color: "#3f6212", fontWeight: 700 }}>Quarter {currentQuarter}</div>
                    <div style={{ fontSize: 40, fontWeight: 800, marginTop: 4 }}>{formatSeconds(matchSeconds)}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginTop: 12 }}>
                      <button onClick={() => setTimerRunning(true)} style={smallActionBtn("#0f172a", "white")}>
                        Start
                      </button>
                      <button onClick={() => setTimerRunning(false)} style={smallActionBtn("white", "#0f172a")}>
                        Pause
                      </button>
                      <button
                        onClick={() => {
                          setTimerRunning(false)
                          setMatchSeconds(0)
                          setPlayerSeconds({})
                        }}
                        style={smallActionBtn("white", "#0f172a")}
                      >
                        Reset
                      </button>
                      <button onClick={() => void saveLiveMinutesToStats()} style={smallActionBtn("white", "#0f172a")}>
                        Save
                      </button>
                    </div>
                  </div>

                  <div
                    style={{
                      ...cardStyle("#166534"),
                      color: "white",
                    }}
                  >
                    <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Pitch</div>

                    {selectedBenchId ? (
                      <div style={{ marginBottom: 12, padding: 12, borderRadius: 14, background: "rgba(255,255,255,0.15)" }}>
                        Selected bench player: <strong>{availablePlayers.find((p) => p.id === selectedBenchId)?.name}</strong>
                      </div>
                    ) : null}

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          pitchSlots.length <= 7 ? "repeat(3, 1fr)" : pitchSlots.length <= 9 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
                        gap: 12,
                      }}
                    >
                      {pitchSlots.map((slot, index) => {
                        const player = pitchPlayers[index]
                        const slotSelected = selectedPitchSlot === index

                        return (
                          <div
                            key={`${slot}-${index}`}
                            onClick={() => setSelectedPitchSlot(index)}
                            style={{
                              minHeight: 122,
                              borderRadius: 18,
                              border: slotSelected ? "3px solid #fde68a" : "2px solid rgba(255,255,255,0.65)",
                              background: "rgba(255,255,255,0.12)",
                              padding: 10,
                              textAlign: "center",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {player ? (
                              <div>
                                <div style={{ fontWeight: 800, fontSize: 14 }}>{slot}</div>
                                <div style={{ marginTop: 6, fontSize: 18, fontWeight: 800 }}>{player.name}</div>
                                <div style={{ marginTop: 6, fontSize: 14 }}>{formatSeconds(playerSeconds[player.id] || 0)}</div>
                                <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10, flexWrap: "wrap" }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      removeFromPitch(index)
                                    }}
                                    style={pitchBtnStyle()}
                                  >
                                    Bench
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      void markPlayerInjured(player.id, index)
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
                                <div style={{ marginTop: 8, fontSize: 18 }}>Empty</div>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    placeBenchPlayer(index)
                                  }}
                                  disabled={!selectedBenchId}
                                  style={{ ...pitchBtnStyle(), marginTop: 10, opacity: selectedBenchId ? 1 : 0.6 }}
                                >
                                  Place
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div style={cardStyle()}>
                    <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Bench</div>
                    <div style={{ display: "grid", gap: 10 }}>
                      {benchPlayers.map((player) => (
                        <button
                          key={player.id}
                          onClick={() => {
                            if (selectedPitchSlot === null) {
                              setSelectedBenchId(player.id)
                              return
                            }

                            const next = [...pitchIds]
                            const currentPitchPlayer = next[selectedPitchSlot]
                            next[selectedPitchSlot] = player.id

                            setPitchIds(next)
                            setSelectedPitchSlot(null)

                            if (currentPitchPlayer) setSelectedBenchId(currentPitchPlayer)
                            else setSelectedBenchId(null)
                          }}
                          style={{
                            width: "100%",
                            padding: "16px 14px",
                            borderRadius: 16,
                            border: selectedBenchId === player.id ? "2px solid #2563eb" : "1px solid #d1d5db",
                            background: "#fef3c7",
                            fontSize: 16,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            fontWeight: 700,
                          }}
                        >
                          <span>{player.name}</span>
                          <span>{formatSeconds(playerSeconds[player.id] || 0)}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: 12 }}>
                    <div style={cardStyle()}>
                      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Injured</div>
                      <div style={{ display: "grid", gap: 10 }}>
                        {injuredPlayers.length === 0 ? (
                          <div style={{ color: "#64748b" }}>No injured players.</div>
                        ) : (
                          injuredPlayers.map((player) => (
                            <div
                              key={player.id}
                              style={{
                                padding: 14,
                                borderRadius: 14,
                                background: "#fff7ed",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: 12,
                              }}
                            >
                              <span style={{ fontWeight: 700 }}>{player.name}</span>
                              <button
                                onClick={() => void returnFromInjury(player.id)}
                                style={{
                                  padding: "10px 12px",
                                  borderRadius: 12,
                                  border: "1px solid #d1d5db",
                                  background: "white",
                                  fontWeight: 700,
                                }}
                              >
                                Return
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div style={cardStyle()}>
                      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Projected Minutes</div>
                      <div style={{ display: "grid", gap: 10 }}>
                        {players.map((player) => (
                          <div
                            key={player.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: 12,
                              borderRadius: 14,
                              background: "#f8fafc",
                            }}
                          >
                            <span style={{ fontWeight: 700 }}>{player.name}</span>
                            <span>{projectedSummaryMinutes[player.id] || 0} mins</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      {tab === "stats" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <div style={cardStyle()}>
            <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Season Stats</div>
            <div style={{ display: "grid", gap: 12 }}>
              {seasonStats.map((row) => (
                <div key={row.player.id} style={{ padding: 14, borderRadius: 16, background: "#f8fafc" }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{row.player.name}</div>
                  <div style={{ marginTop: 4, color: "#64748b" }}>{row.player.positions.join("/")}</div>
                  <div style={{ marginTop: 8 }}>
                    P: {row.attendanceP} • R: {row.attendanceR} • NO: {row.attendanceNo} • OFF: {row.attendanceOff} • INJ: {row.attendanceInj}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    Availability: {percent(row.attendanceP, row.attendanceP + row.attendanceR + row.attendanceNo + row.attendanceInj)}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    Goals: {row.goals} • Assists: {row.assists} • Minutes: {row.minutes}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>

    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(12px)",
        borderTop: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "10px 12px calc(10px + env(safe-area-inset-bottom))",
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 8,
        }}
      >
        {[
          ["home", "Home"],
          ["players", "Players"],
          ["events", "Events"],
          ["match", "Match"],
          ["stats", "Stats"],
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setTab(value as AppTab)}
            style={{
              padding: "12px 8px",
              borderRadius: 14,
              border: "none",
              background: tab === value ? "#0f172a" : "transparent",
              color: tab === value ? "white" : "#475569",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  </main>
)
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
