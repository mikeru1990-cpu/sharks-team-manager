"use client"

import HomeMissionControl from "./app/components/home/HomeMissionControl"
import MatchdayScreen from "./app/components/matchday/MatchdayScreen"
import PlayersScreen from "./app/components/players/PlayersScreen"
import EventsScreen from "./app/components/events/EventsScreen"

import type { MainTab } from "./app/lib/types"
import type { WorkspaceTab } from "./app/lib/workspaces"

type Props = {
  activeTab: MainTab
}

const noopNavigate = (_tab: WorkspaceTab) => {}

export default function AppRouter({ activeTab }: Props) {
  switch (activeTab) {
    case "home":
      return <HomeMissionControl onNavigate={noopNavigate} />

    case "match":
      return <MatchdayScreen />

    case "players":
      return <PlayersScreen />

    case "events":
      return <EventsScreen />

    default:
      return <HomeMissionControl onNavigate={noopNavigate} />
  }
}
