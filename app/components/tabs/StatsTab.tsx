"use client"

import { useMemo, useState } from "react"
import LeagueTable from "../LeagueTable"
import SectionCard from "../ui/SectionCard"
import EmptyState from "../ui/EmptyState"

type Result = {
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  playedOn: string
}

type StandingRow = {
  team: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

type Props = {
  teamName: string
  results: Result[]
  standings: StandingRow[]
}

function getHeadToHead(teamName: string, opponent: string, results: Result[]) {
  const matches = results.filter(
    (m) =>
      (m.homeTeam === teamName && m.awayTeam === opponent) ||
      (m.awayTeam === teamName && m.homeTeam === opponent)
  )

  let wins = 0
  let draws = 0
  let losses = 0

  matches.forEach((m) => {
    const isHome = m.homeTeam === teamName
    const gf = isHome ? m.homeScore : m.awayScore
    const ga = isHome ? m.awayScore : m.homeScore

    if (gf > ga) wins++
    else if (gf === ga) draws++
    else losses++
  })

  return {
    played: matches.length,
    wins,
    draws,
    losses,
  }
}

export default function StatsTab({ teamName, results, standings }: Props) {
  const [selectedOpponent, setSelectedOpponent] = useState("")

  const opponents = useMemo(() => {
    return Array.from(
      new Set(results.flatMap((m) => [m.homeTeam, m.awayTeam]))
    )
      .filter((t) => t !== teamName)
      .sort()
  }, [results, teamName])

  const headToHead = useMemo(() => {
    if (!selectedOpponent) return null
    return getHeadToHead(teamName, selectedOpponent, results)
  }, [selectedOpponent, results, teamName])

  return (
    <div style={{ display: "grid", gap: 16 }}>
      
      {/* League Table */}
      <SectionCard title="League Table">
        <LeagueTable standings={standings} teamName={teamName} />
      </SectionCard>

      {/* Head-to-Head */}
      <SectionCard title="Head-to-Head">
        <select
          value={selectedOpponent}
          onChange={(e) => setSelectedOpponent(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            marginBottom: 16,
          }}
        >
          <option value="">Select opponent</option>
          {opponents.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        {!selectedOpponent ? (
          <EmptyState text="Select a team" />
        ) : headToHead ? (
          <div style={{ display: "flex", gap: 12 }}>
            <Stat label="Played" value={headToHead.played} />
            <Stat label="Won" value={headToHead.wins} />
            <Stat label="Drawn" value={headToHead.draws} />
            <Stat label="Lost" value={headToHead.losses} />
          </div>
        ) : (
          <EmptyState text="No matches found" />
        )}
      </SectionCard>

    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        flex: 1,
        padding: 14,
        borderRadius: 12,
        background: "#f8fafc",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 900 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
    </div>
  )
}
