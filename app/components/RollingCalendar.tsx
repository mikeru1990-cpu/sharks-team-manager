"use client"

import { useMemo } from "react"

type Props = {
  selectedDate: string
  onSelectDate: (date: string) => void
  events: { date: string }[]
}

function getStartOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay() || 7 // Monday start
  if (day !== 1) d.setDate(d.getDate() - (day - 1))
  return d
}

function formatDate(date: Date) {
  return date.toISOString().split("T")[0]
}

function formatHeader(date: Date) {
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })
}

export default function RollingCalendar({ selectedDate, onSelectDate, events }: Props) {
  const selected = new Date(`${selectedDate}T12:00:00`)

  const weekStart = useMemo(() => getStartOfWeek(selected), [selectedDate])

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      return d
    })
  }, [weekStart])

  const eventMap = useMemo(() => {
    const map: Record<string, number> = {}
    events.forEach((e) => {
      map[e.date] = (map[e.date] || 0) + 1
    })
    return map
  }, [events])

  function changeWeek(offset: number) {
    const newDate = new Date(weekStart)
    newDate.setDate(newDate.getDate() + offset * 7)
    onSelectDate(formatDate(newDate))
  }

  return (
    <div
      style={{
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        padding: 16,
        background: "white",
        display: "grid",
        gap: 16,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 900 }}>
          {formatHeader(selected)}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => changeWeek(-1)}
            style={navButton()}
          >
            ← Prev
          </button>

          <button
            onClick={() => onSelectDate(formatDate(new Date()))}
            style={navButton()}
          >
            Today
          </button>

          <button
            onClick={() => changeWeek(1)}
            style={navButton()}
          >
            Next →
          </button>
        </div>
      </div>

      {/* DAYS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 10,
        }}
      >
        {days.map((day) => {
          const key = formatDate(day)
          const isSelected = key === selectedDate
          const eventCount = eventMap[key] || 0

          return (
            <button
              key={key}
              onClick={() => onSelectDate(key)}
              style={{
                padding: 12,
                borderRadius: 16,
                border: isSelected
                  ? "2px solid #0f2c73"
                  : "1px solid #e2e8f0",
                background: isSelected ? "#eff6ff" : "#f8fafc",
                display: "grid",
                gap: 6,
                justifyItems: "center",
              }}
            >
              {/* DAY NAME */}
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>
                {day.toLocaleDateString("en-GB", { weekday: "short" })}
              </div>

              {/* DATE */}
              <div style={{ fontSize: 16, fontWeight: 900 }}>
                {day.getDate()}
              </div>

              {/* EVENTS */}
              {eventCount > 0 && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: "#1d4ed8",
                    background: "#dbeafe",
                    padding: "2px 6px",
                    borderRadius: 999,
                  }}
                >
                  {eventCount} event{eventCount > 1 ? "s" : ""}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function navButton() {
  return {
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    fontWeight: 800,
  }
}
