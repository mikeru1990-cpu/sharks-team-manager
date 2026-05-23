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

function StatTile({ label, value, tone = "#38bdf8" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div
      className="sharks-elite-panel sharks-card-shine"
      style={{
        padding: 16,
        border: `1px solid ${tone}44`,
        boxShadow: `0 16px 38px ${tone}14`,
      }}
    >
      <div style={{ color: "#aebed4", fontSize: 11, fontWeight: 1000, letterSpacing: ".13em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 8, fontSize: 34, fontWeight: 1000, lineHeight: 1, color: tone }}>{value}</div>
    </div>
  )
}

function attendanceButtonStyle(active: boolean, tone: "available" | "maybe" | "unavailable") {
  const color = tone === "available" ? "#22c55e" : tone === "maybe" ? "#f59e0b" : "#ef4444"
  return {
    background: active ? `${color}22` : "rgba(255,255,255,0.055)",
    border: active ? `1px solid ${color}99` : "1px solid rgba(148,163,184,0.20)",
    color: active ? color : "#cbd5e1",
    borderRadius: 999,
    padding: "9px 12px",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
    boxShadow: active ? `0 0 20px ${color}18` : "none",
  } as const
}

function EventCard({
  event,
  selected,
  activeMatch,
  onClick,
}: {
  event: EventWithPlan
  selected: boolean
  activeMatch: boolean
  onClick: () => void
}) {
  const status = getStatus(event.date)
  return (
    <button
      onClick={onClick}
      className="sharks-glass sharks-card-shine"
      style={{
        border: selected ? "1px solid rgba(125,211,252,0.72)" : "1px solid rgba(148,163,184,0.18)",
        background: selected ? "rgba(14,165,233,0.16)" : undefined,
        borderRadius: 22,
        padding: 15,
        textAlign: "left",
        display: "grid",
        gap: 9,
        cursor: "pointer",
        color: "white",
      }}
    >
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Badge tone={event.type === "match" ? "blue" : "green"}>{event.type.toUpperCase()}</Badge>
        <StatusBadge status={status} />
        <Badge>{formatPrettyDate(event.date)}</Badge>
        {event.startTime ? <Badge>{event.startTime}</Badge> : null}
        {activeMatch ? <Badge tone="blue">Active Match</Badge> : null}
      </div>
      <div style={{ fontWeight: 1000, fontSize: 19, lineHeight: 1.15 }}>{event.title}</div>
      <div style={{ color: "#aebed4", lineHeight: 1.45, fontWeight: 650 }}>{event.location || "Location not set"}</div>
      {event.opponent ? <div style={{ color: "#7dd3fc", fontWeight: 900 }}>vs {event.opponent}</div> : null}
    </button>
  )
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
    <div style={{ display: "grid", gap: 18 }}>
      <div className="sharks-elite-panel sharks-card-shine" style={{ padding: 22, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 16 }}>
          <SectionHeader
            title="Events Command"
            subtitle="Fixtures, training, attendance and matchday planning."
            light
            action={
              <div style={{ display: "flex", gap: 8, minWidth: 220 }}>
                {nextEvent ? <PrimaryButton onClick={() => setSelectedEventId(nextEvent.id)}>Open Next</PrimaryButton> : null}
                {isAdmin ? <SecondaryButton onClick={openAddCalendarEvent}>Add Event</SecondaryButton> : null}
              </div>
            }
          />

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))", gap: 12 }}>
            <StatTile label="Total" value={totalEvents} />
            <StatTile label="Upcoming" value={upcomingCount} tone="#22c55e" />
            <StatTile label="Today" value={todayCount} tone="#facc15" />
            <StatTile label="Training" value={trainingCount} tone="#a78bfa" />
            <StatTile label="Matches" value={matchCount} tone="#38bdf8" />
          </div>
        </div>
      </div>

      <PageCard>
        <SectionHeader title="Day Planner" subtitle="Choose a date, select the event and manage attendance." />
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10, alignItems: "center", marginBottom: 14 }}>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: 14, borderRadius: 16, border: "1px solid rgba(148,163,184,0.22)", fontSize: 16, width: "100%", boxSizing: "border-box", background: "rgba(2,6,23,0.58)", color: "white" }}
          />
          {isAdmin ? <div style={{ minWidth: 110 }}><SecondaryButton onClick={openAddCalendarEvent}>New</SecondaryButton></div> : null}
        </div>
        <div style={{ color: "#cbd5e1", fontWeight: 800 }}>{formatFullDate(selectedDate)}</div>
      </PageCard>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <PageCard>
          <SectionHeader title="Selected Day" subtitle="Events scheduled for this date." />
          {selectedDateEvents.length === 0 ? (
            <div style={{ color: "#aebed4" }}>No events on this date.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {selectedDateEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  selected={selectedEventId === event.id}
                  activeMatch={activeMatchEventId === event.id}
                  onClick={() => {
                    setSelectedEventId(event.id)
                    if (event.type === "match") setActiveMatchEventId(event.id)
                  }}
                />
              ))}
            </div>
          )}
        </PageCard>

        <PageCard>
          <SectionHeader title="Next Event" subtitle="Closest upcoming activity." />
          {!nextEvent ? (
            <div style={{ color: "#aebed4" }}>No next event yet.</div>
          ) : (
            <EventCard
              event={nextEvent}
              selected={selectedEventId === nextEvent.id}
              activeMatch={activeMatchEventId === nextEvent.id}
              onClick={() => setSelectedEventId(nextEvent.id)}
            />
          )}
        </PageCard>
      </div>

      {selectedEvent ? (
        <PageCard>
          <SectionHeader
            title="Selected Event Details"
            subtitle="Quick view for the currently selected event."
            action={isAdmin ? (
              <div style={{ display: "flex", gap: 8, minWidth: 220 }}>
                <SecondaryButton onClick={() => openEditCalendarEvent(selectedEvent)}>Edit</SecondaryButton>
                <SecondaryButton onClick={() => void deleteCalendarEvent(selectedEvent.id)}>Delete</SecondaryButton>
              </div>
            ) : undefined}
          />
          <EventCard
            event={selectedEvent}
            selected
            activeMatch={activeMatchEventId === selectedEvent.id}
            onClick={() => undefined}
          />
        </PageCard>
      ) : null}

      {selectedEvent ? (
        <PageCard>
          <SectionHeader title="Player Availability" subtitle={`Set availability for ${selectedEvent.title}.`} />
          {players.length === 0 ? (
            <div style={{ color: "#aebed4" }}>No players found.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {players.map((player) => {
                const currentStatus = getPlayerStatus(selectedEvent.id, player.id)
                return (
                  <div key={player.id} className="sharks-glass" style={{ borderRadius: 18, padding: 14, display: "grid", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 1000, fontSize: 16, color: "white" }}>{player.name}</div>
                      <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 3 }}>{player.positions?.join(" / ") || "Player"}</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {(["available", "maybe", "unavailable"] as const).map((status) => (
                        <button key={status} disabled={!isAdmin} onClick={() => void saveAttendance(selectedEvent.id, player.id, status)} style={attendanceButtonStyle(currentStatus === status, status)}>
                          {status === "available" ? "Available" : status === "maybe" ? "Maybe" : "Unavailable"}
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
          <div style={{ color: "#aebed4" }}>No events yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sorted.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                selected={selectedEventId === event.id}
                activeMatch={activeMatchEventId === event.id}
                onClick={() => {
                  setSelectedEventId(event.id)
                  if (event.type === "match") setActiveMatchEventId(event.id)
                }}
              />
            ))}
          </div>
        )}
      </PageCard>
    </div>
  )
}
