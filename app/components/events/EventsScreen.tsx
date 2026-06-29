"use client"

import { leonardStanleyEvents } from "../../lib/realTeamData"

export default function EventsScreen() {
  return (
    <div style={{ paddingBottom: 140, display: "flex", flexDirection: "column", gap: 16, color: "white" }}>
      <div>
        <div style={{ opacity: 0.7, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 }}>REAL EVENTS</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 32 }}>Events</h1>
        <p style={{ margin: "8px 0 0", color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>
          Real Leonard Stanley training, tournament and admin records only.
        </p>
      </div>

      {leonardStanleyEvents.map((event) => (
        <article key={event.id} style={{ borderRadius: 24, padding: 18, background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 900 }}>{event.title}</div>
              <div style={{ marginTop: 6, color: "rgba(226,232,240,0.72)", fontWeight: 800 }}>{event.dateLabel}{event.timeLabel ? ` • ${event.timeLabel}` : ""}</div>
            </div>
            <div style={{ height: "fit-content", borderRadius: 999, padding: "8px 10px", background: "rgba(37,99,235,0.18)", color: "#bfdbfe", fontSize: 12, fontWeight: 900 }}>{event.type}</div>
          </div>

          {event.location && <div style={{ marginTop: 12, borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.7)", color: "rgba(255,255,255,0.9)", fontWeight: 800 }}>{event.location}</div>}
          {event.notes && <p style={{ margin: "12px 0 0", color: "rgba(226,232,240,0.72)", lineHeight: 1.45 }}>{event.notes}</p>}
        </article>
      ))}
    </div>
  )
}
