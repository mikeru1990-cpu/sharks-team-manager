"use client"

import { useMemo } from "react"

type Result = {
  id: string
  playedOn: string
  eventId?: string | null
  opponent: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  competition?: string
}

export default function LeagueTable({
  results,
  teamName,
}: {
  results: Result[]
  teamName: string
}) {
  const table = useMemo(() => {
    const map: Record<
      string,
      {
        team: string
        played: number
        won: number
        drawn: number
        lost: number
        goalsFor: number
        goalsAgainst: number
        points: number
      }
    > = {}

    function ensure(team: string) {
      if (!map[team]) {
        map[team] = {
          team,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        }
      }
      return map[team]
    }

    results.forEach((r) => {
      const home = ensure(r.homeTeam)
      const away = ensure(r.awayTeam)

      home.played++
      away.played++

      home.goalsFor += r.homeScore
      home.goalsAgainst += r.awayScore

      away.goalsFor += r.awayScore
      away.goalsAgainst += r.homeScore

      if (r.homeScore > r.awayScore) {
        home.won++
        home.points += 3
        away.lost++
      } else if (r.homeScore < r.awayScore) {
        away.won++
        away.points += 3
        home.lost++
      } else {
        home.drawn++
        away.drawn++
        home.points++
        away.points++
      }
    })

    return Object.values(map).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points

      const gdA = a.goalsFor - a.goalsAgainst
      const gdB = b.goalsFor - b.goalsAgainst
      if (gdB !== gdA) return gdB - gdA

      if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor

      return a.team.localeCompare(b.team)
    })
  }, [results])

  if (table.length === 0) {
    return (
      <div
        style={{
          padding: 16,
          borderRadius: 16,
          border: "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 20 }}>League Table</div>
        <div style={{ color: "#64748b", marginTop: 8 }}>
          No results yet — finish a match to populate the table.
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 16,
        border: "1px solid #e2e8f0",
        background: "white",
        overflowX: "auto",
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 22, marginBottom: 12 }}>
        League Table
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
          minWidth: 600,
        }}
      >
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #e2e8f0" }}>
            <th style={{ padding: 8 }}>#</th>
            <th style={{ padding: 8 }}>Team</th>
            <th style={{ padding: 8 }}>P</th>
            <th style={{ padding: 8 }}>W</th>
            <th style={{ padding: 8 }}>D</th>
            <th style={{ padding: 8 }}>L</th>
            <th style={{ padding: 8 }}>GF</th>
            <th style={{ padding: 8 }}>GA</th>
            <th style={{ padding: 8 }}>GD</th>
            <th style={{ padding: 8 }}>Pts</th>
          </tr>
        </thead>

        <tbody>
          {table.map((team, index) => {
            const gd = team.goalsFor - team.goalsAgainst
            const isUs = team.team === teamName

            return (
              <tr
                key={team.team}
                style={{
                  background: isUs ? "#dbeafe" : "transparent",
                  borderBottom: "1px solid #e2e8f0",
                  fontWeight: isUs ? 800 : 500,
                }}
              >
                <td style={{ padding: 8 }}>{index + 1}</td>
                <td style={{ padding: 8 }}>{team.team}</td>
                <td style={{ padding: 8 }}>{team.played}</td>
                <td style={{ padding: 8 }}>{team.won}</td>
                <td style={{ padding: 8 }}>{team.drawn}</td>
                <td style={{ padding: 8 }}>{team.lost}</td>
                <td style={{ padding: 8 }}>{team.goalsFor}</td>
                <td style={{ padding: 8 }}>{team.goalsAgainst}</td>
                <td style={{ padding: 8 }}>{gd}</td>
                <td style={{ padding: 8 }}>{team.points}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
