"use client"

import HomeMissionControl from "../home/HomeMissionControl"
import MatchdayScreen from "../matchday/MatchdayScreen"
import PlayersScreen from "../players/PlayersScreen"
import EventsScreen from "../events/EventsScreen"

import type { MainTab } from "../../lib/types"

type Props = {
  activeTab: MainTab
}

export default function AppRouter({ activeTab }: Props) {
  switch (activeTab) {
    case "home":
      return <HomeMissionControl />

    case "matchday":
      return <MatchdayScreen />

    case "players":
      return <PlayersScreen />

    case "events":
      return <EventsScreen />

    default:
      return <HomeMissionControl />
  }
}
