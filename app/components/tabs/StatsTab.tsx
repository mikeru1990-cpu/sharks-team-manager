"use client"

import { Badge, PageCard, SectionHeader } from "../ui"
import { THEME } from "../../lib/theme"
import type {
  LeagueResult,
  Player,
  PlayerMatchRating,
  TimelineItem,
} from "../../lib/types"

type Props = {
  teamName: string
  results: LeagueResult[]
  players: Player[]
  ratings: PlayerMatchRating[]
  timeline: TimelineItem[]
}

function formatPrettyDate(date: string) {
  try {
    return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return date
  }
}

function StatCard({
  label,
  value,
  tone = "default",
  subtext,
}: {
  label: string
  value: string | number
  tone?: "default" | "blue" | "green" | "yellow" | "red"
  subtext?: string
}) {
  const style =
    tone === "blue"
      ? {
          background: "#dbeafe",
          color: "#1d4ed8",
          border: "1px solid #bfdbfe",
        }
      : tone === "green"
      ? {
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #86efac",
        }
      : tone === "yellow"
      ? {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fcd34d",
        }
      : tone === "red"
      ? {
          background: "#fee2e2",
          color: "#991b1b",
          border: "1px solid #fecaca",
        }
      : {
          background: "#f8fafc",
          color: "#334155",
          border: "1px solid #e2e8f0",
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
      <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.9 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.05 }}>{value}</div>
      {subtext ? (
        <div style={{ fontSize: 12, opacity: 0.9 }}>{subtext}</div>
      ) : null}
    </div>
  )
}

function getResultTone(result: "W" | "D" | "L") {
  if (result === "W") return "green"
  if (result === "D") return "yellow"
  return "red"
}

function getScoreOutcome(result: LeagueResult, teamName: string): "W" | "D" | "L" {
  const isHome = result.homeTeam === teamName
  const teamGoals = isHome ? result.homeScore : result.awayScore
  const oppGoals = isHome ? result.awayScore : result.homeScore

  if (teamGoals > oppGoals) return "W"
  if (teamGoals < oppGoals) return "L"
  return "D"
}

function initials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function StatsTab({
  teamName,
  results,
  players,
  ratings,
  timeline,
}: Props) {
  const sortedResults = [...results].sort((a, b) => b.playedOn.localeCompare(a.playedOn))

  const matchesPlayed = sortedResults.length

  const summary = sortedResults.reduce(
    (acc, result) => {
      const isHome = result.homeTeam === teamName
      const goalsFor = isHome ? result.homeScore : result.awayScore
      const goalsAgainst = isHome ? result.awayScore : result.homeScore
      const outcome = getScoreOutcome(result, teamName)

      acc.goalsFor += goalsFor
      acc.goalsAgainst += goalsAgainst

      if (outcome === "W") acc.wins += 1
      else if (outcome === "D") acc.draws += 1
      else acc.losses += 1

      return acc
    },
    {
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    }
  )

  const points = summary.wins * 3 + summary.draws
  const goalDifference = summary.goalsFor - summary.goalsAgainst

  const form = sortedResults.slice(0, 5).map((result) => getScoreOutcome(result, teamName))

  const ratingsByPlayer = players
    .map((player) => {
      const playerRatings = ratings.filter((rating) => rating.playerId === player.id)
      const average =
        playerRatings.length > 0
          ? playerRatings.reduce((sum, item) => sum + item.rating, 0) / playerRatings.length
          : null

      return {
        player,
        average,
        count: playerRatings.length,
      }
    })
    .filter((item) => item.count > 0)
    .sort((a, b) => {
      const aAvg = a.average ?? 0
      const bAvg = b.average ?? 0
      if (bAvg !== aAvg) return bAvg - aAvg
      return b.count - a.count
    })

  const topRated = ratingsByPlayer.slice(0, 5)

  const totalRatings = ratings.length
  const averageTeamRating =
    totalRatings > 0
      ? (
          ratings.reduce((sum, item) => sum + item.rating, 0) / totalRatings
        ).toFixed(1)
      : "—"

  const recentResults = sortedResults.slice(0, 8)

  const totalGoalsLogged = timeline.filter((item) => item.type === "goal").length

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard tone="blue">
        <SectionHeader
          title="Team Stats"
          subtitle="Results, form, rating trends and season overview."
          light
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 10,
            marginTop: 8,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 18,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.82 }}>PLAYED</div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 4 }}>{matchesPlayed}</div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.16)",
              borderRadius: 18,
              padding: 14,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.82 }}>POINTS</div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 4 }}>{points}</div>
          </div>

          <div
            style={{
              background: "rgba(250,204,21,0.16)",
              border: "1px solid rgba(250,204,21,0.28)",
              borderRadius: 18,
              padding: 14,
              color: "#fef08a",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.92 }}>AVG RATING</div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 4 }}>{averageTeamRating}</div>
          </div>
        </div>
      </PageCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard label="Wins" value={summary.wins} tone="green" />
        <StatCard label="Draws" value={summary.draws} tone="yellow" />
        <StatCard label="Losses" value={summary.losses} tone="red" />
        <StatCard label="Goal Difference" value={goalDifference >= 0 ? `+${goalDifference}` : goalDifference} tone="blue" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)",
          gap: 16,
        }}
      >
        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader
              title="Recent Form"
              subtitle="Last five results"
            />

            {form.length === 0 ? (
              <div
                style={{
                  borderRadius: 16,
                  border: "1px dashed #cbd5e1",
                  background: "#f8fafc",
                  padding: 16,
                  color: THEME.colors.textSecondary,
                }}
              >
                No results saved yet.
              </div>
            ) : (
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {form.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 16,
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 900,
                      fontSize: 20,
                      background:
                        item === "W"
                          ? "#dcfce7"
                          : item === "D"
                          ? "#fef3c7"
                          : "#fee2e2",
                      color:
                        item === "W"
                          ? "#166534"
                          : item === "D"
                          ? "#92400e"
                          : "#991b1b",
                      border:
                        item === "W"
                          ? "1px solid #86efac"
                          : item === "D"
                          ? "1px solid #fcd34d"
                          : "1px solid #fecaca",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </PageCard>

          <PageCard>
            <SectionHeader
              title="Recent Results"
              subtitle="Latest saved fixtures and scorelines."
            />

            {recentResults.length === 0 ? (
              <div
                style={{
                  borderRadius: 16,
                  border: "1px dashed #cbd5e1",
                  background: "#f8fafc",
                  padding: 16,
                  color: THEME.colors.textSecondary,
                }}
              >
                No results recorded yet.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {recentResults.map((result) => {
                  const outcome = getScoreOutcome(result, teamName)
                  return (
                    <div
                      key={result.id}
                      style={{
                        border: "1px solid #e2e8f0",
                        borderRadius: 18,
                        padding: 14,
                        background: "white",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <Badge tone={getResultTone(outcome)}>{outcome}</Badge>
                          <Badge>{formatPrettyDate(result.playedOn)}</Badge>
                          {result.competition ? <Badge>{result.competition}</Badge> : null}
                        </div>
                      </div>

                      <div
                        style={{
                          fontSize: 18,
                          fontWeight: 900,
                          color: THEME.colors.textPrimary,
                          lineHeight: 1.25,
                        }}
                      >
                        {result.homeTeam} {result.homeScore} - {result.awayScore} {result.awayTeam}
                      </div>

                      <div style={{ color: THEME.colors.textSecondary, fontSize: 14 }}>
                        Opponent: {result.opponent || (result.homeTeam === teamName ? result.awayTeam : result.homeTeam)}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </PageCard>
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader
              title="Season Totals"
              subtitle="Quick team summary."
            />

            <div style={{ display: "grid", gap: 10 }}>
              <StatCard label="Goals For" value={summary.goalsFor} tone="green" />
              <StatCard label="Goals Against" value={summary.goalsAgainst} tone="red" />
              <StatCard label="Live Goals Logged" value={totalGoalsLogged} tone="blue" subtext="From active timeline feed" />
            </div>
          </PageCard>

          <PageCard>
            <SectionHeader
              title="Top Rated Players"
              subtitle="Based on saved match feedback."
            />

            {topRated.length === 0 ? (
              <div
                style={{
                  borderRadius: 16,
                  border: "1px dashed #cbd5e1",
                  background: "#f8fafc",
                  padding: 16,
                  color: THEME.colors.textSecondary,
                }}
              >
                No player ratings yet.
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {topRated.map((item, index) => (
                  <div
                    key={item.player.id}
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 18,
                      padding: 12,
                      background: index === 0 ? "#eff6ff" : "white",
                      display: "grid",
                      gridTemplateColumns: "auto minmax(0, 1fr) auto",
                      gap: 12,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background: index === 0 ? THEME.colors.primary : "#f1f5f9",
                        color: index === 0 ? "white" : THEME.colors.textPrimary,
                        fontWeight: 900,
                        fontSize: 13,
                      }}
                    >
                      {initials(item.player.name)}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 900,
                          color: THEME.colors.textPrimary,
                          fontSize: 15,
                          lineHeight: 1.2,
                        }}
                      >
                        {item.player.name}
                      </div>
                      <div
                        style={{
                          color: THEME.colors.textSecondary,
                          fontSize: 13,
                          marginTop: 4,
                        }}
                      >
                        {item.count} rating{item.count === 1 ? "" : "s"}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 22,
                          color: THEME.colors.primary,
                          lineHeight: 1,
                        }}
                      >
                        {item.average?.toFixed(1)}
                      </div>
                      <div
                        style={{
                          color: THEME.colors.textSecondary,
                          fontSize: 12,
                          marginTop: 4,
                        }}
                      >
                        avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </PageCard>
        </div>
      </div>
    </div>
  )
}
