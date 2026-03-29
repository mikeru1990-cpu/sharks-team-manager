"use client"

import { cardStyle, type PlayerFormRow } from "../lib/types"

type Props = {
  rows: PlayerFormRow[]
}

export default function PlayerFormTable({ rows }: Props) {
  return (
    <div style={cardStyle()}>
      <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
        Player Form
      </div>

      {rows.length === 0 ? (
        <div style={{ color: "#64748b" }}>No ratings saved yet.</div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {rows.map((row) => (
            <div
              key={row.playerId}
              style={{
                padding: 14,
                borderRadius: 16,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "grid",
                gap: 6,
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 18 }}>{row.playerName}</div>
              <div style={{ color: "#475569" }}>
                Average: <strong>{row.averageRating.toFixed(2)}</strong> • Matches:{" "}
                <strong>{row.ratingsCount}</strong> • Best: <strong>{row.bestRating}</strong>
              </div>
              <div style={{ color: "#475569" }}>
                Recent form:{" "}
                <strong>{row.recentForm.length ? row.recentForm.join(" • ") : "—"}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
