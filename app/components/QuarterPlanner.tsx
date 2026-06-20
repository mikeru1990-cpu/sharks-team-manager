"use client"

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

function playerName(players: Player[], id?: string | null) {
  return players.find((player) => player.id === id)?.name || "Empty"
}

function Stat({ label, value, colour = "#7dd3fc" }: { label: string; value: string | number; colour?: string }) {
  return (
    <div style={{ borderRadius: 16, background: "rgba(2,6,23,0.46)", border: `1px solid ${colour}55`, padding: 11 }}>
      <div style={{ fontSize: 10, fontWeight: 1000, letterSpacing: ".09em", color: "#94a3b8", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 5, fontSize: 22, fontWeight: 1000, lineHeight: 1, color: colour }}>{value}</div>
    </div>
  )
}

function chip(active: boolean) {
  return {
    border: active ? "1px solid rgba(125,211,252,0.75)" : "1px solid rgba(148,163,184,0.22)",
    background: active ? "rgba(14,165,233,0.22)" : "rgba(255,255,255,0.06)",
    color: active ? "#7dd3fc" : "#cbd5e1",
    borderRadius: 14,
    padding: "10px 12px",
    fontWeight: 1000 as const,
    fontSize: 13,
    minWidth: 58,
    cursor: "pointer",
  }
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

    return {
      player,
      minutes: periodsOn.length * periodLength,
      periodsOn,
      periodsBenched,
      consecutiveBench,
    }
  })
}

function getTone(value: number, average: number) {
  if (average <= 0) return "#38bdf8"
  if (value < average - 8) return "#ef4444"
  if (value < average - 4) return "#f59e0b"
  return "#22c55e"
}

function buildRecommendation(row: PlayerMinuteRow, shortLabel: string) {
  if (!row.periodsBenched.length) return "Rotation looks strong."
  const bestPeriod = row.periodsBenched[0]
  return `Consider moving ${row.player.name.split(" ")[0]} into ${shortLabel}${bestPeriod}.`
}

export default function QuarterPlanner({ isAdmin, currentQuarter, setCurrentQuarter, quarterPlans, quarterWarnings, currentSlots, players, lineupMap, benchIds, onSaveCurrentQuarter, onLoadQuarter, onAutoGenerate, periodMode, periodLength }: Props) {
  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"
  const shortLabel = periodMode === "quarters" ? "Q" : "H"
  const currentFilledCount = currentSlots.filter((slot) => lineupMap[slot.id]).length
  const gkSlot = currentSlots.find((slot) => slot.position === "GK")
  const currentGoalkeeper = playerName(players, lineupMap[gkSlot?.id || ""])
  const rows = getMinuteRows(players, quarterPlans, periodCount, periodLength)
  const savedPeriods = Object.keys(quarterPlans).length
  const totalMinutes = rows.reduce((sum, row) => sum + row.minutes, 0)
  const averageMinutes = rows.length ? Math.round(totalMinutes / rows.length) : 0
  const lowMinuteRows = rows.filter((row) => averageMinutes > 0 && row.minutes < averageMinutes - 4)
  const severeRows = rows.filter((row) => averageMinutes > 0 && row.minutes < averageMinutes - 8)
  const consecutiveRows = rows.filter((row) => row.consecutiveBench)
  const fairnessIssues = severeRows.length + consecutiveRows.length + quarterWarnings.length
  const fairnessScore = savedPeriods === 0 ? 0 : Math.max(0, Math.min(100, 100 - severeRows.length * 14 - consecutiveRows.length * 9 - quarterWarnings.length * 6))
  const sortedRows = [...rows].sort((a, b) => a.minutes - b.minutes || a.player.name.localeCompare(b.player.name))

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <PageCard>
        <SectionHeader title={`${periodName} Intelligence`} subtitle={`${periodCount} periods • ${periodLength} minutes • fairness view`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}>
          <Stat label="Fairness" value={savedPeriods ? `${fairnessScore}%` : "Plan"} colour={fairnessScore >= 85 ? "#22c55e" : fairnessScore >= 65 ? "#f59e0b" : "#ef4444"} />
          <Stat label="Average" value={`${averageMinutes}m`} />
          <Stat label="Low mins" value={lowMinuteRows.length} colour={lowMinuteRows.length ? "#f59e0b" : "#22c55e"} />
          <Stat label="Bench runs" value={consecutiveRows.length} colour={consecutiveRows.length ? "#ef4444" : "#22c55e"} />
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {savedPeriods === 0 ? (
            <div style={{ borderRadius: 16, padding: 12, background: "rgba(14,165,233,0.12)", border: "1px solid rgba(56,189,248,0.32)", color: "#bae6fd", fontWeight: 900 }}>
              Auto-generate the rotation to see minutes, bench runs and fairness checks.
            </div>
          ) : fairnessIssues === 0 ? (
            <div style={{ borderRadius: 16, padding: 12, background: "rgba(34,197,94,0.13)", border: "1px solid rgba(34,197,94,0.38)", color: "#bbf7d0", fontWeight: 900 }}>
              Balanced rotation: minutes and benching look fair.
            </div>
          ) : null}

          {severeRows.slice(0, 3).map((row) => (
            <div key={row.player.id} style={{ borderRadius: 16, padding: 12, background: "rgba(239,68,68,0.14)", border: "1px solid rgba(248,113,113,0.44)", color: "#fecdd3", display: "grid", gap: 5 }}>
              <div style={{ color: "white", fontWeight: 1000 }}>Severe minutes gap: {row.player.name}</div>
              <div style={{ fontSize: 13, fontWeight: 850 }}>Projected: {row.minutes}m • Team average: {averageMinutes}m</div>
              <div style={{ fontSize: 13, fontWeight: 900 }}>{buildRecommendation(row, shortLabel)}</div>
            </div>
          ))}

          {consecutiveRows.slice(0, 3).map((row) => (
            <div key={`bench-${row.player.id}`} style={{ borderRadius: 16, padding: 12, background: "rgba(245,158,11,0.14)", border: "1px solid rgba(251,191,36,0.44)", color: "#fde68a", display: "grid", gap: 5 }}>
              <div style={{ color: "white", fontWeight: 1000 }}>Consecutive bench: {row.player.name}</div>
              <div style={{ fontSize: 13, fontWeight: 850 }}>Benched: {row.periodsBenched.map((period) => `${shortLabel}${period}`).join(", ")}</div>
              <div style={{ fontSize: 13, fontWeight: 900 }}>{buildRecommendation(row, shortLabel)}</div>
            </div>
          ))}
        </div>
      </PageCard>

      <PageCard>
        <SectionHeader title={`${periodName} Planner`} subtitle={`${periodCount} periods • ${periodLength} minutes`} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8, marginBottom: 12 }}>
          <Stat label="Now" value={`${shortLabel}${currentQuarter}`} />
          <Stat label="On" value={currentFilledCount} />
          <Stat label="Bench" value={benchIds.length} />
          <Stat label="Length" value={`${periodLength}m`} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => <button key={q} onClick={() => setCurrentQuarter(q)} style={chip(currentQuarter === q)}>{shortLabel}{q}</button>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "repeat(3, minmax(0,1fr))" : "1fr", gap: 8 }}>
          {isAdmin ? <><PrimaryButton onClick={() => void onSaveCurrentQuarter()}>Save</PrimaryButton><SecondaryButton onClick={() => onLoadQuarter(currentQuarter)}>Load</SecondaryButton><SecondaryButton onClick={() => void onAutoGenerate()}>Auto Balance</SecondaryButton></> : <div style={{ color: "#94a3b8" }}>Admin only.</div>}
        </div>
      </PageCard>

      {quarterWarnings.length > 0 ? (
        <PageCard tone="softYellow">
          <SectionHeader title={`${quarterWarnings.length} Rotation Checks`} subtitle="Extra checks from the rotation builder" />
          <div style={{ display: "grid", gap: 8 }}>
            {quarterWarnings.slice(0, 4).map((warning, index) => <div key={index} style={{ color: "#fdba74", fontWeight: 1000, borderRadius: 14, background: "rgba(154,52,18,0.18)", padding: 12, border: "1px solid rgba(251,146,60,0.42)" }}>{warning}</div>)}
          </div>
        </PageCard>
      ) : null}

      <PageCard>
        <SectionHeader title="Projected Minutes" subtitle="Lowest minutes shown first" />
        <div style={{ display: "grid", gap: 8 }}>
          {sortedRows.map((row) => {
            const colour = getTone(row.minutes, averageMinutes)
            return (
              <div key={row.player.id} style={{ borderRadius: 16, padding: 11, background: "rgba(15,23,42,0.72)", border: `1px solid ${colour}55`, display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 10, alignItems: "center" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ color: "white", fontWeight: 1000, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.player.name}</div>
                  <div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 850, marginTop: 2 }}>{row.periodsOn.length ? row.periodsOn.map((period) => `${shortLabel}${period}`).join(", ") : "No planned minutes"}</div>
                </div>
                <div style={{ color: colour, fontWeight: 1000, fontSize: 18 }}>{row.minutes}m</div>
              </div>
            )
          })}
        </div>
      </PageCard>

      <PageCard>
        <SectionHeader title={`Current ${periodName}`} subtitle="Quick snapshot" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Badge tone="blue">{shortLabel}{currentQuarter}</Badge>
          <Badge tone="green">Starters {currentFilledCount}</Badge>
          <Badge tone="yellow">Bench {benchIds.length}</Badge>
          {currentGoalkeeper !== "Empty" ? <Badge>GK {currentGoalkeeper}</Badge> : null}
        </div>
      </PageCard>

      <PageCard>
        <SectionHeader title={`Saved ${periodName} Plans`} subtitle="Load a saved rotation" />
        <div style={{ display: "grid", gap: 10 }}>{Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => {
          const plan = quarterPlans[q]
          return <div key={q} style={{ borderRadius: 18, padding: 13, background: "rgba(15,23,42,0.74)", border: "1px solid rgba(125,211,252,0.18)", display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}><div><div style={{ color: "white", fontWeight: 1000 }}>{periodName} {q}</div><div style={{ color: "#94a3b8", fontSize: 12, fontWeight: 800 }}>{plan ? "Saved" : "No saved plan"}</div></div><div style={{ minWidth: 78 }}><SecondaryButton onClick={() => onLoadQuarter(q)}>Load</SecondaryButton></div></div>
        })}</div>
      </PageCard>
    </div>
  )
}
