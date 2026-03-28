"use client"

import { useEffect, useMemo, useState } from "react"
import {
  buttonPrimary,
  buttonSecondary,
  cardStyle,
  makeId,
  type CompletedSessionBlock,
  type TrainingSession,
  type TrainingSessionRecord,
} from "../lib/types"

type Props = {
  session: TrainingSession | null
  onSaveSession: (record: TrainingSessionRecord) => Promise<void>
}

function formatSeconds(total: number) {
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
}

export default function SessionTimer({ session, onSaveSession }: Props) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  const [sessionNotes, setSessionNotes] = useState("")
  const [completedBlocks, setCompletedBlocks] = useState<CompletedSessionBlock[]>([])

  const currentBlock = session?.blocks[currentBlockIndex] || null

  const totalMinutes = useMemo(() => {
    return session?.blocks.reduce((sum, block) => sum + block.duration, 0) || 0
  }, [session])

  useEffect(() => {
    if (!session) {
      setCurrentBlockIndex(0)
      setSeconds(0)
      setRunning(false)
      setSessionNotes("")
      setCompletedBlocks([])
      return
    }

    setCurrentBlockIndex(0)
    setSeconds(0)
    setRunning(false)
    setSessionNotes("")
    setCompletedBlocks(
      session.blocks.map((block) => ({
        ...block,
        completed: false,
      }))
    )
  }, [session?.id])

  useEffect(() => {
    if (!running || !currentBlock || !session) return

    const interval = window.setInterval(() => {
      setSeconds((prev) => {
        const next = prev + 1

        if (next >= currentBlock.duration * 60) {
          setCompletedBlocks((prevBlocks) =>
            prevBlocks.map((block, index) =>
              index === currentBlockIndex ? { ...block, completed: true } : block
            )
          )

          if (currentBlockIndex < session.blocks.length - 1) {
            setCurrentBlockIndex((prevIndex) => prevIndex + 1)
            return 0
          }

          setRunning(false)
          return currentBlock.duration * 60
        }

        return next
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [running, currentBlock, currentBlockIndex, session])

  function goToBlock(index: number) {
    if (!session || index < 0 || index >= session.blocks.length) return
    setCurrentBlockIndex(index)
    setSeconds(0)
    setRunning(false)
  }

  function resetBlock() {
    setSeconds(0)
    setRunning(false)
  }

  function completeCurrentBlock() {
    if (!currentBlock) return

    setCompletedBlocks((prev) =>
      prev.map((block, index) =>
        index === currentBlockIndex ? { ...block, completed: true } : block
      )
    )

    if (session && currentBlockIndex < session.blocks.length - 1) {
      setCurrentBlockIndex((prev) => prev + 1)
      setSeconds(0)
      setRunning(false)
    } else {
      setRunning(false)
    }
  }

  async function handleSaveSession() {
    if (!session) return

    const record: TrainingSessionRecord = {
      id: makeId(),
      date: new Date().toISOString().split("T")[0],
      planName: session.name,
      notes: sessionNotes.trim(),
      blocks: completedBlocks,
    }

    await onSaveSession(record)
    alert("Session saved")
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={cardStyle("#ecfeff")}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Session Timer</div>

        {!session || !currentBlock ? (
          <div style={{ color: "#64748b" }}>Generate a session to start the live timer.</div>
        ) : (
          <>
            <div style={{ color: "#475569", marginBottom: 12 }}>
              Session: <strong>{session.name}</strong>
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
              <div style={{ fontSize: 26, fontWeight: 900 }}>{currentBlock.title}</div>
              <div style={{ fontSize: 54, fontWeight: 900, lineHeight: 1 }}>
                {formatSeconds(seconds)}
              </div>
              <div style={{ color: "#475569" }}>{currentBlock.description}</div>
              <div style={{ color: "#64748b", fontWeight: 800 }}>
                {currentBlock.duration} mins
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
                <button onClick={() => setRunning(true)} style={buttonPrimary()}>
                  Start
                </button>
                <button onClick={() => setRunning(false)} style={buttonSecondary()}>
                  Pause
                </button>
                <button onClick={resetBlock} style={buttonSecondary()}>
                  Reset Block
                </button>
                <button onClick={completeCurrentBlock} style={buttonSecondary()}>
                  Complete Block
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12, color: "#475569", fontWeight: 800 }}>
              Total planned session time: {totalMinutes} mins
            </div>
          </>
        )}
      </div>

      {session ? (
        <div style={cardStyle()}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
            Live Session Notes
          </div>

          <textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Add live coaching notes..."
            style={{
              minHeight: 120,
              padding: 14,
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              fontSize: 16,
              resize: "vertical",
              width: "100%",
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
            <button onClick={() => void handleSaveSession()} style={buttonPrimary()}>
              Save Session
            </button>
          </div>
        </div>
      ) : null}

      {session ? (
        <div style={cardStyle()}>
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 12 }}>
            Session Blocks
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {completedBlocks.map((block, index) => {
              const isCurrent = index === currentBlockIndex

              return (
                <div
                  key={block.id}
                  style={{
                    padding: 14,
                    borderRadius: 16,
                    border: isCurrent ? "2px solid #2563eb" : "1px solid #e2e8f0",
                    background: block.completed ? "#dcfce7" : isCurrent ? "#eff6ff" : "#f8fafc",
                    display: "grid",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>{block.title}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#475569" }}>
                      {block.completed ? "Completed" : `${block.duration} mins`}
                    </div>
                  </div>

                  <div style={{ color: "#475569" }}>{block.description}</div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => goToBlock(index)} style={buttonSecondary()}>
                      Open Block
                    </button>
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
