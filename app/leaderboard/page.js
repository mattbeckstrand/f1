"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DRIVERS } from "@/lib/drivers";
import { calculateScore, POINTS } from "@/lib/scoring";

export default function LeaderboardPage() {
  const [state, setState] = useState(null);

  useEffect(() => {
    const load = () => fetch("/api/state").then(r => r.json()).then(setState);
    load();
    const id = setInterval(load, 5000);
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

  function getDriver(id) {
    return DRIVERS.find(d => d.id === id);
  }

  function getDriverPoints(driverId) {
    if (!hasResults) return null;
    const pos = state.results[driverId];
    return POINTS[pos] || 0;
  }

  return (
    <div className="pt-8 space-y-6">
      <div className="text-center">
        <p className="text-red-500 font-semibold tracking-[0.3em] text-xs">FANTASY F1</p>
        <h1 className="text-2xl font-black mt-1">Leaderboard</h1>
        <p className="text-gray-500 text-sm mt-1">{state.raceName}</p>
      </div>

      {!hasResults && entries.length > 0 && (
        <div className="text-center py-4 px-6 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p className="text-amber-400 text-sm font-medium">Waiting for race results...</p>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg">No players yet</p>
          <Link href="/pick" className="text-red-400 hover:text-red-300 text-sm mt-2 inline-block">
            Be the first to pick →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((player, i) => (
            <div
              key={player.name}
              className={`rounded-xl border p-4 ${
                i === 0 && hasResults
                  ? "bg-yellow-500/[0.07] border-yellow-500/20"
                  : "bg-white/[0.03] border-white/[0.06]"
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  {hasResults && (
                    <span
                      className={`text-sm font-black w-8 h-8 rounded-lg flex items-center justify-center ${
                        i === 0
                          ? "bg-yellow-500/20 text-yellow-400"
                          : i === 1
                          ? "bg-gray-400/20 text-gray-300"
                          : i === 2
                          ? "bg-orange-500/20 text-orange-400"
                          : "bg-white/5 text-gray-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                  )}
                  <h3 className="font-bold text-lg">{player.name}</h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black tabular-nums">
                    {player.score !== null ? player.score : "—"}
                  </span>
                  {player.score !== null && (
                    <span className="text-xs text-gray-500 ml-1">pts</span>
                  )}
                </div>
              </div>

              {/* Driver picks */}
              <div className="space-y-1.5">
                {player.picks.map(driverId => {
                  const d = getDriver(driverId);
                  if (!d) return null;
                  const pts = getDriverPoints(driverId);
                  const pos = state.results?.[driverId];
                  return (
                    <div
                      key={driverId}
                      className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-6 rounded-full"
                          style={{ backgroundColor: d.teamColor }}
                        />
                        <span className="text-sm font-medium">{d.name}</span>
                      </div>
                      {hasResults && (
                        <div className="flex items-center gap-3">
                          {pos && pos <= 20 && (
                            <span className="text-xs text-gray-500">P{pos}</span>
                          )}
                          <span
                            className={`text-sm font-bold tabular-nums ${
                              pts > 0 ? "text-emerald-400" : "text-gray-600"
                            }`}
                          >
                            {pts > 0 ? `+${pts}` : "0"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <nav className="flex justify-center gap-6 pt-4 text-sm text-gray-500">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <Link href="/pick" className="hover:text-white transition-colors">Picks</Link>
        <Link href="/admin" className="hover:text-white transition-colors">Admin</Link>
      </nav>
    </div>
  );
}
