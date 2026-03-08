"use client";

import { useState, useEffect } from "react";
import { useGroup } from "../layout";

export default function AdminPage() {
  const ctx = useGroup();
  const [round, setRound] = useState("");
  const [year] = useState(2026);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState(null);

  const group = ctx?.group;
  const session = ctx?.session;
  const groupId = ctx?.groupId;
  const isCreator = session?.playerName === group?.creator;

  useEffect(() => {
    if (!groupId) return;
    fetch(`/api/groups/${groupId}/scores`).then(r => r.json()).then(setScores);
  }, [groupId]);

  if (!group) return null;

  if (!isCreator) {
    return (
      <div className="text-center py-12 text-gray-500">
        Only the group creator ({group.creator}) can access admin controls.
      </div>
    );
  }

  if (group.draftStatus !== "complete") {
    return (
      <div className="text-center py-12 text-gray-500">
        Complete the draft before managing results.
      </div>
    );
  }

  async function handleFetchResults() {
    if (!round) { setError("Select a round"); return; }
    setLoading(true);
    setError("");
    setResult(null);

    const res = await fetch(`/api/groups/${groupId}/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "fetchResults",
        playerName: session.playerName,
        year,
        round: parseInt(round, 10),
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to fetch results");
      return;
    }

    setResult(data);
    // Refresh scores
    fetch(`/api/groups/${groupId}/scores`).then(r => r.json()).then(setScores);
  }

  async function handleRemoveMember(memberName) {
    if (!confirm(`Remove ${memberName} from the group?`)) return;

    const res = await fetch(`/api/groups/${groupId}/admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "removeMember",
        playerName: session.playerName,
        memberName,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to remove member");
    }
  }

  const scoredRaces = scores?.races ? Object.entries(scores.races).sort(([a], [b]) => Number(a) - Number(b)) : [];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Admin Panel</h2>

      {/* Fetch results */}
      <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Fetch Race Results</h3>
        <div className="flex gap-3">
          <select
            value={round}
            onChange={e => { setRound(e.target.value); setError(""); setResult(null); }}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500/50 appearance-none"
          >
            <option value="">Select round...</option>
            {Array.from({ length: 24 }, (_, i) => i + 1).map(r => (
              <option key={r} value={r}>Round {r}</option>
            ))}
          </select>
          <button
            onClick={handleFetchResults}
            disabled={loading || !round}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading ? "Fetching..." : "Fetch & Score"}
          </button>
        </div>

        {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

        {result && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
            <p className="text-emerald-400 font-semibold">{result.raceName} scored!</p>
            <div className="mt-2 space-y-1">
              {Object.entries(result.standings)
                .sort(([, a], [, b]) => b - a)
                .map(([player, total]) => (
                  <div key={player} className="flex justify-between text-sm">
                    <span className="text-gray-300">{player}</span>
                    <span className="font-semibold tabular-nums">{total} pts</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Scored races */}
      {scoredRaces.length > 0 && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Scored Races</h3>
          {scoredRaces.map(([rnd, race]) => (
            <div key={rnd} className="flex justify-between text-sm">
              <span className="text-gray-400">R{rnd} · {race.raceName}</span>
              <span className="text-gray-500">{race.date}</span>
            </div>
          ))}
        </div>
      )}

      {/* Members */}
      {group.draftStatus === "waiting" && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Members</h3>
          {group.members.map(name => (
            <div key={name} className="flex justify-between items-center text-sm">
              <span className="text-gray-300">
                {name} {name === group.creator && <span className="text-red-400">(Creator)</span>}
              </span>
              {name !== group.creator && (
                <button
                  onClick={() => handleRemoveMember(name)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
