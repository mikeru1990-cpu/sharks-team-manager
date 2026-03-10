"use client"

import { useMemo, useState } from "react"

type Position = "GK" | "DEF" | "MID" | "FWD"
type EventType = "MATCH" | "TRAINING" | "NO_GAME" | "HOLIDAY"
type AttendanceStatus = "P" | "R" | "NO" | "OFF"

type Player = {
  id: string
  name: string
  positions: Position[]
  mainGK?: boolean
  backupGK?: boolean
}

type EventItem = {
  id: string
  date: string
  day: string
  kickOff: string
  type: EventType
  title: string
  home?: string
  away?: string
  notes?: string
}

const STATUS_OPTIONS: AttendanceStatus[] = ["P", "R", "NO", "OFF"]

function statusColor(status: AttendanceStatus) {
  if (status === "P") return "#25d366"
  if (status === "R") return "#f7d046"
  if (status === "NO") return "#ff4d4f"
  return "#d9d9d9"
}

function eventTypeColor(type: EventType) {
  if (type === "MATCH") return "#1aff00"
  if (type === "TRAINING") return "#d9d9d9"
  if (type === "NO_GAME") return "#ff1a1a"
  return "#9acd50"
}

export default function Page() {
  const [players] = useState<Player[]>([
    { id: "1", name: "Bailee Dowler-Rowles", positions: ["DEF"], backupGK: true },
    { id: "2", name: "Bella Bainbridge", positions: ["MID"] },
    { id: "3", name: "Betsy Rowland", positions: ["MID", "DEF"], backupGK: true },
    { id: "4", name: "Connie Luff", positions: ["MID", "FWD"] },
    { id: "5", name: "Darcy-Rae Russell", positions: ["GK"], mainGK: true },
    { id: "6", name: "Ella Wilson", positions: ["MID", "DEF"] },
    { id: "7", name: "Elsy Harmer", positions: ["DEF"] },
    { id: "8", name: "Evelyn Evans", positions: ["MID", "DEF"] },
    { id: "9", name: "Isabella Ogden", positions: ["DEF", "MID"] },
    { id: "10", name: "Lyra Twinning", positions: ["MID", "FWD"] },
    { id: "11", name: "Martha Scrivens", positions: ["MID", "FWD"] },
    { id: "12", name: "Olivia Hassall", positions: ["DEF"] },
    { id: "13", name: "Poppy Bennett", positions: ["MID", "FWD"], backupGK: true },
    { id: "14", name: "Ruby Salter", positions: ["MID", "DEF"] },
  ])

  const [events] = useState<EventItem[]>([
    {
      id: "1",
      day: "Fri",
      date: "05-Dec",
      kickOff: "5:55",
      type: "TRAINING",
      title: "Training",
      home: "WYCLIFFE COLLEGE (SAND ASTRO)",
      away: "",
    },
    {
      id: "2",
      day: "Sun",
      date: "07-Dec",
      kickOff: "10:00",
      type: "MATCH",
      title: "U10 League Cup",
      home: "Leonard Stanley Sharks Youth U10 Lioness",
      away: "Charlton Rovers Youth U10 Lionesses",
    },
    {
      id: "3",
      day: "Fri",
      date: "12-Dec",
      kickOff: "5:55",
      type: "TRAINING",
      title: "Training",
      home: "WYCLIFFE COLLEGE (SAND ASTRO)",
      away: "",
    },
    {
      id: "4",
      day: "Sun",
      date: "14-Dec",
      kickOff: "10:00",
      type: "MATCH",
      title: "U10 League Cup",
      home: "Tewkesbury Town Colts Youth U10",
      away: "Leonard Stanley Sharks Youth U10 Lioness",
    },
    {
      id: "5",
      day: "Sun",
      date: "21-Dec",
      kickOff: "N/A",
      type: "NO_GAME",
      title: "No Game",
      home: "N/A",
      away: "N/A",
    },
    {
      id: "6",
      day: "Fri",
      date: "26-Dec",
      kickOff: "N/A",
      type: "HOLIDAY",
      title: "No Training Xmas break",
      notes: "Christmas break",
    },
    {
      id: "7",
      day: "Sun",
      date: "04-Jan",
      kickOff: "N/A",
      type: "NO_GAME",
      title: "No Game",
      home: "N/A",
      away: "N/A",
    },
    {
      id: "8",
      day: "Fri",
      date: "09-Jan",
      kickOff: "5:55",
      type: "TRAINING",
      title: "Training",
      home: "WYCLIFFE COLLEGE (SAND ASTRO)",
      away: "",
    },
    {
      id: "9",
      day: "Sun",
      date: "11-Jan",
      kickOff: "10:00",
      type: "MATCH",
      title: "U10 League Cup",
      home: "FC Lakeside Youth U10",
      away: "Leonard Stanley Sharks Youth U10 Lioness",
    },
  ])

  const [attendance, setAttendance] = useState<Record<string, Record<string, AttendanceStatus>>>(
    {
      "1": {
        "1": "P", "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "P",
        "8": "P", "9": "P", "10": "P", "11": "P", "12": "P", "13": "P", "14": "P",
      },
      "2": {
        "1": "P", "2": "R", "3": "P", "4": "P", "5": "P", "6": "R", "7": "P",
        "8": "P", "9": "P", "10": "P", "11": "P", "12": "R", "13": "P", "14": "P",
      },
    }
  )

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0].id)

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0]

  function getStatus(eventId: string, playerId: string): AttendanceStatus {
    return attendance[eventId]?.[playerId] || "OFF"
  }

  function setStatus(eventId: string, playerId: string, status: AttendanceStatus) {
    setAttendance((prev) => ({
      ...prev,
      [eventId]: {
        ...(prev[eventId] || {}),
        [playerId]: status,
      },
    }))
  }

  function cycleStatus(eventId: string, playerId: string) {
    const current = getStatus(eventId, playerId)
    const currentIndex = STATUS_OPTIONS.indexOf(current)
    const next = STATUS_OPTIONS[(currentIndex + 1) % STATUS_OPTIONS.length]
    setStatus(eventId, playerId, next)
  }

  const selectedEventStatuses = attendance[selectedEvent.id] || {}

  const headCount = useMemo(() => {
    return players.filter((p) => getStatus(selectedEvent.id, p.id) === "P").length
  }, [players, attendance, selectedEvent.id])

  const reserveCount = useMemo(() => {
    return players.filter((p) => getStatus(selectedEvent.id, p.id) === "R").length
  }, [players, attendance, selectedEvent.id])

  const unavailableCount = useMemo(() => {
    return players.filter((p) => getStatus(selectedEvent.id, p.id) === "NO").length
  }, [players, attendance, selectedEvent.id])

  const playingThisWeek = useMemo(() => {
    if (selectedEvent.type !== "MATCH") return 0
    return players.filter((p) => {
      const s = getStatus(selectedEvent.id, p.id)
      return s === "P" || s === "R"
    }).length
  }, [players, attendance, selectedEvent.id, selectedEvent.type])

  const seasonTotals = useMemo(() => {
    const totals: Record<string, { P: number; R: number; NO: number; OFF: number }> = {}

    players.forEach((player) => {
      totals[player.id] = { P: 0, R: 0, NO: 0, OFF: 0 }
      events.forEach((event) => {
        const s = getStatus(event.id, player.id)
        totals[player.id][s] += 1
      })
    })

    return totals
  }, [players, events, attendance])

  return (
    <main
      style={{
        padding: 20,
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Sharks Team Manager</h1>

      <h2 style={{ marginTop: 20 }}>Schedule</h2>

      <div style={{ display: "grid", gap: 10 }}>
        {events.map((event) => {
          const isSelected = selectedEventId === event.id
          return (
            <button
              key={event.id}
              onClick={() => setSelectedEventId(event.id)}
              style={{
                textAlign: "left",
                padding: 14,
                borderRadius: 12,
                border: isSelected ? "3px solid #111" : "1px solid #ddd",
                background: "white",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: 8,
                  background: eventTypeColor(event.type),
                  marginBottom: 8,
                  fontWeight: 700,
                }}
              >
                {event.type.replace("_", " ")}
              </div>

              <div style={{ fontWeight: 700 }}>
                {event.day} {event.date} • {event.kickOff}
              </div>

              <div style={{ marginTop: 4 }}>{event.title}</div>

              {event.type === "MATCH" && (
                <div style={{ marginTop: 4, color: "#333" }}>
                  {event.home} vs {event.away}
                </div>
              )}

              {event.type === "TRAINING" && (
                <div style={{ marginTop: 4, color: "#333" }}>
                  {event.home}
                </div>
              )}

              {event.notes && (
                <div style={{ marginTop: 4, color: "#333" }}>{event.notes}</div>
              )}
            </button>
          )
        })}
      </div>

      <h2 style={{ marginTop: 30 }}>Attendance</h2>

      <div
        style={{
          padding: 16,
          borderRadius: 12,
          background: "#f5f5f5",
          marginBottom: 20,
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>
          {selectedEvent.day} {selectedEvent.date} • {selectedEvent.kickOff}
        </div>
        <div style={{ marginBottom: 6 }}>{selectedEvent.title}</div>

        {selectedEvent.type === "MATCH" && (
          <div style={{ marginBottom: 10 }}>
            {selectedEvent.home} vs {selectedEvent.away}
          </div>
        )}

        {selectedEvent.type === "TRAINING" && (
          <div style={{ marginBottom: 10 }}>{selectedEvent.home}</div>
        )}

        {selectedEvent.notes && <div style={{ marginBottom: 10 }}>{selectedEvent.notes}</div>}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <div><strong>Head Count:</strong> {headCount}</div>
          <div><strong>Reserve:</strong> {reserveCount}</div>
          <div><strong>Unavailable:</strong> {unavailableCount}</div>
          <div><strong>Playing This Week:</strong> {playingThisWeek}</div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {players.map((player) => {
          const status = getStatus(selectedEvent.id, player.id)
          return (
            <div
              key={player.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 10,
                background: "white",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{player.name}</div>
                <div style={{ color: "#555" }}>{player.positions.join("/")}</div>
              </div>

              <button
                onClick={() => cycleStatus(selectedEvent.id, player.id)}
                style={{
                  minWidth: 72,
                  padding: "10px 14px",
                  borderRadius: 999,
                  border: "1px solid #ccc",
                  background: statusColor(status),
                  fontWeight: 700,
                }}
              >
                {status}
              </button>
            </div>
          )
        })}
      </div>

      <h2 style={{ marginTop: 30 }}>Season Summary</h2>

      <div style={{ display: "grid", gap: 8 }}>
        {players.map((player) => {
          const totals = seasonTotals[player.id]
          return (
            <div
              key={player.id}
              style={{
                padding: 12,
                border: "1px solid #ddd",
                borderRadius: 10,
                background: "white",
              }}
            >
              <div style={{ fontWeight: 700 }}>{player.name}</div>
              <div style={{ color: "#555", marginTop: 4 }}>
                P: {totals.P} • R: {totals.R} • NO: {totals.NO} • OFF: {totals.OFF}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
