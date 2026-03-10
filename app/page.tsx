"use client"

import { useMemo, useState } from "react"

type Position = "GK" | "DEF" | "MID" | "FWD"

type Player = {
  id: string
  name: string
  positions: Position[]
}

type GameType = "7v7" | "9v9" | "11v11"

type FormationConfig = {
  label: string
  slots: Position[]
}

const FORMATIONS: Record<GameType, FormationConfig[]> = {
  "7v7": [
    {
      label: "2-3-1",
      slots: ["GK", "DEF", "DEF", "MID", "MID", "MID", "FWD"],
    },
    {
      label: "3-2-1",
      slots: ["GK", "DEF", "DEF", "DEF", "MID", "MID", "FWD"],
    },
  ],
  "9v9": [
    {
      label: "3-3-2",
      slots: ["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD"],
    },
    {
      label: "3-4-1",
      slots: ["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD"],
    },
  ],
  "11v11": [
    {
      label: "4-3-3",
      slots: ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "FWD", "FWD", "FWD"],
    },
    {
      label: "4-4-2",
      slots: ["GK", "DEF", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "FWD", "FWD"],
    },
    {
      label: "3-5-2",
      slots: ["GK", "DEF", "DEF", "DEF", "MID", "MID", "MID", "MID", "MID", "FWD", "FWD"],
    },
  ],
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
  const [gameType, setGameType] = useState<GameType>("7v7")
  const [formationLabel, setFormationLabel] = useState("2-3-1")

  const currentFormation = useMemo(() => {
    return FORMATIONS[gameType].find((f) => f.label === formationLabel) || FORMATIONS[gameType][0]
  }, [gameType, formationLabel])

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

  function buildTeamForSlots(pool: Player[], slots: Position[]) {
    const usedIds = new Set<string>()
    const ordered: Player[] = []

    for (const slot of slots) {
      const exact = shuffle(
        pool.filter((p) => !usedIds.has(p.id) && p.positions.includes(slot))
      )

      if (exact.length > 0) {
        ordered.push(exact[0])
        usedIds.add(exact[0].id)
        continue
      }

      const fallback = shuffle(pool.filter((p) => !usedIds.has(p.id)))
      if (fallback.length > 0) {
        ordered.push(fallback[0])
        usedIds.add(fallback[0].id)
      }
    }

    return ordered
  }

  function rotatePool(playersPool: Player[], offset: number) {
    if (playersPool.length === 0) return []
    const amount = offset % playersPool.length
    return [...playersPool.slice(amount), ...playersPool.slice(0, amount)]
  }

  function generateRotation() {
    const availablePlayers = players.filter((p) => available.includes(p.id))

    if (availablePlayers.length < currentFormation.slots.length) {
      alert(`Need at least ${currentFormation.slots.length} available players for ${gameType}`)
      return
    }

    const builtQuarters: Player[][] = []

    for (let q = 0; q < 4; q++) {
      const rotated = rotatePool(availablePlayers, q * 2)
      const quarter = buildTeamForSlots(rotated, currentFormation.slots)
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

  function handleGameTypeChange(value: GameType) {
    setGameType(value)
    setFormationLabel(FORMATIONS[value][0].label)
    setQuarters([])
    setCurrentQuarter(0)
  }

  const currentTeam = quarters[currentQuarter] || []
  const allQuarterPlayers = uniquePlayers(quarters.flat())
  const currentBench = allQuarterPlayers.filter(
    (p) => !currentTeam.find((f) => f.id === p.id)
  )

  function getPlayersForLine(role: Position, used: Set<string>) {
    const indices: number[] = []
    currentFormation.slots.forEach((slot, idx) => {
      if (slot === role) indices.push(idx)
    })

    return indices
      .map((idx) => currentTeam[idx])
      .filter((p): p is Player => Boolean(p))
      .filter((p) => {
        if (used.has(p.id)) return false
        used.add(p.id)
        return true
      })
  }

  const lineGroups = useMemo(() => {
    const used = new Set<string>()
    return {
      gk: getPlayersForLine("GK", used),
      def: getPlayersForLine("DEF", used),
      mid: getPlayersForLine("MID", used),
      fwd: getPlayersForLine("FWD", used),
    }
  }, [currentTeam, currentFormation])

  function renderLine(title: string, group: Player[]) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          gap: 10,
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        {group.map((p) => (
          <div key={`${title}-${p.id}`} style={{ textAlign: "center", minWidth: 90 }}>
            <div style={{ fontWeight: "bold" }}>{title}</div>
            <div>{p.name}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <main
      style={{
        padding: 20,
        maxWidth: 700,
        margin: "auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Sharks Team Manager</h1>

      <div style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 10 }}>
          <strong>Game Type</strong>
        </div>
        <select
          value={gameType}
          onChange={(e) => handleGameTypeChange(e.target.value as GameType)}
          style={{ padding: 10, marginRight: 10 }}
        >
          <option value="7v7">7v7</option>
          <option value="9v9">9v9</option>
          <option value="11v11">11v11</option>
        </select>

        <select
          value={formationLabel}
          onChange={(e) => {
            setFormationLabel(e.target.value)
            setQuarters([])
            setCurrentQuarter(0)
          }}
          style={{ padding: 10 }}
        >
          {FORMATIONS[gameType].map((f) => (
            <option key={f.label} value={f.label}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

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
              {quarter.map((p, idx) => (
                <div key={`${index}-${p.id}`}>
                  {currentFormation.slots[idx]} — {p.name} • {p.positions.join("/")}
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
            <strong>
              Current Quarter: {currentQuarter + 1} • {gameType} • {formationLabel}
            </strong>

            <div
              style={{
                background: "#2e7d32",
                color: "white",
                padding: 20,
                borderRadius: 12,
                marginTop: 12,
              }}
            >
              {lineGroups.fwd.length > 0 && renderLine("FWD", lineGroups.fwd)}
              {lineGroups.mid.length > 0 && renderLine("MID", lineGroups.mid)}
              {lineGroups.def.length > 0 && renderLine("DEF", lineGroups.def)}
              {lineGroups.gk.length > 0 && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: "bold" }}>GK</div>
                  <div>{lineGroups.gk[0].name}</div>
                </div>
              )}
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
