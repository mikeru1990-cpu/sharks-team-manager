"use client"

import { cardStyle } from "../lib/types"
import type { EventItem } from "../lib/types"

type Props = {
  events: EventItem[]
  teamName: string
}

type Row = {
  team: string
  p: number
  w: number
  d: number
  l: number
  gf: number
  ga: number
  gd: number
  pts: number
}

function ensureRow(map: Map<string, Row>, team: string) {
  if (!map.has(team)) {
    map.set(team, {
      team,
      p: 0,
      w: 0,
      d: 0,
      l: 0,
      gf: 0,
      ga: 0,
      gd: 0,
      pts: 0,
    })
  }
  return map.get(team)!
}

export default function LeagueTable({ events, teamName }: Props) {
  const finishedMatches = events.filter(
    (event) =>
      event.type === "match" &&
      event.opponent &&
      event.opponent.trim() &&
      event.played &&
      typeof event.home_score === "number" &&
      typeof event.away_score === "number"
  )

  const tableMap = new Map<string, Row>()

  for (const event of finishedMatches) {
    const home = ensureRow(tableMap, teamName)
    const away = ensureRow(tableMap, event.opponent!.trim())

    const homeGoals = Number(event.home_score || 0)
    const awayGoals = Number(event.away_score || 0)

    home.p += 1
    away.p += 1

    home.gf += homeGoals
    home.ga += awayGoals
    away.gf += awayGoals
    away.ga += homeGoals

    if (homeGoals > awayGoals) {
      home.w += 1
      home.pts += 3
      away.l += 1
    } else if (homeGoals < awayGoals) {
      away.w += 1
      away.pts += 3
      home.l += 1
    } else {
      home.d += 1
      away.d += 1
      home.pts += 1
      away.pts += 1
    }
  }

  const rows = Array.from(tableMap.values())
    .map((row) => ({
      ...row,
      gd: row.gf - row.ga,
    }))
    .sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts
      if (b.gd !== a.gd) return b.gd - a.gd
      if (b.gf !== a.gf) return b.gf - a.gf
      return a.team.localeCompare(b.team)
    })

  return (
    <div style={cardStyle()}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>League Table</div>

      {rows.length === 0 ? (
        <div style={{ color: "#64748b" }}>
          No finished match results yet. Save some played match scores first.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 720,
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "2px solid #dbe3ef" }}>
                <th style={{ padding: "10px 8px" }}>#</th>
                <th style={{ padding: "10px 8px" }}>Team</th>
                <th style={{ padding: "10px 8px" }}>P</th>
                <th style={{ padding: "10px 8px" }}>W</th>
                <th style={{ padding: "10px 8px" }}>D</th>
                <th style={{ padding: "10px 8px" }}>L</th>
                <th style={{ padding: "10px 8px" }}>GF</th>
                <th style={{ padding: "10px 8px" }}>GA</th>
                <th style={{ padding: "10px 8px" }}>GD</th>
                <th style={{ padding: "10px 8px" }}>PTS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const isUs = row.team === teamName

                return (
                  <tr
                    key={row.team}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      background: isUs ? "#eff6ff" : "transparent",
                    }}
                  >
                    <td style={{ padding: "10px 8px", fontWeight: 800 }}>{index + 1}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 800 }}>{row.team}</td>
                    <td style={{ padding: "10px 8px" }}>{row.p}</td>
                    <td style={{ padding: "10px 8px" }}>{row.w}</td>
                    <td style={{ padding: "10px 8px" }}>{row.d}</td>
                    <td style={{ padding: "10px 8px" }}>{row.l}</td>
                    <td style={{ padding: "10px 8px" }}>{row.gf}</td>
                    <td style={{ padding: "10px 8px" }}>{row.ga}</td>
                    <td style={{ padding: "10px 8px" }}>{row.gd}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 900 }}>{row.pts}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
