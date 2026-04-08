"use client"

import { useMemo } from "react"

type CalendarEvent = {
  date: string
  type?: "training" | "match" | "other" | string
}

type Props = {
  selectedDate: string
  onSelectDate: (date: string) => void
  events: CalendarEvent[]
}

function getStartOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay() || 7
  if (day !== 1) d.setDate(d.getDate() - (day - 1))
  d.setHours(12, 0, 0, 0)
  return d
}

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function formatHeaderRange(weekStart: Date) {
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 6)

  const sameMonth = weekStart.getMonth() === weekEnd.getMonth()
  const sameYear = weekStart.getFullYear() === weekEnd.getFullYear()

  if (sameMonth && sameYear) {
    return `${weekStart.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    })}`
  }

  return `${weekStart.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  })} – ${weekEnd.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  })}`
}

function formatSelectedLabel(date: Date) {
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function dayShort(date: Date) {
  return date.toLocaleDateString("en-GB", { weekday: "short" })
}

function getEventMeta(events: CalendarEvent[]) {
  const byDate: Record<
    string,
    {
      count: number
      hasMatch: boolean
      hasTraining: boolean
      hasOther: boolean
    }
  > = {}

  for (const event of events) {
    if (!byDate[event.date]) {
      byDate[event.date] = {
        count: 0,
        hasMatch: false,
        hasTraining: false,
        hasOther: false,
      }
    }

    byDate[event.date].count += 1

    if (event.type === "match") byDate[event.date].hasMatch = true
    else if (event.type === "training") byDate[event.date].hasTraining = true
    else byDate[event.date].hasOther = true
  }

  return byDate
}

function navButtonStyle() {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #dbe3ef",
    background: "white",
    color: "#0f172a",
    fontWeight: 800 as const,
    fontSize: 14,
  }
}

function miniDot(color: string) {
  return (
    <span
      style={{
        width: 7,
        height: 7,
        borderRadius: 999,
        background: color,
        display: "inline-block",
      }}
    />
  )
}

export default function RollingCalendar({
  selectedDate,
  onSelectDate,
  events,
}: Props) {
  const selected = useMemo(() => new Date(`${selectedDate}T12:00:00`), [selectedDate])
  const today = useMemo(() => new Date(new Date().toDateString()), [])

  const weekStart = useMemo(() => getStartOfWeek(selected), [selected])

  const days = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(weekStart)
      d.setDate(d.getDate() + i)
      d.setHours(12, 0, 0, 0)
      return d
    })
  }, [weekStart])

  const eventMeta = useMemo(() => getEventMeta(events), [events])

  function changeWeek(offset: number) {
    const newDate = new Date(weekStart)
    newDate.setDate(newDate.getDate() + offset * 7)
    onSelectDate(formatDate(newDate))
  }

  function goToday() {
    const now = new Date()
    now.setHours(12, 0, 0, 0)
    onSelectDate(formatDate(now))
  }

  return (
    <div
      style={{
        borderRadius: 22,
        border: "1px solid #e2e8f0",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
        padding: 16,
        display: "grid",
        gap: 16,
        boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 0.3,
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            Weekly Planner
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>
            {formatHeaderRange(weekStart)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => changeWeek(-1)} style={navButtonStyle()}>
            ← Prev
          </button>
          <button onClick={goToday} style={navButtonStyle()}>
            Today
          </button>
          <button onClick={() => changeWeek(1)} style={navButtonStyle()}>
            Next →
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 10,
        }}
      >
        {days.map((day) => {
          const key = formatDate(day)
          const isSelected = key === selectedDate
          const isToday = isSameDay(day, today)
          const meta = eventMeta[key] || {
            count: 0,
            hasMatch: false,
            hasTraining: false,
            hasOther: false,
          }

          return (
            <button
              key={key}
              onClick={() => onSelectDate(key)}
              style={{
                padding: "12px 6px",
                borderRadius: 18,
                border: isSelected
                  ? "2px solid #0f2c73"
                  : isToday
                  ? "1px solid #93c5fd"
                  : "1px solid #e2e8f0",
                background: isSelected
                  ? "linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%)"
                  : isToday
                  ? "#f8fbff"
                  : "white",
                minHeight: 118,
                display: "grid",
                alignContent: "space-between",
                justifyItems: "center",
                boxShadow: isSelected
                  ? "0 6px 16px rgba(29, 78, 216, 0.12)"
                  : "0 1px 3px rgba(15, 23, 42, 0.04)",
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  color: isSelected ? "#1d4ed8" : "#64748b",
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                {dayShort(day)}
              </div>

              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  background: isSelected
                    ? "#1d4ed8"
                    : isToday
                    ? "#eff6ff"
                    : "transparent",
                  color: isSelected ? "white" : "#0f172a",
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                {day.getDate()}
              </div>

              <div
                style={{
                  minHeight: 24,
                  display: "grid",
                  justifyItems: "center",
                  gap: 6,
                }}
              >
                {(meta.hasMatch || meta.hasTraining || meta.hasOther) && (
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    {meta.hasMatch && miniDot("#1d4ed8")}
                    {meta.hasTraining && miniDot("#059669")}
                    {meta.hasOther && miniDot("#64748b")}
                  </div>
                )}

                {meta.count > 0 ? (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: isSelected ? "#1e3a8a" : "#1d4ed8",
                      background: isSelected ? "#bfdbfe" : "#eff6ff",
                      padding: "3px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {meta.count} event{meta.count > 1 ? "s" : ""}
                  </div>
                ) : isToday ? (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 800,
                      color: "#64748b",
                    }}
                  >
                    Today
                  </div>
                ) : null}
              </div>
            </button>
          )
        })}
      </div>

      <div
        style={{
          padding: 14,
          borderRadius: 16,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#64748b", textTransform: "uppercase" }}>
            Selected Day
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: "#0f172a", marginTop: 4 }}>
            {formatSelectedLabel(selected)}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", color: "#64748b", fontSize: 13 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {miniDot("#1d4ed8")} <span>Match</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {miniDot("#059669")} <span>Training</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {miniDot("#64748b")} <span>Other</span>
          </div>
        </div>
      </div>
    </div>
  )
}
