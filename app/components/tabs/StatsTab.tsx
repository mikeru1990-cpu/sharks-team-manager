"use client"

import { useMemo, useState } from "react"
import { cardStyle, formatMinutes, type LeagueResult, type Player, type PlayerMatchRating, type TimelineItem } from "../../lib/types"

type StandingRow = {
  team: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  form: ("W" | "D" | "L")[]
}

type PlayerStatRow = {
  playerId: string
  name: string
  goals: number
  assists: number
  potm: number
  averageRating: number
  ratingsCount: number
  minutes: number
}

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

    "Tewkesbury Town Colts Youth U10": "Tewkesbury Town Colts",
    "Tewkesbury Town Colts Youth": "Tewkesbury Town Colts",
    "Stonehouse TownYouth U10": "Stonehouse Town",
    "Stonehouse Town Youth U10": "Stonehouse Town",
    "Stonehouse Town Youth": "Stonehouse Town",
    "Rodborough Youth U10 Lioness": "Rodborough Lionesses",
    "Rodborough Youth U10 Lionesses": "Rodborough Lionesses",
  }

  return map[value] || value
}

function dedupeResults(results: LeagueResult[]) {
  const seen = new Set<string>()

  return results.filter((item) => {
    const key = [
      item.playedOn,
      normalizeTeamName(item.homeTeam),
      normalizeTeamName(item.awayTeam),
      item.homeScore,
      item.awayScore,
      item.competition || "",
    ].join("|")

    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildStandings(results: LeagueResult[]) {
  const table: Record<string, StandingRow> = {}

  function getTeam(name: string) {
    const normalized = normalizeTeamName(name)

    if (!table[normalized]) {
      table[normalized] = {
        team: normalized,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0,
        form: [],
      }
    }

    return table[normalized]
  }

  const sorted = [...results].sort((a, b) => a.playedOn.localeCompare(b.playedOn))

  for (const match of sorted) {
    const homeName = normalizeTeamName(match.homeTeam)
    const awayName = normalizeTeamName(match.awayTeam)

    if (homeName === awayName) continue

    const home = getTeam(homeName)
    const away = getTeam(awayName)

    home.played += 1
    away.played += 1

    home.goals_for += match.homeScore
    home.goals_against += match.awayScore
    away.goals_for += match.awayScore
    away.goals_against += match.homeScore

    if (match.homeScore > match.awayScore) {
      home.wins += 1
      home.points += 3
      away.losses += 1
      home.form.push("W")
      away.form.push("L")
    } else if (match.homeScore < match.awayScore) {
      away.wins += 1
      away.points += 3
      home.losses += 1
      away.form.push("W")
      home.form.push("L")
    } else {
      home.draws += 1
      away.draws += 1
      home.points += 1
      away.points += 1
      home.form.push("D")
      away.form.push("D")
    }
  }

  return Object.values(table)
    .map((team) => ({
      ...team,
      goal_difference: team.goals_for - team.goals_against,
      form: team.form.slice(-5).reverse(),
    }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
      if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for
      return a.team.localeCompare(b.team)
    })
}

function getHeadToHeadDetails(teamName: string, opponentName: string, results: LeagueResult[]) {
  const normalizedTeam = normalizeTeamName(teamName)
  const normalizedOpponent = normalizeTeamName(opponentName)

  const matches = results
    .filter((m) => {
      const home = normalizeTeamName(m.homeTeam)
      const away = normalizeTeamName(m.awayTeam)

      return (
        (home === normalizedTeam && away === normalizedOpponent) ||
        (away === normalizedTeam && home === normalizedOpponent)
      )
    })
    .slice()
    .sort((a, b) => b.playedOn.localeCompare(a.playedOn))

  let wins = 0
  let draws = 0
  let losses = 0

  for (const m of matches) {
    const isHome = normalizeTeamName(m.homeTeam) === normalizedTeam
    const gf = isHome ? m.homeScore : m.awayScore
    const ga = isHome ? m.awayScore : m.homeScore

    if (gf > ga) wins += 1
    else if (gf < ga) losses += 1
    else draws += 1
  }

  return { matches, wins, draws, losses }
}

function formBadgeStyle(value: "W" | "D" | "L") {
  if (value === "W") {
    return {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #86efac",
    }
  }

  if (value === "D") {
    return {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fcd34d",
    }
  }

  return {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
  }
}

function FormBadge({ value }: { value: "W" | "D" | "L" }) {
  return (
    <div
      style={{
        ...formBadgeStyle(value),
        width: 28,
        height: 28,
        borderRadius: 999,
        display: "grid",
        placeItems: "center",
        fontSize: 12,
        fontWeight: 900,
      }}
    >
      {value}
    </div>
  )
}

function StatCard({ label, value, subtext }: { label: string; value: string | number; subtext?: string }) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 16,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <div style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, marginTop: 6 }}>{value}</div>
      {subtext ? <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{subtext}</div> : null}
    </div>
  )
}

function buildPlayerStats(
  players: Player[],
  ratings: PlayerMatchRating[],
  timeline: TimelineItem[]
): PlayerStatRow[] {
  const goalMap: Record<string, number> = {}
  const assistMap: Record<string, number> = {}
  const ratingMap: Record<string, number[]> = {}
  const potmMap: Record<string, number> = {}

  for (const item of timeline) {
    const text = item.text || ""

    if (item.type === "goal") {
      const scorerMatch = text.match(/^(.+?) scored/)
      if (scorerMatch?.[1]) {
        const scorerName = scorerMatch[1].trim()
        const player = players.find((p) => p.name === scorerName)
        if (player) {
          goalMap[player.id] = (goalMap[player.id] || 0) + 1
        }
      }

      const assistMatch = text.match(/assist (.+)$/)
      if (assistMatch?.[1]) {
        const assistName = assistMatch[1].trim()
        const player = players.find((p) => p.name === assistName)
        if (player) {
          assistMap[player.id] = (assistMap[player.id] || 0) + 1
        }
      }
    }

    if (item.type === "assist") {
      const assistOnlyMatch = text.match(/^(.+?) assist$/)
      if (assistOnlyMatch?.[1]) {
        const assistName = assistOnlyMatch[1].trim()
        const player = players.find((p) => p.name === assistName)
        if (player) {
          assistMap[player.id] = (assistMap[player.id] || 0) + 1
        }
      }
    }
  }

  const groupedRatings: Record<string, PlayerMatchRating[]> = {}
  for (const rating of ratings) {
    if (!groupedRatings[rating.eventId]) groupedRatings[rating.eventId] = []
    groupedRatings[rating.eventId].push(rating)

    if (!ratingMap[rating.playerId]) ratingMap[rating.playerId] = []
    ratingMap[rating.playerId].push(rating.rating)
  }

  for (const eventId of Object.keys(groupedRatings)) {
    const sorted = groupedRatings[eventId].slice().sort((a, b) => b.rating - a.rating)
    if (sorted[0]) {
      potmMap[sorted[0].playerId] = (potmMap[sorted[0].playerId] || 0) + 1
    }
  }

  return players
    .map((player) => {
      const playerRatings = ratingMap[player.id] || []
      const averageRating =
        playerRatings.length > 0
          ? playerRatings.reduce((sum, value) => sum + value, 0) / playerRatings.length
          : 0

      return {
        playerId: player.id,
        name: player.name,
        goals: goalMap[player.id] || 0,
        assists: assistMap[player.id] || 0,
        potm: potmMap[player.id] || 0,
        averageRating,
        ratingsCount: playerRatings.length,
        minutes: player.seasonSeconds || 0,
      }
    })
    .sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals
      if (b.assists !== a.assists) return b.assists - a.assists
      return a.name.localeCompare(b.name)
    })
}

export default function StatsTab({ teamName, results, players, ratings, timeline }: Props) {
  const [selectedOpponent, setSelectedOpponent] = useState("")

  const cleanResults = useMemo(() => dedupeResults(results), [results])
  const standings = useMemo(() => buildStandings(cleanResults), [cleanResults])
  const playerStats = useMemo(() => buildPlayerStats(players, ratings, timeline), [players, ratings, timeline])

  const opponents = useMemo(
    () =>
      Array.from(
        new Set(
          cleanResults.flatMap((m) => [
            normalizeTeamName(m.homeTeam),
            normalizeTeamName(m.awayTeam),
          ])
        )
      )
        .filter((team) => team !== normalizeTeamName(teamName))
        .sort(),
    [cleanResults, teamName]
  )

  const headToHead = useMemo(() => {
    if (!selectedOpponent) return null
    return getHeadToHeadDetails(teamName, selectedOpponent, cleanResults)
  }, [teamName, selectedOpponent, cleanResults])

  const totalGoals = playerStats.reduce((sum, p) => sum + p.goals, 0)
  const totalAssists = playerStats.reduce((sum, p) => sum + p.assists, 0)
  const totalMinutes = playerStats.reduce((sum, p) => sum + p.minutes, 0)

  const topScorer = playerStats.slice().sort((a, b) => b.goals - a.goals)[0]
  const topAssist = playerStats.slice().sort((a, b) => b.assists - a.assists)[0]
  const topPotm = playerStats.slice().sort((a, b) => b.potm - a.potm)[0]
  const topMinutes = playerStats.slice().sort((a, b) => b.minutes - a.minutes)[0]
  const bestRated = playerStats
    .filter((p) => p.ratingsCount > 0)
    .slice()
    .sort((a, b) => b.averageRating - a.averageRating)[0]

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Player Stats Overview</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          <StatCard label="Total Goals" value={totalGoals} />
          <StatCard label="Total Assists" value={totalAssists} />
          <StatCard label="Total Minutes" value={formatMinutes(totalMinutes)} subtext="season total" />
          <StatCard label="Players Rated" value={playerStats.filter((p) => p.ratingsCount > 0).length} />
        </div>
      </div>

      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Team Leaders</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <StatCard
            label="Top Scorer"
            value={topScorer ? topScorer.name : "—"}
            subtext={topScorer ? `${topScorer.goals} goals` : "No goals yet"}
          />
          <StatCard
            label="Top Assists"
            value={topAssist ? topAssist.name : "—"}
            subtext={topAssist ? `${topAssist.assists} assists` : "No assists yet"}
          />
          <StatCard
            label="Player of the Match"
            value={topPotm ? topPotm.name : "—"}
            subtext={topPotm ? `${topPotm.potm} awards` : "No awards yet"}
          />
          <StatCard
            label="Best Avg Rating"
            value={bestRated ? bestRated.name : "—"}
            subtext={bestRated ? `${bestRated.averageRating.toFixed(1)} avg` : "No ratings yet"}
          />
          <StatCard
            label="Most Minutes"
            value={topMinutes ? topMinutes.name : "—"}
            subtext={topMinutes ? `${formatMinutes(topMinutes.minutes)}` : "No minutes yet"}
          />
        </div>
      </div>

      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Player Leaderboard</div>

        {playerStats.length === 0 ? (
          <div style={{ color: "#64748b" }}>No player stats yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 860,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#94a3b8" }}>
                  <th style={{ textAlign: "left", padding: "10px 8px" }}>Player</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>Goals</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>Assists</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>POTM</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>Avg Rating</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>Ratings</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>Minutes</th>
                </tr>
              </thead>
              <tbody>
                {playerStats.map((row) => (
                  <tr key={row.playerId} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "12px 8px", fontWeight: 900 }}>{row.name}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>{row.goals}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>{row.assists}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>{row.potm}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>
                      {row.ratingsCount > 0 ? row.averageRating.toFixed(1) : "—"}
                    </td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>{row.ratingsCount}</td>
                    <td style={{ padding: "12px 8px", textAlign: "center" }}>{formatMinutes(row.minutes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>League Table</div>

        {standings.length === 0 ? (
          <div style={{ color: "#64748b" }}>No league results saved yet.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 760,
              }}
            >
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#94a3b8" }}>
                  <th style={{ textAlign: "left", padding: "10px 8px" }}>#</th>
                  <th style={{ textAlign: "left", padding: "10px 8px" }}>Team</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>P</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>W</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>D</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>L</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>GF</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>GA</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>GD</th>
                  <th style={{ textAlign: "center", padding: "10px 8px" }}>Pts</th>
                  <th style={{ textAlign: "left", padding: "10px 8px" }}>Form</th>
                </tr>
              </thead>

              <tbody>
                {standings.map((row, index) => {
                  const isOurTeam =
                    normalizeTeamName(row.team) === normalizeTeamName(teamName)

                  return (
                    <tr
                      key={row.team}
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        background: isOurTeam ? "#dbeafe" : "transparent",
                      }}
                    >
                      <td style={{ padding: "12px 8px", fontWeight: 800 }}>{index + 1}</td>
                      <td style={{ padding: "12px 8px", fontWeight: 900 }}>{row.team}</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>{row.played}</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>{row.wins}</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>{row.draws}</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>{row.losses}</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>{row.goals_for}</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>{row.goals_against}</td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center", fontWeight: 900 }}>
                        {row.points}
                      </td>
                      <td style={{ padding: "12px 8px" }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {row.form.map((item, itemIndex) => (
                            <FormBadge key={`${row.team}-${itemIndex}`} value={item} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Head-to-Head</div>

        <select
          value={selectedOpponent}
          onChange={(e) => setSelectedOpponent(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            marginBottom: 16,
            fontSize: 16,
            background: "white",
          }}
        >
          <option value="">Select opponent</option>
          {opponents.map((team) => (
            <option key={team} value={team}>
              {team}
            </option>
          ))}
        </select>

        {!selectedOpponent ? (
          <div style={{ color: "#64748b" }}>Choose a team to view the record.</div>
        ) : headToHead ? (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ fontWeight: 800 }}>
              W: {headToHead.wins} • D: {headToHead.draws} • L: {headToHead.losses}
            </div>

            {headToHead.matches.length === 0 ? (
              <div style={{ color: "#64748b" }}>No games found.</div>
            ) : (
              headToHead.matches.map((match) => {
                const isHome =
                  normalizeTeamName(match.homeTeam) === normalizeTeamName(teamName)

                const ourScore = isHome ? match.homeScore : match.awayScore
                const oppScore = isHome ? match.awayScore : match.homeScore

                const result: "W" | "D" | "L" =
                  ourScore > oppScore ? "W" : ourScore < oppScore ? "L" : "D"

                return (
                  <div
                    key={match.id}
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
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
                      <div style={{ fontWeight: 900 }}>
                        {normalizeTeamName(match.homeTeam)} {match.homeScore} - {match.awayScore}{" "}
                        {normalizeTeamName(match.awayTeam)}
                      </div>
                      <FormBadge value={result} />
                    </div>

                    <div style={{ color: "#64748b", fontSize: 14 }}>
                      {match.playedOn}
                      {match.competition ? ` • ${match.competition}` : ""}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div style={{ color: "#64748b" }}>No record found.</div>
        )}
      </div>
    </div>
  )
}
