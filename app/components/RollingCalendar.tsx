"use client"

import { useMemo, useState } from "react"
import {
  TEAM,
  buttonSecondary,
  cardStyle,
  type EventItem,
} from "../lib/types"

function toDateOnly(value: Date) {
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function fromDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, (month || 1) - 1, day || 1, 12, 0, 0)
}

function monthLabel(value: Date) {
  return value.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })
}

function weekdayShort(value: Date) {
  return value.toLocaleDateString("en-GB", { weekday: "short" })
}

function shortDateLabel(value: Date) {
  const day = String(value.getDate()).padStart(2, "0")
  const month = String(value.getMonth() + 1).padStart(2, "0")
  return `${day}-${month}`
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
  const selected = useMemo(() => fromDateOnly(selectedDate), [selectedDate])

  const [viewMonth, setViewMonth] = useState(
    new Date(selected.getFullYear(), selected.getMonth(), 1, 12, 0, 0)
  )

  const eventMap = useMemo(() => {
    const map = new Map<string, EventItem[]>()

    for (const event of events) {
      const existing = map.get(event.date) || []
      existing.push(event)
      map.set(event.date, existing)
    }

    return map
  }, [events])

  const selectedDayEvents = (eventMap.get(selectedDate) || []).slice().sort((a, b) => {
    const timeCompare = (a.startTime || "").localeCompare(b.startTime || "")
    if (timeCompare !== 0) return timeCompare
    return a.title.localeCompare(b.title)
  })

  const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  const monthGrid = useMemo(() => {
    const firstOfMonth = new Date(
      viewMonth.getFullYear(),
      viewMonth.getMonth(),
      1,
      12,
      0,
      0
    )

    const startWeekday = (firstOfMonth.getDay() + 6) % 7
    const gridStart = new Date(firstOfMonth)
    gridStart.setDate(firstOfMonth.getDate() - startWeekday)

    return Array.from({ length: 42 }, (_, index) => {
      const d = new Date(gridStart)
      d.setDate(gridStart.getDate() + index)
      return d
    })
  }, [viewMonth])

  function goPrevMonth() {
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1, 12, 0, 0)
    )
  }

  function goNextMonth() {
    setViewMonth(
      new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1, 12, 0, 0)
    )
  }

  function goToToday() {
    const today = new Date()
    const todayString = toDateOnly(today)
    onSelectDate(todayString)
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0))
  }

  function handleManualDateChange(value: string) {
    if (!value) return
    onSelectDate(value)
    const picked = fromDateOnly(value)
    setViewMonth(new Date(picked.getFullYear(), picked.getMonth(), 1, 12, 0, 0))
  }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div
        style={{
          ...cardStyle(),
          padding: 14,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 10,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900 }}>Calendar</div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={goPrevMonth}
              style={{ ...buttonSecondary(), padding: "10px 14px" }}
            >
              ← Prev
            </button>
            <button
              onClick={goNextMonth}
              style={{ ...buttonSecondary(), padding: "10px 14px" }}
            >
              Next →
            </button>
            <button
              onClick={goToToday}
              style={{ ...buttonSecondary(), padding: "10px 14px" }}
            >
              Today
            </button>
          </div>
        </div>

        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>
          {monthLabel(viewMonth)}
        </div>

        <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
          <label style={{ fontWeight: 800, color: "#475569" }}>Jump to date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleManualDateChange(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 16,
              border: "1px solid #dbe3ef",
              fontSize: 16,
              background: "white",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 8,
            marginBottom: 8,
          }}
        >
          {weekdayLabels.map((label) => (
            <div
              key={label}
              style={{
                textAlign: "center",
                fontWeight: 900,
                color: "#64748b",
                padding: "6px 0",
                fontSize: 14,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 8,
          }}
        >
          {monthGrid.map((date) => {
            const dateKey = toDateOnly(date)
            const inCurrentMonth = date.getMonth() === viewMonth.getMonth()
            const isSelected = dateKey === selectedDate
            const dayEvents = eventMap.get(dateKey) || []
            const hasEvents = dayEvents.length > 0
            const isToday = dateKey === toDateOnly(new Date())

            return (
              <button
                key={dateKey}
                onClick={() => onSelectDate(dateKey)}
                style={{
                  minWidth: 0,
                  minHeight: 82,
                  borderRadius: 18,
                  padding: "8px 6px",
                  border: isSelected
                    ? `2px solid ${TEAM.primary}`
                    : isToday
                    ? "2px solid #cbd5e1"
                    : "1px solid #dbe3ef",
                  background: isSelected ? "#dbeafe" : "white",
                  color: inCurrentMonth ? "#0f172a" : "#94a3b8",
                  fontWeight: 800,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  boxSizing: "border-box",
                }}
              >
                <div style={{ fontSize: 16, lineHeight: 1 }}>{date.getDate()}</div>

                {hasEvents ? (
                  <div
                    style={{
                      fontSize: 11,
                      color: TEAM.primary,
                      fontWeight: 900,
                      textAlign: "center",
                      lineHeight: 1.1,
                    }}
                  >
                    {dayEvents.length} event{dayEvents.length === 1 ? "" : "s"}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 11,
                      color: "transparent",
                      lineHeight: 1.1,
                    }}
                  >
                    empty
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div
        style={{
          ...cardStyle(),
          padding: 14,
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>
          Events on {weekdayShort(selected)} {shortDateLabel(selected)}
        </div>

        {selectedDayEvents.length === 0 ? (
          <div style={{ color: "#64748b" }}>No events on this day.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {selectedDayEvents.map((event) => (
              <div
                key={event.id}
                style={{
                  padding: 12,
                  borderRadius: 16,
                  border: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <div style={{ fontWeight: 900 }}>{event.title}</div>
                <div style={{ color: "#64748b", marginTop: 4 }}>
                  {event.type}
                  {event.startTime ? ` • ${event.startTime}` : ""}
                  {event.location ? ` • ${event.location}` : ""}
                </div>
                {event.opponent ? (
                  <div style={{ color: "#64748b", marginTop: 4 }}>
                    Opponent: {event.opponent}
                  </div>
                ) : null}
                {event.notes ? (
                  <div style={{ color: "#475569", marginTop: 6 }}>
                    {event.notes}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
