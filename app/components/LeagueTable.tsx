"use client"

import { useEffect, useMemo, useState } from "react"
import { cardStyle } from "../lib/types"
import { supabase } from "../lib/supabase"

type EventRow = {
  id: string
  title: string
  date: string
  opponent: string | null
}

type MatchStateRow = {
  event_id: string
  home_team: string
  away_team: string
  home_score: number
  away_score: number
}

type TableRow = {
  team: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
}

export default function LeagueTable() {
  const [rows, setRows] = useState<TableRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTable() {
      setLoading(true)

      if (!supabase) {
        setRows([])
        setLoading(false)
        return
      }

      const [eventsRes, stateRes] = await Promise.all([
        supabase
          .from("events")
          .select("id, title, date, opponent, type")
          .eq("type", "match")
          .order("date", { ascending: true }),
        supabase
          .from("match_state")
          .select("event_id, home_team, away_team, home_score, away_score"),
      ])

      if (eventsRes.error || stateRes.error || !eventsRes.data || !stateRes.data) {
        setRows([])
        setLoading(false)
        return
      }

      const events = eventsRes.data as EventRow[]
      const states = stateRes.data as MatchStateRow[]

      const tableMap = new Map<string, TableRow>()

      function getOrCreateTeam(teamName: string) {
        const safeName = teamName?.trim() || "Unknown"
        if (!tableMap.has(safeName)) {
          tableMap.set(safeName, {
            team: safeName,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
          })
        }
        return tableMap.get(safeName)!
      }

      for (const event of events) {
        const state = states.find((item) => item.event_id === event.id)
        if (!state) continue

        const homeTeam = state.home_team?.trim() || "Home"
        const awayTeam = state.away_team?.trim() || event.opponent?.trim() || "Away"
        const homeScore = Number(state.home_score || 0)
        const awayScore = Number(state.away_score || 0)

        const home = getOrCreateTeam(homeTeam)
        const away = getOrCreateTeam(awayTeam)

        home.played += 1
        away.played += 1

        home.goalsFor += homeScore
        home.goalsAgainst += awayScore
        away.goalsFor += awayScore
        away.goalsAgainst += homeScore

        if (homeScore > awayScore) {
          home.won += 1
          home.points += 3
          away.lost += 1
        } else if (homeScore < awayScore) {
          away.won += 1
          away.points += 3
          home.lost += 1
        } else {
          home.drawn += 1
          away.drawn += 1
          home.points += 1
          away.points += 1
        }
      }

      const finalRows = Array.from(tableMap.values())
        .map((row) => ({
          ...row,
          goalDifference: row.goalsFor - row.goalsAgainst,
        }))
        .sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
          if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor
          return a.team.localeCompare(b.team)
        })

      setRows(finalRows)
      setLoading(false)
    }

    void loadTable()
  }, [])

  const hasRows = useMemo(() => rows.length > 0, [rows])

  return (
    <div style={cardStyle()}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>League Table</div>

      {loading ? (
        <div style={{ color: "#64748b" }}>Loading league table...</div>
      ) : !hasRows ? (
        <div style={{ color: "#64748b" }}>No saved match results yet.</div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            border: "1px solid #e2e8f0",
            borderRadius: 16,
            background: "white",
          }}
        >
          <table
            style={{
              width: "100%",
              minWidth: 760,
              borderCollapse: "collapse",
              fontSize: 14,
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Team</th>
                <th style={thStyle}>P</th>
                <th style={thStyle}>W</th>
                <th style={thStyle}>D</th>
                <th style={thStyle}>L</th>
                <th style={thStyle}>GF</th>
                <th style={thStyle}>GA</th>
                <th style={thStyle}>GD</th>
                <th style={thStyle}>Pts</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.team}
                  style={{
                    borderTop: "1px solid #e2e8f0",
                    background: index === 0 ? "#f0fdf4" : "white",
                  }}
                >
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={{ ...tdStyle, fontWeight: 800 }}>{row.team}</td>
                  <td style={tdStyle}>{row.played}</td>
                  <td style={tdStyle}>{row.won}</td>
                  <td style={tdStyle}>{row.drawn}</td>
                  <td style={tdStyle}>{row.lost}</td>
                  <td style={tdStyle}>{row.goalsFor}</td>
                  <td style={tdStyle}>{row.goalsAgainst}</td>
                  <td style={tdStyle}>{row.goalDifference}</td>
                  <td style={{ ...tdStyle, fontWeight: 900 }}>{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: "12px 10px",
  color: "#475569",
  fontWeight: 900,
  whiteSpace: "nowrap",
}

const tdStyle: React.CSSProperties = {
  padding: "12px 10px",
  color: "#0f172a",
  whiteSpace: "nowrap",
}
