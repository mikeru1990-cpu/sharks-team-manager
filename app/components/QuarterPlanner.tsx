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

type PlayerMinuteRow = {
  player: Player
  minutes: number
  periodsOn: number[]
  periodsBenched: number[]
  consecutiveBench: boolean
}

function Stat({ label, value, colour = "#7dd3fc" }: { label: string; value: string | number; colour?: string }) {
  return <div style={{ borderRadius: 16, background: "rgba(2,6,23,0.46)", border: `1px solid ${colour}55`, padding: 11 }}><div style={{ fontSize: 10, fontWeight: 1000, letterSpacing: ".09em", color: "#94a3b8", textTransform: "uppercase" }}>{label}</div><div style={{ marginTop: 5, fontSize: 22, fontWeight: 1000, lineHeight: 1, color }}>{value}</div></div>
}

function chip(active: boolean) {
  return { border: active ? "1px solid rgba(125,211,252,0.75)" : "1px solid rgba(148,163,184,0.22)", background: active ? "rgba(14,165,233,0.22)" : "rgba(255,255,255,0.06)", color: active ? "#7dd3fc" : "#cbd5e1", borderRadius: 14, padding: "10px 12px", fontWeight: 1000 as const, fontSize: 13, minWidth: 58, cursor: "pointer" }
}

function getPlanPlayerIds(plan?: QuarterPlan) {
  if (!plan) return new Set<string>()
  return new Set(Object.values(plan.lineup || {}).filter(Boolean) as string[])
}

function getMinuteRows(players: Player[], quarterPlans: Record<number, QuarterPlan>, periodCount: number, periodLength: number): PlayerMinuteRow[] {
  return players.map((player) => {
    const periodsOn: number[] = []
    const periodsBenched: number[] = []
    for (let period = 1; period <= periodCount; period += 1) {
      const plannedIds = getPlanPlayerIds(quarterPlans[period])
      if (plannedIds.has(player.id)) periodsOn.push(period)
      else if (quarterPlans[period]) periodsBenched.push(period)
    }
    const consecutiveBench = periodsBenched.some((period, index) => index > 0 && period === periodsBenched[index - 1] + 1)
    return { player, minutes: periodsOn.length * periodLength, periodsOn, periodsBenched, consecutiveBench }
  })
}

function getTone(value: number, target: number) {
  if (target <= 0) return "#38bdf8"
  if (value < target - 8) return "#ef4444"
  if (value < target - 4) return "#f59e0b"
  return "#22c55e"
}

function findLockedGoalkeeper(players: Player[], currentSlots: PitchSlot[], lineupMap: Record<string, string | null>) {
  const gkSlot = currentSlots.find((slot) => slot.position === "GK")
  const currentGkId = lineupMap[gkSlot?.id || ""]
  return players.find((player) => player.id === currentGkId) || players.find((player) => player.mainGK) || players.find((player) => player.name.toLowerCase().includes("darcy-rae")) || null
}

function RotationHealth({ savedPeriods, fairnessScore, lowRows, benchRows, shortLabel, targetMinutes, warnings }: { savedPeriods: number; fairnessScore: number; lowRows: PlayerMinuteRow[]; benchRows: PlayerMinuteRow[]; shortLabel: string; targetMinutes: number; warnings: string[] }) {
  if (savedPeriods === 0) return <div style={{ borderRadius: 16, padding: 12, background: "rgba(14,165,233,0.12)", border: "1px solid rgba(56,189,248,0.32)", color: "#bae6fd", fontWeight: 900 }}>Auto-generate or save the rotation to see outfield minutes and fairness checks.</div>
  const tone = fairnessScore >= 85 ? "#22c55e" : fairnessScore >= 65 ? "#f59e0b" : "#ef4444"
  const label = fairnessScore >= 85 ? "Excellent" : fairnessScore >= 65 ? "Warning" : "Needs Work"
  const issueNames = [...lowRows.slice(0, 3).map((row) => `${row.player.name} below target (${row.minutes}m vs ${targetMinutes}m)`), ...benchRows.slice(0, 3).map((row) => `${row.player.name} benched ${row.periodsBenched.map((period) => `${shortLabel}${period}`).join(", ")}`)]
  return (
    <div style={{ borderRadius: 18, padding: 13, background: `${tone}16`, border: `1px solid ${tone}66`, display: "grid", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><div style={{ color: "white", fontWeight: 1000, fontSize: 18 }}>Rotation Health: {label}</div><Badge tone={fairnessScore >= 85 ? "green" : fairnessScore >= 65 ? "yellow" : "red"}>{fairnessScore}%</Badge></div>
      {issueNames.length === 0 && warnings.length === 0 ? <div style={{ color: "#bbf7d0", fontWeight: 850 }}>Outfield rotation looks strong. Fixed goalkeeper is excluded from fairness.</div> : <div style={{ display: "grid", gap: 6 }}>{issueNames.map((issue) => <div key={issue} style={{ color: tone === "#ef4444" ? "#fecdd3" : "#fde68a", fontWeight: 850 }}>• {issue}</div>)}{warnings.slice(0, 1).map((warning, index) => <div key={index} style={{ color: "#fde68a", fontWeight: 850 }}>• {warning}</div>)}</div>}
    </div>
  )
}

export default function QuarterPlanner({ isAdmin, currentQuarter, setCurrentQuarter, quarterPlans, quarterWarnings, currentSlots, players, lineupMap, benchIds, onSaveCurrentQuarter, onLoadQuarter, onAutoGenerate, periodMode, periodLength }: Props) {
  const [matchdaySize, setMatchdaySize] = useState(11)
  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"
  const shortLabel = periodMode === "quarters" ? "Q" : "H"
  const currentFilledCount = currentSlots.filter((slot) => lineupMap[slot.id]).length
  const outfieldSlotsPerPeriod = Math.max(0, currentSlots.filter((slot) => slot.position !== "GK").length)
  const lockedGoalkeeper = findLockedGoalkeeper(players, currentSlots, lineupMap)
  const currentGoalkeeper = lockedGoalkeeper?.name || "Empty"
  const effectiveMatchdaySize = Math.min(matchdaySize, players.length)
  const matchdayPlayers = useMemo(() => {
    if (!lockedGoalkeeper) return players.slice(0, effectiveMatchdaySize)
    const outfield = players.filter((player) => player.id !== lockedGoalkeeper.id)
    return [lockedGoalkeeper, ...outfield.slice(0, Math.max(0, effectiveMatchdaySize - 1))]
  }, [players, lockedGoalkeeper, effectiveMatchdaySize])
  const outfieldPlayers = lockedGoalkeeper ? matchdayPlayers.filter((player) => player.id !== lockedGoalkeeper.id) : matchdayPlayers
  const rows = getMinuteRows(outfieldPlayers, quarterPlans, periodCount, periodLength)
  const savedPeriods = Object.keys(quarterPlans).length
  const fixedGkMinutes = periodCount * periodLength
  const targetMinutes = outfieldPlayers.length ? Math.round((outfieldSlotsPerPeriod * periodCount * periodLength) / outfieldPlayers.length) : 0
  const lowMinuteRows = rows.filter((row) => targetMinutes > 0 && row.minutes < targetMinutes - 4)
  const severeRows = rows.filter((row) => targetMinutes > 0 && row.minutes < targetMinutes - 8)
  const consecutiveRows = rows.filter((row) => row.consecutiveBench && row.periodsBenched.length > 2)
  const fairnessScore = savedPeriods === 0 ? 0 : Math.max(0, Math.min(100, 100 - severeRows.length * 14 - consecutiveRows.length * 9 - quarterWarnings.length * 3))
  const sortedRows = [...rows].sort((a, b) => a.minutes - b.minutes || a.player.name.localeCompare(b.player.name))
  const selectedSizeOptions = [10, 11].filter((size) => size <= Math.max(11, players.length))

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <PageCard>
        <SectionHeader title="U11 Matchday Rotation Centre" subtitle="Fixed goalkeeper • 10/11 player squad • outfield fairness" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}>
          <Stat label="Squad" value={effectiveMatchdaySize} />
          <Stat label="Outfield Target" value={`${targetMinutes}m`} />
          <Stat label="Low mins" value={lowMinuteRows.length} colour={lowMinuteRows.length ? "#f59e0b" : "#22c55e"} />
          <Stat label="Bench runs" value={consecutiveRows.length} colour={consecutiveRows.length ? "#ef4444" : "#22c55e"} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}>{selectedSizeOptions.map((size) => <button key={size} onClick={() => setMatchdaySize(size)} style={chip(matchdaySize === size)}>{size} Players</button>)}</div>
        {lockedGoalkeeper ? <div style={{ borderRadius: 16, padding: 12, background: "rgba(250,204,21,0.12)", border: "1px solid rgba(250,204,21,0.36)", color: "#fde68a", fontWeight: 900, marginBottom: 12 }}>Goalkeeper locked: {lockedGoalkeeper.name} • {fixedGkMinutes}m • excluded from fairness checks</div> : null}
        <RotationHealth savedPeriods={savedPeriods} fairnessScore={fairnessScore} lowRows={severeRows} benchRows={consecutiveRows} shortLabel={shortLabel} targetMinutes={targetMinutes} warnings={quarterWarnings} />
      </PageCard>

      <PageCard>
        <SectionHeader title={`${periodName} Planner`} subtitle={`${periodCount} periods • ${periodLength} minutes`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}>
          <Stat label="Now" value={`${shortLabel}${currentQuarter}`} />
          <Stat label="On" value={currentFilledCount} />
          <Stat label="Bench" value={benchIds.length} />
          <Stat label="Length" value={`${periodLength}m`} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>{Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => <button key={q} onClick={() => setCurrentQuarter(q)} style={chip(currentQuarter === q)}>{shortLabel}{q}</button>)}</div>
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "repeat(3, minmax(0,1fr))" : "1fr", gap: 8 }}>{isAdmin ? <><PrimaryButton onClick={() => void onSaveCurrentQuarter()}>Save</PrimaryButton><SecondaryButton onClick={() => onLoadQuarter(currentQuarter)}>Load</SecondaryButton><SecondaryButton onClick={() => void onAutoGenerate()}>Development Balance</SecondaryButton></> : <div style={{ color: "#94a3b8" }}>Admin only.</div>}</div>
      </PageCard>

      <PageCard>
        <SectionHeader title="Projected Outfield Minutes" subtitle="Lowest minutes first. Goalkeeper is locked and shown separately." />
        <div style={{ display: "grid", gap: 8 }}>
          {sortedRows.map((row) => { const colour = getTone(row.minutes, targetMinutes); return <div key={row.player.id} style={{ borderRadius: 16, padding: 11, background: "rgba(15,23,42,0.72)", border: `1px solid ${colour}55`, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center" }}><div style={{ minWidth: 0 }}><div style={{ color: "white", fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.player.name}</div><div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850, marginTop: 2 }}>{row.periodsOn.length ? row.periodsOn.map((period) => `${shortLabel}${period}`).join(", ") : "No planned minutes"}</div></div><div style={{ color: colour, fontWeight: 1000, fontSize: 18 }}>{row.minutes}m</div></div> })}
          {lockedGoalkeeper ? <div style={{ borderRadius: 16, padding: 11, background: "rgba(250,204,21,0.12)", border: "1px solid rgba(250,204,21,0.44)", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center" }}><div><div style={{ color: "white", fontWeight: 1000 }}>{lockedGoalkeeper.name}</div><div style={{ color: "#fde68a", fontSize: 12, fontWeight: 850 }}>Locked goalkeeper • excluded from fairness</div></div><div style={{ color: "#facc15", fontWeight: 1000, fontSize: 18 }}>{fixedGkMinutes}m</div></div> : null}
        </div>
      </PageCard>

      <PageCard>
        <SectionHeader title={`Current ${periodName}`} subtitle="Quick snapshot" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><Badge tone="blue">{shortLabel}{currentQuarter}</Badge><Badge tone="green">Starters {currentFilledCount}</Badge><Badge tone="yellow">Bench {benchIds.length}</Badge>{currentGoalkeeper !== "Empty" ? <Badge>GK {currentGoalkeeper}</Badge> : null}</div>
      </PageCard>

      <PageCard>
        <SectionHeader title={`Saved ${periodName} Plans`} subtitle="Load a saved rotation" />
        <div style={{ display: "grid", gap: 10 }}>{Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => { const plan = quarterPlans[q]; return <div key={q} style={{ borderRadius: 18, padding: 13, background: "rgba(15,23,42,0.74)", border: "1px solid rgba(125,211,252,0.18)", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><div><div style={{ color: "white", fontWeight: 1000 }}>{periodName} {q}</div><div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>{plan ? "Saved" : "No saved plan"}</div></div><div style={{ minWidth: 78 }}><SecondaryButton onClick={() => onLoadQuarter(q)}>Load</SecondaryButton></div></div> })}</div>
      </PageCard>
    </div>
  )
}
