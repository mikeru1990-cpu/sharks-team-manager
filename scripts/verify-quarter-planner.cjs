const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const ctx = { exports: {} }
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/lib/quarterPlanner.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText,ctx)
const {buildQuarterPlan,planWarnings,roleFit}=ctx.exports
const make=n=>Array.from({length:n},(_,i)=>({id:`p${i}`,name:`Player ${i}`,primaryPosition:i===0?'GK':['CB','CM','ST'][i%3],secondaryPositions:['CB','CM','ST']}))
for (const field of [5,7,9,11]) for (let total=field;total<=Math.min(22,field*2);total++) {
 const players=make(total),slots=['GK',...Array.from({length:field-1},(_,i)=>`${['D','M','F'][i%3]}${i}`)]
 const plans=buildQuarterPlan(players,slots,'p0')
 assert.equal(plans.length,4)
 plans.forEach((q,i)=>{
  assert.equal(q.lineup.GK,'p0');assert.equal(new Set(Object.values(q.lineup)).size,field)
  assert.equal(q.bench.length,total-field)
  assert.equal(new Set([...Object.values(q.lineup),...q.bench]).size,total)
  if(i && total-field<=field-1) assert.equal(q.bench.some(id=>plans[i-1].bench.includes(id)),false)
 })
 const counts=players.slice(1).map(p=>plans.filter(q=>Object.values(q.lineup).includes(p.id)).length)
 assert.ok(Math.max(...counts)-Math.min(...counts)<=1,`Fairness ${field}/${total}`)
}
const p=make(11),s=['GK','D1','D2','M1','M2','M3','F1']
const q=buildQuarterPlan(p,s,'p0')
assert.equal(q[0].bench.length,4)
assert.throws(()=>buildQuarterPlan(p.slice(0,6),s,'p0'))
assert.throws(()=>buildQuarterPlan(p,s,'missing'))
assert.throws(()=>buildQuarterPlan([...p,p[0]],s,'p0'))
assert.equal(roleFit({primaryPosition:'DM',secondaryPositions:[]},'M1'),2)
assert.equal(roleFit({primaryPosition:'CB',secondaryPositions:['ST']},'F1'),1)
assert.equal(roleFit({primaryPosition:'TBC',secondaryPositions:[]},'D1'),0)
const impossible=make(15)
assert.ok(planWarnings(buildQuarterPlan(impossible,s,'p0'),impossible,s,'p0').some(w=>w.includes('consecutive')))
console.log('PASS: 5/7/9/11-a-side, fixed keeper, balanced minutes, four substitutes, no consecutive bench when feasible, impossible constraints and role matching')
