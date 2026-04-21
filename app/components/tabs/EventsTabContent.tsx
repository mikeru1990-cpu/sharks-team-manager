"use client"

import { useMemo } from "react"
import { PageCard, SectionHeader, Badge, PrimaryButton } from "../ui"
import type { EventWithPlan } from "../../lib/dashboardTypes"

type Props = {
  events: EventWithPlan[]
  onSelectEvent: (id: string) => void
  selectedEventId: string | null
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
    <div
      style={{
        ...style,
        borderRadius: 20,
        padding: 16,
        display: "grid",
        gap: 6,
        boxShadow: "0 6px 14px rgba(15,23,42,0.05)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.88 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.05 }}>{value}</div>
    </div>
  )
}

export default function EventsTabContent({
  events,
  onSelectEvent,
  selectedEventId,
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
            nextEvent ? (
              <div style={{ minWidth: 140 }}>
                <PrimaryButton onClick={() => onSelectEvent(nextEvent.id)}>
                  Open Next
                </PrimaryButton>
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
        <StatTile label="Total Events" value={totalEvents} tone="blue" />
        <StatTile label="Upcoming" value={upcomingCount} tone="green" />
        <StatTile label="Today" value={todayCount} tone="yellow" />
        <StatTile label="Training" value={trainingCount} />
        <StatTile label="Matches" value={matchCount} />
      </div>

      <PageCard>
        <SectionHeader
          title="Day Planner"
          subtitle="Choose a day to view events and attendance."
        />

        {nextEvent ? (
          <div
            style={{
              borderRadius: 18,
              border: "1px solid #dbeafe",
              background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
              padding: 16,
              display: "grid",
              gap: 10,
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge tone={nextEvent.type === "match" ? "blue" : "green"}>
                {nextEvent.type}
              </Badge>
              <StatusBadge status={getStatus(nextEvent.date)} />
              <Badge>{formatPrettyDate(nextEvent.date)}</Badge>
              {nextEvent.startTime ? <Badge>{nextEvent.startTime}</Badge> : null}
            </div>

            <div style={{ fontSize: 22, fontWeight: 900 }}>{nextEvent.title}</div>

            {nextEvent.location ? (
              <div style={{ color: "#475569" }}>{nextEvent.location}</div>
            ) : null}

            {nextEvent.opponent ? (
              <div style={{ color: "#1d4ed8", fontWeight: 800 }}>
                vs {nextEvent.opponent}
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ color: "#64748b" }}>No events available.</div>
        )}
      </PageCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 16,
        }}
      >
        <PageCard>
          <SectionHeader
            title="Selected Day Events"
            subtitle="Everything scheduled for the chosen date."
          />

          {sorted.length === 0 ? (
            <div style={{ color: "#64748b" }}>No events yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {sorted.slice(0, 3).map((event) => {
                const status = getStatus(event.date)
                const isSelected = selectedEventId === event.id

                return (
                  <button
                    key={event.id}
                    onClick={() => onSelectEvent(event.id)}
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
                      {event.id === selectedEventId ? <Badge tone="blue">Active Match</Badge> : null}
                    </div>

                    <div style={{ fontWeight: 900, fontSize: 18 }}>{event.title}</div>

                    <div style={{ color: "#475569", lineHeight: 1.45 }}>
                      {event.location || "Location not set"}
                    </div>

                    {event.opponent ? (
                      <div style={{ color: "#1d4ed8", fontWeight: 800 }}>
                        vs {event.opponent}
                      </div>
                    ) : null}
                  </button>
                )
              })}
            </div>
          )}
        </PageCard>

        <PageCard>
          <SectionHeader
            title="Next Event"
            subtitle="Closest upcoming activity."
          />

          {!nextEvent ? (
            <div style={{ color: "#64748b" }}>No next event yet.</div>
          ) : (
            <div
              style={{
                border: "1px solid #dbeafe",
                background: "#f8fbff",
                borderRadius: 18,
                padding: 16,
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge tone={nextEvent.type === "match" ? "blue" : "green"}>
                  {nextEvent.type}
                </Badge>
                <Badge>{nextEvent.date}</Badge>
              </div>

              <div style={{ fontSize: 20, fontWeight: 900 }}>{nextEvent.title}</div>

              <div style={{ color: "#475569" }}>
                {nextEvent.startTime ? `${nextEvent.startTime} • ` : ""}
                {nextEvent.location || "Location not set"}
              </div>

              {nextEvent.opponent ? (
                <div style={{ color: "#1d4ed8", fontWeight: 800 }}>
                  vs {nextEvent.opponent}
                </div>
              ) : null}
            </div>
          )}
        </PageCard>
      </div>

      <PageCard>
        <SectionHeader
          title="All Events"
          subtitle="Full event list in date order."
        />

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
                  onClick={() => onSelectEvent(event.id)}
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
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
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

                  <div style={{ color: "#64748b" }}>
                    {event.location || "Location not set"}
                  </div>

                  {event.type === "match" && event.opponent ? (
                    <div style={{ fontWeight: 800, color: "#1e3a8a" }}>
                      vs {event.opponent}
                    </div>
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
