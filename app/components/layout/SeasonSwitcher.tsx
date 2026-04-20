"use client"

import type { SeasonItem } from "../../lib/dashboardTypes"
import { THEME } from "../../lib/theme"
import { PrimaryButton, SectionHeader } from "../ui"

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
      style={{
        background: "white",
        border: "1px solid #dbe3ef",
        borderRadius: 24,
        padding: 16,
        boxShadow: "0 10px 30px rgba(15,23,42,0.06)",
        display: "grid",
        gap: 14,
      }}
    >
      <SectionHeader
        title="Season"
        subtitle={activeSeason ? `Currently viewing ${activeSeason.name}` : "No active season selected"}
        action={
          <div style={{ minWidth: 130 }}>
            <PrimaryButton onClick={onCreate}>New Season</PrimaryButton>
          </div>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div
          style={{
            borderRadius: 18,
            padding: 14,
            background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
            border: "1px solid #dbeafe",
            display: "grid",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: THEME.colors.textSecondary,
              textTransform: "uppercase",
            }}
          >
            Active Season
          </div>
          <div
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: THEME.colors.textPrimary,
              lineHeight: 1.1,
            }}
          >
            {activeSeason?.name || "No season"}
          </div>
          {activeSeason ? (
            <div style={{ color: THEME.colors.textSecondary, fontSize: 13 }}>
              {activeSeason.startDate} → {activeSeason.endDate}
            </div>
          ) : null}
        </div>

        <select
          value={activeSeasonId}
          onChange={(e) => onChange(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 14,
            border: "1px solid #cbd5e1",
            background: "white",
            fontSize: 15,
            fontWeight: 700,
            minWidth: 200,
            color: THEME.colors.textPrimary,
          }}
        >
          {seasons.map((season) => (
            <option key={season.id} value={season.id}>
              {season.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
