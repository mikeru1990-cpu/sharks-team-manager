"use client"

import RollingCalendar from "../RollingCalendar"
import TrainingPlansManager from "../TrainingPlansManager"
import SessionTimer from "../SessionTimer"
import SessionHistory from "../SessionHistory"
import { buildSessionFromTemplate } from "../../lib/sessionBuilder"
import {
  buttonPrimary,
  buttonSecondary,
  cardStyle,
  type AttendanceStatus,
  type EventAttendance,
  type Player,
  type TrainingSession,
  type TrainingSessionRecord,
  type TrainingTemplate,
} from "../../lib/types"
import type { EventWithPlan, TrainingPlanState } from "../../lib/dashboardTypes"

type Props = {
  isAdmin: boolean
  selectedDate: string
  setSelectedDate: (date: string) => void

  events: EventWithPlan[]
  selectedDateEvents: EventWithPlan[]
  selectedEvent: EventWithPlan | null
  selectedEventId: string | null
  setSelectedEventId: (value: string | null) => void

  activeMatchEventId: string | null
  setActiveMatchEventId: (value: string | null) => void

  players: Player[]
  attendance: EventAttendance[]

  allTrainingPlans: TrainingTemplate[]
  selectedTemplateId: string
  setSelectedTemplateId: (value: string) => void
  trainingPlan: TrainingPlanState
  setTrainingPlan: (value: TrainingPlanState) => void

  selectedDbTrainingPlanId: string
  setSelectedDbTrainingPlanId: (value: string) => void

  activeSession: TrainingSession | null
  setActiveSession: (value: TrainingSession | null) => void
  sessionHistory: TrainingSessionRecord[]

  formatFullDate: (date: string) => string
  statusStyle: (status: AttendanceStatus) => {
    border: string
    background: string
    color: string
  }

  countAttendance: (eventId: string, status: AttendanceStatus) => number
  getPlayerStatus: (eventId: string, playerId: string) => AttendanceStatus | null
  loadTrainingPlanFromEvent: (event: EventWithPlan) => void

  persistSettings: (patch?: Partial<{ selectedDate: string; activeMatchEventId: string | null }>) => Promise<void>
  saveAttendance: (eventId: string, playerId: string, status: AttendanceStatus) => Promise<void>
  saveTrainingPlans: (nextPlans: TrainingTemplate[]) => Promise<void>
  saveSessionRecord: (record: TrainingSessionRecord) => Promise<void>

  openAddCalendarEvent: () => void
  openEditCalendarEvent: (event: EventWithPlan) => void
  deleteCalendarEvent: (id: string) => Promise<void>
}

function eventAccent(type: "training" | "match" | "other") {
  if (type === "match") return "#2563eb"
  if (type === "training") return "#16a34a"
  return "#94a3b8"
}

export default function EventsTabContent(props: Props) {
  const {
    isAdmin,
    selectedDate,
    setSelectedDate,
    events,
    selectedDateEvents,
    selectedEvent,
    selectedEventId,
    setSelectedEventId,
    activeMatchEventId,
    setActiveMatchEventId,
    players,
    allTrainingPlans,
    selectedTemplateId,
    setSelectedTemplateId,
    trainingPlan,
    setTrainingPlan,
    activeSession,
    setActiveSession,
    sessionHistory,
    formatFullDate,
    statusStyle,
    countAttendance,
    getPlayerStatus,
    loadTrainingPlanFromEvent,
    persistSettings,
    saveAttendance,
    saveTrainingPlans,
    saveSessionRecord,
    openAddCalendarEvent,
    openEditCalendarEvent,
    deleteCalendarEvent,
  } = props

  const availableCount = selectedEvent ? countAttendance(selectedEvent.id, "available") : 0
  const maybeCount = selectedEvent ? countAttendance(selectedEvent.id, "maybe") : 0
  const unavailableCount = selectedEvent ? countAttendance(selectedEvent.id, "unavailable") : 0

  return (
    <>
      <div style={{ display: "grid", gap: 12 }}>
        <div
          style={{
            ...cardStyle(),
            padding: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>Events</div>
            <div style={{ fontSize: 14, color: "#64748b" }}>
              Calendar, attendance, training plans and session tools.
            </div>
          </div>

          {isAdmin ? (
            <button onClick={openAddCalendarEvent} style={buttonPrimary()}>
              + Add
            </button>
          ) : null}
        </div>

        <div style={{ ...cardStyle(), padding: 12 }}>
          <RollingCalendar
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              setSelectedDate(date)
              void persistSettings({ selectedDate: date })
            }}
            events={events}
          />
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          {selectedDateEvents.length === 0 ? (
            <div style={{ ...cardStyle(), color: "#64748b" }}>No calendar events on this day.</div>
          ) : (
            selectedDateEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => {
                  setSelectedEventId(event.id)
                  if (event.type === "training") loadTrainingPlanFromEvent(event)
                }}
                style={{
                  ...cardStyle(),
                  padding: 12,
                  textAlign: "left",
                  border:
                    selectedEventId === event.id
                      ? `2px solid ${eventAccent(event.type)}`
                      : "1px solid #dbe3ef",
                  borderLeft: `6px solid ${eventAccent(event.type)}`,
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 18 }}>{event.title}</div>

                <div style={{ color: "#64748b", marginTop: 6, fontSize: 14 }}>
                  {event.type}
                  {event.startTime ? ` • ${event.startTime}` : ""}
                  {event.location ? ` • ${event.location}` : ""}
                </div>

                {event.opponent ? (
                  <div style={{ color: "#475569", marginTop: 6, fontSize: 14 }}>
                    Opponent: {event.opponent}
                  </div>
                ) : null}

                {event.trainingPlanName ? (
                  <div style={{ color: "#475569", marginTop: 6, fontSize: 13 }}>
                    Training plan: {event.trainingPlanName}
                  </div>
                ) : null}

                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div
                    style={{
                      ...statusStyle("available"),
                      padding: "6px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Avail {countAttendance(event.id, "available")}
                  </div>
                  <div
                    style={{
                      ...statusStyle("maybe"),
                      padding: "6px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Maybe {countAttendance(event.id, "maybe")}
                  </div>
                  <div
                    style={{
                      ...statusStyle("unavailable"),
                      padding: "6px 10px",
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Unavail {countAttendance(event.id, "unavailable")}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>

        {selectedEvent ? (
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
              <div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>{formatFullDate(selectedEvent.date)}</div>
                <div style={{ fontSize: 20, fontWeight: 900, marginTop: 6 }}>{selectedEvent.title}</div>
                <div style={{ color: "#64748b", marginTop: 6 }}>
                  {selectedEvent.type}
                  {selectedEvent.startTime ? ` • ${selectedEvent.startTime}` : ""}
                  {selectedEvent.location ? ` • ${selectedEvent.location}` : ""}
                </div>

                {selectedEvent.trainingPlanName ? (
                  <div style={{ color: "#475569", marginTop: 8 }}>
                    Training plan: <strong>{selectedEvent.trainingPlanName}</strong>
                  </div>
                ) : null}

                {selectedEvent.opponent ? (
                  <div style={{ color: "#64748b", marginTop: 6 }}>Opponent: {selectedEvent.opponent}</div>
                ) : null}

                {selectedEvent.notes ? (
                  <div style={{ color: "#475569", marginTop: 8 }}>{selectedEvent.notes}</div>
                ) : null}
              </div>

              {isAdmin ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {selectedEvent.type === "match" ? (
                    <button
                      onClick={() => {
                        setActiveMatchEventId(selectedEvent.id)
                        void persistSettings({ activeMatchEventId: selectedEvent.id })
                      }}
                      style={activeMatchEventId === selectedEvent.id ? buttonPrimary() : buttonSecondary()}
                    >
                      {activeMatchEventId === selectedEvent.id ? "Active Match Day" : "Use for Match Day"}
                    </button>
                  ) : null}

                  <button onClick={() => openEditCalendarEvent(selectedEvent)} style={buttonSecondary()}>
                    Edit
                  </button>

                  <button onClick={() => void deleteCalendarEvent(selectedEvent.id)} style={buttonSecondary()}>
                    Delete
                  </button>
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              <div
                style={{
                  ...statusStyle("available"),
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontWeight: 800,
                }}
              >
                Available {availableCount}
              </div>
              <div
                style={{
                  ...statusStyle("maybe"),
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontWeight: 800,
                }}
              >
                Maybe {maybeCount}
              </div>
              <div
                style={{
                  ...statusStyle("unavailable"),
                  padding: "8px 12px",
                  borderRadius: 999,
                  fontWeight: 800,
                }}
              >
                Unavailable {unavailableCount}
              </div>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {players.map((player) => {
                const currentStatus = getPlayerStatus(selectedEvent.id, player.id)

                return (
                  <div
                    key={player.id}
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      border: "1px solid #e2e8f0",
                      background: "#f8fafc",
                    }}
                  >
                    <div style={{ fontWeight: 900, marginBottom: 8 }}>{player.name}</div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {(["available", "maybe", "unavailable"] as AttendanceStatus[]).map((status) => {
                        const active = currentStatus === status

                        return (
                          <button
                            key={status}
                            onClick={() => void saveAttendance(selectedEvent.id, player.id, status)}
                            style={{
                              padding: "10px 12px",
                              borderRadius: 999,
                              fontWeight: 800,
                              ...(active
                                ? statusStyle(status)
                                : {
                                    border: "1px solid #cbd5e1",
                                    background: "white",
                                    color: "#334155",
                                  }),
                            }}
                          >
                            {status}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}

        <div style={cardStyle()}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Training Templates</div>

          <div style={{ display: "grid", gap: 10, marginBottom: 14 }}>
            {allTrainingPlans.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplateId(template.id)
                  setTrainingPlan({
                    title: template.name,
                    warmUp: template.warmUp,
                    drill1: template.drill1,
                    drill2: template.drill2,
                    game: template.game,
                    notes: template.notes,
                  })
                }}
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 16,
                  border: selectedTemplateId === template.id ? "2px solid #1d4ed8" : "1px solid #dbe3ef",
                  background: selectedTemplateId === template.id ? "#dbeafe" : "#f8fafc",
                  width: "100%",
                  boxSizing: "border-box",
                  overflow: "hidden",
                }}
              >
                <div style={{ fontWeight: 900 }}>{template.name}</div>
                <div
                  style={{
                    color: "#64748b",
                    marginTop: 4,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {template.notes}
                </div>
              </button>
            ))}
          </div>

          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Training Plan</div>
          <div style={{ display: "grid", gap: 10 }}>
            {[
              ["Session Title", trainingPlan.title],
              ["Warm Up", trainingPlan.warmUp],
              ["Drill 1", trainingPlan.drill1],
              ["Drill 2", trainingPlan.drill2],
              ["Game", trainingPlan.game],
              ["Coach Notes", trainingPlan.notes],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: 12,
                  borderRadius: 16,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  minWidth: 0,
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 6 }}>{label}</div>
                <div style={{ color: "#475569", overflowWrap: "anywhere" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={cardStyle()}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900 }}>Live Session Builder</div>
            <button
              onClick={() => {
                const template = allTrainingPlans.find((plan) => plan.id === selectedTemplateId)
                if (!template) return
                setActiveSession(buildSessionFromTemplate(template))
              }}
              style={buttonPrimary()}
            >
              Generate Session
            </button>
          </div>
        </div>

        <SessionTimer session={activeSession} onSaveSession={saveSessionRecord} />

        <TrainingPlansManager
          isAdmin={isAdmin}
          trainingPlans={allTrainingPlans}
          onSaveTrainingPlans={saveTrainingPlans}
          onUsePlan={(plan) => {
            setSelectedTemplateId(plan.id)
            setTrainingPlan({
              title: plan.name,
              warmUp: plan.warmUp,
              drill1: plan.drill1,
              drill2: plan.drill2,
              game: plan.game,
              notes: plan.notes,
            })
          }}
        />

        <SessionHistory sessions={sessionHistory} />
      </div>

      {isAdmin ? (
        <button
          onClick={openAddCalendarEvent}
          style={{
            position: "fixed",
            right: 16,
            bottom: 96,
            width: 56,
            height: 56,
            borderRadius: "50%",
            border: "none",
            background: "#1d4ed8",
            color: "white",
            fontSize: 28,
            lineHeight: 1,
            boxShadow: "0 10px 24px rgba(15,23,42,0.22)",
            zIndex: 60,
          }}
          aria-label="Add event"
        >
          +
        </button>
      ) : null}
    </>
  )
}
