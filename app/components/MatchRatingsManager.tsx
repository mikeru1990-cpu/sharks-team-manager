"use client"

import { useMemo, useState } from "react"
import {
  buttonPrimary,
  buttonSecondary,
  cardStyle,
  type Player,
  type PlayerMatchRating,
} from "../lib/types"

type Props = {
  isAdmin: boolean
  players: Player[]
  activeEventId: string | null
  ratings: PlayerMatchRating[]
  onSaveRating: (playerId: string, rating: number, notes: string) => Promise<void>
}

export default function MatchRatingsManager({
  isAdmin,
  players,
  activeEventId,
  ratings,
  onSaveRating,
}: Props) {
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({})

  const eventRatings = useMemo(() => {
    if (!activeEventId) return []
    return ratings.filter((r) => r.eventId === activeEventId)
  }, [ratings, activeEventId])

  const ratingByPlayer = useMemo(() => {
    const map: Record<string, PlayerMatchRating> = {}
    for (const item of eventRatings) {
      map[item.playerId] = item
    }
    return map
  }, [eventRatings])

  const playerOfTheMatch = useMemo(() => {
    if (eventRatings.length === 0) return null
    return [...eventRatings].sort((a, b) => b.rating - a.rating)[0] || null
  }, [eventRatings])

  if (!activeEventId) {
    return (
      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Match Ratings</div>
        <div style={{ color: "#64748b" }}>Choose an active match event first.</div>
      </div>
    )
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle()}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900 }}>Match Ratings</div>
          {playerOfTheMatch ? (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                background: "#fef3c7",
                border: "1px solid #fcd34d",
                fontWeight: 900,
                color: "#92400e",
              }}
            >
              Player of the Match:{" "}
              {players.find((p) => p.id === playerOfTheMatch.playerId)?.name || "Unknown"} (
              {playerOfTheMatch.rating})
            </div>
          ) : null}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {players.length === 0 ? (
            <div style={{ color: "#64748b" }}>No players available for this match.</div>
          ) : (
            players.map((player) => {
              const existing = ratingByPlayer[player.id]
              const currentRating = existing?.rating || 0
              const currentNotes = draftNotes[player.id] ?? existing?.notes ?? ""

              return (
                <div
                  key={player.id}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    background: "#f8fafc",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{player.name}</div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => {
                      const active = currentRating === value
                      return (
                        <button
                          key={value}
                          disabled={!isAdmin}
                          onClick={() => void onSaveRating(player.id, value, currentNotes)}
                          style={{
                            ...(active ? buttonPrimary() : buttonSecondary()),
                            minWidth: 44,
                            padding: "10px 12px",
                          }}
                        >
                          {value}
                        </button>
                      )
                    })}
                  </div>

                  <textarea
                    value={currentNotes}
                    disabled={!isAdmin}
                    onChange={(e) =>
                      setDraftNotes((prev) => ({
                        ...prev,
                        [player.id]: e.target.value,
                      }))
                    }
                    placeholder="Short note..."
                    style={{
                      minHeight: 72,
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #cbd5e1",
                      fontSize: 15,
                      resize: "vertical",
                    }}
                  />

                  {isAdmin ? (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        onClick={() => void onSaveRating(player.id, currentRating || 6, currentNotes)}
                        style={buttonPrimary()}
                      >
                        Save Rating
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
