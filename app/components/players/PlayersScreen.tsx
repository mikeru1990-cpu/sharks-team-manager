"use client"

import TeamScopeBanner from "../layout/TeamScopeBanner"
import RealPlayersList from "./RealPlayersList"

export default function PlayersScreen() {
  return (
    <div style={{ paddingBottom: 140, color: "white", display: "grid", gap: 16 }}>
      <TeamScopeBanner section="Players" detail="Coach and parent view is scoped to the active U11 Girls team only. Club-wide player lists belong in Club Admin." />
      <RealPlayersList />
    </div>
  )
}
