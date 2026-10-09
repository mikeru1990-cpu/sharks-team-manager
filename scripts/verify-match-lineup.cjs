const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const context = { exports: {} }
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/lib/matchLineup.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, context)
const { lineupProblem } = context.exports
const squad = ['keeper', 'defender', 'forward', 'sub']
const starters = squad.slice(0, 3)
const slots = ['GK', 'D1', 'F1']
// The coach deliberately swapped outfield roles. They remain valid, regardless of roster order.
const positions = { keeper: 'GK', defender: 'F1', forward: 'D1', sub: 'old-slot' }
assert.equal(lineupProblem(starters, squad, squad, positions, slots), null)
assert.equal(positions.defender, 'F1')
assert.ok(lineupProblem(['keeper', 'keeper', 'forward'], squad, squad, positions, slots))
assert.ok(lineupProblem(starters, squad, squad.filter(id => id !== 'forward'), positions, slots))
assert.ok(lineupProblem(starters, squad.filter(id => id !== 'forward'), squad, positions, slots))
assert.ok(lineupProblem(starters, squad, squad, { ...positions, forward: 'F1' }, slots))
assert.ok(lineupProblem(starters, squad, squad, {}, slots))
assert.ok(lineupProblem(starters, squad, squad, positions, ['GK', 'M1', 'F1']))
assert.ok(lineupProblem(starters.slice(1), squad, squad, positions, slots))
console.log('PASS: reviewed roles, duplicate players/slots, missing roles, formation changes and removed/ineligible starters')
