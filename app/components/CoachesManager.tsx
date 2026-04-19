"use client"

import { useMemo, useState } from "react"
import type { Coach, CoachAvailability, CoachAvailabilityStatus } from "../lib/types"
import { makeId } from "../lib/types"
import { THEME } from "../lib/theme"
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

function inputStyle() {
  return {
    width: "100%",
    boxSizing: "border-box" as const,
    padding: 14,
    borderRadius: 16,
    border: "1px solid #cbd5e1",
    fontSize: 16,
    background: "white",
  }
}

function statusTone(status: CoachAvailabilityStatus): "green" | "yellow" | "red" {
  if (status === "available") return "green"
  if (status === "holiday") return "yellow"
  return "red"
}

function statusLabel(status: CoachAvailabilityStatus) {
  if (status === "available") return "Available"
  if (status === "holiday") return "Holiday"
  return "Unavailable"
}

function statusButtonStyle(status: CoachAvailabilityStatus, active: boolean) {
  if (active && status === "available") {
    return {
      border: "1px solid #86efac",
      background: "#dcfce7",
      color: "#166534",
    }
  }

  if (active && status === "holiday") {
    return {
      border: "1px solid #fcd34d",
      background: "#fef3c7",
      color: "#92400e",
    }
  }

  if (active && status === "unavailable") {
    return {
      border: "1px solid #fecaca",
      background: "#fee2e2",
      color: "#991b1b",
    }
  }

  return {
    border: "1px solid #cbd5e1",
    background: "white",
    color: "#334155",
  }
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string | number
  tone?: "default" | "blue" | "green" | "yellow"
}) {
  const style =
    tone === "blue"
      ? {
          background: "#dbeafe",
          color: "#1d4ed8",
          border: "1px solid #bfdbfe",
        }
      : tone === "green"
      ? {
          background: "#dcfce7",
          color: "#166534",
          border: "1px solid #86efac",
        }
      : tone === "yellow"
      ? {
          background: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fcd34d",
        }
      : {
          background: "#f8fafc",
          color: "#334155",
          border: "1px solid #e2e8f0",
        }

  return (
    <div
      style={{
        ...style,
        borderRadius: 18,
        padding: 14,
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontSize: 12, fontWeight: 800 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 900, lineHeight: 1 }}>{value}</div>
    </div>
  )
}

function EmptyState({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        border: "1px dashed #cbd5e1",
        background: "#f8fafc",
        padding: 18,
        display: "grid",
        gap: 4,
      }}
    >
      <div style={{ fontWeight: 800, color: THEME.colors.textPrimary }}>{title}</div>
      <div style={{ color: THEME.colors.textSecondary, fontSize: 14 }}>{subtitle}</div>
    </div>
  )
}

function CoachCard({
  coach,
  currentStatus,
  isAdmin,
  onSetStatus,
  onEdit,
  onDelete,
}: {
  coach: Coach
  currentStatus: CoachAvailabilityStatus
  isAdmin: boolean
  onSetStatus: (status: CoachAvailabilityStatus) => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 20,
        background: "white",
        border: "1px solid #e2e8f0",
        display: "grid",
        gap: 12,
        boxShadow: "0 6px 16px rgba(15,23,42,0.04)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "56px minmax(0, 1fr) auto",
          gap: 12,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 18,
            background: "linear-gradient(180deg,#ffffff 0%,#dbeafe 100%)",
            border: "1px solid #bfdbfe",
            display: "grid",
            placeItems: "center",
            fontWeight: 900,
            fontSize: 18,
            color: "#1d4ed8",
          }}
        >
          {coach.name
            .split(" ")
            .filter(Boolean)
            .map((part) => part[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontWeight: 900,
              fontSize: 18,
              color: THEME.colors.textPrimary,
              lineHeight: 1.15,
            }}
          >
            {coach.name}
          </div>
          <div style={{ color: THEME.colors.textSecondary, marginTop: 4, fontSize: 14 }}>
            {coach.role}
          </div>
        </div>

        <div>
          <Badge tone={statusTone(currentStatus)}>{statusLabel(currentStatus)}</Badge>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {(["available", "unavailable", "holiday"] as CoachAvailabilityStatus[]).map((status) => {
          const style = statusButtonStyle(status, currentStatus === status)

          return (
            <button
              key={status}
              disabled={!isAdmin}
              onClick={() => onSetStatus(status)}
              style={{
                ...style,
                padding: "10px 12px",
                borderRadius: 999,
                fontWeight: 800,
                cursor: isAdmin ? "pointer" : "default",
              }}
            >
              {statusLabel(status)}
            </button>
          )
        })}
      </div>

      {isAdmin ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <SecondaryButton onClick={onEdit}>Edit</SecondaryButton>
          <DangerButton onClick={onDelete}>Delete</DangerButton>
        </div>
      ) : null}
    </div>
  )
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

  const availableCount = useMemo(
    () =>
      activeCoaches.filter(
        (coach) =>
          (coachAvailability.find((item) => item.coachId === coach.id && item.day === selectedDate)
            ?.status || "available") === "available"
      ).length,
    [activeCoaches, coachAvailability, selectedDate]
  )

  const holidayCount = useMemo(
    () =>
      activeCoaches.filter(
        (coach) =>
          (coachAvailability.find((item) => item.coachId === coach.id && item.day === selectedDate)
            ?.status || "available") === "holiday"
      ).length,
    [activeCoaches, coachAvailability, selectedDate]
  )

  function getCoachStatus(coachId: string): CoachAvailabilityStatus {
    return (
      coachAvailability.find((item) => item.coachId === coachId && item.day === selectedDate)?.status ||
      "available"
    )
  }

  async function handleAddOrUpdateCoach() {
    if (!coachName.trim()) {
      window.alert("Enter coach name")
      return
    }

    if (!coachRole.trim()) {
      window.alert("Enter coach role")
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
      <PageCard tone="blue">
        <SectionHeader
          title="Coaches"
          subtitle={`Manage coach details and daily availability.`}
          light
        />
      </PageCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
        }}
      >
        <StatCard label="Active Coaches" value={activeCoaches.length} tone="blue" />
        <StatCard label="Available" value={availableCount} tone="green" />
        <StatCard label="Holiday" value={holidayCount} tone="yellow" />
        <StatCard label="Selected Date" value={selectedDate.slice(5)} />
      </div>

      {isAdmin ? (
        <PageCard tone="softBlue">
          <SectionHeader
            title={editingCoachId ? "Edit Coach" : "Add Coach"}
            subtitle="Update coach details and roles."
          />

          <div style={{ display: "grid", gap: 10 }}>
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

            <div style={{ display: "grid", gridTemplateColumns: editingCoachId ? "1fr 1fr" : "1fr", gap: 10 }}>
              <PrimaryButton onClick={() => void handleAddOrUpdateCoach()}>
                {editingCoachId ? "Update Coach" : "Add Coach"}
              </PrimaryButton>

              {editingCoachId ? <SecondaryButton onClick={resetForm}>Cancel</SecondaryButton> : null}
            </div>
          </div>
        </PageCard>
      ) : null}

      <PageCard>
        <SectionHeader
          title="Coach List"
          subtitle={`${activeCoaches.length} active coach${activeCoaches.length === 1 ? "" : "es"}`}
        />

        {activeCoaches.length === 0 ? (
          <EmptyState
            title="No coaches found"
            subtitle="Add a coach to start tracking roles and availability."
          />
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
              gap: 12,
            }}
          >
            {activeCoaches.map((coach) => {
              const currentStatus = getCoachStatus(coach.id)

              return (
                <CoachCard
                  key={coach.id}
                  coach={coach}
                  currentStatus={currentStatus}
                  isAdmin={isAdmin}
                  onSetStatus={(status) => void onSaveCoachAvailability(coach.id, selectedDate, status)}
                  onEdit={() => handleEditCoach(coach)}
                  onDelete={() => void handleDeleteCoach(coach.id)}
                />
              )
            })}
          </div>
        )}
      </PageCard>
    </div>
  )
}
