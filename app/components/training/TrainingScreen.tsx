"use client"

import EventsScreen from "../events/EventsScreen"
import PremiumWorkspaceHeader from "../ui/PremiumWorkspaceHeader"

export default function TrainingScreen() {
  return (
    <div style={{ display: "grid", gap: 16, paddingBottom: 132 }}>
      <PremiumWorkspaceHeader
        eyebrow="TRAINING WORKSPACE"
        title="Training & Events"
        description="Plan sessions, manage attendance and keep upcoming team events together without leaving the active U11 workspace."
        badge="Coach tools"
        meta="Training · Attendance · Events"
      />
      <EventsScreen />
    </div>
  )
}
