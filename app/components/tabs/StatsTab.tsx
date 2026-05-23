"use client"

import { useMemo } from "react"
import { PageCard, SectionHeader, Badge } from "../ui"
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

function AnalyticsCard({ label, value, helper, tone = "#38bdf8" }: { label: string; value: string | number; helper?: string; tone?: string }) {
  return (
    <div className="sharks-elite-panel sharks-card-shine" style={{ padding: 18, border: `1px solid ${tone}44`, boxShadow: `0 18px 42px ${tone}14` }}>
      <div style={{ color: "#aebed4", fontSize: 11, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 8, color: tone, fontSize: 38, fontWeight: 1000, lineHeight: 1 }}>{value}</div>
      {helper ? <div style={{ marginTop: 7, color: "#cbd5e1", fontSize: 13, fontWeight: 700 }}>{helper}</div> : null}
    </div>
  )
}

function FormBadge({ value }: { value: "W" | "D" | "L" }) {
  const tone = value === "W" ? "#22c55e" : value === "D" ? "#facc15" : "#ef4444"
  return (
    <div style={{ minWidth: 46, textAlign: "center", padding: "10px 13px", borderRadius: 999, fontWeight: 1000, fontSize: 13, color: "white", background: `${tone}33`, border: `1px solid ${tone}88`, boxShadow: `0 0 22px ${tone}22` }}>
      {value}
    </div>
  )
}

function ResultRow({ result }: { result: LeagueResult }) {
  const outcome = getOutcome(result)
  const { ourScore, theirScore, opponent } = getOurScores(result)
  const tone = outcome === "W" ? "#22c55e" : outcome === "D" ? "#facc15" : "#ef4444"

  return (
    <div style={{ border: `1px solid ${tone}44`, borderRadius: 20, padding: 14, background: "rgba(15,23,42,0.66)", display: "grid", gap: 6, boxShadow: `0 12px 30px ${tone}10` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
        <div style={{ fontWeight: 1000, color: "white" }}>{TEAM_NAME}</div>
        <Badge tone={outcome === "W" ? "green" : outcome === "D" ? "yellow" : "red"}>{outcome}</Badge>
      </div>
      <div style={{ color: "#e2e8f0", fontWeight: 850 }}>{ourScore} - {theirScore} vs {opponent}</div>
      <div style={{ color: "#94a3b8", fontSize: 13, fontWeight: 700 }}>{result.playedOn}</div>
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
  if (first === "W") return `${count} game winning streak`
  if (first === "D") return `${count} game drawing streak`
  return `${count} loss${count === 1 ? "" : "es"} in a row`
}

function opponentRows(results: LeagueResult[]) {
  const map = new Map<string, { played: number; won: number; drawn: number; lost: number; gf: number; ga: number; last: string }>()
  for (const result of results) {
    const { ourScore, theirScore, opponent } = getOurScores(result)
    const outcome = getOutcome(result)
    const row = map.get(opponent) || { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, last: "" }
    row.played += 1
    row.gf += ourScore
    row.ga += theirScore
    if (outcome === "W") row.won += 1
    if (outcome === "D") row.drawn += 1
    if (outcome === "L") row.lost += 1
    if (!row.last || result.playedOn > row.last) row.last = `${ourScore}-${theirScore}`
    map.set(opponent, row)
  }
  return Array.from(map.entries()).map(([opponent, row]) => ({ opponent, ...row, gd: row.gf - row.ga })).sort((a, b) => b.played - a.played || b.gd - a.gd)
}

export default function StatsTab({ results, players, ratings }: Props) {
  const validResults = useMemo(() => results.filter((r) => typeof r.homeScore === "number" && typeof r.awayScore === "number" && (isOurTeam(r.homeTeam) || isOurTeam(r.awayTeam))), [results])
  const goalsFor = useMemo(() => validResults.reduce((sum, r) => sum + getOurScores(r).ourScore, 0), [validResults])
  const goalsAgainst = useMemo(() => validResults.reduce((sum, r) => sum + getOurScores(r).theirScore, 0), [validResults])
  const wins = validResults.filter((r) => getOutcome(r) === "W").length
  const draws = validResults.filter((r) => getOutcome(r) === "D").length
  const losses = validResults.filter((r) => getOutcome(r) === "L").length
  const recentResults = [...validResults].sort((a, b) => b.playedOn.localeCompare(a.playedOn)).slice(0, 5)
  const form = recentResults.map(getOutcome)
  const streakText = getStreakText(form)
  const opponents = opponentRows(validResults)
  const winRate = validResults.length ? Math.round((wins / validResults.length) * 100) : 0

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="sharks-elite-panel sharks-card-shine" style={{ padding: 22, position: "relative", overflow: "hidden" }}>
        <div className="sharks-hero-watermark" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <SectionHeader title="Elite Analytics Hub" subtitle="Performance trends, form, opponent records and squad data." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
            <AnalyticsCard label="Played" value={validResults.length} helper="completed matches" />
            <AnalyticsCard label="Win Rate" value={`${winRate}%`} helper={`${wins}W ${draws}D ${losses}L`} tone="#22c55e" />
            <AnalyticsCard label="Goals For" value={goalsFor} helper="total scored" tone="#38bdf8" />
            <AnalyticsCard label="Goal Diff" value={goalsFor - goalsAgainst} helper={`${goalsAgainst} conceded`} tone="#facc15" />
          </div>
        </div>
      </div>

      <PageCard>
        <SectionHeader title="Recent Form" subtitle="Latest five matches and momentum trend." />
        {form.length === 0 ? <div style={{ color: "#aebed4" }}>No recent results.</div> : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{form.map((f, i) => <FormBadge key={i} value={f} />)}</div>
            <div className="sharks-glass" style={{ padding: 16, borderRadius: 20, color: "white", fontWeight: 1000 }}>{streakText}</div>
            <div style={{ display: "grid", gap: 10 }}>{recentResults.map((r) => <ResultRow key={r.id} result={r} />)}</div>
          </div>
        )}
      </PageCard>

      <PageCard>
        <SectionHeader title="Head-to-Head Opponent Records" subtitle="Opponent history replacing the old flat league-only view." />
        {opponents.length === 0 ? <div style={{ color: "#aebed4" }}>No opponent records yet.</div> : (
          <div style={{ display: "grid", gap: 10 }}>
            {opponents.map((row) => (
              <div key={row.opponent} className="sharks-glass" style={{ borderRadius: 18, padding: 14, display: "grid", gridTemplateColumns: "minmax(0, 1.5fr) repeat(5, auto)", gap: 12, alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "white", fontWeight: 1000 }}>{row.opponent}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 700 }}>Last: {row.last}</div>
                </div>
                <Badge>{row.played}P</Badge>
                <Badge tone="green">{row.won}W</Badge>
                <Badge tone="yellow">{row.drawn}D</Badge>
                <Badge tone="red">{row.lost}L</Badge>
                <Badge tone={row.gd >= 0 ? "green" : "red"}>GD {row.gd}</Badge>
              </div>
            ))}
          </div>
        )}
      </PageCard>

      <PageCard>
        <SectionHeader title="League Table" subtitle="Auto-generated from match results" />
        <LeagueTable results={validResults} />
      </PageCard>

      <PageCard>
        <SectionHeader title="All Results" subtitle="Full list of completed matches" />
        {validResults.length === 0 ? <div style={{ color: "#aebed4" }}>No results recorded yet.</div> : <div style={{ display: "grid", gap: 10 }}>{[...validResults].sort((a, b) => b.playedOn.localeCompare(a.playedOn)).map((r) => <ResultRow key={r.id} result={r} />)}</div>}
      </PageCard>
    </div>
  )
}
