"use client"

import { buildLeagueTable } from "../lib/leagueTable"
import { THEME } from "../lib/theme"

function normalize(value?: string) {
  return (value || "").trim().toLowerCase()
}

function isOurTeam(team: string) {
  const text = normalize(team)
  return (
    text.includes("leonard stanley") &&
    text.includes("u10") &&
    text.includes("lionesses")
  )
}

export default function LeagueTable({ results }: { results: any[] }) {
  const table = buildLeagueTable(results)

  if (table.length === 0) {
    return <div style={{ color: "#64748b" }}>No results yet.</div>
  }

  const ourRowIndex = table.findIndex((row) => isOurTeam(row.team))
  const ourRow = ourRowIndex >= 0 ? table[ourRowIndex] : null

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {ourRow ? (
        <div
          style={{
            borderRadius: 20,
            padding: 16,
            background: `linear-gradient(135deg, ${THEME.colors.primary} 0%, ${THEME.colors.primaryDark} 100%)`,
            color: "white",
            display: "grid",
            gap: 8,
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.82 }}>
            OUR POSITION
          </div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>
            #{ourRowIndex + 1} {ourRow.team}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontWeight: 800 }}>
            <span>P {ourRow.played}</span>
            <span>W {ourRow.wins}</span>
            <span>D {ourRow.draws}</span>
            <span>L {ourRow.losses}</span>
            <span>GD {ourRow.goalDiff}</span>
            <span>PTS {ourRow.points}</span>
          </div>
        </div>
      ) : null}

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
              {["#", "Team", "P", "W", "D", "L", "GD", "PTS"].map((head) => (
                <th
                  key={head}
                  style={{
                    padding: "12px 10px",
                    fontSize: 12,
                    color: "#475569",
                    fontWeight: 900,
                  }}
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {table.map((row, i) => {
              const ours = isOurTeam(row.team)

              return (
                <tr
                  key={row.team}
                  style={{
                    background: ours ? "#eff6ff" : "white",
                    fontWeight: ours ? 900 : 600,
                  }}
                >
                  <td style={{ padding: "12px 10px", borderBottom: "1px solid #e2e8f0" }}>
                    {i + 1}
                  </td>
                  <td style={{ padding: "12px 10px", borderBottom: "1px solid #e2e8f0" }}>
                    {row.team}
                    {ours ? (
                      <span
                        style={{
                          marginLeft: 8,
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: "#dbeafe",
                          color: "#1d4ed8",
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        US
                      </span>
                    ) : null}
                  </td>
                  <td style={{ padding: "12px 10px", borderBottom: "1px solid #e2e8f0" }}>{row.played}</td>
                  <td style={{ padding: "12px 10px", borderBottom: "1px solid #e2e8f0" }}>{row.wins}</td>
                  <td style={{ padding: "12px 10px", borderBottom: "1px solid #e2e8f0" }}>{row.draws}</td>
                  <td style={{ padding: "12px 10px", borderBottom: "1px solid #e2e8f0" }}>{row.losses}</td>
                  <td style={{ padding: "12px 10px", borderBottom: "1px solid #e2e8f0" }}>
                    {row.goalDiff > 0 ? `+${row.goalDiff}` : row.goalDiff}
                  </td>
                  <td style={{ padding: "12px 10px", borderBottom: "1px solid #e2e8f0", fontWeight: 900 }}>
                    {row.points}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
