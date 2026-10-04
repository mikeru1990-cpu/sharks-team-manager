const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const context = { exports: {}, TextEncoder }
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/lib/fixtureCalendar.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, context)
const { buildFixtureCalendar } = context.exports
const now = Date.parse('2026-10-03T10:00:00Z')
const match = { id: 'one', teamId: 'team-a', eventType: 'match', status: 'scheduled', title: 'Sharks, v; Test\nClub', startsAt: '2026-10-04T10:00:00+01:00', endsAt: null, locationName: 'Pitch ' + '⚽'.repeat(50), notes: 'PRIVATE', meetAt: null }
const events = [match, { ...match, teamId: 'team-b' }, { ...match, status: 'cancelled' }, { ...match, status: 'completed' }, { ...match, eventType: 'training' }, { ...match, startsAt: '2026-09-01' }]
const calendar = buildFixtureCalendar(events, 'team-a', 90, now)
assert.equal(calendar.split('BEGIN:VEVENT').length - 1, 1)
assert.ok(calendar.includes('DTSTART:20261004T090000Z'))
assert.ok(calendar.includes('DTEND:20261004T103000Z'))
assert.ok(calendar.includes('SUMMARY:Sharks\\, v\\; Test\\nClub'))
assert.ok(!calendar.includes('PRIVATE'))
assert.ok(calendar.endsWith('END:VCALENDAR\r\n'))
for (const line of calendar.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75)
assert.throws(() => buildFixtureCalendar([], 'team-a', 90, now))
assert.throws(() => buildFixtureCalendar(events, 'team-a', 0, now))
assert.throws(() => buildFixtureCalendar([{ ...match, endsAt: match.startsAt }], 'team-a', 90, now))
assert.ok(buildFixtureCalendar([{ ...match, startsAt: '2026-11-01T10:00:00+00:00' }], 'team-a', 60, now).includes('DTSTART:20261101T100000Z'))
assert.equal(calendar.match(/UID:.*/)[0], buildFixtureCalendar(events, 'team-a', 90, now + 1000).match(/UID:.*/)[0])
console.log('PASS: team isolation, status/date filtering, UTC/DST, duration, stable IDs, escaping, UTF-8 folding and private-note exclusion')
