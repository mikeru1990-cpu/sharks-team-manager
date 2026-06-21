"use client"

import type { MatchFormat, MatchTab, PitchSlot, Player, TimelineItem } from "../lib/types"
import { formatClock, formatMinutes } from "../lib/types"
import { Badge, PageCard, PrimaryButton, SecondaryButton, DangerButton, SectionHeader } from "./ui"

type PeriodMode = "quarters" | "halves"
type Props = any

function TeamInput({ value, align, disabled, onChange }: { value: string; align?: "left" | "right"; disabled?: boolean; onChange: (value: string) => void }) {
  return <input value={value} disabled={disabled} onChange={(event) => void onChange(event.target.value)} style={{ width: "100%", border: "none", background: "transparent", color: "white", outline: "none", fontSize: 13, fontWeight: 1000, padding: "4px 0", textAlign: align || "left", overflow: "hidden", textOverflow: "ellipsis" }} />
}

function MiniScoreButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} style={{ minWidth: 42, height: 36, borderRadius: 14, border: "1px solid rgba(125,211,252,0.30)", background: "linear-gradient(135deg, rgba(255,255,255,0.13), rgba(15,23,42,0.64))", color: "white", fontWeight: 1000, cursor: "pointer" }}>{children}</button>
}

function TabButton({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return <button onClick={onClick} style={{ border: active ? "1px solid rgba(125,211,252,0.65)" : "1px solid rgba(148,163,184,0.16)", background: active ? "linear-gradient(135deg, #1d4ed8 0%, #0284c7 62%, #0f172a 100%)" : "rgba(255,255,255,0.04)", color: active ? "white" : "#cbd5e1", borderRadius: 15, padding: "9px 5px", fontWeight: 1000, fontSize: 11, cursor: "pointer" }}>{children}</button>
}

function PlayerRow({ player, subtitle }: { player: Player; subtitle?: string }) {
  return (
    <div style={{ borderRadius: 16, padding: 10, background: "rgba(15,23,42,0.66)", border: "1px solid rgba(148,163,184,0.18)", display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "center" }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: "white", fontWeight: 1000, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player.name}</div>
        <div style={{ color: "#aebed4", fontWeight: 700, fontSize: 12, marginTop: 3 }}>{player.positions.join("/")}</div>
      </div>
      {subtitle ? <div style={{ color: "#7dd3fc", fontSize: 12, fontWeight: 900, textAlign: "right" }}>{subtitle}</div> : null}
    </div>
  )
}

function MetricCard({ label, value, colour = "#7dd3fc" }: { label: string; value: string | number; colour?: string }) {
  return (
    <div style={{ borderRadius: 15, padding: 10, background: "rgba(255,255,255,0.065)", border: `1px solid ${colour}44` }}>
      <div style={{ color: "#aebed4", fontSize: 9, fontWeight: 1000, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ color: colour, fontSize: 20, fontWeight: 1000, marginTop: 4 }}>{String(value)}</div>
    </div>
  )
}

function LiveActionButton({ label, detail, tone, onClick }: { label: string; detail: string; tone: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ borderRadius: 18, padding: 12, background: `${tone}1f`, border: `1px solid ${tone}66`, color: "white", cursor: "pointer", textAlign: "left", minHeight: 68 }}>
      <div style={{ fontSize: 17, fontWeight: 1000 }}>{label}</div>
      <div style={{ color: "#cbd5e1", fontSize: 11, fontWeight: 850, marginTop: 3 }}>{detail}</div>
    </button>
  )
}

function PlayerChip({ player, label, tone = "#38bdf8" }: { player?: Player; label: string; tone?: string }) {
  return (
    <div style={{ borderRadius: 14, padding: 8, background: player ? "rgba(2,6,23,0.62)" : "rgba(15,23,42,0.42)", border: `1px solid ${player ? tone : "rgba(148,163,184,0.18)"}`, minWidth: 0, textAlign: "center" }}>
      <div style={{ color: tone, fontSize: 9, fontWeight: 1000 }}>{label}</div>
      <div style={{ color: player ? "white" : "#64748b", fontSize: 12, fontWeight: 1000, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{player?.name || "Empty"}</div>
    </div>
  )
}

function PitchBoard({ currentSlots, lineupMap, players }: { currentSlots: PitchSlot[]; lineupMap: Record<string, string | null>; players: Player[] }) {
  const byPosition = { FWD: currentSlots.filter((slot) => slot.position === "FWD"), MID: currentSlots.filter((slot) => slot.position === "MID"), DEF: currentSlots.filter((slot) => slot.position === "DEF"), GK: currentSlots.filter((slot) => slot.position === "GK") }
  return (
    <div className="sharks-tactical-pitch" style={{ minHeight: 320, padding: 16, display: "grid", alignContent: "space-between", gap: 12 }}>
      {(["FWD", "MID", "DEF", "GK"] as const).map((pos) => (
        <div key={pos} style={{ position: "relative", zIndex: 2, display: "grid", gridTemplateColumns: `repeat(${Math.max(1, byPosition[pos].length)}, minmax(0, 1fr))`, gap: 8, alignItems: "center" }}>
          {byPosition[pos].length ? byPosition[pos].map((slot) => {
            const player = players.find((item) => item.id === lineupMap?.[slot.id])
            return <PlayerChip key={slot.id} player={player} label={slot.label || pos} tone={pos === "GK" ? "#facc15" : pos === "DEF" ? "#22c55e" : pos === "MID" ? "#38bdf8" : "#fb7185"} />
          }) : <div />}
        </div>
      ))}
    </div>
  )
}

function BenchStrip({ benchPlayers }: { benchPlayers: Player[] }) {
  return (
    <div className="sharks-glass" style={{ borderRadius: 20, padding: 12, display: "grid", gap: 10, border: "1px solid rgba(250,204,21,0.25)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}><div style={{ color: "#facc15", fontSize: 10, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>Bench</div><Badge tone="yellow">{benchPlayers.length}</Badge></div>
      {benchPlayers.length ? <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 2 }}>{benchPlayers.map((player) => <div key={player.id} style={{ flex: "0 0 auto", borderRadius: 999, padding: "9px 12px", background: "rgba(250,204,21,0.12)", border: "1px solid rgba(250,204,21,0.35)", color: "#fde68a", fontWeight: 1000, fontSize: 12 }}>{player.name}</div>)}</div> : <div style={{ color: "#94a3b8", fontWeight: 850 }}>No players on the bench.</div>}
    </div>
  )
}

export default function MatchCenter(props: Props) {
  const { isAdmin, matchTab, setMatchTab, matchFormat, formation, currentSlots, players, lineupMap, benchIds, homeTeam, awayTeam, homeScore, awayScore, seconds, running, liveSecondsMap, timeline, savedLineups, lineupName, setLineupName, setHomeTeam, setAwayTeam, setHomeScore, setAwayScore, setRunning, resetClock, saveMinutes, onChangeFormation, onSaveLineup, onLoadSavedLineup, onDeleteSavedLineup, onOpenCreateEvent, onOpenEditEvent, onDeleteTimelineItem, onEndGame, trackingTitle, periodMode, periodLength, currentPeriod, setCurrentPeriod, setPeriodMode, setPeriodLength } = props

  const lineupPlayers = Object.values(lineupMap || {}).filter(Boolean).map((id) => players.find((player: Player) => player.id === id)).filter(Boolean) as Player[]
  const benchPlayers = (benchIds || []).map((id: string) => players.find((player: Player) => player.id === id)).filter(Boolean) as Player[]
  const periodCount = periodMode === "quarters" ? 4 : 2
  const periodName = periodMode === "quarters" ? "Quarter" : "Half"
  const periodLabel = periodMode === "quarters" ? `Q${currentPeriod}` : `H${currentPeriod}`
  const periodsTabLabel = periodMode === "quarters" ? "Quarters" : "Halves"

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="sharks-elite-panel sharks-card-shine" style={{ padding: 13, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div style={{ minWidth: 0 }}><div style={{ color: "#7dd3fc", fontSize: 10, fontWeight: 1000, letterSpacing: ".16em" }}>LIVE MATCH CONTROL</div>{trackingTitle ? <div style={{ color: "#cbd5e1", fontSize: 12, fontWeight: 900, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{trackingTitle}</div> : null}</div>
            <Badge tone={running ? "green" : "default"}>{running ? "LIVE" : "READY"}</Badge>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 90px minmax(0, 1fr)", gap: 8, alignItems: "center" }}>
            <div style={{ display: "grid", gap: 5, textAlign: "left" }}><TeamInput value={homeTeam} disabled={!isAdmin} onChange={setHomeTeam} /><div style={{ color: "white", fontSize: 44, fontWeight: 1000, lineHeight: 1 }}>{homeScore}</div>{isAdmin ? <div style={{ display: "flex", gap: 5 }}><MiniScoreButton onClick={() => void setHomeScore(homeScore + 1)}>+1</MiniScoreButton><MiniScoreButton onClick={() => void setHomeScore(Math.max(0, homeScore - 1))}>-1</MiniScoreButton></div> : null}</div>
            <div style={{ borderRadius: 20, padding: "9px 5px", background: "rgba(2,6,23,0.56)", border: "1px solid rgba(125,211,252,0.25)", textAlign: "center" }}><div style={{ color: "#7dd3fc", fontSize: 12, fontWeight: 1000 }}>{periodLabel}</div><div style={{ color: "white", fontSize: 28, fontWeight: 1000, lineHeight: 1.05 }}>{formatClock(seconds)}</div><div style={{ color: "#cbd5e1", fontWeight: 750, fontSize: 11, marginTop: 4 }}>{periodLength} min</div></div>
            <div style={{ display: "grid", gap: 5, textAlign: "right" }}><TeamInput value={awayTeam} disabled={!isAdmin} align="right" onChange={setAwayTeam} /><div style={{ color: "white", fontSize: 44, fontWeight: 1000, lineHeight: 1 }}>{awayScore}</div>{isAdmin ? <div style={{ display: "flex", justifyContent: "end", gap: 5 }}><MiniScoreButton onClick={() => void setAwayScore(awayScore + 1)}>+1</MiniScoreButton><MiniScoreButton onClick={() => void setAwayScore(Math.max(0, awayScore - 1))}>-1</MiniScoreButton></div> : null}</div>
          </div>

          {isAdmin ? <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 7 }}><PrimaryButton onClick={() => setRunning(true)}>Start</PrimaryButton><SecondaryButton onClick={() => setRunning(false)}>Pause</SecondaryButton><SecondaryButton onClick={resetClock}>Reset</SecondaryButton><DangerButton onClick={() => void onEndGame()}>End</DangerButton></div> : null}

          {isAdmin ? <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}><LiveActionButton label="⚽ Goal" detail="Scorer / assist" tone="#22c55e" onClick={onOpenCreateEvent} /><LiveActionButton label="🔄 Sub" detail="Record change" tone="#f59e0b" onClick={onOpenCreateEvent} /><LiveActionButton label="🚑 Injury" detail="Player note" tone="#ef4444" onClick={onOpenCreateEvent} /><LiveActionButton label="📝 Note" detail="Match moment" tone="#38bdf8" onClick={onOpenCreateEvent} /></div> : null}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 7 }}><MetricCard label="Format" value={matchFormat} /><MetricCard label="Shape" value={formation} /><MetricCard label="On" value={lineupPlayers.length} colour="#22c55e" /><MetricCard label="Bench" value={benchPlayers.length} colour="#facc15" /></div>
        </div>
      </div>

      <PitchBoard currentSlots={currentSlots} lineupMap={lineupMap} players={players} />
      <BenchStrip benchPlayers={benchPlayers} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 6 }}>{[["overview", "Setup"], ["lineup", "Lineup"], ["live", "Events"], ["quarters", periodsTabLabel], ["stats", "Mins"]].map(([value, label]) => <TabButton key={value} active={matchTab === value} onClick={() => setMatchTab(value as MatchTab)}>{label}</TabButton>)}</div>

      {matchTab === "overview" ? <PageCard><SectionHeader title="Match Setup" subtitle="Period setup and live minutes." /><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 10 }}><select value={periodMode} disabled={!isAdmin} onChange={(event) => void setPeriodMode(event.target.value as PeriodMode)} style={{ padding: 12, borderRadius: 15, background: "rgba(2,6,23,0.58)", color: "white", border: "1px solid rgba(148,163,184,0.22)" }}><option value="quarters">4 Quarters</option><option value="halves">2 Halves</option></select><input type="number" min={1} value={periodLength} disabled={!isAdmin} onChange={(event) => void setPeriodLength(Math.max(1, Number(event.target.value) || 1))} style={{ padding: 12, borderRadius: 15, background: "rgba(2,6,23,0.58)", color: "white", border: "1px solid rgba(148,163,184,0.22)" }} /><select value={currentPeriod} disabled={!isAdmin} onChange={(event) => setCurrentPeriod(Number(event.target.value))} style={{ padding: 12, borderRadius: 15, background: "rgba(2,6,23,0.58)", color: "white", border: "1px solid rgba(148,163,184,0.22)" }}>{Array.from({ length: periodCount }, (_, index) => index + 1).map((period) => <option key={period} value={period}>{periodName} {period}</option>)}</select><PrimaryButton onClick={() => void saveMinutes()}>Save Minutes</PrimaryButton></div></PageCard> : null}

      {matchTab === "lineup" ? <div style={{ display: "grid", gap: 14 }}><PageCard><SectionHeader title="Lineup Management" subtitle="Set formation and save reusable lineups." /><div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: 12 }}><select value={matchFormat} disabled={!isAdmin} onChange={(event) => { const nextFormat = event.target.value as MatchFormat; const nextFormation = nextFormat === "7v7" ? "2-3-1" : nextFormat === "9v9" ? "3-3-2" : "4-3-3"; void onChangeFormation(nextFormat, nextFormation) }} style={{ padding: 12, borderRadius: 15, background: "rgba(2,6,23,0.58)", color: "white", border: "1px solid rgba(148,163,184,0.22)" }}><option value="7v7">7v7</option><option value="9v9">9v9</option><option value="11v11">11v11</option></select><select value={formation} disabled={!isAdmin} onChange={(event) => void onChangeFormation(matchFormat, event.target.value)} style={{ padding: 12, borderRadius: 15, background: "rgba(2,6,23,0.58)", color: "white", border: "1px solid rgba(148,163,184,0.22)" }}>{Object.keys(matchFormat === "7v7" ? { "2-3-1": true, "3-2-1": true } : matchFormat === "9v9" ? { "3-3-2": true, "3-4-1": true } : { "4-3-3": true, "4-4-2": true, "3-5-2": true }).map((name) => <option key={name} value={name}>{name}</option>)}</select></div>{isAdmin ? <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}><input value={lineupName} onChange={(event) => setLineupName(event.target.value)} placeholder="Save lineup name" style={{ padding: 12, borderRadius: 15, background: "rgba(2,6,23,0.58)", color: "white", border: "1px solid rgba(148,163,184,0.22)" }} /><div style={{ width: 100 }}><PrimaryButton onClick={() => void onSaveLineup()}>Save</PrimaryButton></div></div> : null}</PageCard>{savedLineups?.length ? <PageCard><SectionHeader title="Saved Lineups" subtitle="Quickly load a previous setup." /><div style={{ display: "grid", gap: 10 }}>{savedLineups.map((item: any) => <div key={item.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, alignItems: "center", borderRadius: 16, padding: 10, background: "rgba(15,23,42,0.66)", border: "1px solid rgba(148,163,184,0.18)" }}><div><div style={{ color: "white", fontWeight: 1000 }}>{item.name}</div><div style={{ color: "#aebed4", fontSize: 12 }}>{item.format} • {item.formation}</div></div><SecondaryButton onClick={() => void onLoadSavedLineup(item.id)}>Load</SecondaryButton>{isAdmin ? <DangerButton onClick={() => void onDeleteSavedLineup(item.id)}>Delete</DangerButton> : null}</div>)}</div></PageCard> : null}</div> : null}

      {matchTab === "live" ? <PageCard><SectionHeader title="Live Match Events" subtitle="Goals, subs, injuries and notes." action={isAdmin ? <div style={{ minWidth: 128 }}><PrimaryButton onClick={onOpenCreateEvent}>Add Event</PrimaryButton></div> : null} /><div style={{ display: "grid", gap: 10 }}>{timeline?.length ? [...timeline].sort((a: TimelineItem, b: TimelineItem) => a.minute - b.minute || a.sortOrder - b.sortOrder).map((item: TimelineItem) => <div key={item.id} style={{ borderRadius: 16, padding: 12, background: "rgba(15,23,42,0.66)", border: "1px solid rgba(148,163,184,0.18)" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}><div style={{ display: "flex", gap: 8 }}><Badge>{item.minute}'</Badge><Badge tone={item.type === "goal" ? "green" : item.type === "injury" ? "red" : item.type === "sub" ? "yellow" : "blue"}>{item.type}</Badge></div>{isAdmin ? <div style={{ display: "flex", gap: 8 }}><SecondaryButton onClick={() => onOpenEditEvent(item)}>Edit</SecondaryButton><DangerButton onClick={() => void onDeleteTimelineItem(item.id)}>Delete</DangerButton></div> : null}</div><div style={{ color: "#cbd5e1", marginTop: 8 }}>{item.text}</div></div>) : <div style={{ color: "#aebed4" }}>No live events yet. Use the quick action buttons above during the game.</div>}</div></PageCard> : null}

      {matchTab === "quarters" ? <PageCard tone="softYellow"><SectionHeader title={periodMode === "quarters" ? "Quarter Summary" : "Half Summary"} subtitle="Use the planner below to save, load and auto-generate plans." /></PageCard> : null}
      {matchTab === "stats" ? <PageCard><SectionHeader title="Player Minutes" subtitle="Live and season minutes." /><div style={{ display: "grid", gap: 8 }}>{players.map((player: Player) => <PlayerRow key={player.id} player={player} subtitle={`Live ${formatMinutes(liveSecondsMap[player.id] || 0)}m • Season ${formatMinutes(player.seasonSeconds || 0)}m`} />)}</div></PageCard> : null}
    </div>
  )
}
