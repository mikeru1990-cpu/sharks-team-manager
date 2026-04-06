"use client"

import { buttonPrimary, buttonSecondary, cardStyle, type TrainingTemplate } from "../../lib/types"

type Props = {
  open: boolean
  editingCalendarEventId: string | null
  eventTitle: string
  setEventTitle: (value: string) => void
  eventType: "training" | "match" | "other"
  setEventType: (value: "training" | "match" | "other") => void
  selectedDbTrainingPlanId: string
  setSelectedDbTrainingPlanId: (value: string) => void
  allTrainingPlans: TrainingTemplate[]
  eventStartTime: string
  setEventStartTime: (value: string) => void
  eventLocation: string
  setEventLocation: (value: string) => void
  eventOpponent: string
  setEventOpponent: (value: string) => void
  eventNotes: string
  setEventNotes: (value: string) => void
  selectedDate: string
  onSave: () => Promise<void> | void
  onClose: () => void
}

export default function EventFormModal(props: Props) {
  const {
    open,
    editingCalendarEventId,
    eventTitle,
    setEventTitle,
    eventType,
    setEventType,
    selectedDbTrainingPlanId,
    setSelectedDbTrainingPlanId,
    allTrainingPlans,
    eventStartTime,
    setEventStartTime,
    eventLocation,
    setEventLocation,
    eventOpponent,
    setEventOpponent,
    eventNotes,
    setEventNotes,
    selectedDate,
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
      <div style={{ ...cardStyle(), width: "100%", maxWidth: 460 }}>
        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>
          {editingCalendarEventId ? "Edit Calendar Event" : "Add Calendar Event"}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder="Event title"
            style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
          />

          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value as "training" | "match" | "other")}
            style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
          >
            <option value="training">Training</option>
            <option value="match">Match</option>
            <option value="other">Other</option>
          </select>

          {eventType === "training" ? (
            <select
              value={selectedDbTrainingPlanId}
              onChange={(e) => setSelectedDbTrainingPlanId(e.target.value)}
              style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
            >
              <option value="">No linked training plan</option>
              {allTrainingPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
          ) : null}

          <input
            value={eventStartTime}
            onChange={(e) => setEventStartTime(e.target.value)}
            placeholder="Start time e.g. 18:00"
            style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
          />

          <input
            value={eventLocation}
            onChange={(e) => setEventLocation(e.target.value)}
            placeholder="Location"
            style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
          />

          <input
            value={eventOpponent}
            onChange={(e) => setEventOpponent(e.target.value)}
            placeholder="Opponent"
            style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
          />

          <textarea
            value={eventNotes}
            onChange={(e) => setEventNotes(e.target.value)}
            placeholder="Notes"
            style={{
              minHeight: 90,
              padding: 14,
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              resize: "vertical",
            }}
          />

          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              color: "#475569",
            }}
          >
            Date: <strong>{selectedDate}</strong>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={() => void onSave()} style={{ ...buttonPrimary(), flex: 1 }}>
            Save
          </button>
          <button onClick={onClose} style={{ ...buttonSecondary(), flex: 1 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
