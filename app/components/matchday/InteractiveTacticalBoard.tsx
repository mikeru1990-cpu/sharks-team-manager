"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { SquadStorePlayer } from "../../lib/squadStore"
import type { TeamFormatConfig } from "../../lib/teamFormat"

type Point = { x: number; y: number }
type Props = {
  players: SquadStorePlayer[]
  format: TeamFormatConfig
  stintSeconds: Record<string, number>
}

const storagePrefix = "football-os-tactical-board-v1"

function shortName(name: string) {
  if (name === "Darcy-Rae Russell") return "Darcy-Rae"
  if (name === "Isabella Ogden") return "Bella O"
  if (name === "Bella Bainbridge") return "Bella B"
  return name.split(" ")[0]
}

function time(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

export default function InteractiveTacticalBoard({ players, format, stintSeconds }: Props) {
  const pitchRef = useRef<HTMLDivElement | null>(null)
  const storageKey = `${storagePrefix}-${format.id}`

  const defaultPositions = useMemo<Record<string, Point>>(() => {
    const next: Record<string, Point> = {}
    players.forEach((player, index) => {
      const slot = format.pitchSlots[index]
      next[player.id] = slot ? { x: slot.x, y: slot.y } : { x: 50, y: 50 }
    })
    return next
  }, [players, format.pitchSlots])

  const [positions, setPositions] = useState<Record<string, Point>>(defaultPositions)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, Point>
        const valid: Record<string, Point> = {}
        players.forEach((player) => {
          valid[player.id] = parsed[player.id] ?? defaultPositions[player.id]
        })
        setPositions(valid)
      } else {
        setPositions(defaultPositions)
      }
    } catch {
      setPositions(defaultPositions)
    }
  }, [storageKey, players, defaultPositions])

  function updatePosition(clientX: number, clientY: number) {
    if (!draggingId || !pitchRef.current) return
    const rect = pitchRef.current.getBoundingClientRect()
    const x = Math.max(7, Math.min(93, ((clientX - rect.left) / rect.width) * 100))
    const y = Math.max(7, Math.min(93, ((clientY - rect.top) / rect.height) * 100))
    setPositions((current) => ({ ...current, [draggingId]: { x, y } }))
    setSaved(false)
  }

  function saveShape() {
    window.localStorage.setItem(storageKey, JSON.stringify(positions))
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
  }

  function resetShape() {
    setPositions(defaultPositions)
    window.localStorage.removeItem(storageKey)
    setSaved(false)
  }

  return (
    <section style={panel}>
      <div style={header}>
        <div>
          <div style={eyebrow}>TACTICAL BOARD</div>
          <h2 style={title}>{format.label} · {format.defaultFormation}</h2>
          <p style={muted}>Drag players into position. The saved shape is stored for this team format.</p>
        </div>
        <div style={actions}>
          <button type="button" onClick={resetShape} style={secondaryButton}>Reset</button>
          <button type="button" onClick={saveShape} style={primaryButton}>{saved ? "Saved ✓" : "Save shape"}</button>
        </div>
      </div>

      <div
        ref={pitchRef}
        style={pitch}
        onPointerMove={(event) => updatePosition(event.clientX, event.clientY)}
        onPointerUp={() => setDraggingId(null)}
        onPointerCancel={() => setDraggingId(null)}
        onPointerLeave={() => setDraggingId(null)}
      >
        <div style={halfway} />
        <div style={circle} />
        <div style={topBox} />
        <div style={bottomBox} />
        {players.map((player) => {
          const point = positions[player.id] ?? defaultPositions[player.id] ?? { x: 50, y: 50 }
          return (
            <button
              key={player.id}
              type="button"
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId)
                setDraggingId(player.id)
              }}
              onPointerMove={(event) => {
                if (draggingId === player.id) updatePosition(event.clientX, event.clientY)
              }}
              onPointerUp={() => setDraggingId(null)}
              style={{ ...playerToken, left: `${point.x}%`, top: `${point.y}%`, transform: `translate(-50%,-50%) scale(${draggingId === player.id ? 1.08 : 1})` }}
            >
              <span style={positionTag}>{player.primaryPosition}</span>
              <strong>{shortName(player.name)}</strong>
              <small>{time(stintSeconds[player.id] ?? 0)}</small>
            </button>
          )
        })}
      </div>

      <div style={footer}>
        <span>{players.length}/{format.playersOnPitch} on pitch</span>
        <span>Drag to reposition</span>
        <span>Shape saved per format</span>
      </div>
    </section>
  )
}

const panel = { borderRadius: 28, padding: 16, background: "rgba(15,23,42,.9)", border: "1px solid rgba(148,163,184,.14)", display: "grid", gap: 14 }
const header = { display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" as const }
const actions = { display: "flex", gap: 8 }
const eyebrow = { fontSize: 11, fontWeight: 950, letterSpacing: 1.1, color: "#bfdbfe" }
const title = { margin: "6px 0 0", fontSize: 24, letterSpacing: -.6 }
const muted = { margin: "5px 0 0", color: "rgba(226,232,240,.68)", lineHeight: 1.4 }
const secondaryButton = { border: "1px solid rgba(147,197,253,.16)", borderRadius: 16, padding: "11px 13px", background: "rgba(2,6,23,.5)", color: "white", fontWeight: 900, cursor: "pointer" }
const primaryButton = { ...secondaryButton, background: "linear-gradient(135deg,#2563eb,#7c3aed)" }
const pitch = { position: "relative" as const, height: 500, borderRadius: 28, overflow: "hidden", touchAction: "none", userSelect: "none" as const, background: "repeating-linear-gradient(90deg,rgba(22,163,74,.96) 0 58px,rgba(21,128,61,.96) 58px 116px)", border: "2px solid rgba(255,255,255,.28)", boxShadow: "inset 0 0 50px rgba(0,0,0,.18)" }
const halfway = { position: "absolute" as const, left: 0, right: 0, top: "50%", height: 2, background: "rgba(255,255,255,.3)" }
const circle = { position: "absolute" as const, left: "50%", top: "50%", width: 108, height: 108, borderRadius: 999, border: "2px solid rgba(255,255,255,.3)", transform: "translate(-50%,-50%)" }
const topBox = { position: "absolute" as const, left: "25%", right: "25%", top: 0, height: "15%", border: "2px solid rgba(255,255,255,.26)", borderTop: 0 }
const bottomBox = { position: "absolute" as const, left: "25%", right: "25%", bottom: 0, height: "15%", border: "2px solid rgba(255,255,255,.26)", borderBottom: 0 }
const playerToken = { position: "absolute" as const, width: 86, minHeight: 67, border: "1px solid rgba(255,255,255,.34)", borderRadius: 22, padding: "7px 8px", display: "grid", placeItems: "center", gap: 2, background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", boxShadow: "0 16px 30px rgba(0,0,0,.34)", cursor: "grab", transition: "transform .12s ease", fontSize: 11, touchAction: "none" }
const positionTag = { borderRadius: 999, padding: "3px 6px", background: "rgba(2,6,23,.48)", color: "#dbeafe", fontSize: 9, fontWeight: 950 }
const footer = { display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" as const, color: "rgba(226,232,240,.62)", fontSize: 11, fontWeight: 850 }
