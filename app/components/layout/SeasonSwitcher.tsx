"use client"

import type { SeasonItem } from "../../lib/dashboardTypes"

type Props = {
  seasons: SeasonItem[]
  activeSeasonId: string
  onChange: (id: string) => void
  onCreate: () => void
}

export default function SeasonSwitcher({
  seasons,
  activeSeasonId,
  onChange,
  onCreate,
}: Props) {
  const activeSeason = seasons.find((s) => s.id === activeSeasonId) || null

  return (
    <div
      className="sharks-glass"
      style={{
        borderRadius: 20,
        padding: 12,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        gap: 10,
        alignItems: "center",
        border: "1px solid rgba(125,211,252,0.22)",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "#94a3b8", fontSize: 10, fontWeight: 1000, letterSpacing: ".13em", textTransform: "uppercase" }}>
          Season
        </div>
        <div style={{ color: "white", fontSize: 18, fontWeight: 1000, lineHeight: 1.1 }}>
          {activeSeason?.name || "No season"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          value={activeSeasonId}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: 14,
            border: "1px solid rgba(125,211,252,0.24)",
            background: "rgba(15,23,42,0.92)",
            fontSize: 14,
            fontWeight: 900,
            color: "white",
            maxWidth: 150,
          }}
        >
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>

        <button
          onClick={onCreate}
          style={{
            border: "1px solid rgba(125,211,252,0.32)",
            background: "rgba(14,165,233,0.14)",
            color: "#bae6fd",
            borderRadius: 14,
            padding: "10px 12px",
            fontWeight: 1000,
            cursor: "pointer",
          }}
        >
          +
        </button>
      </div>
    </div>
  )
}
