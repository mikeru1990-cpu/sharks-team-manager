export type MainTab = "home" | "players" | "events" | "match" | "stats"
export type MatchTab = "overview" | "lineup" | "live" | "quarters" | "stats"
export type EventType = "match" | "training" | "other"
export type MatchFormat = "7v7" | "9v9" | "11v11"
export type PitchPosition = "GK" | "DEF" | "MID" | "FWD"
export type TimelineEventType = "goal" | "assist" | "sub" | "injury" | "note"
export type AttendanceStatus = "available" | "maybe" | "unavailable"

export type EventItem = {
  id: string
  title: string
  date: string
  type: EventType
  startTime?: string
  location?: string
  opponent?: string
  notes?: string
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

export const initialPlayers: Player[] = [
  {
    id: "1",
    name: "Bailee Dowler-Rowles",
    positions: ["DEF"],
    mainGK: false,
    backupGK: true,
    captain: false,
    viceCaptain: false,
    seasonSeconds: 0,
  },
  {
    id: "2",
    name: "Bella Bainbridge",
    positions: ["MID"],
    mainGK: false,
    backupGK: false,
    captain: false,
    viceCaptain: true,
    seasonSeconds: 0,
  },
  {
    id: "3",
    name: "Betsy Rowland",
    positions: ["MID", "DEF"],
    mainGK: false,
    backupGK: true,
    captain: false,
    viceCaptain: false,
    seasonSeconds: 0,
  },
  {
    id: "4",
    name: "Connie Luff",
    positions: ["MID", "FWD"],
    mainGK: false,
    backupGK: false,
    captain: false,
    viceCaptain: false,
    seasonSeconds: 0,
  },
  {
    id: "5",
    name: "Darcy-Rae Russell",
    positions: ["GK"],
    mainGK: true,
    backupGK: false,
    captain: false,
    viceCaptain: false,
    seasonSeconds: 0,
  },
  {
    id: "6",
    name: "Ella Wilson",
    positions: ["MID", "DEF"],
    mainGK: false,
    backupGK: false,
    captain: false,
    viceCaptain: false,
    seasonSeconds: 0,
  },
  {
    id: "7",
    name: "Elsy Harmer",
    positions: ["DEF"],
    mainGK: false,
    backupGK: false,
    captain: false,
    viceCaptain: false,
    seasonSeconds: 0,
  },
  {
    id: "8",
    name: "Evelyn Evans",
    positions: ["MID", "DEF"],
    mainGK: false,
    backupGK: false,
    captain: false,
    viceCaptain: false,
    seasonSeconds: 0,
  },
  {
    id: "9",
    name: "Isabella Ogden",
    positions: ["DEF", "MID"],
    mainGK: false,
    backupGK: false,
    captain: false,
    viceCaptain: false,
    seasonSeconds: 0,
  },
  {
    id: "10",
    name: "Lyra Twinning",
    positions: ["MID", "FWD"],
    mainGK: false,
    backupGK: false,
    captain: true,
    viceCaptain: false,
    seasonSeconds: 0,
  },
  {
    id: "11",
    name: "Martha Scrivens",
    positions: ["MID", "FWD"],
    mainGK: false,
    backupGK: false,
    captain: false,
    viceCaptain: false,
    seasonSeconds: 0,
  },
  {
    id: "12",
    name: "Olivia Hassall",
    positions: ["DEF"],
    mainGK: false,
    backupGK: false,
    captain: false,
    viceCaptain: false,
    seasonSeconds: 0,
  },
  {
    id: "13",
    name: "Poppy Bennett",
    positions: ["MID", "FWD"],
    mainGK: false,
    backupGK: true,
    captain: false,
    viceCaptain: false,
    seasonSeconds: 0,
  },
  {
    id: "14",
    name: "Ruby Salter",
    positions: ["MID", "DEF"],
    mainGK: false,
    backupGK: false,
    captain: false,
    viceCaptain: false,
    seasonSeconds: 0,
  },
]

export const initialEvents: EventItem[] = [
  {
    id: "1",
    title: "League Game vs Leonard Stanley",
    date: "2026-03-15",
    type: "match",
    startTime: "10:00",
    location: "",
    opponent: "Leonard Stanley",
    notes: "",
  },
  {
    id: "2",
    title: "Technical Training",
    date: "2026-03-13",
    type: "training",
    startTime: "18:00",
    location: "",
    opponent: "",
    notes: "",
  },
  {
    id: "3",
    title: "Recovery Session",
    date: "2026-03-16",
    type: "training",
    startTime: "18:00",
    location: "",
    opponent: "",
    notes: "",
  },
]

export const initialTrainingTemplates: TrainingTemplate[] = [
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

export function getToday() {
  return new Date().toISOString().split("T")[0]
}

export function getNext7Days() {
  const arr: string[] = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    arr.push(d.toISOString().split("T")[0])
  }
  return arr
}

export function getWeekdayLabel(date: string) {
  const d = new Date(`${date}T12:00:00`)
  return d.toLocaleDateString("en-GB", { weekday: "short" })
}

export function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function formatMinutes(seconds: number) {
  return (seconds / 60).toFixed(1)
}

export function formatShortDate(date: string) {
  return date.slice(5)
}

export function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
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

export function chipStyle(active: boolean) {
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
