"use client"

import { useEffect, useState } from "react"
import { supabase } from "../supabase"

export default function Page() {
  const [players, setPlayers] = useState<any[]>([])
  const [name, setName] = useState("")

  async function loadPlayers() {
    const { data } = await supabase.from("players").select("*").order("name")
    setPlayers(data || [])
  }

  useEffect(() => {
    loadPlayers()
  }, [])

  async function addPlayer() {
    if (!name) return

    await supabase.from("players").insert([{ name }])

    setName("")
    loadPlayers()
  }

  return (
    <main style={{ padding: 20 }}>
      <h1>Sharks Team Manager</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={addPlayer}>Add Player</button>
      </div>

      {players.map((player) => (
        <div key={player.id}>{player.name}</div>
      ))}
    </main>
  )
}
