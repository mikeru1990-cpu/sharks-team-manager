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

     async function deletePlayer(id: string) {
  await supabase.from("players").delete().eq("id", id)
  loadPlayers()
}

{players.map((player) => (
  <div
    key={player.id}
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
      maxWidth: 420,
    }}
  >
    <span>{player.name}</span>
    <button onClick={() => deletePlayer(player.id)}>Delete</button>
  </div>
))}
