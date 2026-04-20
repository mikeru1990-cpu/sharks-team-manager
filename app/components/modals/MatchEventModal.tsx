"use client"

import { THEME } from "../../lib/theme"
import {
  PageCard,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  Badge,
} from "../ui"
import type { MatchEventDraft, Player } from "../../lib/types"

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

function overlayStyle() {
  return {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(15,23,42,0.52)",
    display: "grid",
    placeItems: "center",
    zIndex: 200,
    padding: 16,
    backdropFilter: "blur(8px)",
  }
}

function fieldStyle() {
  return {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: 14,
    borderRadius: 16,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    background: "white",
    color: THEME.colors.textPrimary,
    outline: "none",
  }
}

function labelStyle() {
  return {
    fontWeight: 800,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  }
}

function typeTone(type: MatchEventDraft["type"]): "green" | "blue" | "yellow" | "red" | "default" {
  if (type === "goal") return "green"
  if (type === "assist") return "blue"
  if (type === "sub") return "yellow"
  if (type === "injury") return "red"
  return "default"
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
    <div style={overlayStyle()}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <PageCard>
          <SectionHeader
            title={editingTimelineId ? "Edit Match Event" : "Add Match Event"}
            subtitle="Log important moments from the game."
            action={<Badge tone={typeTone(eventDraft.type)}>{eventDraft.type.toUpperCase()}</Badge>}
          />

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <div style={labelStyle()}>Event type</div>
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
                style={fieldStyle()}
              >
                <option value="goal">Goal</option>
                <option value="assist">Assist</option>
                <option value="sub">Substitution</option>
                <option value="injury">Injury</option>
                <option value="note">Note</option>
              </select>
            </div>

            {eventDraft.type !== "note" ? (
              <div>
                <div style={labelStyle()}>
                  {eventDraft.type === "goal"
                    ? "Scorer"
                    : eventDraft.type === "assist"
                    ? "Player"
                    : eventDraft.type === "injury"
                    ? "Injured player"
                    : "Player off"}
                </div>
                <select
                  value={eventDraft.playerId}
                  onChange={(e) => setEventDraft((prev) => ({ ...prev, playerId: e.target.value }))}
                  style={fieldStyle()}
                >
                  <option value="">Choose player</option>
                  {matchPlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            {eventDraft.type === "goal" || eventDraft.type === "sub" ? (
              <div>
                <div style={labelStyle()}>
                  {eventDraft.type === "goal" ? "Assist (optional)" : "Player on"}
                </div>
                <select
                  value={eventDraft.secondPlayerId}
                  onChange={(e) =>
                    setEventDraft((prev) => ({ ...prev, secondPlayerId: e.target.value }))
                  }
                  style={fieldStyle()}
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
              </div>
            ) : null}

            {eventDraft.type === "note" ? (
              <div>
                <div style={labelStyle()}>Coach note</div>
                <textarea
                  value={eventDraft.note}
                  onChange={(e) => setEventDraft((prev) => ({ ...prev, note: e.target.value }))}
                  placeholder="Coach note"
                  style={{
                    ...fieldStyle(),
                    minHeight: 110,
                    resize: "vertical",
                  }}
                />
              </div>
            ) : null}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 16,
            }}
          >
            <PrimaryButton onClick={() => void onSave()}>
              {editingTimelineId ? "Save Changes" : "Save Event"}
            </PrimaryButton>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          </div>
        </PageCard>
      </div>
    </div>
  )
}
