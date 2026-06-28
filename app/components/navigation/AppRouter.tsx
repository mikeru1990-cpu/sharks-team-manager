"use client"

import ClubScreen from "../club/ClubScreen"
import HomeMissionControl from "../home/HomeMissionControl"
import InsightsScreen from "../insights/InsightsScreen"
import MatchdayScreen from "../matchday/MatchdayScreen"
import PlayersScreen from "../players/PlayersScreen"
import TrainingScreen from "../training/TrainingScreen"

import type { WorkspaceTab } from "../../lib/workspaces"

type Props = {
  activeTab: WorkspaceTab
}

export default function AppRouter({ activeTab }: Props) {
  switch (activeTab) {
    case "home":
      return <HomeMissionControl />

    case "matchday":
      return <MatchdayScreen />

    case "training":
      return <TrainingScreen />

    case "players":
      return <PlayersScreen />

    case "insights":
      return <InsightsScreen />

    case "club":
      return <ClubScreen />

    default:
      return <HomeMissionControl />
  }
}
