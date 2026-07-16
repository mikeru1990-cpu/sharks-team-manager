"use client"

import MatchdayCockpit from "./MatchdayCockpit"
import MatchdayStatsBridge from "./MatchdayStatsBridge"
import TacticalBoardWorkspace from "./TacticalBoardWorkspace"
import "./matchday-premium.css"

export default function MatchdayScreen() {
  return (
    <div className="matchday-premium-shell" style={{ display: "grid", gap: 16 }}>
      <MatchdayCockpit />
      <TacticalBoardWorkspace />
      <MatchdayStatsBridge />
    </div>
  )
}
