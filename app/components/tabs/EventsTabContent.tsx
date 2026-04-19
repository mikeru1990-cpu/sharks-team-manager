"use client"

import { useMemo } from "react"
import { cardStyle } from "../../lib/types"
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

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "done"
      ? { background: "#e2e8f0", color: "#334155" }
      : status === "today"
      ? { background: "#fef3c7", color: "#92400e" }
      : { background: "#dcfce7", color: "#166534" }

  return (
    <div
      style={{
        ...styles,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {status.toUpperCase()}
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

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* HEADER */}
      <div
        style={{
          ...cardStyle("linear-gradient(135deg, #0c235f, #1e3a8a)"),
          color: "white",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 900 }}>Events</div>
        <div style={{ opacity: 0.8 }}>
          Matches & training schedule
        </div>
      </div>

      {/* LIST */}
      <div style={{ display: "grid", gap: 12 }}>
        {sorted.length === 0 ? (
          <div style={cardStyle()}>
            No events yet.
          </div>
        ) : (
          sorted.map((event) => {
            const status = getStatus(event.date)
            const isSelected = selectedEventId === event.id

            return (
              <div
                key={event.id}
                onClick={() => onSelectEvent(event.id)}
                style={{
                  ...cardStyle(),
                  cursor: "pointer",
                  border: isSelected
                    ? "2px solid #1e3a8a"
                    : "1px solid #e2e8f0",
                  background: isSelected ? "#eff6ff" : "#fff",
                  transition: "0.2s",
                }}
              >
                {/* TOP ROW */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 900 }}>
                    {event.type === "match" ? "Match" : "Training"}
                  </div>

                  <StatusBadge status={status} />
                </div>

                {/* TITLE */}
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {event.title}
                </div>

                {/* DETAILS */}
                <div style={{ color: "#64748b", marginTop: 6 }}>
                  {event.date}
                  {event.startTime ? ` • ${event.startTime}` : ""}
                </div>

                {/* MATCH EXTRA */}
                {event.type === "match" && event.opponent ? (
                  <div
                    style={{
                      marginTop: 8,
                      fontWeight: 700,
                      color: "#1e3a8a",
                    }}
                  >
                    vs {event.opponent}
                  </div>
                ) : null}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
