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

const storagePrefix = "football-os-tactical-board-v2"
const legacyStoragePrefix = "football-os-tactical-board-v1"

function shortName(name: string) {
  if (name === "Darcy-Rae Russell") return "Darcy-Rae"
  if (name === "Isabella Ogden") return "Bella O"
  if (name === "Bella Bainbridge") return "Bella B"
  return name.split(" ")[0]
}

function time(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

function clamp(value: number) {
  return Math.max(8, Math.min(92, value))
}

export default function InteractiveTacticalBoard({ players, format, stintSeconds }: Props) {
  const pitchRef = useRef<HTMLDivElement | null>(null)
  const positionsRef = useRef<Record<string, Point>>({})
  const draggingIdRef = useRef<string | null>(null)
  const activePointerRef = useRef<number | null>(null)

  const storageKey = `${storagePrefix}-${format.id}`
  const legacyStorageKey = `${legacyStoragePrefix}-${format.id}`

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
  const [saveState, setSaveState] = useState<"saved" | "saving" | "changed">("saved")

  useEffect(() => {
    positionsRef.current = positions
  }, [positions])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(legacyStorageKey)
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, Point>
        const valid: Record<string, Point> = {}
        players.forEach((player) => {
          const candidate = parsed[player.id]
          valid[player.id] = candidate && Number.isFinite(candidate.x) && Number.isFinite(candidate.y)
            ? { x: clamp(candidate.x), y: clamp(candidate.y) }
            : defaultPositions[player.id]
        })
        positionsRef.current = valid
        setPositions(valid)
        window.localStorage.setItem(storageKey, JSON.stringify(valid))
      } else {
        positionsRef.current = defaultPositions
        setPositions(defaultPositions)
      }
      setSaveState("saved")
    } catch {
      positionsRef.current = defaultPositions
      setPositions(defaultPositions)
      setSaveState("saved")
    }
  }, [storageKey, legacyStorageKey, players, defaultPositions])

  function pointFromClient(clientX: number, clientY: number): Point | null {
    const pitch = pitchRef.current
    if (!pitch) return null
    const rect = pitch.getBoundingClientRect()
    if (!rect.width || !rect.height) return null
    return {
      x: clamp(((clientX - rect.left) / rect.width) * 100),
      y: clamp(((clientY - rect.top) / rect.height) * 100),
    }
  }

  function movePlayer(playerId: string, clientX: number, clientY: number) {
    const point = pointFromClient(clientX, clientY)
    if (!point) return
    setPositions((current) => {
      const next = { ...current, [playerId]: point }
      positionsRef.current = next
      return next
    })
    setSaveState("changed")
  }

  function persistShape() {
    try {
      setSaveState("saving")
      window.localStorage.setItem(storageKey, JSON.stringify(positionsRef.current))
      setSaveState("saved")
    } catch {
      setSaveState("changed")
    }
  }

  function finishDrag(target?: HTMLElement, pointerId?: number) {
    if (target && pointerId != null && target.hasPointerCapture(pointerId)) {
      target.releasePointerCapture(pointerId)
    }
    draggingIdRef.current = null
    activePointerRef.current = null
    setDraggingId(null)
    persistShape()
  }

  function nudgePlayer(playerId: string, dx: number, dy: number) {
    const current = positionsRef.current[playerId] ?? defaultPositions[playerId] ?? { x: 50, y: 50 }
    const next = {
      ...positionsRef.current,
      [playerId]: { x: clamp(current.x + dx), y: clamp(current.y + dy) },
    }
    positionsRef.current = next
    setPositions(next)
    setSaveState("changed")
    window.setTimeout(persistShape, 0)
  }

  function saveShape() {
    persistShape()
  }

  function resetShape() {
    positionsRef.current = defaultPositions
    setPositions(defaultPositions)
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(defaultPositions))
      window.localStorage.removeItem(legacyStorageKey)
      setSaveState("saved")
    } catch {
      setSaveState("changed")
    }
  }

  return (
    <section style={panel}>
      <div style={header}>
        <div>
          <div style={eyebrow}>TACTICAL BOARD</div>
          <h2 style={title}>{format.label} · {format.defaultFormation}</h2>
          <p style={muted}>Press and drag any player with your finger. Positions save automatically when you let go.</p>
        </div>
        <div style={actions}>
          <button type="button" onClick={resetShape} style={secondaryButton}>Reset</button>
          <button type="button" onClick={saveShape} style={primaryButton}>
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved ✓" : "Save shape"}
          </button>
        </div>
      </div>

      <div ref={pitchRef} style={pitch} aria-label={`${format.label} tactical pitch`}>
        <div style={halfway} />
        <div style={circle} />
        <div style={topBox} />
        <div style={bottomBox} />

        {players.map((player) => {
          const point = positions[player.id] ?? defaultPositions[player.id] ?? { x: 50, y: 50 }
          const isDragging = draggingId === player.id

          return (
            <button
              key={player.id}
              type="button"
              aria-label={`Move ${player.name}. Current position ${Math.round(point.x)} percent across, ${Math.round(point.y)} percent down.`}
              onPointerDown={(event) => {
                if (activePointerRef.current != null) return
                event.preventDefault()
                activePointerRef.current = event.pointerId
                draggingIdRef.current = player.id
                setDraggingId(player.id)
                event.currentTarget.setPointerCapture(event.pointerId)
                movePlayer(player.id, event.clientX, event.clientY)
              }}
              onPointerMove={(event) => {
                if (draggingIdRef.current !== player.id || activePointerRef.current !== event.pointerId) return
                event.preventDefault()
                movePlayer(player.id, event.clientX, event.clientY)
              }}
              onPointerUp={(event) => {
                if (activePointerRef.current !== event.pointerId) return
                event.preventDefault()
                movePlayer(player.id, event.clientX, event.clientY)
                finishDrag(event.currentTarget, event.pointerId)
              }}
              onPointerCancel={(event) => {
                if (activePointerRef.current !== event.pointerId) return
                finishDrag(event.currentTarget, event.pointerId)
              }}
              onLostPointerCapture={() => {
                if (draggingIdRef.current === player.id) {
                  draggingIdRef.current = null
                  activePointerRef.current = null
                  setDraggingId(null)
                  persistShape()
                }
              }}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 5 : 2
                if (event.key === "ArrowLeft") { event.preventDefault(); nudgePlayer(player.id, -step, 0) }
                if (event.key === "ArrowRight") { event.preventDefault(); nudgePlayer(player.id, step, 0) }
                if (event.key === "ArrowUp") { event.preventDefault(); nudgePlayer(player.id, 0, -step) }
                if (event.key === "ArrowDown") { event.preventDefault(); nudgePlayer(player.id, 0, step) }
              }}
              style={{
                ...playerToken,
                left: `${point.x}%`,
                top: `${point.y}%`,
                zIndex: isDragging ? 20 : 5,
                cursor: isDragging ? "grabbing" : "grab",
                transform: `translate(-50%,-50%) scale(${isDragging ? 1.1 : 1})`,
                boxShadow: isDragging
                  ? "0 20px 38px rgba(0,0,0,.45), 0 0 0 3px rgba(191,219,254,.7)"
                  : "0 16px 30px rgba(0,0,0,.34)",
              }}
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
        <span>{draggingId ? "Moving player…" : "Finger drag enabled"}</span>
        <span>{saveState === "saved" ? "Shape saved" : "Unsaved change"}</span>
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
const secondaryButton = { minHeight: 44, border: "1px solid rgba(147,197,253,.16)", borderRadius: 16, padding: "11px 13px", background: "rgba(2,6,23,.5)", color: "white", fontWeight: 900, cursor: "pointer", touchAction: "manipulation" as const }
const primaryButton = { ...secondaryButton, minWidth: 104, background: "linear-gradient(135deg,#2563eb,#7c3aed)" }
const pitch = { position: "relative" as const, height: 500, maxHeight: "62vh", minHeight: 390, borderRadius: 28, overflow: "hidden", touchAction: "none" as const, overscrollBehavior: "contain" as const, userSelect: "none" as const, WebkitUserSelect: "none" as const, WebkitTouchCallout: "none" as const, background: "repeating-linear-gradient(90deg,rgba(22,163,74,.96) 0 58px,rgba(21,128,61,.96) 58px 116px)", border: "2px solid rgba(255,255,255,.28)", boxShadow: "inset 0 0 50px rgba(0,0,0,.18)" }
const halfway = { position: "absolute" as const, left: 0, right: 0, top: "50%", height: 2, background: "rgba(255,255,255,.3)", pointerEvents: "none" as const }
const circle = { position: "absolute" as const, left: "50%", top: "50%", width: 108, height: 108, borderRadius: 999, border: "2px solid rgba(255,255,255,.3)", transform: "translate(-50%,-50%)", pointerEvents: "none" as const }
const topBox = { position: "absolute" as const, left: "25%", right: "25%", top: 0, height: "15%", border: "2px solid rgba(255,255,255,.26)", borderTop: 0, pointerEvents: "none" as const }
const bottomBox = { position: "absolute" as const, left: "25%", right: "25%", bottom: 0, height: "15%", border: "2px solid rgba(255,255,255,.26)", borderBottom: 0, pointerEvents: "none" as const }
const playerToken = { position: "absolute" as const, width: 86, minHeight: 67, border: "1px solid rgba(255,255,255,.34)", borderRadius: 22, padding: "7px 8px", display: "grid", placeItems: "center", gap: 2, background: "linear-gradient(135deg,#2563eb,#7c3aed)", color: "white", fontSize: 11, touchAction: "none" as const, userSelect: "none" as const, WebkitUserSelect: "none" as const, WebkitTouchCallout: "none" as const, transition: "transform .1s ease, box-shadow .1s ease" }
const positionTag = { borderRadius: 999, padding: "3px 6px", background: "rgba(2,6,23,.48)", color: "#dbeafe", fontSize: 9, fontWeight: 950 }
const footer = { display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" as const, color: "rgba(226,232,240,.62)", fontSize: 11, fontWeight: 850 }
