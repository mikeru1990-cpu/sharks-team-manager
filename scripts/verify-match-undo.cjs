const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const source = fs.readFileSync('app/components/matchday/MatchCentreWorkflow.tsx', 'utf8')
const ast = ts.createSourceFile('workflow.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
const functions = {}
function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name) functions[node.name.text] = node.getText(ast)
  ts.forEachChild(node, visit)
}
visit(ast)
function run(overrides = {}) {
  const calls = []
  const context = {
    undo: { formation: '2-3-1', home: 1, away: 0, live: ['a'], positions: { a: 'GK' }, timeline: [], quarterDraft: '{"applied":1}' },
    finished: false, running: false, key: 'team:fixture',
    window: { alert: message => calls.push(['alert', message]) },
    localStorage: { setItem: (...args) => calls.push(['save', ...args]), removeItem: key => calls.push(['remove', key]) },
    ...overrides,
  }
  for (const name of ['Formation', 'Home', 'Away', 'Live', 'Positions', 'Timeline', 'Undo']) context[`set${name}`] = value => calls.push([name, value])
  vm.runInNewContext(ts.transpileModule(functions.undoLast + '\nundoLast()', {}).outputText, context)
  return calls
}
const restored = run()
assert.deepEqual(restored[0], ['save', 'team:fixture:quarters-v1', '{"applied":1}'])
assert.ok(restored.some(([name, value]) => name === 'Formation' && value === '2-3-1'))
assert.deepEqual(restored.at(-1), ['Undo', null])
assert.deepEqual(run({ finished: true }), [])
assert.deepEqual(run({ undo: null }), [])
assert.equal(run({ running: true }).length, 1)
const failure = run({ localStorage: { setItem() { throw Error('quota') } } })
assert.equal(failure.length, 1)
assert.equal(failure[0][0], 'alert')
for (const name of ['halfTime', 'secondHalf', 'fullTime']) assert.match(functions[name], /setUndo\(null\)/)
assert.match(source, /snapshot\(quarterDraft\)/)
console.log('PASS: quarter progress and formation restored; running/finished guards; storage failure leaves match unchanged; period boundaries clear stale Undo.')
