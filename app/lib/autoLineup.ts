import { Player, PitchSlot } from "./types"

export function autoPickLineup(
  players: Player[],
  slots: PitchSlot[]
) {
  const lineupMap: Record<string, string | null> = {}
  const usedPlayers = new Set<string>()

  // 🧤 1. Pick Goalkeeper first
  const gk = players.find(p => p.mainGK) || players.find(p => p.backupGK)

  if (gk) {
    const gkSlot = slots.find(s => s.position === "GK")
    if (gkSlot) {
      lineupMap[gkSlot.id] = gk.id
      usedPlayers.add(gk.id)
    }
  }

  // 🎯 2. Fill other positions
  for (const slot of slots) {
    if (lineupMap[slot.id]) continue

    const player = players.find(p =>
      !usedPlayers.has(p.id) &&
      p.positions.includes(slot.position)
    )

    if (player) {
      lineupMap[slot.id] = player.id
      usedPlayers.add(player.id)
    }
  }

  // 🔄 3. Fill remaining slots with anyone left
  for (const slot of slots) {
    if (lineupMap[slot.id]) continue

    const player = players.find(p => !usedPlayers.has(p.id))

    if (player) {
      lineupMap[slot.id] = player.id
      usedPlayers.add(player.id)
    }
  }

  // 🪑 4. Bench = remaining players
  const benchIds = players
    .filter(p => !usedPlayers.has(p.id))
    .map(p => p.id)

  return { lineupMap, benchIds }
}
