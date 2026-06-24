"use client"

import { useMemo, useState } from "react"
import type { PitchSlot, Player, QuarterPlan } from "../lib/types"
import { Badge, PageCard, PrimaryButton, SecondaryButton, SectionHeader } from "./ui"

type PeriodMode = "quarters" | "halves"
type GoalkeeperMode = "locked" | "rotation"

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
function getPlanPlayerIds(plan?: QuarterPlan) { if (!plan) return new Set<string>(); return new Set(Object.values(plan.lineup || {}).filter(Boolean) as string[]) }
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)) }
function findGoalkeeper(players: Player[], currentSlots: PitchSlot[], lineupMap: Record<string, string | null>) { const gkSlot = currentSlots.find((slot) => slot.position === "GK"); const currentGkId = lineupMap[gkSlot?.id || ""]; return players.find((player) => player.id === currentGkId) || players.find((player) => player.mainGK) || players.find((player) => normalise(player.name).includes("darcy-rae")) || null }
function getMinuteRows(players: Player[], quarterPlans: Record<number, QuarterPlan>, periodCount: number, periodLength: number): PlayerMinuteRow[] { return players.map((player) => { const periodsOn: number[] = []; const periodsBenched: number[] = []; for (let period = 1; period <= periodCount; period += 1) { const plannedIds = getPlanPlayerIds(quarterPlans[period]); if (plannedIds.has(player.id)) periodsOn.push(period); else if (quarterPlans[period]) periodsBenched.push(period) } const consecutiveBench = periodsBenched.some((period, index) => index > 0 && period === periodsBenched[index - 1] + 1); return { player, minutes: periodsOn.length * periodLength, periodsOn, periodsBenched, consecutiveBench } }) }
function gradeFrom(rows: PlayerMinuteRow[], warnings: string[]) { if (!rows.length) return "READY"; const minutes = rows.map((row) => row.minutes); const spread = Math.max(...minutes) - Math.min(...minutes); const benchRuns = rows.filter((row) => row.consecutiveBench).length; if (warnings.length || benchRuns || spread > 20) return "REVIEW"; if (spread > 10) return "CHECK"; return "READY" }
function gradeColour(grade: string) { if (grade === "READY") return "#22c55e"; if (grade === "CHECK") return "#f59e0b"; return "#ef4444" }
function Stat({ label, value, colour = "#7dd3fc" }: { label: string; value: string | number; colour?: string }) { return <div style={{ borderRadius: 16, background: "rgba(2,6,23,0.46)", border: `1px solid ${colour}44`, padding: 11 }}><div style={{ fontSize: 10, fontWeight: 1000, letterSpacing: ".09em", color: "#94a3b8", textTransform: "uppercase" }}>{label}</div><div style={{ marginTop: 5, fontSize: 22, fontWeight: 1000, lineHeight: 1, color: colour }}>{value}</div></div> }
function chip(active: boolean) { return { border: active ? "1px solid rgba(125,211,252,0.75)" : "1px solid rgba(148,163,184,0.22)", background: active ? "rgba(14,165,233,0.22)" : "rgba(255,255,255,0.06)", color: active ? "#7dd3fc" : "#cbd5e1", borderRadius: 14, padding: "10px 12px", fontWeight: 1000 as const, fontSize: 13, minWidth: 58, cursor: "pointer" }
}
function playerName(players: Player[], id?: string | null) { return players.find((player) => player.id === id)?.name || "Empty" }

export default function QuarterPlanner({ isAdmin, currentQuarter, setCurrentQuarter, quarterPlans, quarterWarnings, currentSlots, players, lineupMap, benchIds, onSaveCurrentQuarter, onLoadQuarter, onAutoGenerate, periodMode, periodLength }: Props) {
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [goalkeeperMode, setGoalkeeperMode] = useState<GoalkeeperMode>("locked")
  const [showAnalysis, setShowAnalysis] = useState(false)
  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"
  const shortLabel = periodMode === "quarters" ? "Q" : "H"
  const currentFilledCount = currentSlots.filter((slot) => lineupMap[slot.id]).length
  const detectedGoalkeeper = findGoalkeeper(players, currentSlots, lineupMap)
  const lockedGoalkeeper = goalkeeperMode === "locked" ? detectedGoalkeeper : null
  const minSquadSize = Math.max(1, currentSlots.length || currentFilledCount || 1)
  const maxSquadSize = Math.max(minSquadSize, players.length || minSquadSize)
  const detectedSize = clamp(currentFilledCount + benchIds.length, minSquadSize, maxSquadSize)
  const matchdaySize = clamp(selectedSize ?? detectedSize, minSquadSize, maxSquadSize)
  const squadSizeOptions = useMemo(() => Array.from({ length: maxSquadSize - minSquadSize + 1 }, (_, index) => minSquadSize + index), [minSquadSize, maxSquadSize])
  const matchdayPlayers = useMemo(() => { if (!lockedGoalkeeper) return players.slice(0, matchdaySize); const outfield = players.filter((player) => player.id !== lockedGoalkeeper.id); return [lockedGoalkeeper, ...outfield.slice(0, Math.max(0, matchdaySize - 1))] }, [players, lockedGoalkeeper, matchdaySize])
  const fairnessPlayers = lockedGoalkeeper ? matchdayPlayers.filter((player) => player.id !== lockedGoalkeeper.id) : matchdayPlayers
  const rows = getMinuteRows(fairnessPlayers, quarterPlans, periodCount, periodLength)
  const gkRows = lockedGoalkeeper ? getMinuteRows([lockedGoalkeeper], quarterPlans, periodCount, periodLength) : []
  const savedPeriods = Object.keys(quarterPlans).length
  const cleanWarnings = quarterWarnings.filter((warning) => !lockedGoalkeeper || !normalise(warning).includes(normalise(lockedGoalkeeper.name)))
  const minutes = rows.map((row) => row.minutes)
  const averageMinutes = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.minutes, 0) / rows.length) : 0
  const lowestMinutes = minutes.length ? Math.min(...minutes) : 0
  const highestMinutes = minutes.length ? Math.max(...minutes) : 0
  const spread = highestMinutes - lowestMinutes
  const benchRuns = rows.filter((row) => row.consecutiveBench).length
  const grade = savedPeriods === 0 ? "SETUP" : gradeFrom(rows, cleanWarnings)
  const tone = gradeColour(grade)
  const currentPlanIds = getPlanPlayerIds(quarterPlans[currentQuarter])
  const onPitch = currentSlots.map((slot) => ({ slot, name: playerName(players, lineupMap[slot.id] || (quarterPlans[currentQuarter]?.lineup || {})[slot.id]) }))
  const currentBench = matchdayPlayers.filter((player) => !currentPlanIds.has(player.id) && !Object.values(lineupMap).includes(player.id))

  return <div style={{ display: "grid", gap: 14 }}>
    <PageCard>
      <SectionHeader title="Matchday Rotation" subtitle="Clean matchday view with analysis tucked away." />
      <div style={{ borderRadius: 20, padding: 14, background: `${tone}16`, border: `1px solid ${tone}66`, display: "grid", gap: 10, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><div><div style={{ color: tone, fontSize: 11, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>Match Status</div><div style={{ color: "white", fontSize: 24, fontWeight: 1000, marginTop: 4 }}>{grade}</div></div><Badge tone={grade === "READY" ? "green" : grade === "CHECK" || grade === "SETUP" ? "yellow" : "red"}>{matchdaySize} players</Badge></div>
        <div style={{ color: "#cbd5e1", fontWeight: 850, fontSize: 13 }}>{grade === "READY" ? "Rotation looks match ready." : grade === "SETUP" ? "Save or auto-balance the quarters to check the plan." : "Plan needs a quick review before kick-off."}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}><Stat label="On Pitch" value={currentFilledCount} /><Stat label="Bench" value={Math.max(0, matchdaySize - currentFilledCount)} colour="#facc15" /><Stat label="Avg" value={`${averageMinutes}m`} colour="#22c55e" /><Stat label="Spread" value={`${spread}m`} colour={spread > 20 ? "#ef4444" : spread > 10 ? "#f59e0b" : "#22c55e"} /></div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>{squadSizeOptions.map((size) => <button key={size} onClick={() => setSelectedSize(size)} style={chip(matchdaySize === size)}>{size}</button>)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}><button onClick={() => setGoalkeeperMode("locked")} style={chip(goalkeeperMode === "locked")}>Fixed GK</button><button onClick={() => setGoalkeeperMode("rotation")} style={chip(goalkeeperMode === "rotation")}>Rotate GK</button></div>
      {detectedGoalkeeper ? <div style={{ borderRadius: 16, padding: 12, background: "rgba(250,204,21,0.12)", border: "1px solid rgba(250,204,21,0.36)", color: "#fde68a", fontWeight: 900, marginBottom: 12 }}>{goalkeeperMode === "locked" ? `Primary GK: ${detectedGoalkeeper.name} locked and excluded from fairness.` : `Rotating GK mode: ${detectedGoalkeeper.name} included if selected.`}</div> : null}
      <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "repeat(3, minmax(0,1fr))" : "1fr", gap: 8 }}>{isAdmin ? <><PrimaryButton onClick={() => void onAutoGenerate()}>Generate Match Plan</PrimaryButton><SecondaryButton onClick={() => void onSaveCurrentQuarter()}>Save {shortLabel}{currentQuarter}</SecondaryButton><SecondaryButton onClick={() => setShowAnalysis((value) => !value)}>{showAnalysis ? "Hide Analysis" : "View Analysis"}</SecondaryButton></> : <SecondaryButton onClick={() => setShowAnalysis((value) => !value)}>{showAnalysis ? "Hide Analysis" : "View Analysis"}</SecondaryButton>}</div>
    </PageCard>

    <PageCard>
      <SectionHeader title={`${periodName} Board`} subtitle="Tap a period and see only who is on and who is benched." />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>{Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => <button key={q} onClick={() => { setCurrentQuarter(q); onLoadQuarter(q) }} style={chip(currentQuarter === q)}>{shortLabel}{q}</button>)}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        <div style={{ borderRadius: 18, padding: 12, background: "rgba(34,197,94,0.10)", border: "1px solid rgba(34,197,94,0.28)", display: "grid", gap: 8 }}><div style={{ color: "#86efac", fontSize: 11, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase" }}>On Pitch</div>{onPitch.map(({ slot, name }) => <div key={slot.id} style={{ color: "white", fontWeight: 900 }}>{slot.label || slot.position}: {name}</div>)}</div>
        <div style={{ borderRadius: 18, padding: 12, background: "rgba(250,204,21,0.10)", border: "1px solid rgba(250,204,21,0.28)", display: "grid", gap: 8 }}><div style={{ color: "#fde68a", fontSize: 11, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase" }}>Bench</div>{currentBench.length ? currentBench.map((player) => <div key={player.id} style={{ color: "white", fontWeight: 900 }}>{player.name}</div>) : <div style={{ color: "#94a3b8", fontWeight: 850 }}>No bench players shown.</div>}</div>
      </div>
    </PageCard>

    {showAnalysis ? <PageCard><SectionHeader title="Rotation Analysis" subtitle="Full minutes breakdown for review, not the main matchday view." /><div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}><Stat label="Lowest" value={`${lowestMinutes}m`} colour={lowestMinutes && lowestMinutes < averageMinutes - 8 ? "#ef4444" : "#22c55e"} /><Stat label="Highest" value={`${highestMinutes}m`} /><Stat label="Bench Runs" value={benchRuns} colour={benchRuns ? "#ef4444" : "#22c55e"} /><Stat label="Warnings" value={cleanWarnings.length} colour={cleanWarnings.length ? "#f59e0b" : "#22c55e"} /></div><div style={{ display: "grid", gap: 8 }}>{[...rows].sort((a, b) => a.minutes - b.minutes || a.player.name.localeCompare(b.player.name)).map((row) => <div key={row.player.id} style={{ borderRadius: 16, padding: 11, background: "rgba(15,23,42,0.72)", border: "1px solid rgba(125,211,252,0.18)", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center" }}><div><div style={{ color: "white", fontWeight: 1000 }}>{row.player.name}</div><div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850 }}>{row.periodsOn.length ? row.periodsOn.map((period) => `${shortLabel}${period}`).join(", ") : "No planned minutes"}</div></div><div style={{ color: "#7dd3fc", fontWeight: 1000 }}>{row.minutes}m</div></div>)}{gkRows.map((row) => <div key={row.player.id} style={{ borderRadius: 16, padding: 11, background: "rgba(250,204,21,0.12)", border: "1px solid rgba(250,204,21,0.44)", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center" }}><div><div style={{ color: "white", fontWeight: 1000 }}>{row.player.name}</div><div style={{ color: "#fde68a", fontSize: 12, fontWeight: 850 }}>Fixed goalkeeper</div></div><div style={{ color: "#facc15", fontWeight: 1000 }}>{row.minutes || periodCount * periodLength}m</div></div>)}</div></PageCard> : null}
  </div>
}
