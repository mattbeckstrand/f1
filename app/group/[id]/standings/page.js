"use client";

import { useState, useEffect } from "react";
import { useGroup } from "../layout";
import { DRIVER_BY_ID } from "@/lib/drivers";

export default function StandingsPage() {
  const ctx = useGroup();
  const [scores, setScores] = useState(null);
  const [rosters, setRosters] = useState(null);
  const [expandedPlayer, setExpandedPlayer] = useState(null);
  const [expandedRace, setExpandedRace] = useState(null);

  const groupId = ctx?.groupId;
  const group = ctx?.group;

  useEffect(() => {
    if (!groupId) return;
    fetch(`/api/groups/${groupId}/scores`).then(r => r.json()).then(setScores);
    fetch(`/api/groups/${groupId}/rosters`).then(r => r.ok ? r.json() : null).then(setRosters);
  }, [groupId]);

  if (!group) return null;

  if (group.draftStatus !== "complete") {
    return (
      <div className="text-center py-12 text-gray-500">
        Draft hasn&apos;t been completed yet.
      </div>
    );
  }

  if (!scores || !rosters) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  const standings = scores.standings || {};
  const sorted = Object.entries(standings).sort(([, a], [, b]) => b - a);
  const races = Object.entries(scores.races || {}).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <div className="space-y-6">
      {/* Season standings */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
          Season Standings
        </h2>
        <div className="space-y-2">
          {sorted.map(([name, total], i) => (
            <div key={name}>
              <button
                onClick={() => setExpandedPlayer(expandedPlayer === name ? null : name)}
                className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between hover:bg-white/[0.05] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded ${
                      i === 0 ? "bg-yellow-500/20 text-yellow-400"
                        : i === 1 ? "bg-gray-400/20 text-gray-300"
                        : i === 2 ? "bg-orange-500/20 text-orange-400"
                        : "text-gray-500"
                    }`}
                  >
                    P{i + 1}
                  </span>
                  <div className="text-left">
                    <p className="font-semibold">{name}</p>
                    <p className="text-xs text-gray-500">
                      {rosters[name]?.map(id => DRIVER_BY_ID[id]?.name.split(" ").pop()).join(", ")}
                    </p>
                  </div>
                </div>
                <span className="text-2xl font-black tabular-nums">
                  {total}<span className="text-xs text-gray-500 ml-1 font-medium">pts</span>
                </span>
              </button>

              {/* Expanded: per-race breakdown */}
              {expandedPlayer === name && races.length > 0 && (
                <div className="mt-1 ml-8 space-y-1">
                  {races.map(([round, race]) => {
                    const raceScore = race.scores[name];
                    if (!raceScore) return null;
                    return (
                      <div key={round} className="bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2 text-sm flex justify-between">
                        <span className="text-gray-400">R{round} {race.raceName}</span>
                        <span className="font-semibold tabular-nums">
                          {raceScore.total >= 0 ? "+" : ""}{raceScore.total}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Race-by-race detail */}
      {races.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
            Race Results
          </h2>
          <div className="space-y-2">
            {races.map(([round, race]) => (
              <div key={round}>
                <button
                  onClick={() => setExpandedRace(expandedRace === round ? null : round)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-left hover:bg-white/[0.05] transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">R{round} · {race.raceName}</p>
                      <p className="text-xs text-gray-500">{race.date}</p>
                    </div>
                    <span className="text-gray-500 text-sm">{expandedRace === round ? "▲" : "▼"}</span>
                  </div>
                </button>

                {expandedRace === round && (
                  <div className="mt-1 space-y-2">
                    {Object.entries(race.scores)
                      .sort(([, a], [, b]) => b.total - a.total)
                      .map(([player, raceScore]) => (
                        <div key={player} className="bg-white/[0.02] border border-white/[0.04] rounded-lg p-3">
                          <div className="flex justify-between mb-2">
                            <span className="font-semibold text-sm">{player}</span>
                            <span className="font-bold tabular-nums text-sm">
                              {raceScore.total >= 0 ? "+" : ""}{raceScore.total} pts
                            </span>
                          </div>
                          <div className="space-y-1">
                            {Object.entries(raceScore.drivers).map(([driverId, dScore]) => {
                              const d = DRIVER_BY_ID[driverId];
                              if (!d) return null;
                              const { breakdown } = dScore;
                              return (
                                <div key={driverId} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.teamColor }} />
                                    <span className="text-gray-300">{d.name.split(" ").pop()}</span>
                                  </div>
                                  <div className="flex gap-2 text-gray-500">
                                    {breakdown.position && <span className="text-gray-300">P{breakdown.position > 0 ? "" : ""}: +{breakdown.position}</span>}
                                    {breakdown.gridDelta !== undefined && (
                                      <span className={breakdown.gridDelta > 0 ? "text-emerald-400" : "text-red-400"}>
                                        {breakdown.gridDelta > 0 ? "+" : ""}{breakdown.gridDelta}
                                      </span>
                                    )}
                                    {breakdown.fastestLap && <span className="text-purple-400">FL +{breakdown.fastestLap}</span>}
                                    {breakdown.dnf && <span className="text-red-400">DNF {breakdown.dnf}</span>}
                                    <span className="font-medium text-white">{dScore.total}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {races.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          No races scored yet.
        </div>
      )}
    </div>
  );
}
