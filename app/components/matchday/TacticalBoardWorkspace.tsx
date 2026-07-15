"use client"

import { useEffect, useMemo, useState } from "react"
import { loadSquadPlayers, type SquadStorePlayer } from "../../lib/squadStore"
import { getTeamFormat, loadTeamFormat, type TeamFormatId } from "../../lib/teamFormat"
import InteractiveTacticalBoard from "./InteractiveTacticalBoard"

const matchdayStorageKey = "football-os-matchday-state-v4"

type MatchdayState = {
  liveLineupIds?: string[]
  stintSeconds?: Record<string, number>
}

export default function TacticalBoardWorkspace() {
  const [players, setPlayers] = useState<SquadStorePlayer[]>([])
  const [formatId, setFormatId] = useState<TeamFormatId>("7v7")
  const [liveLineupIds, setLiveLineupIds] = useState<string[]>([])
  const [stintSeconds, setStintSeconds] = useState<Record<string, number>>({})

  useEffect(() => {
    function refresh() {
      const squad = loadSquadPlayers()
      setPlayers(squad)
      setFormatId(loadTeamFormat())
      try {
        const raw = window.localStorage.getItem(matchdayStorageKey)
        const saved = raw ? JSON.parse(raw) as MatchdayState : {}
        setLiveLineupIds(Array.isArray(saved.liveLineupIds) ? saved.liveLineupIds : [])
        setStintSeconds(saved.stintSeconds ?? {})
      } catch {
        setLiveLineupIds([])
        setStintSeconds({})
      }
    }

    refresh()
    const timer = window.setInterval(refresh, 1000)
    window.addEventListener("focus", refresh)
    window.addEventListener("storage", refresh)
    window.addEventListener("football-os-team-format-change", refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("focus", refresh)
      window.removeEventListener("storage", refresh)
      window.removeEventListener("football-os-team-format-change", refresh)
    }
  }, [])

  const format = getTeamFormat(formatId)
  const livePlayers = useMemo(() => {
    const available = players.filter((player) => player.availability !== "Unavailable" && player.availability !== "Injured")
    const selected = liveLineupIds.map((id) => available.find((player) => player.id === id)).filter(Boolean) as SquadStorePlayer[]
    return selected.length ? selected.slice(0, format.playersOnPitch) : available.slice(0, format.playersOnPitch)
  }, [players, liveLineupIds, format.playersOnPitch])

  if (!livePlayers.length) return null

  return <InteractiveTacticalBoard players={livePlayers} format={format} stintSeconds={stintSeconds} />
}
