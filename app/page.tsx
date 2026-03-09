"use client";

import { useState } from "react";

type Player = {
  id: string;
  name: string;
  position: string;
};

type Fixture = {
  id: string;
  opponent: string;
  match_date: string;
  venue: string;
};

type Squad = {
  starters: Player[];
  bench: Player[];
  quarters: Player[][];
};

export default function Page() {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("GK");

  const [players, setPlayers] = useState<Player[]>([
    { id: "1", name: "Bailee Dowler-Rowles", position: "MID" },
    { id: "2", name: "Bella Bainbridge", position: "MID" },
    { id: "3", name: "Betsy Rowland", position: "DEF" },
    { id: "4", name: "Connie Luff", position: "FWD" },
    { id: "5", name: "Darcy-Rae Russell", position: "GK" },
    { id: "6", name: "Ella Wilson", position: "MID" },
    { id: "7", name: "Elsy Harmer", position: "DEF" },
    { id: "8", name: "Evelyn Evans", position: "FWD" },
    { id: "9", name: "Isabella Ogden", position: "DEF" },
    { id: "10", name: "Lyra Twinning", position: "MID" },
    { id: "11", name: "Martha Scrivens", position: "DEF" },
    { id: "12", name: "Olivia Hassall", position: "FWD" },
    { id: "13", name: "Poppy Bennett", position: "MID" },
    { id: "14", name: "Ruby Salter", position: "FWD" },
  ]);

  const [fixtures] = useState<Fixture[]>([
    {
      id: "1",
      opponent: "Tigers",
      match_date: "2026-03-15",
      venue: "Home",
    },
  ]);

  const [availability, setAvailability] = useState<Record<string, Set<string>>>(
    {}
  );

  const [generatedSquads, setGeneratedSquads] = useState<Record<string, Squad>>(
    {}
  );

  function addPlayer() {
    if (!name.trim()) return;

    const newPlayer: Player = {
      id: Date.now().toString(),
      name,
      position,
    };

    setPlayers([...players, newPlayer]);
    setName("");
    setPosition("GK");
  }

  function deletePlayer(id: string) {
    setPlayers(players.filter((p) => p.id !== id));
  }

  function toggleAvailability(fixtureId: string, playerId: string) {
    const current = availability[fixtureId] || new Set<string>();
    const updated = new Set(current);

    if (updated.has(playerId)) {
      updated.delete(playerId);
    } else {
      updated.add(playerId);
    }

    setAvailability({
      ...availability,
      [fixtureId]: updated,
    });
  }

  function isAvailable(fixtureId: string, playerId: string) {
    return availability[fixtureId]?.has(playerId) || false;
  }

  function generateSquad(fixtureId: string) {
    const available = players.filter((p) => isAvailable(fixtureId, p.id));

    const gk = available.filter((p) => p.position === "GK");
    const def = available.filter((p) => p.position === "DEF");
    const mid = available.filter((p) => p.position === "MID");
    const fwd = available.filter((p) => p.position === "FWD");
    const other = available.filter(
      (p) => !["GK", "DEF", "MID", "FWD"].includes(p.position)
    );

    const starters: Player[] = [
      ...gk.slice(0, 1),
      ...def.slice(0, 2),
      ...mid.slice(0, 2),
      ...fwd.slice(0, 2),
    ];

    const starterIds = new Set(starters.map((p) => p.id));

    const remaining = available.filter((p) => !starterIds.has(p.id));

    while (starters.length < 7 && remaining.length > 0) {
      const next = remaining.shift();
      if (next) starters.push(next);
    }

    while (starters.length < 7 && other.length > 0) {
      const next = other.shift();
      if (next && !starters.find((p) => p.id === next.id)) {
        starters.push(next);
      }
    }

    const finalStarterIds = new Set(starters.map((p) => p.id));
    const bench = available.filter((p) => !finalStarterIds.has(p.id));

    const quarters: Player[][] = [];

    for (let q = 0; q < 4; q++) {
      const quarter = [...starters];

      if (bench.length > 0) {
        const swaps = Math.min(bench.length, 2);

        for (let s = 0; s < swaps; s++) {
          const benchPlayer = bench[(q * 2 + s) % bench.length];
          const swapIndex = 6 - s;

          if (benchPlayer && quarter[swapIndex]) {
            quarter[swapIndex] = benchPlayer;
          }
        }
      }

      const seen = new Set<string>();
      const uniqueQuarter = quarter.filter((p) => {
        if (seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });

      quarters.push(uniqueQuarter);
    }

    setGeneratedSquads({
      ...generatedSquads,
      [fixtureId]: { starters, bench, quarters },
    });
  }

  return (
    <main
      style={{
        padding: 20,
        maxWidth: 520,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>Sharks Team Manager</h1>

      <div style={{ marginBottom: 30 }}>
        <input
          placeholder="Player name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 10,
            borderRadius: 10,
            border: "1px solid #ccc",
            fontSize: 16,
          }}
        />

        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          style={{
            width: "100%",
            padding: 12,
            marginBottom: 10,
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
            width: "100%",
            padding: 12,
            borderRadius: 10,
            border: "none",
            background: "#111",
            color: "white",
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          Add Player
        </button>
      </div>

      <h2 style={{ fontSize: 28, marginBottom: 12 }}>Players</h2>

      {players.map((p) => (
        <div
          key={p.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
            paddingBottom: 8,
            borderBottom: "1px solid #eee",
          }}
        >
          <span style={{ fontSize: 18 }}>
            {p.name} • {p.position}
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

      <h2 style={{ fontSize: 28, marginTop: 40, marginBottom: 12 }}>Fixtures</h2>

      {fixtures.map((f) => (
        <div
          key={f.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
            background: "#fff",
          }}
        >
          <h3 style={{ fontSize: 24, marginBottom: 6 }}>{f.opponent}</h3>
          <div style={{ color: "#555", marginBottom: 12 }}>
            {f.match_date} • {f.venue}
          </div>

          <button
            onClick={() => generateSquad(f.id)}
            style={{
              marginBottom: 16,
              padding: "10px 14px",
              borderRadius: 10,
              border: "none",
              background: "#111",
              color: "white",
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            Generate Squad
          </button>

          {generatedSquads[f.id] && (
            <div
              style={{
                marginBottom: 16,
                background: "#f3f3f3",
                padding: 14,
                borderRadius: 14,
              }}
            >
              <div style={{ marginBottom: 14 }}>
                <strong style={{ fontSize: 18 }}>Starting 7</strong>
                {generatedSquads[f.id].starters.length > 0 ? (
                  generatedSquads[f.id].starters.map((p) => (
                    <div key={p.id}>
                      {p.name} • {p.position}
                    </div>
                  ))
                ) : (
                  <div>None</div>
                )}
              </div>

              <div style={{ marginBottom: 14 }}>
                <strong style={{ fontSize: 18 }}>Bench</strong>
                {generatedSquads[f.id].bench.length > 0 ? (
                  generatedSquads[f.id].bench.map((p) => (
                    <div key={p.id}>
                      {p.name} • {p.position}
                    </div>
                  ))
                ) : (
                  <div>None</div>
                )}
              </div>

              <div>
                <strong style={{ fontSize: 18 }}>Quarter Plan</strong>
                {generatedSquads[f.id].quarters.map((quarter, i) => (
                  <div key={i} style={{ marginTop: 12 }}>
                    <strong>Quarter {i + 1}</strong>
                    {quarter.length > 0 ? (
                      quarter.map((p) => (
                        <div key={`${i}-${p.id}`}>
                          {p.name} • {p.position}
                        </div>
                      ))
                    ) : (
                      <div>None</div>
                    )}
                  </div>
                ))}
              </div>
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
                  onChange={() => toggleAvailability(f.id, player.id)}
                  style={{ width: 22, height: 22 }}
                />
                {player.name} • {player.position}
              </label>
            ))}
          </div>
        </div>
      ))}
    </main>
  );
}
