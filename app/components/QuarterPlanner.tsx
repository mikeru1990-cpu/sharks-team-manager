"use client"

import { useMemo, useState } from "react"
import type { PitchSlot, Player, QuarterPlan } from "../lib/types"
import { Badge, PageCard, PrimaryButton, SecondaryButton, SectionHeader } from "./ui"

type PeriodMode = "quarters" | "halves"

type Props = {
  isAdmin: boolean
  currentQuarter: number
  setCurrentQuarter: (q: number) => void
  quarterPlans: Record<number, QuarterPlan>
  quarterWarnings: string[]
  currentSlots: PitchSlot[]
  players: Player[]
  lineupMap: Record<string, string | null>
  benchIds: string[]
  onSaveCurrentQuarter: () => Promise<void>
  onLoadQuarter: (quarter: number) => void
  onAutoGenerate: () => Promise<void>
  periodMode: PeriodMode
  periodLength: number
}

type PlayerMinuteRow = { player: Player; minutes: number; periodsOn: number[]; periodsBenched: number[]; consecutiveBench: boolean }

function normalise(value: string) { return value.toLowerCase().trim() }
function Stat({ label, value, colour = "#7dd3fc" }: { label: string; value: string | number; colour?: string }) { return <div style={{ borderRadius: 16, background: "rgba(2,6,23,0.46)", border: `1px solid ${colour}55`, padding: 11 }}><div style={{ fontSize: 10, fontWeight: 1000, letterSpacing: ".09em", color: "#94a3b8", textTransform: "uppercase" }}>{label}</div><div style={{ marginTop: 5, fontSize: 22, fontWeight: 1000, lineHeight: 1, color: colour }}>{value}</div></div> }
function chip(active: boolean) { return { border: active ? "1px solid rgba(125,211,252,0.75)" : "1px solid rgba(148,163,184,0.22)", background: active ? "rgba(14,165,233,0.22)" : "rgba(255,255,255,0.06)", color: active ? "#7dd3fc" : "#cbd5e1", borderRadius: 14, padding: "10px 12px", fontWeight: 1000 as const, fontSize: 13, minWidth: 58, cursor: "pointer" } }
function getPlanPlayerIds(plan?: QuarterPlan) { if (!plan) return new Set<string>(); return new Set(Object.values(plan.lineup || {}).filter(Boolean) as string[]) }
function getMinuteRows(players: Player[], quarterPlans: Record<number, QuarterPlan>, periodCount: number, periodLength: number): PlayerMinuteRow[] { return players.map((player) => { const periodsOn: number[] = []; const periodsBenched: number[] = []; for (let period = 1; period <= periodCount; period += 1) { const plannedIds = getPlanPlayerIds(quarterPlans[period]); if (plannedIds.has(player.id)) periodsOn.push(period); else if (quarterPlans[period]) periodsBenched.push(period) } const consecutiveBench = periodsBenched.some((period, index) => index > 0 && period === periodsBenched[index - 1] + 1); return { player, minutes: periodsOn.length * periodLength, periodsOn, periodsBenched, consecutiveBench } }) }
function getTone(value: number, average: number) { if (average <= 0) return "#38bdf8"; if (value < average - 8) return "#ef4444"; if (value < average - 4) return "#f59e0b"; return "#22c55e" }
function findLockedGoalkeeper(players: Player[], currentSlots: PitchSlot[], lineupMap: Record<string, string | null>) { const gkSlot = currentSlots.find((slot) => slot.position === "GK"); const currentGkId = lineupMap[gkSlot?.id || ""]; return players.find((player) => player.id === currentGkId) || players.find((player) => player.mainGK) || players.find((player) => normalise(player.name).includes("darcy-rae")) || null }
function cleanWarnings(warnings: string[], lockedGoalkeeper?: Player | null) { return warnings.filter((warning) => !lockedGoalkeeper || !normalise(warning).includes(normalise(lockedGoalkeeper.name))) }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)) }

function RotationHealth({ savedPeriods, fairnessScore, lowRows, benchRows, shortLabel, averageMinutes, warnings }: { savedPeriods: number; fairnessScore: number; lowRows: PlayerMinuteRow[]; benchRows: PlayerMinuteRow[]; shortLabel: string; averageMinutes: number; warnings: string[] }) {
  if (savedPeriods === 0) return <div style={{ borderRadius: 16, padding: 12, background: "rgba(14,165,233,0.12)", border: "1px solid rgba(56,189,248,0.32)", color: "#bae6fd", fontWeight: 900 }}>Auto-balance or save the rotation to see matchday minutes and fairness checks.</div>
  const tone = fairnessScore >= 85 ? "#22c55e" : fairnessScore >= 65 ? "#f59e0b" : "#ef4444"
  const label = fairnessScore >= 85 ? "Excellent" : fairnessScore >= 65 ? "Warning" : "Needs Work"
  const issueNames = [...lowRows.slice(0, 3).map((row) => `${row.player.name} below target (${row.minutes}m vs ${averageMinutes}m)`), ...benchRows.slice(0, 3).map((row) => `${row.player.name} benched ${row.periodsBenched.map((period) => `${shortLabel}${period}`).join(", ")}`)]
  return <div style={{ borderRadius: 18, padding: 13, background: `${tone}16`, border: `1px solid ${tone}66`, display: "grid", gap: 8 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><div style={{ color: "white", fontWeight: 1000, fontSize: 18 }}>Rotation Health: {label}</div><Badge tone={fairnessScore >= 85 ? "green" : fairnessScore >= 65 ? "yellow" : "red"}>{fairnessScore}%</Badge></div>{issueNames.length === 0 && warnings.length === 0 ? <div style={{ color: "#bbf7d0", fontWeight: 850 }}>Rotation looks strong for the selected matchday squad size.</div> : <div style={{ display: "grid", gap: 6 }}>{issueNames.map((issue) => <div key={issue} style={{ color: tone === "#ef4444" ? "#fecdd3" : "#fde68a", fontWeight: 850 }}>• {issue}</div>)}{warnings.slice(0, 2).map((warning, index) => <div key={index} style={{ color: "#fde68a", fontWeight: 850 }}>• {warning}</div>)}</div>}</div>
}

export default function QuarterPlanner({ isAdmin, currentQuarter, setCurrentQuarter, quarterPlans, quarterWarnings, currentSlots, players, lineupMap, benchIds, onSaveCurrentQuarter, onLoadQuarter, onAutoGenerate, periodMode, periodLength }: Props) {
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"
  const shortLabel = periodMode === "quarters" ? "Q" : "H"
  const currentFilledCount = currentSlots.filter((slot) => lineupMap[slot.id]).length
  const lockedGoalkeeper = findLockedGoalkeeper(players, currentSlots, lineupMap)
  const currentGoalkeeper = lockedGoalkeeper?.name || "Empty"
  const activePlayers = players
  const minSquadSize = Math.max(1, currentSlots.length || currentFilledCount || 1)
  const maxSquadSize = Math.max(minSquadSize, activePlayers.length || minSquadSize)
  const detectedSize = clamp(currentFilledCount + benchIds.length, minSquadSize, maxSquadSize)
  const matchdaySize = clamp(selectedSize ?? detectedSize, minSquadSize, maxSquadSize)
  const squadSizeOptions = useMemo(() => Array.from({ length: maxSquadSize - minSquadSize + 1 }, (_, index) => minSquadSize + index), [minSquadSize, maxSquadSize])
  const matchdayPlayers = useMemo(() => { const pool = activePlayers; if (!lockedGoalkeeper) return pool.slice(0, matchdaySize); const outfield = pool.filter((player) => player.id !== lockedGoalkeeper.id); return [lockedGoalkeeper, ...outfield.slice(0, Math.max(0, matchdaySize - 1))] }, [activePlayers, lockedGoalkeeper, matchdaySize])
  const fairnessPlayers = lockedGoalkeeper ? matchdayPlayers.filter((player) => player.id !== lockedGoalkeeper.id) : matchdayPlayers
  const gkRows = lockedGoalkeeper ? getMinuteRows([lockedGoalkeeper], quarterPlans, periodCount, periodLength) : []
  const rows = getMinuteRows(fairnessPlayers, quarterPlans, periodCount, periodLength)
  const savedPeriods = Object.keys(quarterPlans).length
  const cleanQuarterWarnings = cleanWarnings(quarterWarnings, lockedGoalkeeper)
  const totalMinutes = rows.reduce((sum, row) => sum + row.minutes, 0)
  const averageMinutes = rows.length ? Math.round(totalMinutes / rows.length) : 0
  const severeRows = rows.filter((row) => averageMinutes > 0 && row.minutes < averageMinutes - 8)
  const consecutiveRows = rows.filter((row) => row.consecutiveBench)
  const fairnessScore = savedPeriods === 0 ? 0 : Math.max(0, Math.min(100, 100 - severeRows.length * 14 - consecutiveRows.length * 9 - cleanQuarterWarnings.length * 4))
  const sortedRows = [...rows].sort((a, b) => a.minutes - b.minutes || a.player.name.localeCompare(b.player.name))
  const fixedGkMinutes = periodCount * periodLength
  const matchdayBenchCount = Math.max(0, matchdayPlayers.length - currentFilledCount)
  const incompleteSlots = currentSlots.filter((slot) => !lineupMap[slot.id])

  return <div style={{ display: "grid", gap: 14 }}><PageCard><SectionHeader title="Matchday Rotation Centre" subtitle={`Supports ${minSquadSize}-${maxSquadSize} player squads • ${currentSlots.length || currentFilledCount} on pitch • flexible team sizes`} /><div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}><Stat label="Squad" value={matchdaySize} /><Stat label="Avg" value={`${averageMinutes}m`} /><Stat label="Low mins" value={severeRows.length} colour={severeRows.length ? "#f59e0b" : "#22c55e"} /><Stat label="Bench runs" value={consecutiveRows.length} colour={consecutiveRows.length ? "#ef4444" : "#22c55e"} /></div><div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>{squadSizeOptions.map((size) => <button key={size} onClick={() => setSelectedSize(size)} style={chip(matchdaySize === size)}>{size}</button>)}</div>{lockedGoalkeeper ? <div style={{ borderRadius: 16, padding: 12, background: "rgba(250,204,21,0.12)", border: "1px solid rgba(250,204,21,0.36)", color: "#fde68a", fontWeight: 900, marginBottom: 12 }}>Goalkeeper locked: {lockedGoalkeeper.name} • {fixedGkMinutes}m • excluded from fairness checks</div> : null}{incompleteSlots.length ? <div style={{ borderRadius: 16, padding: 12, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.44)", color: "#fecdd3", fontWeight: 900, marginBottom: 12 }}>Formation incomplete: {incompleteSlots.length} position{incompleteSlots.length === 1 ? "" : "s"} unfilled. Fill the formation before saving the plan.</div> : null}<RotationHealth savedPeriods={savedPeriods} fairnessScore={fairnessScore} lowRows={severeRows} benchRows={consecutiveRows} shortLabel={shortLabel} averageMinutes={averageMinutes} warnings={cleanQuarterWarnings} /></PageCard><PageCard><SectionHeader title={`${periodName} Planner`} subtitle={`${periodCount} periods • ${periodLength} minutes`} /><div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}><Stat label="Now" value={`${shortLabel}${currentQuarter}`} /><Stat label="On" value={currentFilledCount} /><Stat label="Bench" value={matchdayBenchCount} /><Stat label="Length" value={`${periodLength}m`} /></div><div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>{Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => <button key={q} onClick={() => setCurrentQuarter(q)} style={chip(currentQuarter === q)}>{shortLabel}{q}</button>)}</div><div style={{ display: "grid", gridTemplateColumns: isAdmin ? "repeat(3, minmax(0,1fr))" : "1fr", gap: 8 }}>{isAdmin ? <><PrimaryButton onClick={() => void onSaveCurrentQuarter()}>Save</PrimaryButton><SecondaryButton onClick={() => onLoadQuarter(currentQuarter)}>Load</SecondaryButton><SecondaryButton onClick={() => void onAutoGenerate()}>Auto Balance</SecondaryButton></> : <div style={{ color: "#94a3b8" }}>Admin only.</div>}</div></PageCard><PageCard><SectionHeader title="Projected Matchday Minutes" subtitle="Lowest minutes first. Select any matchday squad size above." /><div style={{ display: "grid", gap: 8 }}>{sortedRows.map((row) => { const colour = getTone(row.minutes, averageMinutes); return <div key={row.player.id} style={{ borderRadius: 16, padding: 11, background: "rgba(15,23,42,0.72)", border: `1px solid ${colour}55`, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center" }}><div style={{ minWidth: 0 }}><div style={{ color: "white", fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.player.name}</div><div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850, marginTop: 2 }}>{row.periodsOn.length ? row.periodsOn.map((period) => `${shortLabel}${period}`).join(", ") : "No planned minutes"}</div></div><div style={{ color: colour, fontWeight: 1000, fontSize: 18 }}>{row.minutes}m</div></div> })}{gkRows.map((row) => <div key={row.player.id} style={{ borderRadius: 16, padding: 11, background: "rgba(250,204,21,0.12)", border: "1px solid rgba(250,204,21,0.44)", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center" }}><div><div style={{ color: "white", fontWeight: 1000 }}>{row.player.name}</div><div style={{ color: "#fde68a", fontSize: 12, fontWeight: 850 }}>Locked goalkeeper • excluded from fairness</div></div><div style={{ color: "#facc15", fontWeight: 1000, fontSize: 18 }}>{row.minutes || fixedGkMinutes}m</div></div>)}</div></PageCard><PageCard><SectionHeader title={`Current ${periodName}`} subtitle="Quick snapshot" /><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Badge tone="blue">{shortLabel}{currentQuarter}</Badge><Badge tone="green">Starters {currentFilledCount}</Badge><Badge tone="yellow">Bench {matchdayBenchCount}</Badge>{currentGoalkeeper !== "Empty" ? <Badge>GK {currentGoalkeeper}</Badge> : null}</div></PageCard><PageCard><SectionHeader title={`Saved ${periodName} Plans`} subtitle="Load a saved rotation" /><div style={{ display: "grid", gap: 10 }}>{Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => { const plan = quarterPlans[q]; return <div key={q} style={{ borderRadius: 18, padding: 13, background: "rgba(15,23,42,0.74)", border: "1px solid rgba(125,211,252,0.18)", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><div><div style={{ color: "white", fontWeight: 1000 }}>{periodName} {q}</div><div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>{plan ? "Saved" : "No saved plan"}</div></div><div style={{ minWidth: 78 }}><SecondaryButton onClick={() => onLoadQuarter(q)}>Load</SecondaryButton></div></div> })}</div></PageCard></div>
}
