"use client"

import { useEffect, useMemo, useState } from "react"
import { getPlayersForTeam } from "../../lib/realTeamData"
import { getPlayerRole } from "../../lib/playerRoles"

const storageKey = "football-os-u11-squad-v2"
const basePlayers = getPlayersForTeam("U11 Girls")

const primaryPositions = ["GK", "CB", "LDEF", "RDEF", "DM", "CM", "LM", "RM", "AM", "LW", "RW", "ST", "UTIL", "TBC"]
const responsibilities = ["Main Goalkeeper", "Backup Goalkeeper", "Captain", "Vice-Captain", "Set Pieces", "Squad Player"]
const availabilityOptions = ["Available", "Doubtful", "Injured", "Unavailable"]

type Availability = typeof availabilityOptions[number]
type SquadPlayer = {
  id: string
  name: string
  knownAs?: string
  primaryPosition: string
  secondaryPositions: string[]
  responsibilities: string[]
  availability: Availability
  shirtNumber: string
  parentContact: string
  medicalNotes: string
  developmentNotes: string
}

const roleSeed: Record<string, Partial<SquadPlayer>> = {
  "darcy-rae-russell": { primaryPosition: "GK", secondaryPositions: ["CB"], responsibilities: ["Main Goalkeeper"] },
  "betsy-rowland": { primaryPosition: "CB", secondaryPositions: ["LDEF", "RDEF"], responsibilities: ["Squad Player"] },
  "poppy-bennett": { primaryPosition: "ST", secondaryPositions: ["RW", "LW"], responsibilities: ["Squad Player"] },
  "martha-scrivens": { primaryPosition: "ST", secondaryPositions: ["AM"], responsibilities: ["Squad Player"] },
  "isabella-ogden": { primaryPosition: "CM", secondaryPositions: ["AM", "RM"], responsibilities: ["Squad Player"] },
  "olivia-hassall": { primaryPosition: "CM", secondaryPositions: ["DM"], responsibilities: ["Squad Player"] },
  "ella-wilson": { primaryPosition: "RW", secondaryPositions: ["LW", "ST"], responsibilities: ["Squad Player"] },
  "bella-bainbridge": { primaryPosition: "CB", secondaryPositions: ["DM"], responsibilities: ["Squad Player"] },
  "ruby-salter": { primaryPosition: "CM", secondaryPositions: ["RW"], responsibilities: ["Squad Player"] },
  "connie-luff": { primaryPosition: "CB", secondaryPositions: ["CM"], responsibilities: ["Squad Player"] },
  "lyra-twinning": { primaryPosition: "TBC", secondaryPositions: [], responsibilities: ["Squad Player"] },
}

function toSquadPlayer(player: (typeof basePlayers)[number], index: number): SquadPlayer {
  const previousRole = getPlayerRole(player.id)
  const seeded = roleSeed[player.id]
  return {
    id: player.id,
    name: player.name,
    knownAs: player.knownAs,
    primaryPosition: seeded?.primaryPosition ?? previousRole.matchRole ?? "TBC",
    secondaryPositions: seeded?.secondaryPositions ?? [],
    responsibilities: seeded?.responsibilities ?? [previousRole.isGoalkeeper ? "Main Goalkeeper" : "Squad Player"],
    availability: "Available",
    shirtNumber: `${index + 1}`,
    parentContact: "",
    medicalNotes: "",
    developmentNotes: player.notes ?? "",
  }
}

function createBlankPlayer(): SquadPlayer {
  return {
    id: `player-${Date.now()}`,
    name: "New Player",
    knownAs: "",
    primaryPosition: "TBC",
    secondaryPositions: [],
    responsibilities: ["Squad Player"],
    availability: "Available",
    shirtNumber: "",
    parentContact: "",
    medicalNotes: "",
    developmentNotes: "",
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
    return players.filter((player) => `${player.name} ${player.knownAs ?? ""} ${player.primaryPosition} ${player.secondaryPositions.join(" ")} ${player.responsibilities.join(" ")}`.toLowerCase().includes(term))
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

  function toggleSecondary(id: string, position: string) {
    const player = players.find((item) => item.id === id)
    if (!player) return
    const next = player.secondaryPositions.includes(position)
      ? player.secondaryPositions.filter((item) => item !== position)
      : [...player.secondaryPositions, position]
    updatePlayer(id, { secondaryPositions: next })
  }

  function toggleResponsibility(id: string, responsibility: string) {
    const player = players.find((item) => item.id === id)
    if (!player) return
    const next = player.responsibilities.includes(responsibility)
      ? player.responsibilities.filter((item) => item !== responsibility)
      : [...player.responsibilities.filter((item) => item !== "Squad Player"), responsibility]
    updatePlayer(id, { responsibilities: next.length ? next : ["Squad Player"] })
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section style={heroPanel}>
        <div>
          <div style={eyebrow}>SQUAD MANAGER</div>
          <h1 style={{ margin: "6px 0 4px", fontSize: 32, letterSpacing: -1.1 }}>U11 Girls Players</h1>
          <p style={muted}>Older squad feel restored, with improved editable football roles.</p>
        </div>
        <button type="button" onClick={addPlayer} style={primaryButton}>+ Add</button>
      </section>

      <div style={summaryGrid}>
        <Summary label="Players" value={players.length.toString()} />
        <Summary label="Available" value={players.filter((player) => player.availability === "Available").length.toString()} />
        <Summary label="GK" value={players.filter((player) => player.responsibilities.includes("Main Goalkeeper") || player.primaryPosition === "GK").length.toString()} />
        <Summary label="Positions" value="Editable" />
      </div>

      <section style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search players, positions or roles..." style={input} />
          <button type="button" onClick={restoreRealSquad} style={secondaryButton}>Restore real squad</button>
        </div>
      </section>

      <section style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Squad cards</h2>
          <div style={pill}>{filtered.length} shown</div>
        </div>
        <div style={cardGrid}>
          {filtered.map((player) => (
            <article key={player.id} style={selected?.id === player.id ? activePlayerCard : playerCard}>
              <button type="button" onClick={() => setSelectedId(player.id)} style={cardMainButton}>
                <div style={avatar}>{player.shirtNumber || shortInitials(player.name)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 19, fontWeight: 950 }}>{player.name}</div>
                  <div style={{ marginTop: 4, color: "rgba(226,232,240,0.72)", fontWeight: 850 }}>{positionLine(player)}</div>
                </div>
                <div style={roleBadge}>{player.primaryPosition}</div>
              </button>
              <div style={badgeRow}>
                {player.responsibilities.slice(0, 3).map((item) => <span key={item} style={blueBadge}>{item}</span>)}
                <span style={player.availability === "Available" ? greenBadge : amberBadge}>{player.availability}</span>
              </div>
              <div style={cardActions}>
                <button type="button" onClick={() => setSelectedId(player.id)} style={editButton}>Edit</button>
                <button type="button" onClick={() => deletePlayer(player.id)} style={removeButton}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {selected && (
        <section style={editorPanel}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div>
              <div style={eyebrow}>EDIT PLAYER</div>
              <h2 style={{ margin: "6px 0 0", fontSize: 28 }}>{selected.name}</h2>
              <p style={muted}>{positionLine(selected)} · {selected.responsibilities.join(" / ")}</p>
            </div>
            <button type="button" onClick={() => deletePlayer(selected.id)} style={dangerButton}>Delete</button>
          </div>

          <div style={formGrid}>
            <Field label="Full name" value={selected.name} onChange={(value) => updatePlayer(selected.id, { name: value })} />
            <Field label="Known as" value={selected.knownAs ?? ""} onChange={(value) => updatePlayer(selected.id, { knownAs: value })} />
            <Field label="Shirt number" value={selected.shirtNumber} onChange={(value) => updatePlayer(selected.id, { shirtNumber: value })} />
            <SelectField label="Availability" value={selected.availability} options={availabilityOptions} onChange={(value) => updatePlayer(selected.id, { availability: value as Availability })} />
            <SelectField label="Primary position" value={selected.primaryPosition} options={primaryPositions} onChange={(value) => updatePlayer(selected.id, { primaryPosition: value })} />
          </div>

          <div style={{ marginTop: 16 }}>
            <EditorTitle title="Secondary positions" subtitle="Select every position this player can realistically cover." />
            <ChipPicker options={primaryPositions.filter((item) => item !== selected.primaryPosition)} selected={selected.secondaryPositions} onToggle={(value) => toggleSecondary(selected.id, value)} />
          </div>

          <div style={{ marginTop: 16 }}>
            <EditorTitle title="Team responsibilities" subtitle="Responsibilities are separate from positions." />
            <ChipPicker options={responsibilities} selected={selected.responsibilities} onToggle={(value) => toggleResponsibility(selected.id, value)} />
          </div>

          <div style={formGridWide}>
            <TextArea label="Parent contact" value={selected.parentContact} onChange={(value) => updatePlayer(selected.id, { parentContact: value })} />
            <TextArea label="Medical notes" value={selected.medicalNotes} onChange={(value) => updatePlayer(selected.id, { medicalNotes: value })} />
            <TextArea label="Development notes" value={selected.developmentNotes} onChange={(value) => updatePlayer(selected.id, { developmentNotes: value })} />
          </div>
        </section>
      )}
    </div>
  )
}

function positionLine(player: SquadPlayer) {
  const secondary = player.secondaryPositions.filter(Boolean)
  return secondary.length ? `${player.primaryPosition} / ${secondary.join(" / ")}` : player.primaryPosition
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div style={panel}><div style={{ color: "rgba(226,232,240,0.62)", fontSize: 12, fontWeight: 900 }}>{label}</div><div style={{ marginTop: 8, fontSize: 28, fontWeight: 950 }}>{value}</div></div>
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label style={labelStyle}><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} style={input} /></label>
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <label style={labelStyle}><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)} style={input}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label style={labelStyle}><span>{label}</span><textarea value={value} onChange={(event) => onChange(event.target.value)} style={{ ...input, minHeight: 92, resize: "vertical" as const }} /></label>
}

function EditorTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div style={{ marginBottom: 10 }}><h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3><p style={muted}>{subtitle}</p></div>
}

function ChipPicker({ options, selected, onToggle }: { options: readonly string[]; selected: string[]; onToggle: (value: string) => void }) {
  return <div style={chipGrid}>{options.map((option) => <button key={option} type="button" onClick={() => onToggle(option)} style={selected.includes(option) ? activeChip : chip}>{option}</button>)}</div>
}

function shortInitials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
}

const heroPanel = { borderRadius: 28, padding: 18, background: "linear-gradient(135deg, rgba(37,99,235,0.48), rgba(15,23,42,0.94))", border: "1px solid rgba(147,197,253,0.2)", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }
const panel = { borderRadius: 24, padding: 16, background: "rgba(15,23,42,0.88)", border: "1px solid rgba(148,163,184,0.14)" }
const editorPanel = { borderRadius: 28, padding: 18, background: "rgba(15,23,42,0.92)", border: "1px solid rgba(147,197,253,0.18)", boxShadow: "0 20px 44px rgba(0,0,0,0.2)" }
const eyebrow = { fontSize: 11, letterSpacing: 1, fontWeight: 950, color: "#bfdbfe" }
const muted = { margin: "6px 0 0", color: "rgba(226,232,240,0.68)", lineHeight: 1.45, fontWeight: 750 }
const pill = { borderRadius: 999, padding: "7px 10px", background: "rgba(37,99,235,0.18)", color: "#bfdbfe", fontSize: 11, fontWeight: 950 }
const summaryGrid = { display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", gap: 10 }
const cardGrid = { display: "grid", gap: 12 }
const primaryButton = { border: "1px solid rgba(191,219,254,0.24)", borderRadius: 18, padding: "12px 14px", background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", fontWeight: 950, cursor: "pointer" }
const secondaryButton = { border: "1px solid rgba(147,197,253,0.16)", borderRadius: 18, padding: "12px 14px", background: "rgba(15,23,42,0.74)", color: "white", fontWeight: 950, cursor: "pointer" }
const dangerButton = { ...secondaryButton, background: "rgba(127,29,29,0.42)", border: "1px solid rgba(248,113,113,0.2)" }
const playerCard = { borderRadius: 22, padding: 14, background: "linear-gradient(135deg, rgba(37,99,235,0.22), rgba(2,6,23,0.58))", border: "1px solid rgba(147,197,253,0.14)", display: "grid", gap: 10 }
const activePlayerCard = { ...playerCard, background: "linear-gradient(135deg, rgba(37,99,235,0.36), rgba(15,23,42,0.7))", border: "1px solid rgba(147,197,253,0.34)" }
const cardMainButton = { width: "100%", border: 0, padding: 0, background: "transparent", color: "white", display: "grid", gridTemplateColumns: "52px 1fr auto", gap: 12, alignItems: "center", textAlign: "left" as const, cursor: "pointer" }
const avatar = { width: 52, height: 52, borderRadius: 18, display: "grid", placeItems: "center", background: "linear-gradient(135deg,#2563eb,#7c3aed)", fontWeight: 950 }
const roleBadge = { borderRadius: 999, padding: "7px 9px", background: "rgba(2,6,23,0.58)", color: "#bfdbfe", fontSize: 11, fontWeight: 950 }
const badgeRow = { display: "flex", flexWrap: "wrap" as const, gap: 7 }
const blueBadge = { borderRadius: 999, padding: "7px 9px", background: "rgba(37,99,235,0.2)", color: "#bfdbfe", fontSize: 11, fontWeight: 900 }
const greenBadge = { ...blueBadge, background: "rgba(22,101,52,0.32)", color: "#86efac" }
const amberBadge = { ...blueBadge, background: "rgba(120,53,15,0.38)", color: "#fde68a" }
const cardActions = { display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }
const editButton = { ...primaryButton, padding: "10px 12px" }
const removeButton = { ...dangerButton, padding: "10px 12px" }
const formGrid = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, marginTop: 16 }
const formGridWide = { display: "grid", gap: 12, marginTop: 16 }
const labelStyle = { display: "grid", gap: 6, color: "rgba(226,232,240,0.7)", fontSize: 12, fontWeight: 900 }
const input = { width: "100%", border: "1px solid rgba(148,163,184,0.16)", borderRadius: 16, padding: 12, background: "rgba(2,6,23,0.62)", color: "white", fontWeight: 850, outline: "none" }
const chipGrid = { display: "flex", flexWrap: "wrap" as const, gap: 8 }
const chip = { border: "1px solid rgba(148,163,184,0.18)", borderRadius: 999, padding: "9px 11px", background: "rgba(2,6,23,0.5)", color: "rgba(226,232,240,0.78)", fontWeight: 900, cursor: "pointer" }
const activeChip = { ...chip, background: "rgba(37,99,235,0.32)", color: "white", border: "1px solid rgba(147,197,253,0.34)" }
