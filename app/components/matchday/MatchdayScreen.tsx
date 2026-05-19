"use client"

import LiveMatchHud from "./LiveMatchHud"
import QuickActionDock from "./QuickActionDock"
import MatchMomentumPanel from "./MatchMomentumPanel"
import MatchTimerPanel from "./MatchTimerPanel"
import TacticalDragBoard from "./TacticalDragBoard"
import LiveLineupBoard from "./LiveLineupBoard"
import FormationBoard from "./FormationBoard"
import MatchStatsPanel from "./MatchStatsPanel"
import PlayerAnalyticsPanel from "./PlayerAnalyticsPanel"
import EventCreationSheet from "./EventCreationSheet"
import MatchRecoveryPanel from "./MatchRecoveryPanel"
import MatchOrchestrationPanel from "./MatchOrchestrationPanel"
import QuarterAutomationPanel from "./QuarterAutomationPanel"
import LiveSyncPanel from "./LiveSyncPanel"
import SubstitutionPanel from "./SubstitutionPanel"
import PlayerWorkloadPanel from "./PlayerWorkloadPanel"
import OperationalScreenHeader from "../layout/OperationalScreenHeader"
import OperationalCard from "../ui/OperationalCard"

export default function MatchdayScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 16,
        paddingBottom: 140,
      }}
    >
      <LiveMatchHud />

      <OperationalScreenHeader
        title="Matchday"
        subtitle="Live football operations"
      />

      <QuickActionDock />

      <MatchTimerPanel />

      <QuarterAutomationPanel />

      <MatchMomentumPanel />

      <MatchOrchestrationPanel />

      <FormationBoard />

      <TacticalDragBoard />

      <LiveLineupBoard />

      <MatchStatsPanel />

      <PlayerAnalyticsPanel />

      <EventCreationSheet />

      <SubstitutionPanel />

      <PlayerWorkloadPanel />

      <LiveSyncPanel />

      <MatchRecoveryPanel />

      <OperationalCard
        title="Live Timeline"
        subtitle="Real-time match events"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div>⚽ Ava 12'</div>
          <div>⚽ Emily 31'</div>
          <div>🔁 Bella ↔ Sophia 42'</div>
          <div>🩹 Injury Check 47'</div>
        </div>
      </OperationalCard>

      <OperationalCard
        title="Quarter Status"
        subtitle="Live quarter progression"
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 10,
          }}
        >
          {[1, 2, 3, 4].map((quarter) => (
            <div
              key={quarter}
              style={{
                padding: "12px 10px",
                borderRadius: 12,
                textAlign: "center",
                background:
                  quarter === 3
                    ? "rgba(37,99,235,0.22)"
                    : "rgba(15,23,42,0.62)",
                border:
                  quarter === 3
                    ? "1px solid rgba(37,99,235,0.44)"
                    : "1px solid rgba(148,163,184,0.12)",
                fontWeight: 800,
              }}
            >
              Q{quarter}
            </div>
          ))}
        </div>
      </OperationalCard>
    </div>
  )
}
