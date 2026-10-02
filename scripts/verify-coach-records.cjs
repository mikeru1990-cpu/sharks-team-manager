// Static release guards for the coach-only UI. Live RLS/RPC checks are separate.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const read = path => fs.readFileSync(path, 'utf8')
const schema = read('supabase/migrations/20260927113647_cloud_coach_records.sql')
for (const table of ['player_position_profiles', 'team_match_reports', 'team_match_awards']) {
  assert.ok(schema.includes(`alter table public.${table} enable row level security`), `${table}: RLS required`)
}
assert.equal((schema.match(/security invoker/g) || []).length, 2)
assert.ok(schema.includes('primary key(event_id,category,player_id)'), 'Tied winners must be distinct rows')
assert.ok(schema.includes('Reload before saving.'), 'Concurrent edits must not silently overwrite')
const profiles = read('app/components/players/PositionProfiles.tsx')
const reports = read('app/components/matchday/CloudMatchReports.tsx')
for (const source of [profiles, reports]) {
  assert.ok(source.includes('expected_version:'), 'UI must send optimistic concurrency version')
  assert.ok(source.includes('.eq("team_id", teamId)'), 'Reads must be team-scoped')
  assert.ok(!source.includes('localStorage'), 'Private cloud records must not enter device storage')
}
assert.ok(read('app/components/players/PlayersScreen.tsx').includes('activeTeam?.canManage && <PositionProfiles'))
assert.ok(read('app/components/matchday/MatchdayScreen.tsx').includes('activeTeam?.canManage && <CloudMatchReports'))
console.log('PASS: coach UI gates, team-scoped reads, no local cache, RLS declarations, versioned saves and tied-award key')
