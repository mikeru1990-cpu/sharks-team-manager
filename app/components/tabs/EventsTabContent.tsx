"use client"

import { useMemo } from "react"
import { THEME } from "../../lib/theme"
import { Badge, PageCard, PrimaryButton, SecondaryButton, SectionHeader } from "../ui"
import type { EventWithPlan } from "../../lib/dashboardTypes"
import type { AttendanceStatus, Player } from "../../lib/types"

type Props = {
  isAdmin: boolean
  selectedDate: string
  setSelectedDate: (date: string) => void

  events: EventWithPlan[]
  selectedDateEvents: EventWithPlan[]
  selectedEvent: EventWithPlan | null
  selectedEventId: string | null
  setSelectedEventId: (value: string | null) => void

  activeMatchEventId: string | null
  setActiveMatchEventId: (value: string | null) => void

  players: Player[]
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
  statusStyle: (status: AttendanceStatus) => any
  countAttendance: (eventId: string, status: AttendanceStatus) => number
  getPlayerStatus: (eventId: string, playerId: string) => AttendanceStatus | null
  loadTrainingPlanFromEvent: (event: EventWithPlan) => void

  persistSettings: (patch?: Partial<{ selectedDate: string; activeMatchEventId: string | null }>) => Promise<void>
  saveAttendance: (eventId: string, playerId: string, status: AttendanceStatus) => Promise<void>
  saveTrainingPlans: (nextPlans: any[]) => Promise<void>
  saveSessionRecord: (record: any) => Promise<void>

  openAddCalendarEvent: () => void
  openEditCalendarEvent: (event: EventWithPlan) => void
  deleteCalendarEvent: (id: string) => Promise<void>
}

function getEventStatus(date: string) {
  const today = new Date().toISOString().split("T")[0]
  if (date < today) return "done"
  if (date === today) return "today"
  return "upcoming"
}

function statusTone(status: "done" | "today" | "upcoming"): "default" | "yellow" | "green" {
  if (status === "today") return "yellow"
  if (status === "upcoming") return "green"
  return "default"
}

function eventTypeTone(type: string): "default" | "blue" | "green" | "yellow" {
  if (type === "match") return "blue"
  if (type === "training") return "green"
  return "yellow"
}

function EventStat({
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
      ? {
          background: "#dbeafe",
          color: "#1d4ed8",
          border: "1px solid #bfdbfe",
        }
      : tone === "green"
      ? {
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #86efac",
        }
      : tone === "yellow"
      ? {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fcd34d",
        }
      : {
          background: "#f8fafc",
          color: "#334155",
          border: "1px solid #e2e8f0",
        }

  return (
    <div
      style={{
        ...style,
        borderRadius: 18,
        padding: 14,
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function EmptyState({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px dashed #cbd5e1",
        background: "#f8fafc",
        padding: 18,
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontWeight: 800, color: THEME.colors.textPrimary }}>{title}</div>
      <div style={{ color: THEME.colors.textSecondary, fontSize: 14 }}>{subtitle}</div>
    </div>
  )
}

function formatInputDate(date: string) {
  return date
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
  countAttendance,
  getPlayerStatus,
  loadTrainingPlanFromEvent,
  persistSettings,
  saveAttendance,
  openAddCalendarEvent,
  openEditCalendarEvent,
  deleteCalendarEvent,
  formatFullDate,
}: Props) {
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const d = a.date.localeCompare(b.date)
      if (d !== 0) return d
      const t = (a.startTime || "").localeCompare(b.startTime || "")
      if (t !== 0) return t
      return a.title.localeCompare(b.title)
    })
  }, [events])

  const upcomingCount = sortedEvents.filter((event) => event.date >= selectedDate).length
  const trainingCount = sortedEvents.filter((event) => event.type === "training").length
  const matchCount = sortedEvents.filter((event) => event.type === "match").length

  const nextEvent =
    sortedEvents.find((event) => event.date >= selectedDate) || sortedEvents[0] || null

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard tone="blue">
        <SectionHeader
          title="Events"
          subtitle="Training, fixtures, attendance and planning."
          light
          action={
            isAdmin ? (
              <div style={{ minWidth: 140 }}>
                <PrimaryButton onClick={openAddCalendarEvent}>Add Event</PrimaryButton>
              </div>
            ) : undefined
          }
        />
      </PageCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        <EventStat label="Total Events" value={events.length} tone="blue" />
        <EventStat label="Upcoming" value={upcomingCount} tone="green" />
        <EventStat label="Training" value={trainingCount} tone="yellow" />
        <EventStat label="Matches" value={matchCount} />
      </div>

      <PageCard>
        <SectionHeader
          title="Day Planner"
          subtitle="Choose a day to view events and attendance."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: 10,
            alignItems: "center",
          }}
        >
          <input
            type="date"
            value={formatInputDate(selectedDate)}
            onChange={(e) => {
              const value = e.target.value
              setSelectedDate(value)
              void persistSettings({ selectedDate: value })
            }}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 14,
              borderRadius: 16,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              background: "white",
            }}
          />

          {isAdmin ? (
            <div style={{ minWidth: 120 }}>
              <SecondaryButton onClick={openAddCalendarEvent}>New</SecondaryButton>
            </div>
          ) : null}
        </div>

        <div style={{ marginTop: 12, color: THEME.colors.textSecondary }}>
          {formatFullDate(selectedDate)}
        </div>
      </PageCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.05fr) minmax(0, 0.95fr)",
          gap: 16,
        }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader
              title="Selected Day Events"
              subtitle="Everything scheduled for the chosen date."
            />

            {selectedDateEvents.length === 0 ? (
              <EmptyState
                title="No events on this day"
                subtitle="Create a training or match to start planning."
              />
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {selectedDateEvents.map((event) => {
                  const isSelected = selectedEventId === event.id
                  const status = getEventStatus(event.date)

                  return (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEventId(event.id)
                        if (event.type === "match") {
                          setActiveMatchEventId(event.id)
                          void persistSettings({ activeMatchEventId: event.id })
                        }
                      }}
                      style={{
                        border: isSelected ? `2px solid ${THEME.colors.primary}` : "1px solid #e2e8f0",
                        background: isSelected ? "#eff6ff" : "white",
                        borderRadius: 18,
                        padding: 14,
                        display: "grid",
                        gap: 8,
                        cursor: "pointer",
                        boxShadow: isSelected ? "0 8px 20px rgba(30,58,138,0.08)" : "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          flexWrap: "wrap",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <Badge tone={eventTypeTone(event.type)}>
                            {event.type.toUpperCase()}
                          </Badge>
                          <Badge tone={statusTone(status)}>{status.toUpperCase()}</Badge>
                          {event.startTime ? <Badge>{event.startTime}</Badge> : null}
                        </div>

                        {event.id === activeMatchEventId ? (
                          <Badge tone="blue">Active Match</Badge>
                        ) : null}
                      </div>

                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 18,
                          color: THEME.colors.textPrimary,
                        }}
                      >
                        {event.title}
                      </div>

                      <div style={{ color: THEME.colors.textSecondary, fontSize: 14 }}>
                        {event.location ? event.location : "Location not set"}
                      </div>

                      {event.opponent ? (
                        <div style={{ color: "#1d4ed8", fontWeight: 800, fontSize: 14 }}>
                          vs {event.opponent}
                        </div>
                      ) : null}

                      {isAdmin ? (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                          <SecondaryButton onClick={() => openEditCalendarEvent(event)}>
                            Edit
                          </SecondaryButton>
                          <SecondaryButton
                            onClick={() => {
                              const ok = window.confirm("Delete this event?")
                              if (!ok) return
                              void deleteCalendarEvent(event.id)
                            }}
                          >
                            Delete
                          </SecondaryButton>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </PageCard>

          <PageCard>
            <SectionHeader
              title="All Events"
              subtitle="Season schedule overview."
            />

            {sortedEvents.length === 0 ? (
              <EmptyState
                title="No events created yet"
                subtitle="Your full schedule will appear here."
              />
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {sortedEvents.slice(0, 12).map((event) => {
                  const isSelected = selectedEventId === event.id
                  const status = getEventStatus(event.date)

                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      style={{
                        border: isSelected ? `2px solid ${THEME.colors.primary}` : "1px solid #e2e8f0",
                        background: isSelected ? "#eff6ff" : "white",
                        borderRadius: 18,
                        padding: 14,
                        display: "grid",
                        gap: 6,
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <Badge tone={eventTypeTone(event.type)}>{event.type}</Badge>
                          <Badge tone={statusTone(status)}>{status}</Badge>
                        </div>
                        <div style={{ color: THEME.colors.textSecondary, fontSize: 13, fontWeight: 700 }}>
                          {event.date}
                        </div>
                      </div>

                      <div style={{ fontWeight: 800, color: THEME.colors.textPrimary }}>
                        {event.title}
                      </div>

                      <div style={{ color: THEME.colors.textSecondary, fontSize: 14 }}>
                        {event.startTime ? `${event.startTime} • ` : ""}
                        {event.location || "No location"}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </PageCard>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader
              title="Next Event"
              subtitle="Closest upcoming activity."
            />

            {!nextEvent ? (
              <EmptyState
                title="No upcoming event"
                subtitle="Create an event to see the next activity here."
              />
            ) : (
              <div
                style={{
                  borderRadius: 18,
                  padding: 16,
                  background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
                  border: "1px solid #dbeafe",
                  display: "grid",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Badge tone={eventTypeTone(nextEvent.type)}>{nextEvent.type}</Badge>
                  <Badge>{nextEvent.date}</Badge>
                </div>

                <div style={{ fontSize: 20, fontWeight: 900, color: THEME.colors.textPrimary }}>
                  {nextEvent.title}
                </div>

                <div style={{ color: THEME.colors.textSecondary }}>
                  {nextEvent.startTime ? `${nextEvent.startTime} • ` : ""}
                  {nextEvent.location || "No location set"}
                </div>

                {nextEvent.opponent ? (
                  <div style={{ color: "#1d4ed8", fontWeight: 800 }}>
                    vs {nextEvent.opponent}
                  </div>
                ) : null}
              </div>
            )}
          </PageCard>

          <PageCard>
            <SectionHeader
              title="Event Details"
              subtitle="Selected event summary and attendance."
            />

            {!selectedEvent ? (
              <EmptyState
                title="No event selected"
                subtitle="Tap an event card to view attendance and event details."
              />
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                <div
                  style={{
                    borderRadius: 18,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    padding: 14,
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Badge tone={eventTypeTone(selectedEvent.type)}>
                      {selectedEvent.type.toUpperCase()}
                    </Badge>
                    {selectedEvent.startTime ? <Badge>{selectedEvent.startTime}</Badge> : null}
                  </div>

                  <div style={{ fontWeight: 900, fontSize: 18 }}>{selectedEvent.title}</div>
                  <div style={{ color: THEME.colors.textSecondary }}>{formatFullDate(selectedEvent.date)}</div>

                  {selectedEvent.location ? (
                    <div style={{ color: THEME.colors.textSecondary }}>
                      Location: {selectedEvent.location}
                    </div>
                  ) : null}

                  {selectedEvent.opponent ? (
                    <div style={{ color: "#1d4ed8", fontWeight: 800 }}>
                      Opponent: {selectedEvent.opponent}
                    </div>
                  ) : null}

                  {selectedEvent.trainingPlanId ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge tone="green">
                        Training Plan Linked
                      </Badge>
                      <SecondaryButton onClick={() => loadTrainingPlanFromEvent(selectedEvent)}>
                        Load Plan
                      </SecondaryButton>
                    </div>
                  ) : null}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: 10,
                  }}
                >
                  <EventStat
                    label="Available"
                    value={countAttendance(selectedEvent.id, "available")}
                    tone="green"
                  />
                  <EventStat
                    label="Maybe"
                    value={countAttendance(selectedEvent.id, "maybe")}
                    tone="yellow"
                  />
                  <EventStat
                    label="Unavailable"
                    value={countAttendance(selectedEvent.id, "unavailable")}
                  />
                </div>
              </div>
            )}
          </PageCard>

          {selectedEvent ? (
            <PageCard>
              <SectionHeader
                title="Attendance"
                subtitle="Player availability for the selected event."
              />

              <div style={{ display: "grid", gap: 10 }}>
                {players.length === 0 ? (
                  <EmptyState
                    title="No players found"
                    subtitle="Add players first to manage attendance."
                  />
                ) : (
                  players.map((player) => {
                    const status = getPlayerStatus(selectedEvent.id, player.id)

                    return (
                      <div
                        key={player.id}
                        style={{
                          border: "1px solid #e2e8f0",
                          borderRadius: 18,
                          padding: 12,
                          background: "white",
                          display: "grid",
                          gap: 10,
                        }}
                      >
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
                            <div style={{ fontWeight: 900 }}>{player.name}</div>
                            <div style={{ color: THEME.colors.textSecondary, fontSize: 13, marginTop: 4 }}>
                              {player.positions.join(" / ")}
                            </div>
                          </div>

                          {status ? (
                            <div
                              style={{
                                ...((status === "available" && {
                                  background: "#dcfce7",
                                  color: "#166534",
                                  border: "1px solid #86efac",
                                }) ||
                                  (status === "maybe" && {
                                    background: "#fef3c7",
                                    color: "#92400e",
                                    border: "1px solid #fcd34d",
                                  }) || {
                                    background: "#fee2e2",
                                    color: "#991b1b",
                                    border: "1px solid #fecaca",
                                  }),
                                borderRadius: 999,
                                padding: "6px 10px",
                                fontWeight: 800,
                                fontSize: 12,
                              }}
                            >
                              {status}
                            </div>
                          ) : (
                            <Badge>No response</Badge>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {(["available", "maybe", "unavailable"] as AttendanceStatus[]).map((nextStatus) => (
                            <button
                              key={nextStatus}
                              onClick={() => void saveAttendance(selectedEvent.id, player.id, nextStatus)}
                              style={{
                                border:
                                  status === nextStatus
                                    ? `1px solid ${THEME.colors.primary}`
                                    : "1px solid #cbd5e1",
                                background: status === nextStatus ? "#dbeafe" : "white",
                                color: status === nextStatus ? "#1d4ed8" : "#334155",
                                borderRadius: 999,
                                padding: "9px 12px",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              {nextStatus}
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </PageCard>
          ) : null}
        </div>
      </div>
    </div>
  )
}
