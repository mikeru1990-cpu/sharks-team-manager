"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../supabase"

type Position = "GK" | "DEF" | "MID" | "FWD"
type MatchFormat = "7v7" | "9v9" | "11v11"
type EventType = "MATCH" | "TRAINING" | "NO_GAME" | "HOLIDAY"
type AttendanceStatus = "P" | "R" | "NO" | "OFF"

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
const ATTENDANCE_OPTIONS: AttendanceStatus[] = ["P", "R", "NO", "OFF"]

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

function eventTypeColor(type: EventType) {
  if (type === "MATCH") return "#1aff00"
  if (type === "TRAINING") return "#d9d9d9"
  if (type === "NO_GAME") return "#ff1a1a"
  return "#9acd50"
}

function attendanceColor(status: AttendanceStatus) {
  if (status === "P") return "#25d366"
  if (status === "R") return "#f7d046"
  if (status === "NO") return "#ff4d4f"
  return "#d9d9d9"
}

function percent(numerator: number, denominator: number) {
  if (!denominator) return "0%"
  return `${Math.round((numerator / denominator) * 100)}%`
}

function shuffleArray<T>(items: T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export default function Page() {
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

  const [matchSeconds, setMatchSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [playerSeconds, setPlayerSeconds] = useState<Record<string, number>>({})
  const [currentQuarter, setCurrentQuarter] = useState(1)

  const pitchSlots = useMemo(() => FORMATIONS[matchFormat][formation] || [], [matchFormat, formation])

  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || null
  }, [events, selectedEventId])

  useEffect(() => {
    setPitchIds(Array(pitchSlots.length).fill(null))
    setSelectedBenchId(null)
    setTimerRunning(false)
    setMatchSeconds(0)
    setPlayerSeconds({})
  }, [pitchSlots.length])

  useEffect(() => {
    void loadAll()
  }, [])

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
  }, [timerRunning, pitchIds, selectedEvent])

  useEffect(() => {
    if (!selectedEvent) return
    setCurrentQuarter(1)
    setMatchSeconds(0)
    setTimerRunning(false)
    setPlayerSeconds({})
    const saved = quarterPlans[selectedEvent.id]?.[1]
    setPitchIds(saved ? normalizeLineup(saved, pitchSlots.length) : Array(pitchSlots.length).fill(null))
    setSelectedBenchId(null)
  }, [selectedEventId, pitchSlots.length])

  async function loadAll() {
    setLoading(true)
    setErrorMessage("")

    const [playersRes, eventsRes, attendanceRes, statsRes, quarterRes] = await Promise.all([
      supabase.from("players").select("*").order("name", { ascending: true }),
      supabase.from("events").select("*").order("date", { ascending: true }),
      supabase.from("event_attendance").select("*"),
      supabase.from("player_match_stats").select("*"),
      supabase.from("match_quarter_plans").select("*"),
    ])

    if (playersRes.error) setErrorMessage(playersRes.error.message)
    if (eventsRes.error) setErrorMessage(eventsRes.error.message)
    if (attendanceRes.error) setErrorMessage(attendanceRes.error.message)
    if (statsRes.error) setErrorMessage(statsRes.error.message)
    if (quarterRes.error) setErrorMessage(quarterRes.error.message)

    const parsedPlayers: Player[] = ((playersRes.data || []) as DbPlayer[]).map((p) => ({
      id: p.id,
      name: p.name || "",
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

    if (!selectedEventId && parsedEvents.length > 0) {
      setSelectedEventId(parsedEvents[0].id)
    }

    setLoading(false)
  }

  function normalizeLineup(lineup: (string | null)[], length: number) {
    const next = Array(length).fill(null) as (string | null)[]
    for (let i = 0; i < length; i++) next[i] = lineup[i] || null
    return next
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

    setAttendanceMap((prev) => ({
      ...prev,
      [selectedEvent.id]: {
        ...(prev[selectedEvent.id] || {}),
        [playerId]: next,
      },
    }))

    const { error } = await supabase.from("event_attendance").upsert(
      { event_id: selectedEvent.id, player_id: playerId, status: next },
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

    setStatsMap((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || {}),
        [playerId]: next,
      },
    }))

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

  const availablePlayers = useMemo(() => {
    if (!selectedEvent) return players
    return players.filter((p) => getAttendanceStatus(selectedEvent.id, p.id) === "P")
  }, [players, selectedEvent, attendanceMap])

  const reservePlayers = useMemo(() => {
    if (!selectedEvent) return []
    return players.filter((p) => getAttendanceStatus(selectedEvent.id, p.id) === "R")
  }, [players, selectedEvent, attendanceMap])

  const pitchPlayers = useMemo(() => {
    return pitchIds.map((id) => availablePlayers.find((p) => p.id === id) || null)
  }, [pitchIds, availablePlayers])

  const benchPlayers = useMemo(() => {
    const onPitchIds = new Set(pitchIds.filter(Boolean) as string[])
    return availablePlayers.filter((p) => !onPitchIds.has(p.id))
  }, [availablePlayers, pitchIds])

  const seasonStats = useMemo(() => {
    return players.map((player) => {
      let attendanceP = 0
      let attendanceR = 0
      let attendanceNo = 0
      let attendanceOff = 0
      let goals = 0
      let assists = 0
      let minutes = 0

      events.forEach((event) => {
        const status = getAttendanceStatus(event.id, player.id)
        if (status === "P") attendanceP++
        if (status === "R") attendanceR++
        if (status === "NO") attendanceNo++
        if (status === "OFF") attendanceOff++

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
        goals,
        assists,
        minutes,
      }
    })
  }, [players, events, attendanceMap, statsMap])

  const sortedSummaryPlayers = useMemo(() => {
    return [...availablePlayers].sort((a, b) => (playerSeconds[b.id] || 0) - (playerSeconds[a.id] || 0))
  }, [availablePlayers, playerSeconds])

  function pickKeeper(pool: Player[], used: Set<string>) {
    const keeper =
      pool.find((p) => !used.has(p.id) && p.mainGK) ||
      pool.find((p) => !used.has(p.id) && p.positions.includes("GK")) ||
      pool.find((p) => !used.has(p.id))
    if (keeper) used.add(keeper.id)
    return keeper || null
  }

  function generateQuarterLineup(
    playerPool: Player[],
    slots: Position[],
    offset: number
  ): (string | null)[] {
    const rotated = [...playerPool.slice(offset), ...playerPool.slice(0, offset)]
    const lineup = Array(slots.length).fill(null) as (string | null)[]
    const used = new Set<string>()

    const gkIndex = slots.findIndex((s) => s === "GK")
    if (gkIndex !== -1) {
      const keeper = pickKeeper(rotated, used)
      if (keeper) lineup[gkIndex] = keeper.id
    }

    slots.forEach((slot, index) => {
      if (lineup[index]) return

      const preferred =
        rotated.find((p) => !used.has(p.id) && p.positions.includes(slot)) ||
        rotated.find((p) => !used.has(p.id))

      if (preferred) {
        used.add(preferred.id)
        lineup[index] = preferred.id
      }
    })

    return lineup
  }

  async function saveQuarterPlan(eventId: string, quarterNumber: number, lineup: (string | null)[]) {
    setQuarterPlans((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || {}),
        [quarterNumber]: lineup,
      },
    }))

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

  async function generateQuarterPlans() {
    if (!selectedEvent) return
    if (availablePlayers.length === 0) {
      alert("Mark players as P first")
      return
    }

    const shuffled = shuffleArray(availablePlayers)
    for (let quarter = 1; quarter <= 4; quarter++) {
      const offset = ((quarter - 1) * Math.max(1, Math.floor(pitchSlots.length / 2))) % shuffled.length
      const lineup = generateQuarterLineup(shuffled, pitchSlots, offset)
      await saveQuarterPlan(selectedEvent.id, quarter, lineup)
    }

    const q1 = quarterPlans[selectedEvent.id]?.[1]
    setCurrentQuarter(1)
    setPitchIds(q1 ? normalizeLineup(q1, pitchSlots.length) : Array(pitchSlots.length).fill(null))
    alert("Quarter plans generated")
  }

  function normalizeLineup(lineup: (string | null)[], length: number) {
    const next = Array(length).fill(null) as (string | null)[]
    for (let i = 0; i < length; i++) next[i] = lineup[i] || null
    return next
  }

  function loadQuarter(quarterNumber: number) {
    if (!selectedEvent) return
    const saved = quarterPlans[selectedEvent.id]?.[quarterNumber]
    setCurrentQuarter(quarterNumber)
    setPitchIds(saved ? normalizeLineup(saved, pitchSlots.length) : Array(pitchSlots.length).fill(null))
    setSelectedBenchId(null)
    setTimerRunning(false)
    setMatchSeconds(0)
    setPlayerSeconds({})
  }

  function autoFillPitch() {
    const next = generateQuarterLineup(availablePlayers, pitchSlots, 0)
    setPitchIds(next)
    setSelectedBenchId(null)
  }

  function clearPitch() {
    setPitchIds(Array(pitchSlots.length).fill(null))
    setSelectedBenchId(null)
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
  }

  function removeFromPitch(slotIndex: number) {
    const next = [...pitchIds]
    next[slotIndex] = null
    setPitchIds(next)
  }

  async function saveCurrentQuarter() {
    if (!selectedEvent) return
    await saveQuarterPlan(selectedEvent.id, currentQuarter, pitchIds)
    alert(`Quarter ${currentQuarter} saved`)
  }

  async function saveLiveMinutesToStats() {
    if (!selectedEvent) return

    for (const [playerId, seconds] of Object.entries(playerSeconds)) {
      const minutes = Math.floor(seconds / 60)
      const current = getPlayerStat(selectedEvent.id, playerId)
      await savePlayerStat(selectedEvent.id, playerId, {
        minutes: current.minutes + minutes,
      })
    }

    alert("Minutes saved to match stats")
  }

  if (loading) {
    return <main style={{ padding: 20, maxWidth: 960, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>Loading...</main>
  }

  return (
    <main
      style={{
        padding: 20,
        paddingBottom: 40,
        minHeight: "100vh",
        maxWidth: 960,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 44, marginBottom: 20 }}>Sharks Team Manager</h1>

      {errorMessage ? (
        <div style={{ marginBottom: 20, padding: 14, borderRadius: 12, background: "#fff1f0", border: "1px solid #ffa39e" }}>
          {errorMessage}
        </div>
      ) : null}

      <h2 style={{ fontSize: 30, marginTop: 10 }}>Players Manager</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <button
          onClick={() => {
            resetPlayerForm()
            setShowPlayerForm(true)
          }}
          style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}
        >
          Add Player
        </button>
      </div>

      {showPlayerForm ? (
        <div style={{ marginBottom: 20, padding: 16, background: "#f5f5f5", borderRadius: 16 }}>
          <h3 style={{ marginTop: 0 }}>{editingPlayerId ? "Edit Player" : "Add Player"}</h3>

          <input
            placeholder="Player name"
            value={playerForm.name}
            onChange={(e) => setPlayerForm((prev) => ({ ...prev, name: e.target.value }))}
            style={{ width: "100%", boxSizing: "border-box", padding: 14, marginBottom: 12, borderRadius: 10, border: "1px solid #d9d9d9" }}
          />

          <div style={{ marginBottom: 12 }}>
            {ALL_POSITIONS.map((pos) => (
              <label key={pos} style={{ display: "block", marginBottom: 8, fontSize: 18 }}>
                <input
                  type="checkbox"
                  checked={playerForm.positions.includes(pos)}
                  onChange={() => togglePlayerPosition(pos)}
                  style={{ marginRight: 10 }}
                />
                {pos}
              </label>
            ))}
          </div>

          <label style={{ display: "block", marginBottom: 8, fontSize: 18 }}>
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
              style={{ marginRight: 10 }}
            />
            Main GK
          </label>

          <label style={{ display: "block", marginBottom: 16, fontSize: 18 }}>
            <input
              type="checkbox"
              checked={playerForm.backupGK}
              onChange={(e) => setPlayerForm((prev) => ({ ...prev, backupGK: e.target.checked }))}
              style={{ marginRight: 10 }}
            />
            Backup GK
          </label>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => void savePlayer()} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}>
              Save Player
            </button>
            <button onClick={resetPlayerForm} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 10, marginBottom: 30 }}>
        {players.map((player) => (
          <div key={player.id} style={{ padding: 14, borderRadius: 14, border: "1px solid #ddd", background: "white" }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>{player.name}</div>
            <div style={{ marginTop: 4, color: "#555" }}>
              {player.positions.join("/")}
              {player.mainGK ? " • Main GK" : ""}
              {!player.mainGK && player.backupGK ? " • Backup GK" : ""}
            </div>
            <button onClick={() => startEditPlayer(player)} style={{ marginTop: 10, padding: "8px 14px", borderRadius: 999, border: "1px solid #ccc" }}>
              Edit Player
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 30 }}>Events Manager</h2>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        <button
          onClick={() => {
            resetEventForm()
            setShowEventForm(true)
          }}
          style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}
        >
          Add Event
        </button>
      </div>

      {showEventForm ? (
        <div style={{ marginBottom: 20, padding: 16, background: "#f5f5f5", borderRadius: 16 }}>
          <h3 style={{ marginTop: 0 }}>Add Event</h3>

          <input placeholder="Day" value={eventForm.day} onChange={(e) => setEventForm((prev) => ({ ...prev, day: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: 14, marginBottom: 12, borderRadius: 10, border: "1px solid #d9d9d9" }} />
          <input placeholder="Date" value={eventForm.date} onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: 14, marginBottom: 12, borderRadius: 10, border: "1px solid #d9d9d9" }} />
          <input placeholder="Kick off" value={eventForm.kickOff} onChange={(e) => setEventForm((prev) => ({ ...prev, kickOff: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: 14, marginBottom: 12, borderRadius: 10, border: "1px solid #d9d9d9" }} />

          <select value={eventForm.type} onChange={(e) => setEventForm((prev) => ({ ...prev, type: e.target.value as EventType }))} style={{ width: "100%", boxSizing: "border-box", padding: 14, marginBottom: 12, borderRadius: 10 }}>
            <option value="MATCH">MATCH</option>
            <option value="TRAINING">TRAINING</option>
            <option value="NO_GAME">NO GAME</option>
            <option value="HOLIDAY">HOLIDAY</option>
          </select>

          <input placeholder="Title" value={eventForm.title} onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: 14, marginBottom: 12, borderRadius: 10, border: "1px solid #d9d9d9" }} />
          <input placeholder="Home" value={eventForm.home} onChange={(e) => setEventForm((prev) => ({ ...prev, home: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: 14, marginBottom: 12, borderRadius: 10, border: "1px solid #d9d9d9" }} />
          <input placeholder="Away" value={eventForm.away} onChange={(e) => setEventForm((prev) => ({ ...prev, away: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: 14, marginBottom: 12, borderRadius: 10, border: "1px solid #d9d9d9" }} />
          <input placeholder="Notes" value={eventForm.notes} onChange={(e) => setEventForm((prev) => ({ ...prev, notes: e.target.value }))} style={{ width: "100%", boxSizing: "border-box", padding: 14, marginBottom: 12, borderRadius: 10, border: "1px solid #d9d9d9" }} />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => void saveEvent()} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}>
              Save Event
            </button>
            <button onClick={resetEventForm} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <h2 style={{ fontSize: 30 }}>Schedule</h2>

      <div style={{ display: "grid", gap: 10, marginTop: 12, marginBottom: 24 }}>
        {events.map((event) => {
          const selected = selectedEventId === event.id
          return (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              style={{ textAlign: "left", padding: 14, borderRadius: 14, border: selected ? "3px solid #111" : "1px solid #ddd", background: "white" }}
            >
              <div style={{ display: "inline-block", padding: "4px 8px", borderRadius: 8, background: eventTypeColor(event.type), fontWeight: 700, marginBottom: 8 }}>
                {event.type}
              </div>
              <div style={{ fontWeight: 700 }}>{event.day} {event.date} • {event.kickOff}</div>
              <div style={{ marginTop: 4 }}>{event.title}</div>
              {event.type === "MATCH" ? <div style={{ marginTop: 4, color: "#555" }}>{event.home} vs {event.away}</div> : null}
            </button>
          )
        })}
      </div>

      {selectedEvent ? (
        <>
          <h2 style={{ fontSize: 30 }}>Attendance</h2>
          <div style={{ marginBottom: 10, color: "#555" }}>P = Playing, R = Reserve, NO = Not available, OFF = Not selected</div>

          <div style={{ display: "grid", gap: 10, marginTop: 12, marginBottom: 30 }}>
            {players.map((player) => {
              const status = getAttendanceStatus(selectedEvent.id, player.id)
              return (
                <div key={player.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, border: "1px solid #ddd", background: "white" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{player.name}</div>
                    <div style={{ color: "#555" }}>{player.positions.join("/")}</div>
                  </div>

                  <button
                    onClick={() => void cycleAttendance(player.id)}
                    style={{ minWidth: 72, padding: "10px 14px", borderRadius: 999, border: "1px solid #ccc", background: attendanceColor(status), fontWeight: 700 }}
                  >
                    {status}
                  </button>
                </div>
              )
            })}
          </div>

          <div style={{ marginBottom: 20 }}>
            <strong>Available:</strong> {availablePlayers.length} • <strong>Reserve:</strong> {reservePlayers.length}
          </div>

          {selectedEvent.type === "MATCH" ? (
            <>
              <h2 style={{ fontSize: 34, marginBottom: 8 }}>Quarter Planner</h2>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <select
                  value={matchFormat}
                  onChange={(e) => {
                    const nextFormat = e.target.value as MatchFormat
                    setMatchFormat(nextFormat)
                    setFormation(Object.keys(FORMATIONS[nextFormat])[0])
                  }}
                  style={{ padding: 12, borderRadius: 10 }}
                >
                  <option value="7v7">7v7</option>
                  <option value="9v9">9v9</option>
                  <option value="11v11">11v11</option>
                </select>

                <select value={formation} onChange={(e) => setFormation(e.target.value)} style={{ padding: 12, borderRadius: 10 }}>
                  {Object.keys(FORMATIONS[matchFormat]).map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>

                <button onClick={() => void generateQuarterPlans()} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}>
                  Generate 4 Quarters
                </button>

                <button onClick={() => void saveCurrentQuarter()} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}>
                  Save Quarter
                </button>

                <button onClick={autoFillPitch} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}>
                  Auto Fill Current Quarter
                </button>

                <button onClick={clearPitch} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}>
                  Clear
                </button>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
                {[1, 2, 3, 4].map((q) => (
                  <button
                    key={q}
                    onClick={() => loadQuarter(q)}
                    style={{
                      padding: "10px 16px",
                      borderRadius: 999,
                      border: currentQuarter === q ? "3px solid #111" : "1px solid #ccc",
                      background: "white",
                    }}
                  >
                    Quarter {q}
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 24, fontWeight: 700 }}>Quarter {currentQuarter} Timer</div>
                <div style={{ fontSize: 56, lineHeight: 1.1, marginTop: 8 }}>{formatSeconds(matchSeconds)}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
                  <button onClick={() => setTimerRunning(true)} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}>Start</button>
                  <button onClick={() => setTimerRunning(false)} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}>Pause</button>
                  <button onClick={() => { setTimerRunning(false); setMatchSeconds(0); setPlayerSeconds({}) }} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}>Reset</button>
                  <button onClick={() => void saveLiveMinutesToStats()} style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #ccc" }}>Save Minutes</button>
                </div>
              </div>

              <div style={{ background: "#3f7f35", padding: 20, borderRadius: 24, color: "white", marginBottom: 24 }}>
                <div style={{ fontSize: 36, fontWeight: 700, marginBottom: 18 }}>Quarter {currentQuarter} Pitch</div>

                {selectedBenchId ? (
                  <div style={{ marginBottom: 14, padding: 12, borderRadius: 12, background: "rgba(255,255,255,0.18)" }}>
                    Selected: <strong>{availablePlayers.find((p) => p.id === selectedBenchId)?.name || "Unknown player"}</strong>
                  </div>
                ) : null}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: pitchSlots.length <= 7 ? "repeat(3, 1fr)" : pitchSlots.length <= 9 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
                    gap: 16,
                  }}
                >
                  {pitchSlots.map((slot, index) => {
                    const player = pitchPlayers[index]
                    return (
                      <div
                        key={`${slot}-${index}`}
                        style={{
                          minHeight: 118,
                          borderRadius: 18,
                          border: "4px solid rgba(255,255,255,0.9)",
                          background: "rgba(255,255,255,0.18)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          padding: 10,
                          boxSizing: "border-box",
                        }}
                      >
                        {player ? (
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{slot}</div>
                            <div style={{ marginTop: 6, fontSize: 20 }}>{player.name}</div>
                            <div style={{ marginTop: 6, fontSize: 16 }}>{formatSeconds(playerSeconds[player.id] || 0)}</div>
                            <div style={{ marginTop: 10 }}>
                              <button onClick={() => removeFromPitch(index)} style={{ padding: "8px 12px", borderRadius: 999, border: "none" }}>
                                Bench
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 16 }}>{slot}</div>
                            <div style={{ marginTop: 8, fontSize: 20 }}>Empty</div>
                            <div style={{ marginTop: 10 }}>
                              <button onClick={() => placeBenchPlayer(index)} disabled={!selectedBenchId} style={{ padding: "8px 12px", borderRadius: 999, border: "none" }}>
                                Place
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <h2 style={{ fontSize: 32 }}>Bench</h2>
              <div style={{ display: "grid", gap: 12, marginTop: 12, marginBottom: 24 }}>
                {benchPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => setSelectedBenchId(player.id)}
                    style={{
                      width: "100%",
                      padding: "18px 16px",
                      borderRadius: 18,
                      border: selectedBenchId === player.id ? "3px solid #1677ff" : "1px solid #c9c9c9",
                      background: "#efe4ae",
                      fontSize: 18,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{player.name}</span>
                    <span>{formatSeconds(playerSeconds[player.id] || 0)}</span>
                  </button>
                ))}
              </div>

              <h2 style={{ fontSize: 32 }}>Match Stats</h2>
              <div style={{ display: "grid", gap: 10, marginTop: 12, marginBottom: 24 }}>
                {availablePlayers.map((player) => {
                  const stat = getPlayerStat(selectedEvent.id, player.id)
                  return (
                    <div key={player.id} style={{ padding: 14, borderRadius: 14, border: "1px solid #ddd", background: "white" }}>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>{player.name}</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                        <button onClick={() => void savePlayerStat(selectedEvent.id, player.id, { goals: Math.max(0, stat.goals - 1) })} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #ccc" }}>Goals -</button>
                        <div style={{ paddingTop: 8 }}>Goals: {stat.goals}</div>
                        <button onClick={() => void savePlayerStat(selectedEvent.id, player.id, { goals: stat.goals + 1 })} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #ccc" }}>Goals +</button>

                        <button onClick={() => void savePlayerStat(selectedEvent.id, player.id, { assists: Math.max(0, stat.assists - 1) })} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #ccc" }}>Assists -</button>
                        <div style={{ paddingTop: 8 }}>Assists: {stat.assists}</div>
                        <button onClick={() => void savePlayerStat(selectedEvent.id, player.id, { assists: stat.assists + 1 })} style={{ padding: "8px 12px", borderRadius: 999, border: "1px solid #ccc" }}>Assists +</button>

                        <div style={{ paddingTop: 8 }}>Saved Minutes: {stat.minutes}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : null}

          <h2 style={{ fontSize: 32, marginTop: 28 }}>Season Stats</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
            {seasonStats.map((row) => (
              <div key={row.player.id} style={{ padding: 14, borderRadius: 14, border: "1px solid #ddd", background: "white" }}>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{row.player.name}</div>
                <div style={{ marginTop: 6, color: "#555" }}>{row.player.positions.join("/")}</div>
                <div style={{ marginTop: 8 }}>
                  Attendance P: {row.attendanceP} • R: {row.attendanceR} • NO: {row.attendanceNo} • OFF: {row.attendanceOff}
                </div>
                <div style={{ marginTop: 6 }}>
                  Availability: {percent(row.attendanceP, row.attendanceP + row.attendanceR + row.attendanceNo)}
                </div>
                <div style={{ marginTop: 6 }}>
                  Goals: {row.goals} • Assists: {row.assists} • Minutes: {row.minutes}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </main>
  )
}
