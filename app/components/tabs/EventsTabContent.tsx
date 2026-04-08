"use client"

import RollingCalendar from "../RollingCalendar"
import TrainingPlansManager from "../TrainingPlansManager"
import SessionTimer from "../SessionTimer"
import SessionHistory from "../SessionHistory"
import { buildSessionFromTemplate } from "../../lib/sessionBuilder"
import {
  type AttendanceStatus,
  type EventAttendance,
  type Player,
  type TrainingSession,
  type TrainingSessionRecord,
  type TrainingTemplate,
} from "../../lib/types"
import type {
  EventWithPlan,
  TrainingPlanState,
} from "../../lib/dashboardTypes"
import {
  DangerButton,
  PageCard,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "../ui"

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

function typeBadgeStyle(type: EventWithPlan["type"]) {
  if (type === "match") {
    return {
      background: "#eff6ff",
      border: "1px solid #bfdbfe",
      color: "#1e3a8a",
    }
  }

  if (type === "training") {
    return {
      background: "#ecfdf5",
      border: "1px solid #a7f3d0",
      color: "#065f46",
    }
  }

  return {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#475569",
  }
}

function statusButtonStyle(
  active: boolean,
  status: AttendanceStatus,
  statusStyle: Props["statusStyle"]
) {
  if (active) {
    return {
      ...statusStyle(status),
      padding: "10px 12px",
      borderRadius: 999,
      fontWeight: 800,
    }
  }

  return {
    padding: "10px 12px",
    borderRadius: 999,
    fontWeight: 800,
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#334155",
  }
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
    setSelectedDbTrainingPlanId,
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
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard>
        <SectionHeader
          title="Events"
          subtitle="Calendar, attendance, training plans and session tools."
          action={isAdmin ? <PrimaryButton onClick={openAddCalendarEvent}>Add Event</PrimaryButton> : undefined}
        />

        <RollingCalendar
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date)
            void persistSettings({ selectedDate: date })
          }}
          events={events}
        />
      </PageCard>

      <PageCard>
        <SectionHeader
          title="Events on Selected Day"
          subtitle={formatFullDate(selectedDate)}
        />

        {selectedDateEvents.length === 0 ? (
          <div style={{ color: "#64748b" }}>No calendar events on this day.</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {selectedDateEvents.map((event) => {
              const isSelected = selectedEventId === event.id
              const isActiveMatch = activeMatchEventId === event.id

              return (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEventId(event.id)
                    if (event.type === "training") loadTrainingPlanFromEvent(event)
                  }}
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    border: isSelected ? "2px solid #0f2c73" : "1px solid #e2e8f0",
                    background: isSelected ? "#eff6ff" : "#f8fafc",
                    textAlign: "left",
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ fontWeight: 900, color: "#0f172a" }}>{event.title}</div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <div
                        style={{
                          ...typeBadgeStyle(event.type),
                          padding: "6px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        {event.type}
                      </div>

                      {isActiveMatch ? (
                        <div
                          style={{
                            background: "#dbeafe",
                            border: "1px solid #93c5fd",
                            color: "#1d4ed8",
                            padding: "6px 10px",
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          Active Match
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ color: "#64748b" }}>
                    {event.startTime ? `${event.startTime}` : "00:00"}
                    {event.location ? ` • ${event.location}` : ""}
                    {event.opponent ? ` • vs ${event.opponent}` : ""}
                  </div>

                  {event.trainingPlanName ? (
                    <div style={{ color: "#475569", fontSize: 13 }}>
                      Training plan: <strong>{event.trainingPlanName}</strong>
                    </div>
                  ) : null}

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <div
                      style={{
                        ...statusStyle("available"),
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      Available {countAttendance(event.id, "available")}
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
                      Unavailable {countAttendance(event.id, "unavailable")}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </PageCard>

      {selectedEvent ? (
        <PageCard>
          <SectionHeader
            title={selectedEvent.title}
            subtitle={formatFullDate(selectedEvent.date)}
            action={
              isAdmin ? (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {selectedEvent.type === "match" ? (
                    activeMatchEventId === selectedEvent.id ? (
                      <PrimaryButton
                        onClick={() => {
                          setActiveMatchEventId(selectedEvent.id)
                          void persistSettings({ activeMatchEventId: selectedEvent.id })
                        }}
                      >
                        Active Match
                      </PrimaryButton>
                    ) : (
                      <SecondaryButton
                        onClick={() => {
                          setActiveMatchEventId(selectedEvent.id)
                          void persistSettings({ activeMatchEventId: selectedEvent.id })
                        }}
                      >
                        Set Active Match
                      </SecondaryButton>
                    )
                  ) : null}

                  <SecondaryButton onClick={() => openEditCalendarEvent(selectedEvent)}>
                    Edit
                  </SecondaryButton>

                  <DangerButton onClick={() => void deleteCalendarEvent(selectedEvent.id)}>
                    Delete
                  </DangerButton>
                </div>
              ) : undefined
            }
          />

          <div style={{ display: "grid", gap: 12 }}>
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ color: "#475569" }}>
                {selectedEvent.type}
                {selectedEvent.startTime ? ` • ${selectedEvent.startTime}` : ""}
                {selectedEvent.location ? ` • ${selectedEvent.location}` : ""}
              </div>

              {selectedEvent.trainingPlanName ? (
                <div style={{ color: "#475569" }}>
                  Training plan: <strong>{selectedEvent.trainingPlanName}</strong>
                </div>
              ) : null}

              {selectedEvent.opponent ? (
                <div style={{ color: "#475569" }}>Opponent: {selectedEvent.opponent}</div>
              ) : null}

              {selectedEvent.notes ? (
                <div style={{ color: "#475569" }}>{selectedEvent.notes}</div>
              ) : null}
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
          </div>
        </PageCard>
      ) : null}

      {selectedEvent ? (
        <PageCard>
          <SectionHeader
            title="Attendance"
            subtitle="Tap a status for each player."
          />

          <div style={{ display: "grid", gap: 10 }}>
            {players.map((player) => {
              const currentStatus = getPlayerStatus(selectedEvent.id, player.id)

              return (
                <div
                  key={player.id}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    border: "1px solid #e2e8f0",
                    background: "white",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div style={{ fontWeight: 900 }}>{player.name}</div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(["available", "maybe", "unavailable"] as AttendanceStatus[]).map((status) => {
                      const active = currentStatus === status

                      return (
                        <button
                          key={status}
                          onClick={() => void saveAttendance(selectedEvent.id, player.id, status)}
                          style={statusButtonStyle(active, status, statusStyle)}
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
        </PageCard>
      ) : null}

      <PageCard>
        <SectionHeader
          title="Training Plans"
          subtitle="Choose a plan and review the selected session."
        />

        <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
          {allTrainingPlans.map((template) => {
            const active = selectedTemplateId === template.id

            return (
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
                  border: active ? "2px solid #0f2c73" : "1px solid #dbe3ef",
                  background: active ? "#dbeafe" : "#f8fafc",
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
            )
          })}
        </div>

        <SectionHeader title="Selected Plan" />

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
      </PageCard>

      <PageCard>
        <SectionHeader
          title="Session Builder"
          subtitle="Generate a live session from the selected training plan."
          action={
            <PrimaryButton
              onClick={() => {
                const template = allTrainingPlans.find((plan) => plan.id === selectedTemplateId)
                if (!template) return
                setActiveSession(buildSessionFromTemplate(template))
              }}
            >
              Generate Session
            </PrimaryButton>
          }
        />
      </PageCard>

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
          setSelectedDbTrainingPlanId(plan.id)
        }}
      />

      <SessionHistory sessions={sessionHistory} />
    </div>
  )
}
