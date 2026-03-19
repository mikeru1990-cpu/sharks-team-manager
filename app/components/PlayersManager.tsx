"use client"

import { useState } from "react"
import type { PitchPosition, Player } from "../lib/types"
import { ALL_POSITIONS, buttonPrimary, buttonSecondary, cardStyle, initials } from "../lib/types"

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
      <div style={{ ...cardStyle(), display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>Squad Manager</div>
          <div style={{ color: "#64748b", marginTop: 4 }}>
            {isAdmin ? "Admin can edit squad roles and leadership." : "View only mode."}
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            style={buttonPrimary()}
          >
            + Add Player
          </button>
        ) : null}
      </div>

      {showForm && isAdmin ? (
        <div style={cardStyle()}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
            {editingId ? "Edit Player" : "Add Player"}
          </div>

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
              marginBottom: 12,
              fontSize: 16,
            }}
          />

          <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
            {ALL_POSITIONS.map((position) => (
              <label key={position} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="checkbox"
                  checked={form.positions.includes(position)}
                  onChange={() => togglePosition(position)}
                />
                <span style={{ fontWeight: 700 }}>{position}</span>
              </label>
            ))}
          </div>

          <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={form.mainGK}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    mainGK: e.target.checked,
                    backupGK: e.target.checked ? false : prev.backupGK,
                    positions: e.target.checked && !prev.positions.includes("GK") ? [...prev.positions, "GK"] : prev.positions,
                  }))
                }
              />
              <span style={{ fontWeight: 700 }}>Main GK</span>
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
                    positions: e.target.checked && !prev.positions.includes("GK") ? [...prev.positions, "GK"] : prev.positions,
                  }))
                }
              />
              <span style={{ fontWeight: 700 }}>Backup GK</span>
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

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={savePlayer} style={{ ...buttonPrimary(), flex: 1 }}>
              Save
            </button>
            <button onClick={resetForm} style={{ ...buttonSecondary(), flex: 1 }}>
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ display: "grid", gap: 10 }}>
        {players.map((player) => (
          <div
            key={player.id}
            style={{
              ...cardStyle(),
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "linear-gradient(180deg,#ffffff 0%,#dbeafe 100%)",
                display: "grid",
                placeItems: "center",
                fontWeight: 900,
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              {initials(player.name)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 18 }}>{player.name}</div>
              <div style={{ color: "#64748b", marginTop: 4 }}>{player.positions.join("/")}</div>
              <div style={{ marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {player.mainGK ? <span style={{ fontSize: 12, fontWeight: 900 }}>MAIN GK</span> : null}
                {player.backupGK ? <span style={{ fontSize: 12, fontWeight: 900 }}>BACKUP GK</span> : null}
                {player.captain ? <span style={{ fontSize: 12, fontWeight: 900 }}>C</span> : null}
                {player.viceCaptain ? <span style={{ fontSize: 12, fontWeight: 900 }}>VC</span> : null}
              </div>
            </div>

            {isAdmin ? (
              <>
                <button onClick={() => startEdit(player)} style={buttonSecondary()}>
                  Edit
                </button>
                <button
                  onClick={() => removePlayer(player.id)}
                  style={{
                    ...buttonSecondary(),
                    color: "#b91c1c",
                    border: "1px solid #fecaca",
                    background: "#fff1f2",
                  }}
                >
                  Remove
                </button>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
