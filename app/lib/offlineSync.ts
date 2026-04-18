import { supabase } from "./supabase"
import {
  loadSyncQueue,
  removeSyncQueueItem,
  type OfflineQueueItem,
} from "./offlineStore"

async function processItem(item: OfflineQueueItem) {
  if (!supabase) throw new Error("Supabase not configured")

  switch (item.type) {
    case "upsert_app_settings": {
      const { error } = await supabase.from("app_settings").upsert(item.payload)
      if (error) throw error
      return
    }

    case "upsert_event": {
      const { error } = await supabase.from("events").upsert(item.payload)
      if (error) throw error
      return
    }

    case "delete_event": {
      const { id } = item.payload
      const { error } = await supabase.from("events").delete().eq("id", id)
      if (error) throw error
      return
    }

    case "upsert_attendance": {
      const { error } = await supabase.from("event_attendance").upsert(item.payload)
      if (error) throw error
      return
    }

    case "upsert_match_state": {
      const { error } = await supabase.from("match_state").upsert(item.payload)
      if (error) throw error
      return
    }

    case "replace_timeline": {
      const { eventId, rows } = item.payload
      const del = await supabase.from("match_timeline_events").delete().eq("event_id", eventId)
      if (del.error) throw del.error
      if (rows.length > 0) {
        const ins = await supabase.from("match_timeline_events").insert(rows)
        if (ins.error) throw ins.error
      }
      return
    }

    case "replace_lineups": {
      const { eventId, rows } = item.payload
      const del = await supabase.from("match_lineups").delete().eq("event_id", eventId)
      if (del.error) throw del.error
      if (rows.length > 0) {
        const ins = await supabase.from("match_lineups").insert(rows)
        if (ins.error) throw ins.error
      }
      return
    }

    case "replace_quarter_plans": {
      const { eventId, rows } = item.payload
      const del = await supabase.from("match_quarter_plans").delete().eq("event_id", eventId)
      if (del.error) throw del.error
      if (rows.length > 0) {
        const ins = await supabase.from("match_quarter_plans").insert(rows)
        if (ins.error) throw ins.error
      }
      return
    }

    case "upsert_player_rating": {
      const { error } = await supabase.from("player_match_ratings").upsert(item.payload)
      if (error) throw error
      return
    }

    case "upsert_match_report": {
      const { error } = await supabase.from("match_reports").upsert(item.payload)
      if (error) throw error
      return
    }

    case "upsert_coach_availability": {
      const { mode, payload } = item.payload

      if (mode === "update") {
        const { id, status, notes } = payload
        const res = await supabase
          .from("coach_availability")
          .update({ status, notes })
          .eq("id", id)
        if (res.error) throw res.error
        return
      }

      const { error } = await supabase.from("coach_availability").insert(payload)
      if (error) throw error
      return
    }

    case "replace_training_plans": {
      const { removedIds, rows } = item.payload
      if (removedIds?.length) {
        const del = await supabase.from("training_plans").delete().in("id", removedIds)
        if (del.error) throw del.error
      }
      if (rows?.length) {
        const up = await supabase.from("training_plans").upsert(rows)
        if (up.error) throw up.error
      }
      return
    }

    case "insert_session_record": {
      const { error } = await supabase.from("training_session_history").insert(item.payload)
      if (error) throw error
      return
    }

    case "replace_players": {
      const { removedIds, rows } = item.payload
      if (removedIds?.length) {
        const del = await supabase.from("players").delete().in("id", removedIds)
        if (del.error) throw del.error
      }
      if (rows?.length) {
        const up = await supabase.from("players").upsert(rows)
        if (up.error) throw up.error
      }
      return
    }

    case "replace_coaches": {
      const { removedIds, rows } = item.payload
      if (removedIds?.length) {
        const del = await supabase.from("coaches").delete().in("id", removedIds)
        if (del.error) throw del.error
      }
      if (rows?.length) {
        const up = await supabase.from("coaches").upsert(rows)
        if (up.error) throw up.error
      }
      return
    }

    case "replace_seasons": {
      const { rows } = item.payload
      const { error } = await supabase.from("seasons").upsert(rows)
      if (error) throw error
      return
    }

    default:
      throw new Error(`Unknown queue item type: ${item.type}`)
  }
}

export async function flushOfflineQueue() {
  if (typeof navigator !== "undefined" && !navigator.onLine) return

  const queue = loadSyncQueue()
  if (!queue.length) return

  for (const item of queue) {
    await processItem(item)
    removeSyncQueueItem(item.id)
  }
}
