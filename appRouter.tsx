"use client"

import HomeMissionControl from "./app/components/home/HomeMissionControl"
import MatchdayScreen from "./app/components/matchday/MatchdayScreen"
import PlayersScreen from "./app/components/players/PlayersScreen"
import EventsScreen from "./app/components/events/EventsScreen"

import type { MainTab } from "./app/lib/types"

type Props = {
  activeTab: MainTab
}

export default function AppRouter({
  activeTab,
}: Props) {
  switch (activeTab) {
    case "home":
      return <HomeMissionControl />

    case "match":
      return <MatchdayScreen />

    case "players":
      return <PlayersScreen />

    case "events":
      return <EventsScreen />

    default:
      return <HomeMissionControl />
  }
}
