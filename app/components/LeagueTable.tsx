"use client"

import { cardStyle } from "../lib/types"

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
  standings: StandingRow[]
  teamName?: string
}

export default function LeagueTable({ standings, teamName = "" }: Props) {
  return (
    <div style={cardStyle()}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
        League Table
      </div>

      {standings.length === 0 ? (
        <div style={{ color: "#64748b" }}>No league data yet.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 760,
            }}
          >
            <thead>
              <tr
                style={{
                  textAlign: "left",
                  borderBottom: "1px solid #e2e8f0",
                  background: "#f8fafc",
                }}
              >
                <th style={{ padding: "10px 8px" }}>#</th>
                <th style={{ padding: "10px 8px" }}>Team</th>
                <th style={{ padding: "10px 8px" }}>P</th>
                <th style={{ padding: "10px 8px" }}>W</th>
                <th style={{ padding: "10px 8px" }}>D</th>
                <th style={{ padding: "10px 8px" }}>L</th>
                <th style={{ padding: "10px 8px" }}>GF</th>
                <th style={{ padding: "10px 8px" }}>GA</th>
                <th style={{ padding: "10px 8px" }}>GD</th>
                <th style={{ padding: "10px 8px" }}>Pts</th>
              </tr>
            </thead>

            <tbody>
              {standings.map((row, index) => {
                const isOurTeam =
                  teamName.trim() !== "" &&
                  row.team.toLowerCase() === teamName.trim().toLowerCase()

                return (
                  <tr
                    key={row.team}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      background: isOurTeam ? "#dbeafe" : "transparent",
                    }}
                  >
                    <td style={{ padding: "10px 8px", fontWeight: 800 }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: "10px 8px", fontWeight: 800 }}>
                      {row.team}
                    </td>
                    <td style={{ padding: "10px 8px" }}>{row.played}</td>
                    <td style={{ padding: "10px 8px" }}>{row.wins}</td>
                    <td style={{ padding: "10px 8px" }}>{row.draws}</td>
                    <td style={{ padding: "10px 8px" }}>{row.losses}</td>
                    <td style={{ padding: "10px 8px" }}>{row.goals_for}</td>
                    <td style={{ padding: "10px 8px" }}>{row.goals_against}</td>
                    <td style={{ padding: "10px 8px", fontWeight: 700 }}>
                      {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                    </td>
                    <td style={{ padding: "10px 8px", fontWeight: 900 }}>
                      {row.points}
                    </td>
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
