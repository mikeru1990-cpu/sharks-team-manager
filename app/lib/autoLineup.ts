import { type Player, type PitchSlot } from "./types"

function getPlayerMinutes(player: Player) {
  return player.seasonSeconds || 0
}

function sortByMinutes(players: Player[]) {
  return [...players].sort((a, b) => getPlayerMinutes(a) - getPlayerMinutes(b))
}

export function autoPickLineup(players: Player[], slots: PitchSlot[]) {
  const lineupMap: Record<string, string | null> = {}
  const usedPlayers = new Set<string>()

  // Sort players by LOWEST minutes first (fair rotation)
  const sortedPlayers = sortByMinutes(players)

  // 1. Pick GK first
  const gk =
    sortedPlayers.find((p) => p.mainGK) ||
    sortedPlayers.find((p) => p.backupGK)

  if (gk) {
    const gkSlot = slots.find((s) => s.position === "GK")
    if (gkSlot) {
      lineupMap[gkSlot.id] = gk.id
      usedPlayers.add(gk.id)
    }
  }

  // 2. Fill by PRIMARY position match
  for (const slot of slots) {
    if (lineupMap[slot.id]) continue

    const player = sortedPlayers.find(
      (p) =>
        !usedPlayers.has(p.id) &&
        p.positions[0] === slot.position // strongest fit
    )

    if (player) {
      lineupMap[slot.id] = player.id
      usedPlayers.add(player.id)
    }
  }

  // 3. Fill by ANY matching position
  for (const slot of slots) {
    if (lineupMap[slot.id]) continue

    const player = sortedPlayers.find(
      (p) =>
        !usedPlayers.has(p.id) &&
        p.positions.includes(slot.position)
    )

    if (player) {
      lineupMap[slot.id] = player.id
      usedPlayers.add(player.id)
    }
  }

  // 4. Fill remaining slots (fallback)
  for (const slot of slots) {
    if (lineupMap[slot.id]) continue

    const player = sortedPlayers.find((p) => !usedPlayers.has(p.id))

    if (player) {
      lineupMap[slot.id] = player.id
      usedPlayers.add(player.id)
    }
  }

  // Bench = everyone else
  const benchIds = players
    .filter((p) => !usedPlayers.has(p.id))
    .map((p) => p.id)

  return { lineupMap, benchIds }
}
