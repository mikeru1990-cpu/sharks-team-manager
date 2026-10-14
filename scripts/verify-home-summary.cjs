const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const context = { exports: {}, Intl, Date, Map, Set }
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/lib/homeSummary.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, context)
const { upcomingTeamEvents, eventAvailability } = context.exports
const now = Date.parse('2026-10-10T23:30:00Z') // Already Sunday in Britain.
const event = (id, startsAt, status = 'scheduled', endsAt = null) => ({ id, startsAt, status, endsAt })
assert.equal(upcomingTeamEvents([
  event('tomorrow', '2026-10-12T09:00:00Z'),
  event('yesterday', '2026-10-10T09:00:00Z'),
  event('cancelled', '2026-10-11T08:00:00Z', 'cancelled'),
  event('completed', '2026-10-11T08:00:00Z', 'completed'),
  event('today', '2026-10-11T09:00:00Z'),
  event('invalid', 'bad'),
  event('ended', '2026-10-10T23:00:00Z', 'scheduled', '2026-10-10T23:15:00Z'),
], now).map(e => e.id).join(','), 'today,tomorrow')
assert.equal(upcomingTeamEvents([event('old', '2020-01-01')], now).length, 0)
const counts = eventAvailability('fixture', [
  { eventId: 'fixture', playerId: 'a', response: 'available' },
  { eventId: 'fixture', playerId: 'b', response: 'maybe' },
  { eventId: 'fixture', playerId: 'departed', response: 'available' },
  { eventId: 'other', playerId: 'c', response: 'available' },
], ['a', 'b', 'c', 'a'])
assert.equal(JSON.stringify(counts), JSON.stringify({ available: 1, maybe: 1, unavailable: 0, unanswered: 1 }))
console.log('Home summary: London date boundary, ordering, cancelled/completed exclusion, stale fixtures and active-player availability passed.')
const { matchesNeedingReports, hasUnfinishedMatch } = context.exports
const match = (id, date, status = 'scheduled') => ({ ...event(id, date, status), eventType: 'match' })
assert.equal(matchesNeedingReports([
  match('missing', '2026-10-04T10:00:00Z'),
  match('reported', '2026-10-03T10:00:00Z', 'completed'),
  match('cancelled', '2026-10-02T10:00:00Z', 'cancelled'),
  match('today', '2026-10-11T09:00:00Z'),
  { ...match('training', '2026-10-01T09:00:00Z'), eventType: 'training' },
], ['reported'], now).map(e => e.id).join(','), 'missing')
assert.equal(hasUnfinishedMatch({ period: 1, seconds: 0 }), true)
assert.equal(hasUnfinishedMatch({ period: 0, seconds: 0 }), false)
assert.equal(hasUnfinishedMatch({ period: 4, finished: true }), false)
assert.equal(hasUnfinishedMatch({}), false)
console.log('Follow-up checks: missing results exclude today, training, cancelled and reported games; match resume works at 00:00.')
