"use client"

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
  form?: ("W" | "D" | "L")[]
}

type Props = {
  standings: StandingRow[]
  teamName: string
}

function formBadgeStyle(value: "W" | "D" | "L") {
  if (value === "W") {
    return {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #86efac",
    }
  }

  if (value === "D") {
    return {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fcd34d",
    }
  }

  return {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
  }
}

export default function LeagueTable({ standings, teamName }: Props) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 24,
        padding: 24,
        border: "1px solid #dbe3ef",
        boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
        overflow: "hidden",
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>League Table</div>

      {standings.length === 0 ? (
        <div style={{ color: "#64748b" }}>No league results saved yet.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 860,
            }}
          >
            <thead>
              <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#94a3b8" }}>
                <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 14 }}>#</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 14 }}>Team</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 14 }}>P</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 14 }}>W</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 14 }}>D</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 14 }}>L</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 14 }}>GF</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 14 }}>GA</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 14 }}>GD</th>
                <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 14 }}>Pts</th>
                <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 14 }}>Form</th>
              </tr>
            </thead>

            <tbody>
              {standings.map((row, index) => {
                const isOurTeam = row.team === teamName

                return (
                  <tr
                    key={row.team}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      background: isOurTeam ? "#dbeafe" : "transparent",
                    }}
                  >
                    <td
                      style={{
                        padding: "12px 8px",
                        fontWeight: isOurTeam ? 900 : 700,
                        color: "#0f172a",
                      }}
                    >
                      {index + 1}
                    </td>

                    <td
                      style={{
                        padding: "12px 8px",
                        fontWeight: isOurTeam ? 900 : 700,
                        color: "#0f172a",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {row.team}
                    </td>

                    <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 700 }}>
                      {row.played}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 700 }}>
                      {row.wins}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 700 }}>
                      {row.draws}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 700 }}>
                      {row.losses}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 700 }}>
                      {row.goals_for}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 700 }}>
                      {row.goals_against}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 700 }}>
                      {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                    </td>
                    <td
                      style={{
                        padding: "12px 8px",
                        textAlign: "center",
                        fontWeight: 900,
                        color: "#0f172a",
                      }}
                    >
                      {row.points}
                    </td>

                    <td style={{ padding: "12px 8px" }}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {(row.form || []).length === 0 ? (
                          <span style={{ color: "#94a3b8", fontSize: 13 }}>—</span>
                        ) : (
                          (row.form || []).map((item, itemIndex) => (
                            <div
                              key={`${row.team}-${itemIndex}-${item}`}
                              style={{
                                ...formBadgeStyle(item),
                                width: 28,
                                height: 28,
                                borderRadius: 999,
                                display: "grid",
                                placeItems: "center",
                                fontSize: 12,
                                fontWeight: 900,
                              }}
                            >
                              {item}
                            </div>
                          ))
                        )}
                      </div>
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
