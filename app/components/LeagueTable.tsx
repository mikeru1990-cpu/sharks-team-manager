"use client"

import { cardStyle } from "../lib/types"
import type { EventItem } from "../lib/types"

type Row = {
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  gd: number
  points: number
}

export default function LeagueTable({ events }: { events: EventItem[] }) {
  const rows: Record<string, Row> = {}

  const matches = events.filter(
    (e) => e.is_match && e.played && e.competition === "league"
  )

  for (const match of matches) {
    const home = "Sharks Lioness"
    const away = match.opponent || "Opponent"

    if (!rows[home]) {
      rows[home] = {
        team: home,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      }
    }

    if (!rows[away]) {
      rows[away] = {
        team: away,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        gf: 0,
        ga: 0,
        gd: 0,
        points: 0,
      }
    }

    const h = match.home_score || 0
    const a = match.away_score || 0

    rows[home].played++
    rows[away].played++

    rows[home].gf += h
    rows[home].ga += a

    rows[away].gf += a
    rows[away].ga += h

    if (h > a) {
      rows[home].won++
      rows[away].lost++
      rows[home].points += 3
    } else if (h < a) {
      rows[away].won++
      rows[home].lost++
      rows[away].points += 3
    } else {
      rows[home].drawn++
      rows[away].drawn++
      rows[home].points++
      rows[away].points++
    }
  }

  const table = Object.values(rows)
    .map((r) => ({ ...r, gd: r.gf - r.ga }))
    .sort((a, b) => b.points - a.points || b.gd - a.gd)

  return (
    <div style={cardStyle()}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
        League Table
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {table.map((team, i) => (
          <div
            key={team.team}
            style={{
              display: "grid",
              gridTemplateColumns: "30px 1fr repeat(7, 40px)",
              fontSize: 14,
              fontWeight: 800,
              padding: 8,
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div>{i + 1}</div>
            <div>{team.team}</div>
            <div>{team.played}</div>
            <div>{team.won}</div>
            <div>{team.drawn}</div>
            <div>{team.lost}</div>
            <div>{team.gd}</div>
            <div>{team.points}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
