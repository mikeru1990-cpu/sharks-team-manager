"use client"

import {
  DndContext,
  closestCenter,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import type { MatchFormat, MatchTab, PitchSlot, Player, TimelineItem } from "../lib/types"
import { formatClock, formatMinutes, initials } from "../lib/types"
import { canPlaySlot } from "../lib/rotation"
import { Badge, PageCard, PrimaryButton, SecondaryButton, DangerButton, SectionHeader } from "./ui"

type PeriodMode = "quarters" | "halves"
type Props = any

function parseDragId(value: string) {
  const parts = value.split("::")
  if (parts.length !== 4) return null
  return { playerId: parts[1], fromId: parts[3] }
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: active ? "1px solid rgba(125,211,252,0.65)" : "1px solid rgba(148,163,184,0.18)",
        background: active
          ? "linear-gradient(135deg, #1d4ed8 0%, #0284c7 60%, #0f172a 100%)"
          : "rgba(255,255,255,0.045)",
        color: active ? "white" : "#cbd5e1",
        borderRadius: 20,
        padding: "13px 10px",
        fontWeight: 1000,
        fontSize: 13,
        cursor: "pointer",
        boxShadow: active ? "0 14px 34px rgba(37,99,235,0.34)" : "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {children}
    </button>
  )
}

function TeamInput({ value, align, disabled, onChange }: { value: string; align?: "left" | "right"; disabled?: boolean; onChange: (value: string) => void }) {
  return (
    <input
      value={value}
      disabled={disabled}
      onChange={(e) => void onChange(e.target.value)}
      style={{
        width: "100%",
        border: "none",
        borderBottom: "1px solid rgba(255,255,255,0.22)",
        background: "transparent",
        color: "white",
        outline: "none",
        fontSize: 16,
        fontWeight: 1000,
        padding: "8px 0",
        textAlign: align || "left",
      }}
    />
  )
}

function MiniScoreButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 58,
        height: 46,
        borderRadius: 16,
        border: "1px solid rgba(125,211,252,0.30)",
        background: "linear-gradient(135deg, rgba(255,255,255,0.14), rgba(15,23,42,0.65))",
        color: "white",
        fontWeight: 1000,
        cursor: "pointer",
        boxShadow: "0 12px 24px rgba(2,6,23,0.24)",
      }}
    >
      {children}
    </button>
  )
}

function PlayerToken({ player, compact = false }: { player: Player; compact?: boolean }) {
  return (
    <div
      className="sharks-player-token"
      style={{
        width: compact ? 42 : 54,
        height: compact ? 42 : 54,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        margin: "0 auto",
        color: "white",
        fontWeight: 1000,
        fontSize: compact ? 11 : 13,
        textShadow: "0 2px 6px rgba(0,0,0,0.34)",
        position: "relative",
      }}
    >
      {initials(player.name)}
      {player.captain ? (
        <div
          style={{
            position: "absolute",
            right: -4,
            top: -5,
            width: 18,
            height: 18,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "#facc15",
            color: "#0f172a",
            fontSize: 10,
            fontWeight: 1000,
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          C
        </div>
      ) : null}
      {player.mainGK || player.backupGK || player.positions.includes("GK") ? (
        <div
          style={{
            position: "absolute",
            left: -4,
            bottom: -5,
            padding: "2px 5px",
            borderRadius: 999,
            background: "rgba(34,197,94,0.95)",
            color: "white",
            fontSize: 8,
            fontWeight: 1000,
            border: "1px solid rgba(255,255,255,0.7)",
          }}
        >
          GK
        </div>
      ) : null}
    </div>
  )
}

function PlayerBadges({ player }: { player: Player }) {
  return (
    <div style={{ display: "flex", gap: 5, justifyContent: "center", flexWrap: "wrap" }}>
      {player.mainGK ? <Badge tone="green">Main GK</Badge> : null}
      {player.backupGK ? <Badge tone="blue">Backup GK</Badge> : null}
      {player.captain ? <Badge tone="yellow">Captain</Badge> : null}
      {player.viceCaptain ? <Badge tone="yellow">Vice</Badge> : null}
    </div>
  )
}

function DraggablePlayer({ player, originId, compact = false, subtitle }: { player: Player; originId: string; compact?: boolean; subtitle?: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `player::${player.id}::from::${originId}` })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        opacity: isDragging ? 0.55 : 1,
        touchAction: "none",
        cursor: "grab",
        borderRadius: compact ? 18 : 22,
        padding: compact ? 8 : 12,
        background: compact ? "rgba(255,255,255,0.13)" : "rgba(15,23,42,0.76)",
        border: "1px solid rgba(148,163,184,0.18)",
        color: "white",
        textAlign: "center",
        boxShadow: "0 12px 30px rgba(2,6,23,0.28)",
      }}
    >
      <PlayerToken player={player} compact={compact} />
      <div style={{ marginTop: 8, fontSize: compact ? 11 : 14, fontWeight: 1000, lineHeight: 1.15, overflowWrap: "anywhere" }}>{player.name}</div>
      <div style={{ marginTop: 4, color: "#aebed4", fontSize: compact ? 9 : 11, fontWeight: 800 }}>{player.positions.join("/")}</div>
      {subtitle ? <div style={{ marginTop: 5, color: "#7dd3fc", fontSize: 10, fontWeight: 900 }}>{subtitle}</div> : null}
      {!compact ? <div style={{ marginTop: 8 }}><PlayerBadges player={player} /></div> : null}
    </div>
  )
}

function PitchSlotDrop({ slot, player, activePlayer, liveSeconds }: { slot: PitchSlot; player?: Player; activePlayer?: Player | null; liveSeconds?: number }) {
  const { isOver, setNodeRef } = useDroppable({ id: slot.id })
  const invalid = activePlayer ? !canPlaySlot(activePlayer, slot.position) : false

  return (
    <div
      ref={setNodeRef}
      style={{
        minHeight: 112,
        borderRadius: 22,
        border: isOver
          ? invalid
            ? "2px solid #ef4444"
            : "2px solid #7dd3fc"
          : "1px solid rgba(255,255,255,0.20)",
        background: isOver
          ? invalid
            ? "rgba(239,68,68,0.22)"
            : "rgba(125,211,252,0.22)"
          : "rgba(2,6,23,0.22)",
        display: "grid",
        placeItems: "center",
        padding: 8,
        boxShadow: player ? "0 14px 34px rgba(2,6,23,0.28)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {player ? (
        <DraggablePlayer player={player} originId={slot.id} compact subtitle={typeof liveSeconds === "number" ? `${formatMinutes(liveSeconds)}m` : undefined} />
      ) : (
        <div style={{ textAlign: "center", color: "rgba(255,255,255,0.85)" }}>
          <div style={{ fontWeight: 1000, fontSize: 12 }}>{slot.label}</div>
          <div style={{ marginTop: 4, fontSize: 11, color: "#7dd3fc", fontWeight: 900 }}>{slot.position}</div>
        </div>
      )}
    </div>
  )
}

function BenchDrop({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: "bench" })
  return (
    <div
      ref={setNodeRef}
      className="sharks-elite-panel"
      style={{
        padding: 14,
        border: isOver ? "2px solid #7dd3fc" : "1px solid rgba(148,163,184,0.18)",
        background: isOver ? "rgba(14,165,233,0.18)" : undefined,
      }}
    >
      {children}
    </div>
  )
}

function PlayerRow({ player, subtitle }: { player: Player; subtitle?: string }) {
  return (
    <div
      style={{
        borderRadius: 20,
        padding: 12,
        background: "rgba(15,23,42,0.66)",
        border: "1px solid rgba(148,163,184,0.18)",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 12,
        alignItems: "center",
      }}
    >
      <PlayerToken player={player} compact />
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "white", fontWeight: 1000, fontSize: 14 }}>{player.name}</div>
        <div style={{ color: "#aebed4", fontWeight: 700, fontSize: 12, marginTop: 3 }}>{player.positions.join("/")}</div>
      </div>
      {subtitle ? <div style={{ color: "#7dd3fc", fontSize: 12, fontWeight: 900, textAlign: "right" }}>{subtitle}</div> : null}
    </div>
  )
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

  const lineupPlayers = Object.values(lineupMap || {}).filter(Boolean).map((id) => players.find((p: Player) => p.id === id)).filter(Boolean) as Player[]
  const benchPlayers = (benchIds || []).map((id: string) => players.find((p: Player) => p.id === id)).filter(Boolean) as Player[]
  const activeDragPlayer = players.find((p: Player) => p.id === activeDragPlayerId) || null
  const pitchRows = [
    currentSlots.filter((s: PitchSlot) => s.position === "FWD"),
    currentSlots.filter((s: PitchSlot) => s.position === "MID"),
    currentSlots.filter((s: PitchSlot) => s.position === "DEF"),
    currentSlots.filter((s: PitchSlot) => s.position === "GK"),
  ]
  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"
  const periodLabel = periodMode === "quarters" ? `Q${currentPeriod}` : `H${currentPeriod}`
  const periodsTabLabel = periodMode === "quarters" ? "Quarters" : "Halves"

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div className="sharks-elite-panel sharks-card-shine" style={{ padding: 18, position: "relative", overflow: "hidden" }}>
        <div className="sharks-hero-watermark" />
        <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <div>
              <div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".16em" }}>MATCHDAY COMMAND</div>
              {trackingTitle ? <div style={{ color: "white", fontSize: 16, fontWeight: 900, marginTop: 6 }}>{trackingTitle}</div> : null}
            </div>
            <Badge tone={running ? "green" : "default"}>{running ? "LIVE" : "PAUSED"}</Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)", gap: 12, alignItems: "end" }}>
            <TeamInput value={homeTeam} disabled={!isAdmin} onChange={setHomeTeam} />
            <div style={{ color: "#7dd3fc", fontWeight: 1000, paddingBottom: 8 }}>VS</div>
            <TeamInput value={awayTeam} disabled={!isAdmin} align="right" onChange={setAwayTeam} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)", gap: 14, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ color: "white", fontSize: 62, fontWeight: 1000, lineHeight: 1 }}>{homeScore}</div>
              {isAdmin ? <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}><MiniScoreButton onClick={() => void setHomeScore(homeScore + 1)}>+1</MiniScoreButton><MiniScoreButton onClick={() => void setHomeScore(Math.max(0, homeScore - 1))}>-1</MiniScoreButton></div> : null}
            </div>

            <div style={{ textAlign: "center", minWidth: 124 }}>
              <div style={{ color: "#7dd3fc", fontSize: 14, fontWeight: 1000 }}>{periodLabel}</div>
              <div style={{ color: "white", fontSize: 44, fontWeight: 1000, lineHeight: 1.05 }}>{formatClock(seconds)}</div>
              <div style={{ color: "#cbd5e1", fontWeight: 700, fontSize: 12, marginTop: 6 }}>{periodLength} min {periodName.toLowerCase()}</div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{ color: "white", fontSize: 62, fontWeight: 1000, lineHeight: 1 }}>{awayScore}</div>
              {isAdmin ? <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 10 }}><MiniScoreButton onClick={() => void setAwayScore(awayScore + 1)}>+1</MiniScoreButton><MiniScoreButton onClick={() => void setAwayScore(Math.max(0, awayScore - 1))}>-1</MiniScoreButton></div> : null}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
            {[['Format', matchFormat], ['Formation', formation], ['On Pitch', lineupPlayers.length], ['Bench', benchPlayers.length]].map(([label, value]) => (
              <div key={String(label)} style={{ borderRadius: 18, padding: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(148,163,184,0.15)" }}>
                <div style={{ color: "#aebed4", fontSize: 11, fontWeight: 900, letterSpacing: ".08em" }}>{label}</div>
                <div style={{ color: "white", fontSize: 24, fontWeight: 1000, marginTop: 4 }}>{String(value)}</div>
              </div>
            ))}
          </div>

          {isAdmin ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 10 }}>
              <PrimaryButton onClick={() => setRunning(true)}>Start</PrimaryButton>
              <SecondaryButton onClick={() => setRunning(false)}>Pause</SecondaryButton>
              <SecondaryButton onClick={resetClock}>Reset</SecondaryButton>
              <DangerButton onClick={() => void onEndGame()}>End</DangerButton>
            </div>
          ) : null}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 8 }}>
        {[["overview", "Overview"], ["lineup", "Lineup"], ["live", "Live"], ["quarters", periodsTabLabel], ["stats", "Stats"]].map(([value, label]) => (
          <TabButton key={value} active={matchTab === value} onClick={() => setMatchTab(value as MatchTab)}>{label}</TabButton>
        ))}
      </div>

      {matchTab === "overview" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader title="Quick Controls" subtitle="Control the period structure and save live minutes." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
              <select value={periodMode} disabled={!isAdmin} onChange={(e) => void setPeriodMode(e.target.value as PeriodMode)} style={{ padding: 13, borderRadius: 16, background: "rgba(2,6,23,0.58)", color: "white", border: "1px solid rgba(148,163,184,0.22)" }}><option value="quarters">4 Quarters</option><option value="halves">2 Halves</option></select>
              <input type="number" min={1} value={periodLength} disabled={!isAdmin} onChange={(e) => void setPeriodLength(Math.max(1, Number(e.target.value) || 1))} style={{ padding: 13, borderRadius: 16, background: "rgba(2,6,23,0.58)", color: "white", border: "1px solid rgba(148,163,184,0.22)" }} />
              <select value={currentPeriod} disabled={!isAdmin} onChange={(e) => setCurrentPeriod(Number(e.target.value))} style={{ padding: 13, borderRadius: 16, background: "rgba(2,6,23,0.58)", color: "white", border: "1px solid rgba(148,163,184,0.22)" }}>{Array.from({ length: periodCount }, (_, i) => i + 1).map((period) => <option key={period} value={period}>{periodName} {period}</option>)}</select>
              <PrimaryButton onClick={() => void saveMinutes()}>Save Minutes</PrimaryButton>
            </div>
          </PageCard>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            <PageCard><SectionHeader title="Current Lineup" subtitle="Players currently on the pitch." /> <div style={{ display: "grid", gap: 8 }}>{lineupPlayers.length ? lineupPlayers.map((p) => <PlayerRow key={p.id} player={p} />) : <div style={{ color: "#aebed4" }}>No lineup selected yet.</div>}</div></PageCard>
            <PageCard><SectionHeader title="Bench" subtitle="Available substitutes." /> <div style={{ display: "grid", gap: 8 }}>{benchPlayers.length ? benchPlayers.map((p) => <PlayerRow key={p.id} player={p} />) : <div style={{ color: "#aebed4" }}>No players on the bench.</div>}</div></PageCard>
          </div>
        </div>
      ) : null}

      {matchTab === "lineup" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader title="Formation & Saved Lineups" subtitle="Set shape, save setups and drag players between pitch and bench." />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 12 }}>
              <select value={matchFormat} disabled={!isAdmin} onChange={(e) => { const nextFormat = e.target.value as MatchFormat; const nextFormation = nextFormat === "7v7" ? "2-3-1" : nextFormat === "9v9" ? "3-3-2" : "4-3-3"; void onChangeFormation(nextFormat, nextFormation) }} style={{ padding: 13, borderRadius: 16, background: "rgba(2,6,23,0.58)", color: "white", border: "1px solid rgba(148,163,184,0.22)" }}><option value="7v7">7v7</option><option value="9v9">9v9</option><option value="11v11">11v11</option></select>
              <select value={formation} disabled={!isAdmin} onChange={(e) => void onChangeFormation(matchFormat, e.target.value)} style={{ padding: 13, borderRadius: 16, background: "rgba(2,6,23,0.58)", color: "white", border: "1px solid rgba(148,163,184,0.22)" }}>{Object.keys(matchFormat === "7v7" ? { "2-3-1": true, "3-2-1": true } : matchFormat === "9v9" ? { "3-3-2": true, "3-4-1": true } : { "4-3-3": true, "4-4-2": true, "3-5-2": true }).map((name) => <option key={name} value={name}>{name}</option>)}</select>
            </div>
            {isAdmin ? <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}><input value={lineupName} onChange={(e) => setLineupName(e.target.value)} placeholder="Save lineup name" style={{ padding: 13, borderRadius: 16, background: "rgba(2,6,23,0.58)", color: "white", border: "1px solid rgba(148,163,184,0.22)" }} /><div style={{ width: 110 }}><PrimaryButton onClick={() => void onSaveLineup()}>Save</PrimaryButton></div></div> : null}
          </PageCard>

          {savedLineups?.length ? <PageCard><SectionHeader title="Saved Lineups" subtitle="Quickly load a previous setup." /><div style={{ display: "grid", gap: 10 }}>{savedLineups.map((item: any) => <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center", borderRadius: 18, padding: 12, background: "rgba(15,23,42,0.66)", border: "1px solid rgba(148,163,184,0.18)" }}><div><div style={{ color: "white", fontWeight: 1000 }}>{item.name}</div><div style={{ color: "#aebed4", fontSize: 12 }}>{item.format} • {item.formation}</div></div><SecondaryButton onClick={() => void onLoadSavedLineup(item.id)}>Load</SecondaryButton>{isAdmin ? <DangerButton onClick={() => void onDeleteSavedLineup(item.id)}>Delete</DangerButton> : null}</div>)}</div></PageCard> : null}

          <PageCard>
            <SectionHeader title="Elite Tactical Board" subtitle="Drag players between the pitch and bench." />
            <DndContext collisionDetection={closestCenter} onDragStart={(e: DragStartEvent) => { const parsed = parseDragId(String(e.active.id)); setActiveDragPlayerId(parsed?.playerId || null); onDragStartExternal(e) }} onDragEnd={(e: DragEndEvent) => { setActiveDragPlayerId(null); onDragEndExternal(e) }}>
              <div className="sharks-tactical-pitch" style={{ minHeight: 430, padding: 16, display: "grid", alignContent: "center", gap: 12 }}>
                <div style={{ position: "absolute", left: "50%", top: "50%", width: 94, height: 94, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.22)", transform: "translate(-50%, -50%)", pointerEvents: "none" }} />
                <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 12 }}>
                  {pitchRows.map((row, rowIndex) => <div key={rowIndex} style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(row.length, 1)}, minmax(0, 1fr))`, gap: 10 }}>{row.map((slot: PitchSlot) => { const playerId = lineupMap[slot.id]; const player = players.find((p: Player) => p.id === playerId); return <PitchSlotDrop key={slot.id} slot={slot} player={player} activePlayer={activeDragPlayer} liveSeconds={playerId ? liveSecondsMap[playerId] || 0 : 0} /> })}</div>)}
                </div>
              </div>

              <div style={{ marginTop: 16 }}>
                <SectionHeader title="Premium Bench" subtitle="Substitutes ready to drag into the tactical board." />
                <BenchDrop><div style={{ display: "grid", gap: 10 }}>{benchPlayers.length ? benchPlayers.map((p) => <DraggablePlayer key={p.id} player={p} originId="bench" subtitle={`${formatMinutes(liveSecondsMap[p.id] || 0)}m`} />) : <div style={{ color: "#aebed4" }}>No players on the bench.</div>}</div></BenchDrop>
              </div>
            </DndContext>
          </PageCard>
        </div>
      ) : null}

      {matchTab === "live" ? (
        <div style={{ display: "grid", gap: 16 }}>
          <PageCard>
            <SectionHeader title="Live Match Timeline" subtitle="Match events and tactical moments." action={isAdmin ? <div style={{ minWidth: 140 }}><PrimaryButton onClick={onOpenCreateEvent}>Add Event</PrimaryButton></div> : null} />
            <div style={{ display: "grid", gap: 10 }}>{timeline?.length ? [...timeline].sort((a: TimelineItem, b: TimelineItem) => a.minute - b.minute || a.sortOrder - b.sortOrder).map((t: TimelineItem) => <div key={t.id} style={{ borderRadius: 18, padding: 14, background: "rgba(15,23,42,0.66)", border: "1px solid rgba(148,163,184,0.18)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><div style={{ display: "flex", gap: 8 }}><Badge>{t.minute}'</Badge><Badge tone={t.type === "goal" ? "green" : t.type === "injury" ? "red" : t.type === "sub" ? "yellow" : "blue"}>{t.type}</Badge></div>{isAdmin ? <div style={{ display: "flex", gap: 8 }}><SecondaryButton onClick={() => onOpenEditEvent(t)}>Edit</SecondaryButton><DangerButton onClick={() => void onDeleteTimelineItem(t.id)}>Delete</DangerButton></div> : null}</div><div style={{ color: "#cbd5e1", marginTop: 8 }}>{t.text}</div></div>) : <div style={{ color: "#aebed4" }}>No live events yet.</div>}</div>
          </PageCard>
          <PageCard><SectionHeader title="Live Minutes" subtitle="Current game minutes against season totals." /><div style={{ display: "grid", gap: 8 }}>{players.map((p: Player) => <PlayerRow key={p.id} player={p} subtitle={`${formatMinutes(liveSecondsMap[p.id] || 0)}m live / ${formatMinutes(p.seasonSeconds || 0)}m season`} />)}</div></PageCard>
        </div>
      ) : null}

      {matchTab === "quarters" ? <PageCard tone="softYellow"><SectionHeader title={periodMode === "quarters" ? "Quarter Summary" : "Half Summary"} subtitle="Use the planner section below to save, load and auto-generate plans." /></PageCard> : null}

      {matchTab === "stats" ? <PageCard><SectionHeader title="Match Stats" subtitle="Player minute totals for the active game." /><div style={{ display: "grid", gap: 8 }}>{players.map((p: Player) => <PlayerRow key={p.id} player={p} subtitle={`Live ${formatMinutes(liveSecondsMap[p.id] || 0)}m • Season ${formatMinutes(p.seasonSeconds || 0)}m`} />)}</div></PageCard> : null}
    </div>
  )
}
