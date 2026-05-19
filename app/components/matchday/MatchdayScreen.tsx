"use client"

import LiveMatchHud from "./LiveMatchHud"
import OperationalScreenHeader from "../layout/OperationalScreenHeader"
import OperationalCard from "../ui/OperationalCard"

export default function MatchdayScreen() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 120 }}>
      <LiveMatchHud />

      <OperationalScreenHeader
        title="Matchday"
        subtitle="Live football operations"
      />

      <OperationalCard
        title="Live Timeline"
        subtitle="Real-time match events"
      >
        <div>⚽ Ava 12'</div>
        <div>⚽ Emily 31'</div>
      </OperationalCard>
    </div>
  )
}
