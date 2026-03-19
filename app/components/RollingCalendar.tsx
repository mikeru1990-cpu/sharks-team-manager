"use client"

import { cardStyle, TEAM, type EventItem } from "../lib/types"

function formatLabel(dateStr: string) {
  const d = new Date(dateStr)
  const weekday = d.toLocaleDateString("en-GB", { weekday: "short" })
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${weekday}\n${month}-${day}`
}

function getRollingDates(centerDate: string, days = 7) {
  const start = new Date(centerDate)
  const items: string[] = []

  for (let i = 0; i < days; i++) {
    const next = new Date(start)
    next.setDate(start.getDate() + i)
    items.push(next.toISOString().split("T")[0])
  }

  return items
}

export default function RollingCalendar({
  selectedDate,
  onSelectDate,
  events,
}: {
  selectedDate: string
  onSelectDate: (date: string) => void
  events: EventItem[]
}) {
  const dates = getRollingDates(selectedDate, 7)

  return (
    <div style={{ ...cardStyle(), minWidth: 0, overflow: "hidden" }}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Rolling Calendar</div>

      <div
        style={{
          display: "grid",
          gridAutoFlow: "column",
          gridAutoColumns: "140px",
          gap: 10,
          overflowX: "auto",
          overflowY: "hidden",
          width: "100%",
          paddingBottom: 4,
          boxSizing: "border-box",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {dates.map((date) => {
          const dayEvents = events.filter((e) => e.date === date)
          const active = date === selectedDate

          return (
            <button
              key={date}
              onClick={() => onSelectDate(date)}
              style={{
                width: "140px",
                minWidth: 0,
                flexShrink: 0,
                border: active ? `2px solid ${TEAM.primary}` : "1px solid #dbe3ef",
                background: active ? "#dbeafe" : "#fff",
                borderRadius: 16,
                padding: 12,
                textAlign: "center",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 13,
                  whiteSpace: "pre-line",
                  lineHeight: 1.35,
                }}
              >
                {formatLabel(date)}
              </div>

              <div
                style={{
                  marginTop: 8,
                  color: "#64748b",
                  fontSize: 12,
                  overflowWrap: "anywhere",
                }}
              >
                {dayEvents.length ? `${dayEvents.length} event${dayEvents.length > 1 ? "s" : ""}` : "No events"}
              </div>
            </button>
          )
        })}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ fontSize: 22, fontWeight: 900 }}>
          Events on{" "}
          {new Date(selectedDate).toLocaleDateString("en-GB", { weekday: "short" })}{" "}
          {String(new Date(selectedDate).getMonth() + 1).padStart(2, "0")}-{String(
            new Date(selectedDate).getDate()
          ).padStart(2, "0")}
        </div>

        <div style={{ color: "#64748b", marginTop: 12 }}>
          {events.some((e) => e.date === selectedDate) ? "Events available." : "No events on this day."}
        </div>
      </div>
    </div>
  )
}
