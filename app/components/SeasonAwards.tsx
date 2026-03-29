"use client"

import { cardStyle, type PlayerAwardRow } from "../lib/types"

type Props = {
  rows: PlayerAwardRow[]
}

export default function SeasonAwards({ rows }: Props) {
  const topAverage = rows
    .filter((r) => r.ratingsCount > 0)
    .slice()
    .sort((a, b) => b.averageRating - a.averageRating)[0]

  const topPOTM = rows
    .filter((r) => r.playerOfMatchCount > 0)
    .slice()
    .sort((a, b) => b.playerOfMatchCount - a.playerOfMatchCount)[0]

  const topForm = rows
    .filter((r) => r.recentForm.length > 0)
    .slice()
    .sort((a, b) => {
      const aAvg = a.recentForm.reduce((sum, n) => sum + n, 0) / a.recentForm.length
      const bAvg = b.recentForm.reduce((sum, n) => sum + n, 0) / b.recentForm.length
      return bAvg - aAvg
    })[0]

  const mostRated = rows
    .filter((r) => r.ratingsCount > 0)
    .slice()
    .sort((a, b) => b.ratingsCount - a.ratingsCount)[0]

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Season Awards</div>

        <div style={{ display: "grid", gap: 10 }}>
          <div style={{ padding: 14, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 800 }}>Highest Average Rating</div>
            <div style={{ marginTop: 6, color: "#475569" }}>
              {topAverage ? `${topAverage.playerName} • ${topAverage.averageRating.toFixed(2)}` : "No data yet"}
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 800 }}>Player of the Match Leader</div>
            <div style={{ marginTop: 6, color: "#475569" }}>
              {topPOTM ? `${topPOTM.playerName} • ${topPOTM.playerOfMatchCount}` : "No data yet"}
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 800 }}>Best Recent Form</div>
            <div style={{ marginTop: 6, color: "#475569" }}>
              {topForm ? `${topForm.playerName} • ${topForm.recentForm.join(" • ")}` : "No data yet"}
            </div>
          </div>

          <div style={{ padding: 14, borderRadius: 16, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
            <div style={{ fontWeight: 800 }}>Most Matches Rated</div>
            <div style={{ marginTop: 6, color: "#475569" }}>
              {mostRated ? `${mostRated.playerName} • ${mostRated.ratingsCount}` : "No data yet"}
            </div>
          </div>
        </div>
      </div>

      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Top 5 Overall</div>

        <div style={{ display: "grid", gap: 10 }}>
          {rows
            .filter((r) => r.ratingsCount > 0)
            .slice()
            .sort((a, b) => b.averageRating - a.averageRating)
            .slice(0, 5)
            .map((row, index) => (
              <div
                key={row.playerId}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ fontWeight: 900 }}>
                  #{index + 1} {row.playerName}
                </div>
                <div style={{ color: "#475569", marginTop: 6 }}>
                  Avg {row.averageRating.toFixed(2)} • POTM {row.playerOfMatchCount} • Matches {row.ratingsCount}
                </div>
                <div style={{ color: "#64748b", marginTop: 4 }}>
                  Form: {row.recentForm.length ? row.recentForm.join(" • ") : "—"}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
