const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const storage = new Map()
const context = { exports: {}, window: { sessionStorage: { setItem: (key, value) => storage.set(key, value) } } }
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/lib/scheduledMatch.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, context)
const { parseScheduledMatch, scheduledMatchKey, matchWorkflowKey, openScheduledMatch, responseForMatch } = context.exports
const event = { id: 'match-1', teamId: 'team-a', title: 'Sunday match', startsAt: '2026-09-20T10:00:00Z', meetAt: null, locationName: 'Playing fields', notes: 'Bring water', eventType: 'match', status: 'scheduled' }
openScheduledMatch(event)
const saved = storage.get(scheduledMatchKey('team-a'))
assert.equal(parseScheduledMatch(saved, 'team-a').title, event.title)
assert.equal(parseScheduledMatch(saved, 'team-b'), null)
assert.equal(parseScheduledMatch('{broken', 'team-a'), null)
assert.equal(parseScheduledMatch(JSON.stringify({ ...event, startsAt: 'bad date' }), 'team-a'), null)
assert.equal(parseScheduledMatch(JSON.stringify({ ...event, meetAt: {} }), 'team-a'), null)
assert.notEqual(matchWorkflowKey(event), matchWorkflowKey({ ...event, id: 'match-2' }))
assert.notEqual(matchWorkflowKey(event), matchWorkflowKey({ ...event, teamId: 'team-b' }))
assert.notEqual(matchWorkflowKey({ ...event, teamId: 'a:b', id: 'c' }), matchWorkflowKey({ ...event, teamId: 'a', id: 'b:c' }))
assert.throws(() => openScheduledMatch({ ...event, status: 'cancelled' }))
assert.throws(() => openScheduledMatch({ ...event, eventType: 'training' }))
assert.equal(storage.size, 1)
openScheduledMatch(event, [
  { eventId: event.id, playerId: 'cloud-player', response: 'available', note: 'Not copied' },
  { eventId: 'other-event', playerId: 'local-player', response: 'unavailable', note: '' },
  { eventId: event.id, playerId: 'local-player', response: 'maybe', note: '' },
])
const withResponses = parseScheduledMatch(storage.get(scheduledMatchKey(event.teamId)), event.teamId)
assert.equal(responseForMatch(withResponses, { id: 'local-player', cloudId: 'cloud-player' }), 'available')
assert.equal(responseForMatch(withResponses, { id: 'local-player' }), 'maybe')
assert.equal(responseForMatch(withResponses, { id: 'missing' }), 'unanswered')
assert.equal(responseForMatch(event, { id: 'missing' }), 'unanswered')
assert.ok(withResponses.availabilityCapturedAt)
assert.equal(JSON.stringify(withResponses).includes('Not copied'), false)
assert.equal(parseScheduledMatch(JSON.stringify({ ...event, availability: ['available'] }), event.teamId), null)
assert.equal(parseScheduledMatch(JSON.stringify({ ...event, availability: { id: 'invalid' } }), event.teamId), null)
assert.equal(parseScheduledMatch(JSON.stringify({ ...event, availabilityCapturedAt: {} }), event.teamId), null)
assert.equal(parseScheduledMatch(JSON.stringify(event), event.teamId).id, event.id)
console.log('PASS: cloud/local player IDs, per-event responses, missing responses, legacy snapshots, invalid payloads and omission of response notes')
console.log('PASS: handoff details, malformed data, team isolation, separate match keys and cancelled/non-match guards')
