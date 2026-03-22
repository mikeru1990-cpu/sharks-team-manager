"use client"

import { useMemo, useState } from "react"
import type { Coach, CoachAvailability, CoachAvailabilityStatus } from "../lib/types"
import { buttonPrimary, buttonSecondary, cardStyle, makeId } from "../lib/types"

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
    } as const
  }

  if (status === "available") {
    return {
      padding: "10px 12px",
      borderRadius: 999,
      border: "1px solid #16a34a",
      background: "#dcfce7",
      color: "#166534",
      fontWeight: 800,
    } as const
  }

  if (status === "holiday") {
    return {
      padding: "10px 12px",
      borderRadius: 999,
      border: "1px solid #d97706",
      background: "#fef3c7",
      color: "#92400e",
      fontWeight: 800,
    } as const
  }

  return {
    padding: "10px 12px",
    borderRadius: 999,
    border: "1px solid #dc2626",
    background: "#fee2e2",
    color: "#991b1b",
    fontWeight: 800,
  } as const
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

  const activeCoaches = useMemo(
    () => coaches.filter((coach) => coach.active).sort((a, b) => a.name.localeCompare(b.name)),
    [coaches]
  )

  function getCoachStatus(coachId: string): CoachAvailabilityStatus {
    return (
      coachAvailability.find((item) => item.coachId === coachId && item.day === selectedDate)?.status ||
      "available"
    )
  }

  async function handleAddOrUpdateCoach() {
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
    const confirmed = window.confirm("Delete this coach?")
    if (!confirmed) return
    await onSaveCoaches(coaches.filter((coach) => coach.id !== id))
  }

  function handleEditCoach(coach: Coach) {
    setEditingCoachId(coach.id)
    setCoachName(coach.name)
    setCoachRole(coach.role)
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle()}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Coaches</div>
        <div style={{ color: "#64748b", marginBottom: 14 }}>
          Availability shown for <strong>{new Date(`${selectedDate}T12:00:00`).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}</strong>
        </div>

        {isAdmin ? (
          <div style={{ display: "grid", gap: 10, marginBottom: 16 }}>
            <input
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="Coach name"
              style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
            />
            <input
              value={coachRole}
              onChange={(e) => setCoachRole(e.target.value)}
              placeholder="Coach role"
              style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
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

              return (
                <div
                  key={coach.id}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>{coach.name}</div>
                      <div style={{ color: "#64748b", marginTop: 4 }}>{coach.role}</div>
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

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                    {(["available", "unavailable", "holiday"] as CoachAvailabilityStatus[]).map((status) => (
                      <button
                        key={status}
                        disabled={!isAdmin}
                        onClick={() => void onSaveCoachAvailability(coach.id, selectedDate, status)}
                        style={statusStyle(status, currentStatus === status)}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
