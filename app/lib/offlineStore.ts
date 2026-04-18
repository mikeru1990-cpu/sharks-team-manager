const APP_CACHE_KEY = "sharks-app-cache-v1"
const SYNC_QUEUE_KEY = "sharks-sync-queue-v1"

export type OfflineCacheShape = {
  players?: any[]
  coaches?: any[]
  coachAvailability?: any[]
  events?: any[]
  attendance?: any[]
  leagueResults?: any[]
  playerRatings?: any[]
  matchReports?: any[]
  trainingPlans?: any[]
  sessionHistory?: any[]
  seasons?: any[]
  appSettings?: {
    selectedDate?: string
    activeMatchEventId?: string | null
  }
  matchStateByEventId?: Record<string, any>
}

export type OfflineQueueItem = {
  id: string
  createdAt: string
  type:
    | "upsert_app_settings"
    | "upsert_event"
    | "delete_event"
    | "upsert_attendance"
    | "upsert_match_state"
    | "replace_timeline"
    | "replace_lineups"
    | "replace_quarter_plans"
    | "upsert_player_rating"
    | "upsert_match_report"
    | "upsert_coach_availability"
    | "replace_training_plans"
    | "insert_session_record"
    | "replace_players"
    | "replace_coaches"
    | "replace_seasons"
  payload: any
}

function isBrowser() {
  return typeof window !== "undefined"
}

export function loadOfflineCache(): OfflineCacheShape {
  if (!isBrowser()) return {}
  try {
    const raw = window.localStorage.getItem(APP_CACHE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveOfflineCache(patch: Partial<OfflineCacheShape>) {
  if (!isBrowser()) return
  try {
    const current = loadOfflineCache()
    const next = { ...current, ...patch }
    window.localStorage.setItem(APP_CACHE_KEY, JSON.stringify(next))
  } catch {}
}

export function loadSyncQueue(): OfflineQueueItem[] {
  if (!isBrowser()) return []
  try {
    const raw = window.localStorage.getItem(SYNC_QUEUE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveSyncQueue(queue: OfflineQueueItem[]) {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
  } catch {}
}

export function enqueueSyncItem(item: OfflineQueueItem) {
  const queue = loadSyncQueue()
  queue.push(item)
  saveSyncQueue(queue)
}

export function clearSyncQueue() {
  saveSyncQueue([])
}

export function removeSyncQueueItem(id: string) {
  const queue = loadSyncQueue().filter((item) => item.id !== id)
  saveSyncQueue(queue)
}
