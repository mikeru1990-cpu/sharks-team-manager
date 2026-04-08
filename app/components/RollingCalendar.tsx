"use client"

import { useMemo, useState } from "react"
import type { EventItem } from "../lib/types"

type CalendarView = "week" | "month"

type Props = {
  selectedDate: string
  onSelectDate: (date: string) => void
  events: EventItem[]
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function toDateString(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function fromDateString(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day, 12, 0, 0)
}

function startOfWeek(date: Date) {
  const copy = new Date(date)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  return new Date(copy.getFullYear(), copy.getMonth(), copy.getDate(), 12, 0, 0)
}

function addDays(date: Date, amount: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return new Date(copy.getFullYear(), copy.getMonth(), copy.getDate(), 12, 0, 0)
}

function addMonths(date: Date, amount: number) {
  const copy = new Date(date)
  copy.setMonth(copy.getMonth() + amount)
  return new Date(copy.getFullYear(), copy.getMonth(), 1, 12, 0, 0)
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function sameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

function formatDisplayDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatMonthTitle(date: Date) {
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  })
}

function getMonthGrid(monthDate: Date) {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1, 12, 0, 0)
  const gridStart = startOfWeek(firstDay)

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index))
}

function getWeekDays(selected: Date) {
  const weekStart = startOfWeek(selected)
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
}

function eventCountByDate(events: EventItem[]) {
  const map: Record<string, number> = {}

  for (const event of events) {
    map[event.date] = (map[event.date] || 0) + 1
  }

  return map
}

function navButtonStyle() {
  return {
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#0f172a",
    borderRadius: 14,
    padding: "10px 14px",
    fontWeight: 800 as const,
  }
}

function viewButtonStyle(active: boolean) {
  return {
    border: active ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
    background: active ? "#dbeafe" : "white",
    color: active ? "#1e3a8a" : "#0f172a",
    borderRadius: 999,
    padding: "8px 12px",
    fontWeight: 800 as const,
  }
}

export default function RollingCalendar({
  selectedDate,
  onSelectDate,
  events,
}: Props) {
  const selected = useMemo(() => fromDateString(selectedDate), [selectedDate])
  const today = useMemo(() => fromDateString(toDateString(new Date())), [])

  const [view, setView] = useState<CalendarView>("week")
  const [cursorDate, setCursorDate] = useState<Date>(selected)

  const eventCounts = useMemo(() => eventCountByDate(events), [events])

  const weekDays = useMemo(() => getWeekDays(cursorDate), [cursorDate])
  const monthDays = useMemo(() => getMonthGrid(cursorDate), [cursorDate])

  const monthTitle = formatMonthTitle(cursorDate)

  function goToday() {
    const next = fromDateString(toDateString(new Date()))
    setCursorDate(next)
    onSelectDate(toDateString(next))
  }

  function goPrev() {
    setCursorDate((prev) => (view === "week" ? addDays(prev, -7) : addMonths(prev, -1)))
  }

  function goNext() {
    setCursorDate((prev) => (view === "week" ? addDays(prev, 7) : addMonths(prev, 1)))
  }

  function selectDate(date: Date) {
    const value = toDateString(date)
    setCursorDate(date)
    onSelectDate(value)
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>Calendar</div>
          <div style={{ color: "#64748b", marginTop: 4 }}>
            {view === "week" ? `Week of ${formatDisplayDate(startOfWeek(cursorDate))}` : monthTitle}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => setView("week")} style={viewButtonStyle(view === "week")}>
            Week
          </button>
          <button onClick={() => setView("month")} style={viewButtonStyle(view === "month")}>
            Month
          </button>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <button onClick={goPrev} style={navButtonStyle()}>
          ← Prev
        </button>
        <button onClick={goNext} style={navButtonStyle()}>
          Next →
        </button>
        <button onClick={goToday} style={navButtonStyle()}>
          Today
        </button>
      </div>

      {view === "week" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: 8,
          }}
        >
          {weekDays.map((date) => {
            const value = toDateString(date)
            const selectedDay = sameDay(date, selected)
            const isToday = sameDay(date, today)
            const count = eventCounts[value] || 0

            return (
              <button
                key={value}
                onClick={() => selectDate(date)}
                style={{
                  border: selectedDay
                    ? "2px solid #0f2c73"
                    : isToday
                    ? "2px solid #cbd5e1"
                    : "1px solid #e2e8f0",
                  background: selectedDay ? "#dbeafe" : "white",
                  borderRadius: 18,
                  padding: "12px 6px",
                  minHeight: 104,
                  display: "grid",
                  alignContent: "space-between",
                  textAlign: "center",
                }}
              >
                <div style={{ color: "#64748b", fontSize: 12, fontWeight: 800 }}>
                  {date.toLocaleDateString("en-GB", { weekday: "short" })}
                </div>

                <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>
                  {date.getDate()}
                </div>

                <div style={{ minHeight: 18 }}>
                  {count > 0 ? (
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 999,
                        padding: "4px 8px",
                        background: selectedDay ? "#bfdbfe" : "#eff6ff",
                        color: "#1d4ed8",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {count} event{count > 1 ? "s" : ""}
                    </div>
                  ) : isToday ? (
                    <div
                      style={{
                        color: "#94a3b8",
                        fontSize: 12,
                        fontWeight: 700,
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
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: 8,
            }}
          >
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                style={{
                  textAlign: "center",
                  color: "#64748b",
                  fontWeight: 800,
                  paddingBottom: 4,
                }}
              >
                {day}
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
            {monthDays.map((date) => {
              const value = toDateString(date)
              const selectedDay = sameDay(date, selected)
              const isToday = sameDay(date, today)
              const inCurrentMonth = sameMonth(date, cursorDate)
              const count = eventCounts[value] || 0

              return (
                <button
                  key={value}
                  onClick={() => selectDate(date)}
                  style={{
                    border: selectedDay
                      ? "2px solid #0f2c73"
                      : isToday
                      ? "2px solid #cbd5e1"
                      : "1px solid #e2e8f0",
                    background: selectedDay ? "#dbeafe" : "white",
                    borderRadius: 18,
                    padding: "10px 4px",
                    minHeight: 92,
                    display: "grid",
                    alignContent: "space-between",
                    justifyItems: "center",
                    opacity: inCurrentMonth ? 1 : 0.45,
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 900,
                      color: "#0f172a",
                    }}
                  >
                    {date.getDate()}
                  </div>

                  <div style={{ minHeight: 16 }}>
                    {count > 0 ? (
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 999,
                          padding: "3px 7px",
                          background: selectedDay ? "#bfdbfe" : "#eff6ff",
                          color: "#1d4ed8",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        {count}
                      </div>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div
        style={{
          padding: 14,
          borderRadius: 16,
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          textAlign: "center",
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        Selected: {formatDisplayDate(selected)}
      </div>
    </div>
  )
}
