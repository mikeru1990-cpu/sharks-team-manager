"use client"

import type { EventItem } from "../lib/types"
import { cardStyle, chipStyle, formatShortDate, getNext7Days, getWeekdayLabel } from "../lib/types"

type Props = {
  selectedDate: string
  onSelectDate: (date: string) => void
  events: EventItem[]
}

export default function RollingCalendar({ selectedDate, onSelectDate, events }: Props) {
  const days = getNext7Days()
  const visibleEvents = events.filter((e) => e.date === selectedDate)

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Rolling Calendar</div>
        <div
          style={{
            display: "flex",
            overflowX: "auto",
            gap: 10,
            paddingBottom: 6,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {days.map((date) => (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              style={{
                ...chipStyle(date === selectedDate),
                minWidth: 90,
                whiteSpace: "nowrap",
              }}
            >
              <div>{getWeekdayLabel(date)}</div>
              <div>{formatShortDate(date)}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
          Events on {getWeekdayLabel(selectedDate)} {formatShortDate(selectedDate)}
        </div>

        {visibleEvents.length === 0 ? (
          <div style={{ color: "#64748b" }}>No events on this day.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {visibleEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: "1px solid #dbe3ef",
                  background: event.type === "match" ? "#dcfce7" : "#dbeafe",
                }}
              >
                <div style={{ fontWeight: 900 }}>{event.title}</div>
                <div style={{ marginTop: 4, color: "#475569", textTransform: "capitalize" }}>{event.type}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
