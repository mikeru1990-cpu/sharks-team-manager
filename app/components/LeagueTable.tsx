"use client"

import { buildLeagueTable } from "../lib/leagueTable"
import { THEME } from "../lib/theme"

export default function LeagueTable({ results }: { results: any[] }) {
  const table = buildLeagueTable(results)

  if (table.length === 0) {
    return <div style={{ color: "#64748b" }}>No results yet.</div>
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: 14,
        }}
      >
        <thead>
          <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
            <th>#</th>
            <th>Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GD</th>
            <th>PTS</th>
          </tr>
        </thead>
        <tbody>
          {table.map((row, i) => (
            <tr
              key={row.team}
              style={{
                borderBottom: "1px solid #e2e8f0",
                fontWeight: row.team.includes("Lionesses") ? 900 : 600,
                background:
                  row.team.includes("Lionesses")
                    ? "#eff6ff"
                    : "transparent",
              }}
            >
              <td>{i + 1}</td>
              <td>{row.team}</td>
              <td>{row.played}</td>
              <td>{row.wins}</td>
              <td>{row.draws}</td>
              <td>{row.losses}</td>
              <td>{row.goalDiff}</td>
              <td>{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
