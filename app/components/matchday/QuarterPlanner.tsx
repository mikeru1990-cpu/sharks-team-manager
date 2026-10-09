"use client"

import { useEffect, useState, type CSSProperties } from 'react'
import { buildQuarterPlan, planWarnings, readQuarterDraft, quarterRoleLabel, type QuarterPlan, type QuarterPlayer } from '../../lib/quarterPlanner'

type Props = {
  ratingsPending?: boolean
  players: QuarterPlayer[]; slots: string[]; storageKey: string; locked: boolean; running: boolean; finished: boolean
  onApply: (plan: QuarterPlan, quarter: number) => boolean
}
const card: CSSProperties = { padding: 16, borderRadius: 16, border: '1px solid #334155', background: '#0f172a', display: 'grid', gap: 12 }
const control: CSSProperties = { minHeight: 44, padding: 10, borderRadius: 10, background: '#1e293b', color: 'white', border: '1px solid #64748b', width: '100%', fontSize: 16 }
export default function QuarterPlanner({ players, slots, storageKey, locked, running, finished, onApply, ratingsPending = false }: Props) {
  const signature = JSON.stringify([players.map(p => [p.id, p.primaryPosition, p.secondaryPositions]).sort(), slots])
  const key = `${storageKey}:quarters-v1`
  const [keeper, setKeeper] = useState(players.find(p => p.primaryPosition === 'GK')?.id ?? '')
  const [duration, setDuration] = useState(15)
  const [plans, setPlans] = useState<QuarterPlan[]>([])
  const [savedSignature, setSavedSignature] = useState('')
  const [quarter, setQuarter] = useState(0)
  const [applied, setApplied] = useState(0)
  const [message, setMessage] = useState('')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    try {
      const saved = readQuarterDraft(localStorage.getItem(key), signature, players, slots)
      if (saved) {
        setPlans(saved.plans); setKeeper(saved.keeper); setSavedSignature(saved.signature)
        setDuration(saved.duration)
        setApplied(saved.applied)
        setQuarter(locked ? Math.min(saved.applied, 3) : 0)
      }
    } catch { /* Invalid device drafts are ignored. */ }
    setReady(true)
  }, [key])
  const valid = plans.length === 4 && savedSignature === signature && players.some(p => p.id === keeper)
  useEffect(() => {
    if (!ready || !valid) return
    try { localStorage.setItem(key, JSON.stringify({ plans, keeper, duration, signature, applied })) }
    catch { setMessage('This device could not save the quarter plan. Keep this screen open.') }
  }, [plans, keeper, duration, signature, applied, key, ready, valid])
  const name = (id: string) => players.find(p => p.id === id)?.name ?? 'Unknown player'
  function generate() {
    try {
      if (plans.length && !window.confirm('Replace the saved four-quarter plan?')) return
      setPlans(buildQuarterPlan(players, slots, keeper)); setSavedSignature(signature); setApplied(0); setQuarter(0); setMessage('Plan created. Review positions and playing time before using it.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not create the plan.') }
  }
  function replace(slot: string, id: string) {
    setApplied(0)
    setMessage('Plan adjusted. Use Q1 again before kick-off.')
    setPlans(current => current.map((q, i) => {
      if (i !== quarter) return q
      const lineup = { ...q.lineup }
      const previous = lineup[slot]
      const other = Object.keys(lineup).find(s => lineup[s] === id)
      lineup[slot] = id
      if (other) lineup[other] = previous
      return { lineup, bench: players.filter(p => !Object.values(lineup).includes(p.id)).map(p => p.id) }
    }))
  }
  const warnings = valid ? planWarnings(plans, players, slots, keeper) : []
  const current = plans[quarter]
  return <section style={card} aria-label="Four-quarter planner">
    <h2 style={{ margin: 0 }}>Four-quarter planner</h2>
    <p style={{ margin: 0, color: '#cbd5e1' }}>Changes between quarters. Goalkeeper stays on. Outfield time is balanced first; saved coach ratings guide positions, with preferred roles as fallback. Season minutes are not used yet.</p>
    <label>Fixed goalkeeper<select style={control} value={keeper} disabled={locked} onChange={e => { setKeeper(e.target.value); setSavedSignature('') }}><option value="">Choose goalkeeper</option>{players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    <label>Minutes per quarter<select style={control} value={duration} disabled={locked} onChange={e => setDuration(Number(e.target.value))}>{[5,10,12,15,20,25,30].map(n => <option key={n} value={n}>{n} minutes</option>)}</select></label>
    <button style={control} disabled={!ready || locked || !keeper || ratingsPending} onClick={generate}>{plans.length ? 'Rebuild four quarters' : 'Build four quarters'}</button>
    {message && <p role="status">{message}</p>}
    {plans.length > 0 && !valid && <p role="alert">Squad or formation has changed. Rebuild the plan before using it.</p>}
    {!plans.length && locked && <p>Create a quarter plan before kick-off. Use Live for this match’s substitutions.</p>}
    {valid && <>
      <p role="status" style={{ margin: 0, color: '#bfdbfe' }}>{finished ? 'Match completed.' : locked ? applied === 4 ? 'Q4 applied — all planned changes completed.' : applied > 0 ? `Next change: Q${applied + 1}.${running ? ' Pause the clock in Live first.' : ' Match paused — ready to apply.'}` : 'Q1 was not applied before kick-off. Use Live for substitutions.' : applied === 1 ? 'Q1 is ready in Lineup.' : 'Review all quarters, then use Q1 as your starting lineup.'}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>{plans.map((_, i) => <button key={i} style={{ ...control, background: i === quarter ? '#1d4ed8' : '#1e293b' }} aria-pressed={quarter === i} onClick={() => setQuarter(i)}>Q{i + 1}</button>)}</div>
      <strong>Q{quarter + 1} · {quarter * duration}–{(quarter + 1) * duration} minutes</strong>
      {slots.map(slot => <label key={slot}>{slot === 'GK' ? 'Goalkeeper' : slot}<select style={control} aria-label={`Q${quarter + 1} ${slot}`} value={current.lineup[slot]} disabled={locked || slot === 'GK'} onChange={e => replace(slot, e.target.value)}>{players.filter(p => slot === 'GK' ? p.id === keeper : p.id !== keeper).map(p => <option key={p.id} value={p.id}>{p.name} · {quarterRoleLabel(p, slot)}</option>)}</select></label>)}
      <strong>Bench · {current.bench.length}</strong><p style={{ margin: 0 }}>{current.bench.map(name).join(' · ') || 'No substitutes'}</p>
      {quarter > 0 && <p>Coming on: {Object.values(current.lineup).filter(id => plans[quarter - 1].bench.includes(id)).map(name).join(' · ') || 'None'}<br/>Coming off: {current.bench.filter(id => Object.values(plans[quarter - 1].lineup).includes(id)).map(name).join(' · ') || 'None'}</p>}
      <button style={control} disabled={finished || running || (!locked && quarter !== 0) || (locked && (applied < 1 || quarter + 1 !== applied + 1))} onClick={() => {
        if (!window.confirm(locked ? `Apply Q${quarter + 1} to the paused live lineup? The clock will not jump or restart.` : 'Use Q1 as your starting lineup?')) return
        if (!onApply(current, quarter + 1)) { setMessage('The lineup could not be applied. Check the squad and pause the match first.'); return }
        setApplied(quarter + 1); setMessage(locked ? `Q${quarter + 1} applied. Return to Live and resume when ready.` : 'Q1 copied to Lineup. Review it there, then kick off.')
      }}>{locked ? `Apply Q${quarter + 1} to paused match` : 'Use Q1 as starting lineup'}</button>
      <p style={{ color: '#cbd5e1', margin: 0 }}>Pause the clock in Live at each quarter break, then apply the next quarter here. No automatic substitutions. Planned minutes below are estimates; Live records actual time.</p>
      <h3 style={{ margin: 0 }}>Playing time</h3>
      {players.map(p => { const quarters = plans.flatMap((q, i) => Object.values(q.lineup).includes(p.id) ? [`Q${i + 1}`] : []); return <div key={p.id} style={{ borderTop: '1px solid #334155', paddingTop: 8 }}>{p.name} · <strong>{quarters.length * duration} min</strong><br/><small>{quarters.join(' · ') || 'No quarters'}{p.id === keeper ? ' · Fixed goalkeeper' : ''}</small></div> })}
      {warnings.length > 0 && <details><summary>Review {warnings.length} position / fairness notes</summary><ul>{warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></details>}
      <small>Saved on this device for this match. Changing the squad or formation requires rebuilding.</small>
    </>}
  </section>
}
