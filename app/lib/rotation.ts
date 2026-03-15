export type Player = {
  id: string
  name: string
  positions: string[]
  mainGK?: boolean
  backupGK?: boolean
}

export type LineupSlot = {
  position: string
  playerId: string | null
}

export function generateRotation(
  players: Player[],
  previousLineup: LineupSlot[],
  minutesPlayed: Record<string, number>
) {
  const sorted = [...players].sort((a, b) => {
    const aMin = minutesPlayed[a.id] || 0
    const bMin = minutesPlayed[b.id] || 0
    return aMin - bMin
  })

  const lineup: LineupSlot[] = []

  for (const slot of previousLineup) {
    const candidate = sorted.find((p) =>
      p.positions.includes(slot.position)
    )

    if (candidate) {
      lineup.push({
        position: slot.position,
        playerId: candidate.id
      })

      minutesPlayed[candidate.id] =
        (minutesPlayed[candidate.id] || 0) + 10

      sorted.splice(sorted.indexOf(candidate), 1)
    } else {
      lineup.push({
        position: slot.position,
        playerId: null
      })
    }
  }

  return lineup
}
