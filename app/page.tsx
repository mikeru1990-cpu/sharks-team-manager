"use client"

export const dynamic = "force-dynamic"

import { useEffect, useMemo, useState } from "react"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import AuthGate from "./components/AuthGate"
import RollingCalendar from "./components/RollingCalendar"
import PlayersManager from "./components/PlayersManager"
import QuarterPlanner from "./components/QuarterPlanner"
import MatchCenter from "./components/MatchCenter"
import { supabase } from "./lib/supabase"
import {
  TEAM,
  buttonPrimary,
  buttonSecondary,
  cardStyle,
  formatMinutes,
  initialEvents,
  initialPlayers,
  initialTrainingTemplates,
  makeId,
  type EventItem,
  type MainTab,
  type MatchTab,
  type MatchEventDraft,
  type MatchFormat,
  type Player,
  type QuarterPlan,
  type SavedLineup,
  type TimelineItem,
  type TrainingTemplate,
} from "./lib/types"
import { buildAutoLineup, buildPitchSlots, canPlaySlot, generateQuarterPlans } from "./lib/rotation"

function Dashboard({
  isAdmin,
  signOut,
}: {
  isAdmin: boolean
  signOut: () => Promise<void>
}) {
  const [tab, setTab] = useState<MainTab>("home")
  const [matchTab, setMatchTab] = useState<MatchTab>("overview")

  const [players, setPlayers] = useState<Player[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
const [showEventForm, setShowEventForm] = useState(false)
const [eventTitle, setEventTitle] = useState("")
const [eventType, setEventType] = useState<"training" | "match" | "other">("training")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const [homeTeam, setHomeTeamState] = useState(TEAM.name)
  const [awayTeam, setAwayTeamState] = useState("Leonard Stanley U10 Lioness")
  const [homeScore, setHomeScoreState] = useState(0)
  const [awayScore, setAwayScoreState] = useState(0)

  const [matchFormat, setMatchFormat] = useState<MatchFormat>("7v7")
  const [formation, setFormation] = useState("2-3-1")
  const [currentQuarter, setCurrentQuarterState] = useState(1)

  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [liveSecondsMap, setLiveSecondsMap] = useState<Record<string, number>>({})

  const [lineupMap, setLineupMap] = useState<Record<string, string | null>>({})
  const [benchIds, setBenchIds] = useState<string[]>([])
  const [savedLineups, setSavedLineups] = useState<SavedLineup[]>([])
  const [lineupName, setLineupName] = useState("")

  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventDraft, setEventDraft] = useState<MatchEventDraft>({
    type: "goal",
    playerId: "",
    secondPlayerId: "",
    note: "",
  })

  const [quarterPlans, setQuarterPlans] = useState<Record<number, QuarterPlan>>({})
  const [quarterWarnings, setQuarterWarnings] = useState<string[]>([])
  const [activeDragPlayerId, setActiveDragPlayerId] = useState<string | null>(null)

  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTrainingTemplates[0].id)
  const [trainingTemplates] = useState<TrainingTemplate[]>(initialTrainingTemplates)
  const [trainingPlan, setTrainingPlan] = useState({
    title: initialTrainingTemplates[0].name,
    warmUp: initialTrainingTemplates[0].warmUp,
    drill1: initialTrainingTemplates[0].drill1,
    drill2: initialTrainingTemplates[0].drill2,
    game: initialTrainingTemplates[0].game,
    notes: initialTrainingTemplates[0].notes,
  })

  const [loading, setLoading] = useState(true)
  const currentSlots = useMemo(() => buildPitchSlots(matchFormat, formation), [matchFormat, formation])

  async function loadAll() {
    setLoading(true)

    if (!supabase) {
      console.error("Supabase env vars are missing")
      setPlayers(initialPlayers)
      setLoading(false)
      return
    }

    const [playersRes, settingsRes, timelineRes, quarterRes, lineupsRes] = await Promise.all([
      supabase.from("players").select("*").order("sort_order", { ascending: true }),
      supabase.from("app_settings").select("*").eq("id", "main").maybeSingle(),
      supabase.from("timeline_events").select("*").order("sort_order", { ascending: true }),
      supabase.from("quarter_plans").select("*").order("quarter_number", { ascending: true }),
      supabase.from("saved_lineups").select("*").order("updated_at", { ascending: false }),
    ])

    if (!playersRes.error && playersRes.data && playersRes.data.length > 0) {
      const nextPlayers: Player[] = playersRes.data.map((row: any) => ({
        id: row.id,
        name: row.name,
        positions: JSON.parse(row.positions_json || "[]"),
        mainGK: !!row.main_gk,
        backupGK: !!row.backup_gk,
        captain: !!row.captain,
        viceCaptain: !!row.vice_captain,
        seasonSeconds: row.season_seconds || 0,
      }))
      setPlayers(nextPlayers)
    } else {
      setPlayers(initialPlayers)
    }

    if (!settingsRes.error && settingsRes.data) {
      setHomeTeamState(settingsRes.data.home_team || TEAM.name)
      setAwayTeamState(settingsRes.data.away_team || "Leonard Stanley U10 Lioness")
      setHomeScoreState(settingsRes.data.home_score || 0)
      setAwayScoreState(settingsRes.data.away_score || 0)
      setMatchFormat((settingsRes.data.match_format as MatchFormat) || "7v7")
      setFormation(settingsRes.data.formation || "2-3-1")
      setCurrentQuarterState(settingsRes.data.current_quarter || 1)
      setSelectedDate(settingsRes.data.selected_date || new Date().toISOString().split("T")[0])
    }

    if (!timelineRes.error && timelineRes.data) {
      const nextTimeline: TimelineItem[] = timelineRes.data.map((row: any) => ({
        id: row.id,
        minute: row.minute,
        type: row.type,
        text: row.text,
        sortOrder: row.sort_order || 0,
      }))
      setTimeline(nextTimeline)
    }

    if (!quarterRes.error && quarterRes.data) {
      const nextPlans: Record<number, QuarterPlan> = {}
      quarterRes.data.forEach((row: any) => {
        nextPlans[row.quarter_number] = {
          lineup: JSON.parse(row.lineup_json || "{}"),
          bench: JSON.parse(row.bench_json || "[]"),
        }
      })
      setQuarterPlans(nextPlans)
    }

    if (!lineupsRes.error && lineupsRes.data) {
      const nextLineups: SavedLineup[] = lineupsRes.data.map((row: any) => ({
        id: row.id,
        name: row.name,
        format: row.match_format,
        formation: row.formation,
        lineup: JSON.parse(row.lineup_json || "{}"),
        bench: JSON.parse(row.bench_json || "[]"),
      }))
      setSavedLineups(nextLineups)
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadAll()
  }, [])

  useEffect(() => {
    if (players.length === 0) return
    const auto = buildAutoLineup(players, currentSlots)
    setLineupMap((prev) => (Object.keys(prev).length === 0 ? auto.lineup : prev))
    setBenchIds((prev) => (prev.length === 0 ? auto.bench : prev))
  }, [players, currentSlots])

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

  async function persistSettings(
    patch?: Partial<{
      homeTeam: string
      awayTeam: string
      matchFormat: MatchFormat
      formation: string
      currentQuarter: number
      homeScore: number
      awayScore: number
      selectedDate: string
    }>
  ) {
    if (!supabase) return

    const next = {
      homeTeam: patch?.homeTeam ?? homeTeam,
      awayTeam: patch?.awayTeam ?? awayTeam,
      matchFormat: patch?.matchFormat ?? matchFormat,
      formation: patch?.formation ?? formation,
      currentQuarter: patch?.currentQuarter ?? currentQuarter,
      homeScore: patch?.homeScore ?? homeScore,
      awayScore: patch?.awayScore ?? awayScore,
      selectedDate: patch?.selectedDate ?? selectedDate,
    }

    await supabase.from("app_settings").upsert({
      id: "main",
      home_team: next.homeTeam,
      away_team: next.awayTeam,
      match_format: next.matchFormat,
      formation: next.formation,
      current_quarter: next.currentQuarter,
      home_score: next.homeScore,
      away_score: next.awayScore,
      selected_date: next.selectedDate,
    })
  }

  async function savePlayers(nextPlayers: Player[]) {
    if (!supabase) return

    const removedIds = players.filter((p) => !nextPlayers.some((n) => n.id === p.id)).map((p) => p.id)
    if (removedIds.length > 0) {
      await supabase.from("players").delete().in("id", removedIds)
    }

    const payload = nextPlayers.map((p, index) => ({
      id: p.id,
      name: p.name,
      positions_json: JSON.stringify(p.positions),
      main_gk: p.mainGK,
      backup_gk: p.backupGK,
      captain: p.captain,
      vice_captain: p.viceCaptain,
      season_seconds: p.seasonSeconds,
      sort_order: index,
    }))

    if (payload.length > 0) {
      await supabase.from("players").upsert(payload)
    }

    setPlayers(nextPlayers)

    const auto = buildAutoLineup(nextPlayers, currentSlots)
    setLineupMap(auto.lineup)
    setBenchIds(auto.bench)
  }

  async function saveLineups(nextLineups: SavedLineup[]) {
    if (!supabase) return

    await supabase.from("saved_lineups").delete().neq("id", "")
    if (nextLineups.length > 0) {
      await supabase.from("saved_lineups").insert(
        nextLineups.map((lineup) => ({
          id: lineup.id,
          name: lineup.name,
          match_format: lineup.format,
          formation: lineup.formation,
          lineup_json: JSON.stringify(lineup.lineup),
          bench_json: JSON.stringify(lineup.bench),
        }))
      )
    }
    setSavedLineups(nextLineups)
  }

  async function saveQuarterPlans(nextPlans: Record<number, QuarterPlan>) {
    if (!supabase) return

    await supabase.from("quarter_plans").delete().gte("quarter_number", 1)
    const entries = Object.entries(nextPlans)
    if (entries.length > 0) {
      await supabase.from("quarter_plans").insert(
        entries.map(([quarterNumber, plan]) => ({
          id: `q-${quarterNumber}`,
          quarter_number: Number(quarterNumber),
          lineup_json: JSON.stringify(plan.lineup),
          bench_json: JSON.stringify(plan.bench),
        }))
      )
    }
    setQuarterPlans(nextPlans)
  }

  async function saveTimeline(nextTimeline: TimelineItem[]) {
    if (!supabase) return

    const removedIds = timeline.filter((t) => !nextTimeline.some((n) => n.id === t.id)).map((t) => t.id)
    if (removedIds.length > 0) {
      await supabase.from("timeline_events").delete().in("id", removedIds)
    }

    if (nextTimeline.length > 0) {
      await supabase.from("timeline_events").upsert(
        nextTimeline.map((item, index) => ({
          id: item.id,
          minute: item.minute,
          type: item.type,
          text: item.text,
          sort_order: index,
        }))
      )
    }

    setTimeline(nextTimeline)
  }

  async function handleChangeFormation(nextFormat: MatchFormat, nextFormation: string) {
    const nextSlots = buildPitchSlots(nextFormat, nextFormation)
    const auto = buildAutoLineup(players, nextSlots)
    setMatchFormat(nextFormat)
    setFormation(nextFormation)
    setLineupMap(auto.lineup)
    setBenchIds(auto.bench)
    await persistSettings({
      matchFormat: nextFormat,
      formation: nextFormation,
    })
  }

  async function handleSaveLineup() {
    if (!lineupName.trim()) {
      alert("Enter a lineup name")
      return
    }

    const nextLineups = [
      {
        id: makeId(),
        name: lineupName.trim(),
        format: matchFormat,
        formation,
        lineup: { ...lineupMap },
        bench: [...benchIds],
      },
      ...savedLineups,
    ]

    await saveLineups(nextLineups)
    setLineupName("")
  }

  async function handleLoadSavedLineup(id: string) {
    const preset = savedLineups.find((item) => item.id === id)
    if (!preset) return
    setMatchFormat(preset.format)
    setFormation(preset.formation)
    setLineupMap(preset.lineup)
    setBenchIds(preset.bench)
    await persistSettings({
      matchFormat: preset.format,
      formation: preset.formation,
    })
  }

  async function handleDeleteSavedLineup(id: string) {
    await saveLineups(savedLineups.filter((item) => item.id !== id))
  }

  function handleDragStart(event: DragStartEvent) {
    const activeId = String(event.active.id)
    const parts = activeId.split("::")
    if (parts.length === 4) {
      setActiveDragPlayerId(parts[1])
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragPlayerId(null)
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const parts = activeId.split("::")
    if (parts.length !== 4) return

    const playerId = parts[1]
    const fromId = parts[3]
    const overId = String(over.id)

    const player = players.find((p) => p.id === playerId)
    if (!player) return

    if (overId === "bench") {
      if (fromId === "bench") return
      setLineupMap((prev) => ({ ...prev, [fromId]: null }))
      setBenchIds((prev) => (prev.includes(playerId) ? prev : [...prev, playerId]))
      return
    }

    const targetSlot = currentSlots.find((slot) => slot.id === overId)
    if (!targetSlot) return
    if (!canPlaySlot(player, targetSlot.position)) return

    const targetPlayerId = lineupMap[overId]

    if (fromId === "bench") {
      setBenchIds((prev) => prev.filter((id) => id !== playerId))
      setLineupMap((prev) => ({ ...prev, [overId]: playerId }))
      if (targetPlayerId && targetPlayerId !== playerId) {
        setBenchIds((prev) => [...prev, targetPlayerId])
      }
      return
    }

    if (fromId.startsWith("slot-")) {
      setLineupMap((prev) => {
        const next = { ...prev }
        next[fromId] = targetPlayerId || null
        next[overId] = playerId
        return next
      })
    }
  }

  function openCreateEvent() {
    if (!isAdmin) {
      alert("Only admins can add events")
      return
    }

    setEditingTimelineId(null)
    setEventDraft({
      type: "goal",
      playerId: "",
      secondPlayerId: "",
      note: "",
    })
    setShowEventModal(true)
  }

  function openEditEvent(item: TimelineItem) {
    if (!isAdmin) {
      alert("Only admins can edit events")
      return
    }

    setEditingTimelineId(item.id)
    setEventDraft({
      type: item.type,
      playerId: "",
      secondPlayerId: "",
      note: item.text,
    })
    setShowEventModal(true)
  }

  async function handleDeleteTimelineItem(id: string) {
    if (!isAdmin) {
      alert("Only admins can delete events")
      return
    }
    await saveTimeline(timeline.filter((item) => item.id !== id))
  }

  async function saveMatchEvent() {
    if (!isAdmin) {
      alert("Only admins can save events")
      return
    }

    const player = players.find((p) => p.id === eventDraft.playerId)
    const secondPlayer = players.find((p) => p.id === eventDraft.secondPlayerId)

    let text = ""
    if (eventDraft.type === "goal") {
      if (!player) return alert("Choose a scorer")
      const nextScore = homeScore + 1
      setHomeScoreState(nextScore)
      await persistSettings({ homeScore: nextScore })
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

    const nextTimeline = editingTimelineId
      ? timeline.map((item) =>
          item.id === editingTimelineId ? { ...item, type: eventDraft.type, text } : item
        )
      : [
          ...timeline,
          {
            id: makeId(),
            minute: Math.floor(seconds / 60),
            type: eventDraft.type,
            text,
            sortOrder: timeline.length,
          },
        ]

    await saveTimeline(nextTimeline)
    setShowEventModal(false)
    setEditingTimelineId(null)
  }

  async function handleSaveCurrentQuarter() {
    const nextPlans = {
      ...quarterPlans,
      [currentQuarter]: {
        lineup: { ...lineupMap },
        bench: [...benchIds],
      },
    }
    await saveQuarterPlans(nextPlans)
  }

  function handleLoadQuarter(quarter: number) {
    const plan = quarterPlans[quarter]
    if (!plan) {
      alert(`No saved plan for Q${quarter}`)
      return
    }
    setCurrentQuarterState(quarter)
    setLineupMap(plan.lineup)
    setBenchIds(plan.bench)
    void persistSettings({ currentQuarter: quarter })
  }

  async function handleAutoGenerate() {
    const { plans, warnings } = generateQuarterPlans(players, currentSlots)
    await saveQuarterPlans(plans)
    setQuarterWarnings(warnings)
    setCurrentQuarterState(1)
    setLineupMap(plans[1].lineup)
    setBenchIds(plans[1].bench)
    await persistSettings({ currentQuarter: 1 })
  }

  async function handleSaveMinutes() {
    const nextPlayers = players.map((player) => ({
      ...player,
      seasonSeconds: player.seasonSeconds + (liveSecondsMap[player.id] || 0),
    }))
    setLiveSecondsMap({})
    await savePlayers(nextPlayers)
  }

  const totalGoals = timeline.filter((t) => t.type === "goal").length
  const totalAssists = timeline.filter((t) => t.type === "assist").length
  const mainGk = players.find((p) => p.mainGK)
  const backupGk = players.find((p) => p.backupGK)

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div style={{ ...cardStyle(), maxWidth: 840, margin: "0 auto" }}>Loading club data...</div>
      </main>
    )
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
        color: "#0f172a",
        paddingBottom: 110,
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
     <div
  style={{
    width: "100%",
    maxWidth: 980,
    margin: "0 auto",
    display: "grid",
    gap: 16,
    boxSizing: "border-box",
    minWidth: 0,
    overflowX: "clip",
  }}
>
        <div
  style={{
    ...cardStyle(`linear-gradient(135deg, ${TEAM.primary} 0%, #0c235f 100%)`),
    color: "white",
    minWidth: 0,
    overflow: "hidden",
  }}
>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) auto",
      gap: 12,
      alignItems: "start",
    }}
  >
    <div style={{ minWidth: 0, overflowWrap: "anywhere" }}>
      <div style={{ fontSize: 13, fontWeight: 800, opacity: 0.8 }}>CLUB HUB</div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          marginTop: 8,
          lineHeight: 1.1,
          overflowWrap: "anywhere",
        }}
      >
        {TEAM.name}
      </div>
      <div
        style={{
          marginTop: 6,
          opacity: 0.9,
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}
      >
        Supabase sync, login, admin mode, weekday calendar and better screen fit.
      </div>
    </div>

    <div
      style={{
        textAlign: "right",
        minWidth: 96,
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.8 }}>{isAdmin ? "ADMIN" : "VIEWER"}</div>
      <button onClick={() => void signOut()} style={{ ...buttonSecondary(), marginTop: 10 }}>
        Sign Out
      </button>
    </div>
  </div>
</div>

        <div
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 16,
            width: "calc(100% - 32px)",
            background: "rgba(255,255,255,0.94)",
            backdropFilter: "blur(12px)",
            border: "1px solid #dbe3ef",
            borderRadius: 28,
            padding: 10,
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            gap: 8,
            boxShadow: "0 10px 30px rgba(15,23,42,0.12)",
            zIndex: 50,
            maxWidth: 980,
            margin: "0 auto",
            boxSizing: "border-box",
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
                minWidth: 0,
              }}
            >
              <div style={{ fontSize: 18 }}>{icon}</div>
              <div>{label}</div>
            </button>
          ))}
        </div>

        {tab === "home" ? (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
              <div style={cardStyle()}>
                <div style={{ color: "#64748b", fontWeight: 800 }}>Players</div>
                <div style={{ fontSize: 40, fontWeight: 900, marginTop: 8 }}>{players.length}</div>
              </div>
              <div style={cardStyle()}>
                <div style={{ color: "#64748b", fontWeight: 800 }}>Goals Logged</div>
                <div style={{ fontSize: 40, fontWeight: 900, marginTop: 8 }}>{totalGoals}</div>
              </div>
              <div style={cardStyle()}>
                <div style={{ color: "#64748b", fontWeight: 800 }}>Main GK</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginTop: 8 }}>{mainGk?.name || "Not set"}</div>
              </div>
              <div style={cardStyle()}>
                <div style={{ color: "#64748b", fontWeight: 800 }}>Backup GK</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginTop: 8 }}>{backupGk?.name || "Not set"}</div>
              </div>
            </div>
          </div>
        ) : null}

        {tab === "players" ? (
          <PlayersManager players={players} isAdmin={isAdmin} onSavePlayers={savePlayers} />
        ) : null}

        {tab === "events" ? (
          <div style={{ display: "grid", gap: 16 }}>
            <RollingCalendar
              selectedDate={selectedDate}
              onSelectDate={(date) => {
                setSelectedDate(date)
                void persistSettings({ selectedDate: date })
              }}
              events={events}
            />
            <div style={cardStyle()}>
  <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
    Calendar Events
  </div>

  {isAdmin && (
    <button
      onClick={() => setShowEventForm(true)}
      style={{ ...buttonPrimary(), marginBottom: 12 }}
    >
      Add Event
    </button>
  )}

  {events
    .filter((e) => e.date === selectedDate)
    .map((event) => (
      <div
        key={event.id}
        style={{
          padding: 12,
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          marginBottom: 8,
        }}
      >
        <div style={{ fontWeight: 900 }}>{event.title}</div>
        <div style={{ color: "#64748b", fontSize: 12 }}>
          {event.type}
        </div>
      </div>
    ))}
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
                      width: "100%",
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{template.name}</div>
                    <div style={{ color: "#64748b", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis" }}>
                      {template.notes}
                    </div>
                  </button>
                ))}
              </div>

              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Training Plan</div>
              <div style={{ display: "grid", gap: 10 }}>
                {[
                  ["Session Title", trainingPlan.title],
                  ["Warm Up", trainingPlan.warmUp],
                  ["Drill 1", trainingPlan.drill1],
                  ["Drill 2", trainingPlan.drill2],
                  ["Game", trainingPlan.game],
                  ["Coach Notes", trainingPlan.notes],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      minWidth: 0,
                    }}
                  >
                    <div style={{ fontWeight: 800, marginBottom: 6 }}>{label}</div>
                    <div style={{ color: "#475569", overflowWrap: "anywhere" }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {tab === "match" ? (
          <>
            <MatchCenter
              isAdmin={isAdmin}
              matchTab={matchTab}
              setMatchTab={setMatchTab}
              matchFormat={matchFormat}
              formation={formation}
              currentSlots={currentSlots}
              players={players}
              lineupMap={lineupMap}
              benchIds={benchIds}
              homeTeam={homeTeam}
              awayTeam={awayTeam}
              homeScore={homeScore}
              awayScore={awayScore}
              seconds={seconds}
              running={running}
              liveSecondsMap={liveSecondsMap}
              timeline={timeline}
              savedLineups={savedLineups}
              lineupName={lineupName}
              setLineupName={setLineupName}
              activeDragPlayerId={activeDragPlayerId}
              setActiveDragPlayerId={setActiveDragPlayerId}
              setHomeTeam={async (value) => {
                setHomeTeamState(value)
                await persistSettings({ homeTeam: value })
              }}
              setAwayTeam={async (value) => {
                setAwayTeamState(value)
                await persistSettings({ awayTeam: value })
              }}
              setHomeScore={async (value) => {
                setHomeScoreState(value)
                await persistSettings({ homeScore: value })
              }}
              setAwayScore={async (value) => {
                setAwayScoreState(value)
                await persistSettings({ awayScore: value })
              }}
              setRunning={setRunning}
              resetClock={() => {
                setRunning(false)
                setSeconds(0)
                setLiveSecondsMap({})
              }}
              saveMinutes={handleSaveMinutes}
              onChangeFormation={handleChangeFormation}
              onSaveLineup={handleSaveLineup}
              onLoadSavedLineup={handleLoadSavedLineup}
              onDeleteSavedLineup={handleDeleteSavedLineup}
              onDragStartExternal={handleDragStart}
              onDragEndExternal={handleDragEnd}
              onOpenCreateEvent={openCreateEvent}
              onOpenEditEvent={openEditEvent}
              onDeleteTimelineItem={handleDeleteTimelineItem}
            />

            {matchTab === "quarters" ? (
              <QuarterPlanner
                isAdmin={isAdmin}
                currentQuarter={currentQuarter}
                setCurrentQuarter={(q) => {
                  setCurrentQuarterState(q)
                  void persistSettings({ currentQuarter: q })
                }}
                quarterPlans={quarterPlans}
                quarterWarnings={quarterWarnings}
                currentSlots={currentSlots}
                players={players}
                lineupMap={lineupMap}
                benchIds={benchIds}
                onSaveCurrentQuarter={handleSaveCurrentQuarter}
                onLoadQuarter={handleLoadQuarter}
                onAutoGenerate={handleAutoGenerate}
              />
            ) : null}
          </>
        ) : null}

        {tab === "stats" ? (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={cardStyle()}>
              <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Club Stats</div>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ fontWeight: 800 }}>Total goals: {totalGoals}</div>
                <div style={{ fontWeight: 800 }}>Total assists: {timeline.filter((t) => t.type === "assist").length}</div>
                <div style={{ fontWeight: 800 }}>Players: {players.length}</div>
                <div style={{ fontWeight: 800 }}>Main GK: {mainGk?.name || "Not set"}</div>
                <div style={{ fontWeight: 800 }}>Backup GK: {backupGk?.name || "Not set"}</div>
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
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{player.name}</div>
                    <div style={{ color: "#64748b", marginTop: 4 }}>{formatMinutes(player.seasonSeconds || 0)} min</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
{showEventForm && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.4)",
      display: "grid",
      placeItems: "center",
      zIndex: 100,
    }}
  >
    <div style={{ ...cardStyle(), width: "90%", maxWidth: 400 }}>
      <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>
        Add Event
      </div>

      <input
        value={eventTitle}
        onChange={(e) => setEventTitle(e.target.value)}
        placeholder="Event title"
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 10,
          borderRadius: 10,
          border: "1px solid #ccc",
        }}
      />

      <select
        value={eventType}
        onChange={(e) => setEventType(e.target.value as any)}
        style={{
          width: "100%",
          padding: 10,
          marginBottom: 10,
          borderRadius: 10,
        }}
      >
        <option value="training">Training</option>
        <option value="match">Match</option>
        <option value="other">Other</option>
      </select>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={addEvent} style={{ ...buttonPrimary(), flex: 1 }}>
          Save
        </button>
        <button
          onClick={() => setShowEventForm(false)}
          style={{ ...buttonSecondary(), flex: 1 }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
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
                    type: e.target.value as "goal" | "assist" | "sub" | "injury" | "note",
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
              <button onClick={() => void saveMatchEvent()} style={{ ...buttonPrimary(), flex: 1 }}>
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

export default function Page() {
  return (
    <AuthGate>
      {({ user, isAdmin, signOut }) => <Dashboard key={user.id} isAdmin={isAdmin} signOut={signOut} />}
    </AuthGate>
  )
}
