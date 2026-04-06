"use client"

export const dynamic = "force-dynamic"

import { useEffect, useMemo, useState } from "react"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import AuthGate from "./components/AuthGate"
import DashboardShell from "./components/DashboardShell"
import { buildSessionFromTemplate } from "./lib/sessionBuilder"
import { supabase } from "./lib/supabase"
import {
  TEAM,
  cardStyle,
  initialPlayers,
  initialTrainingTemplates,
  makeId,
  type AttendanceStatus,
  type Coach,
  type CoachAvailability,
  type CoachAvailabilityStatus,
  type EventAttendance,
  type EventItem,
  type LeagueResult,
  type MainTab,
  type MatchEventDraft,
  type MatchFormat,
  type MatchReport,
  type MatchTab,
  type Player,
  type PlayerMatchRating,
  type QuarterPlan,
  type SavedLineup,
  type TimelineItem,
  type TrainingSession,
  type TrainingSessionRecord,
  type TrainingTemplate,
} from "./lib/types"
import {
  buildAutoLineup,
  buildPitchSlots,
  canPlaySlot,
  generateQuarterPlans,
} from "./lib/rotation"

type PeriodMode = "quarters" | "halves"

type EventWithPlan = EventItem & {
  trainingPlanId?: string
  trainingPlanName?: string
}

type DbTrainingPlanRow = {
  id: string
  name: string
  warm_up: string | null
  drill_1: string | null
  drill_2: string | null
  game: string | null
  notes: string | null
}

function formatFullDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function statusStyle(status: AttendanceStatus) {
  if (status === "available") {
    return {
      border: "1px solid #16a34a",
      background: "#dcfce7",
      color: "#166534",
    }
  }

  if (status === "maybe") {
    return {
      border: "1px solid #d97706",
      background: "#fef3c7",
      color: "#92400e",
    }
  }

  return {
    border: "1px solid #dc2626",
    background: "#fee2e2",
    color: "#991b1b",
  }
}

function normalizeTeamName(name: string) {
  const value = name.trim()

  const map: Record<string, string> = {
    "U10 Lionesses 25/26": "Leonard Stanley U10 Lioness",
    "U10 Lionesses": "Leonard Stanley U10 Lioness",
    "Sharks Lioness": "Leonard Stanley U10 Lioness",
    "Sharks Lionesses": "Leonard Stanley U10 Lioness",
    "Leonard Stanley U10 Lioness 25/26": "Leonard Stanley U10 Lioness",

    "Tewkesbury Town Colts Youth U10": "Tewkesbury Town Colts",
    "Tewkesbury Town Colts Youth": "Tewkesbury Town Colts",
    "Tewkesbury Town Colts Youth U10 ": "Tewkesbury Town Colts",

    "Stonehouse TownYouth U10": "Stonehouse Town",
    "Stonehouse Town Youth U10": "Stonehouse Town",
    "Stonehouse Town Youth": "Stonehouse Town",

    "Rodborough Youth U10 Lioness": "Rodborough Lionesses",
    "Rodborough Youth U10 Lionesses": "Rodborough Lionesses",
  }

  return map[value] || value
}

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
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [coachAvailability, setCoachAvailability] = useState<CoachAvailability[]>([])
  const [events, setEvents] = useState<EventWithPlan[]>([])
  const [attendance, setAttendance] = useState<EventAttendance[]>([])
  const [leagueResults, setLeagueResults] = useState<LeagueResult[]>([])
  const [playerRatings, setPlayerRatings] = useState<PlayerMatchRating[]>([])
  const [matchReports, setMatchReports] = useState<MatchReport[]>([])

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])

  const [showEventForm, setShowEventForm] = useState(false)
  const [editingCalendarEventId, setEditingCalendarEventId] = useState<string | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [activeMatchEventId, setActiveMatchEventId] = useState<string | null>(null)

  const [eventTitle, setEventTitle] = useState("")
  const [eventType, setEventType] = useState<"training" | "match" | "other">("training")
  const [eventStartTime, setEventStartTime] = useState("")
  const [eventLocation, setEventLocation] = useState("")
  const [eventOpponent, setEventOpponent] = useState("")
  const [eventNotes, setEventNotes] = useState("")
  const [selectedDbTrainingPlanId, setSelectedDbTrainingPlanId] = useState("")

  const [homeTeam, setHomeTeamState] = useState(TEAM.name)
  const [awayTeam, setAwayTeamState] = useState("Opposition")
  const [homeScore, setHomeScoreState] = useState(0)
  const [awayScore, setAwayScoreState] = useState(0)

  const [matchFormat, setMatchFormat] = useState<MatchFormat>("7v7")
  const [formation, setFormation] = useState("2-3-1")
  const [currentQuarter, setCurrentQuarterState] = useState(1)

  const [periodMode, setPeriodModeState] = useState<PeriodMode>("quarters")
  const [periodLength, setPeriodLengthState] = useState(10)

  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [liveSecondsMap, setLiveSecondsMap] = useState<Record<string, number>>({})

  const [lineupMap, setLineupMap] = useState<Record<string, string | null>>({})
  const [benchIds, setBenchIds] = useState<string[]>([])
  const [savedLineups, setSavedLineups] = useState<SavedLineup[]>([])
  const [lineupName, setLineupName] = useState("")

  const [timeline, setTimeline] = useState<TimelineItem[]>([])
  const [editingTimelineId, setEditingTimelineId] = useState<string | null>(null)
  const [showMatchEventModal, setShowMatchEventModal] = useState(false)
  const [eventDraft, setEventDraft] = useState<MatchEventDraft>({
    type: "goal",
    playerId: "",
    secondPlayerId: "",
    note: "",
  })

  const [quarterPlans, setQuarterPlans] = useState<Record<number, QuarterPlan>>({})
  const [quarterWarnings, setQuarterWarnings] = useState<string[]>([])
  const [activeDragPlayerId, setActiveDragPlayerId] = useState<string | null>(null)

  const [dbTrainingPlans, setDbTrainingPlans] = useState<TrainingTemplate[]>([])
  const allTrainingPlans = dbTrainingPlans.length > 0 ? dbTrainingPlans : initialTrainingTemplates

  const [selectedTemplateId, setSelectedTemplateId] = useState(initialTrainingTemplates[0].id)
  const [trainingPlan, setTrainingPlan] = useState({
    title: initialTrainingTemplates[0].name,
    warmUp: initialTrainingTemplates[0].warmUp,
    drill1: initialTrainingTemplates[0].drill1,
    drill2: initialTrainingTemplates[0].drill2,
    game: initialTrainingTemplates[0].game,
    notes: initialTrainingTemplates[0].notes,
  })

  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null)
  const [sessionHistory, setSessionHistory] = useState<TrainingSessionRecord[]>([])
  const [loading, setLoading] = useState(true)

  const currentSlots = useMemo(() => buildPitchSlots(matchFormat, formation), [matchFormat, formation])

  const selectedDateEvents = useMemo(
    () =>
      events
        .filter((e) => e.date === selectedDate)
        .slice()
        .sort((a, b) => {
          const dateCompare = a.date.localeCompare(b.date)
          if (dateCompare !== 0) return dateCompare
          const timeCompare = (a.startTime || "").localeCompare(b.startTime || "")
          if (timeCompare !== 0) return timeCompare
          return a.title.localeCompare(b.title)
        }),
    [events, selectedDate]
  )

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null
  const activeMatchEvent = events.find((e) => e.id === activeMatchEventId) || null

  function countAttendance(eventId: string, status: AttendanceStatus) {
    return attendance.filter((a) => a.eventId === eventId && a.status === status).length
  }

  function getPlayerStatus(eventId: string, playerId: string): AttendanceStatus | null {
    return attendance.find((a) => a.eventId === eventId && a.playerId === playerId)?.status || null
  }

  function getCoachStatusForDay(coachId: string, day: string): CoachAvailabilityStatus {
    return (
      coachAvailability.find((item) => item.coachId === coachId && item.day === day)?.status ||
      "available"
    )
  }

  function loadTrainingPlanFromEvent(event: EventWithPlan) {
    if (!event.trainingPlanId) return
    const plan = allTrainingPlans.find((item) => item.id === event.trainingPlanId)
    if (!plan) return

    setSelectedTemplateId(plan.id)
    setTrainingPlan({
      title: plan.name,
      warmUp: plan.warmUp,
      drill1: plan.drill1,
      drill2: plan.drill2,
      game: plan.game,
      notes: plan.notes,
    })
    setSelectedDbTrainingPlanId(plan.id)
  }

  const activeMatchAvailableIds = activeMatchEvent
    ? attendance
        .filter((a) => a.eventId === activeMatchEvent.id && a.status === "available")
        .map((a) => a.playerId)
    : []

  const activeMatchMaybeIds = activeMatchEvent
    ? attendance
        .filter((a) => a.eventId === activeMatchEvent.id && a.status === "maybe")
        .map((a) => a.playerId)
    : []

  const matchPlayers =
    activeMatchEvent && activeMatchAvailableIds.length > 0
      ? players.filter((p) => activeMatchAvailableIds.includes(p.id))
      : players

  const maybePlayers =
    activeMatchEvent && activeMatchMaybeIds.length > 0
      ? players.filter((p) => activeMatchMaybeIds.includes(p.id))
      : []

  const unavailablePlayers =
    activeMatchEvent
      ? players.filter((p) => {
          const status = attendance.find(
            (a) => a.eventId === activeMatchEvent.id && a.playerId === p.id
          )?.status
          return status === "unavailable"
        })
      : []

  const noAvailableKeeper =
    activeMatchEvent && matchPlayers.length > 0
      ? !matchPlayers.some((p) => p.mainGK || p.backupGK || p.positions.includes("GK"))
      : false

  const selectedDateCoachAvailability = coachAvailability.filter((item) => item.day === selectedDate)

  const matchDateForCoachView = activeMatchEvent?.date || selectedDate
  const activeCoaches = coaches.filter((coach) => coach.active)

  const availableCoaches = activeCoaches.filter(
    (coach) => getCoachStatusForDay(coach.id, matchDateForCoachView) === "available"
  )

  const unavailableCoachesList = activeCoaches.filter(
    (coach) => getCoachStatusForDay(coach.id, matchDateForCoachView) === "unavailable"
  )

  const holidayCoachesList = activeCoaches.filter(
    (coach) => getCoachStatusForDay(coach.id, matchDateForCoachView) === "holiday"
  )

  const headCoachAvailable = availableCoaches.some((coach) =>
    coach.role.toLowerCase().includes("head coach")
  )

  const noAvailableCoaches = availableCoaches.length === 0

  const playerOfMatchMap = useMemo(() => {
    const byEvent: Record<string, PlayerMatchRating[]> = {}

    for (const rating of playerRatings) {
      if (!byEvent[rating.eventId]) byEvent[rating.eventId] = []
      byEvent[rating.eventId].push(rating)
    }

    const winners: Record<string, string> = {}

    for (const eventId of Object.keys(byEvent)) {
      const sorted = byEvent[eventId].slice().sort((a, b) => b.rating - a.rating)
      if (sorted.length > 0) {
        winners[eventId] = sorted[0].playerId
      }
    }

    return winners
  }, [playerRatings])

  const activeMatchRatings = useMemo(() => {
    if (!activeMatchEventId) return []
    return playerRatings
      .filter((item) => item.eventId === activeMatchEventId)
      .slice()
      .sort((a, b) => b.rating - a.rating)
  }, [playerRatings, activeMatchEventId])

  const activeTopPerformers = useMemo(() => {
    return activeMatchRatings
      .slice(0, 3)
      .map((item) => players.find((p) => p.id === item.playerId)?.name || "Unknown")
  }, [activeMatchRatings, players])

  const activeGoalsSummary = useMemo(() => {
    return timeline
      .filter((item) => item.type === "goal")
      .map((item) => `${item.minute}' - ${item.text}`)
  }, [timeline])

  const latestActiveMatchReport = useMemo(() => {
    if (!activeMatchEventId) return null
    return matchReports.find((item) => item.eventId === activeMatchEventId) || null
  }, [matchReports, activeMatchEventId])

  async function loadLeagueResults() {
    if (!supabase) return

    const { data, error } = await supabase
      .from("league_results")
      .select("*")
      .order("played_on", { ascending: false })

    if (error) {
      console.error("Failed to load league results", error)
      return
    }

    setLeagueResults(
      (data || []).map((row: any) => ({
        id: row.id,
        playedOn: row.played_on,
        eventId: row.event_id || null,
        opponent: row.opponent || "",
        homeTeam: normalizeTeamName(row.home_team),
        awayTeam: normalizeTeamName(row.away_team),
        homeScore: row.home_score,
        awayScore: row.away_score,
        competition: row.competition || "",
      }))
    )
  }

  async function loadAll() {
    setLoading(true)

    if (!supabase) {
      console.error("Supabase env vars are missing")
      setPlayers(initialPlayers)
      setLoading(false)
      return
    }

    const [
      playersRes,
      settingsRes,
      eventsRes,
      attendanceRes,
      coachesRes,
      coachAvailabilityRes,
      trainingPlansRes,
      sessionHistoryRes,
      ratingsRes,
      reportsRes,
    ] = await Promise.all([
      supabase.from("players").select("*").order("sort_order", { ascending: true }),
      supabase.from("app_settings").select("*").eq("id", "main").maybeSingle(),
      supabase.from("events").select("*").order("date", { ascending: true }),
      supabase.from("event_attendance").select("*").order("updated_at", { ascending: false }),
      supabase.from("coaches").select("*").order("name", { ascending: true }),
      supabase.from("coach_availability").select("*").order("day", { ascending: true }),
      supabase.from("training_plans").select("*").order("created_at", { ascending: false }),
      supabase.from("training_session_history").select("*").order("created_at", { ascending: false }),
      supabase.from("player_match_ratings").select("*").order("created_at", { ascending: false }),
      supabase.from("match_reports").select("*").order("created_at", { ascending: false }),
    ])

    if (!playersRes.error && playersRes.data && playersRes.data.length > 0) {
      setPlayers(
        playersRes.data.map((row: any) => ({
          id: row.id,
          name: row.name,
          positions: JSON.parse(row.positions_json || "[]"),
          mainGK: !!row.main_gk,
          backupGK: !!row.backup_gk,
          captain: !!row.captain,
          viceCaptain: !!row.vice_captain,
          seasonSeconds: row.season_seconds || 0,
        }))
      )
    } else {
      setPlayers(initialPlayers)
    }

    if (!settingsRes.error && settingsRes.data) {
      setSelectedDate(settingsRes.data.selected_date || new Date().toISOString().split("T")[0])
      setActiveMatchEventId(settingsRes.data.active_match_event_id || null)
    }

    if (!eventsRes.error && eventsRes.data) {
      setEvents(
        eventsRes.data.map((row: any) => ({
          id: row.id,
          date: row.date,
          title: row.title,
          type: row.type,
          startTime: row.start_time || "",
          location: row.location || "",
          opponent: row.opponent || "",
          notes: row.notes || "",
          trainingPlanId: row.training_plan_id || "",
          trainingPlanName: row.training_plan_name || "",
        }))
      )
    }

    if (!attendanceRes.error && attendanceRes.data) {
      setAttendance(
        attendanceRes.data.map((row: any) => ({
          id: row.id,
          eventId: row.event_id,
          playerId: row.player_id,
          status: row.status,
        }))
      )
    }

    if (!coachesRes.error && coachesRes.data) {
      setCoaches(
        coachesRes.data.map((row: any) => ({
          id: row.id,
          name: row.name,
          role: row.role || "",
          active: row.active ?? true,
        }))
      )
    }

    if (!coachAvailabilityRes.error && coachAvailabilityRes.data) {
      setCoachAvailability(
        coachAvailabilityRes.data.map((row: any) => ({
          id: row.id,
          coachId: row.coach_id,
          day: row.day,
          status: row.status as CoachAvailabilityStatus,
          notes: row.notes || "",
        }))
      )
    }

    if (!trainingPlansRes.error && trainingPlansRes.data) {
      const nextPlans = (trainingPlansRes.data as DbTrainingPlanRow[]).map((row) => ({
        id: row.id,
        name: row.name,
        warmUp: row.warm_up || "",
        drill1: row.drill_1 || "",
        drill2: row.drill_2 || "",
        game: row.game || "",
        notes: row.notes || "",
      }))

      setDbTrainingPlans(nextPlans)

      if (nextPlans.length > 0) {
        setSelectedTemplateId(nextPlans[0].id)
        setTrainingPlan({
          title: nextPlans[0].name,
          warmUp: nextPlans[0].warmUp,
          drill1: nextPlans[0].drill1,
          drill2: nextPlans[0].drill2,
          game: nextPlans[0].game,
          notes: nextPlans[0].notes,
        })
      }
    }

    if (!sessionHistoryRes.error && sessionHistoryRes.data) {
      setSessionHistory(
        sessionHistoryRes.data.map((row: any) => ({
          id: row.id,
          date: row.session_date,
          planName: row.plan_name,
          notes: row.notes || "",
          blocks: JSON.parse(row.blocks_json || "[]"),
        }))
      )
    }

    if (!ratingsRes.error && ratingsRes.data) {
      setPlayerRatings(
        ratingsRes.data.map((row: any) => ({
          id: row.id,
          eventId: row.event_id,
          playerId: row.player_id,
          rating: Number(row.rating || 0),
          notes: row.notes || "",
        }))
      )
    }

    if (!reportsRes.error && reportsRes.data) {
      setMatchReports(
        reportsRes.data.map((row: any) => ({
          id: row.id,
          eventId: row.event_id,
          title: row.title,
          matchDate: row.match_date,
          opponent: row.opponent,
          scoreLine: row.score_line,
          playerOfTheMatch: row.player_of_the_match,
          topPerformers: JSON.parse(row.top_performers_json || "[]"),
          goalsSummary: JSON.parse(row.goals_summary_json || "[]"),
          coachNotes: row.coach_notes || "",
          reportText: row.report_text,
          createdAt: row.created_at || "",
        }))
      )
    }

    setLoading(false)
  }

  async function loadMatchState(eventId: string | null) {
    if (!supabase || !eventId) {
      setHomeTeamState(TEAM.name)
      setAwayTeamState("Opposition")
      setHomeScoreState(0)
      setAwayScoreState(0)
      setMatchFormat("7v7")
      setFormation("2-3-1")
      setCurrentQuarterState(1)
      setPeriodModeState("quarters")
      setPeriodLengthState(10)
      setSeconds(0)
      setRunning(false)
      setLiveSecondsMap({})
      setLineupMap({})
      setBenchIds([])
      setTimeline([])
      setSavedLineups([])
      setQuarterPlans({})
      return
    }

    const [stateRes, timelineRes, lineupsRes, quarterRes] = await Promise.all([
      supabase.from("match_state").select("*").eq("event_id", eventId).maybeSingle(),
      supabase
        .from("match_timeline_events")
        .select("*")
        .eq("event_id", eventId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("match_lineups")
        .select("*")
        .eq("event_id", eventId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("match_quarter_plans")
        .select("*")
        .eq("event_id", eventId)
        .order("quarter_number", { ascending: true }),
    ])

    if (!stateRes.error && stateRes.data) {
      setHomeTeamState(stateRes.data.home_team || TEAM.name)
      setAwayTeamState(stateRes.data.away_team || "Opposition")
      setHomeScoreState(stateRes.data.home_score || 0)
      setAwayScoreState(stateRes.data.away_score || 0)
      setMatchFormat((stateRes.data.match_format as MatchFormat) || "7v7")
      setFormation(stateRes.data.formation || "2-3-1")
      setCurrentQuarterState(stateRes.data.current_period || 1)
      setPeriodModeState((stateRes.data.period_mode as PeriodMode) || "quarters")
      setPeriodLengthState(stateRes.data.period_length || 10)
      setSeconds(stateRes.data.seconds || 0)
      setRunning(!!stateRes.data.running)
      setLiveSecondsMap(JSON.parse(stateRes.data.live_seconds_json || "{}"))
      setLineupMap(JSON.parse(stateRes.data.lineup_json || "{}"))
      setBenchIds(JSON.parse(stateRes.data.bench_json || "[]"))
    } else {
      const defaultFormat: MatchFormat = "7v7"
      const defaultFormation = "2-3-1"
      const defaultSlots = buildPitchSlots(defaultFormat, defaultFormation)
      const auto = buildAutoLineup(matchPlayers.length > 0 ? matchPlayers : players, defaultSlots)

      setHomeTeamState(TEAM.name)
      setAwayTeamState(activeMatchEvent?.opponent || "Opposition")
      setHomeScoreState(0)
      setAwayScoreState(0)
      setMatchFormat(defaultFormat)
      setFormation(defaultFormation)
      setCurrentQuarterState(1)
      setPeriodModeState("quarters")
      setPeriodLengthState(10)
      setSeconds(0)
      setRunning(false)
      setLiveSecondsMap({})
      setLineupMap(auto.lineup)
      setBenchIds(auto.bench)
    }

    if (!timelineRes.error && timelineRes.data) {
      setTimeline(
        timelineRes.data.map((row: any) => ({
          id: row.id,
          minute: row.minute,
          type: row.type,
          text: row.text,
          sortOrder: row.sort_order || 0,
        }))
      )
    } else {
      setTimeline([])
    }

    if (!lineupsRes.error && lineupsRes.data) {
      setSavedLineups(
        lineupsRes.data.map((row: any) => ({
          id: row.id,
          name: row.name,
          format: row.match_format,
          formation: row.formation,
          lineup: JSON.parse(row.lineup_json || "{}"),
          bench: JSON.parse(row.bench_json || "[]"),
        }))
      )
    } else {
      setSavedLineups([])
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
    } else {
      setQuarterPlans({})
    }
  }

  useEffect(() => {
    void loadAll()
    void loadLeagueResults()
  }, [])

  useEffect(() => {
    if (!loading) {
      void loadMatchState(activeMatchEventId)
    }
  }, [activeMatchEventId, loading])

  useEffect(() => {
    if (!running || !activeMatchEventId) return

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
  }, [running, lineupMap, activeMatchEventId])

  async function persistSettings(
    patch?: Partial<{
      selectedDate: string
      activeMatchEventId: string | null
    }>
  ) {
    if (!supabase) return

    const next = {
      selectedDate: patch?.selectedDate ?? selectedDate,
      activeMatchEventId: patch?.activeMatchEventId ?? activeMatchEventId,
    }

    await supabase.from("app_settings").upsert({
      id: "main",
      selected_date: next.selectedDate,
      active_match_event_id: next.activeMatchEventId,
    })
  }

  async function persistMatchState(
    patch?: Partial<{
      homeTeam: string
      awayTeam: string
      homeScore: number
      awayScore: number
      matchFormat: MatchFormat
      formation: string
      currentPeriod: number
      periodMode: PeriodMode
      periodLength: number
      seconds: number
      running: boolean
      liveSecondsMap: Record<string, number>
      lineupMap: Record<string, string | null>
      benchIds: string[]
    }>
  ) {
    if (!supabase || !activeMatchEventId) return

    const next = {
      homeTeam: patch?.homeTeam ?? homeTeam,
      awayTeam: patch?.awayTeam ?? awayTeam,
      homeScore: patch?.homeScore ?? homeScore,
      awayScore: patch?.awayScore ?? awayScore,
      matchFormat: patch?.matchFormat ?? matchFormat,
      formation: patch?.formation ?? formation,
      currentPeriod: patch?.currentPeriod ?? currentQuarter,
      periodMode: patch?.periodMode ?? periodMode,
      periodLength: patch?.periodLength ?? periodLength,
      seconds: patch?.seconds ?? seconds,
      running: patch?.running ?? running,
      liveSecondsMap: patch?.liveSecondsMap ?? liveSecondsMap,
      lineupMap: patch?.lineupMap ?? lineupMap,
      benchIds: patch?.benchIds ?? benchIds,
    }

    await supabase.from("match_state").upsert({
      event_id: activeMatchEventId,
      home_team: next.homeTeam,
      away_team: next.awayTeam,
      home_score: next.homeScore,
      away_score: next.awayScore,
      match_format: next.matchFormat,
      formation: next.formation,
      current_period: next.currentPeriod,
      period_mode: next.periodMode,
      period_length: next.periodLength,
      seconds: next.seconds,
      running: next.running,
      live_seconds_json: JSON.stringify(next.liveSecondsMap),
      lineup_json: JSON.stringify(next.lineupMap),
      bench_json: JSON.stringify(next.benchIds),
      updated_at: new Date().toISOString(),
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
  }

  async function saveCoaches(nextCoaches: Coach[]) {
    if (!supabase) return

    const removedIds = coaches
      .filter((coach) => !nextCoaches.some((n) => n.id === coach.id))
      .map((coach) => coach.id)

    if (removedIds.length > 0) {
      await supabase.from("coaches").delete().in("id", removedIds)
    }

    if (nextCoaches.length > 0) {
      const { error } = await supabase.from("coaches").upsert(
        nextCoaches.map((coach) => ({
          id: coach.id,
          name: coach.name,
          role: coach.role,
          active: coach.active,
        }))
      )

      if (error) {
        alert(error.message)
        return
      }
    }

    setCoaches(nextCoaches)
  }

  async function saveCoachAvailability(
    coachId: string,
    day: string,
    status: CoachAvailabilityStatus,
    notes = ""
  ) {
    if (!supabase || !isAdmin) return

    const existing = coachAvailability.find((item) => item.coachId === coachId && item.day === day)

    if (existing) {
      const { error } = await supabase
        .from("coach_availability")
        .update({ status, notes })
        .eq("id", existing.id)

      if (error) {
        alert(error.message)
        return
      }

      setCoachAvailability((prev) =>
        prev.map((item) => (item.id === existing.id ? { ...item, status, notes } : item))
      )
      return
    }

    const id = crypto.randomUUID?.() || makeId()

    const { error } = await supabase.from("coach_availability").insert({
      id,
      coach_id: coachId,
      day,
      status,
      notes,
    })

    if (error) {
      alert(error.message)
      return
    }

    setCoachAvailability((prev) => [...prev, { id, coachId, day, status, notes }])
  }

  async function saveTrainingPlans(nextPlans: TrainingTemplate[]) {
    if (!supabase) return

    const currentIds = allTrainingPlans.map((plan) => plan.id)
    const nextIds = nextPlans.map((plan) => plan.id)

    const removedIds = currentIds.filter((id) => !nextIds.includes(id))
    if (removedIds.length > 0) {
      await supabase.from("training_plans").delete().in("id", removedIds)
    }

    if (nextPlans.length > 0) {
      const { error } = await supabase.from("training_plans").upsert(
        nextPlans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          warm_up: plan.warmUp,
          drill_1: plan.drill1,
          drill_2: plan.drill2,
          game: plan.game,
          notes: plan.notes,
        }))
      )

      if (error) {
        alert(error.message)
        return
      }
    }

    setDbTrainingPlans(nextPlans)

    const selected = nextPlans.find((plan) => plan.id === selectedTemplateId) || nextPlans[0]
    if (selected) {
      setSelectedTemplateId(selected.id)
      setTrainingPlan({
        title: selected.name,
        warmUp: selected.warmUp,
        drill1: selected.drill1,
        drill2: selected.drill2,
        game: selected.game,
        notes: selected.notes,
      })
    }
  }

  async function saveSessionRecord(record: TrainingSessionRecord) {
    if (!supabase) return

    const { error } = await supabase.from("training_session_history").insert({
      id: record.id,
      session_date: record.date,
      plan_name: record.planName,
      notes: record.notes,
      blocks_json: JSON.stringify(record.blocks),
    })

    if (error) {
      alert(error.message)
      return
    }

    setSessionHistory((prev) => [record, ...prev])
  }

  async function savePlayerRating(playerId: string, rating: number, notes: string) {
    if (!supabase || !activeMatchEventId || !isAdmin) return

    const existing = playerRatings.find(
      (item) => item.eventId === activeMatchEventId && item.playerId === playerId
    )

    const nextId = existing?.id || crypto.randomUUID?.() || makeId()

    const payload = {
      id: nextId,
      event_id: activeMatchEventId,
      player_id: playerId,
      rating,
      notes,
    }

    const { error } = await supabase.from("player_match_ratings").upsert(payload)

    if (error) {
      alert(error.message)
      return
    }

    setPlayerRatings((prev) => {
      const filtered = prev.filter(
        (item) => !(item.eventId === activeMatchEventId && item.playerId === playerId)
      )

      return [
        {
          id: nextId,
          eventId: activeMatchEventId,
          playerId,
          rating,
          notes,
        },
        ...filtered,
      ]
    })
  }

  async function saveLineups(nextLineups: SavedLineup[]) {
    if (!supabase || !activeMatchEventId) return

    await supabase.from("match_lineups").delete().eq("event_id", activeMatchEventId)

    if (nextLineups.length > 0) {
      await supabase.from("match_lineups").insert(
        nextLineups.map((lineup) => ({
          id: lineup.id,
          event_id: activeMatchEventId,
          name: lineup.name,
          match_format: lineup.format,
          formation: lineup.formation,
          lineup_json: JSON.stringify(lineup.lineup),
          bench_json: JSON.stringify(lineup.bench),
          updated_at: new Date().toISOString(),
        }))
      )
    }

    setSavedLineups(nextLineups)
  }

  async function saveQuarterPlans(nextPlans: Record<number, QuarterPlan>) {
    if (!supabase || !activeMatchEventId) return

    await supabase.from("match_quarter_plans").delete().eq("event_id", activeMatchEventId)

    const entries = Object.entries(nextPlans)
    if (entries.length > 0) {
      await supabase.from("match_quarter_plans").insert(
        entries.map(([quarterNumber, plan]) => ({
          event_id: activeMatchEventId,
          quarter_number: Number(quarterNumber),
          lineup_json: JSON.stringify(plan.lineup),
          bench_json: JSON.stringify(plan.bench),
        }))
      )
    }

    setQuarterPlans(nextPlans)
  }

  async function saveTimeline(nextTimeline: TimelineItem[]) {
    if (!supabase || !activeMatchEventId) return

    await supabase.from("match_timeline_events").delete().eq("event_id", activeMatchEventId)

    if (nextTimeline.length > 0) {
      await supabase.from("match_timeline_events").insert(
        nextTimeline.map((item, index) => ({
          id: item.id,
          event_id: activeMatchEventId,
          minute: item.minute,
          type: item.type,
          text: item.text,
          sort_order: index,
        }))
      )
    }

    setTimeline(nextTimeline)
  }

  async function saveAttendance(eventId: string, playerId: string, status: AttendanceStatus) {
    if (!supabase) return

    const { data: existingRow, error: fetchError } = await supabase
      .from("event_attendance")
      .select("id, event_id, player_id, status")
      .eq("event_id", eventId)
      .eq("player_id", playerId)
      .maybeSingle()

    if (fetchError) {
      alert(fetchError.message)
      return
    }

    if (existingRow) {
      const { error: updateError } = await supabase
        .from("event_attendance")
        .update({ status })
        .eq("id", existingRow.id)

      if (updateError) {
        alert(updateError.message)
        return
      }

      setAttendance((prev) =>
        prev.map((item) => (item.id === existingRow.id ? { ...item, status } : item))
      )
      return
    }

    const newId = crypto.randomUUID?.() || makeId()

    const { error: insertError } = await supabase.from("event_attendance").insert({
      id: newId,
      event_id: eventId,
      player_id: playerId,
      status,
    })

    if (insertError) {
      alert(insertError.message)
      return
    }

    setAttendance((prev) => [...prev, { id: newId, eventId, playerId, status }])
  }

  async function addEvent() {
    if (!supabase || !isAdmin) return
    if (!eventTitle.trim()) {
      alert("Enter event title")
      return
    }

    const safeTime = eventStartTime.trim() || "00:00"
    const newId = editingCalendarEventId || (crypto.randomUUID?.() || makeId())
    const linkedPlan = allTrainingPlans.find((plan) => plan.id === selectedDbTrainingPlanId) || null

    const newEvent: EventWithPlan = {
      id: newId,
      date: selectedDate,
      title: eventTitle.trim(),
      type: eventType,
      startTime: safeTime,
      location: eventLocation.trim(),
      opponent: eventOpponent.trim(),
      notes: eventNotes.trim(),
      trainingPlanId: linkedPlan?.id || "",
      trainingPlanName: linkedPlan?.name || "",
    }

    const { error } = await supabase.from("events").upsert({
      id: newEvent.id,
      date: newEvent.date,
      day: newEvent.date,
      title: newEvent.title,
      type: newEvent.type,
      start_time: safeTime,
      location: newEvent.location || "",
      opponent: newEvent.opponent || "",
      notes: newEvent.notes || "",
      training_plan_id: linkedPlan?.id || null,
      training_plan_name: linkedPlan?.name || "",
    })

    if (error) {
      alert(error.message)
      return
    }

    setEvents((prev) => {
      const withoutOld = prev.filter((e) => e.id !== newEvent.id)
      return [...withoutOld, newEvent].sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date)
        if (dateCompare !== 0) return dateCompare
        const timeCompare = (a.startTime || "").localeCompare(b.startTime || "")
        if (timeCompare !== 0) return timeCompare
        return a.title.localeCompare(b.title)
      })
    })

    setEventTitle("")
    setEventType("training")
    setEventStartTime("")
    setEventLocation("")
    setEventOpponent("")
    setEventNotes("")
    setSelectedDbTrainingPlanId("")
    setEditingCalendarEventId(null)
    setShowEventForm(false)
  }

  function openAddCalendarEvent() {
    if (!isAdmin) return
    setEditingCalendarEventId(null)
    setEventTitle("")
    setEventType("training")
    setEventStartTime("")
    setEventLocation("")
    setEventOpponent("")
    setEventNotes("")
    setSelectedDbTrainingPlanId("")
    setShowEventForm(true)
  }

  function openEditCalendarEvent(event: EventWithPlan) {
    if (!isAdmin) return
    setEditingCalendarEventId(event.id)
    setEventTitle(event.title)
    setEventType(event.type as "training" | "match" | "other")
    setEventStartTime(event.startTime || "")
    setEventLocation(event.location || "")
    setEventOpponent(event.opponent || "")
    setEventNotes(event.notes || "")
    setSelectedDbTrainingPlanId(event.trainingPlanId || "")
    setSelectedDate(event.date)
    setShowEventForm(true)
  }

  async function deleteCalendarEvent(id: string) {
    if (!supabase || !isAdmin) return

    const { error } = await supabase.from("events").delete().eq("id", id)
    if (error) {
      alert(error.message)
      return
    }

    setEvents((prev) => prev.filter((event) => event.id !== id))
    setAttendance((prev) => prev.filter((item) => item.eventId !== id))
    if (selectedEventId === id) setSelectedEventId(null)

    if (activeMatchEventId === id) {
      setActiveMatchEventId(null)
      void persistSettings({ activeMatchEventId: null })
    }
  }

  async function handleChangeFormation(nextFormat: MatchFormat, nextFormation: string) {
    const nextSlots = buildPitchSlots(nextFormat, nextFormation)
    const auto = buildAutoLineup(matchPlayers, nextSlots)

    setMatchFormat(nextFormat)
    setFormation(nextFormation)
    setLineupMap(auto.lineup)
    setBenchIds(auto.bench)

    await persistMatchState({
      matchFormat: nextFormat,
      formation: nextFormation,
      lineupMap: auto.lineup,
      benchIds: auto.bench,
    })
  }

  async function handleSaveLineup() {
    if (!lineupName.trim()) {
      alert("Enter a lineup name")
      return
    }

    const nextLineups = [
      {
        id: crypto.randomUUID?.() || makeId(),
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

    await persistMatchState({
      matchFormat: preset.format,
      formation: preset.formation,
      lineupMap: preset.lineup,
      benchIds: preset.bench,
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

    const player = matchPlayers.find((p) => p.id === playerId)
    if (!player) return

    if (overId === "bench") {
      if (fromId === "bench") return
      const nextLineup = { ...lineupMap, [fromId]: null }
      const nextBench = benchIds.includes(playerId) ? benchIds : [...benchIds, playerId]
      setLineupMap(nextLineup)
      setBenchIds(nextBench)
      void persistMatchState({ lineupMap: nextLineup, benchIds: nextBench })
      return
    }

    const targetSlot = currentSlots.find((slot) => slot.id === overId)
    if (!targetSlot) return
    if (!canPlaySlot(player, targetSlot.position)) return

    const targetPlayerId = lineupMap[overId]

    if (fromId === "bench") {
      const nextBench = benchIds.filter((id) => id !== playerId)
      const extraBench =
        targetPlayerId && targetPlayerId !== playerId ? [...nextBench, targetPlayerId] : nextBench
      const nextLineup = { ...lineupMap, [overId]: playerId }

      setBenchIds(extraBench)
      setLineupMap(nextLineup)
      void persistMatchState({ lineupMap: nextLineup, benchIds: extraBench })
      return
    }

    if (fromId.startsWith("slot-")) {
      const nextLineup = { ...lineupMap }
      nextLineup[fromId] = targetPlayerId || null
      nextLineup[overId] = playerId
      setLineupMap(nextLineup)
      void persistMatchState({ lineupMap: nextLineup })
    }
  }

  function openCreateEvent() {
    if (!isAdmin) return
    setEditingTimelineId(null)
    setEventDraft({
      type: "goal",
      playerId: "",
      secondPlayerId: "",
      note: "",
    })
    setShowMatchEventModal(true)
  }

  function openEditEvent(item: TimelineItem) {
    if (!isAdmin) return
    setEditingTimelineId(item.id)
    setEventDraft({
      type: item.type,
      playerId: "",
      secondPlayerId: "",
      note: item.text,
    })
    setShowMatchEventModal(true)
  }

  async function handleDeleteTimelineItem(id: string) {
    if (!isAdmin) return
    await saveTimeline(timeline.filter((item) => item.id !== id))
  }

  async function saveMatchEvent() {
    if (!isAdmin) return

    const player = matchPlayers.find((p) => p.id === eventDraft.playerId)
    const secondPlayer = matchPlayers.find((p) => p.id === eventDraft.secondPlayerId)

    let text = ""

    if (eventDraft.type === "goal") {
      if (!player) return alert("Choose a scorer")
      const nextScore = homeScore + 1
      setHomeScoreState(nextScore)
      await persistMatchState({ homeScore: nextScore })
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
            id: crypto.randomUUID?.() || makeId(),
            minute: Math.floor(seconds / 60),
            type: eventDraft.type,
            text,
            sortOrder: timeline.length,
          },
        ]

    await saveTimeline(nextTimeline)
    setShowMatchEventModal(false)
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
      const shortLabel = periodMode === "quarters" ? "Q" : "H"
      alert(`No saved plan for ${shortLabel}${quarter}`)
      return
    }

    setCurrentQuarterState(quarter)
    setLineupMap(plan.lineup)
    setBenchIds(plan.bench)
    void persistMatchState({
      currentPeriod: quarter,
      lineupMap: plan.lineup,
      benchIds: plan.bench,
    })
  }

  async function handleAutoGenerate() {
    const { plans, warnings } = generateQuarterPlans(matchPlayers, currentSlots)
    await saveQuarterPlans(plans)
    setQuarterWarnings(warnings)
    setCurrentQuarterState(1)
    setLineupMap(plans[1].lineup)
    setBenchIds(plans[1].bench)
    await persistMatchState({
      currentPeriod: 1,
      lineupMap: plans[1].lineup,
      benchIds: plans[1].bench,
    })
  }

  async function handleSaveMinutes() {
    const nextPlayers = players.map((player) => ({
      ...player,
      seasonSeconds: player.seasonSeconds + (liveSecondsMap[player.id] || 0),
    }))
    setLiveSecondsMap({})
    await savePlayers(nextPlayers)
    await persistMatchState({ liveSecondsMap: {} })
  }

  async function handleEndGame() {
    if (!activeMatchEvent || !isAdmin) return

    const confirmed = window.confirm("End game and save result?")
    if (!confirmed) return

    const response = await fetch("/api/save-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playedOn: activeMatchEvent.date,
        eventId: activeMatchEvent.id,
        competition: activeMatchEvent.title || "",
        homeTeam,
        awayTeam,
        homeScore,
        awayScore,
        venue: activeMatchEvent.location || "",
        notes: "",
        isFinal: true,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      alert(data?.error || "Could not save result")
      return
    }

    setRunning(false)
    await persistMatchState({ running: false })
    await loadLeagueResults()
    alert("Game result saved")
  }

  async function saveMatchReport(coachNotes: string) {
    if (!supabase || !activeMatchEvent || !isAdmin) return

    const reportId = latestActiveMatchReport?.id || crypto.randomUUID?.() || makeId()

    const playerOfTheMatchName =
      players.find((p) => p.id === playerOfMatchMap[activeMatchEvent.id])?.name || "TBC"

    const scoreLine = `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam}`

    const reportText = [
      activeMatchEvent.title,
      activeMatchEvent.date,
      `Result: ${scoreLine}`,
      `Opponent: ${activeMatchEvent.opponent || awayTeam}`,
      `Player of the Match: ${playerOfTheMatchName}`,
      activeTopPerformers.length ? `Top performers: ${activeTopPerformers.join(", ")}` : "",
      activeGoalsSummary.length ? `Goals: ${activeGoalsSummary.join(" | ")}` : "Goals: none logged",
      coachNotes.trim() ? `Coach notes: ${coachNotes.trim()}` : "",
    ]
      .filter(Boolean)
      .join("\n")

    const payload = {
      id: reportId,
      event_id: activeMatchEvent.id,
      title: activeMatchEvent.title,
      match_date: activeMatchEvent.date,
      opponent: activeMatchEvent.opponent || awayTeam,
      score_line: scoreLine,
      player_of_the_match: playerOfTheMatchName,
      top_performers_json: JSON.stringify(activeTopPerformers),
      goals_summary_json: JSON.stringify(activeGoalsSummary),
      coach_notes: coachNotes.trim(),
      report_text: reportText,
    }

    const { error } = await supabase.from("match_reports").upsert(payload)

    if (error) {
      alert(error.message)
      return
    }

    const nextReport: MatchReport = {
      id: reportId,
      eventId: activeMatchEvent.id,
      title: activeMatchEvent.title,
      matchDate: activeMatchEvent.date,
      opponent: activeMatchEvent.opponent || awayTeam,
      scoreLine,
      playerOfTheMatch: playerOfTheMatchName,
      topPerformers: activeTopPerformers,
      goalsSummary: activeGoalsSummary,
      coachNotes: coachNotes.trim(),
      reportText,
      createdAt: new Date().toISOString(),
    }

    setMatchReports((prev) => {
      const filtered = prev.filter((item) => item.eventId !== activeMatchEvent.id)
      return [nextReport, ...filtered]
    })

    alert("Match report saved")
  }

  const totalGoals = timeline.filter((t) => t.type === "goal").length
  const mainGk = players.find((p) => p.mainGK)
  const backupGk = players.find((p) => p.backupGK)
  const availableCount = selectedEvent ? countAttendance(selectedEvent.id, "available") : 0
  const maybeCount = selectedEvent ? countAttendance(selectedEvent.id, "maybe") : 0
  const unavailableCount = selectedEvent ? countAttendance(selectedEvent.id, "unavailable") : 0

  return (
    <DashboardShell
      isAdmin={isAdmin}
      signOut={signOut}
      loading={loading}
      tab={tab}
      setTab={setTab}
      matchTab={matchTab}
      setMatchTab={setMatchTab}
      players={players}
      coaches={coaches}
      coachAvailability={coachAvailability}
      events={events}
      attendance={attendance}
      leagueResults={leagueResults}
      playerRatings={playerRatings}
      matchReports={matchReports}
      selectedDate={selectedDate}
      setSelectedDate={setSelectedDate}
      showEventForm={showEventForm}
      setShowEventForm={setShowEventForm}
      editingCalendarEventId={editingCalendarEventId}
      setEditingCalendarEventId={setEditingCalendarEventId}
      selectedEventId={selectedEventId}
      setSelectedEventId={setSelectedEventId}
      activeMatchEventId={activeMatchEventId}
      setActiveMatchEventId={setActiveMatchEventId}
      eventTitle={eventTitle}
      setEventTitle={setEventTitle}
      eventType={eventType}
      setEventType={setEventType}
      eventStartTime={eventStartTime}
      setEventStartTime={setEventStartTime}
      eventLocation={eventLocation}
      setEventLocation={setEventLocation}
      eventOpponent={eventOpponent}
      setEventOpponent={setEventOpponent}
      eventNotes={eventNotes}
      setEventNotes={setEventNotes}
      selectedDbTrainingPlanId={selectedDbTrainingPlanId}
      setSelectedDbTrainingPlanId={setSelectedDbTrainingPlanId}
      homeTeam={homeTeam}
      setHomeTeamState={setHomeTeamState}
      awayTeam={awayTeam}
      setAwayTeamState={setAwayTeamState}
      homeScore={homeScore}
      setHomeScoreState={setHomeScoreState}
      awayScore={awayScore}
      setAwayScoreState={setAwayScoreState}
      matchFormat={matchFormat}
      formation={formation}
      currentQuarter={currentQuarter}
      setCurrentQuarterState={setCurrentQuarterState}
      periodMode={periodMode}
      setPeriodModeState={setPeriodModeState}
      periodLength={periodLength}
      setPeriodLengthState={setPeriodLengthState}
      seconds={seconds}
      setSeconds={setSeconds}
      running={running}
      setRunning={setRunning}
      liveSecondsMap={liveSecondsMap}
      setLiveSecondsMap={setLiveSecondsMap}
      lineupMap={lineupMap}
      setLineupMap={setLineupMap}
      benchIds={benchIds}
      setBenchIds={setBenchIds}
      savedLineups={savedLineups}
      lineupName={lineupName}
      setLineupName={setLineupName}
      timeline={timeline}
      editingTimelineId={editingTimelineId}
      setEditingTimelineId={setEditingTimelineId}
      showMatchEventModal={showMatchEventModal}
      setShowMatchEventModal={setShowMatchEventModal}
      eventDraft={eventDraft}
      setEventDraft={setEventDraft}
      quarterPlans={quarterPlans}
      quarterWarnings={quarterWarnings}
      activeDragPlayerId={activeDragPlayerId}
      setActiveDragPlayerId={setActiveDragPlayerId}
      allTrainingPlans={allTrainingPlans}
      selectedTemplateId={selectedTemplateId}
      setSelectedTemplateId={setSelectedTemplateId}
      trainingPlan={trainingPlan}
      setTrainingPlan={setTrainingPlan}
      activeSession={activeSession}
      setActiveSession={setActiveSession}
      sessionHistory={sessionHistory}
      currentSlots={currentSlots}
      selectedDateEvents={selectedDateEvents}
      selectedEvent={selectedEvent}
      activeMatchEvent={activeMatchEvent}
      activeMatchAvailableIds={activeMatchAvailableIds}
      activeMatchMaybeIds={activeMatchMaybeIds}
      matchPlayers={matchPlayers}
      maybePlayers={maybePlayers}
      unavailablePlayers={unavailablePlayers}
      noAvailableKeeper={noAvailableKeeper}
      selectedDateCoachAvailability={selectedDateCoachAvailability}
      matchDateForCoachView={matchDateForCoachView}
      availableCoaches={availableCoaches}
      unavailableCoachesList={unavailableCoachesList}
      holidayCoachesList={holidayCoachesList}
      headCoachAvailable={headCoachAvailable}
      noAvailableCoaches={noAvailableCoaches}
      playerOfMatchMap={playerOfMatchMap}
      activeTopPerformers={activeTopPerformers}
      activeGoalsSummary={activeGoalsSummary}
      latestActiveMatchReport={latestActiveMatchReport}
      totalGoals={totalGoals}
      mainGk={mainGk}
      backupGk={backupGk}
      availableCount={availableCount}
      maybeCount={maybeCount}
      unavailableCount={unavailableCount}
      formatFullDate={formatFullDate}
      statusStyle={statusStyle}
      normalizeTeamName={normalizeTeamName}
      countAttendance={countAttendance}
      getPlayerStatus={getPlayerStatus}
      loadTrainingPlanFromEvent={loadTrainingPlanFromEvent}
      persistSettings={persistSettings}
      persistMatchState={persistMatchState}
      savePlayers={savePlayers}
      saveCoaches={saveCoaches}
      saveCoachAvailability={saveCoachAvailability}
      saveTrainingPlans={saveTrainingPlans}
      saveSessionRecord={saveSessionRecord}
      savePlayerRating={savePlayerRating}
      addEvent={addEvent}
      openAddCalendarEvent={openAddCalendarEvent}
      openEditCalendarEvent={openEditCalendarEvent}
      deleteCalendarEvent={deleteCalendarEvent}
      handleChangeFormation={handleChangeFormation}
      handleSaveLineup={handleSaveLineup}
      handleLoadSavedLineup={handleLoadSavedLineup}
      handleDeleteSavedLineup={handleDeleteSavedLineup}
      handleDragStart={handleDragStart}
      handleDragEnd={handleDragEnd}
      openCreateEvent={openCreateEvent}
      openEditEvent={openEditEvent}
      handleDeleteTimelineItem={handleDeleteTimelineItem}
      saveMatchEvent={saveMatchEvent}
      handleSaveCurrentQuarter={handleSaveCurrentQuarter}
      handleLoadQuarter={handleLoadQuarter}
      handleAutoGenerate={handleAutoGenerate}
      handleSaveMinutes={handleSaveMinutes}
      handleEndGame={handleEndGame}
      saveMatchReport={saveMatchReport}
    />
  )
}

export default function Page() {
  return (
    <AuthGate>
      {({ user, isAdmin, signOut }) => <Dashboard key={user.id} isAdmin={isAdmin} signOut={signOut} />}
    </AuthGate>
  )
}
