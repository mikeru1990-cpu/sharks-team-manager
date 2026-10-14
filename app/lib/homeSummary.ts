import type { TeamEvent, EventResponse } from './teamEvents'

const day = (value: string | number) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/London' }).format(new Date(value))

export function upcomingTeamEvents(events: TeamEvent[], now = Date.now()) {
  return events.filter(event => event.status === 'scheduled' && Number.isFinite(Date.parse(event.startsAt)) &&
    day(event.startsAt) >= day(now) && (!event.endsAt || Date.parse(event.endsAt) > now))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
}

export function eventAvailability(eventId: string, responses: EventResponse[], playerIds: string[]) {
  const byPlayer = new Map(responses.filter(response => response.eventId === eventId).map(response => [response.playerId, response.response]))
  const counts = { available: 0, maybe: 0, unavailable: 0, unanswered: 0 }
  for (const id of new Set(playerIds)) counts[byPlayer.get(id) ?? 'unanswered']++
  return counts
}

export function eventDateLabel(value: string) {
  return new Date(value).toLocaleString('en-GB', { timeZone: 'Europe/London', weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function matchesNeedingReports(events: TeamEvent[], reportedIds: string[], now = Date.now()) {
  const reported = new Set(reportedIds)
  return events.filter(event => event.eventType === 'match' && event.status !== 'cancelled' &&
    !reported.has(event.id) && Number.isFinite(Date.parse(event.startsAt)) && day(event.startsAt) < day(now))
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
}

export function hasUnfinishedMatch(value: { period?: number; finished?: boolean }) {
  return typeof value.period === 'number' && value.period > 0 && !value.finished
}
