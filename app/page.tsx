"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export default function Page() {
  const [players, setPlayers] = useState<any[]>([]);
  const [fixtures, setFixtures] = useState<any[]>([]);
  const [availability, setAvailability] = useState<any[]>([]);
  const [name, setName] = useState("");

  async function loadPlayers() {
    const { data } = await supabase.from("players").select("*").order("name");
    setPlayers(data || []);
  }

  async function loadFixtures() {
    const { data } = await supabase
      .from("fixtures")
      .select("*")
      .order("match_date");
    setFixtures(data || []);
  }

  async function loadAvailability() {
    const { data } = await supabase.from("availability").select("*");
    setAvailability(data || []);
  }

  useEffect(() => {
    loadPlayers();
    loadFixtures();
    loadAvailability();
  }, []);

  async function addPlayer() {
    if (!name) return;
    await supabase.from("players").insert([{ name }]);
    setName("");
    loadPlayers();
  }

  async function deletePlayer(id: string) {
    await supabase.from("players").delete().eq("id", id);
    loadPlayers();
  }

  function isAvailable(fixtureId: string, playerId: string) {
    return availability.some(
      (a) => a.fixture_id === fixtureId && a.player_id === playerId && a.available
    );
  }

  async function toggleAvailability(
    fixtureId: string,
    playerId: string,
    checked: boolean
  ) {
    const existing = availability.find(
      (a) => a.fixture_id === fixtureId && a.player_id === playerId
    );

    if (existing) {
      await supabase
        .from("availability")
        .update({ available: checked })
        .eq("id", existing.id);
    } else {
      await supabase.from("availability").insert([
        {
          fixture_id: fixtureId,
          player_id: playerId,
          available: checked,
        },
      ]);
    }

    loadAvailability();
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
        <div
          key={p.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: 420,
            marginBottom: 8,
          }}
        >
          <span>{p.name}</span>
          <button onClick={() => deletePlayer(p.id)}>Delete</button>
        </div>
      ))}

      <h2 style={{ marginTop: 40 }}>Fixtures</h2>

      {fixtures.map((f) => (
        <div key={f.id} style={{ marginBottom: 24 }}>
          <strong>
            {f.opponent} — {f.match_date} ({f.venue})
          </strong>

          <div style={{ marginTop: 10 }}>
            {players.map((player) => (
              <label key={player.id} style={{ display: "block" }}>
                <input
                  type="checkbox"
                  checked={isAvailable(f.id, player.id)}
                  onChange={(e) =>
                    toggleAvailability(f.id, player.id, e.target.checked)
                  }
                />{" "}
                {player.name}
              </label>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
