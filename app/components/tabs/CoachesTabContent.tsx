"use client"

import CoachesManager from "../CoachesManager"
import { type Coach, type CoachAvailability, type CoachAvailabilityStatus } from "../../lib/types"
import { Badge, PageCard, SectionHeader } from "../ui"

type Props = {
  isAdmin: boolean
  selectedDate: string
  coaches: Coach[]
  coachAvailability: CoachAvailability[]
  selectedDateCoachAvailability: CoachAvailability[]
  formatFullDate: (date: string) => string
  saveCoaches: (nextCoaches: Coach[]) => Promise<void>
  saveCoachAvailability: (
    coachId: string,
    day: string,
    status: CoachAvailabilityStatus,
    notes?: string
  ) => Promise<void>
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

function StatBox({
  label,
  value,
  tone = "default",
}: {
  label: string
  value: string | number
  tone?: "default" | "green" | "yellow" | "red"
}) {
  const style =
    tone === "green"
      ? {
          background: "#dcfce7",
          border: "1px solid #86efac",
          color: "#166534",
        }
      : tone === "yellow"
      ? {
          background: "#fef3c7",
          border: "1px solid #fcd34d",
          color: "#92400e",
        }
      : tone === "red"
      ? {
          background: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#991b1b",
        }
      : {
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          color: "#334155",
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

export default function CoachesTabContent({
  isAdmin,
  selectedDate,
  coaches,
  coachAvailability,
  selectedDateCoachAvailability,
  formatFullDate,
  saveCoaches,
  saveCoachAvailability,
}: Props) {
  const availableCount = selectedDateCoachAvailability.filter((item) => item.status === "available").length
  const unavailableCount = selectedDateCoachAvailability.filter((item) => item.status === "unavailable").length
  const holidayCount = selectedDateCoachAvailability.filter((item) => item.status === "holiday").length

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <PageCard tone="softBlue">
        <SectionHeader
          title="Coach Availability"
          subtitle={`Snapshot for ${formatFullDate(selectedDate)}`}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <StatBox label="Available" value={availableCount} tone="green" />
          <StatBox label="Unavailable" value={unavailableCount} tone="red" />
          <StatBox label="Holiday" value={holidayCount} tone="yellow" />
        </div>

        {selectedDateCoachAvailability.length > 0 ? (
          <div style={{ display: "grid", gap: 10 }}>
            {selectedDateCoachAvailability.map((item) => {
              const coach = coaches.find((c) => c.id === item.coachId)

              return (
                <div
                  key={item.id}
                  style={{
                    padding: 14,
                    borderRadius: 18,
                    background: "white",
                    border: "1px solid #dbe3ef",
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
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>
                        {coach?.name || "Unknown coach"}
                      </div>
                      <div style={{ color: "#475569", marginTop: 4 }}>
                        {coach?.role || "No role"}
                      </div>
                    </div>

                    <Badge tone={statusTone(item.status)}>{statusLabel(item.status)}</Badge>
                  </div>

                  {item.notes ? (
                    <div
                      style={{
                        color: "#64748b",
                        fontSize: 14,
                        lineHeight: 1.45,
                        paddingTop: 2,
                      }}
                    >
                      {item.notes}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ color: "#64748b" }}>
            No coach availability recorded for this day yet.
          </div>
        )}
      </PageCard>

      <CoachesManager
        isAdmin={isAdmin}
        selectedDate={selectedDate}
        coaches={coaches}
        coachAvailability={coachAvailability}
        onSaveCoaches={saveCoaches}
        onSaveCoachAvailability={saveCoachAvailability}
      />
    </div>
  )
}
