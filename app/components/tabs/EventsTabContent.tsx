"use client"

import { useMemo } from "react"
import { PageCard, SectionHeader, Badge, PrimaryButton, SecondaryButton } from "../ui"
import type { EventWithPlan } from "../../lib/dashboardTypes"

type Props = {
  isAdmin: boolean
  selectedDate: string
  setSelectedDate: (value: string) => void
  events: EventWithPlan[]
  selectedDateEvents: EventWithPlan[]
  selectedEvent: EventWithPlan | null
  selectedEventId: string | null
  setSelectedEventId: (value: string | null) => void
  activeMatchEventId: string | null
  setActiveMatchEventId: (value: string | null) => void
  players: any[]
  attendance: any[]
  allTrainingPlans: any[]
  selectedTemplateId: string
  setSelectedTemplateId: (value: string) => void
  trainingPlan: any
  setTrainingPlan: (value: any) => void
  selectedDbTrainingPlanId: string
  setSelectedDbTrainingPlanId: (value: string) => void
  activeSession: any
  setActiveSession: (value: any) => void
  sessionHistory: any[]
  formatFullDate: (date: string) => string
  statusStyle: (status: string, active?: boolean) => any
  countAttendance: (eventId: string, status: string) => number
  getPlayerStatus: (eventId: string, playerId: string) => string
  loadTrainingPlanFromEvent: (event: EventWithPlan) => Promise<void> | void
  persistSettings: (patch?: Partial<{ selectedDate: string; activeMatchEventId: string | null }>) => Promise<void>
  saveAttendance: (eventId: string, playerId: string, status: string) => Promise<void>
  saveTrainingPlans: () => Promise<void>
  saveSessionRecord: () => Promise<void>
  openAddCalendarEvent: () => void
  openEditCalendarEvent: (event: EventWithPlan) => void
  deleteCalendarEvent: (id: string) => Promise<void>
}

function getStatus(date: string) {
  const today = new Date().toISOString().split("T")[0]
  if (date < today) return "done"
  if (date === today) return "today"
  return "upcoming"
}

function formatPrettyDate(date: string) {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
  } catch {
    return date
  }
}

function StatusBadge({ status }: { status: string }) {
  if (status === "done") return <Badge tone="default">DONE</Badge>
  if (status === "today") return <Badge tone="yellow">TODAY</Badge>
  return <Badge tone="green">UPCOMING</Badge>
}

function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string | number
  tone?: "default" | "blue" | "green" | "yellow"
}) {
  const style =
    tone === "blue"
      ? { background: "#dbeafe", border: "1px solid #bfdbfe", color: "#1d4ed8" }
      : tone === "green"
      ? { background: "#dcfce7", border: "1px solid #86efac", color: "#166534" }
      : tone === "yellow"
      ? { background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e" }
      : { background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155" }

  return (
    <div style={{ ...style, borderRadius: 20, padding: 16, display: "grid", gap: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.05 }}>{value}</div>
    </div>
  )
}

function attendanceButtonStyle(active: boolean, tone: "available" | "maybe" | "unavailable") {
  const activeStyles =
    tone === "available"
      ? { background: "#dcfce7", border: "1px solid #86efac", color: "#166534" }
      : tone === "maybe"
      ? { background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e" }
      : { background: "#fee2e2", border: "1px solid #fecaca", color: "#991b1b" }

  return {
    ...(active
      ? activeStyles
      : { background: "white", border: "1px solid #cbd5e1", color: "#334155" }),
    borderRadius: 999,
    padding: "9px 12px",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
  } as const
}

export default function EventsTabContent({
  isAdmin,
  selectedDate,
  setSelectedDate,
  events,
  selectedDateEvents,
  selectedEvent,
  selectedEventId,
  setSelectedEventId,
  activeMatchEventId,
  setActiveMatchEventId,
  players,
  formatFullDate,
  countAttendance,
  getPlayerStatus,
  saveAttendance,
  openAddCalendarEvent,
  openEditCalendarEvent,
  deleteCalendarEvent,
}: Props) {
  const sorted = useMemo(() => {
    return [...events].sort((a, b) => {
      const d = a.date.localeCompare(b.date)
      if (d !== 0) return d
      return (a.startTime || "").localeCompare(b.startTime || "")
    })
  }, [events])

  const today = new Date().toISOString().split("T")[0]
  const nextEvent = sorted.find((event) => event.date >= today) || sorted[0] || null

  const totalEvents = sorted.length
  const upcomingCount = sorted.filter((event) => event.date > today).length
  const todayCount = sorted.filter((event) => event.date === today).length
  const trainingCount = sorted.filter((event) => event.type === "training").length
  const matchCount = sorted.filter((event) => event.type === "match").length

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <PageCard tone="blue">
        <SectionHeader
          title="Events"
          subtitle="Training, fixtures, attendance and planning."
          light
          action={
            <div style={{ display: "flex", gap: 8, minWidth: 220 }}>
              {nextEvent ? (
                <PrimaryButton onClick={() => setSelectedEventId(nextEvent.id)}>
                  Open Next
                </PrimaryButton>
              ) : null}
              {isAdmin ? (
                <SecondaryButton onClick={openAddCalendarEvent}>Add Event</SecondaryButton>
              ) : null}
            </div>
          }
        />
      </PageCard>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <StatTile label="Total Events" value={totalEvents} tone="blue" />
        <StatTile label="Upcoming" value={upcomingCount} tone="green" />
        <StatTile label="Today" value={todayCount} tone="yellow" />
        <StatTile label="Training" value={trainingCount} />
        <StatTile label="Matches" value={matchCount} />
      </div>

      <PageCard>
        <SectionHeader title="Day Planner" subtitle="Choose a day to view events and attendance." />

        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10, alignItems: "center", marginBottom: 14 }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              width: "100%",
              boxSizing: "border-box",
              background: "white",
            }}
          />
          {isAdmin ? (
            <div style={{ minWidth: 110 }}>
              <SecondaryButton onClick={openAddCalendarEvent}>New</SecondaryButton>
            </div>
          ) : null}
        </div>

        <div style={{ color: "#475569", fontWeight: 700 }}>{formatFullDate(selectedDate)}</div>
      </PageCard>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 16 }}>
        <PageCard>
          <SectionHeader title="Selected Day Events" subtitle="Everything scheduled for the chosen date." />

          {selectedDateEvents.length === 0 ? (
            <div style={{ color: "#64748b" }}>No events on this date.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {selectedDateEvents.map((event) => {
                const status = getStatus(event.date)
                const isSelected = selectedEventId === event.id

                return (
                  <button
                    key={event.id}
                    onClick={() => {
                      setSelectedEventId(event.id)
                      if (event.type === "match") setActiveMatchEventId(event.id)
                    }}
                    style={{
                      border: isSelected ? "2px solid #1e3a8a" : "1px solid #e2e8f0",
                      background: isSelected ? "#eff6ff" : "white",
                      borderRadius: 18,
                      padding: 14,
                      textAlign: "left",
                      display: "grid",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge tone={event.type === "match" ? "blue" : "green"}>
                        {event.type.toUpperCase()}
                      </Badge>
                      <StatusBadge status={status} />
                      {event.startTime ? <Badge>{event.startTime}</Badge> : null}
                      {activeMatchEventId === event.id ? <Badge tone="blue">Active Match</Badge> : null}
                    </div>

                    <div style={{ fontWeight: 900, fontSize: 18 }}>{event.title}</div>

                    <div style={{ color: "#475569", lineHeight: 1.45 }}>
                      {event.location || "Location not set"}
                    </div>

                    {event.opponent ? (
                      <div style={{ color: "#1d4ed8", fontWeight: 800 }}>vs {event.opponent}</div>
                    ) : null}

                    {(event.type === "training" || event.type === "match") && (
                      <div style={{ color: "#64748b", fontSize: 13 }}>
                        Available: {countAttendance(event.id, "available")} • Maybe:{" "}
                        {countAttendance(event.id, "maybe")} • Unavailable:{" "}
                        {countAttendance(event.id, "unavailable")}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </PageCard>

        <PageCard>
          <SectionHeader title="Next Event" subtitle="Closest upcoming activity." />

          {!nextEvent ? (
            <div style={{ color: "#64748b" }}>No next event yet.</div>
          ) : (
            <div style={{ border: "1px solid #dbeafe", background: "#f8fbff", borderRadius: 18, padding: 16, display: "grid", gap: 10 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge tone={nextEvent.type === "match" ? "blue" : "green"}>{nextEvent.type}</Badge>
                <StatusBadge status={getStatus(nextEvent.date)} />
                <Badge>{formatPrettyDate(nextEvent.date)}</Badge>
                {nextEvent.startTime ? <Badge>{nextEvent.startTime}</Badge> : null}
              </div>

              <div style={{ fontSize: 20, fontWeight: 900 }}>{nextEvent.title}</div>
              <div style={{ color: "#475569" }}>{nextEvent.location || "Location not set"}</div>

              {nextEvent.opponent ? (
                <div style={{ color: "#1d4ed8", fontWeight: 800 }}>vs {nextEvent.opponent}</div>
              ) : null}
            </div>
          )}
        </PageCard>
      </div>

      {selectedEvent ? (
        <PageCard>
          <SectionHeader
            title="Selected Event Details"
            subtitle="Quick view for the currently selected event."
            action={
              isAdmin ? (
                <div style={{ display: "flex", gap: 8, minWidth: 220 }}>
                  <SecondaryButton onClick={() => openEditCalendarEvent(selectedEvent)}>
                    Edit
                  </SecondaryButton>
                  <SecondaryButton onClick={() => void deleteCalendarEvent(selectedEvent.id)}>
                    Delete
                  </SecondaryButton>
                </div>
              ) : undefined
            }
          />

          <div style={{ border: "1px solid #e2e8f0", background: "white", borderRadius: 20, padding: 16, display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge tone={selectedEvent.type === "match" ? "blue" : "green"}>
                {selectedEvent.type.toUpperCase()}
              </Badge>
              <StatusBadge status={getStatus(selectedEvent.date)} />
              <Badge>{formatPrettyDate(selectedEvent.date)}</Badge>
              {selectedEvent.startTime ? <Badge>{selectedEvent.startTime}</Badge> : null}
            </div>

            <div style={{ fontSize: 22, fontWeight: 900 }}>{selectedEvent.title}</div>
            {selectedEvent.location ? <div style={{ color: "#475569" }}>{selectedEvent.location}</div> : null}
            {selectedEvent.opponent ? <div style={{ color: "#1d4ed8", fontWeight: 800 }}>vs {selectedEvent.opponent}</div> : null}
            {selectedEvent.notes ? <div style={{ color: "#64748b", lineHeight: 1.5 }}>{selectedEvent.notes}</div> : null}
          </div>
        </PageCard>
      ) : null}

      {selectedEvent ? (
        <PageCard>
          <SectionHeader
            title="Player Availability"
            subtitle={`Set availability for ${selectedEvent.title}.`}
          />

          {players.length === 0 ? (
            <div style={{ color: "#64748b" }}>No players found.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {players.map((player) => {
                const currentStatus = getPlayerStatus(selectedEvent.id, player.id)

                return (
                  <div
                    key={player.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 18,
                      padding: 14,
                      background: "white",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>{player.name}</div>
                      <div style={{ color: "#64748b", fontSize: 13, marginTop: 3 }}>
                        {player.positions?.join(" / ") || "Player"}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {(["available", "maybe", "unavailable"] as const).map((status) => (
                        <button
                          key={status}
                          disabled={!isAdmin}
                          onClick={() => void saveAttendance(selectedEvent.id, player.id, status)}
                          style={attendanceButtonStyle(currentStatus === status, status)}
                        >
                          {status === "available"
                            ? "Available"
                            : status === "maybe"
                            ? "Maybe"
                            : "Unavailable"}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </PageCard>
      ) : null}

      <PageCard>
        <SectionHeader title="All Events" subtitle="Full event list in date order." />

        {sorted.length === 0 ? (
          <div style={{ color: "#64748b" }}>No events yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sorted.map((event) => {
              const status = getStatus(event.date)
              const isSelected = selectedEventId === event.id

              return (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedEventId(event.id)
                    if (event.type === "match") setActiveMatchEventId(event.id)
                  }}
                  style={{
                    border: isSelected ? "2px solid #1e3a8a" : "1px solid #e2e8f0",
                    background: isSelected ? "#eff6ff" : "white",
                    borderRadius: 20,
                    padding: 16,
                    cursor: "pointer",
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge tone={event.type === "match" ? "blue" : "green"}>
                        {event.type === "match" ? "Match" : "Training"}
                      </Badge>
                      <StatusBadge status={status} />
                      <Badge>{formatPrettyDate(event.date)}</Badge>
                      {event.startTime ? <Badge>{event.startTime}</Badge> : null}
                    </div>

                    {isSelected ? <Badge tone="blue">Selected</Badge> : null}
                  </div>

                  <div style={{ fontSize: 18, fontWeight: 900 }}>{event.title}</div>
                  <div style={{ color: "#64748b" }}>{event.location || "Location not set"}</div>

                  {event.type === "match" && event.opponent ? (
                    <div style={{ fontWeight: 800, color: "#1e3a8a" }}>vs {event.opponent}</div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </PageCard>
    </div>
  )
}
