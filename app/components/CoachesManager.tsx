"use client"

import { useMemo, useState } from "react"
import type { Coach, CoachAvailability, CoachAvailabilityStatus } from "../lib/types"
import { makeId } from "../lib/types"
import {
  Badge,
  DangerButton,
  PageCard,
  PrimaryButton,
  SecondaryButton,
  SectionHeader,
} from "./ui"

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

function statusBadgeTone(status: CoachAvailabilityStatus): "green" | "yellow" | "red" {
  if (status === "available") return "green"
  if (status === "holiday") return "yellow"
  return "red"
}

function statusLabel(status: CoachAvailabilityStatus) {
  if (status === "available") return "Available"
  if (status === "holiday") return "Holiday"
  return "Unavailable"
}

function inputStyle() {
  return {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: 14,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    background: "white",
  }
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

  function resetForm() {
    setEditingCoachId(null)
    setCoachName("")
    setCoachRole("")
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard>
        <SectionHeader
          title="Coaches"
          subtitle={`Manage coach details and availability for ${new Date(
            `${selectedDate}T12:00:00`
          ).toLocaleDateString("en-GB", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}`}
        />

        {isAdmin ? (
          <div
            style={{
              display: "grid",
              gap: 10,
              marginBottom: 16,
              padding: 14,
              borderRadius: 16,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontWeight: 900, color: "#0f172a" }}>
              {editingCoachId ? "Edit Coach" : "Add Coach"}
            </div>

            <input
              value={coachName}
              onChange={(e) => setCoachName(e.target.value)}
              placeholder="Coach name"
              style={inputStyle()}
            />

            <input
              value={coachRole}
              onChange={(e) => setCoachRole(e.target.value)}
              placeholder="Coach role"
              style={inputStyle()}
            />

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <PrimaryButton onClick={() => void handleAddOrUpdateCoach()}>
                {editingCoachId ? "Update Coach" : "Add Coach"}
              </PrimaryButton>

              {editingCoachId ? (
                <SecondaryButton onClick={resetForm}>Cancel</SecondaryButton>
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
                    background: "white",
                    border: "1px solid #e2e8f0",
                    display: "grid",
                    gap: 12,
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
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>{coach.name}</div>
                      <div style={{ color: "#64748b", marginTop: 4 }}>{coach.role}</div>
                    </div>

                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                      <Badge tone={statusBadgeTone(currentStatus)}>
                        {statusLabel(currentStatus)}
                      </Badge>

                      {isAdmin ? (
                        <>
                          <SecondaryButton onClick={() => handleEditCoach(coach)}>
                            Edit
                          </SecondaryButton>
                          <DangerButton onClick={() => void handleDeleteCoach(coach.id)}>
                            Delete
                          </DangerButton>
                        </>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {(["available", "unavailable", "holiday"] as CoachAvailabilityStatus[]).map((status) => (
                      <button
                        key={status}
                        disabled={!isAdmin}
                        onClick={() => void onSaveCoachAvailability(coach.id, selectedDate, status)}
                        style={statusStyle(status, currentStatus === status)}
                      >
                        {statusLabel(status)}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </PageCard>
    </div>
  )
}
