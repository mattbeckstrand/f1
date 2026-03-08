"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DRIVERS } from "@/lib/drivers";
import { calculateScore } from "@/lib/scoring";

export default function Home() {
  const [state, setState] = useState(null);

  useEffect(() => {
    const load = () => fetch("/api/state").then(r => r.json()).then(setState);
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, []);

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  const hasResults = state.results && Object.keys(state.results).length > 0;
  const entries = Object.entries(state.players || {});

  const leaderboard = entries
    .map(([name, picks]) => ({
      name,
      picks,
      score: calculateScore(picks, state.results),
    }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  return (
    <div className="space-y-6 pt-8">
      {/* Hero */}
      <div className="text-center">
        <p className="text-red-500 font-semibold tracking-[0.3em] text-xs uppercase">
          Beckstrand Family
        </p>
        <h1 className="text-5xl font-black tracking-tight mt-1 bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
          FANTASY F1
        </h1>
        <p className="text-gray-400 mt-2 text-lg">{state.raceName}</p>
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 gap-3">
        <div
          className={`rounded-xl p-4 text-center border ${
            state.locked
              ? "bg-red-500/10 border-red-500/30"
              : "bg-emerald-500/10 border-emerald-500/30"
          }`}
        >
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Picks</p>
          <p className={`text-lg font-extrabold ${state.locked ? "text-red-400" : "text-emerald-400"}`}>
            {state.locked ? "LOCKED" : "OPEN"}
          </p>
        </div>
        <div
          className={`rounded-xl p-4 text-center border ${
            hasResults
              ? "bg-emerald-500/10 border-emerald-500/30"
              : "bg-amber-500/10 border-amber-500/30"
          }`}
        >
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">Results</p>
          <p className={`text-lg font-extrabold ${hasResults ? "text-emerald-400" : "text-amber-400"}`}>
            {hasResults ? "FINAL" : "PENDING"}
          </p>
        </div>
      </div>

      {/* CTA */}
      {!state.locked && (
        <Link href="/pick" className="block">
          <div className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-5 rounded-xl text-center text-xl transition-all shadow-lg shadow-red-500/20">
            Make Your Picks
          </div>
        </Link>
      )}

      {state.locked && !hasResults && (
        <div className="text-center py-4 text-gray-400">
          Picks are locked. Waiting for race results...
        </div>
      )}

      {/* Leaderboard */}
      {entries.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              {hasResults ? "Leaderboard" : `${entries.length} Player${entries.length !== 1 ? "s" : ""}`}
            </h2>
            <Link href="/leaderboard" className="text-red-400 text-sm hover:text-red-300">
              Details →
            </Link>
          </div>
          <div className="space-y-2">
            {leaderboard.map((p, i) => {
              const driver = id => DRIVERS.find(d => d.id === id);
              return (
                <div
                  key={p.name}
                  className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {hasResults && (
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          i === 0
                            ? "bg-yellow-500/20 text-yellow-400"
                            : i === 1
                            ? "bg-gray-400/20 text-gray-300"
                            : i === 2
                            ? "bg-orange-500/20 text-orange-400"
                            : "text-gray-500"
                        }`}
                      >
                        P{i + 1}
                      </span>
                    )}
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-gray-500">
                        {p.picks.map(id => driver(id)?.name.split(" ").pop()).join(", ")}
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl font-black tabular-nums">
                    {p.score !== null ? (
                      <>
                        {p.score}
                        <span className="text-xs text-gray-500 ml-1 font-medium">pts</span>
                      </>
                    ) : (
                      <span className="text-gray-700">—</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No picks yet. Be the first!
        </div>
      )}

      {/* Nav */}
      <nav className="flex justify-center gap-6 pt-6 text-sm text-gray-500">
        <Link href="/pick" className="hover:text-white transition-colors">Picks</Link>
        <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
        <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
      </nav>
    </div>
  );
}
