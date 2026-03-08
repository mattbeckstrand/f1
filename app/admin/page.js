"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DRIVERS } from "@/lib/drivers";

export default function AdminPage() {
  const [state, setState] = useState(null);
  const [results, setResults] = useState({});
  const [saved, setSaved] = useState(false);
  const [raceName, setRaceName] = useState("");

  useEffect(() => {
    fetch("/api/state")
      .then(r => r.json())
      .then(data => {
        setState(data);
        setRaceName(data.raceName || "");
        // Populate results dropdowns from existing results
        if (data.results && Object.keys(data.results).length > 0) {
          // Convert { driverId: position } to { position: driverId }
          const posMap = {};
          Object.entries(data.results).forEach(([driverId, pos]) => {
            posMap[pos] = driverId;
          });
          setResults(posMap);
        }
      });
  }, []);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  async function toggleLock() {
    await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggleLock" }),
    });
    setState(s => ({ ...s, locked: !s.locked }));
  }

  async function saveResults() {
    // Convert { position: driverId } to { driverId: position }
    const driverResults = {};
    Object.entries(results).forEach(([pos, driverId]) => {
      if (driverId) driverResults[driverId] = parseInt(pos);
    });

    await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setResults", results: driverResults }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function updateRaceName() {
    await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setRaceName", raceName }),
    });
  }

  async function removePlayer(name) {
    if (!confirm(`Remove ${name}?`)) return;
    await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "removePlayer", name }),
    });
    setState(s => {
      const players = { ...s.players };
      delete players[name];
      return { ...s, players };
    });
  }

  async function resetAll() {
    if (!confirm("Reset ALL data? This cannot be undone.")) return;
    if (!confirm("Are you really sure?")) return;
    await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    setState(s => ({ ...s, players: {}, results: {} }));
    setResults({});
  }

  // Get already-selected drivers for results
  const selectedDrivers = new Set(Object.values(results).filter(Boolean));

  const playerEntries = Object.entries(state.players || {});

  return (
    <div className="pt-8 space-y-8">
      <div className="text-center">
        <p className="text-red-500 font-semibold tracking-[0.3em] text-xs">FANTASY F1</p>
        <h1 className="text-2xl font-black mt-1">Admin</h1>
      </div>

      {/* Race Name */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Race Name</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={raceName}
            onChange={e => setRaceName(e.target.value)}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50"
          />
          <button
            onClick={updateRaceName}
            className="bg-white/10 hover:bg-white/15 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Save
          </button>
        </div>
      </section>

      {/* Lock Toggle */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pick Lock</h2>
        <button
          onClick={toggleLock}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            state.locked
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "bg-red-600 hover:bg-red-700 text-white"
          }`}
        >
          {state.locked ? "Unlock Picks" : "Lock Picks"}
        </button>
        <p className="text-xs text-gray-500 text-center">
          {state.locked ? "Players cannot submit or change picks" : "Players can submit picks"}
        </p>
      </section>

      {/* Players List */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
          Players ({playerEntries.length})
        </h2>
        {playerEntries.length === 0 ? (
          <p className="text-gray-600 text-sm">No players yet</p>
        ) : (
          <div className="space-y-2">
            {playerEntries.map(([name, picks]) => (
              <div
                key={name}
                className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-sm">{name}</p>
                  <p className="text-xs text-gray-500">
                    {picks.map(id => DRIVERS.find(d => d.id === id)?.name.split(" ").pop()).join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => removePlayer(name)}
                  className="text-red-400/60 hover:text-red-400 text-xs transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Enter Results */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Race Results</h2>
        <p className="text-xs text-gray-500">Enter top 10 finishers (only top 10 score points)</p>
        <div className="space-y-2">
          {Array.from({ length: 10 }, (_, i) => i + 1).map(pos => {
            const points = { 1: 25, 2: 18, 3: 15, 4: 12, 5: 10, 6: 8, 7: 6, 8: 4, 9: 2, 10: 1 };
            return (
              <div key={pos} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-20 shrink-0">
                  <span className={`font-bold text-sm ${pos <= 3 ? "text-yellow-400" : "text-gray-400"}`}>
                    P{pos}
                  </span>
                  <span className="text-[10px] text-gray-600">({points[pos]}pts)</span>
                </div>
                <select
                  value={results[pos] || ""}
                  onChange={e => setResults(r => ({ ...r, [pos]: e.target.value || undefined }))}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500/50 appearance-none"
                >
                  <option value="">Select driver...</option>
                  {DRIVERS.map(d => (
                    <option
                      key={d.id}
                      value={d.id}
                      disabled={selectedDrivers.has(d.id) && results[pos] !== d.id}
                    >
                      {d.name} ({d.team})
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        <button
          onClick={saveResults}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            saved
              ? "bg-emerald-600 text-white"
              : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white"
          }`}
        >
          {saved ? "Saved!" : "Save Results"}
        </button>
      </section>

      {/* Danger Zone */}
      <section className="space-y-3 border-t border-red-500/10 pt-6">
        <h2 className="text-sm font-bold text-red-400/60 uppercase tracking-wider">Danger Zone</h2>
        <button
          onClick={resetAll}
          className="w-full py-3 rounded-xl font-bold border border-red-500/20 text-red-400/60 hover:text-red-400 hover:border-red-500/40 transition-all text-sm"
        >
          Reset All Data
        </button>
      </section>

      <nav className="flex justify-center gap-6 pt-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
      </nav>
    </div>
  );
}
