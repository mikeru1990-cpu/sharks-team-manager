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

  function generateSquad(fixtureId: string) {
    const available = players.filter((p) => isAvailable(fixtureId, p.id));
    const starters = available.slice(0, 7);
    const bench = available.slice(7);

    alert(
      "Starting 7:\n" +
        (starters.map((p) => p.name).join("\n") || "None") +
        "\n\nBench:\n" +
        (bench.map((p) => p.name).join("\n") || "None")
    );
  }

  return (
    <main
      style={{
        padding: 16,
        maxWidth: 480,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Sharks Team Manager</h1>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
        }}
      >
        <input
          placeholder="Player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />
        <button
          onClick={addPlayer}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "none",
            background: "#111",
            color: "white",
            fontWeight: 600,
          }}
        >
          Add
        </button>
      </div>

      <h2 style={{ fontSize: 28, marginBottom: 12 }}>Players</h2>

      <div style={{ marginBottom: 32 }}>
        {players.map((p) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <span style={{ fontSize: 18 }}>{p.name}</span>
            <button
              onClick={() => deletePlayer(p.id)}
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "none",
                background: "#eee",
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: 28, marginBottom: 12 }}>Fixtures</h2>

      {fixtures.map((f) => (
        <div
          key={f.id}
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            background: "#fff",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{f.opponent}</div>
            <div style={{ color: "#555", marginTop: 4 }}>
              {f.match_date} • {f.venue}
            </div>
          </div>

          <button
            onClick={() => generateSquad(f.id)}
            style={{
              marginBottom: 14,
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "#111",
              color: "white",
              fontWeight: 600,
            }}
          >
            Generate Squad
          </button>

          <div>
            {players.map((player) => (
              <label
                key={player.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 0",
                  fontSize: 18,
                }}
              >
                <input
                  type="checkbox"
                  checked={isAvailable(f.id, player.id)}
                  onChange={(e) =>
                    toggleAvailability(f.id, player.id, e.target.checked)
                  }
                  style={{ width: 22, height: 22 }}
                />
                {player.name}
              </label>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
