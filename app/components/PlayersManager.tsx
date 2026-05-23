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

const defaultForm: PlayerForm = {
  name: "",
  positions: ["MID"],
  mainGK: false,
  backupGK: false,
  captain: false,
  viceCaptain: false,
}

function EliteStat({ label, value, tone = "#38bdf8" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div
      className="sharks-glass sharks-card-shine"
      style={{
        borderRadius: 24,
        padding: 18,
        border: `1px solid ${tone}44`,
        boxShadow: `0 16px 42px ${tone}16`,
      }}
    >
      <div style={{ color: "#aebed4", fontSize: 11, fontWeight: 1000, letterSpacing: ".12em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ marginTop: 8, color: tone, fontSize: 34, fontWeight: 1000, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function ToggleChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        border: active ? "1px solid rgba(125,211,252,0.60)" : "1px solid rgba(148,163,184,0.20)",
        background: active ? "linear-gradient(135deg, #1d4ed8, #0284c7)" : "rgba(255,255,255,0.06)",
        color: active ? "white" : "#dbeafe",
        borderRadius: 999,
        padding: "10px 14px",
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  )
}

function RoleToggle({ checked, title, subtitle, onChange }: { checked: boolean; title: string; subtitle: string; onChange: (checked: boolean) => void }) {
  return (
    <label
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        gap: 12,
        alignItems: "start",
        padding: 14,
        borderRadius: 18,
        border: checked ? "1px solid rgba(125,211,252,0.48)" : "1px solid rgba(148,163,184,0.18)",
        background: checked ? "rgba(14,165,233,0.14)" : "rgba(255,255,255,0.045)",
        cursor: "pointer",
      }}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ marginTop: 4 }} />
      <div>
        <div style={{ fontWeight: 1000, color: "white" }}>{title}</div>
        <div style={{ color: "#aebed4", fontSize: 13, marginTop: 4 }}>{subtitle}</div>
      </div>
    </label>
  )
}

function PlayerAvatar({ player }: { player: Player }) {
  return (
    <div
      className="sharks-player-token"
      style={{
        width: 68,
        height: 68,
        borderRadius: 22,
        display: "grid",
        placeItems: "center",
        color: "white",
        fontWeight: 1000,
        fontSize: 20,
        position: "relative",
      }}
    >
      {initials(player.name)}
      {player.captain ? (
        <div style={{ position: "absolute", right: -5, top: -6, borderRadius: 999, background: "#facc15", color: "#020617", padding: "3px 6px", fontSize: 10, fontWeight: 1000 }}>
          C
        </div>
      ) : null}
      {player.mainGK || player.backupGK ? (
        <div style={{ position: "absolute", left: -6, bottom: -6, borderRadius: 999, background: "#22c55e", color: "white", padding: "3px 6px", fontSize: 9, fontWeight: 1000 }}>
          GK
        </div>
      ) : null}
    </div>
  )
}

function PlayerCard({ player, isAdmin, onEdit, onRemove }: { player: Player; isAdmin: boolean; onEdit: () => void; onRemove: () => void }) {
  const minutes = Math.round((player.seasonSeconds || 0) / 60)
  const roleLabel = player.mainGK ? "Main Goalkeeper" : player.backupGK ? "Backup Goalkeeper" : player.captain ? "Captain" : player.viceCaptain ? "Vice-Captain" : "Squad Player"

  return (
    <div className="sharks-elite-panel sharks-card-shine" style={{ padding: 16, display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr)", gap: 14, alignItems: "center" }}>
        <PlayerAvatar player={player} />
        <div style={{ minWidth: 0 }}>
          <div style={{ color: "white", fontWeight: 1000, fontSize: 20, lineHeight: 1.1 }}>{player.name}</div>
          <div style={{ color: "#7dd3fc", marginTop: 5, fontWeight: 900, fontSize: 13 }}>{player.positions.join(" / ")}</div>
          <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
            <Badge tone="blue">{roleLabel}</Badge>
            {player.viceCaptain ? <Badge tone="yellow">Vice</Badge> : null}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
        <div style={{ borderRadius: 16, padding: 10, background: "rgba(255,255,255,0.055)", border: "1px solid rgba(148,163,184,0.14)" }}>
          <div style={{ color: "#aebed4", fontSize: 10, fontWeight: 900 }}>MINUTES</div>
          <div style={{ color: "white", fontSize: 20, fontWeight: 1000 }}>{minutes}</div>
        </div>
        <div style={{ borderRadius: 16, padding: 10, background: "rgba(255,255,255,0.055)", border: "1px solid rgba(148,163,184,0.14)" }}>
          <div style={{ color: "#aebed4", fontSize: 10, fontWeight: 900 }}>ROLES</div>
          <div style={{ color: "white", fontSize: 20, fontWeight: 1000 }}>{player.positions.length}</div>
        </div>
        <div style={{ borderRadius: 16, padding: 10, background: "rgba(255,255,255,0.055)", border: "1px solid rgba(148,163,184,0.14)" }}>
          <div style={{ color: "#aebed4", fontSize: 10, fontWeight: 900 }}>STATUS</div>
          <div style={{ color: "#22c55e", fontSize: 20, fontWeight: 1000 }}>Ready</div>
        </div>
      </div>

      {isAdmin ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <SecondaryButton onClick={onEdit}>Edit</SecondaryButton>
          <DangerButton onClick={onRemove}>Remove</DangerButton>
        </div>
      ) : null}
    </div>
  )
}

export default function PlayersManager({ players, isAdmin, onSavePlayers }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<PlayerForm>(defaultForm)

  const mainGKCount = useMemo(() => players.filter((p) => p.mainGK).length, [players])
  const captainCount = useMemo(() => players.filter((p) => p.captain).length, [players])
  const totalMinutes = useMemo(() => players.reduce((sum, player) => sum + (player.seasonSeconds || 0), 0), [players])

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(defaultForm)
  }

  function startEdit(player: Player) {
    setEditingId(player.id)
    setForm({ name: player.name, positions: player.positions, mainGK: player.mainGK, backupGK: player.backupGK, captain: player.captain, viceCaptain: player.viceCaptain })
    setShowForm(true)
  }

  function togglePosition(position: PitchPosition) {
    setForm((prev) => {
      const exists = prev.positions.includes(position)
      let next = exists ? prev.positions.filter((p) => p !== position) : [...prev.positions, position]
      if (next.length === 0) next = [position]
      return { ...prev, positions: next }
    })
  }

  async function savePlayer() {
    const trimmed = form.name.trim()
    if (!trimmed) {
      window.alert("Player name required")
      return
    }

    const targetId = editingId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    let nextPlayers = players.map((p) =>
      p.id === targetId ? { ...p, name: trimmed, positions: form.positions, mainGK: form.mainGK, backupGK: form.backupGK, captain: form.captain, viceCaptain: form.viceCaptain } : p
    )

    if (!editingId) {
      nextPlayers.push({ id: targetId, name: trimmed, positions: form.positions, mainGK: form.mainGK, backupGK: form.backupGK, captain: form.captain, viceCaptain: form.viceCaptain, seasonSeconds: 0 })
    }

    if (form.mainGK) nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, mainGK: false }))
    if (form.backupGK) nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, backupGK: false }))
    if (form.captain) nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, captain: false }))
    if (form.viceCaptain) nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, viceCaptain: false }))

    await onSavePlayers(nextPlayers)
    resetForm()
  }

  async function removePlayer(playerId: string) {
    const ok = window.confirm("Remove this player from the squad?")
    if (!ok) return
    await onSavePlayers(players.filter((p) => p.id !== playerId))
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard tone="blue">
        <SectionHeader
          title="Elite Squad Hub"
          subtitle={isAdmin ? "Manage player profiles, positions, goalkeepers and leadership roles." : "View squad profiles and playing roles."}
          light
          action={isAdmin ? <div style={{ minWidth: 140 }}><PrimaryButton onClick={() => { resetForm(); setShowForm(true) }}>Add Player</PrimaryButton></div> : undefined}
        />
      </PageCard>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
        <EliteStat label="Squad Size" value={players.length} tone="#38bdf8" />
        <EliteStat label="Main GKs" value={mainGKCount} tone="#22c55e" />
        <EliteStat label="Captains" value={captainCount} tone="#facc15" />
        <EliteStat label="Season Minutes" value={Math.round(totalMinutes / 60)} tone="#a78bfa" />
      </div>

      {showForm && isAdmin ? (
        <PageCard tone="softBlue">
          <SectionHeader title={editingId ? "Edit Player" : "Add Player"} subtitle="Update profile, positions and squad roles." />
          <div style={{ display: "grid", gap: 14 }}>
            <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Player name" style={{ width: "100%", padding: 14, borderRadius: 18, border: "1px solid rgba(148,163,184,0.22)", fontSize: 16, background: "rgba(2,6,23,0.58)", color: "white" }} />

            <div className="sharks-glass" style={{ padding: 14, borderRadius: 18, display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 1000, color: "white" }}>Positions</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{ALL_POSITIONS.map((position) => <ToggleChip key={position} active={form.positions.includes(position)} label={position} onClick={() => togglePosition(position)} />)}</div>
            </div>

            <div className="sharks-glass" style={{ padding: 14, borderRadius: 18, display: "grid", gap: 10 }}>
              <div style={{ fontWeight: 1000, color: "white" }}>Roles</div>
              <div style={{ display: "grid", gap: 10 }}>
                <RoleToggle checked={form.mainGK} title="Main Goalkeeper" subtitle="Marks this player as the primary goalkeeper." onChange={(checked) => setForm((prev) => ({ ...prev, mainGK: checked, backupGK: checked ? false : prev.backupGK, positions: checked && !prev.positions.includes("GK") ? [...prev.positions, "GK"] : prev.positions }))} />
                <RoleToggle checked={form.backupGK} title="Backup Goalkeeper" subtitle="Used as the secondary goalkeeper option." onChange={(checked) => setForm((prev) => ({ ...prev, backupGK: checked, mainGK: checked ? false : prev.mainGK, positions: checked && !prev.positions.includes("GK") ? [...prev.positions, "GK"] : prev.positions }))} />
                <RoleToggle checked={form.captain} title="Captain" subtitle="Primary team captain." onChange={(checked) => setForm((prev) => ({ ...prev, captain: checked, viceCaptain: checked ? false : prev.viceCaptain }))} />
                <RoleToggle checked={form.viceCaptain} title="Vice-Captain" subtitle="Secondary leadership role." onChange={(checked) => setForm((prev) => ({ ...prev, viceCaptain: checked, captain: checked ? false : prev.captain }))} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <PrimaryButton onClick={() => void savePlayer()}>Save Player</PrimaryButton>
              <SecondaryButton onClick={resetForm}>Cancel</SecondaryButton>
            </div>
          </div>
        </PageCard>
      ) : null}

      <PageCard>
        <SectionHeader title="Player Profiles" subtitle={`${players.length} player${players.length === 1 ? "" : "s"} in squad`} />
        {players.length === 0 ? (
          <div style={{ borderRadius: 22, border: "1px dashed rgba(148,163,184,0.28)", padding: 18, color: "#aebed4" }}>No players added yet. Add your first squad player to start building the team.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
            {players.map((player) => <PlayerCard key={player.id} player={player} isAdmin={isAdmin} onEdit={() => startEdit(player)} onRemove={() => void removePlayer(player.id)} />)}
          </div>
        )}
      </PageCard>
    </div>
  )
}
