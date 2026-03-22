"use client"

import { useMemo, useState } from "react"
import type { Coach, CoachAvailability, CoachAvailabilityStatus } from "../lib/types"
import { TEAM, buttonPrimary, buttonSecondary, cardStyle, makeId } from "../lib/types"

type Props = {
  isAdmin: boolean
  selectedDate: string
  coaches: Coach[]
  coachAvailability: CoachAvailability[]
  onSaveCoaches: (nextCoaches: Coach[]) => Promise<void>
  onSaveCoachAvailability: (
    coachId: string,
    day: string,
    status: CoachAvailabilityStatus,
    notes?: string
  ) => Promise<void>
}

function statusStyle(status: CoachAvailabilityStatus, active: boolean) {
  if (!active) {
    return {
      padding: "10px 12px",
      borderRadius: 999,
      border: "1px solid #cbd5e1",
      background: "white",
      color: "#334155",
      fontWeight: 800,
      fontSize: 15,
      textTransform: "capitalize" as const,
    }
  }

  if (status === "available") {
    return {
      padding: "10px 12px",
      borderRadius: 999,
      border: "1px solid #16a34a",
      background: "#dcfce7",
      color: "#166534",
      fontWeight: 800,
      fontSize: 15,
      textTransform: "capitalize" as const,
    }
  }

  if (status === "holiday") {
    return {
      padding: "10px 12px",
      borderRadius: 999,
      border: "1px solid #d97706",
      background: "#fef3c7",
      color: "#92400e",
      fontWeight: 800,
      fontSize: 15,
      textTransform: "capitalize" as const,
    }
  }

  return {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid #dc2626",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 800,
    fontSize: 15,
    textTransform: "capitalize" as const,
  }
}

function formatSelectedDate(selectedDate: string) {
  return new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

export default function CoachesManager({
  isAdmin,
  selectedDate,
  coaches,
  coachAvailability,
  onSaveCoaches,
  onSaveCoachAvailability,
}: Props) {
  const [coachName, setCoachName] = useState("")
  const [coachRole, setCoachRole] = useState("")
  const [editingCoachId, setEditingCoachId] = useState<string | null>(null)
  const [savingCoachId, setSavingCoachId] = useState<string | null>(null)

  const activeCoaches = useMemo(
    () =>
      coaches
        .filter((coach) => coach.active)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name)),
    [coaches]
  )

  const selectedDayAvailability = useMemo(
    () => coachAvailability.filter((item) => item.day === selectedDate),
    [coachAvailability, selectedDate]
  )

  const availableCount = selectedDayAvailability.filter((item) => item.status === "available").length
  const unavailableCount = selectedDayAvailability.filter((item) => item.status === "unavailable").length
  const holidayCount = selectedDayAvailability.filter((item) => item.status === "holiday").length

  function getCoachStatus(coachId: string): CoachAvailabilityStatus {
    return (
      coachAvailability.find((item) => item.coachId === coachId && item.day === selectedDate)?.status ||
      "available"
    )
  }

  async function handleAddOrUpdateCoach() {
    if (!isAdmin) return

    if (!coachName.trim()) {
      alert("Enter coach name")
      return
    }

    if (!coachRole.trim()) {
      alert("Enter coach role")
      return
    }

    if (editingCoachId) {
      const next = coaches.map((coach) =>
        coach.id === editingCoachId
          ? { ...coach, name: coachName.trim(), role: coachRole.trim() }
          : coach
      )
      await onSaveCoaches(next)
      setEditingCoachId(null)
      setCoachName("")
      setCoachRole("")
      return
    }

    const next = [
      ...coaches,
      {
        id: crypto.randomUUID?.() || makeId(),
        name: coachName.trim(),
        role: coachRole.trim(),
        active: true,
      },
    ]

    await onSaveCoaches(next)
    setCoachName("")
    setCoachRole("")
  }

  async function handleDeleteCoach(id: string) {
    if (!isAdmin) return
    const confirmed = window.confirm("Delete this coach?")
    if (!confirmed) return
    await onSaveCoaches(coaches.filter((coach) => coach.id !== id))
  }

  function handleEditCoach(coach: Coach) {
    setEditingCoachId(coach.id)
    setCoachName(coach.name)
    setCoachRole(coach.role)
  }

  async function handleSaveStatus(coachId: string, status: CoachAvailabilityStatus) {
    if (!isAdmin) return
    try {
      setSavingCoachId(coachId)
      await onSaveCoachAvailability(coachId, selectedDate, status)
    } finally {
      setSavingCoachId(null)
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle("#eff6ff")}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Coach Availability</div>
        <div style={{ color: "#475569", marginBottom: 12 }}>
          Tracking for <strong>{formatSelectedDate(selectedDate)}</strong>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              background: "#dcfce7",
              border: "1px solid #86efac",
              color: "#166534",
              fontWeight: 800,
            }}
          >
            Available {availableCount}
          </div>
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontWeight: 800,
            }}
          >
            Unavailable {unavailableCount}
          </div>
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              background: "#fef3c7",
              border: "1px solid #fcd34d",
              color: "#92400e",
              fontWeight: 800,
            }}
          >
            Holiday {holidayCount}
          </div>
        </div>
      </div>

      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Coaches</div>

        {isAdmin ? (
          <div
            style={{
              display: "grid",
              gap: 10,
              marginBottom: 18,
              padding: 14,
              borderRadius: 18,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontWeight: 800, color: "#475569" }}>
              {editingCoachId ? "Edit coach" : "Add coach"}
            </div>

            <input
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="Coach name"
              style={{
                padding: 14,
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                width: "100%",
                boxSizing: "border-box",
              }}
            />

            <input
              value={coachRole}
              onChange={(e) => setCoachRole(e.target.value)}
              placeholder="Coach role"
              style={{
                padding: 14,
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                width: "100%",
                boxSizing: "border-box",
              }}
            />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button onClick={() => void handleAddOrUpdateCoach()} style={buttonPrimary()}>
                {editingCoachId ? "Update Coach" : "Add Coach"}
              </button>

              {editingCoachId ? (
                <button
                  onClick={() => {
                    setEditingCoachId(null)
                    setCoachName("")
                    setCoachRole("")
                  }}
                  style={buttonSecondary()}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 12 }}>
          {activeCoaches.length === 0 ? (
            <div style={{ color: "#64748b" }}>No coaches found.</div>
          ) : (
            activeCoaches.map((coach) => {
              const currentStatus = getCoachStatus(coach.id)
              const isSaving = savingCoachId === coach.id

              return (
                <div
                  key={coach.id}
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    display: "grid",
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: isAdmin ? "minmax(0,1fr) auto" : "1fr",
                      gap: 10,
                      alignItems: "start",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 900,
                          fontSize: 18,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {coach.name}
                      </div>
                      <div style={{ color: "#64748b", marginTop: 4, overflowWrap: "anywhere" }}>
                        {coach.role}
                      </div>
                    </div>

                    {isAdmin ? (
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                        <button onClick={() => handleEditCoach(coach)} style={buttonSecondary()}>
                          Edit
                        </button>
                        <button onClick={() => void handleDeleteCoach(coach.id)} style={buttonSecondary()}>
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(["available", "unavailable", "holiday"] as CoachAvailabilityStatus[]).map((status) => (
                      <button
                        key={status}
                        disabled={!isAdmin || isSaving}
                        onClick={() => void handleSaveStatus(coach.id, status)}
                        style={{
                          ...statusStyle(status, currentStatus === status),
                          opacity: !isAdmin || isSaving ? 0.85 : 1,
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {isSaving ? (
                    <div style={{ color: TEAM.primary, fontWeight: 700, fontSize: 14 }}>
                      Saving...
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
