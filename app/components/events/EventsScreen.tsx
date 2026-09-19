"use client"

import { CalendarDays, Clock3, MapPin } from "lucide-react"
import { leonardStanleyEvents } from "../../lib/realTeamData"

function eventTime(event: (typeof leonardStanleyEvents)[number]) {
  const timestamp = Date.parse(event.dateLabel)
  return Number.isFinite(timestamp) ? timestamp : 0
}

export default function EventsScreen() {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const today = now.getTime()

  const upcoming = [...leonardStanleyEvents]
    .filter((event) => eventTime(event) >= today)
    .sort((a, b) => eventTime(a) - eventTime(b))
  const past = [...leonardStanleyEvents]
    .filter((event) => eventTime(event) < today)
    .sort((a, b) => eventTime(b) - eventTime(a))

  return (
    <div className="fos-events-list">
      {upcoming.length ? (
        <div className="fos-event-group">
          <div className="fos-event-group-title"><span>UPCOMING</span><strong>{upcoming.length}</strong></div>
          {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      ) : (
        <div className="fos-events-empty">
          <CalendarDays />
          <div><strong>No future events recorded yet</strong><span>Add the next match or training event when the club calendar is connected.</span></div>
        </div>
      )}

      {past.length > 0 && (
        <div className="fos-event-group">
          <div className="fos-event-group-title"><span>RECENT HISTORY</span><strong>{past.length}</strong></div>
          {past.map((event) => <EventCard key={event.id} event={event} muted />)}
        </div>
      )}
    </div>
  )
}

function EventCard({
  event,
  muted = false,
}: {
  event: (typeof leonardStanleyEvents)[number]
  muted?: boolean
}) {
  return (
    <article className={`fos-event-card ${muted ? "muted" : ""}`}>
      <div className="fos-event-date">
        <span>{event.dateLabel.split(" ")[0]}</span>
        <small>{event.dateLabel.split(" ").slice(1, 2).join("")}</small>
      </div>
      <div className="fos-event-main">
        <div className="fos-event-top">
          <div><span>{event.type.toUpperCase()}</span><h3>{event.title}</h3></div>
        </div>
        <div className="fos-event-meta">
          {event.timeLabel && <span><Clock3 />{event.timeLabel}</span>}
          {event.location && <span><MapPin />{event.location}</span>}
        </div>
        {event.notes && <p>{event.notes}</p>}
      </div>
    </article>
  )
}
