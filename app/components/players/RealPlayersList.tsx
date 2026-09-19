"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  createSquadPlayer,
  getDefaultSquadPlayers,
  loadSquadPlayers,
  positionLine,
  saveSquadPlayers,
  subscribeSquadPlayers,
  type SquadAvailability,
  type SquadStorePlayer,
} from "../../lib/squadStore"
import { useTeamAccess } from "../system/TeamAccessProvider"
import { previewMode } from "../../lib/runtimeConfig"
import { useSquadCloudStatus } from "../../lib/squadCloud"

const primaryPositions = ["GK", "CB", "LDEF", "RDEF", "DM", "CM", "LM", "RM", "AM", "LW", "RW", "ST", "UTIL", "TBC"]
const responsibilities = ["Main Goalkeeper", "Backup Goalkeeper", "Captain", "Vice-Captain", "Set Pieces", "Squad Player"]
const availabilityOptions: SquadAvailability[] = ["Available", "Doubtful", "Injured", "Unavailable"]
const basePlayers = getDefaultSquadPlayers()

export default function RealPlayersList() {
  const cloud = useSquadCloudStatus()
  const { activeTeam } = useTeamAccess()
  const editorRef = useRef<HTMLElement>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const readOnly = !activeTeam?.canManage || (!previewMode && !cloud.canManage)
  const [players, setPlayers] = useState<SquadStorePlayer[]>(basePlayers)
  const [selectedId, setSelectedId] = useState<string | null>(basePlayers[0]?.id ?? null)
  const [query, setQuery] = useState("")
  const [hydrated, setHydrated] = useState(false)
  const externalUpdate = useRef(false)

  useEffect(() => {
    const saved = loadSquadPlayers()
    setPlayers(saved)
    setSelectedId(saved[0]?.id ?? null)
    setHydrated(true)
  }, [])

  useEffect(() => {
    return subscribeSquadPlayers((next) => {
      setPlayers((current) => {
        if (JSON.stringify(current) === JSON.stringify(next)) return current
        externalUpdate.current = true
        return next
      })
    })
  }, [])

  useEffect(() => {
    if (!hydrated || readOnly) return
    if (externalUpdate.current) {
      externalUpdate.current = false
      return
    }
    saveSquadPlayers(players)
  }, [hydrated, players, readOnly])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return players
    return players.filter((player) => `${player.name} ${player.knownAs ?? ""} ${player.primaryPosition} ${player.secondaryPositions.join(" ")} ${player.responsibilities.join(" ")}`.toLowerCase().includes(term))
  }, [players, query])

  const selected = players.find((player) => player.id === selectedId)

  useEffect(() => {
    if (editorOpen && selectedId) {
      editorRef.current?.scrollIntoView({ block: "start", behavior: "smooth" })
      editorRef.current?.focus({ preventScroll: true })
    }
  }, [editorOpen, selectedId])

  function openPlayer(id: string) {
    setSelectedId(id)
    setEditorOpen(true)
  }

  function updatePlayer(id: string, patch: Partial<SquadStorePlayer>) {
    if (readOnly) return
    setPlayers((current) => current.map((player) => player.id === id ? { ...player, ...patch } : player))
  }

  function addPlayer() {
    if (readOnly) return
    const player = createSquadPlayer()
    setPlayers((current) => [player, ...current])
    openPlayer(player.id)
  }

  function deletePlayer(id: string) {
    if (readOnly) return
    const player = players.find(item => item.id === id)
    if (!window.confirm(`Remove ${player?.name || "this player"} from the squad?`)) return
    setEditorOpen(false)
    setPlayers((current) => {
      const next = current.filter((player) => player.id !== id)
      setSelectedId(next[0]?.id ?? null)
      return next
    })
  }

  function restoreRealSquad() {
    if (readOnly || !previewMode || !window.confirm("Replace this preview squad with the sample players?")) return
    const restored = getDefaultSquadPlayers()
    setPlayers(restored)
    setSelectedId(restored[0]?.id ?? null)
    saveSquadPlayers(restored)
  }

  function toggleSecondary(id: string, position: string) {
    if (readOnly) return
    const player = players.find((item) => item.id === id)
    if (!player) return
    const next = player.secondaryPositions.includes(position)
      ? player.secondaryPositions.filter((item) => item !== position)
      : [...player.secondaryPositions, position]
    updatePlayer(id, { secondaryPositions: next })
  }

  function toggleResponsibility(id: string, responsibility: string) {
    if (readOnly) return
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
          <div style={eyebrow}>YOUR TEAM</div>
          <h1 style={{ margin: "6px 0 4px", fontSize: 32, letterSpacing: -1.1 }}>{activeTeam?.teamName ?? "Team"}</h1>
          <p style={muted}>{readOnly ? "Team-scoped squad view. Editing is restricted to coaching staff." : "Find a player, update their details or check their usual positions."}</p>
        </div>
        {!readOnly && <button type="button" onClick={addPlayer} style={primaryButton}>+ Add</button>}
      </section>

      <div style={summaryGrid}>
        <Summary label="Players" value={players.length.toString()} />
        <Summary label="Generally available" value={players.filter((player) => player.availability === "Available").length.toString()} />
        <Summary label="GK" value={players.filter((player) => player.responsibilities.includes("Main Goalkeeper") || player.primaryPosition === "GK").length.toString()} />
        <Summary label="Positions" value={readOnly ? "View only" : "Editable"} />
      </div>

      <section style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input aria-label="Search players" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search players, positions or roles..." style={input} />
          {previewMode && !readOnly && <button type="button" onClick={restoreRealSquad} style={secondaryButton}>Reset preview squad</button>}
        </div>
      </section>

      <section style={panel}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Squad</h2>
          <div style={pill}>{filtered.length} shown</div>
        </div>
        <div style={cardGrid}>
          {filtered.length === 0 && <p role="status" style={muted}>{players.length ? "No players match your search." : "No players added yet."}</p>}
          {filtered.map((player) => (
            <article key={player.id} style={selected?.id === player.id ? activePlayerCard : playerCard}>
              <button type="button" onClick={() => openPlayer(player.id)} style={cardMainButton}>
                <div style={avatar}>{player.shirtNumber || shortInitials(player.name)}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 19, fontWeight: 950 }}>{player.name}</div>
                  <div style={{ marginTop: 4, color: "#526176", fontWeight: 850 }}>{positionLine(player)}</div>
                </div>
                <div style={roleBadge}>{player.primaryPosition}</div>
              </button>
              <div style={badgeRow}>
                {player.responsibilities.slice(0, 3).map((item) => <span key={item} style={blueBadge}>{item}</span>)}
                <span style={player.availability === "Available" ? greenBadge : amberBadge}>{player.availability}</span>
              </div>
              <div style={cardActions}>
                <button type="button" onClick={() => openPlayer(player.id)} style={editButton}>{readOnly ? "View" : "Edit"}</button>
                {!readOnly && <button type="button" onClick={() => deletePlayer(player.id)} style={removeButton}>Remove</button>}
              </div>
            </article>
          ))}
        </div>
      </section>

      {selected && editorOpen && (
        <section ref={editorRef} tabIndex={-1} aria-label="Player details" style={{ ...editorPanel, scrollMarginTop: 90 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
            <div>
              <div style={eyebrow}>{readOnly ? "PLAYER DETAILS" : "EDIT PLAYER"}</div>
              <h2 style={{ margin: "6px 0 0", fontSize: 28 }}>{selected.name}</h2>
              <p style={muted}>{positionLine(selected)} · {selected.responsibilities.join(" / ")}</p>
            </div>
            <button type="button" onClick={() => setEditorOpen(false)} style={secondaryButton}>Close</button>
          </div>

          {readOnly ? <p style={muted}>{selected.availability} · Shirt number: {selected.shirtNumber || "Not set"}</p> : <>
          <p style={muted}>General availability is separate from responses to individual events in Schedule.</p>
          <div style={formGrid}>
            <Field label="Full name" value={selected.name} onChange={(value) => updatePlayer(selected.id, { name: value })} />
            <Field label="Known as" value={selected.knownAs ?? ""} onChange={(value) => updatePlayer(selected.id, { knownAs: value })} />
            <Field label="Shirt number" value={selected.shirtNumber} onChange={(value) => updatePlayer(selected.id, { shirtNumber: value })} />
            <SelectField label="Availability" value={selected.availability} options={availabilityOptions} onChange={(value) => updatePlayer(selected.id, { availability: value as SquadAvailability })} />
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
          </>}
        </section>
      )}
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div style={panel}><div style={{ color: "#526176", fontSize: 12, fontWeight: 900 }}>{label}</div><div style={{ marginTop: 8, fontSize: 28, fontWeight: 950 }}>{value}</div></div>
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
  return <div style={chipGrid}>{options.map((option) => <button key={option} aria-pressed={selected.includes(option)} type="button" onClick={() => onToggle(option)} style={selected.includes(option) ? activeChip : chip}>{option}</button>)}</div>
}

function shortInitials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()
}

const heroPanel = { borderRadius: 28, padding: 18, background: "#ffffff", border: "1px solid rgba(147,197,253,0.2)", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }
const panel = { borderRadius: 24, padding: 16, background: "#ffffff", border: "1px solid rgba(148,163,184,0.14)" }
const editorPanel = { borderRadius: 28, padding: 18, background: "#ffffff", border: "1px solid rgba(147,197,253,0.18)", boxShadow: "0 8px 24px rgba(15,23,42,0.06)" }
const eyebrow = { fontSize: 11, letterSpacing: 1, fontWeight: 950, color: "#1d4ed8" }
const muted = { margin: "6px 0 0", color: "#526176", lineHeight: 1.45, fontWeight: 750 }
const pill = { borderRadius: 999, padding: "7px 10px", background: "rgba(37,99,235,0.18)", color: "#1d4ed8", fontSize: 11, fontWeight: 950 }
const summaryGrid = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 10 }
const cardGrid = { display: "grid", gap: 12 }
const primaryButton = { border: "1px solid rgba(191,219,254,0.24)", borderRadius: 18, padding: "12px 14px", background: "#2563eb", color: "white", fontWeight: 950, cursor: "pointer" }
const secondaryButton = { border: "1px solid rgba(147,197,253,0.16)", borderRadius: 18, padding: "12px 14px", background: "#f1f5f9", color: "#172033", fontWeight: 950, cursor: "pointer" }
const dangerButton = { ...secondaryButton, color: "#991b1b", background: "#fee2e2", border: "1px solid rgba(248,113,113,0.2)" }
const playerCard = { borderRadius: 22, padding: 14, background: "#ffffff", border: "1px solid rgba(147,197,253,0.14)", display: "grid", gap: 10 }
const activePlayerCard = { ...playerCard, background: "#eff6ff", border: "1px solid rgba(147,197,253,0.34)" }
const cardMainButton = { width: "100%", border: 0, padding: 0, background: "transparent", color: "#172033", display: "grid", gridTemplateColumns: "52px 1fr auto", gap: 12, alignItems: "center", textAlign: "left" as const, cursor: "pointer" }
const avatar = { color: "white", width: 52, height: 52, borderRadius: 18, display: "grid", placeItems: "center", background: "#2563eb", fontWeight: 950 }
const roleBadge = { borderRadius: 999, padding: "7px 9px", background: "#eff6ff", color: "#1d4ed8", fontSize: 11, fontWeight: 950 }
const badgeRow = { display: "flex", flexWrap: "wrap" as const, gap: 7 }
const blueBadge = { borderRadius: 999, padding: "7px 9px", background: "rgba(37,99,235,0.2)", color: "#1d4ed8", fontSize: 11, fontWeight: 900 }
const greenBadge = { ...blueBadge, background: "#dcfce7", color: "#166534" }
const amberBadge = { ...blueBadge, background: "#fef3c7", color: "#92400e" }
const cardActions = { display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }
const editButton = { ...primaryButton, padding: "10px 12px" }
const removeButton = { ...dangerButton, padding: "10px 12px" }
const formGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%, 220px),1fr))", gap: 12, marginTop: 16 }
const formGridWide = { display: "grid", gap: 12, marginTop: 16 }
const labelStyle = { display: "grid", gap: 6, color: "#526176", fontSize: 12, fontWeight: 900 }
const input = { width: "100%", border: "1px solid rgba(148,163,184,0.16)", borderRadius: 16, padding: 12, background: "#f8fafc", color: "#172033", fontWeight: 850, fontSize: 16 }
const chipGrid = { display: "flex", flexWrap: "wrap" as const, gap: 8 }
const chip = { border: "1px solid rgba(148,163,184,0.18)", borderRadius: 999, padding: "9px 11px", background: "#f1f5f9", color: "#334155", fontWeight: 900, cursor: "pointer" }
const activeChip = { ...chip, background: "#dbeafe", color: "#1e40af", border: "1px solid rgba(147,197,253,0.34)" }
