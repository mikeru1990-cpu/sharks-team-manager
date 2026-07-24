"use client"

import TeamScopeBanner from "../layout/TeamScopeBanner"
import PremiumWorkspaceHeader from "../ui/PremiumWorkspaceHeader"
import RealPlayersList from "./RealPlayersList"

export default function PlayersScreen() {
  return (
    <div style={{ paddingBottom: 140, color: "white", display: "grid", gap: 16 }}>
      <PremiumWorkspaceHeader
        eyebrow="SQUAD WORKSPACE"
        title="U11 Girls Squad"
        description="Manage the real squad, positions, availability and player responsibilities from one place. Changes here feed Matchday and the tactical tools."
        badge="Team scoped"
        meta="Leonard Stanley U11 Girls · Coach view"
      />
      <TeamScopeBanner section="Players" detail="Coach and parent view is scoped to the active U11 Girls team only. Club-wide player lists belong in Club Admin." />
      <RealPlayersList />
    </div>
  )
}
