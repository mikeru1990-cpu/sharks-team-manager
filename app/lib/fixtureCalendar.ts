import type { TeamEvent } from "./teamEvents"

function stamp(value: string | number) {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) throw new Error("A fixture has an invalid date.")
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")
}

function escapeText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,")
}

// RFC 5545: fold at 75 UTF-8 octets, never in the middle of a character.
function fold(line: string) {
  const encoder = new TextEncoder()
  let result = "", bytes = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    if (bytes + size > 75) { result += "\r\n "; bytes = 1 }
    result += char
    bytes += size
  }
  return result
}

export function exportableFixtures(events: TeamEvent[], teamId: string, now = Date.now()) {
  return events.filter(event => event.teamId === teamId && event.eventType === "match" &&
    event.status === "scheduled" && Date.parse(event.startsAt) >= now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
}

export function buildFixtureCalendar(events: TeamEvent[], teamId: string, durationMinutes: number, now = Date.now()) {
  if (!teamId) throw new Error("Choose a team before exporting.")
  if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 240) {
    throw new Error("Choose a duration between 15 and 240 minutes.")
  }
  const fixtures = exportableFixtures(events, teamId, now)
  if (!fixtures.length) throw new Error("No upcoming scheduled matches to export.")
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Football OS//Fixtures//EN", "CALSCALE:GREGORIAN"]
  for (const event of fixtures) {
    const start = Date.parse(event.startsAt)
    const end = event.endsAt ? Date.parse(event.endsAt) : start + durationMinutes * 60000
    if (!Number.isFinite(end) || end <= start) throw new Error(`Check the end time for ${event.title}.`)
    lines.push("BEGIN:VEVENT", `UID:${encodeURIComponent(teamId)}.${encodeURIComponent(event.id)}@football-os`,
      `DTSTAMP:${stamp(now)}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`,
      `SUMMARY:${escapeText(event.title)}`, `LOCATION:${escapeText(event.locationName)}`,
      "STATUS:CONFIRMED", "END:VEVENT")
  }
  lines.push("END:VCALENDAR")
  return lines.map(fold).join("\r\n") + "\r\n"
}
