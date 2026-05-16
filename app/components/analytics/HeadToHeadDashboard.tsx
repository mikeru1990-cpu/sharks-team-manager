"use client"

export type HeadToHeadRecord = {
  opponent: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  lastResult: string
}

type Props = {
  records: HeadToHeadRecord[]
}

export default function HeadToHeadDashboard({ records }: Props) {
  return (
    <div
      style={{
        borderRadius: 30,
        border: "1px solid rgba(148,163,184,0.12)",
        background: "linear-gradient(135deg, rgba(15,23,42,0.96), rgba(30,41,59,0.92))",
        padding: 24,
        boxShadow: "0 26px 60px rgba(0,0,0,0.45)",
        backdropFilter: "blur(16px)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              color: "white",
              fontWeight: 900,
              fontSize: 24,
              marginBottom: 4,
            }}
          >
            Head-to-Head Intelligence
          </div>

          <div
            style={{
              color: "rgba(226,232,240,0.7)",
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            Opponent trends, historical performance and tactical insight
          </div>
        </div>

        <div
          style={{
            borderRadius: 999,
            padding: "8px 14px",
            background: "rgba(168,85,247,0.16)",
            border: "1px solid rgba(168,85,247,0.24)",
            color: "#e9d5ff",
            fontWeight: 800,
            fontSize: 13,
          }}
        >
          OPPONENT ANALYTICS
        </div>
      </div>

      <div
        style={{
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: "0 12px",
            minWidth: 900,
          }}
        >
          <thead>
            <tr>
              {[
                "Opponent",
                "Played",
                "Won",
                "Drawn",
                "Lost",
                "GF",
                "GA",
                "GD",
                "Last Result",
              ].map((heading) => (
                <th
                  key={heading}
                  style={{
                    textAlign: "left",
                    padding: "0 18px 10px",
                    color: "rgba(226,232,240,0.66)",
                    fontWeight: 800,
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {records.map((record) => {
              const gd = record.goalsFor - record.goalsAgainst
              const gdColor = gd > 0 ? "#22c55e" : gd < 0 ? "#ef4444" : "#f59e0b"

              return (
                <tr
                  key={record.opponent}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 24,
                  }}
                >
                  <td
                    style={{
                      padding: "18px",
                      borderTopLeftRadius: 22,
                      borderBottomLeftRadius: 22,
                    }}
                  >
                    <div
                      style={{
                        color: "white",
                        fontWeight: 900,
                        fontSize: 16,
                      }}
                    >
                      {record.opponent}
                    </div>
                  </td>

                  {[record.played, record.won, record.drawn, record.lost].map((value, index) => (
                    <td
                      key={index}
                      style={{
                        padding: "18px",
                        color: "rgba(226,232,240,0.88)",
                        fontWeight: 800,
                        fontSize: 15,
                      }}
                    >
                      {value}
                    </td>
                  ))}

                  <td
                    style={{
                      padding: "18px",
                      color: "#86efac",
                      fontWeight: 900,
                      fontSize: 15,
                    }}
                  >
                    {record.goalsFor}
                  </td>

                  <td
                    style={{
                      padding: "18px",
                      color: "#fca5a5",
                      fontWeight: 900,
                      fontSize: 15,
                    }}
                  >
                    {record.goalsAgainst}
                  </td>

                  <td
                    style={{
                      padding: "18px",
                      color: gdColor,
                      fontWeight: 900,
                      fontSize: 16,
                    }}
                  >
                    {gd > 0 ? `+${gd}` : gd}
                  </td>

                  <td
                    style={{
                      padding: "18px",
                      borderTopRightRadius: 22,
                      borderBottomRightRadius: 22,
                    }}
                  >
                    <div
                      style={{
                        borderRadius: 999,
                        padding: "8px 14px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "rgba(59,130,246,0.16)",
                        border: "1px solid rgba(59,130,246,0.24)",
                        color: "#bfdbfe",
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      {record.lastResult}
                    </div>
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
