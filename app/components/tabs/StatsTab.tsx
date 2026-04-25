"use client"

import { useMemo } from "react"
import { PageCard, SectionHeader } from "../ui"
import { THEME } from "../../lib/theme"
import LeagueTable from "../LeagueTable"

import type {
  LeagueResult,
  Player,
  PlayerMatchRating,
} from "../../lib/types"

type Props = {
  results: LeagueResult[]
  players: Player[]
  ratings: PlayerMatchRating[]
}

function StatCard({
  label,
  value,
  tone = "default",
  helper,
}: {
  label: string
  value: string | number
  tone?: "default" | "blue" | "green" | "yellow"
  helper?: string
}) {
  const style =
    tone === "blue"
      ? {
          background: "#dbeafe",
          border: "1px solid #bfdbfe",
          color: "#1d4ed8",
        }
      : tone === "green"
      ? {
          background: "#dcfce7",
          border: "1px solid #86efac",
          color: "#166534",
        }
      : tone === "yellow"
      ? {
          background: "#fef3c7",
          border: "1px solid #fcd34d",
          color: "#92400e",
        }
      : {
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          color: "#334155",
        }

  return (
    <div
      style={{
        ...style,
        borderRadius: 18,
        padding: 14,
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900 }}>{value}</div>
      {helper ? (
        <div style={{ fontSize: 12, opacity: 0.8 }}>{helper}</div>
      ) : null}
    </div>
  )
}

function ResultRow({ result }: { result: LeagueResult }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 12,
        background: "white",
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontWeight: 900 }}>
        {result.homeTeam} {result.homeScore} - {result.awayScore} {result.awayTeam}
      </div>
      <div style={{ color: "#64748b", fontSize: 13 }}>
        {result.playedOn}
      </div>
    </div>
  )
}

function FormBadge({ value }: { value: "W" | "D" | "L" }) {
  const style =
    value === "W"
      ? { background: "#dcfce7", color: "#166534" }
      : value === "D"
      ? { background: "#fef3c7", color: "#92400e" }
      : { background: "#fee2e2", color: "#991b1b" }

  return (
    <div
      style={{
        ...style,
        padding: "6px 10px",
        borderRadius: 999,
        fontWeight: 800,
        fontSize: 12,
      }}
    >
      {value}
    </div>
  )
}

export default function StatsTab({
  results,
  players,
  ratings,
}: Props) {
  const validResults = useMemo(() => {
    return results.filter(
      (r) =>
        typeof r.homeScore === "number" &&
        typeof r.awayScore === "number"
    )
  }, [results])

  const goalsFor = useMemo(
    () => validResults.reduce((sum, r) => sum + r.homeScore, 0),
    [validResults]
  )

  const goalsAgainst = useMemo(
    () => validResults.reduce((sum, r) => sum + r.awayScore, 0),
    [validResults]
  )

  const recentResults = [...validResults]
    .sort((a, b) => b.playedOn.localeCompare(a.playedOn))
    .slice(0, 5)

  const form = recentResults.map((r) => {
    if (r.homeScore > r.awayScore) return "W"
    if (r.homeScore < r.awayScore) return "L"
    return "D"
  })

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* SEASON STATS */}
      <PageCard>
        <SectionHeader
          title="Season Breakdown"
          subtitle="A quick summary of team output this season."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          <StatCard
            label="Goals For"
            value={goalsFor}
            tone="green"
            helper="Total scored"
          />
          <StatCard
            label="Goals Against"
            value={goalsAgainst}
            tone="yellow"
            helper="Total conceded"
          />
          <StatCard
            label="Squad Size"
            value={players.length}
            helper="Registered players"
          />
          <StatCard
            label="Ratings"
            value={ratings.length}
            tone="blue"
            helper="Saved feedback"
          />
        </div>
      </PageCard>

      {/* LEAGUE TABLE */}
      <PageCard>
        <SectionHeader
          title="League Table"
          subtitle="Auto-generated from match results"
        />

        <LeagueTable results={validResults} />
      </PageCard>

      {/* FORM */}
      <PageCard>
        <SectionHeader
          title="Recent Form"
          subtitle="Last five matches"
        />

        {form.length === 0 ? (
          <div style={{ color: "#64748b" }}>
            No recent results.
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            {form.map((f, i) => (
              <FormBadge key={i} value={f} />
            ))}
          </div>
        )}
      </PageCard>

      {/* RESULTS LIST */}
      <PageCard>
        <SectionHeader
          title="All Results"
          subtitle="Full list of completed matches"
        />

        {validResults.length === 0 ? (
          <div style={{ color: "#64748b" }}>
            No results recorded yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {validResults.map((r) => (
              <ResultRow key={r.id} result={r} />
            ))}
          </div>
        )}
      </PageCard>
    </div>
  )
}
