"use client"

import { buttonPrimary, buttonSecondary, cardStyle, type MatchEventDraft, type Player } from "../../lib/types"

type Props = {
  open: boolean
  editingTimelineId: string | null
  eventDraft: MatchEventDraft
  setEventDraft: (
    updater: MatchEventDraft | ((prev: MatchEventDraft) => MatchEventDraft)
  ) => void
  matchPlayers: Player[]
  onSave: () => Promise<void> | void
  onClose: () => void
}

export default function MatchEventModal(props: Props) {
  const {
    open,
    editingTimelineId,
    eventDraft,
    setEventDraft,
    matchPlayers,
    onSave,
    onClose,
  } = props

  if (!open) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 100,
        padding: 16,
      }}
    >
      <div style={{ ...cardStyle(), width: "100%", maxWidth: 520 }}>
        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>
          {editingTimelineId ? "Edit Match Event" : "Add Match Event"}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <select
            value={eventDraft.type}
            onChange={(e) =>
              setEventDraft({
                type: e.target.value as "goal" | "assist" | "sub" | "injury" | "note",
                playerId: "",
                secondPlayerId: "",
                note: "",
              })
            }
            style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
          >
            <option value="goal">Goal</option>
            <option value="assist">Assist</option>
            <option value="sub">Sub</option>
            <option value="injury">Injury</option>
            <option value="note">Note</option>
          </select>

          {eventDraft.type !== "note" ? (
            <select
              value={eventDraft.playerId}
              onChange={(e) => setEventDraft((prev) => ({ ...prev, playerId: e.target.value }))}
              style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
            >
              <option value="">Choose player</option>
              {matchPlayers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name}
                </option>
              ))}
            </select>
          ) : null}

          {eventDraft.type === "goal" || eventDraft.type === "sub" ? (
            <select
              value={eventDraft.secondPlayerId}
              onChange={(e) =>
                setEventDraft((prev) => ({ ...prev, secondPlayerId: e.target.value }))
              }
              style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
            >
              <option value="">
                {eventDraft.type === "goal" ? "Optional assist" : "Choose second player"}
              </option>
              {matchPlayers
                .filter((player) => player.id !== eventDraft.playerId)
                .map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
            </select>
          ) : null}

          {eventDraft.type === "note" ? (
            <textarea
              value={eventDraft.note}
              onChange={(e) => setEventDraft((prev) => ({ ...prev, note: e.target.value }))}
              placeholder="Coach note"
              style={{
                minHeight: 100,
                padding: 14,
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                resize: "vertical",
              }}
            />
          ) : null}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={() => void onSave()} style={{ ...buttonPrimary(), flex: 1 }}>
            Save Event
          </button>
          <button onClick={onClose} style={{ ...buttonSecondary(), flex: 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
