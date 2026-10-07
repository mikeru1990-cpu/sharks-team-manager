const assert = require('node:assert/strict')
const fs = require('node:fs')
const vm = require('node:vm')
const ts = require('typescript')
const ctx = { exports: {} }
vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/lib/quarterPlanner.ts','utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText,ctx)
const {buildQuarterPlan,planWarnings,roleFit}=ctx.exports
const {ratingsForSlots}=ctx.exports
const ratings={goalkeeper:5,defence:3,centre_mid:2,wide:4,striker:1}
const mapped=ratingsForSlots(ratings,[{key:'GK',x:50},{key:'D1',x:31},{key:'M1',x:20},{key:'M2',x:50},{key:'M3',x:80},{key:'F1',x:50}])
assert.equal(mapped.M1,4);assert.equal(mapped.M2,2);assert.equal(mapped.M3,4);assert.equal(mapped.D1,3);assert.equal(mapped.F1,1)
assert.equal(ratingsForSlots({...ratings,defence:NaN},[{key:'D1',x:50}]).D1,null)
assert.equal(roleFit({primaryPosition:'TBC',secondaryPositions:[],slotRatings:{D1:4}},'D1'),40)
assert.equal(roleFit({primaryPosition:'CB',secondaryPositions:[],slotRatings:{D1:0}},'D1'),-1000)
assert.equal(roleFit({primaryPosition:'CB',secondaryPositions:[],slotRatings:{D1:null}},'D1'),2)
const specialists=[{id:'g',name:'GK',primaryPosition:'GK',secondaryPositions:[]},{id:'a',name:'A',primaryPosition:'TBC',secondaryPositions:[],slotRatings:{D1:1,F1:5}},{id:'b',name:'B',primaryPosition:'TBC',secondaryPositions:[],slotRatings:{D1:5,F1:1}}]
const rated=buildQuarterPlan(specialists,['GK','D1','F1'],'g')
assert.equal(rated[0].lineup.D1,'b');assert.equal(rated[0].lineup.F1,'a')
assert.throws(()=>buildQuarterPlan(specialists.map(p=>({...p,slotRatings:{D1:0,F1:4}})),['GK','D1','F1'],'g'),/0-rated/)
assert.ok(planWarnings(rated,specialists.map(p=>({...p,slotRatings:{D1:1,F1:2}})),['GK','D1','F1'],'g').some(w=>w.includes('emergency cover')))
console.log('PASS: cloud rating slot mapping, wide/central distinction, numeric validation, optimal role assignment and no automatic 0-rated roles')
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
const {readQuarterDraft}=ctx.exports
const draft={plans:q,keeper:'p0',duration:15,signature:'team-match-formation',applied:2}
const read=x=>readQuarterDraft(JSON.stringify(x),draft.signature,p,s)
assert.equal(read(draft).applied,2)
for(const applied of [-1,5,1.5,null]) assert.equal(read({...draft,applied}),null)
for(const duration of [0,11,90,null]) assert.equal(read({...draft,duration}),null)
assert.equal(read({...draft,signature:'other-team'}),null)
assert.equal(readQuarterDraft('{broken',draft.signature,p,s),null)
for(const corrupt of [
 {...q[0],lineup:{...q[0].lineup,GK:'p1'}},
 {...q[0],lineup:{...q[0].lineup,extra:'p9'}},
 {...q[0],bench:[...q[0].bench,'p0']},
 {...q[0],bench:q[0].bench.map((id,i)=>i===0?'removed':id)},
 {...q[0],lineup:null},
]) assert.equal(read({...draft,plans:[corrupt,...q.slice(1)]}),null)
console.log('PASS: saved-plan restore, corrupt JSON, stale scope, fixed keeper, exact squad coverage and quarter progress bounds')
