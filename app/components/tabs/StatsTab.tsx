"use client"

import { THEME } from "../../lib/theme"
import { Badge, PageCard, SectionHeader } from "../ui"
import type { LeagueResult, Player, PlayerMatchRating, TimelineItem } from "../../lib/types"

type Props = {
  teamName: string
  results: LeagueResult[]
  players: Player[]
  ratings: PlayerMatchRating[]
  timeline: TimelineItem[]
}

type Outcome = "W" | "D" | "L"

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

function normalize(value?: string) {
  return (value || "").trim().toLowerCase()
}

function isOurTeamHome(result: LeagueResult, teamName: string) {
  return normalize(result.homeTeam) === normalize(teamName)
}

function getTeamScore(result: LeagueResult, teamName: string) {
  return isOurTeamHome(result, teamName) ? result.homeScore : result.awayScore
}

function getOpponentScore(result: LeagueResult, teamName: string) {
  return isOurTeamHome(result, teamName) ? result.awayScore : result.homeScore
}

function getOpponentName(result: LeagueResult, teamName: string) {
  return isOurTeamHome(result, teamName) ? result.awayTeam : result.homeTeam
}

function getOutcome(result: LeagueResult, teamName: string): Outcome {
  const ourScore = getTeamScore(result, teamName)
  const theirScore = getOpponentScore(result, teamName)

  if (ourScore > theirScore) return "W"
  if (ourScore < theirScore) return "L"
  return "D"
}

function outcomeTone(outcome: Outcome): "green" | "yellow" | "red" {
  if (outcome === "W") return "green"
  if (outcome === "D") return "yellow"
  return "red"
}

function getWinningMargin(result: LeagueResult, teamName: string) {
  return getTeamScore(result, teamName) - getOpponentScore(result, teamName)
}

function StatCard({
  label,
  value,
  helper,
  tone = "default",
}: {
  label: string
  value: string | number
  helper?: string
  tone?: "default" | "blue" | "green" | "yellow"
}) {
  const toneStyle =
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
        ...toneStyle,
        borderRadius: 20,
        padding: 16,
        display: "grid",
        gap: 6,
        boxShadow: "0 6px 14px rgba(15,23,42,0.05)",
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.9 }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 900, lineHeight: 1.05 }}>{value}</div>
      {helper ? <div style={{ fontSize: 13, opacity: 0.9 }}>{helper}</div> : null}
    </div>
  )
}

function InsightCard({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px solid #e2e8f0",
        background: "white",
        padding: 16,
        display: "grid",
        gap: 6,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 16, color: THEME.colors.textPrimary }}>
        {title}
      </div>
      <div style={{ color: THEME.colors.textSecondary, fontSize: 14, lineHeight: 1.5 }}>
        {body}
      </div>
    </div>
  )
}

export default function StatsTab({
  teamName,
  results,
  players,
  ratings,
}: Props) {
  const validResults = results
    .filter(
      (item) =>
        typeof item.homeScore === "number" &&
        typeof item.awayScore === "number" &&
        !!item.homeTeam &&
        !!item.awayTeam
    )
    .slice()
    .sort((a, b) => a.playedOn.localeCompare(b.playedOn))

  const played = validResults.length
  const wins = validResults.filter((item) => getOutcome(item, teamName) === "W").length
  const draws = validResults.filter((item) => getOutcome(item, teamName) === "D").length
  const losses = validResults.filter((item) => getOutcome(item, teamName) === "L").length

  const goalsFor = validResults.reduce((sum, item) => sum + getTeamScore(item, teamName), 0)
  const goalsAgainst = validResults.reduce((sum, item) => sum + getOpponentScore(item, teamName), 0)
  const goalDifference = goalsFor - goalsAgainst
  const points = wins * 3 + draws

  const lastFive = validResults.slice(-5)
  const form = [...lastFive].reverse().map((item) => getOutcome(item, teamName))

  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length).toFixed(1)
      : "—"

  const playerScoreMap: Record<string, number> = {}
  for (const rating of ratings) {
    playerScoreMap[rating.playerId] = (playerScoreMap[rating.playerId] || 0) + rating.rating
  }

  const topPlayerId =
    Object.entries(playerScoreMap).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  const topPlayer = players.find((player) => player.id === topPlayerId) || null

  const biggestWin =
    validResults
      .filter((item) => getOutcome(item, teamName) === "W")
      .slice()
      .sort((a, b) => {
        const marginDiff = getWinningMargin(b, teamName) - getWinningMargin(a, teamName)
        if (marginDiff !== 0) return marginDiff
        return b.playedOn.localeCompare(a.playedOn)
      })[0] || null

  const toughestLoss =
    validResults
      .filter((item) => getOutcome(item, teamName) === "L")
      .slice()
      .sort((a, b) => {
        const marginDiff = getWinningMargin(a, teamName) - getWinningMargin(b, teamName)
        if (marginDiff !== 0) return marginDiff
        return b.playedOn.localeCompare(a.playedOn)
      })[0] || null

  const scoringTrend =
    played === 0
      ? "No matches logged yet."
      : goalsFor / played >= 2
      ? "Attack output is trending well with regular scoring."
      : goalsFor / played >= 1
      ? "Attack is producing chances, with room for more consistency."
      : "Scoring is still a challenge — focus on chance creation and finishing."

  const defensiveTrend =
    played === 0
      ? "No defensive data yet."
      : goalsAgainst / played <= 1.5
      ? "Defensive record is holding up well."
      : goalsAgainst / played <= 3
      ? "Defensive performance is mixed but improving is realistic."
      : "Conceding rate is high — shape and recovery runs may need attention."

  const formInsight =
    form.length === 0
      ? "No recent form data available yet."
      : form.filter((item) => item === "W").length >= 3
      ? "Recent form is strong, with momentum building."
      : form.filter((item) => item === "L").length >= 3
      ? "Recent results have been tough, but this is a good point to focus on clear improvement targets."
      : "Recent form is mixed, showing both progress and inconsistency."

  return (
    <div style={{ display: "grid", gap: 20 }}>
      <PageCard tone="blue">
        <SectionHeader
          title="Team Stats"
          subtitle="Results, form, rating trends and season overview."
          light
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            marginTop: 10,
          }}
        >
          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 20,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.82 }}>PLAYED</div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>{played}</div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.14)",
              borderRadius: 20,
              padding: 16,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.82 }}>POINTS</div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>{points}</div>
          </div>

          <div
            style={{
              background: "rgba(250,204,21,0.16)",
              border: "1px solid rgba(250,204,21,0.24)",
              borderRadius: 20,
              padding: 16,
              color: "#fef08a",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.92 }}>AVG RATING</div>
            <div style={{ fontSize: 30, fontWeight: 900, marginTop: 6 }}>{avgRating}</div>
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
        <StatCard label="Wins" value={wins} tone="green" />
        <StatCard label="Draws" value={draws} tone="yellow" />
        <StatCard label="Losses" value={losses} />
        <StatCard
          label="Goal Difference"
          value={goalDifference >= 0 ? `+${goalDifference}` : goalDifference}
          tone="blue"
        />
      </div>

      <PageCard>
        <SectionHeader
          title="Season Breakdown"
          subtitle="A quick summary of team output this season."
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <StatCard label="Goals For" value={goalsFor} tone="green" helper="Total scored" />
          <StatCard
            label="Goals Against"
            value={goalsAgainst}
            tone="yellow"
            helper="Total conceded"
          />
          <StatCard label="Squad Size" value={players.length} helper="Registered players" />
          <StatCard
            label="Rated Performances"
            value={ratings.length}
            tone="blue"
            helper="Saved feedback entries"
          />
        </div>
      </PageCard>

      <PageCard>
        <SectionHeader title="Recent Form" subtitle="Last five logged results." />

        {form.length === 0 ? (
          <div style={{ color: THEME.colors.textSecondary }}>No recent form yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {form.map((item, index) => (
                <Badge key={index} tone={outcomeTone(item)}>
                  {item}
                </Badge>
              ))}
            </div>

            <div style={{ color: THEME.colors.textSecondary, fontSize: 14, lineHeight: 1.5 }}>
              {formInsight}
            </div>
          </div>
        )}
      </PageCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <PageCard>
          <SectionHeader
            title="Coaching Insights"
            subtitle="Quick narrative summary from results."
          />
          <div style={{ display: "grid", gap: 10 }}>
            <InsightCard title="Attack" body={scoringTrend} />
            <InsightCard title="Defence" body={defensiveTrend} />
          </div>
        </PageCard>

        <PageCard>
          <SectionHeader title="Top Performer" subtitle="Based on saved match ratings." />
          {topPlayer ? (
            <div
              style={{
                borderRadius: 18,
                padding: 16,
                background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
                border: "1px solid #dbeafe",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 900 }}>{topPlayer.name}</div>
              <div style={{ color: THEME.colors.textSecondary, fontSize: 14 }}>
                Positions: {topPlayer.positions.join(" / ")}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {topPlayer.mainGK ? <Badge tone="blue">Main GK</Badge> : null}
                {topPlayer.backupGK ? <Badge tone="blue">Backup GK</Badge> : null}
                {topPlayer.captain ? <Badge tone="yellow">Captain</Badge> : null}
                {topPlayer.viceCaptain ? <Badge tone="yellow">Vice Captain</Badge> : null}
              </div>
            </div>
          ) : (
            <div style={{ color: THEME.colors.textSecondary }}>No rating data saved yet.</div>
          )}
        </PageCard>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
        }}
      >
        <PageCard>
          <SectionHeader title="Best Result" subtitle="Strongest winning margin so far." />
          {biggestWin ? (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>
                {biggestWin.homeTeam} {biggestWin.homeScore} - {biggestWin.awayScore}{" "}
                {biggestWin.awayTeam}
              </div>
              <div style={{ color: THEME.colors.textSecondary, fontSize: 14 }}>
                {formatPrettyDate(biggestWin.playedOn)}
              </div>
              <Badge tone="green">{getOpponentName(biggestWin, teamName)}</Badge>
            </div>
          ) : (
            <div style={{ color: THEME.colors.textSecondary }}>No wins logged yet.</div>
          )}
        </PageCard>

        <PageCard>
          <SectionHeader title="Toughest Result" subtitle="Largest losing margin so far." />
          {toughestLoss ? (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>
                {toughestLoss.homeTeam} {toughestLoss.homeScore} - {toughestLoss.awayScore}{" "}
                {toughestLoss.awayTeam}
              </div>
              <div style={{ color: THEME.colors.textSecondary, fontSize: 14 }}>
                {formatPrettyDate(toughestLoss.playedOn)}
              </div>
              <Badge tone="red">{getOpponentName(toughestLoss, teamName)}</Badge>
            </div>
          ) : (
            <div style={{ color: THEME.colors.textSecondary }}>No losses logged yet.</div>
          )}
        </PageCard>
      </div>

      <PageCard>
        <SectionHeader
          title="All Logged Results"
          subtitle="Season result list used for this summary."
        />

        {validResults.length === 0 ? (
          <div style={{ color: THEME.colors.textSecondary }}>No result data available yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {[...validResults].reverse().map((result) => {
              const outcome = getOutcome(result, teamName)

              return (
                <div
                  key={result.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 18,
                    padding: 14,
                    background: "white",
                    display: "grid",
                    gap: 6,
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
                    <div style={{ fontWeight: 800, color: THEME.colors.textPrimary }}>
                      {getOpponentName(result, teamName)}
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <Badge tone={outcomeTone(outcome)}>{outcome}</Badge>
                      <Badge>{formatPrettyDate(result.playedOn)}</Badge>
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

                  {result.competition ? (
                    <div style={{ color: THEME.colors.textSecondary, fontSize: 13 }}>
                      {result.competition}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        )}
      </PageCard>
    </div>
  )
}
