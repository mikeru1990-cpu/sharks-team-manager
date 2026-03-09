"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Page() {
  const [players, setPlayers] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [name, setName] = useState("");

  async function loadPlayers() {
    const { data } = await supabase.from("players").select("*").order("name");
    setPlayers(data || []);
  }

  async function loadFixtures() {
    const { data } = await supabase.from("fixtures").select("*").order("match_date");
    setFixtures(data || []);
  }

  useEffect(() => {
    loadPlayers();
    loadFixtures();
  }, []);

  async function addPlayer() {
    if (!name) return;

    await supabase.from("players").insert({ name });

    setName("");
    loadPlayers();
  }

  async function deletePlayer(id: string) {
    await supabase.from("players").delete().eq("id", id);
    loadPlayers();
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

      <h2>Players</h2>

      {players.map((p) => (
        <div key={p.id} style={{ display: "flex", justifyContent: "space-between", maxWidth: 400 }}>
          {p.name}
          <button onClick={() => deletePlayer(p.id)}>Delete</button>
        </div>
      ))}

      <h2 style={{ marginTop: 40 }}>Fixtures</h2>

      {fixtures.map((f) => (
        <div key={f.id}>
          {f.opponent} — {f.match_date} ({f.venue})
        </div>
      ))}
    </main>
  );
}
