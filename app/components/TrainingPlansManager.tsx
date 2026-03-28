"use client"

import { useMemo, useState } from "react"
import {
  buttonPrimary,
  buttonSecondary,
  cardStyle,
  makeId,
  type TrainingTemplate,
} from "../lib/types"

type Props = {
  isAdmin: boolean
  trainingPlans: TrainingTemplate[]
  onSaveTrainingPlans: (nextPlans: TrainingTemplate[]) => Promise<void>
  onUsePlan?: (plan: TrainingTemplate) => void
}

export default function TrainingPlansManager({
  isAdmin,
  trainingPlans,
  onSaveTrainingPlans,
  onUsePlan,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [warmUp, setWarmUp] = useState("")
  const [drill1, setDrill1] = useState("")
  const [drill2, setDrill2] = useState("")
  const [game, setGame] = useState("")
  const [notes, setNotes] = useState("")
  const [search, setSearch] = useState("")

  const filteredPlans = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return trainingPlans

    return trainingPlans.filter((plan) =>
      [
        plan.name,
        plan.warmUp,
        plan.drill1,
        plan.drill2,
        plan.game,
        plan.notes,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    )
  }, [trainingPlans, search])

  function resetForm() {
    setEditingId(null)
    setName("")
    setWarmUp("")
    setDrill1("")
    setDrill2("")
    setGame("")
    setNotes("")
  }

  function loadPlan(plan: TrainingTemplate) {
    setEditingId(plan.id)
    setName(plan.name)
    setWarmUp(plan.warmUp)
    setDrill1(plan.drill1)
    setDrill2(plan.drill2)
    setGame(plan.game)
    setNotes(plan.notes)
  }

  async function handleSave() {
    if (!isAdmin) return

    if (!name.trim()) {
      alert("Enter session name")
      return
    }

    const nextPlan: TrainingTemplate = {
      id: editingId || (crypto.randomUUID?.() || makeId()),
      name: name.trim(),
      warmUp: warmUp.trim(),
      drill1: drill1.trim(),
      drill2: drill2.trim(),
      game: game.trim(),
      notes: notes.trim(),
    }

    const nextPlans = editingId
      ? trainingPlans.map((plan) => (plan.id === editingId ? nextPlan : plan))
      : [nextPlan, ...trainingPlans]

    await onSaveTrainingPlans(nextPlans)
    resetForm()
  }

  async function handleDelete(id: string) {
    if (!isAdmin) return
    const confirmed = window.confirm("Delete this training plan?")
    if (!confirmed) return
    await onSaveTrainingPlans(trainingPlans.filter((plan) => plan.id !== id))
    if (editingId === id) resetForm()
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
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
          <div style={{ fontSize: 22, fontWeight: 900 }}>Training Plan Manager</div>
          {editingId ? (
            <button onClick={resetForm} style={buttonSecondary()}>
              New Plan
            </button>
          ) : null}
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Session name"
            style={{ padding: 14, borderRadius: 14, border: "1px solid #cbd5e1", fontSize: 16 }}
          />

          <textarea
            value={warmUp}
            onChange={(e) => setWarmUp(e.target.value)}
            placeholder="Warm up"
            style={{
              minHeight: 70,
              padding: 14,
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              resize: "vertical",
            }}
          />

          <textarea
            value={drill1}
            onChange={(e) => setDrill1(e.target.value)}
            placeholder="Drill 1"
            style={{
              minHeight: 70,
              padding: 14,
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              resize: "vertical",
            }}
          />

          <textarea
            value={drill2}
            onChange={(e) => setDrill2(e.target.value)}
            placeholder="Drill 2"
            style={{
              minHeight: 70,
              padding: 14,
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              resize: "vertical",
            }}
          />

          <textarea
            value={game}
            onChange={(e) => setGame(e.target.value)}
            placeholder="Game"
            style={{
              minHeight: 70,
              padding: 14,
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              resize: "vertical",
            }}
          />

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Coach notes"
            style={{
              minHeight: 90,
              padding: 14,
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              resize: "vertical",
            }}
          />
        </div>

        {isAdmin ? (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button onClick={() => void handleSave()} style={buttonPrimary()}>
              {editingId ? "Update Plan" : "Save Plan"}
            </button>
            {editingId ? (
              <button onClick={resetForm} style={buttonSecondary()}>
                Cancel
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

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
          <div style={{ fontSize: 22, fontWeight: 900 }}>Saved Training Plans</div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plans"
            style={{
              padding: 12,
              borderRadius: 12,
              border: "1px solid #cbd5e1",
              fontSize: 15,
              minWidth: 220,
              maxWidth: "100%",
            }}
          />
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          {filteredPlans.length === 0 ? (
            <div style={{ color: "#64748b" }}>No training plans found.</div>
          ) : (
            filteredPlans.map((plan) => (
              <div
                key={plan.id}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  gap: 10,
                }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: 18 }}>{plan.name}</div>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>Warm Up</div>
                    <div style={{ color: "#475569", marginTop: 4 }}>{plan.warmUp || "—"}</div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 800 }}>Drill 1</div>
                    <div style={{ color: "#475569", marginTop: 4 }}>{plan.drill1 || "—"}</div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 800 }}>Drill 2</div>
                    <div style={{ color: "#475569", marginTop: 4 }}>{plan.drill2 || "—"}</div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 800 }}>Game</div>
                    <div style={{ color: "#475569", marginTop: 4 }}>{plan.game || "—"}</div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 800 }}>Notes</div>
                    <div style={{ color: "#475569", marginTop: 4 }}>{plan.notes || "—"}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {onUsePlan ? (
                    <button onClick={() => onUsePlan(plan)} style={buttonSecondary()}>
                      Use Plan
                    </button>
                  ) : null}

                  {isAdmin ? (
                    <>
                      <button onClick={() => loadPlan(plan)} style={buttonSecondary()}>
                        Edit
                      </button>
                      <button onClick={() => void handleDelete(plan.id)} style={buttonSecondary()}>
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
