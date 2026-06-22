"use client"

import { useMemo, useState } from "react"
import type { PitchPosition, Player } from "../lib/types"
import { ALL_POSITIONS, initials } from "../lib/types"
import { Badge, DangerButton, PageCard, PrimaryButton, SecondaryButton, SectionHeader } from "./ui"

type Props = {
  players: Player[]
  isAdmin: boolean
  onSavePlayers: (nextPlayers: Player[]) => Promise<void>
}

type PlayerForm = {
  name: string
  positions: PitchPosition[]
  mainGK: boolean
  backupGK: boolean
  captain: boolean
  viceCaptain: boolean
}

const defaultForm: PlayerForm = { name: "", positions: ["MID"], mainGK: false, backupGK: false, captain: false, viceCaptain: false }

function EliteStat({ label, value, tone = "#38bdf8" }: { label: string; value: string | number; tone?: string }) {
  return <div className="sharks-glass sharks-card-shine" style={{ borderRadius: 22, padding: 14, border: `1px solid ${tone}44`, boxShadow: `0 16px 42px ${tone}16` }}><div style={{ color: "#aebed4", fontSize: 10, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div><div style={{ marginTop: 7, color: tone, fontSize: 30, fontWeight: 1000, lineHeight: 1 }}>{value}</div></div>
}

function ToggleChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return <button onClick={onClick} style={{ border: active ? "1px solid rgba(125,211,252,0.60)" : "1px solid rgba(148,163,184,0.20)", background: active ? "linear-gradient(135deg, #1d4ed8, #0284c7)" : "rgba(255,255,255,0.06)", color: active ? "white" : "#dbeafe", borderRadius: 999, padding: "9px 12px", fontWeight: 900, cursor: "pointer" }}>{label}</button>
}

function RoleToggle({ checked, title, subtitle, onChange }: { checked: boolean; title: string; subtitle: string; onChange: (checked: boolean) => void }) {
  return <label style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 12, alignItems: "start", padding: 13, borderRadius: 18, border: checked ? "1px solid rgba(125,211,252,0.48)" : "1px solid rgba(148,163,184,0.18)", background: checked ? "rgba(14,165,233,0.14)" : "rgba(255,255,255,0.045)", cursor: "pointer" }}><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginTop: 4 }} /><div><div style={{ fontWeight: 1000, color: "white" }}>{title}</div><div style={{ color: "#aebed4", fontSize: 13, marginTop: 4 }}>{subtitle}</div></div></label>
}

function PlayerAvatar({ player, size = 64 }: { player: Player; size?: number }) {
  return <div className="sharks-player-token" style={{ width: size, height: size, borderRadius: 22, display: "grid", placeItems: "center", color: "white", fontWeight: 1000, fontSize: Math.max(16, Math.round(size * 0.3)), position: "relative" }}>{initials(player.name)}{player.captain ? <div style={{ position: "absolute", right: -5, top: -6, borderRadius: 999, background: "#facc15", color: "#020617", padding: "3px 6px", fontSize: 10, fontWeight: 1000 }}>C</div> : null}{player.mainGK || player.backupGK ? <div style={{ position: "absolute", left: -6, bottom: -6, borderRadius: 999, background: "#22c55e", color: "white", padding: "3px 6px", fontSize: 9, fontWeight: 1000 }}>GK</div> : null}</div>
}

function roleLabel(player: Player) {
  if (player.mainGK) return "Main Goalkeeper"
  if (player.backupGK) return "Backup Goalkeeper"
  if (player.captain) return "Captain"
  if (player.viceCaptain) return "Vice-Captain"
  return "Squad Player"
}

function profileMetrics(player: Player) {
  const minutes = Math.round((player.seasonSeconds || 0) / 60)
  const readiness = player.positions.length >= 2 ? "Flexible" : player.mainGK || player.backupGK ? "Keeper" : "Ready"
  const development = player.positions.includes("MID") ? "Awareness" : player.positions.includes("DEF") ? "Positioning" : player.positions.includes("FWD") ? "Finishing" : "Confidence"
  return { minutes, readiness, development }
}

function MiniMetric({ label, value, tone = "#7dd3fc" }: { label: string; value: string | number; tone?: string }) {
  return <div style={{ borderRadius: 15, padding: 10, background: "rgba(255,255,255,0.055)", border: `1px solid ${tone}33` }}><div style={{ color: "#aebed4", fontSize: 9, fontWeight: 1000, letterSpacing: ".08em", textTransform: "uppercase" }}>{label}</div><div style={{ color: tone, fontSize: 18, fontWeight: 1000, marginTop: 4 }}>{value}</div></div>
}

function PlayerCard({ player, isAdmin, onOpen, onEdit, onRemove }: { player: Player; isAdmin: boolean; onOpen: () => void; onEdit: () => void; onRemove: () => void }) {
  const metrics = profileMetrics(player)
  return (
    <div className="sharks-elite-panel sharks-card-shine" style={{ padding: 15, display: "grid", gap: 13, borderRadius: 24 }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 13, alignItems: "center" }}>
        <PlayerAvatar player={player} />
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "white", fontWeight: 1000, fontSize: 19, lineHeight: 1.1 }}>{player.name}</div>
          <div style={{ color: "#7dd3fc", marginTop: 5, fontWeight: 900, fontSize: 13 }}>{player.positions.join(" / ")}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}><Badge tone="blue">{roleLabel(player)}</Badge>{player.positions.length > 1 ? <Badge tone="green">Multi-role</Badge> : null}</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}><MiniMetric label="Mins" value={metrics.minutes} /><MiniMetric label="Roles" value={player.positions.length} tone="#22c55e" /><MiniMetric label="Status" value={metrics.readiness} tone="#facc15" /></div>
      <div style={{ borderRadius: 16, padding: 10, background: "rgba(2,6,23,0.42)", border: "1px solid rgba(125,211,252,0.14)", color: "#cbd5e1", fontSize: 12, fontWeight: 800 }}>Development focus: <span style={{ color: "white" }}>{metrics.development}</span></div>
      <div style={{ display: "grid", gridTemplateColumns: isAdmin ? "1fr 1fr 1fr" : "1fr", gap: 8 }}><PrimaryButton onClick={onOpen}>Profile</PrimaryButton>{isAdmin ? <><SecondaryButton onClick={onEdit}>Edit</SecondaryButton><DangerButton onClick={onRemove}>Remove</DangerButton></> : null}</div>
    </div>
  )
}

function PlayerProfilePanel({ player, isAdmin, onClose, onEdit }: { player: Player; isAdmin: boolean; onClose: () => void; onEdit: () => void }) {
  const metrics = profileMetrics(player)
  return (
    <PageCard tone="softBlue">
      <SectionHeader title="Player Profile" subtitle="Development snapshot, roles and season progress." action={<div style={{ minWidth: 110 }}><SecondaryButton onClick={onClose}>Close</SecondaryButton></div>} />
      <div style={{ display: "grid", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 14, alignItems: "center" }}><PlayerAvatar player={player} size={74} /><div><div style={{ color: "white", fontSize: 26, fontWeight: 1000, letterSpacing: "-0.04em" }}>{player.name}</div><div style={{ color: "#7dd3fc", fontWeight: 900, marginTop: 4 }}>{roleLabel(player)} • {player.positions.join(" / ")}</div></div></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}><MiniMetric label="Season Mins" value={metrics.minutes} /><MiniMetric label="Positions" value={player.positions.length} tone="#22c55e" /><MiniMetric label="Readiness" value={metrics.readiness} tone="#facc15" /><MiniMetric label="Focus" value={metrics.development} tone="#a78bfa" /></div>
        <div className="sharks-glass" style={{ borderRadius: 20, padding: 14, display: "grid", gap: 10, border: "1px solid rgba(125,211,252,0.18)" }}><div style={{ color: "#7dd3fc", fontSize: 11, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>Development Notes</div><div style={{ color: "white", fontWeight: 900 }}>Strengths to build on</div><div style={{ color: "#cbd5e1", fontWeight: 800 }}>Work rate, confidence and decision making.</div><div style={{ color: "white", fontWeight: 900 }}>Next focus</div><div style={{ color: "#cbd5e1", fontWeight: 800 }}>{metrics.development} during training and matchday.</div></div>
        <div className="sharks-glass" style={{ borderRadius: 20, padding: 14, display: "grid", gap: 8, border: "1px solid rgba(250,204,21,0.18)" }}><div style={{ color: "#facc15", fontSize: 11, fontWeight: 1000, letterSpacing: ".14em", textTransform: "uppercase" }}>Parent Summary</div><div style={{ color: "#fde68a", fontWeight: 850 }}>Positive progress snapshot ready for post-match feedback. Detailed match notes will connect here in the next build.</div></div>
        {isAdmin ? <PrimaryButton onClick={onEdit}>Edit Player Profile</PrimaryButton> : null}
      </div>
    </PageCard>
  )
}

export default function PlayersManager({ players, isAdmin, onSavePlayers }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PlayerForm>(defaultForm)
  const [query, setQuery] = useState("")
  const [positionFilter, setPositionFilter] = useState<"ALL" | PitchPosition>("ALL")
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const mainGKCount = useMemo(() => players.filter((p) => p.mainGK).length, [players])
  const captainCount = useMemo(() => players.filter((p) => p.captain).length, [players])
  const totalMinutes = useMemo(() => players.reduce((sum, player) => sum + (player.seasonSeconds || 0), 0), [players])
  const selectedPlayer = players.find((player) => player.id === selectedPlayerId) || null
  const filteredPlayers = useMemo(() => players.filter((player) => {
    const matchesQuery = player.name.toLowerCase().includes(query.trim().toLowerCase())
    const matchesPosition = positionFilter === "ALL" || player.positions.includes(positionFilter)
    return matchesQuery && matchesPosition
  }), [players, query, positionFilter])

  function resetForm() { setShowForm(false); setEditingId(null); setForm(defaultForm) }
  function startEdit(player: Player) { setEditingId(player.id); setForm({ name: player.name, positions: player.positions, mainGK: player.mainGK, backupGK: player.backupGK, captain: player.captain, viceCaptain: player.viceCaptain }); setShowForm(true) }
  function togglePosition(position: PitchPosition) { setForm((prev) => { const exists = prev.positions.includes(position); let next = exists ? prev.positions.filter((p) => p !== position) : [...prev.positions, position]; if (next.length === 0) next = [position]; return { ...prev, positions: next } }) }

  async function savePlayer() {
    const trimmed = form.name.trim()
    if (!trimmed) { window.alert("Player name required"); return }
    const targetId = editingId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    let nextPlayers = players.map((p) => p.id === targetId ? { ...p, name: trimmed, positions: form.positions, mainGK: form.mainGK, backupGK: form.backupGK, captain: form.captain, viceCaptain: form.viceCaptain } : p)
    if (!editingId) nextPlayers.push({ id: targetId, name: trimmed, positions: form.positions, mainGK: form.mainGK, backupGK: form.backupGK, captain: form.captain, viceCaptain: form.viceCaptain, seasonSeconds: 0 })
    if (form.mainGK) nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, mainGK: false }))
    if (form.backupGK) nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, backupGK: false }))
    if (form.captain) nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, captain: false }))
    if (form.viceCaptain) nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, viceCaptain: false }))
    await onSavePlayers(nextPlayers)
    setSelectedPlayerId(targetId)
    resetForm()
  }

  async function removePlayer(playerId: string) { const ok = window.confirm("Remove this player from the squad?"); if (!ok) return; if (selectedPlayerId === playerId) setSelectedPlayerId(null); await onSavePlayers(players.filter((p) => p.id !== playerId)) }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard tone="blue"><SectionHeader title="Squad Hub 2.0" subtitle={isAdmin ? "Player profiles, positions, development tracking and squad roles." : "View squad profiles and playing roles."} light action={isAdmin ? <div style={{ minWidth: 140 }}><PrimaryButton onClick={() => { resetForm(); setShowForm(true) }}>Add Player</PrimaryButton></div> : undefined} /></PageCard>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: 10 }}><EliteStat label="Squad Size" value={players.length} tone="#38bdf8" /><EliteStat label="Main GKs" value={mainGKCount} tone="#22c55e" /><EliteStat label="Captains" value={captainCount} tone="#facc15" /><EliteStat label="Season Minutes" value={Math.round(totalMinutes / 60)} tone="#a78bfa" /></div>
      <PageCard><SectionHeader title="Find Players" subtitle="Search the squad or filter by position." /><div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) auto", gap: 10 }}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search player name" style={{ width: "100%", padding: 13, borderRadius: 16, border: "1px solid rgba(148,163,184,0.22)", background: "rgba(2,6,23,0.58)", color: "white", fontWeight: 800 }} /><select value={positionFilter} onChange={(event) => setPositionFilter(event.target.value as "ALL" | PitchPosition)} style={{ padding: 13, borderRadius: 16, border: "1px solid rgba(148,163,184,0.22)", background: "rgba(2,6,23,0.58)", color: "white", fontWeight: 900 }}><option value="ALL">All</option>{ALL_POSITIONS.map((position) => <option key={position} value={position}>{position}</option>)}</select></div></PageCard>
      {selectedPlayer ? <PlayerProfilePanel player={selectedPlayer} isAdmin={isAdmin} onClose={() => setSelectedPlayerId(null)} onEdit={() => startEdit(selectedPlayer)} /> : null}
      {showForm && isAdmin ? <PageCard tone="softBlue"><SectionHeader title={editingId ? "Edit Player" : "Add Player"} subtitle="Update profile, positions and squad roles." /><div style={{ display: "grid", gap: 14 }}><input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Player name" style={{ width: "100%", padding: 14, borderRadius: 18, border: "1px solid rgba(148,163,184,0.22)", fontSize: 16, background: "rgba(2,6,23,0.58)", color: "white" }} /><div className="sharks-glass" style={{ padding: 14, borderRadius: 18, display: "grid", gap: 10 }}><div style={{ fontWeight: 1000, color: "white" }}>Positions</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{ALL_POSITIONS.map((position) => <ToggleChip key={position} active={form.positions.includes(position)} label={position} onClick={() => togglePosition(position)} />)}</div></div><div className="sharks-glass" style={{ padding: 14, borderRadius: 18, display: "grid", gap: 10 }}><div style={{ fontWeight: 1000, color: "white" }}>Roles</div><div style={{ display: "grid", gap: 10 }}><RoleToggle checked={form.mainGK} title="Main Goalkeeper" subtitle="Marks this player as the primary goalkeeper." onChange={(checked) => setForm((prev) => ({ ...prev, mainGK: checked, backupGK: checked ? false : prev.backupGK, positions: checked && !prev.positions.includes("GK") ? [...prev.positions, "GK"] : prev.positions }))} /><RoleToggle checked={form.backupGK} title="Backup Goalkeeper" subtitle="Used as the secondary goalkeeper option." onChange={(checked) => setForm((prev) => ({ ...prev, backupGK: checked, mainGK: checked ? false : prev.mainGK, positions: checked && !prev.positions.includes("GK") ? [...prev.positions, "GK"] : prev.positions }))} /><RoleToggle checked={form.captain} title="Captain" subtitle="Primary team captain." onChange={(checked) => setForm((prev) => ({ ...prev, captain: checked, viceCaptain: checked ? false : prev.viceCaptain }))} /><RoleToggle checked={form.viceCaptain} title="Vice-Captain" subtitle="Secondary leadership role." onChange={(checked) => setForm((prev) => ({ ...prev, viceCaptain: checked, captain: checked ? false : prev.captain }))} /></div></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}><PrimaryButton onClick={() => void savePlayer()}>Save Player</PrimaryButton><SecondaryButton onClick={resetForm}>Cancel</SecondaryButton></div></div></PageCard> : null}
      <PageCard><SectionHeader title="Player Profiles" subtitle={`${filteredPlayers.length} shown from ${players.length} player${players.length === 1 ? "" : "s"}`} />{filteredPlayers.length === 0 ? <div style={{ borderRadius: 22, border: "1px dashed rgba(148,163,184,0.28)", padding: 18, color: "#aebed4" }}>No players match this filter.</div> : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>{filteredPlayers.map((player) => <PlayerCard key={player.id} player={player} isAdmin={isAdmin} onOpen={() => setSelectedPlayerId(player.id)} onEdit={() => startEdit(player)} onRemove={() => void removePlayer(player.id)} />)}</div>}</PageCard>
    </div>
  )
}
