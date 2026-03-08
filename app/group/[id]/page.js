"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useGroup } from "./layout";
import { DRIVER_BY_ID } from "@/lib/drivers";

export default function GroupDashboard() {
  const router = useRouter();
  const ctx = useGroup();
  const [rosters, setRosters] = useState(null);
  const [scores, setScores] = useState(null);

  const group = ctx?.group;
  const session = ctx?.session;
  const groupId = ctx?.groupId;

  useEffect(() => {
    if (!groupId) return;
    if (group?.draftStatus === "complete") {
      fetch(`/api/groups/${groupId}/rosters`).then(r => r.ok ? r.json() : null).then(setRosters);
      fetch(`/api/groups/${groupId}/scores`).then(r => r.ok ? r.json() : null).then(setScores);
    }
  }, [groupId, group?.draftStatus]);

  if (!group) return null;

  const isCreator = session?.playerName === group.creator;

  // Pre-draft: lobby
  if (group.draftStatus === "waiting") {
    return (
      <div className="space-y-6">
        {/* Join code */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-6 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Share this code to invite players</p>
          <p className="text-4xl font-mono font-black tracking-[0.3em] text-white">{group.code}</p>
        </div>

        {/* Members */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
            Players ({group.members.length})
          </h2>
          <div className="space-y-2">
            {group.members.map(name => (
              <div
                key={name}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between"
              >
                <span className="font-semibold">{name}</span>
                {name === group.creator && (
                  <span className="text-xs text-red-400 font-medium">Creator</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Draft info */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-center text-sm text-gray-400">
          {group.members.length >= 2 ? (
            <p>
              <span className="text-white font-semibold">{Math.floor(22 / group.members.length)}</span> picks per player
              {" · "}<span className="text-white font-semibold">{group.members.length}</span> players
              {" · "}<span className="text-white font-semibold">{Math.floor(22 / group.members.length) * group.members.length}</span> drivers drafted
            </p>
          ) : (
            <p>Waiting for more players to join...</p>
          )}
        </div>

        {/* Start draft button */}
        {isCreator && group.members.length >= 2 && (
          <button
            onClick={() => router.push(`/group/${groupId}/draft`)}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-5 rounded-xl text-center text-xl transition-all shadow-lg shadow-red-500/20"
          >
            Start the Draft
          </button>
        )}

        {!isCreator && (
          <div className="text-center py-4 text-gray-400">
            Waiting for {group.creator} to start the draft...
          </div>
        )}
      </div>
    );
  }

  // Drafting: redirect to draft room
  if (group.draftStatus === "drafting") {
    return (
      <div className="space-y-6 text-center">
        <div className="py-8">
          <h2 className="text-2xl font-black">Draft in Progress</h2>
          <p className="text-gray-400 mt-2">The draft is live right now!</p>
          <button
            onClick={() => router.push(`/group/${groupId}/draft`)}
            className="mt-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg shadow-red-500/20"
          >
            Go to Draft Room
          </button>
        </div>
      </div>
    );
  }

  // Post-draft: standings overview
  const standings = scores?.standings || {};
  const sorted = Object.entries(standings).sort(([, a], [, b]) => b - a);
  const racesScored = scores ? Object.keys(scores.races).length : 0;

  return (
    <div className="space-y-6">
      {/* Season standings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            Season Standings
          </h2>
          <span className="text-xs text-gray-500">
            {racesScored} race{racesScored !== 1 ? "s" : ""} scored
          </span>
        </div>

        {sorted.length > 0 ? (
          <div className="space-y-2">
            {sorted.map(([name, total], i) => (
              <div
                key={name}
                className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between"
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
                  <div>
                    <p className="font-semibold">{name}</p>
                    {rosters?.[name] && (
                      <p className="text-xs text-gray-500">
                        {rosters[name].map(id => DRIVER_BY_ID[id]?.name.split(" ").pop()).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-2xl font-black tabular-nums">
                  {total}<span className="text-xs text-gray-500 ml-1 font-medium">pts</span>
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            No races scored yet. Go to Admin to fetch results.
          </div>
        )}
      </div>

      {/* Rosters */}
      {rosters && (
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Rosters</h2>
          <div className="space-y-3">
            {Object.entries(rosters).map(([name, drivers]) => (
              <div key={name} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                <p className="font-semibold mb-2">{name}</p>
                <div className="flex flex-wrap gap-2">
                  {drivers.map(id => {
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
