import { type Player, type PitchSlot } from "./types"

function getPlayerMinutes(player: Player) {
  return player.seasonSeconds || 0
}

function sortByMinutes(players: Player[]) {
  return [...players].sort((a, b) => getPlayerMinutes(a) - getPlayerMinutes(b))
}

export function autoPickLineup(players: Player[], slots: PitchSlot[]) {
  const safePlayers = Array.isArray(players) ? players : []
  const safeSlots = Array.isArray(slots) ? slots : []

  const lineupMap: Record<string, string | null> = {}
  const usedPlayers = new Set<string>()
  const sortedPlayers = sortByMinutes(safePlayers)

  const gk =
    sortedPlayers.find((p) => p.mainGK) ||
    sortedPlayers.find((p) => p.backupGK) ||
    sortedPlayers.find((p) => Array.isArray(p.positions) && p.positions.includes("GK"))

  if (gk) {
    const gkSlot = safeSlots.find((s) => s.position === "GK")
    if (gkSlot) {
      lineupMap[gkSlot.id] = gk.id
      usedPlayers.add(gk.id)
    }
  }

  for (const slot of safeSlots) {
    if (lineupMap[slot.id]) continue

    const player = sortedPlayers.find(
      (p) =>
        !usedPlayers.has(p.id) &&
        Array.isArray(p.positions) &&
        p.positions[0] === slot.position
    )

    if (player) {
      lineupMap[slot.id] = player.id
      usedPlayers.add(player.id)
    }
  }

  for (const slot of safeSlots) {
    if (lineupMap[slot.id]) continue

    const player = sortedPlayers.find(
      (p) =>
        !usedPlayers.has(p.id) &&
        Array.isArray(p.positions) &&
        p.positions.includes(slot.position)
    )

    if (player) {
      lineupMap[slot.id] = player.id
      usedPlayers.add(player.id)
    }
  }

  for (const slot of safeSlots) {
    if (lineupMap[slot.id]) continue

    const player = sortedPlayers.find((p) => !usedPlayers.has(p.id))

    if (player) {
      lineupMap[slot.id] = player.id
      usedPlayers.add(player.id)
    }
  }

  const benchIds = safePlayers
    .filter((p) => !usedPlayers.has(p.id))
    .map((p) => p.id)

  return { lineupMap, benchIds }
}
