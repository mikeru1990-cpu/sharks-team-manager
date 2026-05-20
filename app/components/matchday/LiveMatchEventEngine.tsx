"use client"

import { useState } from "react"
import {
  Flag,
  Goal,
  ShieldAlert,
  TimerReset,
} from "lucide-react"

const events = [
  {
    id: 1,
    minute: "12'",
    title: "Goal Scored",
    detail: "Sophia finished transition attack",
    icon: Goal,
  },
  {
    id: 2,
    minute: "15'",
    title: "Defensive Alert",
    detail: "Left-side overload detected",
    icon: ShieldAlert,
  },
  {
    id: 3,
    minute: "18'",
    title: "Corner Won",
    detail: "High press forced recovery",
    icon: Flag,
  },
]

export default function LiveMatchEventEngine() {
  const [matchEvents, setMatchEvents] = useState(events)

  const addEvent = () => {
    setMatchEvents((prev) => [
      {
        id: Date.now(),
        minute: "20'",
        title: "Momentum Shift",
        detail: "Press intensity increased",
        icon: TimerReset,
      },
      ...prev,
    ])
  }

  return (
    <div
      style={{
        borderRadius: 30,
        padding: 22,
        background: "rgba(2,6,23,0.92)",
        border: "1px solid rgba(148,163,184,0.12)",
        backdropFilter: "blur(24px)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>
            LIVE MATCH EVENT STREAM
          </div>

          <div style={{ fontSize: 26, fontWeight: 900 }}>
            Match Event Engine
          </div>
        </div>

        <button
          onClick={addEvent}
          style={{
            border: "none",
            borderRadius: 18,
            padding: "12px 16px",
            background: "linear-gradient(135deg,#2563eb,#7c3aed)",
            color: "white",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          Add Event
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {matchEvents.map((event) => {
          const Icon = event.icon

          return (
            <div
              key={event.id}
              style={{
                borderRadius: 22,
                padding: 18,
                background: "rgba(15,23,42,0.82)",
                border: "1px solid rgba(148,163,184,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 16,
                  background: "rgba(37,99,235,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={22} />
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{event.title}</div>
                  <div style={{ opacity: 0.72 }}>{event.minute}</div>
                </div>

                <div style={{ opacity: 0.9, fontWeight: 700 }}>
                  {event.detail}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
