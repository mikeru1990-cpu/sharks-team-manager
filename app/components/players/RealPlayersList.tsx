"use client"

import { useEffect, useMemo, useState } from "react"
import { getPlayersForTeam } from "../../lib/realTeamData"
import { getPlayerRole, getPlayerRoleLabel } from "../../lib/playerRoles"

const storageKey = "football-os-u11-squad-v1"
const basePlayers = getPlayersForTeam("U11 Girls")

type SquadPlayer = {
  id: string
  name: string
  knownAs?: string
  primary: string
  secondary: string
  positionGroup: string
  matchRole: string
  shirtNumber: string
  parentContact: string
  medicalNotes: string
  developmentNotes: string
  status: "Active" | "Unavailable" | "Trial" | "Archived"
}

function toSquadPlayer(player: (typeof basePlayers)[number], index: number): SquadPlayer {
  const role = getPlayerRole(player.id)
  return {
    id: player.id,
    name: player.name,
    knownAs: player.knownAs,
    primary: role.primary,
    secondary: role.secondary ?? "",
    positionGroup: role.positionGroup,
    matchRole: role.matchRole,
    shirtNumber: `${index + 1}`,
    parentContact: "",
    medicalNotes: "",
    developmentNotes: player.notes ?? "",
    status: "Active",
  }
}

function createBlankPlayer(): SquadPlayer {
  const id = `player-${Date.now()}`
  return {
    id,
    name: "New Player",
    knownAs: "",
    primary: "Role TBC",
    secondary: "",
    positionGroup: "TBC",
    matchRole: "TBC",
    shirtNumber: "",
    parentContact: "",
    medicalNotes: "",
    developmentNotes: "",
    status: "Active",
  }
}

export default function RealPlayersList() {
  const [players, setPlayers] = useState<SquadPlayer[]>(basePlayers.map(toSquadPlayer))
  const [selectedId, setSelectedId] = useState<string | null>(basePlayers[0]?.id ?? null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const saved = JSON.parse(raw) as SquadPlayer[]
        if (Array.isArray(saved) && saved.length) {
          setPlayers(saved)
          setSelectedId(saved[0].id)
        }
      }
    } catch {}
  }, [])

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(players))
  }, [players])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return players
    return players.filter((player) => `${player.name} ${player.knownAs ?? ""} ${player.primary} ${player.secondary}`.toLowerCase().includes(term))
  }, [players, query])

  const selected = players.find((player) => player.id === selectedId) ?? players[0]

  function updatePlayer(id: string, patch: Partial<SquadPlayer>) {
    setPlayers((current) => current.map((player) => player.id === id ? { ...player, ...patch } : player))
  }

  function addPlayer() {
    const player = createBlankPlayer()
    setPlayers((current) => [player, ...current])
    setSelectedId(player.id)
  }

  function deletePlayer(id: string) {
    setPlayers((current) => {
      const next = current.filter((player) => player.id !== id)
      setSelectedId(next[0]?.id ?? null)
      return next
    })
  }

  function restoreRealSquad() {
    const restored = basePlayers.map(toSquadPlayer)
    setPlayers(restored)
    setSelectedId(restored[0]?.id ?? null)
    window.localStorage.setItem(storageKey, JSON.stringify(restored))
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section style={heroPanel}>
        <div>
          <div style={eyebrow}>SQUAD MANAGER</div>
          <h1 style={{ margin: "6px 0 4px", fontSize: 32, letterSpacing: -1.1 }}>U11 Girls Players</h1>
          <p style={muted}>Edit player profiles, positions, shirt numbers, parent contact, notes and match roles.</p>
        </div>
        <button type="button" onClick={addPlayer} style={primaryButton}>+ Add Player</button>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }}>
        <Summary label="Players" value={players.length.toString()} />
        <Summary label="Active" value={players.filter((player) => player.status === "Active").length.toString()} />
        <Summary label="GK" value={players.filter((player) => player.matchRole === "GK").length.toString()} />
        <Summary label="Roles" value="Editable" />
      </div>

      <section style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search players or positions..." style={input} />
          <button type="button" onClick={restoreRealSquad} style={secondaryButton}>Restore real squad</button>
        </div>
      </section>

      <div style={{ display: "grid", gap: 14 }}>
        <section style={panel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>Squad list</h2>
            <div style={pill}>{filtered.length} shown</div>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {filtered.map((player) => (
              <button key={player.id} type="button" onClick={() => setSelectedId(player.id)} style={selected?.id === player.id ? activeCardButton : cardButton}>
                <div style={avatar}>{player.shirtNumber || shortInitials(player.name)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 950 }}>{player.name}</div>
                  <div style={{ marginTop: 4, color: "rgba(226,232,240,0.68)", fontWeight: 800 }}>{player.primary}{player.secondary ? ` / ${player.secondary}` : ""}</div>
                </div>
                <div style={roleBadge}>{player.matchRole}</div>
              </button>
            ))}
          </div>
        </section>

        {selected && (
          <section style={editorPanel}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
              <div>
                <div style={eyebrow}>PLAYER PROFILE</div>
                <h2 style={{ margin: "6px 0 0", fontSize: 28 }}>{selected.name}</h2>
                <p style={muted}>{selected.primary}{selected.secondary ? ` / ${selected.secondary}` : ""} · {selected.matchRole}</p>
              </div>
              <button type="button" onClick={() => deletePlayer(selected.id)} style={dangerButton}>Delete</button>
            </div>

            <div style={formGrid}>
              <Field label="Full name" value={selected.name} onChange={(value) => updatePlayer(selected.id, { name: value })} />
              <Field label="Known as" value={selected.knownAs ?? ""} onChange={(value) => updatePlayer(selected.id, { knownAs: value })} />
              <Field label="Shirt number" value={selected.shirtNumber} onChange={(value) => updatePlayer(selected.id, { shirtNumber: value })} />
              <SelectField label="Status" value={selected.status} options={["Active", "Unavailable", "Trial", "Archived"]} onChange={(value) => updatePlayer(selected.id, { status: value as SquadPlayer["status"] })} />
              <SelectField label="Primary position" value={selected.primary} options={["Goalkeeper", "Defender", "Midfielder", "Winger", "Forward", "Utility", "Role TBC"]} onChange={(value) => updatePlayer(selected.id, { primary: value })} />
              <Field label="Secondary position" value={selected.secondary} onChange={(value) => updatePlayer(selected.id, { secondary: value })} />
              <SelectField label="Position group" value={selected.positionGroup} options={["Goalkeeper", "Defender", "Midfielder", "Forward", "TBC"]} onChange={(value) => updatePlayer(selected.id, { positionGroup: value })} />
              <SelectField label="Match role" value={selected.matchRole} options={["GK", "DEF", "CM", "MID", "WING", "ST", "FWD", "TBC"]} onChange={(value) => updatePlayer(selected.id, { matchRole: value })} />
            </div>

            <div style={formGridWide}>
              <TextArea label="Parent contact" value={selected.parentContact} onChange={(value) => updatePlayer(selected.id, { parentContact: value })} />
              <TextArea label="Medical notes" value={selected.medicalNotes} onChange={(value) => updatePlayer(selected.id, { medicalNotes: value })} />
              <TextArea label="Development notes" value={selected.developmentNotes} onChange={(value) => updatePlayer(selected.id, { developmentNotes: value })} />
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div style={panel}><div style={{ color: "rgba(226,232,240,0.62)", fontSize: 12, fontWeight: 900 }}>{label}</div><div style={{ marginTop: 8, fontSize: 28, fontWeight: 950 }}>{value}</div></div>
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label style={labelStyle}><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} style={input} /></label>
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <label style={labelStyle}><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} style={input}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label style={labelStyle}><span>{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} style={{ ...input, minHeight: 92, resize: "vertical" as const }} /></label>
}

function shortInitials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
}

const heroPanel = { borderRadius: 28, padding: 18, background: "linear-gradient(135deg, rgba(37,99,235,0.42), rgba(15,23,42,0.94))", border: "1px solid rgba(147,197,253,0.2)", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }
const panel = { borderRadius: 24, padding: 16, background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.14)" }
const editorPanel = { borderRadius: 28, padding: 18, background: "rgba(15,23,42,0.92)", border: "1px solid rgba(147,197,253,0.18)", boxShadow: "0 20px 44px rgba(0,0,0,0.2)" }
const eyebrow = { fontSize: 11, letterSpacing: 1, fontWeight: 950, color: "#bfdbfe" }
const muted = { margin: "6px 0 0", color: "rgba(226,232,240,0.68)", lineHeight: 1.45, fontWeight: 750 }
const pill = { borderRadius: 999, padding: "7px 10px", background: "rgba(37,99,235,0.18)", color: "#bfdbfe", fontSize: 11, fontWeight: 950 }
const primaryButton = { border: "1px solid rgba(191,219,254,0.24)", borderRadius: 18, padding: "12px 14px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", fontWeight: 950, cursor: "pointer" }
const secondaryButton = { border: "1px solid rgba(147,197,253,0.16)", borderRadius: 18, padding: "12px 14px", background: "rgba(15,23,42,0.74)", color: "white", fontWeight: 950, cursor: "pointer" }
const dangerButton = { ...secondaryButton, background: "rgba(127,29,29,0.42)", border: "1px solid rgba(248,113,113,0.2)" }
const cardButton = { width: "100%", border: "1px solid rgba(148,163,184,0.12)", borderRadius: 20, padding: 12, background: "rgba(2,6,23,0.44)", color: "white", display: "grid", gridTemplateColumns: "52px 1fr auto", gap: 12, alignItems: "center", textAlign: "left" as const, cursor: "pointer" }
const activeCardButton = { ...cardButton, background: "rgba(37,99,235,0.2)", border: "1px solid rgba(147,197,253,0.3)" }
const avatar = { width: 52, height: 52, borderRadius: 18, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#2563eb,#7c3aed)", fontWeight: 950 }
const roleBadge = { borderRadius: 999, padding: "7px 9px", background: "rgba(2,6,23,0.58)", color: "#bfdbfe", fontSize: 11, fontWeight: 950 }
const formGrid = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginTop: 16 }
const formGridWide = { display: "grid", gap: 12, marginTop: 12 }
const labelStyle = { display: "grid", gap: 6, color: "rgba(226,232,240,0.7)", fontSize: 12, fontWeight: 900 }
const input = { width: "100%", border: "1px solid rgba(148,163,184,0.16)", borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.62)", color: "white", fontWeight: 850, outline: "none" }
