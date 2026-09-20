const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const storage = new Map()
const context = { exports: {}, window: { sessionStorage: { setItem: (key, value) => storage.set(key, value) } } }
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/lib/scheduledMatch.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, context)
const { parseScheduledMatch, scheduledMatchKey, matchWorkflowKey, openScheduledMatch } = context.exports
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
console.log('PASS: handoff details, malformed data, team isolation, separate match keys and cancelled/non-match guards')
