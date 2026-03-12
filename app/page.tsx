"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

type Player = {
  id: string
  name: string
}

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([])
  const [name, setName] = useState("")

  useEffect(() => {
    loadPlayers()
  }, [])

  async function loadPlayers() {
    const { data } = await supabase.from("players").select("*")

    if (data) {
      setPlayers(data)
      localStorage.setItem("sharks_players", JSON.stringify(data))
    }
  }

  async function addPlayer() {
    if (!name.trim()) return

    const id = Date.now().toString()

    await supabase.from("players").insert({
      id,
      name
    })

    setName("")
    loadPlayers()
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Sharks Team Manager</h1>

      <h2>Add Player</h2>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Player name"
      />

      <button onClick={addPlayer}>
        Add
      </button>

      <h2>Players</h2>

      {players.map((p) => (
        <div key={p.id}>{p.name}</div>
      ))}
    </main>
  )
}
