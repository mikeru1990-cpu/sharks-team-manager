export type QuarterPlayer = { id: string; name: string; primaryPosition: string; secondaryPositions: string[] }
export type QuarterPlan = { lineup: Record<string, string>; bench: string[] }
export function roleGroup(role: string): string {
  const r = role.toUpperCase()
  if (r === 'GK') return 'GK'
  if (/^(DM|AM|CM|LM|RM|MID|M\d)/.test(r)) return 'MID'
  if (/^(D\d|DEF|CB|LB|RB|LDEF|RDEF|WB)/.test(r)) return 'DEF'
  if (/^(F\d|FWD|ST|CF|LW|RW)/.test(r)) return 'FWD'
  return r
}
export function roleFit(player: QuarterPlayer, slot: string) {
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
      const rest = solve(mask | (1 << i))
      const score = roleFit(p, slots[index]) + rest.score
      if (score > best.score) best = { score, ids: [p.id, ...rest.ids] }
    })
    memo.set(mask, best); return best
  }
  return Object.fromEntries(solve(0).ids.map((id, i) => [slots[i], id]))
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
      if (p && !roleFit(p, s)) warnings.push(`Q${i + 1}: check ${p.name} at ${s}; no matching preferred role.`)
    })
  })
  return warnings
}
