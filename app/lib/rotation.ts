export type RotationPlayer = {
  id: string
  name: string
  positions: string[]
  mainGK?: boolean
  backupGK?: boolean
}

export type RotationSlot = {
  position: string
  playerId: string | null
}

type BuildQuarterInput = {
  players: RotationPlayer[]
  pitchSlots: string[]
  previousLineup: (string | null)[]
  previousBenchIds: string[]
  minutesPlayed: Record<string, number>
}

function canPlaySlot(player: RotationPlayer, slot: string) {
  if (slot === "GK") {
    return player.positions.includes("GK") || player.mainGK || player.backupGK
  }
  return player.positions.includes(slot)
}

function getMinutes(minutesPlayed: Record<string, number>, playerId: string) {
  return minutesPlayed[playerId] || 0
}

function uniqueIds(values: (string | null)[]) {
  return [...new Set(values.filter(Boolean) as string[])]
}

function chooseBestForSlot(
  candidates: RotationPlayer[],
  slot: string,
  usedIds: Set<string>,
  minutesPlayed: Record<string, number>
) {
  const available = candidates.filter((p) => !usedIds.has(p.id) && canPlaySlot(p, slot))
  if (available.length === 0) return null

  const ranked = [...available].sort((a, b) => {
    const aMinutes = getMinutes(minutesPlayed, a.id)
    const bMinutes = getMinutes(minutesPlayed, b.id)

    if (slot === "GK") {
      // IMPORTANT: do not auto-pick main GK first
      // lowest minutes first, then backup GK, then main GK, then name
      if (aMinutes !== bMinutes) return aMinutes - bMinutes
      if (!!a.backupGK !== !!b.backupGK) return a.backupGK ? -1 : 1
      if (!!a.mainGK !== !!b.mainGK) return a.mainGK ? 1 : -1
      return a.name.localeCompare(b.name)
    }

    if (aMinutes !== bMinutes) return aMinutes - bMinutes
    return a.name.localeCompare(b.name)
  })

  return ranked[0] || null
}

function assignQuarterMinutes(
  lineup: (string | null)[],
  minutesPlayed: Record<string, number>,
  quarterMinutes = 15
) {
  const next = { ...minutesPlayed }
  lineup.forEach((id) => {
    if (!id) return
    next[id] = (next[id] || 0) + quarterMinutes
  })
  return next
}

function tryForceInPreviouslyBenchedPlayers(
  lineup: (string | null)[],
  players: RotationPlayer[],
  pitchSlots: string[],
  previousBenchIds: string[],
  minutesPlayed: Record<string, number>
) {
  const nextLineup = [...lineup]
  const onFieldIds = new Set(uniqueIds(nextLineup))
  const stillBenched = previousBenchIds.filter((id) => !onFieldIds.has(id))

  if (stillBenched.length === 0) return nextLineup

  for (const benchedId of stillBenched) {
    const benchPlayer = players.find((p) => p.id === benchedId)
    if (!benchPlayer) continue

    let bestSwapIndex = -1
    let bestSwapScore = -Infinity

    for (let i = 0; i < pitchSlots.length; i++) {
      const slot = pitchSlots[i]
      const currentId = nextLineup[i]
      if (!currentId) continue
      if (!canPlaySlot(benchPlayer, slot)) continue

      const currentPlayer = players.find((p) => p.id === currentId)
      if (!currentPlayer) continue

      // don't force benching someone who was already benched last quarter too
      if (previousBenchIds.includes(currentPlayer.id)) continue

      const currentMinutes = getMinutes(minutesPlayed, currentPlayer.id)
      const benchMinutes = getMinutes(minutesPlayed, benchPlayer.id)

      // prefer replacing highest-minute players
      const swapScore = currentMinutes - benchMinutes

      if (swapScore > bestSwapScore) {
        bestSwapScore = swapScore
        bestSwapIndex = i
      }
    }

    if (bestSwapIndex !== -1) {
      nextLineup[bestSwapIndex] = benchPlayer.id
    }
  }

  return nextLineup
}

export function buildSmartQuarterLineup({
  players,
  pitchSlots,
  previousLineup,
  previousBenchIds,
  minutesPlayed,
}: BuildQuarterInput) {
  const lineup = Array(pitchSlots.length).fill(null) as (string | null)[]
  const usedIds = new Set<string>()

  const previousOnFieldIds = new Set(uniqueIds(previousLineup))

  const priorityPlayers = [...players].sort((a, b) => {
    const aWasBenched = previousBenchIds.includes(a.id)
    const bWasBenched = previousBenchIds.includes(b.id)

    // strongest rule: players benched last quarter should get priority
    if (aWasBenched !== bWasBenched) return aWasBenched ? -1 : 1

    const aMinutes = getMinutes(minutesPlayed, a.id)
    const bMinutes = getMinutes(minutesPlayed, b.id)

    if (aMinutes !== bMinutes) return aMinutes - bMinutes

    const aPlayedLast = previousOnFieldIds.has(a.id)
    const bPlayedLast = previousOnFieldIds.has(b.id)

    if (aPlayedLast !== bPlayedLast) return aPlayedLast ? 1 : -1

    return a.name.localeCompare(b.name)
  })

  for (let i = 0; i < pitchSlots.length; i++) {
    const slot = pitchSlots[i]
    const chosen = chooseBestForSlot(priorityPlayers, slot, usedIds, minutesPlayed)

    if (chosen) {
      lineup[i] = chosen.id
      usedIds.add(chosen.id)
    }
  }

  const forcedLineup = tryForceInPreviouslyBenchedPlayers(
    lineup,
    players,
    pitchSlots,
    previousBenchIds,
    minutesPlayed
  )

  const nextMinutes = assignQuarterMinutes(forcedLineup, minutesPlayed)

  return {
    lineup: forcedLineup,
    nextMinutes,
    benchIds: players
      .map((p) => p.id)
      .filter((id) => !new Set(uniqueIds(forcedLineup)).has(id)),
  }
}
