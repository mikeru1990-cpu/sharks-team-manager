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

            <div style={{
