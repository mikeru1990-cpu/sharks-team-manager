"use client"

import { useMemo } from "react"
import { PageCard, SectionHeader } from "../ui"
import LeagueTable from "../LeagueTable"
import type { LeagueResult, Player, PlayerMatchRating } from "../../lib/types"

type Props = {
  teamName?: string
  results: LeagueResult[]
  players: Player[]
  ratings: PlayerMatchRating[]
  timeline?: any[]
}

const TEAM_NAME = "Leonard Stanley U10 Lionesses"

function isOurTeam(name: string) {
  const text = name.toLowerCase()
  return text.includes("leonard stanley") && text.includes("u10") && text.includes("lionesses")
}

function getOurScores(result: LeagueResult) {
  const home = isOurTeam(result.homeTeam)
  return {
    ourScore: home ? result.homeScore : result.awayScore,
    theirScore: home ? result.awayScore : result.homeScore,
    opponent: home ? result.awayTeam : result.homeTeam,
  }
}

function getOutcome(result: LeagueResult): "W" | "D" | "L" {
  const { ourScore, theirScore } = getOurScores(result)
  if (ourScore > theirScore) return "W"
  if (ourScore < theirScore) return "L"
  return "D"
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
      ? { background: "#dbeafe", border: "1px solid #bfdbfe", color: "#1d4ed8" }
      : tone === "green"
      ? { background: "#dcfce7", border: "1px solid #86efac", color: "#166534" }
      : tone === "yellow"
      ? { background: "#fef3c7", border: "1px solid #fcd34d", color: "#92400e" }
      : { background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155" }

  return (
    <div style={{ ...style, borderRadius: 18, padding: 14, display: "grid", gap: 4 }}>
      <div style={{ fontSize: 12, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900 }}>{value}</div>
      {helper ? <div style={{ fontSize: 12, opacity: 0.8 }}>{helper}</div> : null}
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
        minWidth: 42,
        textAlign: "center",
        padding: "8px 12px",
        borderRadius: 999,
        fontWeight: 900,
        fontSize: 13,
      }}
    >
      {value}
    </div>
  )
}

function ResultRow({ result }: { result: LeagueResult }) {
  const outcome = getOutcome(result)
  const { ourScore, theirScore, opponent } = getOurScores(result)

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
        {TEAM_NAME} {ourScore} - {theirScore} {opponent}
      </div>
      <div style={{ color: "#64748b", fontSize: 13 }}>
        {result.playedOn} • {outcome}
      </div>
    </div>
  )
}

function getStreakText(form: Array<"W" | "D" | "L">) {
  if (form.length === 0) return "No form data yet."

  const first = form[0]
  let count = 0

  for (const item of form) {
    if (item === first) count++
    else break
  }

  if (first === "W") return `🔥 ${count} game winning streak`
  if (first === "D") return `🤝 ${count} game drawing streak`
  return `Reset point: ${count} loss${count === 1 ? "" : "es"} in a row`
}

export default function StatsTab({ results, players, ratings }: Props) {
  const validResults = useMemo(() => {
    return results.filter(
      (r) =>
        typeof r.homeScore === "number" &&
        typeof r.awayScore === "number" &&
        (isOurTeam(r.homeTeam) || isOurTeam(r.awayTeam))
    )
  }, [results])

  const goalsFor = useMemo(
    () => validResults.reduce((sum, r) => sum + getOurScores(r).ourScore, 0),
    [validResults]
  )

  const goalsAgainst = useMemo(
    () => validResults.reduce((sum, r) => sum + getOurScores(r).theirScore, 0),
    [validResults]
  )

  const recentResults = [...validResults]
    .sort((a, b) => b.playedOn.localeCompare(a.playedOn))
    .slice(0, 5)

  const form = recentResults.map(getOutcome)
  const streakText = getStreakText(form)

  return (
    <div style={{ display: "grid", gap: 16 }}>
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
          <StatCard label="Goals For" value={goalsFor} tone="green" helper="Total scored" />
          <StatCard label="Goals Against" value={goalsAgainst} tone="yellow" helper="Total conceded" />
          <StatCard label="Squad Size" value={players.length} helper="Registered players" />
          <StatCard label="Ratings" value={ratings.length} tone="blue" helper="Saved feedback" />
        </div>
      </PageCard>

      <PageCard>
        <SectionHeader title="League Table" subtitle="Auto-generated from match results" />
        <LeagueTable results={validResults} />
      </PageCard>

      <PageCard>
        <SectionHeader title="Recent Form" subtitle="Your latest five matches" />

        {form.length === 0 ? (
          <div style={{ color: "#64748b" }}>No recent results.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {form.map((f, i) => (
                <FormBadge key={i} value={f} />
              ))}
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                fontWeight: 900,
                color: "#334155",
              }}
            >
              {streakText}
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {recentResults.map((r) => {
                const { ourScore, theirScore, opponent } = getOurScores(r)
                return (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: 10,
                      borderRadius: 14,
                      background: "white",
                      border: "1px solid #e2e8f0",
                      fontSize: 13,
                    }}
                  >
                    <strong>{getOutcome(r)}</strong>
                    <span>
                      {ourScore}-{theirScore} vs {opponent}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </PageCard>

      <PageCard>
        <SectionHeader title="All Results" subtitle="Full list of completed matches" />

        {validResults.length === 0 ? (
          <div style={{ color: "#64748b" }}>No results recorded yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {[...validResults]
              .sort((a, b) => b.playedOn.localeCompare(a.playedOn))
              .map((r) => (
                <ResultRow key={r.id} result={r} />
              ))}
          </div>
        )}
      </PageCard>
    </div>
  )
}
