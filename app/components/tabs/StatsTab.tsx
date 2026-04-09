"use client"

import { useMemo, useState } from "react"
import {
  formatMinutes,
  type LeagueResult,
  type Player,
  type PlayerMatchRating,
  type TimelineItem,
} from "../../lib/types"
import { Badge, PageCard, SectionHeader } from "../ui"

type StatsView = "overview" | "players" | "headToHead" | "history"

type Props = {
  teamName: string
  results: LeagueResult[]
  players: Player[]
  ratings: PlayerMatchRating[]
  timeline: TimelineItem[]
}

function normalizeTeamName(name: string) {
  const value = name.trim()

  const map: Record<string, string> = {
    "U10 Lionesses 25/26": "Leonard Stanley U10 Lioness",
    "U10 Lionesses": "Leonard Stanley U10 Lioness",
    "Sharks Lioness": "Leonard Stanley U10 Lioness",
    "Sharks Lionesses": "Leonard Stanley U10 Lioness",
    "Leonard Stanley U10 Lioness 25/26": "Leonard Stanley U10 Lioness",
    "Leonard Stanley U10 Lioness": "Leonard Stanley U10 Lioness",

    "Tewkesbury Town Colts Youth U10": "Tewkesbury Town Colts",
    "Tewkesbury Town Colts Youth": "Tewkesbury Town Colts",
    "Tewkesbury Town Colts Youth U10 ": "Tewkesbury Town Colts",

    "Stonehouse TownYouth U10": "Stonehouse Town",
    "Stonehouse Town Youth U10": "Stonehouse Town",
    "Stonehouse Town Youth": "Stonehouse Town",

    "Rodborough Youth U10 Lioness": "Rodborough Lionesses",
    "Rodborough Youth U10 Lionesses": "Rodborough Lionesses",
  }

  return map[value] || value
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string
  value: string | number
  sub?: string
}) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 20,
        border: "1px solid #dbe3ef",
        background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        minWidth: 0,
      }}
    >
      <div
        style={{
          color: "#667085",
          fontWeight: 800,
          fontSize: 13,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 30,
          fontWeight: 900,
          marginTop: 8,
          lineHeight: 1,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
      {sub ? (
        <div
          style={{
            color: "#94a3b8",
            fontSize: 12,
            marginTop: 8,
          }}
        >
          {sub}
        </div>
      ) : null}
    </div>
  )
}

function SegmentedTabs({
  value,
  onChange,
}: {
  value: StatsView
  onChange: (value: StatsView) => void
}) {
  const tabs: Array<{ id: StatsView; label: string }> = [
    { id: "overview", label: "Overview" },
    { id: "players", label: "Players" },
    { id: "headToHead", label: "Head-to-Head" },
    { id: "history", label: "History" },
  ]

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
        gap: 10,
      }}
    >
      {tabs.map((tab) => {
        const active = value === tab.id

        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              minWidth: 0,
              border: active ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
              background: active ? "linear-gradient(180deg, #dbeafe 0%, #eff6ff 100%)" : "white",
              color: active ? "#1e3a8a" : "#0f172a",
              borderRadius: 999,
              padding: "12px 8px",
              fontWeight: 800,
              fontSize: 12,
              lineHeight: 1.1,
              boxShadow: active ? "0 6px 16px rgba(29,78,216,0.10)" : "none",
            }}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}

function resultBadgeTone(value: "W" | "D" | "L"): "green" | "yellow" | "red" {
  if (value === "W") return "green"
  if (value === "D") return "yellow"
  return "red"
}

export default function StatsTab({
  teamName,
  results,
  players,
  ratings,
  timeline,
}: Props) {
  const [view, setView] = useState<StatsView>("overview")

  const normalizedTeamName = normalizeTeamName(teamName)

  const teamResults = useMemo(() => {
    return results
      .filter((match) => {
        const home = normalizeTeamName(match.homeTeam)
        const away = normalizeTeamName(match.awayTeam)
        return home === normalizedTeamName || away === normalizedTeamName
      })
      .slice()
      .sort((a, b) => b.playedOn.localeCompare(a.playedOn))
      .map((match) => {
        const home = normalizeTeamName(match.homeTeam)
        const away = normalizeTeamName(match.awayTeam)
        const isHome = home === normalizedTeamName
        const opponent = isHome ? away : home
        const ourScore = isHome ? match.homeScore : match.awayScore
        const theirScore = isHome ? match.awayScore : match.homeScore
        const result = ourScore > theirScore ? "W" : ourScore < theirScore ? "L" : "D"

        return {
          ...match,
          opponent,
          ourScore,
          theirScore,
          result: result as "W" | "D" | "L",
        }
      })
  }, [results, normalizedTeamName])

  const totalGoals = useMemo(
    () => timeline.filter((item) => item.type === "goal").length,
    [timeline]
  )

  const totalMinutes = useMemo(
    () => Math.round(players.reduce((sum, player) => sum + (player.seasonSeconds || 0), 0) / 60),
    [players]
  )

  const averageRating = useMemo(() => {
    if (ratings.length === 0) return 0
    return ratings.reduce((sum, item) => sum + Number(item.rating || 0), 0) / ratings.length
  }, [ratings])

  const recentForm = teamResults.slice(0, 5).map((item) => item.result)

  const topRatedPlayers = useMemo(() => {
    const byPlayer: Record<string, number[]> = {}

    for (const rating of ratings) {
      if (!byPlayer[rating.playerId]) byPlayer[rating.playerId] = []
      byPlayer[rating.playerId].push(Number(rating.rating || 0))
    }

    return players
      .map((player) => {
        const values = byPlayer[player.id] || []
        const average =
          values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0

        return {
          id: player.id,
          name: player.name,
          minutes: player.seasonSeconds || 0,
          averageRating: average,
          ratingCount: values.length,
        }
      })
      .filter((player) => player.ratingCount > 0)
      .sort((a, b) => {
        if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating
        return b.ratingCount - a.ratingCount
      })
  }, [players, ratings])

  const headToHead = useMemo(() => {
    const byOpponent: Record<
      string,
      {
        opponent: string
        played: number
        won: number
        drawn: number
        lost: number
        gf: number
        ga: number
      }
    > = {}

    for (const match of teamResults) {
      if (!byOpponent[match.opponent]) {
        byOpponent[match.opponent] = {
          opponent: match.opponent,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          gf: 0,
          ga: 0,
        }
      }

      const row = byOpponent[match.opponent]
      row.played += 1
      row.gf += match.ourScore
      row.ga += match.theirScore

      if (match.result === "W") row.won += 1
      if (match.result === "D") row.drawn += 1
      if (match.result === "L") row.lost += 1
    }

    return Object.values(byOpponent).sort((a, b) => {
      if (b.played !== a.played) return b.played - a.played
      return a.opponent.localeCompare(b.opponent)
    })
  }, [teamResults])

  const winCount = teamResults.filter((item) => item.result === "W").length
  const drawCount = teamResults.filter((item) => item.result === "D").length
  const lossCount = teamResults.filter((item) => item.result === "L").length
  const goalsFor = teamResults.reduce((sum, item) => sum + item.ourScore, 0)
  const goalsAgainst = teamResults.reduce((sum, item) => sum + item.theirScore, 0)

  return (
    <div
      style={{
        display: "grid",
        gap: 16,
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
      }}
    >
      <PageCard>
        <SectionHeader
          title="Stats"
          subtitle="Season overview, player summaries and match history."
        />
        <SegmentedTabs value={view} onChange={setView} />
      </PageCard>

      {view === "overview" && (
        <>
          <PageCard>
            <SectionHeader title="Overview" subtitle={normalizedTeamName} />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              <StatCard label="Matches" value={teamResults.length} />
              <StatCard label="Goals" value={goalsFor} />
              <StatCard label="Against" value={goalsAgainst} />
              <StatCard
                label="Avg Rating"
                value={ratings.length > 0 ? averageRating.toFixed(1) : "-"}
              />
            </div>
          </PageCard>

          <PageCard>
            <SectionHeader title="Results Breakdown" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              <StatCard label="Wins" value={winCount} />
              <StatCard label="Draws" value={drawCount} />
              <StatCard label="Losses" value={lossCount} />
            </div>
          </PageCard>

          <PageCard>
            <SectionHeader title="Squad Snapshot" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 14,
              }}
            >
              <StatCard label="Players" value={players.length} />
              <StatCard label="Minutes" value={totalMinutes} sub="team total" />
              <StatCard label="Ratings" value={ratings.length} />
              <StatCard label="Timeline Goals" value={totalGoals} />
            </div>
          </PageCard>

          <PageCard>
            <SectionHeader title="Recent Form" />
            {recentForm.length === 0 ? (
              <div style={{ color: "#64748b" }}>No results recorded yet.</div>
            ) : (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {recentForm.map((item, index) => (
                  <div key={`${item}-${index}`}>
                    <Badge tone={resultBadgeTone(item)}>{item}</Badge>
                  </div>
                ))}
              </div>
            )}
          </PageCard>
        </>
      )}

      {view === "players" && (
        <PageCard>
          <SectionHeader title="Player Stats" subtitle="Mobile-friendly player summaries." />
          {topRatedPlayers.length === 0 ? (
            <div style={{ color: "#64748b" }}>No player ratings saved yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {topRatedPlayers.map((player, index) => (
                <div
                  key={player.id}
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    border: "1px solid #e2e8f0",
                    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                    display: "grid",
                    gap: 10,
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
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 18,
                        minWidth: 0,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {index + 1}. {player.name}
                    </div>

                    <Badge tone="blue">{player.averageRating.toFixed(1)}</Badge>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <Badge tone="default">{player.ratingCount} ratings</Badge>
                    <Badge tone="default">{formatMinutes(player.minutes)}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageCard>
      )}

      {view === "headToHead" && (
        <PageCard>
          <SectionHeader title="Head-to-Head" subtitle="Opponent records without wide tables." />
          {headToHead.length === 0 ? (
            <div style={{ color: "#64748b" }}>No opponent history yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {headToHead.map((team) => (
                <div
                  key={team.opponent}
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    border: "1px solid #e2e8f0",
                    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 900,
                      fontSize: 18,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {team.opponent}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      marginTop: 12,
                      flexWrap: "wrap",
                      color: "#475569",
                      fontWeight: 500,
                    }}
                  >
                    <span>P: {team.played}</span>
                    <span>W: {team.won}</span>
                    <span>D: {team.drawn}</span>
                    <span>L: {team.lost}</span>
                    <span>GF: {team.gf}</span>
                    <span>GA: {team.ga}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageCard>
      )}

      {view === "history" && (
        <PageCard>
          <SectionHeader title="Match History" subtitle="Recent results in a clean vertical list." />
          {teamResults.length === 0 ? (
            <div style={{ color: "#64748b" }}>No match history saved yet.</div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {teamResults.map((game) => (
                <div
                  key={game.id}
                  style={{
                    padding: 16,
                    borderRadius: 18,
                    border: "1px solid #e2e8f0",
                    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 18,
                        overflowWrap: "anywhere",
                      }}
                    >
                      vs {game.opponent} • {game.ourScore}-{game.theirScore}
                    </div>
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 13,
                        marginTop: 6,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {game.playedOn}
                      {game.competition ? ` • ${game.competition}` : ""}
                    </div>
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    <Badge tone={resultBadgeTone(game.result)}>{game.result}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PageCard>
      )}
    </div>
  )
}
