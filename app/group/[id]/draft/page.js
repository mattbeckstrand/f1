"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGroup } from "../layout";
import { DRIVERS, TEAMS, DRIVER_BY_ID } from "@/lib/drivers";

export default function DraftPage() {
  const router = useRouter();
  const ctx = useGroup();
  const [draft, setDraft] = useState(null);
  const [draftStarted, setDraftStarted] = useState(false);
  const [error, setError] = useState("");
  const [pickFlash, setPickFlash] = useState(null);
  const [loading, setLoading] = useState(false);

  const group = ctx?.group;
  const session = ctx?.session;
  const groupId = ctx?.groupId;
  const playerName = session?.playerName;
  const isCreator = playerName === group?.creator;

  const loadDraft = useCallback(async () => {
    if (!groupId) return;
    const res = await fetch(`/api/groups/${groupId}/draft`);
    if (res.ok) {
      const data = await res.json();
      // Check for new pick to flash
      if (draft && data.picks.length > draft.picks.length) {
        const newPickId = data.picks[data.picks.length - 1];
        const picker = data.order[data.picks.length - 1];
        setPickFlash({ driverId: newPickId, player: picker });
        setTimeout(() => setPickFlash(null), 2000);
      }
      setDraft(data);
      setDraftStarted(true);
    }
  }, [groupId, draft]);

  // Poll for draft updates
  useEffect(() => {
    loadDraft();
    const interval = setInterval(loadDraft, 3000);
    return () => clearInterval(interval);
  }, [groupId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleStartDraft() {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/groups/${groupId}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start", playerName }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to start draft");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setDraft(data);
    setDraftStarted(true);
    setLoading(false);
  }

  async function handlePick(driverId) {
    setLoading(true);
    setError("");
    const res = await fetch(`/api/groups/${groupId}/draft`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "pick", playerName, driverId }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to make pick");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setDraft(data);
    setLoading(false);
  }

  if (!group || !session) return null;

  // Pre-draft: start button (creator only)
  if (!draftStarted && group.draftStatus === "waiting") {
    return (
      <div className="space-y-6 text-center">
        <h2 className="text-2xl font-black">Ready to Draft?</h2>
        <p className="text-gray-400">
          {group.members.length} players · {Math.floor(22 / group.members.length)} picks each
        </p>
        {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
        {isCreator ? (
          <button
            onClick={handleStartDraft}
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-5 rounded-xl text-xl transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            {loading ? "Starting..." : "Start Draft"}
          </button>
        ) : (
          <p className="text-gray-400">Waiting for {group.creator} to start...</p>
        )}
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-xl text-gray-500">Loading draft...</div>
      </div>
    );
  }

  const isComplete = draft.currentPickIndex >= draft.order.length;
  const currentPicker = !isComplete ? draft.order[draft.currentPickIndex] : null;
  const isMyTurn = currentPicker === playerName;
  const pickedDriverIds = new Set(draft.picks);

  // Draft complete screen
  if (isComplete) {
    // Build rosters from draft
    const rosters = {};
    for (let i = 0; i < draft.picks.length; i++) {
      const player = draft.order[i];
      if (!rosters[player]) rosters[player] = [];
      rosters[player].push(draft.picks[i]);
    }

    return (
      <div className="space-y-6">
        <div className="text-center py-4">
          <h2 className="text-3xl font-black bg-gradient-to-r from-red-500 to-orange-400 bg-clip-text text-transparent">
            Draft Complete!
          </h2>
          <p className="text-gray-400 mt-2">All rosters are set for the season</p>
        </div>

        {draft.playerOrder.map(name => (
          <div key={name} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
            <p className="font-semibold mb-3">{name}</p>
            <div className="space-y-1.5">
              {(rosters[name] || []).map((id, i) => {
                const d = DRIVER_BY_ID[id];
                if (!d) return null;
                return (
                  <div key={id} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 text-xs w-5">{i + 1}.</span>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.teamColor }} />
                    <span>{d.name}</span>
                    <span className="text-gray-600 text-xs">#{d.number}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={() => router.push(`/group/${groupId}`)}
          className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-xl text-lg transition-all"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Live draft
  const currentRound = Math.floor(draft.currentPickIndex / draft.playerOrder.length) + 1;
  const pickInRound = (draft.currentPickIndex % draft.playerOrder.length) + 1;

  // Team-grouped drivers for selection
  const teamGroups = TEAMS.map(team => ({
    team,
    drivers: DRIVERS.filter(d => d.team === team),
    color: DRIVERS.find(d => d.team === team)?.teamColor,
  }));

  // Draft board
  const numPlayers = draft.playerOrder.length;
  const boardRounds = [];
  for (let r = 0; r < draft.rounds; r++) {
    const roundPicks = [];
    for (let p = 0; p < numPlayers; p++) {
      const idx = r * numPlayers + p;
      roundPicks.push({
        player: draft.order[idx],
        driverId: draft.picks[idx] || null,
        isCurrent: idx === draft.currentPickIndex,
      });
    }
    boardRounds.push(roundPicks);
  }

  return (
    <div className="space-y-4">
      {/* Pick flash */}
      {pickFlash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 border-2 border-red-500 rounded-2xl p-8 text-center animate-bounce">
            <p className="text-red-400 text-sm font-bold uppercase tracking-wider">Pick is in!</p>
            <p className="text-white text-2xl font-black mt-1">
              {DRIVER_BY_ID[pickFlash.driverId]?.name}
            </p>
            <p className="text-gray-400 text-sm mt-1">by {pickFlash.player}</p>
          </div>
        </div>
      )}

      {/* Hero banner */}
      <div className={`rounded-xl p-6 text-center border ${
        isMyTurn
          ? "bg-red-500/10 border-red-500/30"
          : "bg-white/[0.03] border-white/[0.06]"
      }`}>
        <p className="text-xs text-gray-400 uppercase tracking-wider">
          Round {currentRound} · Pick {pickInRound}
        </p>
        {isMyTurn ? (
          <p className="text-2xl font-black text-red-400 mt-1">YOUR PICK</p>
        ) : (
          <p className="text-xl font-bold text-gray-300 mt-1">
            Waiting for {currentPicker}...
          </p>
        )}
      </div>

      {/* Draft board */}
      <div>
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Draft Board</h3>
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left text-gray-600 pb-1 pr-2">Rd</th>
                {draft.playerOrder.map(name => (
                  <th key={name} className="text-center text-gray-500 pb-1 px-1 truncate max-w-[60px]">
                    {name.length > 6 ? name.slice(0, 6) : name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {boardRounds.map((round, ri) => (
                <tr key={ri}>
                  <td className="text-gray-600 py-0.5 pr-2">{ri + 1}</td>
                  {round.map((pick, pi) => {
                    const d = pick.driverId ? DRIVER_BY_ID[pick.driverId] : null;
                    return (
                      <td
                        key={pi}
                        className={`text-center py-0.5 px-1 ${
                          pick.isCurrent ? "bg-red-500/10 rounded" : ""
                        }`}
                      >
                        {d ? (
                          <span
                            className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium"
                            style={{ backgroundColor: d.teamColor + "30", color: d.teamColor }}
                          >
                            {d.name.split(" ").pop().slice(0, 3).toUpperCase()}
                          </span>
                        ) : pick.isCurrent ? (
                          <span className="text-red-400 animate-pulse">···</span>
                        ) : (
                          <span className="text-gray-700">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}

      {/* Driver selection grid - only show when it's my turn */}
      {isMyTurn && (
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select a Driver</h3>
          <div className="space-y-3">
            {teamGroups.map(({ team, drivers, color }) => {
              const available = drivers.filter(d => !pickedDriverIds.has(d.id));
              if (available.length === 0) return null;
              return (
                <div key={team}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-3 h-1 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{team}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {drivers.map(driver => {
                      const picked = pickedDriverIds.has(driver.id);
                      return (
                        <button
                          key={driver.id}
                          onClick={() => !picked && !loading && handlePick(driver.id)}
                          disabled={picked || loading}
                          className={`text-left p-3 rounded-xl border transition-all ${
                            picked
                              ? "bg-white/[0.02] border-white/[0.04] opacity-30 cursor-not-allowed line-through"
                              : "bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.08] hover:border-white/15 active:scale-95"
                          }`}
                        >
                          <span className="text-gray-500 text-xs font-mono">#{driver.number}</span>
                          <p className="font-semibold text-sm mt-0.5 leading-tight">{driver.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* My roster so far */}
      {!isMyTurn && (() => {
        const myPicks = [];
        for (let i = 0; i < draft.picks.length; i++) {
          if (draft.order[i] === playerName) {
            myPicks.push(draft.picks[i]);
          }
        }
        if (myPicks.length === 0) return null;
        return (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Picks</h3>
            <div className="flex flex-wrap gap-2">
              {myPicks.map(id => {
                const d = DRIVER_BY_ID[id];
                if (!d) return null;
                return (
                  <span
                    key={id}
                    className="inline-flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.teamColor }} />
                    {d.name.split(" ").pop()}
                  </span>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
