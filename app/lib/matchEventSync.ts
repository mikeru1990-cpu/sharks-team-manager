import { enqueueOfflineAction, flushOfflineQueue, type OfflineQueueItem } from "./offlineQueue"
import { supabase } from "./supabase"

export type MatchEventPayload = {
  client_event_id: string
  match_id: string
  team_id: string
  event_type: string
  player_id?: string | null
  minute?: number | null
  metadata?: Record<string, unknown>
  occurred_at: string
}

const MATCH_EVENT_ACTION = "match-event:create"

async function insertMatchEvent(payload: MatchEventPayload) {
  if (!supabase) throw new Error("Supabase is not configured")

  const { error } = await supabase.from("match_events").upsert(payload, {
    onConflict: "client_event_id",
    ignoreDuplicates: true,
  })

  if (error) throw error
}

export async function saveMatchEvent(
  event: Omit<MatchEventPayload, "client_event_id" | "occurred_at"> &
    Partial<Pick<MatchEventPayload, "client_event_id" | "occurred_at">>,
) {
  const payload: MatchEventPayload = {
    ...event,
    client_event_id: event.client_event_id ?? crypto.randomUUID(),
    occurred_at: event.occurred_at ?? new Date().toISOString(),
  }

  if (typeof navigator !== "undefined" && !navigator.onLine) {
    enqueueOfflineAction(MATCH_EVENT_ACTION, payload)
    return { queued: true, payload }
  }

  try {
    await insertMatchEvent(payload)
    return { queued: false, payload }
  } catch {
    enqueueOfflineAction(MATCH_EVENT_ACTION, payload)
    return { queued: true, payload }
  }
}

export async function syncQueuedMatchEvents() {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { synced: 0, remaining: -1 }
  }

  return flushOfflineQueue(async (item: OfflineQueueItem) => {
    if (item.type !== MATCH_EVENT_ACTION) return
    await insertMatchEvent(item.payload as MatchEventPayload)
  })
}
