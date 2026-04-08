"use client"

import { useState } from "react"
import type { PitchPosition, Player } from "../lib/types"
import { ALL_POSITIONS, initials } from "../lib/types"
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

export default function PlayersManager({ players, isAdmin, onSavePlayers }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<{
    name: string
    positions: PitchPosition[]
    mainGK: boolean
    backupGK: boolean
    captain: boolean
    viceCaptain: boolean
  }>({
    name: "",
    positions: ["MID"],
    mainGK: false,
    backupGK: false,
    captain: false,
    viceCaptain: false,
  })

  function resetForm() {
    setShowForm(false)
    setEditingId(null)
    setForm({
      name: "",
      positions: ["MID"],
      mainGK: false,
      backupGK: false,
      captain: false,
      viceCaptain: false,
    })
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
      alert("Player name required")
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
    const nextPlayers = players.filter((p) => p.id !== playerId)
    await onSavePlayers(nextPlayers)
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard>
        <SectionHeader
          title="Squad Manager"
          subtitle={
            isAdmin
              ? "Manage players, positions, goalkeepers and leadership roles."
              : "View squad details."
          }
          action={
            isAdmin ? (
              <PrimaryButton
                onClick={() => {
                  resetForm()
                  setShowForm(true)
                }}
              >
                Add Player
              </PrimaryButton>
            ) : undefined
          }
        />
      </PageCard>

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
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                background: "white",
              }}
            />

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                border: "1px solid #dbe3ef",
                background: "white",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900 }}>Positions</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ALL_POSITIONS.map((position) => {
                  const active = form.positions.includes(position)

                  return (
                    <button
                      key={position}
                      onClick={() => togglePosition(position)}
                      style={{
                        border: active ? "1px solid #bfdbfe" : "1px solid #cbd5e1",
                        background: active ? "#dbeafe" : "white",
                        color: active ? "#1e3a8a" : "#0f172a",
                        borderRadius: 999,
                        padding: "8px 12px",
                        fontWeight: 800,
                      }}
                    >
                      {position}
                    </button>
                  )
                })}
              </div>
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                border: "1px solid #dbe3ef",
                background: "white",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900 }}>Roles</div>

              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form.mainGK}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      mainGK: e.target.checked,
                      backupGK: e.target.checked ? false : prev.backupGK,
                      positions:
                        e.target.checked && !prev.positions.includes("GK")
                          ? [...prev.positions, "GK"]
                          : prev.positions,
                    }))
                  }
                />
                <span style={{ fontWeight: 700 }}>Main Goalkeeper</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form.backupGK}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      backupGK: e.target.checked,
                      mainGK: e.target.checked ? false : prev.mainGK,
                      positions:
                        e.target.checked && !prev.positions.includes("GK")
                          ? [...prev.positions, "GK"]
                          : prev.positions,
                    }))
                  }
                />
                <span style={{ fontWeight: 700 }}>Backup Goalkeeper</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form.captain}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      captain: e.target.checked,
                      viceCaptain: e.target.checked ? false : prev.viceCaptain,
                    }))
                  }
                />
                <span style={{ fontWeight: 700 }}>Captain</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form.viceCaptain}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      viceCaptain: e.target.checked,
                      captain: e.target.checked ? false : prev.captain,
                    }))
                  }
                />
                <span style={{ fontWeight: 700 }}>Vice-Captain</span>
              </label>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <PrimaryButton onClick={() => void savePlayer()}>
                Save Player
              </PrimaryButton>
              <SecondaryButton onClick={resetForm}>
                Cancel
              </SecondaryButton>
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
          <div style={{ color: "#64748b" }}>No players added yet.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {players.map((player) => (
              <div
                key={player.id}
                style={{
                  padding: 14,
                  borderRadius: 18,
                  border: "1px solid #e2e8f0",
                  background: "white",
                  display: "grid",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "56px minmax(0, 1fr) auto",
                    gap: 12,
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 56,
                      height: 56,
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
                    <div style={{ fontWeight: 900, fontSize: 18, color: "#0f172a" }}>
                      {player.name}
                    </div>
                    <div style={{ color: "#64748b", marginTop: 4 }}>
                      {player.positions.join(" / ")}
                    </div>
                  </div>

                  <div style={{ color: "#64748b", fontSize: 13, fontWeight: 800 }}>
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
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <SecondaryButton onClick={() => startEdit(player)}>
                      Edit
                    </SecondaryButton>
                    <DangerButton onClick={() => void removePlayer(player.id)}>
                      Remove
                    </DangerButton>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </PageCard>
    </div>
  )
}
