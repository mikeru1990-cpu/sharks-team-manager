import { authRequired } from "./runtimeConfig"
import { supabase } from "./supabase"

export type TeamEventType = "match" | "training" | "event" | "tournament" | "meeting"
export type TeamEventStatus = "scheduled" | "cancelled" | "completed"
export type EventResponseValue = "available" | "maybe" | "unavailable" | "unanswered"

export type TeamEvent = {
  id: string
  teamId: string
  eventType: TeamEventType
  title: string
  startsAt: string
  meetAt: string | null
  endsAt: string | null
  locationName: string
  notes: string
  status: TeamEventStatus
}

export type EventResponse = {
  eventId: string
  playerId: string
  response: EventResponseValue
  note: string
}

export type NewTeamEvent = {
  eventType: TeamEventType
  title: string
  startsAt: string
  meetAt?: string | null
  endsAt?: string | null
  locationName?: string
  notes?: string
}

const localEventPrefix = "football-os-team-events-v1"
const localResponsePrefix = "football-os-event-responses-v1"

function eventKey(teamId: string) {
  return `${localEventPrefix}:${encodeURIComponent(teamId)}`
}

function responseKey(teamId: string) {
  return `${localResponsePrefix}:${encodeURIComponent(teamId)}`
}

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function mapEvent(row: any): TeamEvent {
  return {
    id: row.id,
    teamId: row.team_id,
    eventType: row.event_type,
    title: row.title,
    startsAt: row.starts_at,
    meetAt: row.meet_at ?? null,
    endsAt: row.ends_at ?? null,
    locationName: row.location_name ?? "",
    notes: row.notes ?? "",
    status: row.status,
  }
}

export async function loadTeamEvents(teamId: string): Promise<TeamEvent[]> {
  if (!authRequired) {
    return readLocal<TeamEvent[]>(eventKey(teamId), []).sort(
      (a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt),
    )
  }

  const { data, error } = await supabase
    .from("team_events")
    .select("id,team_id,event_type,title,starts_at,meet_at,ends_at,location_name,notes,status")
    .eq("team_id", teamId)
    .order("starts_at", { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapEvent)
}

export async function createTeamEvent(teamId: string, input: NewTeamEvent): Promise<TeamEvent> {
  if (!authRequired) {
    const event: TeamEvent = {
      id: `local-event-${Date.now()}`,
      teamId,
      eventType: input.eventType,
      title: input.title,
      startsAt: input.startsAt,
      meetAt: input.meetAt ?? null,
      endsAt: input.endsAt ?? null,
      locationName: input.locationName ?? "",
      notes: input.notes ?? "",
      status: "scheduled",
    }
    const current = readLocal<TeamEvent[]>(eventKey(teamId), [])
    writeLocal(eventKey(teamId), [...current, event])
    return event
  }

  const { data, error } = await supabase
    .from("team_events")
    .insert({
      team_id: teamId,
      event_type: input.eventType,
      title: input.title,
      starts_at: input.startsAt,
      meet_at: input.meetAt ?? null,
      ends_at: input.endsAt ?? null,
      location_name: input.locationName?.trim() || null,
      notes: input.notes?.trim() || null,
      status: "scheduled",
    })
    .select("id,team_id,event_type,title,starts_at,meet_at,ends_at,location_name,notes,status")
    .single()

  if (error) throw error
  return mapEvent(data)
}

export async function updateTeamEventStatus(event: TeamEvent, status: TeamEventStatus) {
  if (!authRequired) {
    const current = readLocal<TeamEvent[]>(eventKey(event.teamId), [])
    writeLocal(
      eventKey(event.teamId),
      current.map((item) => item.id === event.id ? { ...item, status } : item),
    )
    return
  }

  const { error } = await supabase
    .from("team_events")
    .update({ status })
    .eq("id", event.id)

  if (error) throw error
}

export async function loadEventResponses(
  teamId: string,
  eventIds: string[],
): Promise<EventResponse[]> {
  if (!eventIds.length) return []

  if (!authRequired) {
    const all = readLocal<EventResponse[]>(responseKey(teamId), [])
    const ids = new Set(eventIds)
    return all.filter((response) => ids.has(response.eventId))
  }

  const { data, error } = await supabase
    .from("event_responses")
    .select("event_id,player_id,response,note")
    .in("event_id", eventIds)

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    eventId: row.event_id,
    playerId: row.player_id,
    response: row.response,
    note: row.note ?? "",
  }))
}

export async function setEventResponse({
  teamId,
  eventId,
  playerId,
  response,
  note = "",
}: {
  teamId: string
  eventId: string
  playerId: string
  response: EventResponseValue
  note?: string
}) {
  if (!authRequired) {
    const current = readLocal<EventResponse[]>(responseKey(teamId), [])
    const next = current.filter(
      (item) => !(item.eventId === eventId && item.playerId === playerId),
    )
    next.push({ eventId, playerId, response, note })
    writeLocal(responseKey(teamId), next)
    return
  }

  const { error } = await supabase
    .from("event_responses")
    .upsert(
      {
        event_id: eventId,
        player_id: playerId,
        response,
        note: note.trim() || null,
      },
      { onConflict: "event_id,player_id" },
    )

  if (error) throw error
}

export async function loadGuardianPlayerIds(): Promise<string[]> {
  if (!authRequired) return []
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!userData.user) return []

  const { data, error } = await supabase
    .from("player_guardians")
    .select("player_id")
    .eq("user_id", userData.user.id)
    .eq("can_manage_availability", true)

  if (error) throw error
  return (data ?? []).map((row: any) => row.player_id)
}
