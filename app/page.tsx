"use client"

import { useEffect, useMemo, useState } from "react"
import { supabase } from "../supabase"

type Position = "GK" | "DEF" | "MID" | "FWD"

type Player = {
  id: string
  name: string
  positions: Position[]
  mainGK: boolean
  backupGK: boolean
}

type MatchFormat = "7v7" | "9v9" | "11v11"

const FORMATIONS: Record<MatchFormat, Record<string, Position[]>> = {
  "7v7": {
    "2-3-1": ["FWD", "MID", "MID", "MID", "DEF", "DEF", "GK"],
    "3-2-1": ["FWD", "MID", "MID", "DEF", "DEF", "DEF", "GK"],
  },
  "9v9": {
    "3-3-2": ["FWD", "FWD", "MID", "MID", "MID", "DEF", "DEF", "DEF", "GK"],
  },
  "11v11": {
    "4-3-3": [
      "FWD",
      "FWD",
      "FWD",
      "MID",
      "MID",
      "MID",
      "DEF",
      "DEF",
      "DEF",
      "DEF",
      "GK",
    ],
  },
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function formatSeconds(total: number) {
  const mins = Math.floor(total / 60)
  const secs = total % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function playerCanPlaySlot(player: Player, slot: Position) {
  if (slot === "GK") {
    return player.mainGK || player.backupGK || player.positions.includes("GK")
  }
  return player.positions.includes(slot)
}

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([])
  const [playerName, setPlayerName] = useState("")
  const [matchFormat, setMatchFormat] = useState<MatchFormat>("7v7")
  const [formation, setFormation] = useState("2-3-1")

  const [pitchIds, setPitchIds] = useState<(string | null)[]>([])
  const [selectedBenchId, setSelectedBenchId] = useState<string | null>(null)
  const [selectedPitchSlot, setSelectedPitchSlot] = useState<number | null>(null)

  const [injured, setInjured] = useState<string[]>([])

  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)

  const [playerSeconds, setPlayerSeconds] = useState<Record<string, number>>({})

  const pitchSlots = useMemo(() => {
    return FORMATIONS[matchFormat][formation]
  }, [matchFormat, formation])

  useEffect(() => {
    setPitchIds(Array(pitchSlots.length).fill(null))
  }, [pitchSlots.length])

  useEffect(() => {
    loadPlayers()
  }, [])

  useEffect(() => {
    if (!running) return

    const timer = setInterval(() => {
      setSeconds((s) => s + 1)

      setPlayerSeconds((prev) => {
        const next = { ...prev }

        pitchIds.forEach((id) => {
          if (!id) return
          next[id] = (next[id] || 0) + 1
        })

        return next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [running, pitchIds])

  async function loadPlayers() {
    const { data } = await supabase.from("players").select("*")

    if (!data) return

    const parsed = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      positions: JSON.parse(p.positions_json || "[]"),
      mainGK: p.main_gk,
      backupGK: p.backup_gk,
    }))

    setPlayers(parsed)
  }

  async function addPlayer() {
    if (!playerName.trim()) return

    const id = makeId()

    await supabase.from("players").insert({
      id,
      name: playerName,
      positions_json: JSON.stringify(["MID"]),
      main_gk: false,
      backup_gk: false,
    })

    setPlayerName("")
    loadPlayers()
  }

  const pitchPlayers = useMemo(() => {
    return pitchIds.map((id) => players.find((p) => p.id === id) || null)
  }, [pitchIds, players])

  const benchPlayers = useMemo(() => {
    const onPitch = new Set(pitchIds.filter(Boolean))
    return players.filter((p) => !onPitch.has(p.id) && !injured.includes(p.id))
  }, [players, pitchIds, injured])

  function autoFillPitch() {
    const next = Array(pitchSlots.length).fill(null)

    const used = new Set<string>()

    pitchSlots.forEach((slot, i) => {
      const candidate =
        players.find(
          (p) => !used.has(p.id) && playerCanPlaySlot(p, slot) && !injured.includes(p.id)
        ) || players.find((p) => !used.has(p.id) && !injured.includes(p.id))

      if (candidate) {
        next[i] = candidate.id
        used.add(candidate.id)
      }
    })

    setPitchIds(next)
  }

  function removeFromPitch(index: number) {
    const next = [...pitchIds]
    next[index] = null
    setPitchIds(next)
  }

  function markInjured(playerId: string) {
    setInjured((prev) => [...prev, playerId])
    setPitchIds((prev) => prev.map((p) => (p === playerId ? null : p)))
  }

  function returnFromInjury(playerId: string) {
    setInjured((prev) => prev.filter((p) => p !== playerId))
  }

  return (
    <main style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36 }}>Sharks Team Manager</h1>

      <h2>Add Player</h2>

      <input
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Player name"
        style={{ padding: 10, marginRight: 10 }}
      />

      <button onClick={addPlayer}>Add</button>

      <h2 style={{ marginTop: 30 }}>Match Settings</h2>

      <select
        value={matchFormat}
        onChange={(e) => {
          const format = e.target.value as MatchFormat
          setMatchFormat(format)
          setFormation(Object.keys(FORMATIONS[format])[0])
        }}
      >
        <option value="7v7">7v7</option>
        <option value="9v9">9v9</option>
        <option value="11v11">11v11</option>
      </select>

      <select value={formation} onChange={(e) => setFormation(e.target.value)}>
        {Object.keys(FORMATIONS[matchFormat]).map((f) => (
          <option key={f}>{f}</option>
        ))}
      </select>

      <button onClick={autoFillPitch}>Auto Fill Pitch</button>

      <h2 style={{ marginTop: 30 }}>Match Timer</h2>

      <div style={{ fontSize: 40 }}>{formatSeconds(seconds)}</div>

      <button onClick={() => setRunning(true)}>Start</button>
      <button onClick={() => setRunning(false)}>Pause</button>

      <h2 style={{ marginTop: 30 }}>Pitch</h2>

      <div
        style={{
          background: "#3f7f35",
          padding: 20,
          borderRadius: 20,
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 15,
        }}
      >
        {pitchSlots.map((slot, index) => {
          const player = pitchPlayers[index]

          return (
            <div
              key={index}
              style={{
                background: "rgba(255,255,255,0.2)",
                padding: 10,
                borderRadius: 10,
                textAlign: "center",
              }}
              onClick={() => setSelectedPitchSlot(index)}
            >
              <div>{slot}</div>

              {player ? (
                <>
                  <div>{player.name}</div>
                  <div>{formatSeconds(playerSeconds[player.id] || 0)}</div>

                  <button onClick={() => removeFromPitch(index)}>Bench</button>

                  <button onClick={() => markInjured(player.id)}>Injured</button>
                </>
              ) : (
                <div>Empty</div>
              )}
            </div>
          )
        })}
      </div>

      <h2 style={{ marginTop: 30 }}>Bench</h2>

      <div style={{ display: "grid", gap: 10 }}>
        {benchPlayers.map((player) => (
          <button
            key={player.id}
            onClick={() => {
              if (selectedPitchSlot === null) {
                setSelectedBenchId(player.id)
                return
              }

              const next = [...pitchIds]
              next[selectedPitchSlot] = player.id
              setPitchIds(next)
              setSelectedPitchSlot(null)
            }}
          >
            {player.name} ({formatSeconds(playerSeconds[player.id] || 0)})
          </button>
        ))}
      </div>

      <h2 style={{ marginTop: 30 }}>Injured</h2>

      {injured.map((id) => {
        const player = players.find((p) => p.id === id)
        if (!player) return null

        return (
          <div key={id}>
            {player.name}
            <button onClick={() => returnFromInjury(id)}>Return</button>
          </div>
        )
      })}
    </main>
  )
}

