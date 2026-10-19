/** Validate the exact lineup the coach reviewed; never reorder it at kick-off. */
export function lineupProblem(
  starters: string[],
  selected: string[],
  eligibleIds: string[],
  positions: Record<string, string>,
  slotKeys: string[],
): string | null {
  if (starters.length !== slotKeys.length) return `Choose ${slotKeys.length} starters.`
  if (new Set(starters).size !== starters.length) return "Each player can only start once."
  if (starters.some(id => !selected.includes(id) || !eligibleIds.includes(id))) return "Review the squad: a starter is no longer available for selection."
  const assigned = starters.map(id => positions[id])
  if (assigned.some(slot => !slotKeys.includes(slot)) || new Set(assigned).size !== slotKeys.length) {
    return "Apply the formation, then check every player's position before kick-off."
  }
  return null
}
