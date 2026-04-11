"use client"

import { cardStyle } from "../../lib/types"

type Props = {
  open: boolean
  value: {
    name: string
    startDate: string
    endDate: string
  }
  setValue: (value: {
    name: string
    startDate: string
    endDate: string
  }) => void
  onClose: () => void
  onSave: () => Promise<void> | void
}

export default function SeasonModal({
  open,
  value,
  setValue,
  onClose,
  onSave,
}: Props) {
  if (!open) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 120,
        padding: 16,
      }}
    >
      <div style={{ ...cardStyle(), width: "100%", maxWidth: 460 }}>
        <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 12 }}>
          Start New Season
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <input
            value={value.name}
            onChange={(e) =>
              setValue({
                ...value,
                name: e.target.value,
              })
            }
            placeholder="Season name e.g. 2026/27"
            style={{
              padding: 14,
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              fontSize: 16,
            }}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input
              type="date"
              value={value.startDate}
              onChange={(e) =>
                setValue({
                  ...value,
                  startDate: e.target.value,
                })
              }
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                boxSizing: "border-box",
              }}
            />

            <input
              type="date"
              value={value.endDate}
              onChange={(e) =>
                setValue({
                  ...value,
                  endDate: e.target.value,
                })
              }
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 14,
                border: "1px solid #cbd5e1",
                fontSize: 16,
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button
            onClick={() => void onSave()}
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: 16,
              border: "none",
              background: "#06245c",
              color: "white",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            Create Season
          </button>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: 16,
              border: "1px solid #cbd5e1",
              background: "white",
              color: "#0f172a",
              fontWeight: 800,
              fontSize: 16,
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
