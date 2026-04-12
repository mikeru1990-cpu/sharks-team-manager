"use client"

import { useEffect, useMemo, useState } from "react"
import type { MatchFormat, PitchSlot, Player } from "../../lib/types"
import { TEAM, initials } from "../../lib/types"
import { buildPitchSlots, canPlaySlot } from "../../lib/rotation"

type Props = {
  open: boolean
  fixtureTitle: string
  fixtureSubtitle?: string
  players: Player[]
  matchFormat: MatchFormat
  formation: string
  lineupMap: Record<string, string | null>
  benchIds: string[]
  onClose: () => void
  onSave: (payload: {
    matchFormat: MatchFormat
    formation: string
    lineupMap: Record<string, string | null>
    benchIds: string[]
  }) => void | Promise<void>
}

function getFormationOptions(format: MatchFormat) {
  if (format === "7v7") return ["2-3-1", "3-2-1"]
  if (format === "9v9") return ["3-3-2", "3-4-1"]
  return ["4-3-3", "4-4-2", "3-5-2"]
}

function shirtStyle(selected = false) {
  return {
    width: 54,
    height: 54,
    borderRadius: "50%",
    background: selected
      ? "linear-gradient(180deg, #0f3fd9 0%, #1d4ed8 100%)"
      : "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    color: selected ? "white" : "#0f172a",
    display: "grid",
    placeItems: "center",
    fontWeight: 900 as const,
    fontSize: 12,
    border: selected ? "2px solid #93c5fd" : "1px solid #dbe3ef",
    boxShadow: selected
      ? "0 10px 24px rgba(29,78,216,0.22)"
      : "0 3px 8px rgba(15,23,42,0.08)",
  }
}

function orderPlayerIds(
  slots: PitchSlot[],
  lineupMap: Record<string, string | null>,
  benchIds: string[],
  players: Player[]
) {
  const idsFromLineup = slots.map((slot) => lineupMap[slot.id]).filter(Boolean) as string[]
  const all = [...idsFromLineup, ...benchIds, ...players.map((player) => player.id)]
  return [...new Set(all)]
}

function reconcileForSlots(
  nextSlots: PitchSlot[],
  prevLineupMap: Record<string, string | null>,
  prevBenchIds: string[],
  players: Player[]
) {
  const orderedIds = orderPlayerIds(nextSlots, prevLineupMap, prevBenchIds, players)
  const nextLineupMap: Record<string, string | null> = {}
  const remaining = [...orderedIds]

  nextSlots.forEach((slot) => {
    const index = remaining.findIndex((playerId) => {
      const player = players.find((item) => item.id === playerId)
      return player ? canPlaySlot(player, slot.position) : false
    })

    if (index >= 0) {
      nextLineupMap[slot.id] = remaining[index]
      remaining.splice(index, 1)
    } else {
      nextLineupMap[slot.id] = null
    }
  })

  return {
    lineupMap: nextLineupMap,
    benchIds: remaining,
  }
}

function buildRows(slots: PitchSlot[]) {
  return [
    slots.filter((slot) => slot.position === "FWD"),
    slots.filter((slot) => slot.position === "MID"),
    slots.filter((slot) => slot.position === "DEF"),
    slots.filter((slot) => slot.position === "GK"),
  ].filter((row) => row.length > 0)
}

export default function LineupBuilderModal({
  open,
  fixtureTitle,
  fixtureSubtitle,
  players,
  matchFormat,
  formation,
  lineupMap,
  benchIds,
  onClose,
  onSave,
}: Props) {
  const [draftFormat, setDraftFormat] = useState<MatchFormat>(matchFormat)
  const [draftFormation, setDraftFormation] = useState(formation)
  const [draftLineupMap, setDraftLineupMap] = useState<Record<string, string | null>>(lineupMap)
  const [draftBenchIds, setDraftBenchIds] = useState<string[]>(benchIds)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const slots = useMemo(
    () => buildPitchSlots(draftFormat, draftFormation),
    [draftFormat, draftFormation]
  )

  const pitchRows = useMemo(() => buildRows(slots), [slots])

  useEffect(() => {
    if (!open) return

    const nextSlots = buildPitchSlots(matchFormat, formation)
    const nextBench =
      benchIds.length > 0
        ? benchIds
        : players
            .map((player) => player.id)
            .filter((playerId) => !Object.values(lineupMap).includes(playerId))

    setDraftFormat(matchFormat)
    setDraftFormation(formation)
    setDraftLineupMap(lineupMap)
    setDraftBenchIds(nextBench)
    setSelectedPlayerId(null)

    const fixed = reconcileForSlots(nextSlots, lineupMap, nextBench, players)
    setDraftLineupMap(fixed.lineupMap)
    setDraftBenchIds(fixed.benchIds)
  }, [open, matchFormat, formation, lineupMap, benchIds, players])

  function handleChangeFormat(nextFormat: MatchFormat) {
    const nextFormation = getFormationOptions(nextFormat)[0]
    const nextSlots = buildPitchSlots(nextFormat, nextFormation)
    const reconciled = reconcileForSlots(nextSlots, draftLineupMap, draftBenchIds, players)

    setDraftFormat(nextFormat)
    setDraftFormation(nextFormation)
    setDraftLineupMap(reconciled.lineupMap)
    setDraftBenchIds(reconciled.benchIds)
    setSelectedPlayerId(null)
  }

  function handleChangeFormation(nextFormation: string) {
    const nextSlots = buildPitchSlots(draftFormat, nextFormation)
    const reconciled = reconcileForSlots(nextSlots, draftLineupMap, draftBenchIds, players)

    setDraftFormation(nextFormation)
    setDraftLineupMap(reconciled.lineupMap)
    setDraftBenchIds(reconciled.benchIds)
    setSelectedPlayerId(null)
  }

  function movePlayerToBench(playerId: string) {
    const nextLineupMap = { ...draftLineupMap }

    Object.keys(nextLineupMap).forEach((slotId) => {
      if (nextLineupMap[slotId] === playerId) nextLineupMap[slotId] = null
    })

    setDraftLineupMap(nextLineupMap)
    setDraftBenchIds((prev) => (prev.includes(playerId) ? prev : [...prev, playerId]))
    if (selectedPlayerId === playerId) setSelectedPlayerId(null)
  }

  function placeSelectedIntoSlot(slot: PitchSlot) {
    if (!selectedPlayerId) return

    const selectedPlayer = players.find((player) => player.id === selectedPlayerId)
    if (!selectedPlayer) return
    if (!canPlaySlot(selectedPlayer, slot.position)) return

    const nextLineupMap = { ...draftLineupMap }
    const displacedPlayerId = nextLineupMap[slot.id]

    Object.keys(nextLineupMap).forEach((slotId) => {
      if (nextLineupMap[slotId] === selectedPlayerId) nextLineupMap[slotId] = null
    })

    nextLineupMap[slot.id] = selectedPlayerId

    let nextBenchIds = draftBenchIds.filter((id) => id !== selectedPlayerId)
    if (displacedPlayerId && displacedPlayerId !== selectedPlayerId) {
      nextBenchIds = nextBenchIds.includes(displacedPlayerId)
        ? nextBenchIds
        : [...nextBenchIds, displacedPlayerId]
    }

    setDraftLineupMap(nextLineupMap)
    setDraftBenchIds(nextBenchIds)
    setSelectedPlayerId(null)
  }

  async function handleSave() {
    await onSave({
      matchFormat: draftFormat,
      formation: draftFormation,
      lineupMap: draftLineupMap,
      benchIds: draftBenchIds,
    })
  }

  if (!open) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 120,
        background: "rgba(15,23,42,0.36)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: 12,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          background: "rgba(255,255,255,0.94)",
          border: "1px solid rgba(255,255,255,0.55)",
          borderRadius: 34,
          padding: 16,
          boxShadow: "0 24px 60px rgba(15,23,42,0.22)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "14px 18px",
              borderRadius: 999,
              border: "none",
              background: "white",
              fontSize: 18,
              fontWeight: 700,
              boxShadow: "0 6px 16px rgba(15,23,42,0.08)",
            }}
          >
            Cancel
          </button>

          <div style={{ textAlign: "center", minWidth: 0 }}>
            <div style={{ fontSize: 16, color: "#64748b", fontWeight: 700 }}>Create line-up</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginTop: 2, lineHeight: 1.05 }}>
              Starting line-up
            </div>
            <div
              style={{
                color: "#64748b",
                marginTop: 4,
                fontSize: 14,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {fixtureTitle}
              {fixtureSubtitle ? ` • ${fixtureSubtitle}` : ""}
            </div>
          </div>

          <button
            onClick={() => void handleSave()}
            style={{
              padding: "14px 18px",
              borderRadius: 999,
              border: "none",
              background: "white",
              fontSize: 18,
              fontWeight: 800,
              boxShadow: "0 6px 16px rgba(15,23,42,0.08)",
            }}
          >
            Save
          </button>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.72)",
            borderRadius: 26,
            padding: 16,
            boxShadow: "inset 0 0 0 1px rgba(226,232,240,0.85)",
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <div
              style={{
                background: "white",
                borderRadius: 18,
                padding: 14,
                boxShadow: "inset 0 0 0 1px #e2e8f0",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: "#64748b", marginBottom: 8 }}>
                Team size
              </div>
              <select
                value={draftFormat}
                onChange={(e) => handleChangeFormat(e.target.value as MatchFormat)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  fontSize: 20,
                  fontWeight: 700,
                  outline: "none",
                }}
              >
                <option value="7v7">7</option>
                <option value="9v9">9</option>
                <option value="11v11">11</option>
              </select>
            </div>

            <div
              style={{
                background: "white",
                borderRadius: 18,
                padding: 14,
                boxShadow: "inset 0 0 0 1px #e2e8f0",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: "#64748b", marginBottom: 8 }}>
                Formation
              </div>
              <select
                value={draftFormation}
                onChange={(e) => handleChangeFormation(e.target.value)}
                style={{
                  width: "100%",
                  border: "none",
                  background: "transparent",
                  fontSize: 20,
                  fontWeight: 700,
                  outline: "none",
                }}
              >
                {getFormationOptions(draftFormat).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div
            style={{
              borderRadius: 30,
              padding: 16,
              background: "linear-gradient(180deg, #46a51e 0%, #15803d 100%)",
              position: "relative",
              overflow: "hidden",
              minHeight: 470,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 16,
                borderRadius: 24,
                border: "2px solid rgba(255,255,255,0.26)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 16,
                bottom: 16,
                width: 2,
                transform: "translateX(-50%)",
                background: "rgba(255,255,255,0.24)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 96,
                height: 96,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.24)",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            />

            <div style={{ position: "relative", zIndex: 1, display: "grid", gap: 18 }}>
              {pitchRows.map((row, rowIndex) => (
                <div
                  key={rowIndex}
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  {row.map((slot) => {
                    const playerId = draftLineupMap[slot.id]
                    const player = players.find((item) => item.id === playerId) || null
                    const selectedPlayer = players.find((item) => item.id === selectedPlayerId) || null
                    const validDrop = selectedPlayer ? canPlaySlot(selectedPlayer, slot.position) : true

                    return (
                      <button
                        key={slot.id}
                        onClick={() => {
                          if (selectedPlayerId) {
                            placeSelectedIntoSlot(slot)
                          } else if (playerId) {
                            movePlayerToBench(playerId)
                          }
                        }}
                        style={{
                          minHeight: 108,
                          borderRadius: 22,
                          border: selectedPlayerId
                            ? validDrop
                              ? "2px solid rgba(191,219,254,0.95)"
                              : "2px solid rgba(254,202,202,0.9)"
                            : "1px solid rgba(255,255,255,0.28)",
                          background: selectedPlayerId
                            ? validDrop
                              ? "rgba(255,255,255,0.18)"
                              : "rgba(239,68,68,0.18)"
                            : "rgba(255,255,255,0.12)",
                          display: "grid",
                          justifyItems: "center",
                          alignContent: "center",
                          gap: 8,
                          color: "white",
                        }}
                      >
                        {player ? (
                          <>
                            <div style={shirtStyle(player.id === selectedPlayerId)}>
                              {initials(player.name)}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                fontWeight: 800,
                                maxWidth: 90,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {player.name}
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: "50%",
                                background: "rgba(255,255,255,0.2)",
                                display: "grid",
                                placeItems: "center",
                                fontSize: 28,
                                fontWeight: 500,
                              }}
                            >
                              +
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 800 }}>
                              {slot.label}
                            </div>
                          </>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.76)",
              borderRadius: 26,
              padding: 14,
              boxShadow: "inset 0 0 0 1px rgba(226,232,240,0.9)",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 10 }}>
              Squad
            </div>

            <div style={{ display: "grid", gap: 10, maxHeight: 260, overflowY: "auto" }}>
              {players.map((player) => {
                const onPitch = Object.values(draftLineupMap).includes(player.id)
                const onBench = draftBenchIds.includes(player.id)
                const selected = selectedPlayerId === player.id

                return (
                  <button
                    key={player.id}
                    onClick={() => {
                      if (selected) {
                        setSelectedPlayerId(null)
                        return
                      }

                      if (!onPitch && !onBench) {
                        setDraftBenchIds((prev) => [...prev, player.id])
                      }

                      setSelectedPlayerId(player.id)
                    }}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto minmax(0, 1fr) auto",
                      gap: 12,
                      alignItems: "center",
                      padding: 12,
                      borderRadius: 18,
                      border: selected ? "2px solid #93c5fd" : "1px solid #e2e8f0",
                      background: selected ? "#dbeafe" : "white",
                    }}
                  >
                    <div style={shirtStyle(selected)}>{initials(player.name)}</div>

                    <div style={{ textAlign: "left", minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 15,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {player.name}
                      </div>
                      <div style={{ color: "#64748b", fontSize: 12, marginTop: 4 }}>
                        {player.positions.join(" / ")}
                      </div>
                    </div>

                    <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
                      <div
                        style={{
                          padding: "6px 10px",
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 800,
                          background: onPitch ? "#dcfce7" : onBench ? "#eff6ff" : "#f8fafc",
                          color: onPitch ? "#166534" : onBench ? "#1d4ed8" : "#64748b",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        {onPitch ? "On pitch" : onBench ? "Bench" : "Squad"}
                      </div>

                      {(onPitch || onBench) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            movePlayerToBench(player.id)
                          }}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            border: "1px solid #cbd5e1",
                            background: "white",
                            fontSize: 11,
                            fontWeight: 800,
                          }}
                        >
                          Bench
                        </button>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
