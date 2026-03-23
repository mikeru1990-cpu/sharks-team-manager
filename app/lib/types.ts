export type MainTab = "home" | "players" | "events" | "coaches" | "match" | "stats"
export type MatchTab = "overview" | "lineup" | "live" | "quarters" | "stats"

export type EventType = "match" | "training" | "other"
export type MatchFormat = "7v7" | "9v9" | "11v11"
export type PitchPosition = "GK" | "DEF" | "MID" | "FWD"

export type TimelineEventType = "goal" | "assist" | "sub" | "injury" | "note"

export type AttendanceStatus = "available" | "maybe" | "unavailable"
export type CoachAvailabilityStatus = "available" | "unavailable" | "holiday"

export type EventItem = {
  id: string
  title: string
  date: string
  type: EventType
  startTime?: string
  location?: string
  opponent?: string
  notes?: string

  // ✅ NEW (results support)
  played?: boolean
  home_score?: number | null
  away_score?: number | null
  result_status?: string
}

export type EventAttendance = {
  id: string
  eventId: string
  playerId: string
  status: AttendanceStatus
}

export type Player = {
  id: string
  name: string
  positions: PitchPosition[]
  mainGK: boolean
  backupGK: boolean
  captain: boolean
  viceCaptain: boolean
  seasonSeconds: number
}

export type Coach = {
  id: string
  name: string
  role: string
  active: boolean
}

export type CoachAvailability = {
  id: string
  coachId: string
  day: string
  status: CoachAvailabilityStatus
  notes: string
}

export type TimelineItem = {
  id: string
  minute: number
  type: TimelineEventType
  text: string
  sortOrder: number
}

export type TrainingTemplate = {
  id: string
  name: string
  warmUp: string
  drill1: string
  drill2: string
  game: string
  notes: string
}

export type PitchSlot = {
  id: string
  label: string
  position: PitchPosition
}

export type MatchEventDraft = {
  type: TimelineEventType
  playerId: string
  secondPlayerId: string
  note: string
}

export type QuarterPlan = {
  lineup: Record<string, string | null>
  bench: string[]
}

export type SavedLineup = {
  id: string
  name: string
  format: MatchFormat
  formation: string
  lineup: Record<string, string | null>
  bench: string[]
}

export const TEAM = {
  name: "Sharks Lioness",
  primary: "#06245c",
  secondary: "#00a6fb",
  accent: "#f59e0b",
}

export const ALL_POSITIONS: PitchPosition[] = ["GK", "DEF", "MID", "FWD"]

export const FORMATIONS: Record<MatchFormat, Record<string, PitchPosition[]>> = {
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

export function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function formatMinutes(seconds: number) {
  return (seconds / 60).toFixed(1)
}

export function cardStyle(bg = "#ffffff") {
  return {
    background: bg,
    border: "1px solid #dbe3ef",
    borderRadius: 24,
    padding: 16,
    boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
    width: "100%",
    boxSizing: "border-box" as const,
  }
}

export function buttonPrimary() {
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

export function buttonSecondary() {
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
