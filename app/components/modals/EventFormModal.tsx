"use client"

import { THEME } from "../../lib/theme"
import {
  PageCard,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
  Badge,
} from "../ui"
import type { TrainingTemplate } from "../../lib/types"

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
    <div style={overlayStyle()}>
      <div style={{ width: "100%", maxWidth: 560 }}>
        <PageCard>
          <SectionHeader
            title={editingCalendarEventId ? "Edit Event" : "Add Event"}
            subtitle="Create or update a training session, match, or other club event."
            action={<Badge tone="blue">{selectedDate}</Badge>}
          />

          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <div style={labelStyle()}>Event title</div>
              <input
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title"
                style={fieldStyle()}
              />
            </div>

            <div>
              <div style={labelStyle()}>Event type</div>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as "training" | "match" | "other")}
                style={fieldStyle()}
              >
                <option value="training">Training</option>
                <option value="match">Match</option>
                <option value="other">Other</option>
              </select>
            </div>

            {eventType === "training" ? (
              <div>
                <div style={labelStyle()}>Linked training plan</div>
                <select
                  value={selectedDbTrainingPlanId}
                  onChange={(e) => setSelectedDbTrainingPlanId(e.target.value)}
                  style={fieldStyle()}
                >
                  <option value="">No linked training plan</option>
                  {allTrainingPlans.map((plan) => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 12,
              }}
            >
              <div>
                <div style={labelStyle()}>Start time</div>
                <input
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  placeholder="18:00"
                  style={fieldStyle()}
                />
              </div>

              <div>
                <div style={labelStyle()}>Location</div>
                <input
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="Location"
                  style={fieldStyle()}
                />
              </div>
            </div>

            {eventType === "match" ? (
              <div>
                <div style={labelStyle()}>Opponent</div>
                <input
                  value={eventOpponent}
                  onChange={(e) => setEventOpponent(e.target.value)}
                  placeholder="Opponent"
                  style={fieldStyle()}
                />
              </div>
            ) : null}

            <div>
              <div style={labelStyle()}>Notes</div>
              <textarea
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
                placeholder="Notes"
                style={{
                  ...fieldStyle(),
                  minHeight: 110,
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                color: THEME.colors.textSecondary,
              }}
            >
              <strong style={{ color: THEME.colors.textPrimary }}>Date:</strong> {selectedDate}
            </div>
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
              {editingCalendarEventId ? "Save Changes" : "Save Event"}
            </PrimaryButton>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          </div>
        </PageCard>
      </div>
    </div>
  )
}
