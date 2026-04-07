"use client"

import CoachesManager from "../CoachesManager"
import { cardStyle, type Coach, type CoachAvailability } from "../../lib/types"

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
    status: "available" | "unavailable" | "holiday",
    notes?: string
  ) => Promise<void>
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
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {selectedDateCoachAvailability.length > 0 ? (
        <div style={cardStyle("#eff6ff")}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
            Coach Availability Snapshot
          </div>
          <div style={{ color: "#475569", marginBottom: 10 }}>
            {formatFullDate(selectedDate)}
          </div>
          <div style={{ display: "grid", gap: 8 }}>
            {selectedDateCoachAvailability.map((item) => {
              const coach = coaches.find((c) => c.id === item.coachId)

              return (
                <div
                  key={item.id}
                  style={{
                    padding: 12,
                    borderRadius: 14,
                    background: "white",
                    border: "1px solid #dbe3ef",
                  }}
                >
                  <div style={{ fontWeight: 900 }}>
                    {coach?.name || "Unknown coach"}
                  </div>
                  <div style={{ color: "#475569", marginTop: 4 }}>
                    {coach?.role || "No role"} • {item.status}
                  </div>
                  {item.notes ? (
                    <div style={{ color: "#64748b", marginTop: 6, fontSize: 14 }}>
                      {item.notes}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

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
