"use client"

import { useEffect, useMemo, useState } from "react"
import PitchLineupBoard from "../PitchLineupBoard"
import { TEAM, type MatchFormat, type PitchSlot, type Player } from "../../lib/types"

type Props = {
  open: boolean
  title: string
  subtitle?: string
  players: Player[]
  matchFormat: MatchFormat
  formation: string
  currentSlots: PitchSlot[]
  lineupMap: Record<string, string | null>
  benchIds: string[]
  lineupName: string
  setLineupName: (value: string) => void
  onChangeFormation: (nextFormat: MatchFormat, nextFormation: string) => Promise<void>
  onApplyLineup: (nextLineupMap: Record<string, string | null>, nextBenchIds: string[]) => void
  onSave: () => Promise<void>
  onClose: () => void
}

function formationOptions(matchFormat: MatchFormat) {
  if (matchFormat === "7v7") {
    return ["1-3-2", "1-4-1", "2-1-3", "2-2-2", "2-3-1", "2-4-0", "3-1-2", "3-2-1", "4-1-1"]
  }

  if (matchFormat === "9v9") {
    return ["3-3-2", "3-4-1", "2-4-2", "4-3-1"]
  }

  return ["4-3-3", "4-4-2", "3-5-2", "4-2-3-1"]
}

function fieldLabel(matchFormat: MatchFormat) {
  if (matchFormat === "7v7") return 7
  if (matchFormat === "9v9") return 9
  return 11
}

function controlStyle() {
  return {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 18,
    border: "1px solid #e2e8f0",
    background: "white",
    fontSize: 16,
    color: "#0f172a",
    boxSizing: "border-box" as const,
  }
}

export default function LineupBuilderModal({
  open,
  title,
  subtitle,
  players,
  matchFormat,
  formation,
  currentSlots,
  lineupMap,
  benchIds,
  lineupName,
  setLineupName,
  onChangeFormation,
  onApplyLineup,
  onSave,
  onClose,
}: Props) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)
  const [draftLineupMap, setDraftLineupMap] = useState<Record<string, string | null>>({})
  const [draftBenchIds, setDraftBenchIds] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setSelectedPlayerId(null)
    setDraftLineupMap(lineupMap)
    setDraftBenchIds(benchIds)
  }, [open, lineupMap, benchIds])

  const placedIds = useMemo(() => {
    return Object.values(draftLineupMap).filter(Boolean) as string[]
  }, [draftLineupMap])

  const availableBenchPlayers = useMemo(() => {
    return draftBenchIds
      .map((id) => players.find((player) => player.id === id))
      .filter(Boolean) as Player[]
  }, [draftBenchIds, players])

  if (!open) return null

  function movePlayerToSlot(playerId: string, slotId: string) {
    const nextLineupMap = { ...draftLineupMap }

    Object.keys(nextLineupMap).forEach((key) => {
      if (nextLineupMap[key] === playerId) {
        nextLineupMap[key] = null
      }
    })

    const replacedPlayerId = nextLineupMap[slotId]
    nextLineupMap[slotId] = playerId

    let nextBenchIds = draftBenchIds.filter((id) => id !== playerId)

    if (replacedPlayerId && !nextBenchIds.includes(replacedPlayerId)) {
      nextBenchIds = [...nextBenchIds, replacedPlayerId]
    }

    setDraftLineupMap(nextLineupMap)
    setDraftBenchIds(nextBenchIds)
    setSelectedPlayerId(null)
  }

  function removePlayerFromSlot(slotId: string) {
    const playerId = draftLineupMap[slotId]
    if (!playerId) return

    const nextLineupMap = { ...draftLineupMap, [slotId]: null }
    const nextBenchIds = draftBenchIds.includes(playerId) ? draftBenchIds : [...draftBenchIds, playerId]

    setDraftLineupMap(nextLineupMap)
    setDraftBenchIds(nextBenchIds)
    setSelectedPlayerId(null)
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(15,23,42,0.40)",
        backdropFilter: "blur(10px)",
        overflowY: "auto",
        padding: 16,
      }}
    >
      <div
        style={{
          maxWidth: 820,
          margin: "0 auto",
          borderRadius: 34,
          background: "rgba(255,255,255,0.96)",
          boxShadow: "0 24px 50px rgba(15,23,42,0.22)",
          padding: 16,
          display: "grid",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 12,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "12px 18px",
              borderRadius: 999,
              border: "none",
              background: "#f8fafc",
              fontWeight: 800,
              fontSize: 17,
            }}
          >
            Cancel
          </button>

          <div style={{ textAlign: "center", minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{title}</div>
            {subtitle ? (
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
                {subtitle}
              </div>
            ) : null}
          </div>

          <button
            onClick={async () => {
              onApplyLineup(draftLineupMap, draftBenchIds)
              await onSave()
              onClose()
            }}
            style={{
              padding: "12px 18px",
              borderRadius: 999,
              border: "none",
              background: "#f8fafc",
              fontWeight: 900,
              fontSize: 17,
              color: "#0f172a",
            }}
          >
            Save
          </button>
        </div>

        <input
          value={lineupName}
          onChange={(e) => setLineupName(e.target.value)}
          placeholder="Starting line-up"
          style={controlStyle()}
        />

        <div
          style={{
            borderRadius: 28,
            background: "#fbfdff",
            border: "1px solid #edf2f7",
            padding: 16,
            display: "grid",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr)",
              gap: 10,
            }}
          >
            <div style={{ display: "grid", gap: 10 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px minmax(0, 1fr)",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div style={{ color: "#0f172a", fontWeight: 800 }}>Team size</div>
                <div style={{ ...controlStyle(), padding: "14px 16px" }}>{fieldLabel(matchFormat)}</div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px minmax(0, 1fr)",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div style={{ color: "#0f172a", fontWeight: 800 }}>Format</div>
                <select
                  value={formation}
                  onChange={(e) => void onChangeFormation(matchFormat, e.target.value)}
                  style={controlStyle()}
                >
                  {formationOptions(matchFormat).map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <PitchLineupBoard
            matchFormat={matchFormat}
            formation={formation}
            currentSlots={currentSlots}
            players={players}
            lineupMap={draftLineupMap}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
            onPlacePlayer={(slotId) => {
              if (!selectedPlayerId) return
              movePlayerToSlot(selectedPlayerId, slotId)
            }}
            onRemoveFromSlot={removePlayerFromSlot}
          />
        </div>

        <div
          style={{
            borderRadius: 24,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            padding: 14,
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 900, color: "#0f172a" }}>Bench</div>

          {availableBenchPlayers.length === 0 ? (
            <div style={{ color: "#64748b" }}>No players on the bench.</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 10,
              }}
            >
              {availableBenchPlayers.map((player) => {
                const active = selectedPlayerId === player.id

                return (
                  <button
                    key={player.id}
                    onClick={() => setSelectedPlayerId(active ? null : player.id)}
                    style={{
                      borderRadius: 20,
                      border: active ? `2px solid ${TEAM.primary}` : "1px solid #dbe3ef",
                      background: active ? "#dbeafe" : "#f8fafc",
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        margin: "0 auto",
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        background: active
                          ? `linear-gradient(180deg, ${TEAM.secondary} 0%, ${TEAM.primary} 100%)`
                          : "white",
                        color: active ? "white" : "#0f172a",
                        border: "2px solid rgba(255,255,255,0.9)",
                        fontWeight: 900,
                        boxShadow: "0 6px 14px rgba(15,23,42,0.10)",
                      }}
                    >
                      {player.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontWeight: 800,
                        color: "#0f172a",
                        fontSize: 13,
                        lineHeight: 1.2,
                      }}
                    >
                      {player.name}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        color: "#64748b",
                        fontSize: 12,
                      }}
                    >
                      {player.positions.join("/")}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
