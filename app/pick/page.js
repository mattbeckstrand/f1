"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DRIVERS, TEAMS } from "@/lib/drivers";

const MAX_PICKS = 5;

export default function PickPage() {
  const [state, setState] = useState(null);
  const [name, setName] = useState("");
  const [picks, setPicks] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/state").then(r => r.json()).then(setState);
  }, []);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  if (state.locked) {
    return (
      <div className="pt-8 space-y-6">
        <Header />
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-red-400">Picks Are Locked</h2>
          <p className="text-gray-400 mt-2">The race is about to start. Good luck!</p>
          <Link href="/" className="inline-block mt-6 text-red-400 hover:text-red-300">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="pt-8 space-y-6">
        <Header />
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🏁</div>
          <h2 className="text-xl font-bold text-emerald-400">Picks Submitted!</h2>
          <p className="text-gray-400 mt-2">
            <span className="font-semibold text-white">{name}</span>, your drivers are locked in.
          </p>
          <div className="mt-6 space-y-2">
            {picks.map(id => {
              const d = DRIVERS.find(dr => dr.id === id);
              return (
                <div
                  key={id}
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-4 py-2 mr-2"
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: d.teamColor }}
                  />
                  <span className="font-medium text-sm">{d.name}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white text-sm">
              ← Home
            </Link>
            <Link href="/leaderboard" className="text-red-400 hover:text-red-300 text-sm">
              Leaderboard →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  function togglePick(driverId) {
    setPicks(prev => {
      if (prev.includes(driverId)) return prev.filter(id => id !== driverId);
      if (prev.length >= MAX_PICKS) return prev;
      return [...prev, driverId];
    });
  }

  async function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) { setError("Enter your name"); return; }
    if (picks.length !== MAX_PICKS) { setError(`Pick exactly ${MAX_PICKS} drivers`); return; }

    const res = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addPlayer", name: trimmed, picks }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      return;
    }
    setSubmitted(true);
  }

  // Group drivers by team
  const teamGroups = TEAMS.map(team => ({
    team,
    drivers: DRIVERS.filter(d => d.team === team),
    color: DRIVERS.find(d => d.team === team)?.teamColor,
  }));

  return (
    <div className="pt-8 space-y-6">
      <Header />

      {/* Name input */}
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Your Name</label>
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError(""); }}
          placeholder="Enter your name..."
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-colors"
        />
      </div>

      {/* Pick counter */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Select <span className="font-bold text-white">{MAX_PICKS}</span> drivers
        </p>
        <p className={`text-sm font-bold ${picks.length === MAX_PICKS ? "text-emerald-400" : "text-gray-400"}`}>
          {picks.length}/{MAX_PICKS}
        </p>
      </div>

      {/* Driver grid by team */}
      <div className="space-y-3">
        {teamGroups.map(({ team, drivers, color }) => (
          <div key={team}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-1 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{team}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {drivers.map(driver => {
                const selected = picks.includes(driver.id);
                const disabled = !selected && picks.length >= MAX_PICKS;
                return (
                  <button
                    key={driver.id}
                    onClick={() => togglePick(driver.id)}
                    disabled={disabled}
                    className={`relative text-left p-3 rounded-xl border transition-all ${
                      selected
                        ? "bg-white/10 border-white/20 shadow-lg"
                        : disabled
                        ? "bg-white/[0.02] border-white/[0.04] opacity-40 cursor-not-allowed"
                        : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.06] hover:border-white/10"
                    }`}
                    style={selected ? { borderColor: color + "80", boxShadow: `0 0 20px ${color}15` } : {}}
                  >
                    {selected && (
                      <span
                        className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: color }}
                      >
                        ✓
                      </span>
                    )}
                    <span className="text-gray-500 text-xs font-mono">#{driver.number}</span>
                    <p className="font-semibold text-sm mt-0.5 leading-tight">{driver.name}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm text-center font-medium">{error}</p>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={picks.length !== MAX_PICKS || !name.trim()}
        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
          picks.length === MAX_PICKS && name.trim()
            ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-500/20"
            : "bg-white/5 text-gray-600 cursor-not-allowed"
        }`}
      >
        Submit Picks
      </button>

      <Link href="/" className="block text-center text-sm text-gray-500 hover:text-white transition-colors">
        ← Back to home
      </Link>
    </div>
  );
}

function Header() {
  return (
    <div className="text-center">
      <p className="text-red-500 font-semibold tracking-[0.3em] text-xs">FANTASY F1</p>
      <h1 className="text-2xl font-black mt-1">Pick Your Drivers</h1>
    </div>
  );
}
