"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";

type Player = {
  id: string;
  name: string;
  position?: string;
};

type Fixture = {
  id: string;
  opponent: string;
  match_date: string;
  venue?: string;
};

type Availability = {
  id: string;
  fixture_id: string;
  player_id: string;
  available: boolean;
};

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [generatedSquads, setGeneratedSquads] = useState<
    Record<string, { starters: Player[]; bench: Player[] }>
  >({});
  const [name, setName] = useState("");
  const [position, setPosition] = useState("MID");

  async function loadPlayers() {
    const { data } = await supabase.from("players").select("*").order("name");
    setPlayers((data as Player[]) || []);
  }

  async function loadFixtures() {
    const { data } = await supabase
      .from("fixtures")
      .select("*")
      .order("match_date");
    setFixtures((data as Fixture[]) || []);
  }

  async function loadAvailability() {
    const { data } = await supabase.from("availability").select("*");
    setAvailability((data as Availability[]) || []);
  }

  useEffect(() => {
    loadPlayers();
    loadFixtures();
    loadAvailability();
  }, []);

  async function addPlayer() {
    if (!name.trim()) return;

    await supabase.from("players").insert([
      {
        name: name.trim(),
        position,
      },
    ]);

    setName("");
    setPosition("MID");
    loadPlayers();
  }

  async function deletePlayer(id: string) {
    await supabase.from("players").delete().eq("id", id);
    loadPlayers();
    loadAvailability();
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

    const goalkeepers = available.filter((p) => p.position === "GK");
    const defenders = available.filter((p) => p.position === "DEF");
    const midfielders = available.filter((p) => p.position === "MID");
    const forwards = available.filter((p) => p.position === "FWD");
    const others = available.filter(
      (p) => !["GK", "DEF", "MID", "FWD"].includes(p.position || "")
    );

    const starters: Player[] = [
      ...goalkeepers.slice(0, 1),
      ...defenders.slice(0, 2),
      ...midfielders.slice(0, 2),
      ...forwards.slice(0, 2),
    ];

    const starterIds = new Set(starters.map((p) => p.id));

    const remaining = available.filter((p) => !starterIds.has(p.id));

    while (starters.length < 7 && remaining.length > 0) {
      const next = remaining.shift();
      if (next) starters.push(next);
    }

    const bench = [
      ...remaining,
      ...others.filter((p) => !starterIds.has(p.id) && !remaining.find((r) => r.id === p.id)),
    ];

    setGeneratedSquads((prev) => ({
      ...prev,
      [fixtureId]: { starters, bench },
    }));
  }

  return (
    <main
      style={{
        padding: 16,
        maxWidth: 520,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 16 }}>Sharks Team Manager</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 24,
        }}
      >
        <input
          placeholder="Player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />

        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 10,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        >
          <option value="GK">GK</option>
          <option value="DEF">DEF</option>
          <option value="MID">MID</option>
          <option value="FWD">FWD</option>
        </select>

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
          Add Player
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
              gap: 12,
            }}
          >
            <span style={{ fontSize: 18 }}>
              {p.name} {p.position ? `• ${p.position}` : ""}
            </span>
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
              {f.match_date} • {f.venue || "No venue"}
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

          {generatedSquads[f.id] && (
            <div
              style={{
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                background: "#f7f7f7",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Starting 7</div>
              {generatedSquads[f.id].starters.length > 0 ? (
                generatedSquads[f.id].starters.map((p) => (
                  <div key={p.id}>
                    {p.name} {p.position ? `• ${p.position}` : ""}
                  </div>
                ))
              ) : (
                <div>None</div>
              )}

              <div style={{ fontWeight: 700, marginTop: 12, marginBottom: 8 }}>
                Bench
              </div>
              {generatedSquads[f.id].bench.length > 0 ? (
                generatedSquads[f.id].bench.map((p) => (
                  <div key={p.id}>
                    {p.name} {p.position ? `• ${p.position}` : ""}
                  </div>
                ))
              ) : (
                <div>None</div>
              )}
            </div>
          )}

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
                {player.name} {player.position ? `• ${player.position}` : ""}
              </label>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
