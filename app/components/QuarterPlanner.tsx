"use client"

import type { PitchSlot, Player, QuarterPlan } from "../lib/types"
import { THEME } from "../lib/theme"
import {
  Badge,
  PageCard,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "./ui"

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

function periodChipStyle(active: boolean) {
  return {
    border: active ? `1px solid ${THEME.colors.primary}` : "1px solid #cbd5e1",
    background: active ? "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)" : "white",
    color: active ? THEME.colors.primary : "#475569",
    borderRadius: 16,
    padding: "12px 14px",
    fontWeight: 800 as const,
    fontSize: 14,
    minWidth: 64,
    boxShadow: active ? "0 6px 14px rgba(30,58,138,0.10)" : "none",
  }
}

function MiniStat({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string | number
  tone?: "default" | "blue" | "green" | "yellow"
}) {
  const style =
    tone === "blue"
      ? {
          background: "#dbeafe",
          color: "#1d4ed8",
          border: "1px solid #bfdbfe",
        }
      : tone === "green"
      ? {
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #86efac",
        }
      : tone === "yellow"
      ? {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fcd34d",
        }
      : {
          background: "#f8fafc",
          color: "#334155",
          border: "1px solid #e2e8f0",
        }

  return (
    <div
      style={{
        ...style,
        borderRadius: 16,
        padding: 12,
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function SnapshotRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "110px minmax(0, 1fr)",
        gap: 10,
        alignItems: "start",
        padding: "10px 0",
        borderBottom: "1px solid #eef2f7",
      }}
    >
      <div style={{ fontWeight: 800, color: THEME.colors.textPrimary }}>{label}</div>
      <div style={{ color: THEME.colors.textSecondary }}>{value}</div>
    </div>
  )
}

function SavedPlanCard({
  title,
  plan,
  players,
  currentSlots,
  onLoad,
}: {
  title: string
  plan?: QuarterPlan
  players: Player[]
  currentSlots: PitchSlot[]
  onLoad: () => void
}) {
  const filledSlots = plan
    ? currentSlots.filter((slot) => plan.lineup[slot.id]).length
    : 0

  const goalkeeperName = plan
    ? players.find((p) => p.id === plan.lineup[currentSlots.find((s) => s.position === "GK")?.id || ""])?.name ||
      "Not set"
    : "Not set"

  const keyOutfield = plan
    ? currentSlots
        .filter((slot) => slot.position !== "GK")
        .map((slot) => ({
          label: slot.label,
          name: players.find((p) => p.id === plan.lineup[slot.id])?.name || "Empty",
        }))
        .slice(0, 3)
    : []

  return (
    <div
      style={{
        padding: 16,
        borderRadius: 18,
        background: "white",
        border: "1px solid #e2e8f0",
        boxShadow: "0 6px 16px rgba(15,23,42,0.04)",
        display: "grid",
        gap: 12,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 20, color: THEME.colors.textPrimary }}>
            {title}
          </div>
          <div style={{ color: THEME.colors.textSecondary, marginTop: 4, fontSize: 14 }}>
            {plan ? "Saved rotation plan ready to load." : "No saved plan yet."}
          </div>
        </div>

        <div style={{ minWidth: 100 }}>
          <SecondaryButton onClick={onLoad}>Load</SecondaryButton>
        </div>
      </div>

      {!plan ? (
        <div
          style={{
            borderRadius: 16,
            border: "1px dashed #cbd5e1",
            background: "#f8fafc",
            padding: 14,
            color: THEME.colors.textSecondary,
          }}
        >
          Save the current setup or auto-generate to create this plan.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 10,
            }}
          >
            <MiniStat label="Starters" value={filledSlots} tone="blue" />
            <MiniStat label="Bench" value={plan.bench.length} tone="yellow" />
            <MiniStat label="Goalkeeper" value={goalkeeperName === "Not set" ? "—" : "1"} tone="green" />
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Badge tone="blue">GK: {goalkeeperName}</Badge>
            {plan.bench.length > 0 ? (
              <Badge tone="yellow">Bench: {plan.bench.length}</Badge>
            ) : (
              <Badge>No bench</Badge>
            )}
          </div>

          <div
            style={{
              borderRadius: 16,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              padding: 14,
              display: "grid",
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 800, color: THEME.colors.textPrimary }}>
              Key positions
            </div>

            {keyOutfield.length === 0 ? (
              <div style={{ color: THEME.colors.textSecondary }}>No outfield players assigned.</div>
            ) : (
              keyOutfield.map((item) => (
                <div
                  key={`${title}-${item.label}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    color: THEME.colors.textSecondary,
                    fontSize: 14,
                  }}
                >
                  <span style={{ fontWeight: 700, color: THEME.colors.textPrimary }}>
                    {item.label}
                  </span>
                  <span style={{ textAlign: "right" }}>{item.name}</span>
                </div>
              ))
            )}
          </div>

          <div
            style={{
              color: THEME.colors.textSecondary,
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: THEME.colors.textPrimary }}>Bench players:</strong>{" "}
            {plan.bench.length === 0
              ? "None"
              : plan.bench
                  .map((id) => players.find((p) => p.id === id)?.name || "")
                  .filter(Boolean)
                  .join(", ")}
          </div>
        </>
      )}
    </div>
  )
}

export default function QuarterPlanner({
  isAdmin,
  currentQuarter,
  setCurrentQuarter,
  quarterPlans,
  quarterWarnings,
  currentSlots,
  players,
  lineupMap,
  benchIds,
  onSaveCurrentQuarter,
  onLoadQuarter,
  onAutoGenerate,
  periodMode,
  periodLength,
}: Props) {
  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"
  const shortLabel = periodMode === "quarters" ? "Q" : "H"

  const currentFilledCount = currentSlots.filter((slot) => lineupMap[slot.id]).length
  const currentGoalkeeper = players.find(
    (p) => p.id === lineupMap[currentSlots.find((slot) => slot.position === "GK")?.id || ""]
  )?.name

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard>
        <SectionHeader
          title={`${periodName} Planner Engine`}
          subtitle={`${periodCount} ${periodName.toLowerCase()}${periodCount > 1 ? "s" : ""} • ${periodLength} minutes each`}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <MiniStat label={`Current ${periodName}`} value={`${shortLabel}${currentQuarter}`} tone="blue" />
          <MiniStat label="Starters" value={currentFilledCount} tone="green" />
          <MiniStat label="Bench" value={benchIds.length} tone="yellow" />
          <MiniStat label="Length" value={`${periodLength}m`} />
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          {Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => (
            <button
              key={q}
              onClick={() => setCurrentQuarter(q)}
              style={periodChipStyle(currentQuarter === q)}
            >
              {shortLabel}
              {q}
            </button>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isAdmin ? "repeat(3, minmax(0,1fr))" : "1fr",
            gap: 10,
          }}
        >
          {isAdmin ? (
            <>
              <PrimaryButton onClick={() => void onSaveCurrentQuarter()}>
                Save {shortLabel}
                {currentQuarter}
              </PrimaryButton>

              <SecondaryButton onClick={() => onLoadQuarter(currentQuarter)}>
                Load {shortLabel}
                {currentQuarter}
              </SecondaryButton>

              <SecondaryButton onClick={() => void onAutoGenerate()}>
                Auto Generate
              </SecondaryButton>
            </>
          ) : (
            <div style={{ color: "#64748b" }}>Admin only.</div>
          )}
        </div>
      </PageCard>

      <PageCard tone="softBlue">
        <SectionHeader
          title="Goalkeeper Rules"
          subtitle={`${periodName} generation priority order`}
        />
        <div style={{ color: "#334155", lineHeight: 1.6 }}>
          Generation always tries <strong>Main GK</strong> first, then <strong>Backup GK</strong>,
          then any other goalkeeper-capable player.
        </div>
      </PageCard>

      {quarterWarnings.length > 0 ? (
        <PageCard tone="softYellow">
          <SectionHeader
            title={`${periodName} Warnings`}
            subtitle="Things to review before loading a plan"
          />
          <div style={{ display: "grid", gap: 8 }}>
            {quarterWarnings.map((warning, index) => (
              <div
                key={index}
                style={{
                  color: "#9a3412",
                  fontWeight: 700,
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.55)",
                  padding: 12,
                  border: "1px solid #fed7aa",
                }}
              >
                {warning}
              </div>
            ))}
          </div>
        </PageCard>
      ) : null}

      <PageCard>
        <SectionHeader
          title={`Current ${periodName} Snapshot`}
          subtitle="What is currently selected right now"
        />

        <div
          style={{
            borderRadius: 18,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            padding: 14,
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            <Badge tone="blue">
              {shortLabel}
              {currentQuarter}
            </Badge>
            <Badge tone="green">Starters: {currentFilledCount}</Badge>
            <Badge tone="yellow">Bench: {benchIds.length}</Badge>
            {currentGoalkeeper ? <Badge>GK: {currentGoalkeeper}</Badge> : null}
          </div>

          <div style={{ display: "grid", gap: 0 }}>
            {currentSlots.map((slot) => (
              <SnapshotRow
                key={slot.id}
                label={slot.label}
                value={players.find((p) => p.id === lineupMap[slot.id])?.name || "Empty"}
              />
            ))}
          </div>

          <div style={{ marginTop: 12, color: "#475569", lineHeight: 1.5 }}>
            <strong style={{ color: THEME.colors.textPrimary }}>Bench:</strong>{" "}
            {benchIds.map((id) => players.find((p) => p.id === id)?.name || "").filter(Boolean).join(", ") || "None"}
          </div>
        </div>
      </PageCard>

      <PageCard>
        <SectionHeader
          title={`Saved ${periodName} Plans`}
          subtitle={`Load a prepared ${periodName.toLowerCase()} in one tap`}
        />

        <div style={{ display: "grid", gap: 12 }}>
          {Array.from({ length: periodCount }, (_, i) => i + 1).map((q) => (
            <SavedPlanCard
              key={q}
              title={`${periodName} ${q}`}
              plan={quarterPlans[q]}
              players={players}
              currentSlots={currentSlots}
              onLoad={() => onLoadQuarter(q)}
            />
          ))}
        </div>
      </PageCard>
    </div>
  )
}
