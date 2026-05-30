"use client"

import { useState } from "react"
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
  onSave: (repeatWeeklyCount?: number) => Promise<void> | void
  onClose: () => void
}

function overlayStyle() {
  return {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(2,6,23,0.72)",
    display: "grid",
    placeItems: "center",
    zIndex: 200,
    padding: 16,
    backdropFilter: "blur(10px)",
  }
}

function fieldStyle() {
  return {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.26)",
    fontSize: 16,
    background: "rgba(2,6,23,0.58)",
    color: "#f8fafc",
    outline: "none",
  }
}

function labelStyle() {
  return {
    fontWeight: 900,
    fontSize: 13,
    color: "#e2e8f0",
    marginBottom: 6,
  }
}

function addWeeks(date: string, weeks: number) {
  const next = new Date(`${date}T12:00:00`)
  next.setDate(next.getDate() + weeks * 7)
  return next.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
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

  const [repeatWeekly, setRepeatWeekly] = useState(false)
  const [repeatWeeklyCount, setRepeatWeeklyCount] = useState(6)

  if (!open) return null

  const repeatCount = repeatWeekly && !editingCalendarEventId ? Math.max(1, Math.min(52, repeatWeeklyCount || 1)) : 1
  const lastRepeatDate = repeatCount > 1 ? addWeeks(selectedDate, repeatCount - 1) : ""

  return (
    <div style={overlayStyle()}>
      <div style={{ width: "100%", maxWidth: 580, maxHeight: "92vh", overflowY: "auto" }}>
        <PageCard>
          <SectionHeader
            title={editingCalendarEventId ? "Edit Event" : "Add Event"}
            subtitle="Create training, matches, club events and repeated weekly sessions."
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
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

            {!editingCalendarEventId ? (
              <div className="sharks-glass" style={{ borderRadius: 18, padding: 14, border: "1px solid rgba(125,211,252,0.22)", display: "grid", gap: 12 }}>
                <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, color: "#f8fafc", fontWeight: 1000 }}>
                  <span>Repeat weekly</span>
                  <input
                    type="checkbox"
                    checked={repeatWeekly}
                    onChange={(e) => setRepeatWeekly(e.target.checked)}
                    style={{ width: 22, height: 22 }}
                  />
                </label>

                {repeatWeekly ? (
                  <div>
                    <div style={labelStyle()}>Create this event for how many weeks?</div>
                    <select
                      value={repeatWeeklyCount}
                      onChange={(e) => setRepeatWeeklyCount(Number(e.target.value))}
                      style={fieldStyle()}
                    >
                      {[2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map((count) => (
                        <option key={count} value={count}>{count} weeks</option>
                      ))}
                    </select>
                    <div style={{ marginTop: 8, color: "#cbd5e1", fontSize: 13, fontWeight: 700 }}>
                      Creates {repeatCount} weekly events. Last one: {lastRepeatDate}.
                    </div>
                  </div>
                ) : null}
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

            <div className="sharks-glass" style={{ padding: 14, borderRadius: 16, color: "#cbd5e1", border: "1px solid rgba(148,163,184,0.20)" }}>
              <strong style={{ color: "#f8fafc" }}>Start date:</strong> {selectedDate}
              {repeatCount > 1 ? <div style={{ marginTop: 6 }}><strong style={{ color: "#f8fafc" }}>Repeat:</strong> weekly for {repeatCount} weeks</div> : null}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 16 }}>
            <PrimaryButton onClick={() => void onSave(repeatCount)}>
              {editingCalendarEventId ? "Save Changes" : repeatCount > 1 ? `Create ${repeatCount} Events` : "Save Event"}
            </PrimaryButton>
            <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          </div>
        </PageCard>
      </div>
    </div>
  )
}
