export type TableRow = {
  team: string
  played: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}

export function buildLeagueTable(results: any[]): TableRow[] {
  const table: Record<string, TableRow> = {}

  function getRow(team: string): TableRow {
    if (!table[team]) {
      table[team] = {
        team,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDiff: 0,
        points: 0,
      }
    }
    return table[team]
  }

  for (const match of results) {
    const home = getRow(match.homeTeam)
    const away = getRow(match.awayTeam)

    home.played++
    away.played++

    home.goalsFor += match.homeScore
    home.goalsAgainst += match.awayScore

    away.goalsFor += match.awayScore
    away.goalsAgainst += match.homeScore

    if (match.homeScore > match.awayScore) {
      home.wins++
      away.losses++
      home.points += 3
    } else if (match.homeScore < match.awayScore) {
      away.wins++
      home.losses++
      away.points += 3
    } else {
      home.draws++
      away.draws++
      home.points += 1
      away.points += 1
    }
  }

  const rows = Object.values(table)

  rows.forEach((row) => {
    row.goalDiff = row.goalsFor - row.goalsAgainst
  })

  return rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff
    return b.goalsFor - a.goalsFor
  })
}
