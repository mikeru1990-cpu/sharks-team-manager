"use client"

import { useEffect, useState } from "react"
import {
  getDefaultSquadPlayers,
  loadSquadPlayers,
  subscribeSquadPlayers,
  type SquadStorePlayer,
} from "./squadStore"

export function useSquadPlayers() {
  const [players, setPlayers] = useState<SquadStorePlayer[]>(getDefaultSquadPlayers)

  useEffect(() => {
    setPlayers(loadSquadPlayers())
    return subscribeSquadPlayers(setPlayers)
  }, [])

  return players
}
