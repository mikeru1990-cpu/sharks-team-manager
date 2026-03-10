"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../supabase"

type Position = "GK" | "DEF" | "MID" | "FWD"
type EventType = "MATCH" | "TRAINING" | "NO_GAME" | "HOLIDAY"
type AttendanceStatus = "P" | "R" | "NO" | "OFF"
type GameType = "7v7" | "9v9" | "11v11"

type Player = {
  id: string
  name: string
  positions: Position[]
  mainGK?: boolean
  backupGK?: boolean
}

type EventItem = {
  id: string
  date: string
  day: string
  kickOff: string
  type: EventType
  title: string
  home?: string
  away?: string
  notes?: string
}

type FormationConfig = {
  label: string
  slots: Position[]
}

type DbPlayer = {
  id: string
  name: string
  positions_json: string
  main_gk: boolean
  backup_gk: boolean
}

type DbEvent = {
  id: string
  date: string
  day: string
  kick_off: string
  type: string
  title: string
  home: string | null
  away: string | null
  notes: string | null
}

type StoredPlan = {
  game_type: GameType
  formation_label: string
  use_custom_formation: boolean
  custom_def: number
  custom_mid: number
  custom_fwd: number
  quarters_json: string | null
}

const ALL_POSITIONS: Position[] = ["GK", "DEF", "MID", "FWD"]
const STATUS_OPTIONS: AttendanceStatus[] = ["P", "R", "NO", "OFF"]

const FORMATIONS: Record<GameType, FormationConfig[]> = {
  "7v7": [
    { label: "2-3-1", slots: ["GK", "DEF", "DEF", "MID", "MID", "MID", "FWD"] },
    { label: "3-2-1", slots: ["GK", "DEF", "DEF", "DEF", "MID", "MID", "FWD"] },
  ],
  "9v9": [
    { label: "3-3-2", slots: ["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD"] },
    { label: "3-4-1", slots: ["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD"] },
  ],
  "11v11": [
    { label: "4-3-3", slots: ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"] },
    { label: "4-4-2", slots: ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD", "FWD"] },
    { label: "3-5-2", slots: ["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "MID", "FWD", "FWD"] },
  ],
}

function statusColor(status: AttendanceStatus) {
  if (status === "P") return "#25d366"
  if (status === "R") return "#f7d046"
  if (status === "NO") return "#ff4d4f"
  return "#d9d9d9"
}

function eventTypeColor(type: EventType) {
  if (type === "MATCH") return "#1aff00"
  if (type === "TRAINING") return "#d9d9d9"
  if (type === "NO_GAME") return "#ff1a1a"
  return "#9acd50"
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [attendance, setAttendance] = useState<Record<string, Record<string, AttendanceStatus>>>({})
  const [selectedEventId, setSelectedEventId] = useState<string>("")

  const [gameType, setGameType] = useState<GameType>("7v7")
  const [formationLabel, setFormationLabel] = useState("2-3-1")
  const [customDef, setCustomDef] = useState(2)
  const [customMid, setCustomMid] = useState(3)
  const [customFwd, setCustomFwd] = useState(1)
  const [useCustomFormation, setUseCustomFormation] = useState(false)

  const [quarters, setQuarters] = useState<Player[][]>([])
  const [currentQuarter, setCurrentQuarter] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [loading, setLoading] = useState(true)

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
    date: "",
    day: "",
    kickOff: "",
    type: "MATCH",
    title: "",
    home: "",
    away: "",
    notes: "",
  })

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    if (selectedEventId) {
      void loadPlan(selectedEventId)
    }
  }, [selectedEventId])

  async function loadAll() {
    setLoading(true)

    const [playersRes, eventsRes, attendanceRes] = await Promise.all([
      supabase.from("players").select("*").order("created_at", { ascending: true }),
      supabase.from("events").select("*").order("created_at", { ascending: true }),
      supabase.from("event_attendance").select("*"),
    ])

    if (playersRes.data) {
      const parsedPlayers: Player[] = (playersRes.data as DbPlayer[]).map((row) => ({
        id: row.id,
        name: row.name,
        positions: JSON.parse(row.positions_json || "[]"),
        mainGK: row.main_gk,
        backupGK: row.backup_gk,
      }))
      setPlayers(parsedPlayers)
    }

    if (eventsRes.data) {
      const parsedEvents: EventItem[] = (eventsRes.data as DbEvent[]).map((row) => ({
        id: row.id,
        date: row.date,
        day: row.day,
        kickOff: row.kick_off,
        type: row.type as EventType,
        title: row.title,
        home: row.home || "",
        away: row.away || "",
        notes: row.notes || "",
      }))
      setEvents(parsedEvents)
      if (parsedEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(parsedEvents[0].id)
      }
    }

    if (attendanceRes.data) {
      const mapped: Record<string, Record<string, AttendanceStatus>> = {}
      attendanceRes.data.forEach((row: any) => {
        if (!mapped[row.event_id]) mapped[row.event_id] = {}
        mapped[row.event_id][row.player_id] = row.status as AttendanceStatus
      })
      setAttendance(mapped)
    }

    setLoading(false)
  }

  async function loadPlan(eventId: string) {
    const { data } = await supabase
      .from("event_plans")
      .select("*")
      .eq("event_id", eventId)
      .maybeSingle()

    if (!data) {
      setQuarters([])
      setCurrentQuarter(0)
      return
    }

    const row = data as StoredPlan
    setGameType(row.game_type)
    setFormationLabel(row.formation_label)
    setUseCustomFormation(row.use_custom_formation)
    setCustomDef(row.custom_def)
    setCustomMid(row.custom_mid)
    setCustomFwd(row.custom_fwd)
    setQuarters(row.quarters_json ? JSON.parse(row.quarters_json) : [])
    setCurrentQuarter(0)
  }

  const selectedEvent = events.find((e) => e.id === selectedEventId)

  const currentFormation = useMemo(() => {
    if (useCustomFormation) {
      return {
        label: `${customDef}-${customMid}-${customFwd}`,
        slots: [
          "GK",
          ...Array(customDef).fill("DEF"),
          ...Array(customMid).fill("MID"),
          ...Array(customFwd).fill("FWD"),
        ] as Position[],
      }
    }

    return (
      FORMATIONS[gameType].find((f) => f.label === formationLabel) ||
      FORMATIONS[gameType][0]
    )
  }, [useCustomFormation, customDef, customMid, customFwd, gameType, formationLabel])

  function totalPlayersForGame(type: GameType) {
    if (type === "7v7") return 7
    if (type === "9v9") return 9
    return 11
  }

  function clampCustomFormation(def: number, mid: number, fwd: number, type: GameType) {
    const requiredOutfield = totalPlayersForGame(type) - 1
    let d = Math.max(0, def)
    let m = Math.max(0, mid)
    let f = Math.max(0, fwd)
    const total = d + m + f

    if (total === requiredOutfield) return { d, m, f }

    if (total < requiredOutfield) {
      m += requiredOutfield - total
      return { d, m, f }
    }

    let over = total - requiredOutfield
    while (over > 0 && f > 0) { f--; over-- }
    while (over > 0 && m > 0) { m--; over-- }
    while (over > 0 && d > 0) { d--; over-- }

    return { d, m, f }
  }

  function getStatus(eventId: string, playerId: string): AttendanceStatus {
    return attendance[eventId]?.[playerId] || "OFF"
  }

  async function setStatus(eventId: string, playerId: string, status: AttendanceStatus) {
    setAttendance((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || {}),
        [playerId]: status,
      },
    }))

    await supabase
      .from("event_attendance")
      .upsert(
        { event_id: eventId, player_id: playerId, status },
        { onConflict: "event_id,player_id" }
      )
  }

  function cycleStatus(eventId: string, playerId: string) {
    const current = getStatus(eventId, playerId)
    const currentIndex = STATUS_OPTIONS.indexOf(current)
    const next = STATUS_OPTIONS[(currentIndex + 1) % STATUS_OPTIONS.length]
    void setStatus(eventId, playerId, next)
  }

  const availablePlayersForEvent = useMemo(() => {
    if (!selectedEvent) return []
    return players.filter((p) => getStatus(selectedEvent.id, p.id) === "P")
  }, [players, attendance, selectedEvent])

  const headCount = availablePlayersForEvent.length

  const reserveCount = useMemo(() => {
    if (!selectedEvent) return 0
    return players.filter((p) => getStatus(selectedEvent.id, p.id) === "R").length
  }, [players, attendance, selectedEvent])

  function shuffle<T>(array: T[]) {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  function uniquePlayers(list: Player[]) {
    const seen = new Set<string>()
    return list.filter((p) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
  }

  function pickGoalkeeper(pool: Player[], usedIds: Set<string>) {
    const mainKeeper = shuffle(pool.filter((p) => !usedIds.has(p.id) && p.mainGK))
    if (mainKeeper.length > 0) {
      usedIds.add(mainKeeper[0].id)
      return mainKeeper[0]
    }

    const backupKeeper = shuffle(pool.filter((p) => !usedIds.has(p.id) && p.backupGK))
    if (backupKeeper.length > 0) {
      usedIds.add(backupKeeper[0].id)
      return backupKeeper[0]
    }

    const naturalKeeper = shuffle(
      pool.filter((p) => !usedIds.has(p.id) && p.positions.includes("GK"))
    )
    if (naturalKeeper.length > 0) {
      usedIds.add(naturalKeeper[0].id)
      return naturalKeeper[0]
    }

    const fallback = shuffle(pool.filter((p) => !usedIds.has(p.id)))
    if (fallback.length > 0) {
      usedIds.add(fallback[0].id)
      return fallback[0]
    }

    return null
  }

  function pickOutfieldForRole(
    pool: Player[],
    role: Exclude<Position, "GK">,
    count: number,
    usedIds: Set<string>
  ) {
    const eligible = shuffle(pool.filter((p) => !usedIds.has(p.id) && p.positions.includes(role)))
    const picked = eligible.slice(0, count)
    picked.forEach((p) => usedIds.add(p.id))
    return picked
  }

  function fillRemainingSlots(
    pool: Player[],
    targetCount: number,
    current: Player[],
    usedIds: Set<string>
  ) {
    const remaining = shuffle(pool.filter((p) => !usedIds.has(p.id)))
    const filled = [...current]

    while (filled.length < targetCount && remaining.length > 0) {
      const next = remaining.shift()
      if (next) {
        filled.push(next)
        usedIds.add(next.id)
      }
    }

    return filled
  }

  function buildTeamForSlots(pool: Player[], slots: Position[]) {
    const usedIds = new Set<string>()
    const ordered: Player[] = []

    const slotCounts = {
      DEF: slots.filter((s) => s === "DEF").length,
      MID: slots.filter((s) => s === "MID").length,
      FWD: slots.filter((s) => s === "FWD").length,
    }

    const goalkeeper = pickGoalkeeper(pool, usedIds)
    if (goalkeeper) ordered.push(goalkeeper)

    const defs = pickOutfieldForRole(pool, "DEF", slotCounts.DEF, usedIds)
    const mids = pickOutfieldForRole(pool, "MID", slotCounts.MID, usedIds)
    const fwds = pickOutfieldForRole(pool, "FWD", slotCounts.FWD, usedIds)

    ordered.push(...defs, ...mids, ...fwds)

    return fillRemainingSlots(pool, slots.length, ordered, usedIds)
  }

  function rotatePool(playersPool: Player[], offset: number) {
    if (playersPool.length === 0) return []
    const amount = offset % playersPool.length
    return [...playersPool.slice(amount), ...playersPool.slice(0, amount)]
  }

  async function savePlan(eventId: string, quarterData: Player[][]) {
    setIsSaving(true)
    await supabase
      .from("event_plans")
      .upsert(
        {
          event_id: eventId,
          game_type: gameType,
          formation_label: formationLabel,
          use_custom_formation: useCustomFormation,
          custom_def: customDef,
          custom_mid: customMid,
          custom_fwd: customFwd,
          quarters_json: JSON.stringify(quarterData),
        },
        { onConflict: "event_id" }
      )
    setIsSaving(false)
  }

  async function generateRotation() {
    if (!selectedEvent) return
    const needed = currentFormation.slots.length

    if (availablePlayersForEvent.length < needed) {
      alert(`Need at least ${needed} players marked P for ${gameType}`)
      return
    }

    const builtQuarters: Player[][] = []

    for (let q = 0; q < 4; q++) {
      const rotated = rotatePool(availablePlayersForEvent, q * 2)
      const quarter = buildTeamForSlots(rotated, currentFormation.slots)
      builtQuarters.push(uniquePlayers(quarter))
    }

    setQuarters(builtQuarters)
    setCurrentQuarter(0)
    await savePlan(selectedEvent.id, builtQuarters)
  }

  function nextQuarter() {
    setCurrentQuarter((q) => Math.min(q + 1, 3))
  }

  function previousQuarter() {
    setCurrentQuarter((q) => Math.max(q - 1, 0))
  }

  function handleGameTypeChange(value: GameType) {
    setGameType(value)
    setFormationLabel(FORMATIONS[value][0].label)
    setQuarters([])
    setCurrentQuarter(0)
  }

  function updateCustomFormation(nextDef: number, nextMid: number, nextFwd: number) {
    const fixed = clampCustomFormation(nextDef, nextMid, nextFwd, gameType)
    setCustomDef(fixed.d)
    setCustomMid(fixed.m)
    setCustomFwd(fixed.f)
    setQuarters([])
    setCurrentQuarter(0)
  }

  const currentTeam = quarters[currentQuarter] || []
  const allQuarterPlayers = uniquePlayers(quarters.flat())
  const currentBench = allQuarterPlayers.filter(
    (p) => !currentTeam.find((f) => f.id === p.id)
  )

  function getPlayersForLine(role: Position, used: Set<string>) {
    const indices: number[] = []
    currentFormation.slots.forEach((slot, idx) => {
      if (slot === role) indices.push(idx)
    })

    return indices
      .map((idx) => currentTeam[idx])
      .filter((p): p is Player => Boolean(p))
      .filter((p) => {
        if (used.has(p.id)) return false
        used.add(p.id)
        return true
      })
  }

  function renderLine(title: string, group: Player[]) {
    return (
      <div style={{ display: "flex", justifyContent: "space-around", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {group.map((p) => (
          <div key={`${title}-${p.id}`} style={{ textAlign: "center", minWidth: 90 }}>
            <div style={{ fontWeight: "bold" }}>{title}</div>
            <div>{p.name}</div>
          </div>
        ))}
      </div>
    )
  }

  const lineGroups = useMemo(() => {
    const used = new Set<string>()
    return {
      gk: getPlayersForLine("GK", used),
      def: getPlayersForLine("DEF", used),
      mid: getPlayersForLine("MID", used),
      fwd: getPlayersForLine("FWD", used),
    }
  }, [currentTeam, currentFormation])

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

  function togglePlayerFormPosition(position: Position) {
    setPlayerForm((prev) => {
      const has = prev.positions.includes(position)
      let positions = has
        ? prev.positions.filter((p) => p !== position)
        : [...prev.positions, position]

      if (positions.length === 0) positions = [position]

      return { ...prev, positions }
    })
  }

  async function savePlayer() {
    const id = editingPlayerId || makeId()
    const payload = {
      id,
      name: playerForm.name.trim(),
      positions_json: JSON.stringify(playerForm.positions),
      main_gk: !!playerForm.mainGK,
      backup_gk: !!playerForm.backupGK,
    }

    if (!payload.name) {
      alert("Player name required")
      return
    }

    await supabase.from("players").upsert(payload, { onConflict: "id" })
    await loadAll()
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

  function resetEventForm() {
    setEventForm({
      id: "",
      date: "",
      day: "",
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

  function startEditEvent(event: EventItem) {
    setEventForm(event)
    setEditingEventId(event.id)
    setShowEventForm(true)
  }

  async function saveEvent() {
    const id = editingEventId || makeId()
    const payload = {
      id,
      date: eventForm.date,
      day: eventForm.day,
      kick_off: eventForm.kickOff,
      type: eventForm.type,
      title: eventForm.title,
      home: eventForm.home || "",
      away: eventForm.away || "",
      notes: eventForm.notes || "",
    }

    if (!payload.date || !payload.day || !payload.kick_off || !payload.title) {
      alert("Date, day, kick off and title are required")
      return
    }

    await supabase.from("events").upsert(payload, { onConflict: "id" })
    await loadAll()
    setEditingEventId(null)
    setShowEventForm(false)
    if (!selectedEventId) setSelectedEventId(id)
  }

  if (loading) {
    return <main style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>Loading...</main>
  }

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "0 auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Sharks Team Manager</h1>

      <h2 style={{ marginTop: 20 }}>Players Manager</h2>
      <button onClick={() => {
        setPlayerForm({ id: "", name: "", positions: ["MID"], mainGK: false, backupGK: false })
        setEditingPlayerId(null)
        setShowPlayerForm(true)
      }}>
        Add Player
      </button>

      {showPlayerForm && (
        <div style={{ marginTop: 12, padding: 16, background: "#f5f5f5", borderRadius: 12 }}>
          <div style={{ marginBottom: 10 }}>
            <strong>{editingPlayerId ? "Edit Player" : "Add Player"}</strong>
          </div>

          <input
            placeholder="Player name"
            value={playerForm.name}
            onChange={(e) => setPlayerForm((prev) => ({ ...prev, name: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <div style={{ marginBottom: 10 }}>
            {ALL_POSITIONS.map((pos) => (
              <label key={pos} style={{ display: "block", marginBottom: 4 }}>
                <input
                  type="checkbox"
                  checked={playerForm.positions.includes(pos)}
                  onChange={() => togglePlayerFormPosition(pos)}
                />{" "}
                {pos}
              </label>
            ))}
          </div>

          <label style={{ display: "block", marginBottom: 6 }}>
            <input
              type="checkbox"
              checked={!!playerForm.mainGK}
              onChange={(e) =>
                setPlayerForm((prev) => ({
                  ...prev,
                  mainGK: e.target.checked,
                  positions: e.target.checked && !prev.positions.includes("GK")
                    ? [...prev.positions, "GK"]
                    : prev.positions,
                }))
              }
            />{" "}
            Main GK
          </label>

          <label style={{ display: "block", marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={!!playerForm.backupGK}
              onChange={(e) => setPlayerForm((prev) => ({ ...prev, backupGK: e.target.checked }))}
            />{" "}
            Backup GK
          </label>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => void savePlayer()}>Save Player</button>
            <button onClick={resetPlayerForm}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {players.map((player) => (
          <div
            key={player.id}
            style={{
              padding: 12,
              border: "1px solid #ddd",
              borderRadius: 10,
              background: "white",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              {player.name} • {player.positions.join("/")}
              {player.mainGK ? " (Main GK)" : ""}
              {!player.mainGK && player.backupGK ? " (Backup GK)" : ""}
            </div>
            <button style={{ marginTop: 8 }} onClick={() => startEditPlayer(player)}>
              Edit Player
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 30 }}>Events Manager</h2>
      <button onClick={() => {
        setEventForm({
          id: "",
          date: "",
          day: "",
          kickOff: "",
          type: "MATCH",
          title: "",
          home: "",
          away: "",
          notes: "",
        })
        setEditingEventId(null)
        setShowEventForm(true)
      }}>
        Add Event
      </button>

      {showEventForm && (
        <div style={{ marginTop: 12, padding: 16, background: "#f5f5f5", borderRadius: 12 }}>
          <div style={{ marginBottom: 10 }}>
            <strong>{editingEventId ? "Edit Event" : "Add Event"}</strong>
          </div>

          <input
            placeholder="Day (Fri)"
            value={eventForm.day}
            onChange={(e) => setEventForm((prev) => ({ ...prev, day: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          />

          <input
            placeholder="Date (07-Dec)"
            value={eventForm.date}
            onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          />

          <input
            placeholder="Kick off (10:00)"
            value={eventForm.kickOff}
            onChange={(e) => setEventForm((prev) => ({ ...prev, kickOff: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          />

          <select
            value={eventForm.type}
            onChange={(e) => setEventForm((prev) => ({ ...prev, type: e.target.value as EventType }))}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          >
            <option value="MATCH">MATCH</option>
            <option value="TRAINING">TRAINING</option>
            <option value="NO_GAME">NO GAME</option>
            <option value="HOLIDAY">HOLIDAY</option>
          </select>

          <input
            placeholder="Title"
            value={eventForm.title}
            onChange={(e) => setEventForm((prev) => ({ ...prev, title: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          />

          <input
            placeholder="Home"
            value={eventForm.home}
            onChange={(e) => setEventForm((prev) => ({ ...prev, home: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          />

          <input
            placeholder="Away"
            value={eventForm.away}
            onChange={(e) => setEventForm((prev) => ({ ...prev, away: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          />

          <input
            placeholder="Notes"
            value={eventForm.notes}
            onChange={(e) => setEventForm((prev) => ({ ...prev, notes: e.target.value }))}
            style={{ width: "100%", padding: 10, marginBottom: 8 }}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => void saveEvent()}>Save Event</button>
            <button onClick={resetEventForm}>Cancel</button>
          </div>
        </div>
      )}

      <h2 style={{ marginTop: 30 }}>Schedule</h2>

      <div style={{ display: "grid", gap: 10 }}>
        {events.map((event) => {
          const isSelected = selectedEventId === event.id
          return (
            <div
              key={event.id}
              style={{
                padding: 14,
                borderRadius: 12,
                border: isSelected ? "3px solid #111" : "1px solid #ddd",
                background: "white",
              }}
            >
              <button
                onClick={() => setSelectedEventId(event.id)}
                style={{ display: "block", width: "100%", textAlign: "left", background: "transparent", border: "none", padding: 0 }}
              >
                <div
                  style={{
                    display: "inline-block",
                    padding: "4px 8px",
                    borderRadius: 8,
                    background: eventTypeColor(event.type),
                    marginBottom: 8,
                    fontWeight: 700,
                  }}
                >
                  {event.type.replace("_", " ")}
                </div>

                <div style={{ fontWeight: 700 }}>
                  {event.day} {event.date} • {event.kickOff}
                </div>

                <div style={{ marginTop: 4 }}>{event.title}</div>

                {event.type === "MATCH" && (
                  <div style={{ marginTop: 4, color: "#333" }}>
                    {event.home} vs {event.away}
                  </div>
                )}
              </button>

              <button style={{ marginTop: 8 }} onClick={() => startEditEvent(event)}>
                Edit Event
              </button>
            </div>
          )
        })}
      </div>

      {selectedEvent && (
        <>
          <h2 style={{ marginTop: 30 }}>Attendance</h2>

          <div style={{ padding: 16, borderRadius: 12, background: "#f5f5f5", marginBottom: 20 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>
              {selectedEvent.day} {selectedEvent.date} • {selectedEvent.kickOff}
            </div>
            <div style={{ marginBottom: 6 }}>{selectedEvent.title}</div>

            {selectedEvent.type === "MATCH" && (
              <div style={{ marginBottom: 10 }}>
                {selectedEvent.home} vs {selectedEvent.away}
              </div>
            )}

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <div><strong>Head Count:</strong> {headCount}</div>
              <div><strong>Reserve:</strong> {reserveCount}</div>
              <div><strong>Playing This Week:</strong> {selectedEvent.type === "MATCH" ? headCount + reserveCount : 0}</div>
              <div><strong>{isSaving ? "Saving..." : "Saved"}</strong></div>
            </div>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {players.map((player) => {
              const status = getStatus(selectedEvent.id, player.id)
              return (
                <div
                  key={player.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 10,
                    padding: 12,
                    border: "1px solid #ddd",
                    borderRadius: 10,
                    background: "white",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {player.name} • {player.positions.join("/")}
                    </div>
                  </div>

                  <button
                    onClick={() => cycleStatus(selectedEvent.id, player.id)}
                    style={{
                      minWidth: 72,
                      padding: "10px 14px",
                      borderRadius: 999,
                      border: "1px solid #ccc",
                      background: statusColor(status),
                      fontWeight: 700,
                    }}
                  >
                    {status}
                  </button>
                </div>
              )
            })}
          </div>

          {selectedEvent.type === "MATCH" && (
            <>
              <h2 style={{ marginTop: 30 }}>Formation Builder</h2>

              <div style={{ padding: 16, borderRadius: 12, background: "#f5f5f5", marginBottom: 20 }}>
                <select
                  value={gameType}
                  onChange={(e) => handleGameTypeChange(e.target.value as GameType)}
                  style={{ padding: 10, marginRight: 10, marginBottom: 10 }}
                >
                  <option value="7v7">7v7</option>
                  <option value="9v9">9v9</option>
                  <option value="11v11">11v11</option>
                </select>

                <select
                  value={formationLabel}
                  onChange={(e) => {
                    setUseCustomFormation(false)
                    setFormationLabel(e.target.value)
                    setQuarters([])
                    setCurrentQuarter(0)
                  }}
                  style={{ padding: 10, marginBottom: 10 }}
                >
                  {FORMATIONS[gameType].map((f) => (
                    <option key={f.label} value={f.label}>
                      Preset {f.label}
                    </option>
                  ))}
                </select>

                <div style={{ marginTop: 12, marginBottom: 12 }}>
                  <label>
                    <input
                      type="checkbox"
                      checked={useCustomFormation}
                      onChange={(e) => {
                        setUseCustomFormation(e.target.checked)
                        setQuarters([])
                        setCurrentQuarter(0)
                      }}
                    />{" "}
                    Use Custom Formation
                  </label>
                </div>

                {useCustomFormation && (
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <div>
                      <div>DEF</div>
                      <input
                        type="number"
                        min={0}
                        value={customDef}
                        onChange={(e) => updateCustomFormation(Number(e.target.value), customMid, customFwd)}
                        style={{ width: 70, padding: 8 }}
                      />
                    </div>

                    <div>
                      <div>MID</div>
                      <input
                        type="number"
                        min={0}
                        value={customMid}
                        onChange={(e) => updateCustomFormation(customDef, Number(e.target.value), customFwd)}
                        style={{ width: 70, padding: 8 }}
                      />
                    </div>

                    <div>
                      <div>FWD</div>
                      <input
                        type="number"
                        min={0}
                        value={customFwd}
                        onChange={(e) => updateCustomFormation(customDef, customMid, Number(e.target.value))}
                        style={{ width: 70, padding: 8 }}
                      />
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 12 }}>
                  <strong>Current Formation:</strong> {currentFormation.label}
                </div>

                <button onClick={() => void generateRotation()} style={{ marginTop: 16 }}>
                  Generate Quarter Plan
                </button>
              </div>
            </>
          )}

          {selectedEvent.type === "MATCH" && quarters.length > 0 && (
            <>
              <h2 style={{ marginTop: 30 }}>Quarter Plan</h2>

              {quarters.map((quarter, index) => (
                <div key={index} style={{ marginBottom: 14 }}>
                  <strong>Quarter {index + 1}</strong>
                  {quarter.map((p, idx) => (
                    <div key={`${index}-${p.id}`}>
                      {currentFormation.slots[idx]} — {p.name} • {p.positions.join("/")}
                    </div>
                  ))}
                </div>
              ))}

              <h2 style={{ marginTop: 30 }}>Match Mode</h2>

              <div style={{ padding: 16, borderRadius: 12, background: "#f3f3f3", marginBottom: 16 }}>
                <strong>
                  Current Quarter: {currentQuarter + 1} • {gameType} • {currentFormation.label}
                </strong>

                <div
                  style={{
                    background: "#2e7d32",
                    color: "white",
                    padding: 20,
                    borderRadius: 12,
                    marginTop: 12,
                  }}
                >
                  {lineGroups.fwd.length > 0 && renderLine("FWD", lineGroups.fwd)}
                  {lineGroups.mid.length > 0 && renderLine("MID", lineGroups.mid)}
                  {lineGroups.def.length > 0 && renderLine("DEF", lineGroups.def)}
                  {lineGroups.gk.length > 0 && (
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: "bold" }}>GK</div>
                      <div>{lineGroups.gk[0].name}</div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 16 }}>
                  <strong>Bench This Quarter</strong>
                  {currentBench.length > 0 ? (
                    currentBench.map((p) => (
                      <div key={p.id}>
                        {p.name} • {p.positions.join("/")}
                      </div>
                    ))
                  ) : (
                    <div>None</div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button onClick={previousQuarter}>Previous Quarter</button>
                  <button onClick={nextQuarter}>Next Quarter</button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </main>
  )
}
