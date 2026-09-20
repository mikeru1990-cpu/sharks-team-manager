import type { TeamEvent, EventResponse, EventResponseValue } from "./teamEvents"

export type ScheduledMatch = Pick<TeamEvent, "id" | "teamId" | "title" | "startsAt" | "meetAt" | "locationName" | "notes"> & {
  availability?: Record<string, EventResponseValue>
  availabilityCapturedAt?: string
}

const responseValues: EventResponseValue[] = ["available", "maybe", "unavailable", "unanswered"]

export function responseForMatch(match: ScheduledMatch, player: { id: string; cloudId?: string | null }): EventResponseValue {
  const value = match.availability?.[player.cloudId ?? player.id]
  return value && responseValues.includes(value) ? value : "unanswered"
}

export function scheduledMatchKey(teamId: string) {
  return `football-os-scheduled-match-v1:${encodeURIComponent(teamId)}`
}

export function matchWorkflowKey(match: ScheduledMatch) {
  return `football-os-matchday-workflow-v6:${encodeURIComponent(match.teamId)}:${encodeURIComponent(match.id)}`
}

export function parseScheduledMatch(raw: string | null, teamId: string): ScheduledMatch | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw)
    if (!value || value.teamId !== teamId || typeof value.id !== "string" || !value.id ||
        typeof value.title !== "string" || typeof value.startsAt !== "string" ||
        !Number.isFinite(Date.parse(value.startsAt)) || typeof value.locationName !== "string" ||
        typeof value.notes !== "string" ||
        !(value.meetAt === null || (typeof value.meetAt === "string" && Number.isFinite(Date.parse(value.meetAt))))) return null
    if (value.availability !== undefined && (!value.availability || typeof value.availability !== "object" ||
        Array.isArray(value.availability) || Object.values(value.availability).some(item => !responseValues.includes(item as EventResponseValue)))) return null
    if (value.availabilityCapturedAt !== undefined && (typeof value.availabilityCapturedAt !== "string" || !Number.isFinite(Date.parse(value.availabilityCapturedAt)))) return null
    return value
  } catch {
    return null
  }
}

export function openScheduledMatch(event: TeamEvent, responses: EventResponse[] = []) {
  if (event.eventType !== "match" || event.status !== "scheduled") throw new Error("Only scheduled matches can open in Matchday.")
  const match: ScheduledMatch = {
    id: event.id, teamId: event.teamId, title: event.title, startsAt: event.startsAt,
    meetAt: event.meetAt, locationName: event.locationName, notes: event.notes,
    availability: Object.fromEntries(responses.filter(response => response.eventId === event.id)
      .map(response => [response.playerId, response.response])),
    availabilityCapturedAt: new Date().toISOString(),
  }
  window.sessionStorage.setItem(scheduledMatchKey(event.teamId), JSON.stringify(match))
}
