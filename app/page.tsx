"use client"

import { useState } from "react"

type Position = "GK" | "DEF" | "MID" | "FWD"

type Player = {
  id: string
  name: string
  positions: Position[]
}

export default function Page() {
  const players: Player[] = [
    { id: "1", name: "Bailee Dowler-Rowles", positions: ["DEF"] },
    { id: "2", name: "Bella Bainbridge", positions: ["MID"] },
    { id: "3", name: "Betsy Rowland", positions: ["MID", "DEF"] },
    { id: "4", name: "Connie Luff", positions: ["MID", "FWD"] },
    { id: "5", name: "Darcy-Rae Russell", positions: ["GK"] },
    { id: "6", name: "Ella Wilson", positions: ["MID", "DEF"] },
    { id: "7", name: "Elsy Harmer", positions: ["DEF"] },
    { id: "8", name: "Evelyn Evans", positions: ["MID", "DEF"] },
    { id: "9", name: "Isabella Ogden", positions: ["DEF", "MID"] },
    { id: "10", name: "Lyra Twinning", positions: ["MID", "FWD"] },
    { id: "11", name: "Martha Scrivens", positions: ["MID", "FWD"] },
    { id: "12", name: "Olivia Hassall", positions: ["DEF"] },
    { id: "13", name: "Poppy Bennett", positions: ["MID", "FWD"] },
    { id: "14", name: "Ruby Salter", positions: ["MID", "DEF"] },
  ]

  const [available, setAvailable] = useState<string[]>([])
  const [quarters, setQuarters] = useState<Player[][]>([])
  const [currentQuarter, setCurrentQuarter] = useState(0)

  function togglePlayer(id: string) {
    if (available.includes(id)) {
      setAvailable(available.filter((p) => p !== id))
    } else {
      setAvailable([...available, id])
    }
  }

  function shuffle<T>(array: T[]) {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  function uniquePlayers(list: Player[]) {
    const seen = new Set<string>()
    return list.filter((p) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
  }

  function pickPlayersForRole(
    pool: Player[],
    count: number,
    role: Position,
    usedIds: Set<string>
  ) {
    const eligible = pool.filter(
      (p) => !usedIds.has(p.id) && p.positions.includes(role)
    )
    const picked = shuffle(eligible).slice(0, count)
    picked.forEach((p) => usedIds.add(p.id))
    return picked
  }

  function fillRemainingSlots(
    pool: Player[],
    targetCount: number,
    current: Player[],
    usedIds: Set<string>
  ) {
    const remaining = shuffle(pool.filter((p) => !usedIds.has(p.id)))
    const filled = [...current]

    while (filled.length < targetCount && remaining.length > 0) {
      const next = remaining.shift()
      if (next) {
        filled.push(next)
        usedIds.add(next.id)
      }
    }

    return filled
  }

  function buildQuarterTeam(pool: Player[]) {
    const usedIds = new Set<string>()

    const gk = pickPlayersForRole(pool, 1, "GK", usedIds)
    const def = pickPlayersForRole(pool, 2, "DEF", usedIds)
    const mid = pickPlayersForRole(pool, 3, "MID", usedIds)
    const fwd = pickPlayersForRole(pool, 1, "FWD", usedIds)

    const ordered = [...gk, ...def, ...mid, ...fwd]
    return fillRemainingSlots(pool, 7, ordered, usedIds)
  }

  function rotatePool(playersPool: Player[], offset: number) {
    if (playersPool.length === 0) return []
    const amount = offset % playersPool.length
    return [...playersPool.slice(amount), ...playersPool.slice(0, amount)]
  }

  function generateRotation() {
    const availablePlayers = players.filter((p) => available.includes(p.id))

    if (availablePlayers.length < 7) {
      alert("Need at least 7 available players")
      return
    }

    const builtQuarters: Player[][] = []

    for (let q = 0; q < 4; q++) {
      const rotated = rotatePool(availablePlayers, q * 2)
      const quarter = buildQuarterTeam(rotated)
      builtQuarters.push(uniquePlayers(quarter))
    }

    setQuarters(builtQuarters)
    setCurrentQuarter(0)
  }

  function nextQuarter() {
    setCurrentQuarter((q) => Math.min(q + 1, 3))
  }

  function previousQuarter() {
    setCurrentQuarter((q) => Math.max(q - 1, 0))
  }

  const currentTeam = quarters[currentQuarter] || []
  const allQuarterPlayers = uniquePlayers(quarters.flat())
  const currentBench = allQuarterPlayers.filter(
    (p) => !currentTeam.find((f) => f.id === p.id)
  )

  function player(index: number) {
    return currentTeam[index]?.name || "-"
  }

  return (
    <main
      style={{
        padding: 20,
        maxWidth: 600,
        margin: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Sharks Team Manager</h1>

      <h2>Players Available</h2>

      {players.map((p) => (
        <label key={p.id} style={{ display: "block", marginBottom: 6 }}>
          <input
            type="checkbox"
            checked={available.includes(p.id)}
            onChange={() => togglePlayer(p.id)}
          />{" "}
          {p.name} • {p.positions.join("/")}
        </label>
      ))}

      <button onClick={generateRotation} style={{ marginTop: 20 }}>
        Generate Quarter Plan
      </button>

      {quarters.length > 0 && (
        <>
          <h2 style={{ marginTop: 30 }}>Quarter Plan</h2>

          {quarters.map((quarter, index) => (
            <div key={index} style={{ marginBottom: 14 }}>
              <strong>Quarter {index + 1}</strong>
              {quarter.map((p) => (
                <div key={`${index}-${p.id}`}>
                  {p.name} • {p.positions.join("/")}
                </div>
              ))}
            </div>
          ))}

          <h2 style={{ marginTop: 30 }}>Match Mode</h2>

          <div
            style={{
              padding: 16,
              borderRadius: 12,
              background: "#f3f3f3",
              marginBottom: 16,
            }}
          >
            <strong>Current Quarter: {currentQuarter + 1}</strong>

            <div
              style={{
                background: "#2e7d32",
                color: "white",
                padding: 20,
                borderRadius: 12,
                marginTop: 12,
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 18 }}>
                <div style={{ fontWeight: "bold" }}>FWD</div>
                <div>{player(6)}</div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginBottom: 18,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold" }}>MID</div>
                  <div>{player(3)}</div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold" }}>MID</div>
                  <div>{player(4)}</div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold" }}>MID</div>
                  <div>{player(5)}</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginBottom: 18,
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold" }}>DEF</div>
                  <div>{player(1)}</div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold" }}>DEF</div>
                  <div>{player(2)}</div>
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "bold" }}>GK</div>
                <div>{player(0)}</div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <strong>Bench This Quarter</strong>
              {currentBench.length > 0 ? (
                currentBench.map((p) => (
                  <div key={p.id}>
                    {p.name} • {p.positions.join("/")}
                  </div>
                ))
              ) : (
                <div>None</div>
              )}
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button onClick={previousQuarter}>Previous Quarter</button>
              <button onClick={nextQuarter}>Next Quarter</button>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
