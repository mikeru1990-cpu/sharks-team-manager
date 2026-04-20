"use client"

import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import type {
  MatchTab,
  MatchFormat,
  PitchSlot,
  Player,
  SavedLineup,
  TimelineItem,
} from "../lib/types"
import { TEAM, formatClock, formatMinutes, initials } from "../lib/types"
import { canPlaySlot } from "../lib/rotation"
import {
  Badge,
  PageCard,
  PrimaryButton,
  SectionHeader,
  SecondaryButton,
  DangerButton,
} from "./ui"
import { THEME } from "../lib/theme"

type PeriodMode = "quarters" | "halves"

type Props = {
  isAdmin: boolean
  matchTab: MatchTab
  setMatchTab: (tab: MatchTab) => void
  matchFormat: MatchFormat
  formation: string
  currentSlots: PitchSlot[]
  players: Player[]
  lineupMap: Record<string, string | null>
  benchIds: string[]
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  seconds: number
  running: boolean
  liveSecondsMap: Record<string, number>
  timeline: TimelineItem[]
  savedLineups: SavedLineup[]
  lineupName: string
  setLineupName: (value: string) => void
  activeDragPlayerId: string | null
  setActiveDragPlayerId: (id: string | null) => void
  setHomeTeam: (value: string) => Promise<void>
  setAwayTeam: (value: string) => Promise<void>
  setHomeScore: (value: number) => Promise<void>
  setAwayScore: (value: number) => Promise<void>
  setRunning: (value: boolean) => void
  resetClock: () => void
  saveMinutes: () => Promise<void>
  onChangeFormation: (format: MatchFormat, formation: string) => Promise<void>
  onSaveLineup: () => Promise<void>
  onLoadSavedLineup: (id: string) => Promise<void>
  onDeleteSavedLineup: (id: string) => Promise<void>
  onDragStartExternal: (event: DragStartEvent) => void
  onDragEndExternal: (event: DragEndEvent) => void
  onOpenCreateEvent: () => void
  onOpenEditEvent: (item: TimelineItem) => void
  onDeleteTimelineItem: (id: string) => Promise<void>
  onEndGame: () => Promise<void> | void
  trackingTitle: string
  periodMode: PeriodMode
  periodLength: number
  currentPeriod: number
  setCurrentPeriod: (value: number) => void
  setPeriodMode: (value: PeriodMode) => Promise<void>
  setPeriodLength: (value: number) => Promise<void>
}

function tabButtonStyle(active: boolean) {
  return {
    border: active ? `1px solid ${THEME.colors.primary}` : "1px solid #cbd5e1",
    background: active ? "linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)" : "white",
    color: active ? THEME.colors.primary : "#475569",
    borderRadius: 16,
    padding: "12px 10px",
    fontWeight: 800 as const,
    fontSize: 13,
    boxShadow: active ? "0 6px 14px rgba(30,58,138,0.10)" : "none",
    width: "100%",
    minWidth: 0,
    whiteSpace: "nowrap" as const,
    cursor: "pointer",
  }
}

function SummaryStat({
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
      ? { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" }
      : tone === "green"
      ? { background: "#dcfce7", color: "#166534", border: "1px solid #86efac" }
      : tone === "yellow"
      ? { background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d" }
      : { background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0" }

  return (
    <div
      style={{
        ...style,
        borderRadius: 18,
        padding: 14,
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, lineHeight: 1.05 }}>{value}</div>
    </div>
  )
}

function MiniScoreButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid #cbd5e1",
        background: "white",
        color: THEME.colors.textPrimary,
        borderRadius: 14,
        width: 60,
        height: 48,
        fontWeight: 900,
        fontSize: 17,
        cursor: "pointer",
        boxShadow: "0 4px 10px rgba(15,23,42,0.08)",
      }}
    >
      {children}
    </button>
  )
}

function TeamNameInput({
  value,
  align = "left",
  disabled,
  onChange,
}: {
  value: string
  align?: "left" | "right"
  disabled?: boolean
  onChange: (value: string) => void
}) {
  return (
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => void onChange(e.target.value)}
      style={{
        width: "100%",
        background: "transparent",
        color: "white",
        border: "none",
        borderBottom: "1px solid rgba(255,255,255,0.22)",
        fontSize: 16,
        fontWeight: 900,
        padding: "6px 0 8px",
        outline: "none",
        textAlign: align,
        minWidth: 0,
      }}
    />
  )
}

function ShirtMarker({
  player,
  compact = false,
}: {
  player: Player
  compact?: boolean
}) {
  return (
    <div
      style={{
        width: compact ? 42 : 54,
        height: compact ? 42 : 54,
        margin: "0 auto",
        position: "relative",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath:
            "polygon(18% 6%, 32% 6%, 39% 18%, 61% 18%, 68% 6%, 82% 6%, 94% 30%, 79% 38%, 79% 100%, 21% 100%, 21% 38%, 6% 30%)",
          background: `linear-gradient(180deg, ${TEAM.secondary} 0%, ${TEAM.primary} 100%)`,
          border: "2px solid rgba(255,255,255,0.75)",
          boxShadow: "0 6px 14px rgba(2,6,23,0.16)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          color: "white",
          fontSize: compact ? 10 : 11,
          fontWeight: 900,
          textShadow: "0 2px 4px rgba(0,0,0,0.25)",
        }}
      >
        {initials(player.name)}
      </div>
    </div>
  )
}

function PlayerBadges({ player }: { player: Player }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {player.mainGK ? <Badge tone="blue">Main GK</Badge> : null}
      {player.backupGK ? <Badge tone="blue">Backup GK</Badge> : null}
      {player.captain ? <Badge tone="yellow">Captain</Badge> : null}
      {player.viceCaptain ? <Badge tone="yellow">Vice-Captain</Badge> : null}
    </div>
  )
}

function parseDragId(value: string) {
  const parts = value.split("::")
  if (parts.length !== 4) return null
  return { playerId: parts[1], fromId: parts[3] }
}

function CompactPlayerRow({
  player,
  subtitle,
  accent = "#f8fafc",
}: {
  player: Player
  subtitle?: string
  accent?: string
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 18,
        padding: 12,
        background: accent,
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        gap: 10,
        alignItems: "center",
      }}
    >
      <ShirtMarker player={player} compact />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1.2 }}>{player.name}</div>
        <div style={{ color: "#64748b", marginTop: 4, fontSize: 12 }}>{player.positions.join("/")}</div>
        <div style={{ marginTop: 6 }}>
          <PlayerBadges player={player} />
        </div>
      </div>
      {subtitle ? (
        <div style={{ textAlign: "right", fontWeight: 800, fontSize: 12, color: "#475569" }}>
          {subtitle}
        </div>
      ) : null}
    </div>
  )
}

function DraggablePlayerCard({
  player,
  originId,
  compact = false,
  subtitle,
}: {
  player: Player
  originId: string
  compact?: boolean
  subtitle?: string
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `player::${player.id}::from::${originId}`,
  })

  const dragStyle = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    opacity: isDragging ? 0.55 : 1,
    touchAction: "none" as const,
    cursor: "grab",
  }

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={{
          ...dragStyle,
          width: "100%",
          maxWidth: 150,
          borderRadius: 18,
          background: "rgba(255,255,255,0.16)",
          padding: 8,
          textAlign: "center",
          color: "white",
        }}
      >
        <ShirtMarker player={player} compact />
        <div
          style={{
            marginTop: 6,
            fontWeight: 900,
            fontSize: 12,
            lineHeight: 1.2,
            overflowWrap: "anywhere",
          }}
        >
          {player.name}
        </div>
        <div style={{ marginTop: 4, fontSize: 10 }}>{player.positions.join("/")}</div>
        <div style={{ marginTop: 6 }}>
          <PlayerBadges player={player} />
        </div>
        {subtitle ? <div style={{ marginTop: 6, fontSize: 10 }}>{subtitle}</div> : null}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        ...dragStyle,
        border: "1px solid #e2e8f0",
        padding: 12,
        borderRadius: 18,
        background: "white",
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        gap: 10,
        alignItems: "center",
      }}
    >
      <ShirtMarker player={player} compact />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: 15, lineHeight: 1.2 }}>{player.name}</div>
        <div style={{ color: "#64748b", marginTop: 4, fontSize: 12 }}>{player.positions.join("/")}</div>
        <div style={{ marginTop: 6 }}>
          <PlayerBadges player={player} />
        </div>
      </div>
      {subtitle ? (
        <div style={{ color: "#64748b", fontSize: 12, textAlign: "right" }}>{subtitle}</div>
      ) : null}
    </div>
  )
}

function PitchDropSlot({
  slot,
  player,
  activePlayer,
  liveSeconds,
}: {
  slot: PitchSlot
  player?: Player
  activePlayer?: Player | null
  liveSeconds?: number
}) {
  const { isOver, setNodeRef } = useDroppable({ id: slot.id })
  const invalid = activePlayer ? !canPlaySlot(activePlayer, slot.position) : false

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 112,
        borderRadius: 18,
        border: isOver
          ? invalid
            ? "2px solid #ef4444"
            : "2px solid #93c5fd"
          : "1px solid rgba(255,255,255,0.22)",
        background: isOver
          ? invalid
            ? "rgba(239,68,68,0.22)"
            : "rgba(147,197,253,0.25)"
          : "rgba(255,255,255,0.10)",
        display: "grid",
        placeItems: "center",
        padding: 8,
      }}
    >
      {player ? (
        <DraggablePlayerCard
          player={player}
          originId={slot.id}
          compact
          subtitle={typeof liveSeconds === "number" ? `${formatMinutes(liveSeconds)}m` : undefined}
        />
      ) : (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.95)" }}>
          <div style={{ fontWeight: 900, fontSize: 11 }}>{slot.label}</div>
          <div style={{ marginTop: 4, fontSize: 11 }}>{slot.position}</div>
        </div>
      )}
    </div>
  )
}

function BenchDropZone({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: "bench" })

  return (
    <div
      ref={setNodeRef}
      style={{
        padding: 12,
        borderRadius: 18,
        border: isOver ? `2px solid ${TEAM.secondary}` : "1px solid #e2e8f0",
        background: isOver ? "#eff6ff" : "#fff7ed",
      }}
    >
      {children}
    </div>
  )
}

function TimelineBadge({ type }: { type: TimelineItem["type"] }) {
  if (type === "goal") return <Badge tone="green">Goal</Badge>
  if (type === "assist") return <Badge tone="blue">Assist</Badge>
  if (type === "injury") return <Badge tone="red">Injury</Badge>
  if (type === "sub") return <Badge tone="yellow">Sub</Badge>
  return <Badge tone="default">{type}</Badge>
}

export default function MatchCenter(props: Props) {
  const {
    isAdmin,
    matchTab,
    setMatchTab,
    matchFormat,
    formation,
    currentSlots,
    players,
    lineupMap,
    benchIds,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    seconds,
    running,
    liveSecondsMap,
    timeline,
    savedLineups,
    lineupName,
    setLineupName,
    activeDragPlayerId,
    setActiveDragPlayerId,
    setHomeTeam,
    setAwayTeam,
    setHomeScore,
    setAwayScore,
    setRunning,
    resetClock,
    saveMinutes,
    onChangeFormation,
    onSaveLineup,
    onLoadSavedLineup,
    onDeleteSavedLineup,
    onDragStartExternal,
    onDragEndExternal,
    onOpenCreateEvent,
    onOpenEditEvent,
    onDeleteTimelineItem,
    onEndGame,
    trackingTitle,
    periodMode,
    periodLength,
    currentPeriod,
    setCurrentPeriod,
    setPeriodMode,
    setPeriodLength,
  } = props

  const lineupPlayers = Object.values(lineupMap)
    .filter(Boolean)
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[]

  const benchPlayers = benchIds.map((id) => players.find((p) => p.id === id)).filter(Boolean) as Player[]

  const activeDragPlayer = players.find((p) => p.id === activeDragPlayerId) || null

  const pitchRows = [
    currentSlots.filter((s) => s.position === "FWD"),
    currentSlots.filter((s) => s.position === "MID"),
    currentSlots.filter((s) => s.position === "DEF"),
    currentSlots.filter((s) => s.position === "GK"),
  ]

  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodLabel = periodMode === "quarters" ? `Q${currentPeriod}` : `H${currentPeriod}`
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"
  const periodsTabLabel = periodMode === "quarters" ? "Quarters" : "Halves"

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard tone="blue">
        <div style={{ position: "relative", overflow: "hidden", borderRadius: 20 }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.14,
              backgroundImage: `
                repeating-linear-gradient(
                  135deg,
                  rgba(255,255,255,0.10) 0px,
                  rgba(255,255,255,0.10) 2px,
                  transparent 2px,
                  transparent 10px
                )
              `,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 16 }}>
            <div>
              <div style={{ color: "rgba(255,255,255,0.78)", fontWeight: 800, fontSize: 12 }}>
                MATCH CENTER
              </div>
              {trackingTitle ? (
                <div
                  style={{
                    marginTop: 8,
                    fontSize: 15,
                    fontWeight: 800,
                    color: "rgba(255,255,255,0.96)",
                    overflowWrap: "anywhere",
                  }}
                >
                  {trackingTitle}
                </div>
              ) : null}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
                gap: 12,
                alignItems: "end",
              }}
            >
              <TeamNameInput value={homeTeam} disabled={!isAdmin} onChange={setHomeTeam} />
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 900,
                  opacity: 0.82,
                  color: "white",
                  paddingBottom: 8,
                }}
              >
                VS
              </div>
              <TeamNameInput value={awayTeam} disabled={!isAdmin} onChange={setAwayTeam} align="right" />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
                gap: 14,
                alignItems: "center",
              }}
            >
              <div style={{ textAlign: "center", color: "white" }}>
                <div style={{ fontSize: 58, fontWeight: 900, lineHeight: 1 }}>{homeScore}</div>
                {isAdmin ? (
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <MiniScoreButton onClick={() => void setHomeScore(homeScore + 1)}>+1</MiniScoreButton>
                    <MiniScoreButton onClick={() => void setHomeScore(Math.max(0, homeScore - 1))}>-1</MiniScoreButton>
                  </div>
                ) : null}
              </div>

              <div style={{ textAlign: "center", color: "white", minWidth: 110 }}>
                <div style={{ fontSize: 14, fontWeight: 900, opacity: 0.9 }}>{periodLabel}</div>
                <div style={{ fontSize: 42, fontWeight: 900, lineHeight: 1.05 }}>{formatClock(seconds)}</div>
                <div style={{ fontSize: 13, opacity: 0.85, marginTop: 6 }}>
                  {periodLength} min {periodName.toLowerCase()}
                </div>
                <div style={{ marginTop: 8 }}>
                  <Badge tone={running ? "green" : "default"}>{running ? "Running" : "Paused"}</Badge>
                </div>
              </div>

              <div style={{ textAlign: "center", color: "white" }}>
                <div style={{ fontSize: 58, fontWeight: 900, lineHeight: 1 }}>{awayScore}</div>
                {isAdmin ? (
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                    <MiniScoreButton onClick={() => void setAwayScore(awayScore + 1)}>+1</MiniScoreButton>
                    <MiniScoreButton onClick={() => void setAwayScore(Math.max(0, awayScore - 1))}>-1</MiniScoreButton>
                  </div>
                ) : null}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              <SummaryStat label="Format" value={matchFormat} tone="blue" />
              <SummaryStat label="Formation" value={formation} />
              <SummaryStat label="On Pitch" value={lineupPlayers.length} tone="green" />
              <SummaryStat label="Bench" value={benchPlayers.length} tone="yellow" />
            </div>

            {isAdmin ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 10,
                }}
              >
                <PrimaryButton onClick={() => setRunning(true)}>Start</PrimaryButton>
                <SecondaryButton onClick={() => setRunning(false)}>Pause</SecondaryButton>
                <SecondaryButton onClick={resetClock}>Reset</SecondaryButton>
                <DangerButton onClick={() => void onEndGame()}>End Game</DangerButton>
              </div>
            ) : null}
          </div>
        </div>
      </PageCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 8,
        }}
      >
        {[
          ["overview", "Overview"],
          ["lineup", "Lineup"],
          ["live", "Live"],
          ["quarters", periodsTabLabel],
          ["stats", "Stats"],
        ].map(([value, label]) => (
          <button key={value} onClick={() => setMatchTab(value as MatchTab)} style={tabButtonStyle(matchTab === value)}>
            {label}
          </button>
        ))}
      </div>

      {matchTab === "overview" && (
        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader title="Quick Controls" subtitle="Control game structure and live timing." />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, marginBottom: 6, fontSize: 13 }}>Game Type</div>
                <select
                  value={periodMode}
                  disabled={!isAdmin}
                  onChange={(e) => void setPeriodMode(e.target.value as PeriodMode)}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid #cbd5e1",
                    fontSize: 15,
                    width: "100%",
                    background: "white",
                  }}
                >
                  <option value="quarters">4 Quarters</option>
                  <option value="halves">2 Halves</option>
                </select>
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 6, fontSize: 13 }}>
                  {periodMode === "quarters" ? "Quarter Length" : "Half Length"}
                </div>
                <input
                  type="number"
                  min={1}
                  value={periodLength}
                  disabled={!isAdmin}
                  onChange={(e) => void setPeriodLength(Math.max(1, Number(e.target.value) || 1))}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid #cbd5e1",
                    fontSize: 15,
                    width: "100%",
                    boxSizing: "border-box",
                    background: "white",
                  }}
                />
              </div>

              <div>
                <div style={{ fontWeight: 800, marginBottom: 6, fontSize: 13 }}>Current {periodName}</div>
                <select
                  value={currentPeriod}
                  disabled={!isAdmin}
                  onChange={(e) => setCurrentPeriod(Number(e.target.value))}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid #cbd5e1",
                    fontSize: 15,
                    width: "100%",
                    background: "white",
                  }}
                >
                  {Array.from({ length: periodCount }, (_, i) => i + 1).map((period) => (
                    <option key={period} value={period}>
                      {periodMode === "quarters" ? `Quarter ${period}` : `Half ${period}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 13 }}>Minutes</div>
                <PrimaryButton onClick={() => void saveMinutes()}>Save Minutes</PrimaryButton>
              </div>
            </div>
          </PageCard>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 16,
            }}
          >
            <PageCard>
              <SectionHeader title="Current Lineup" subtitle="Players currently on the pitch." />
              <div style={{ display: "grid", gap: 8 }}>
                {lineupPlayers.length === 0 ? (
                  <div style={{ color: "#64748b" }}>No lineup selected yet.</div>
                ) : (
                  lineupPlayers.map((player) => (
                    <CompactPlayerRow key={player.id} player={player} accent="#f8fafc" />
                  ))
                )}
              </div>
            </PageCard>

            <PageCard>
              <SectionHeader title="Bench" subtitle="Available substitutes." />
              <div style={{ display: "grid", gap: 8 }}>
                {benchPlayers.length === 0 ? (
                  <div style={{ color: "#64748b" }}>No players on the bench.</div>
                ) : (
                  benchPlayers.map((player) => (
                    <CompactPlayerRow key={player.id} player={player} accent="#fff7ed" />
                  ))
                )}
              </div>
            </PageCard>
          </div>
        </div>
      )}

      {matchTab === "lineup" && (
        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader title="Formation & Saved Lineups" subtitle="Set shape and save reusable match setups." />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
                marginBottom: 12,
              }}
            >
              <select
                value={matchFormat}
                disabled={!isAdmin}
                onChange={(e) => {
                  const nextFormat = e.target.value as MatchFormat
                  const nextFormation =
                    nextFormat === "7v7" ? "2-3-1" : nextFormat === "9v9" ? "3-3-2" : "4-3-3"
                  void onChangeFormation(nextFormat, nextFormation)
                }}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  fontSize: 15,
                  background: "white",
                }}
              >
                <option value="7v7">7v7</option>
                <option value="9v9">9v9</option>
                <option value="11v11">11v11</option>
              </select>

              <select
                value={formation}
                disabled={!isAdmin}
                onChange={(e) => void onChangeFormation(matchFormat, e.target.value)}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid #cbd5e1",
                  fontSize: 15,
                  background: "white",
                }}
              >
                {Object.keys(
                  matchFormat === "7v7"
                    ? { "2-3-1": true, "3-2-1": true }
                    : matchFormat === "9v9"
                    ? { "3-3-2": true, "3-4-1": true }
                    : { "4-3-3": true, "4-4-2": true, "3-5-2": true }
                ).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {isAdmin ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
                <input
                  value={lineupName}
                  onChange={(e) => setLineupName(e.target.value)}
                  placeholder="Save lineup name"
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    border: "1px solid #cbd5e1",
                    fontSize: 15,
                    background: "white",
                  }}
                />
                <div style={{ width: 110 }}>
                  <PrimaryButton onClick={() => void onSaveLineup()}>Save</PrimaryButton>
                </div>
              </div>
            ) : null}
          </PageCard>

          {savedLineups.length > 0 && (
            <PageCard>
              <SectionHeader title="Saved Lineups" subtitle="Quickly load a previous setup." />
              <div style={{ display: "grid", gap: 10 }}>
                {savedLineups.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) auto auto",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 900, fontSize: 14 }}>{item.name}</div>
                      <div style={{ color: "#64748b", marginTop: 4, fontSize: 12 }}>
                        {item.format} • {item.formation}
                      </div>
                    </div>
                    <button
                      onClick={() => void onLoadSavedLineup(item.id)}
                      style={{
                        border: "1px solid #bfdbfe",
                        background: "#eff6ff",
                        color: "#1d4ed8",
                        borderRadius: 12,
                        padding: "10px 12px",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      Load
                    </button>
                    {isAdmin ? (
                      <button
                        onClick={() => void onDeleteSavedLineup(item.id)}
                        style={{
                          border: "1px solid #fecaca",
                          background: "#fee2e2",
                          color: "#991b1b",
                          borderRadius: 12,
                          padding: "10px 12px",
                          fontWeight: 800,
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </PageCard>
          )}

          <PageCard>
            <SectionHeader title="Tactics Board" subtitle="Drag players between pitch and bench." />
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={(e) => {
                const parsed = parseDragId(String(e.active.id))
                setActiveDragPlayerId(parsed?.playerId || null)
                onDragStartExternal(e)
              }}
              onDragEnd={(e) => {
                setActiveDragPlayerId(null)
                onDragEndExternal(e)
              }}
            >
              <div
                style={{
                  borderRadius: 24,
                  color: "white",
                  position: "relative",
                  overflow: "hidden",
                  padding: 12,
                  background: "linear-gradient(180deg, #1d8a3f 0%, #157435 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  minHeight: 420,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 12,
                    border: "2px solid rgba(255,255,255,0.22)",
                    borderRadius: 22,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: 12,
                    bottom: 12,
                    width: 2,
                    background: "rgba(255,255,255,0.18)",
                    transform: "translateX(-50%)",
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 88,
                    height: 88,
                    borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.20)",
                    transform: "translate(-50%, -50%)",
                    pointerEvents: "none",
                  }}
                />

                <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 12 }}>
                  {pitchRows.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${Math.max(row.length, 1)}, minmax(0, 1fr))`,
                        gap: 10,
                        alignItems: "center",
                      }}
                    >
                      {row.map((slot) => {
                        const playerId = lineupMap[slot.id]
                        const player = players.find((p) => p.id === playerId)
                        return (
                          <PitchDropSlot
                            key={slot.id}
                            slot={slot}
                            player={player}
                            activePlayer={activeDragPlayer}
                            liveSeconds={playerId ? liveSecondsMap[playerId] || 0 : 0}
                          />
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <SectionHeader title="Bench" subtitle="Drag players onto the pitch when needed." />
                <BenchDropZone>
                  <div style={{ display: "grid", gap: 8 }}>
                    {benchPlayers.length === 0 ? (
                      <div style={{ color: "#64748b" }}>No players on the bench.</div>
                    ) : (
                      benchPlayers.map((player) => (
                        <DraggablePlayerCard
                          key={player.id}
                          player={player}
                          originId="bench"
                          subtitle={`${formatMinutes(liveSecondsMap[player.id] || 0)}m`}
                        />
                      ))
                    )}
                  </div>
                </BenchDropZone>
              </div>
            </DndContext>
          </PageCard>
        </div>
      )}

      {matchTab === "live" && (
        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader
              title="Match Timeline"
              subtitle="Live event feed for the current game."
              action={
                isAdmin ? (
                  <div style={{ minWidth: 140 }}>
                    <PrimaryButton onClick={onOpenCreateEvent}>Add Event</PrimaryButton>
                  </div>
                ) : null
              }
            />

            <div style={{ display: "grid", gap: 10 }}>
              {timeline.length === 0 ? (
                <div style={{ color: "#64748b" }}>No live events yet.</div>
              ) : (
                [...timeline]
                  .sort((a, b) => a.minute - b.minute || a.sortOrder - b.sortOrder)
                  .map((t) => (
                    <div
                      key={t.id}
                      style={{
                        padding: 14,
                        borderRadius: 16,
                        background: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        display: "grid",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 10,
                          flexWrap: "wrap",
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <Badge tone="default">{t.minute}'</Badge>
                          <TimelineBadge type={t.type} />
                        </div>

                        {isAdmin ? (
                          <div style={{ display: "flex", gap: 8 }}>
                            <button
                              onClick={() => onOpenEditEvent(t)}
                              style={{
                                border: "1px solid #cbd5e1",
                                background: "white",
                                color: "#334155",
                                borderRadius: 12,
                                padding: "8px 12px",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => void onDeleteTimelineItem(t.id)}
                              style={{
                                border: "1px solid #fecaca",
                                background: "#fee2e2",
                                color: "#991b1b",
                                borderRadius: 12,
                                padding: "8px 12px",
                                fontWeight: 800,
                                cursor: "pointer",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>

                      <div style={{ color: "#475569", fontSize: 14 }}>{t.text}</div>
                    </div>
                  ))
              )}
            </div>
          </PageCard>

          <PageCard>
            <SectionHeader title="Live Minutes" subtitle="Current game minutes against season totals." />
            <div style={{ display: "grid", gap: 8 }}>
              {players.map((player) => (
                <CompactPlayerRow
                  key={player.id}
                  player={player}
                  subtitle={`${formatMinutes(liveSecondsMap[player.id] || 0)}m live / ${formatMinutes(
                    player.seasonSeconds || 0
                  )}m season`}
                />
              ))}
            </div>
          </PageCard>
        </div>
      )}

      {matchTab === "quarters" && (
        <PageCard tone="softYellow">
          <SectionHeader
            title={periodMode === "quarters" ? "Quarter Summary" : "Half Summary"}
            subtitle={`Use the planner section below to save, load, and auto-generate ${
              periodMode === "quarters" ? "quarter" : "half"
            } plans.`}
          />
        </PageCard>
      )}

      {matchTab === "stats" && (
        <PageCard>
          <SectionHeader title="Match Stats" subtitle="Player minute totals for the active game." />
          <div style={{ display: "grid", gap: 8 }}>
            {players.map((player) => (
              <CompactPlayerRow
                key={player.id}
                player={player}
                subtitle={`Live ${formatMinutes(liveSecondsMap[player.id] || 0)}m • Season ${formatMinutes(
                  player.seasonSeconds || 0
                )}m`}
              />
            ))}
          </div>
        </PageCard>
      )}
    </div>
  )
}
