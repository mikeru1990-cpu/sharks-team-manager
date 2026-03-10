"use client"

import { useState } from "react"

type Player = {
  id: string
  name: string
  position: "GK" | "DEF" | "MID" | "FWD"
}

export default function Page() {
  const players: Player[] = [
    { id: "1", name: "Bailee Dowler-Rowles", position: "DEF" },
    { id: "2", name: "Bella Bainbridge", position: "MID" },
    { id: "3", name: "Betsy Rowland", position: "MID" },
    { id: "4", name: "Connie Luff", position: "FWD" },
    { id: "5", name: "Darcy-Rae Russell", position: "GK" },
    { id: "6", name: "Ella Wilson", position: "MID" },
    { id: "7", name: "Elsy Harmer", position: "DEF" },
    { id: "8", name: "Evelyn Evans", position: "MID" },
    { id: "9", name: "Isabella Ogden", position: "DEF" },
    { id: "10", name: "Lyra Twinning", position: "MID" },
    { id: "11", name: "Martha Scrivens", position: "FWD" },
    { id: "12", name: "Olivia Hassall", position: "DEF" },
    { id: "13", name: "Poppy Bennett", position: "FWD" },
    { id: "14", name: "Ruby Salter", position: "MID" },
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
    return [...array].sort(() => Math.random() - 0.5)
  }

  function uniquePlayers(list: Player[]) {
    const seen = new Set<string>()
    return list.filter((p) => {
      if (seen.has(p.id)) return false
      seen.add(p.id)
      return true
    })
  }

  function buildStartingSeven(availablePlayers: Player[]) {
    const gk = shuffle(availablePlayers.filter((p) => p.position === "GK")).slice(0, 1)
    const def = shuffle(availablePlayers.filter((p) => p.position === "DEF")).slice(0, 2)
    const mid = shuffle(availablePlayers.filter((p) => p.position === "MID")).slice(0, 3)
    const fwd = shuffle(availablePlayers.filter((p) => p.position === "FWD")).slice(0, 1)

    let squad = uniquePlayers([...gk, ...def, ...mid, ...fwd])

    const used = squad.map((p) => p.id)
    const remaining = availablePlayers.filter((p) => !used.includes(p.id))

    while (squad.length < 7 && remaining.length) {
      squad.push(remaining.shift()!)
    }

    return squad
  }

  function generateRotation() {
    const availablePlayers = players.filter((p) => available.includes(p.id))
    const starters = buildStartingSeven(availablePlayers)
    const bench = availablePlayers.filter((p) => !starters.find((s) => s.id === p.id))

    const q1 = [...starters]
    const q2 = [...starters]
    const q3 = [...starters]
    const q4 = [...starters]

    if (bench[0] && q2[6]) q2[6] = bench[0]
    if (bench[1] && q2[5]) q2[5] = bench[1]

    if (bench[2] && q3[6]) q3[6] = bench[2]
    if (bench[3] && q3[5]) q3[5] = bench[3]

    if (bench[0] && q4[4]) q4[4] = bench[0]
    if (bench[1] && q4[3]) q4[3] = bench[1]

    setQuarters([q1, q2, q3, q4])
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
    <main style={{ padding: 20, maxWidth: 600, margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <h1>Sharks Team Manager</h1>

      <h2>Players Available</h2>

      {players.map((p) => (
        <label key={p.id} style={{ display: "block", marginBottom: 6 }}>
          <input
            type="checkbox"
            checked={available.includes(p.id)}
            onChange={() => togglePlayer(p.id)}
          />{" "}
          {p.name} • {p.position}
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
                  {p.name} • {p.position}
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
                    {p.name} • {p.position}
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
