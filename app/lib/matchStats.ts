export type PlayerMatchStats = {
  goals: number
  assists: number
  saves: number
  yellowCards: number
  redCards: number
  playerOfMatch: boolean
}

export type MatchStatsMap = Record<string, PlayerMatchStats>

export const emptyPlayerMatchStats = (): PlayerMatchStats => ({
  goals: 0,
  assists: 0,
  saves: 0,
  yellowCards: 0,
  redCards: 0,
  playerOfMatch: false,
})

export function ensurePlayerStats(stats: MatchStatsMap, playerId: string): PlayerMatchStats {
  return stats[playerId] ?? emptyPlayerMatchStats()
}

export function incrementPlayerStat(
  stats: MatchStatsMap,
  playerId: string,
  key: Exclude<keyof PlayerMatchStats, "playerOfMatch">,
  amount = 1,
): MatchStatsMap {
  const current = ensurePlayerStats(stats, playerId)
  return {
    ...stats,
    [playerId]: {
      ...current,
      [key]: Math.max(0, current[key] + amount),
    },
  }
}

export function setPlayerOfMatch(stats: MatchStatsMap, playerId: string): MatchStatsMap {
  const next: MatchStatsMap = {}
  Object.entries(stats).forEach(([id, playerStats]) => {
    next[id] = { ...playerStats, playerOfMatch: id === playerId }
  })
  if (!next[playerId]) next[playerId] = { ...emptyPlayerMatchStats(), playerOfMatch: true }
  return next
}

export function clearPlayerOfMatch(stats: MatchStatsMap): MatchStatsMap {
  return Object.fromEntries(Object.entries(stats).map(([id, playerStats]) => [id, { ...playerStats, playerOfMatch: false }]))
}

export function getTeamStatTotals(stats: MatchStatsMap) {
  return Object.values(stats).reduce(
    (totals, player) => ({
      goals: totals.goals + player.goals,
      assists: totals.assists + player.assists,
      saves: totals.saves + player.saves,
      yellowCards: totals.yellowCards + player.yellowCards,
      redCards: totals.redCards + player.redCards,
    }),
    { goals: 0, assists: 0, saves: 0, yellowCards: 0, redCards: 0 },
  )
}

export function buildMatchSummary(params: {
  teamName: string
  opponent: string
  homeScore: number
  awayScore: number
  format: string
  durationSeconds: number
  stats: MatchStatsMap
  playerNames: Record<string, string>
}) {
  const totals = getTeamStatTotals(params.stats)
  const playerOfMatchId = Object.entries(params.stats).find(([, player]) => player.playerOfMatch)?.[0]
  const scorers = Object.entries(params.stats)
    .filter(([, player]) => player.goals > 0)
    .map(([id, player]) => `${params.playerNames[id] ?? "Player"} x${player.goals}`)

  return {
    result: `${params.teamName} ${params.homeScore}-${params.awayScore} ${params.opponent}`,
    format: params.format,
    durationMinutes: Math.floor(params.durationSeconds / 60),
    totals,
    scorers,
    playerOfMatch: playerOfMatchId ? params.playerNames[playerOfMatchId] ?? "Player" : "Not selected",
  }
}
