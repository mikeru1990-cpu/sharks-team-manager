"use client"

import { buttonPrimary, buttonSecondary } from "../../lib/types"
import type { Season } from "../../lib/dashboardTypes"

type Props = {
  isAdmin: boolean
  seasons: Season[]
  activeSeasonId: string
  setActiveSeasonId: (value: string) => void
  onOpenCreateSeason: () => void
}

export default function SeasonSwitcher({
  isAdmin,
  seasons,
  activeSeasonId,
  setActiveSeasonId,
  onOpenCreateSeason,
}: Props) {
  const activeSeason =
    seasons.find((season) => season.id === activeSeasonId) || null

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: "#64748b",
            textTransform: "uppercase",
            letterSpacing: 0.3,
          }}
        >
          Season
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 22,
            fontWeight: 900,
            color: "#0f172a",
          }}
        >
          {activeSeason?.name || "No season selected"}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <select
          value={activeSeasonId}
          onChange={(e) => setActiveSeasonId(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            background: "white",
            fontSize: 15,
            fontWeight: 700,
            minWidth: 180,
          }}
        >
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>

        {isAdmin ? (
          <button onClick={onOpenCreateSeason} style={buttonPrimary()}>
            New Season
          </button>
        ) : null}
      </div>
    </div>
  )
}
