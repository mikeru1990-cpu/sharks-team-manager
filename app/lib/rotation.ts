import type { MatchFormat, PitchPosition, PitchSlot, Player, QuarterPlan } from "./types"
import { FORMATIONS } from "./types"

export function isGoalkeeper(player: Player) {
  return player.mainGK || player.backupGK || player.positions.includes("GK")
}

export function goalkeeperPriority(player: Player) {
  if (player.mainGK) return 0
  if (player.backupGK) return 1
  if (player.positions.includes("GK")) return 2
  return 99
}

export function canPlaySlot(player: Player, slotPosition: PitchPosition) {
  if (slotPosition === "GK") return isGoalkeeper(player)
  return player.positions.includes(slotPosition)
}

function makeSlotId(position: PitchPosition, count: number) {
  return `slot-${position.toLowerCase()}-${count}`
}

function makeLabel(position: PitchPosition, count: number, total: number) {
  if (position === "GK") return "Goalkeeper"
  if (position === "FWD") return total === 1 ? "Striker" : `Forward ${count}`
  if (position === "DEF") return total === 2 ? (count === 1 ? "Left Def" : "Right Def") : `Defender ${count}`
  if (position === "MID") {
    if (total === 3) return count === 1 ? "Left Mid" : count === 2 ? "Center Mid" : "Right Mid"
    return `Midfielder ${count}`
  }
  return `${position} ${count}`
}

export function buildPitchSlots(format: MatchFormat, formation: string): PitchSlot[] {
  const positions = FORMATIONS[format][formation] || []
  const totals = { GK: 0, DEF: 0, MID: 0, FWD: 0 }

  positions.forEach((pos) => {
    totals[pos]++
  })

  const counters = { GK: 0, DEF: 0, MID: 0, FWD: 0 }

  return positions.map((position) => {
    counters[position]++
    return {
      id: makeSlotId(position, counters[position]),
      label: makeLabel(position, counters[position], totals[position]),
      position,
    }
  })
}

export function buildAutoLineup(players: Player[], slots: PitchSlot[]) {
  const used = new Set<string>()
  const lineup: Record<string, string | null> = {}

  slots.forEach((slot) => {
    let candidates = players.filter((p) => !used.has(p.id) && canPlaySlot(p, slot.position))

    if (slot.position === "GK") {
      candidates = [...candidates].sort((a, b) => {
        const aRank = goalkeeperPriority(a)
        const bRank = goalkeeperPriority(b)
        if (aRank !== bRank) return aRank - bRank
        if (a.seasonSeconds !== b.seasonSeconds) return a.seasonSeconds - b.seasonSeconds
        return a.name.localeCompare(b.name)
      })
    } else {
      candidates = [...candidates].sort((a, b) => {
        if (a.seasonSeconds !== b.seasonSeconds) return a.seasonSeconds - b.seasonSeconds
        return a.name.localeCompare(b.name)
      })
    }

    const chosen = candidates[0]
    lineup[slot.id] = chosen ? chosen.id : null
    if (chosen) used.add(chosen.id)
  })

  return {
    lineup,
    bench: players.filter((p) => !used.has(p.id)).map((p) => p.id),
  }
}

export function generateQuarterPlans(players: Player[], slots: PitchSlot[]) {
  const quarterCount = 4
  const plans: Record<number, QuarterPlan> = {}
  const benchHistory: Record<string, number[]> = {}
  const projectedSeconds: Record<string, number> = {}

  players.forEach((p) => {
    benchHistory[p.id] = []
    projectedSeconds[p.id] = p.seasonSeconds || 0
  })

  let previousLineupIds: string[] = []

  for (let quarter = 1; quarter <= quarterCount; quarter++) {
    const lineup: Record<string, string | null> = {}
    const used = new Set<string>()

    slots.forEach((slot) => {
      let eligible = players.filter((p) => !used.has(p.id) && canPlaySlot(p, slot.position))

      if (slot.position === "GK") {
        eligible = [...eligible].sort((a, b) => {
          const aRank = goalkeeperPriority(a)
          const bRank = goalkeeperPriority(b)
          if (aRank !== bRank) return aRank - bRank

          const aSecs = projectedSeconds[a.id] || 0
          const bSecs = projectedSeconds[b.id] || 0
          if (aSecs !== bSecs) return aSecs - bSecs

          return a.name.localeCompare(b.name)
        })
      } else {
        eligible = [...eligible].sort((a, b) => {
          const aBenchedLast = benchHistory[a.id].slice(-1)[0] === quarter - 1 ? 1 : 0
          const bBenchedLast = benchHistory[b.id].slice(-1)[0] === quarter - 1 ? 1 : 0
          if (aBenchedLast !== bBenchedLast) return bBenchedLast - aBenchedLast

          const aPlayedLast = previousLineupIds.includes(a.id) ? 1 : 0
          const bPlayedLast = previousLineupIds.includes(b.id) ? 1 : 0
          if (aPlayedLast !== bPlayedLast) return aPlayedLast - bPlayedLast

          const aSecs = projectedSeconds[a.id] || 0
          const bSecs = projectedSeconds[b.id] || 0
          if (aSecs !== bSecs) return aSecs - bSecs

          return a.name.localeCompare(b.name)
        })
      }

      const chosen = eligible[0]
      lineup[slot.id] = chosen ? chosen.id : null

      if (chosen) {
        used.add(chosen.id)
        projectedSeconds[chosen.id] = (projectedSeconds[chosen.id] || 0) + 15 * 60
      }
    })

    const bench = players.filter((p) => !used.has(p.id)).map((p) => p.id)

    bench.forEach((id) => benchHistory[id].push(quarter))
    plans[quarter] = { lineup, bench }
    previousLineupIds = Object.values(lineup).filter(Boolean) as string[]
  }

  const warnings: string[] = []

  Object.entries(benchHistory).forEach(([playerId, history]) => {
    for (let i = 1; i < history.length; i++) {
      if (history[i] === history[i - 1] + 1) {
        const playerName = players.find((p) => p.id === playerId)?.name || "Player"
        warnings.push(`${playerName} is benched in consecutive quarters`)
        break
      }
    }
  })

  return { plans, warnings }
}
