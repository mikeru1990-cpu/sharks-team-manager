"use client"

import { useMemo, useState } from "react"
import type { PitchPosition, Player } from "../lib/types"
import { ALL_POSITIONS, initials } from "../lib/types"
import { THEME } from "../lib/theme"
import {
  Badge,
  DangerButton,
  PageCard,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "./ui"

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

function StatCard({
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
        borderRadius: 18,
        padding: 14,
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: active ? "1px solid #bfdbfe" : "1px solid #cbd5e1",
        background: active ? "#dbeafe" : "white",
        color: active ? "#1e3a8a" : "#0f172a",
        borderRadius: 999,
        padding: "9px 13px",
        fontWeight: 800,
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  )
}

function RoleToggle({
  checked,
  title,
  subtitle,
  onChange,
}: {
  checked: boolean
  title: string
  subtitle: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label
      style={{
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr)",
        gap: 12,
        alignItems: "start",
        padding: 12,
        borderRadius: 16,
        border: checked ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
        background: checked ? "#eff6ff" : "white",
        cursor: "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ marginTop: 4 }}
      />
      <div>
        <div style={{ fontWeight: 800, color: THEME.colors.textPrimary }}>{title}</div>
        <div style={{ color: THEME.colors.textSecondary, fontSize: 13, marginTop: 4 }}>
          {subtitle}
        </div>
      </div>
    </label>
  )
}

function EmptyState({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px dashed #cbd5e1",
        background: "#f8fafc",
        padding: 18,
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontWeight: 800, color: THEME.colors.textPrimary }}>{title}</div>
      <div style={{ color: THEME.colors.textSecondary, fontSize: 14 }}>{subtitle}</div>
    </div>
  )
}

function PlayerCard({
  player,
  isAdmin,
  onEdit,
  onRemove,
}: {
  player: Player
  isAdmin: boolean
  onEdit: () => void
  onRemove: () => void
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 20,
        border: "1px solid #e2e8f0",
        background: "white",
        display: "grid",
        gap: 12,
        boxShadow: "0 6px 16px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "58px minmax(0, 1fr) auto",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            background: "linear-gradient(180deg,#ffffff 0%,#dbeafe 100%)",
            border: "1px solid #bfdbfe",
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
            fontSize: 20,
            color: "#1d4ed8",
          }}
        >
          {initials(player.name)}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 18,
              color: THEME.colors.textPrimary,
              lineHeight: 1.15,
            }}
          >
            {player.name}
          </div>
          <div style={{ color: THEME.colors.textSecondary, marginTop: 4, fontSize: 14 }}>
            {player.positions.join(" / ")}
          </div>
        </div>

        <div
          style={{
            color: THEME.colors.textSecondary,
            fontSize: 13,
            fontWeight: 800,
            textAlign: "right",
          }}
        >
          {Math.round((player.seasonSeconds || 0) / 60)} mins
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {player.mainGK ? <Badge tone="blue">Main GK</Badge> : null}
        {player.backupGK ? <Badge tone="blue">Backup GK</Badge> : null}
        {player.captain ? <Badge tone="yellow">Captain</Badge> : null}
        {player.viceCaptain ? <Badge tone="yellow">Vice-Captain</Badge> : null}
        {!player.mainGK && !player.backupGK && !player.captain && !player.viceCaptain ? (
          <Badge tone="default">Squad Player</Badge>
        ) : null}
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
  const totalMinutes = useMemo(
    () => players.reduce((sum, player) => sum + (player.seasonSeconds || 0), 0),
    [players]
  )

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(defaultForm)
  }

  function startEdit(player: Player) {
    setEditingId(player.id)
    setForm({
      name: player.name,
      positions: player.positions,
      mainGK: player.mainGK,
      backupGK: player.backupGK,
      captain: player.captain,
      viceCaptain: player.viceCaptain,
    })
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
      p.id === targetId
        ? {
            ...p,
            name: trimmed,
            positions: form.positions,
            mainGK: form.mainGK,
            backupGK: form.backupGK,
            captain: form.captain,
            viceCaptain: form.viceCaptain,
          }
        : p
    )

    if (!editingId) {
      nextPlayers.push({
        id: targetId,
        name: trimmed,
        positions: form.positions,
        mainGK: form.mainGK,
        backupGK: form.backupGK,
        captain: form.captain,
        viceCaptain: form.viceCaptain,
        seasonSeconds: 0,
      })
    }

    if (form.mainGK) {
      nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, mainGK: false }))
    }
    if (form.backupGK) {
      nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, backupGK: false }))
    }
    if (form.captain) {
      nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, captain: false }))
    }
    if (form.viceCaptain) {
      nextPlayers = nextPlayers.map((p) => (p.id === targetId ? p : { ...p, viceCaptain: false }))
    }

    await onSavePlayers(nextPlayers)
    resetForm()
  }

  async function removePlayer(playerId: string) {
    const ok = window.confirm("Remove this player from the squad?")
    if (!ok) return
    const nextPlayers = players.filter((p) => p.id !== playerId)
    await onSavePlayers(nextPlayers)
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard tone="blue">
        <SectionHeader
          title="Squad Manager"
          subtitle={isAdmin ? "Manage players, positions, goalkeepers and leadership roles." : "View squad details."}
          light
          action={
            isAdmin ? (
              <div style={{ minWidth: 140 }}>
                <PrimaryButton
                  onClick={() => {
                    resetForm()
                    setShowForm(true)
                  }}
                >
                  Add Player
                </PrimaryButton>
              </div>
            ) : undefined
          }
        />
      </PageCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard label="Squad Size" value={players.length} tone="blue" />
        <StatCard label="Main GKs" value={mainGKCount} tone="green" />
        <StatCard label="Captains" value={captainCount} tone="yellow" />
        <StatCard label="Season Minutes" value={Math.round(totalMinutes / 60)} />
      </div>

      {showForm && isAdmin ? (
        <PageCard tone="softBlue">
          <SectionHeader
            title={editingId ? "Edit Player" : "Add Player"}
            subtitle="Update profile, positions and squad roles."
          />

          <div style={{ display: "grid", gap: 14 }}>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Player name"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: 14,
                borderRadius: 16,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                background: "white",
              }}
            />

            <div
              style={{
                padding: 14,
                borderRadius: 18,
                border: "1px solid #dbe3ef",
                background: "white",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900, color: THEME.colors.textPrimary }}>Positions</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ALL_POSITIONS.map((position) => (
                  <ToggleChip
                    key={position}
                    active={form.positions.includes(position)}
                    label={position}
                    onClick={() => togglePosition(position)}
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 18,
                border: "1px solid #dbe3ef",
                background: "white",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900, color: THEME.colors.textPrimary }}>Roles</div>

              <div style={{ display: "grid", gap: 10 }}>
                <RoleToggle
                  checked={form.mainGK}
                  title="Main Goalkeeper"
                  subtitle="Marks this player as the primary goalkeeper."
                  onChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      mainGK: checked,
                      backupGK: checked ? false : prev.backupGK,
                      positions:
                        checked && !prev.positions.includes("GK")
                          ? [...prev.positions, "GK"]
                          : prev.positions,
                    }))
                  }
                />

                <RoleToggle
                  checked={form.backupGK}
                  title="Backup Goalkeeper"
                  subtitle="Used as the secondary goalkeeper option."
                  onChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      backupGK: checked,
                      mainGK: checked ? false : prev.mainGK,
                      positions:
                        checked && !prev.positions.includes("GK")
                          ? [...prev.positions, "GK"]
                          : prev.positions,
                    }))
                  }
                />

                <RoleToggle
                  checked={form.captain}
                  title="Captain"
                  subtitle="Primary team captain."
                  onChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      captain: checked,
                      viceCaptain: checked ? false : prev.viceCaptain,
                    }))
                  }
                />

                <RoleToggle
                  checked={form.viceCaptain}
                  title="Vice-Captain"
                  subtitle="Secondary leadership role."
                  onChange={(checked) =>
                    setForm((prev) => ({
                      ...prev,
                      viceCaptain: checked,
                      captain: checked ? false : prev.captain,
                    }))
                  }
                />
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
        <SectionHeader
          title="Squad List"
          subtitle={`${players.length} player${players.length === 1 ? "" : "s"} in squad`}
        />

        {players.length === 0 ? (
          <EmptyState
            title="No players added yet"
            subtitle="Add your first squad player to start building the team."
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 12,
            }}
          >
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                isAdmin={isAdmin}
                onEdit={() => startEdit(player)}
                onRemove={() => void removePlayer(player.id)}
              />
            ))}
          </div>
        )}
      </PageCard>
    </div>
  )
}
