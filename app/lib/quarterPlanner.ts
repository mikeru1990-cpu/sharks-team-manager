export type QuarterPlayer = { id: string; name: string; primaryPosition: string; secondaryPositions: string[]; slotRatings?: Record<string, number | null> }
export type PositionRatings = { goalkeeper: number | null; defence: number | null; centre_mid: number | null; wide: number | null; striker: number | null }
export function ratingsForSlots(profile: PositionRatings, slots: { key: string; x: number }[]) {
  const mids = slots.filter(s => roleGroup(s.key) === 'MID')
  return Object.fromEntries(slots.map(s => {
    const group = roleGroup(s.key)
    const role = group === 'GK' ? 'goalkeeper' : group === 'DEF' ? 'defence' : group === 'FWD' ? 'striker' : group === 'MID' ? (mids.length >= 3 && (s.x < 25 || s.x > 75) ? 'wide' : 'centre_mid') : null
    const value = role ? profile[role] : null
    return [s.key, typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 5 ? value : null]
  }))
}
export type QuarterPlan = { lineup: Record<string, string>; bench: string[] }
export type QuarterDraft = { plans: QuarterPlan[]; keeper: string; duration: number; signature: string; applied: number }
export function readQuarterDraft(raw: string | null, signature: string, players: QuarterPlayer[], slots: string[]): QuarterDraft | null {
  try {
    const saved = JSON.parse(raw ?? 'null') as QuarterDraft | null
    if (!saved || saved.signature !== signature || !players.some(p => p.id === saved.keeper)) return null
    if (![5, 10, 12, 15, 20, 25, 30].includes(saved.duration) || !Number.isInteger(saved.applied) || saved.applied < 0 || saved.applied > 4) return null
    if (!Array.isArray(saved.plans) || saved.plans.length !== 4) return null
    const ids = new Set(players.map(p => p.id))
    if (!saved.plans.every(q => {
      if (!q || !q.lineup || typeof q.lineup !== 'object' || Array.isArray(q.lineup) || !Array.isArray(q.bench)) return false
      if (Object.keys(q.lineup).length !== slots.length || !slots.every(s => ids.has(q.lineup[s])) || q.lineup.GK !== saved.keeper) return false
      const all = [...Object.values(q.lineup), ...q.bench]
      return all.length === ids.size && new Set(all).size === ids.size && all.every(id => ids.has(id))
    })) return null
    return saved
  } catch { return null }
}
export function roleGroup(role: string): string {
  const r = role.toUpperCase()
  if (r === 'GK') return 'GK'
  if (/^(DM|AM|CM|LM|RM|MID|M\d)/.test(r)) return 'MID'
  if (/^(D\d|DEF|CB|LB|RB|LDEF|RDEF|WB)/.test(r)) return 'DEF'
  if (/^(F\d|FWD|ST|CF|LW|RW)/.test(r)) return 'FWD'
  return r
}
export function roleFit(player: QuarterPlayer, slot: string) {
  const rating = player.slotRatings?.[slot]
  if (typeof rating === 'number' && Number.isInteger(rating) && rating >= 0 && rating <= 5) return rating === 0 ? -1000 : rating * 10
  const group = roleGroup(slot)
  if (roleGroup(player.primaryPosition) === group) return 2
  return player.secondaryPositions.some(p => roleGroup(p) === group) ? 1 : 0
}
// Optimise role fit across the whole selected side, instead of filling slots greedily.
function assignRoles(players: QuarterPlayer[], slots: string[]) {
  const memo = new Map<number, { score: number; ids: string[] }>()
  function solve(mask: number): { score: number; ids: string[] } {
    const index = mask.toString(2).replace(/0/g, '').length
    if (index === slots.length) return { score: 0, ids: [] }
    const cached = memo.get(mask); if (cached) return cached
    let best = { score: -Infinity, ids: [] as string[] }
    players.forEach((p, i) => {
      if (mask & (1 << i)) return
      if (p.slotRatings?.[slots[index]] === 0) return
      const rest = solve(mask | (1 << i))
      const score = roleFit(p, slots[index]) + rest.score
      if (score > best.score) best = { score, ids: [p.id, ...rest.ids] }
    })
    memo.set(mask, best); return best
  }
  const result = solve(0)
  if (!Number.isFinite(result.score)) throw Error('This fair rotation cannot fill every position without a 0-rated role. Review the formation, ratings or match squad; no new plan was saved.')
  return Object.fromEntries(result.ids.map((id, i) => [slots[i], id]))
}
export function buildQuarterPlan(players: QuarterPlayer[], slots: string[], keeper: string): QuarterPlan[] {
  if (!slots.includes('GK') || new Set(slots).size !== slots.length || slots.length > 11 || slots.length < 2) throw Error('Choose a valid formation.')
  if (new Set(players.map(p => p.id)).size !== players.length || !players.some(p => p.id === keeper)) throw Error('Choose a goalkeeper from this match squad.')
  if (players.length < slots.length) throw Error(`Select at least ${slots.length} players in Squad.`)
  const outfield = players.filter(p => p.id !== keeper)
  const fieldSlots = slots.filter(s => s !== 'GK')
  const counts = new Map(outfield.map(p => [p.id, 0]))
  let lastBench: string[] = []
  return Array.from({ length: 4 }, () => {
    const ranked = [...outfield].sort((a, b) => Number(lastBench.includes(b.id)) - Number(lastBench.includes(a.id)) || counts.get(a.id)! - counts.get(b.id)! || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
    const side = ranked.slice(0, fieldSlots.length)
    side.forEach(p => counts.set(p.id, counts.get(p.id)! + 1))
    const lineup = { GK: keeper, ...assignRoles(side, fieldSlots) }
    const bench = outfield.filter(p => !side.includes(p)).map(p => p.id)
    lastBench = bench
    return { lineup, bench }
  })
}
export function planWarnings(plans: QuarterPlan[], players: QuarterPlayer[], slots: string[], keeper: string) {
  const warnings: string[] = []
  const counts = players.filter(p => p.id !== keeper).map(p => plans.filter(q => Object.values(q.lineup).includes(p.id)).length)
  if (counts.length && Math.max(...counts) - Math.min(...counts) > 1) warnings.push('Outfield playing time differs by more than one quarter. Review the plan.')
  players.forEach(p => {
    if (plans.some((q, i) => i > 0 && q.bench.includes(p.id) && plans[i - 1].bench.includes(p.id))) warnings.push(`${p.name}: consecutive quarters on the bench.`)
  })
  plans.forEach((q, i) => {
    slots.filter(s => s !== 'GK').forEach(s => {
      const p = players.find(p => p.id === q.lineup[s])
      if (!p) return
      const rating = p.slotRatings?.[s]
      if (rating === 0) warnings.push(`Q${i + 1}: ${p.name} at ${s} is rated 0 — avoid. Change this position before applying.`)
      else if (rating === 1 || rating === 2) warnings.push(`Q${i + 1}: ${p.name} at ${s} is rated ${rating}/5 — ${rating === 1 ? 'emergency cover' : 'developing / cover'}.`)
      else if (rating == null && !roleFit(p, s)) warnings.push(`Q${i + 1}: check ${p.name} at ${s}; no rating or matching preferred role.`)
    })
  })
  return warnings
}
