"use client"

import EventsScreen from "../events/EventsScreen"

export default function TrainingScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18, paddingBottom: 132 }}>
      <div>
        <div style={{ opacity: 0.72, fontSize: 12, fontWeight: 900, letterSpacing: 0.8 }}>
          TRAINING & EVENTS WORKSPACE
        </div>
        <h1 style={{ margin: "6px 0 4px", fontSize: 34, letterSpacing: -1.2 }}>Training</h1>
        <p style={{ margin: 0, color: "rgba(226,232,240,0.72)", lineHeight: 1.5 }}>
          Your existing training, events and attendance area is restored here inside the new design.
        </p>
      </div>

      <EventsScreen />
    </div>
  )
}
