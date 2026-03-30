"use client"

import { useMemo, useState } from "react"
import type { LeagueResult } from "@/app/lib/types"

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
  form: ("W" | "D" | "L")[]
}

function normalize(name: string) {
  return name.trim().toLowerCase()
}

export default function StatsTab({
  teamName,
  results,
}: {
  teamName: string
  results: LeagueResult[]
}) {
  const [selectedOpponent, setSelectedOpponent] = useState("")

  const normalizedTeam = normalize(teamName)

  // ✅ Build League Table
  const standings = useMemo<StandingRow[]>(() => {
    const table: Record<string, StandingRow> = {}

    function getTeam(name: string) {
      const key = normalize(name)

      if (!table[key]) {
        table[key] = {
          team: name,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goals_for: 0,
          goals_against: 0,
          goal_difference: 0,
          points: 0,
          form: [],
        }
      }

      return table[key]
    }

    const sorted = [...results].sort((a, b) =>
      a.playedOn.localeCompare(b.playedOn)
    )

    for (const match of sorted) {
      const home = getTeam(match.homeTeam)
      const away = getTeam(match.awayTeam)

      home.played++
      away.played++

      home.goals_for += match.homeScore
      home.goals_against += match.awayScore

      away.goals_for += match.awayScore
      away.goals_against += match.homeScore

      if (match.homeScore > match.awayScore) {
        home.wins++
        home.points += 3
        away.losses++
        home.form.push("W")
        away.form.push("L")
      } else if (match.homeScore < match.awayScore) {
        away.wins++
        away.points += 3
        home.losses++
        away.form.push("W")
        home.form.push("L")
      } else {
        home.draws++
        away.draws++
        home.points++
        away.points++
        home.form.push("D")
        away.form.push("D")
      }
    }

    return Object.values(table)
      .map((t) => ({
        ...t,
        goal_difference: t.goals_for - t.goals_against,
        form: t.form.slice(-5).reverse(),
      }))
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.goal_difference !== a.goal_difference)
          return b.goal_difference - a.goal_difference
        return b.goals_for - a.goals_for
      })
  }, [results])

  // ✅ Opponents list
  const opponents = useMemo(() => {
    const set = new Set<string>()

    results.forEach((r) => {
      if (normalize(r.homeTeam) === normalizedTeam) set.add(r.awayTeam)
      if (normalize(r.awayTeam) === normalizedTeam) set.add(r.homeTeam)
    })

    return Array.from(set)
  }, [results, normalizedTeam])

  // ✅ Head-to-head
  const headToHead = useMemo(() => {
    if (!selectedOpponent) return null

    const games = results.filter(
      (r) =>
        (normalize(r.homeTeam) === normalizedTeam &&
          normalize(r.awayTeam) === normalize(selectedOpponent)) ||
        (normalize(r.awayTeam) === normalizedTeam &&
          normalize(r.homeTeam) === normalize(selectedOpponent))
    )

    let wins = 0
    let draws = 0
    let losses = 0

    games.forEach((g) => {
      const isHome = normalize(g.homeTeam) === normalizedTeam

      const our = isHome ? g.homeScore : g.awayScore
      const opp = isHome ? g.awayScore : g.homeScore

      if (our > opp) wins++
      else if (our < opp) losses++
      else draws++
    })

    return { games, wins, draws, losses }
  }, [results, selectedOpponent, normalizedTeam])

  return (
    <div style={{ display: "grid", gap: 20 }}>
      {/* ===================== */}
      {/* LEAGUE TABLE */}
      {/* ===================== */}
      <div style={{ fontWeight: 900, fontSize: 22 }}>League Table</div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
              <th>Pts</th>
              <th>Form</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((team, i) => (
              <tr key={team.team} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ fontWeight: 800 }}>
                  {i + 1}. {team.team}
                </td>
                <td>{team.played}</td>
                <td>{team.wins}</td>
                <td>{team.draws}</td>
                <td>{team.losses}</td>
                <td>{team.goal_difference}</td>
                <td style={{ fontWeight: 900 }}>{team.points}</td>

                <td>
                  {team.form.map((f, idx) => (
                    <span
                      key={idx}
                      style={{
                        marginRight: 4,
                        padding: "4px 6px",
                        borderRadius: 6,
                        fontWeight: 800,
                        background:
                          f === "W"
                            ? "#16a34a"
                            : f === "D"
                            ? "#eab308"
                            : "#dc2626",
                        color: "white",
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===================== */}
      {/* HEAD TO HEAD */}
      {/* ===================== */}
      <div style={{ fontWeight: 900, fontSize: 22 }}>
        Head to Head
      </div>

      <select
        value={selectedOpponent}
        onChange={(e) => setSelectedOpponent(e.target.value)}
        style={{
          padding: 12,
          borderRadius: 10,
          border: "1px solid #cbd5e1",
        }}
      >
        <option value="">Select opponent</option>
        {opponents.map((team) => (
          <option key={team}>{team}</option>
        ))}
      </select>

      {headToHead && (
        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ fontWeight: 800 }}>
            W: {headToHead.wins} | D: {headToHead.draws} | L:{" "}
            {headToHead.losses}
          </div>

          {headToHead.games.map((g) => {
            const isHome = normalize(g.homeTeam) === normalizedTeam

            const our = isHome ? g.homeScore : g.awayScore
            const opp = isHome ? g.awayScore : g.homeScore

            const result =
              our > opp ? "W" : our < opp ? "L" : "D"

            return (
              <div
                key={g.id}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "1px solid #e2e8f0",
                  background:
                    result === "W"
                      ? "#dcfce7"
                      : result === "L"
                      ? "#fee2e2"
                      : "#fef3c7",
                }}
              >
                {g.playedOn} — {g.homeTeam} {g.homeScore} - {g.awayScore}{" "}
                {g.awayTeam}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
