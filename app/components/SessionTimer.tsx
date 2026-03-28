"use client"

import { useEffect, useMemo, useState } from "react"
import {
  buttonPrimary,
  buttonSecondary,
  cardStyle,
  type TrainingTemplate,
  type TrainingSession,
} from "../lib/types"

type SessionBlock = {
  key: string
  label: string
  content: string
}

type Props = {
  plan: TrainingTemplate | null
  session?: TrainingSession | null
}

function formatSeconds(total: number) {
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

export default function SessionTimer({ plan, session = null }: Props) {
  const blocks = useMemo<SessionBlock[]>(() => {
    if (!plan) return []

    return [
      { key: "warmup", label: "Warm Up", content: plan.warmUp || "" },
      { key: "drill1", label: "Drill 1", content: plan.drill1 || "" },
      { key: "drill2", label: "Drill 2", content: plan.drill2 || "" },
      { key: "game", label: "Game", content: plan.game || "" },
    ].filter((item) => item.content.trim().length > 0)
  }, [plan])

  const [durations, setDurations] = useState<Record<string, number>>({})
  const [activeIndex, setActiveIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [running, setRunning] = useState(false)

  const [seconds, setSeconds] = useState(0)
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)

  const activeBlock = blocks[activeIndex] || null
  const totalSeconds = blocks.reduce((sum, block) => sum + (durations[block.key] || 0), 0)

  const currentBlock = session?.blocks[currentBlockIndex] || null
  const sessionTotalMinutes =
    session?.blocks.reduce((sum, block) => sum + (block.duration || 0), 0) || 0

  useEffect(() => {
    if (blocks.length === 0) {
      setDurations({})
      setActiveIndex(0)
      setSecondsLeft(0)
      setRunning(false)
      return
    }

    const nextDurations: Record<string, number> = {}
    for (const block of blocks) {
      nextDurations[block.key] = durations[block.key] || 600
    }

    setDurations(nextDurations)
    const currentKey = blocks[Math.min(activeIndex, blocks.length - 1)]?.key
    setActiveIndex((prev) => Math.min(prev, blocks.length - 1))
    setSecondsLeft(nextDurations[currentKey] || 600)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plan?.id])

  useEffect(() => {
    if (!session) {
      setSeconds(0)
      setCurrentBlockIndex(0)
      return
    }

    setSeconds(0)
    setCurrentBlockIndex(0)
    setRunning(false)
  }, [session?.id])

  useEffect(() => {
    if (session && currentBlock) {
      if (!running) return

      const interval = window.setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1

          if (next >= currentBlock.duration * 60) {
            if (currentBlockIndex < session.blocks.length - 1) {
              setCurrentBlockIndex((i) => i + 1)
              return 0
            }

            setRunning(false)
            return currentBlock.duration * 60
          }

          return next
        })
      }, 1000)

      return () => window.clearInterval(interval)
    }

    if (!running) return
    if (secondsLeft <= 0) return

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [running, secondsLeft, session, currentBlock, currentBlockIndex])

  function updateDuration(key: string, minutes: number) {
    const safe = Math.max(1, minutes || 1)
    const next = { ...durations, [key]: safe * 60 }
    setDurations(next)

    if (activeBlock?.key === key) {
      setSecondsLeft(safe * 60)
      setRunning(false)
    }
  }

  function selectBlock(index: number) {
    const block = blocks[index]
    if (!block) return
    setActiveIndex(index)
    setSecondsLeft(durations[block.key] || 600)
    setRunning(false)
  }

  function resetCurrent() {
    if (session && currentBlock) {
      setSeconds(0)
      setRunning(false)
      return
    }

    if (!activeBlock) return
    setSecondsLeft(durations[activeBlock.key] || 600)
    setRunning(false)
  }

  function nextBlock() {
    if (session && session.blocks.length > 0) {
      if (currentBlockIndex >= session.blocks.length - 1) return
      setCurrentBlockIndex((prev) => prev + 1)
      setSeconds(0)
      setRunning(false)
      return
    }

    if (activeIndex >= blocks.length - 1) return
    const nextIndex = activeIndex + 1
    const nextBlock = blocks[nextIndex]
    setActiveIndex(nextIndex)
    setSecondsLeft(durations[nextBlock.key] || 600)
    setRunning(false)
  }

  function prevBlock() {
    if (session && session.blocks.length > 0) {
      if (currentBlockIndex <= 0) return
      setCurrentBlockIndex((prev) => prev - 1)
      setSeconds(0)
      setRunning(false)
      return
    }

    if (activeIndex <= 0) return
    const nextIndex = activeIndex - 1
    const prev = blocks[nextIndex]
    setActiveIndex(nextIndex)
    setSecondsLeft(durations[prev.key] || 600)
    setRunning(false)
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle("#ecfeff")}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Session Timer</div>

        {!plan ? (
          <div style={{ color: "#64748b" }}>Choose a training plan to run a live session timer.</div>
        ) : session && currentBlock ? (
          <>
            <div style={{ color: "#475569", marginBottom: 12 }}>
              Running generated session: <strong>{session.name}</strong>
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 18,
                background: "white",
                border: "1px solid #dbeafe",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: "#64748b" }}>
                Block {currentBlockIndex + 1} of {session.blocks.length}
              </div>

              <div style={{ fontWeight: 900, fontSize: 22 }}>{currentBlock.title}</div>

              <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1 }}>
                {formatSeconds(seconds)}
              </div>

              <div style={{ color: "#475569" }}>{currentBlock.description}</div>

              <div style={{ fontSize: 12, marginTop: 4, color: "#64748b" }}>
                {currentBlock.duration} min
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                <button onClick={() => setRunning(true)} style={buttonPrimary()}>
                  Start
                </button>
                <button onClick={() => setRunning(false)} style={buttonSecondary()}>
                  Pause
                </button>
                <button onClick={resetCurrent} style={buttonSecondary()}>
                  Reset Block
                </button>
                <button onClick={prevBlock} style={buttonSecondary()}>
                  Previous
                </button>
                <button onClick={nextBlock} style={buttonSecondary()}>
                  Next
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12, color: "#475569", fontWeight: 800 }}>
              Total generated session time: {sessionTotalMinutes} mins
            </div>
          </>
        ) : blocks.length === 0 ? (
          <div style={{ color: "#64748b" }}>This training plan has no timed blocks yet.</div>
        ) : (
          <>
            <div style={{ color: "#475569", marginBottom: 12 }}>
              Running plan: <strong>{plan.name}</strong>
            </div>

            <div
              style={{
                padding: 18,
                borderRadius: 18,
                background: "white",
                border: "1px solid #dbeafe",
                display: "grid",
                gap: 10,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: "#64748b" }}>
                {activeBlock?.label || "No block selected"}
              </div>
              <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1 }}>
                {formatSeconds(secondsLeft)}
              </div>
              <div style={{ color: "#475569" }}>{activeBlock?.content || ""}</div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                <button onClick={() => setRunning(true)} style={buttonPrimary()}>
                  Start
                </button>
                <button onClick={() => setRunning(false)} style={buttonSecondary()}>
                  Pause
                </button>
                <button onClick={resetCurrent} style={buttonSecondary()}>
                  Reset Block
                </button>
                <button onClick={prevBlock} style={buttonSecondary()}>
                  Previous
                </button>
                <button onClick={nextBlock} style={buttonSecondary()}>
                  Next
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12, color: "#475569", fontWeight: 800 }}>
              Total planned session time: {Math.round(totalSeconds / 60)} mins
            </div>
          </>
        )}
      </div>

      {session && session.blocks.length > 0 ? (
        <div style={cardStyle()}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Generated Session Blocks</div>

          <div style={{ display: "grid", gap: 10 }}>
            {session.blocks.map((block, index) => {
              const isActive = index === currentBlockIndex
              return (
                <div
                  key={block.id}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    border: isActive ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    background: isActive ? "#eff6ff" : "#f8fafc",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900 }}>{block.title}</div>
                      <div style={{ color: "#475569", marginTop: 4 }}>{block.description}</div>
                      <div style={{ fontSize: 12, marginTop: 6, color: "#64748b" }}>
                        {block.duration} min
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentBlockIndex(index)
                        setSeconds(0)
                        setRunning(false)
                      }}
                      style={buttonSecondary()}
                    >
                      {isActive ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : blocks.length > 0 ? (
        <div style={cardStyle()}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>Session Blocks</div>

          <div style={{ display: "grid", gap: 10 }}>
            {blocks.map((block, index) => {
              const isActive = index === activeIndex
              return (
                <div
                  key={block.key}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    border: isActive ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    background: isActive ? "#eff6ff" : "#f8fafc",
                    display: "grid",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 900 }}>{block.label}</div>
                      <div style={{ color: "#475569", marginTop: 4 }}>{block.content}</div>
                    </div>

                    <button onClick={() => selectBlock(index)} style={buttonSecondary()}>
                      {isActive ? "Selected" : "Select"}
                    </button>
                  </div>

                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <label style={{ fontWeight: 800, color: "#475569" }}>Minutes</label>
                    <input
                      type="number"
                      min={1}
                      value={Math.round((durations[block.key] || 600) / 60)}
                      onChange={(e) => updateDuration(block.key, Number(e.target.value))}
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        border: "1px solid #cbd5e1",
                        fontSize: 16,
                        width: 90,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
