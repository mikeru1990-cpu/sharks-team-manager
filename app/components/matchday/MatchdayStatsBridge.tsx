"use client"

import { useEffect, useState } from "react"
import MatchStatsPanel from "./MatchStatsPanel"
import { incrementPlayerStat, setPlayerOfMatch, type MatchStatsMap } from "../../lib/matchStats"
import { loadSquadPlayers, type SquadStorePlayer } from "../../lib/squadStore"
import { getTeamFormat, loadTeamFormat, type TeamFormatId } from "../../lib/teamFormat"

const matchdayStorageKey = "football-os-matchday-state-v4"
const statsStorageKey = "football-os-match-player-stats-v1"

type LiveMatchSnapshot = {
  seconds: number
  home: number
  away: number
  formatId: TeamFormatId
}

type SavedStatsState = {
  stats: MatchStatsMap
  opponent: string
}

function readMatchSnapshot(): LiveMatchSnapshot {
  const formatId = loadTeamFormat()
  try {
    const raw = window.localStorage.getItem(matchdayStorageKey)
    if (!raw) return { seconds: 0, home: 0, away: 0, formatId }
    const saved = JSON.parse(raw) as Partial<LiveMatchSnapshot>
    return {
      seconds: typeof saved.seconds === "number" ? saved.seconds : 0,
      home: typeof saved.home === "number" ? saved.home : 0,
      away: typeof saved.away === "number" ? saved.away : 0,
      formatId,
    }
  } catch {
    return { seconds: 0, home: 0, away: 0, formatId }
  }
}

function readStatsState(): SavedStatsState {
  try {
    const raw = window.localStorage.getItem(statsStorageKey)
    if (!raw) return { stats: {}, opponent: "" }
    const saved = JSON.parse(raw) as Partial<SavedStatsState>
    return {
      stats: saved.stats && typeof saved.stats === "object" ? saved.stats : {},
      opponent: typeof saved.opponent === "string" ? saved.opponent : "",
    }
  } catch {
    return { stats: {}, opponent: "" }
  }
}

export default function MatchdayStatsBridge() {
  const [players, setPlayers] = useState<SquadStorePlayer[]>([])
  const [snapshot, setSnapshot] = useState<LiveMatchSnapshot>({ seconds: 0, home: 0, away: 0, formatId: "7v7" })
  const [stats, setStats] = useState<MatchStatsMap>({})
  const [opponent, setOpponent] = useState("")
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setPlayers(loadSquadPlayers())
    setSnapshot(readMatchSnapshot())
    const saved = readStatsState()
    setStats(saved.stats)
    setOpponent(saved.opponent)

    const refresh = () => {
      setPlayers(loadSquadPlayers())
      setSnapshot(readMatchSnapshot())
    }

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

  useEffect(() => {
    window.localStorage.setItem(statsStorageKey, JSON.stringify({ stats, opponent }))
  }, [stats, opponent])

  function increment(playerId: string, key: "goals" | "assists" | "saves" | "yellowCards" | "redCards", amount = 1) {
    setStats((current) => incrementPlayerStat(current, playerId, key, amount))
  }

  function choosePlayerOfMatch(playerId: string) {
    setStats((current) => setPlayerOfMatch(current, playerId))
  }

  function clearReport() {
    setStats({})
    setOpponent("")
    window.localStorage.removeItem(statsStorageKey)
  }

  const format = getTeamFormat(snapshot.formatId)

  return (
    <section style={shell}>
      <button type="button" onClick={() => setOpen((value) => !value)} style={headerButton}>
        <span>
          <small style={eyebrow}>MATCH REPORT & PLAYER EVENTS</small>
          <strong style={heading}>{snapshot.home}–{snapshot.away} · {format.label}</strong>
        </span>
        <span style={pill}>{open ? "Close" : "Open report"}</span>
      </button>

      {open && (
        <>
          <MatchStatsPanel
            players={players}
            stats={stats}
            homeScore={snapshot.home}
            awayScore={snapshot.away}
            format={format.label}
            durationSeconds={snapshot.seconds}
            opponent={opponent}
            onIncrement={increment}
            onPlayerOfMatch={choosePlayerOfMatch}
            onOpponentChange={setOpponent}
          />
          <button type="button" onClick={clearReport} style={clearButton}>Clear player statistics and report</button>
        </>
      )}
    </section>
  )
}

const shell = { display: "grid", gap: 12 }
const headerButton = { width: "100%", border: "1px solid rgba(147,197,253,.2)", borderRadius: 24, padding: 16, background: "radial-gradient(circle at top right,rgba(37,99,235,.3),transparent 42%),rgba(15,23,42,.92)", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, textAlign: "left" as const, cursor: "pointer" }
const eyebrow = { display: "block", color: "#bfdbfe", fontWeight: 950, letterSpacing: 1, fontSize: 11 }
const heading = { display: "block", marginTop: 5, fontSize: 22 }
const pill = { borderRadius: 999, padding: "8px 11px", background: "rgba(37,99,235,.22)", color: "#bfdbfe", fontSize: 11, fontWeight: 950, whiteSpace: "nowrap" as const }
const clearButton = { border: "1px solid rgba(248,113,113,.2)", borderRadius: 16, padding: 12, background: "rgba(127,29,29,.38)", color: "white", fontWeight: 900, cursor: "pointer" }
