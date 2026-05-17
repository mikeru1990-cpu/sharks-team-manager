export type MatchEvent = {
  id: string
  type: "goal" | "assist" | "sub" | "injury" | "yellow" | "red"
  minute: number
  playerId?: string
  secondaryPlayerId?: string
  createdAt: number
  synced?: boolean
}

export type MatchSession = {
  id: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  quarter: number
  status: "live" | "paused" | "half_time" | "full_time"
  startedAt: number
  pausedAt?: number
  pausedDuration: number
  lastUpdated: number
  events: MatchEvent[]
}

const STORAGE_KEY = "sharks-live-match-session"
const OFFLINE_QUEUE_KEY = "sharks-offline-event-queue"

export function createMatchSession(
  homeTeam: string,
  awayTeam: string,
): MatchSession {
  const now = Date.now()

  return {
    id: crypto.randomUUID(),
    homeTeam,
    awayTeam,
    homeScore: 0,
    awayScore: 0,
    quarter: 1,
    status: "live",
    startedAt: now,
    pausedDuration: 0,
    lastUpdated: now,
    events: [],
  }
}

export function saveMatchSession(session: MatchSession) {
  if (typeof window === "undefined") return

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
}

export function loadMatchSession(): MatchSession | null {
  if (typeof window === "undefined") return null

  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearMatchSession() {
  if (typeof window === "undefined") return

  localStorage.removeItem(STORAGE_KEY)
}

export function getElapsedMatchSeconds(session: MatchSession) {
  const now = Date.now()

  const pausedOffset =
    session.status === "paused" && session.pausedAt
      ? now - session.pausedAt
      : 0

  return Math.max(
    0,
    Math.floor(
      (now - session.startedAt - session.pausedDuration - pausedOffset) /
        1000,
    ),
  )
}

export function pauseMatch(session: MatchSession): MatchSession {
  return {
    ...session,
    status: "paused",
    pausedAt: Date.now(),
    lastUpdated: Date.now(),
  }
}

export function resumeMatch(session: MatchSession): MatchSession {
  const now = Date.now()

  return {
    ...session,
    status: "live",
    pausedDuration:
      session.pausedDuration +
      (session.pausedAt ? now - session.pausedAt : 0),
    pausedAt: undefined,
    lastUpdated: now,
  }
}

export function addMatchEvent(
  session: MatchSession,
  event: MatchEvent,
): MatchSession {
  const updated = {
    ...session,
    events: [...session.events, event],
    lastUpdated: Date.now(),
  }

  saveOfflineEvent(event)

  return updated
}

export function saveOfflineEvent(event: MatchEvent) {
  if (typeof window === "undefined") return

  const current = loadOfflineQueue()

  current.push(event)

  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(current))
}

export function loadOfflineQueue(): MatchEvent[] {
  if (typeof window === "undefined") return []

  const raw = localStorage.getItem(OFFLINE_QUEUE_KEY)

  if (!raw) return []

  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function clearOfflineQueue() {
  if (typeof window === "undefined") return

  localStorage.removeItem(OFFLINE_QUEUE_KEY)
}
