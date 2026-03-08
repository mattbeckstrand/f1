"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, setSession } from "@/lib/session";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState(null); // null | "create" | "join"
  const [groupName, setGroupName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [session, setSessionState] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (s) setSessionState(s);
  }, []);

  async function handleCreate() {
    if (!groupName.trim() || !playerName.trim()) {
      setError("Fill in all fields");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupName: groupName.trim(), playerName: playerName.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    const { id } = await res.json();
    setSession(id, playerName.trim(), true);
    router.push(`/group/${id}`);
  }

  async function handleJoin() {
    if (!joinCode.trim() || !playerName.trim()) {
      setError("Fill in all fields");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/groups/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: joinCode.trim().toUpperCase(), playerName: playerName.trim() }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    const { id } = await res.json();
    setSession(id, playerName.trim(), false);
    router.push(`/group/${id}`);
  }

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
        <p className="text-gray-400 mt-2 text-lg">Draft League 2026</p>
      </div>

      {/* Return to group */}
      {session && (
        <button
          onClick={() => router.push(`/group/${session.groupId}`)}
          className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-left hover:bg-white/[0.06] transition-colors"
        >
          <p className="text-xs text-gray-500 uppercase tracking-wider">Return to your group</p>
          <p className="text-white font-semibold mt-1">
            Playing as <span className="text-red-400">{session.playerName}</span>
          </p>
        </button>
      )}

      {/* Mode selection */}
      {!mode && (
        <div className="space-y-3">
          <button
            onClick={() => setMode("create")}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-5 rounded-xl text-center text-xl transition-all shadow-lg shadow-red-500/20"
          >
            Create a League
          </button>
          <button
            onClick={() => setMode("join")}
            className="w-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-5 rounded-xl text-center text-xl transition-all"
          >
            Join a League
          </button>
        </div>
      )}

      {/* Create form */}
      {mode === "create" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Create a League</h2>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">League Name</label>
            <input
              type="text"
              value={groupName}
              onChange={e => { setGroupName(e.target.value); setError(""); }}
              placeholder="e.g. Beckstrand F1"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={e => { setPlayerName(e.target.value); setError(""); }}
              placeholder="Enter your name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create League"}
          </button>
          <button onClick={() => { setMode(null); setError(""); }} className="w-full text-center text-sm text-gray-500 hover:text-white transition-colors">
            ← Back
          </button>
        </div>
      )}

      {/* Join form */}
      {mode === "join" && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold">Join a League</h2>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Join Code</label>
            <input
              type="text"
              value={joinCode}
              onChange={e => { setJoinCode(e.target.value.toUpperCase()); setError(""); }}
              placeholder="Enter 6-letter code..."
              maxLength={6}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 uppercase tracking-[0.3em] text-center text-2xl font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">Your Name</label>
            <input
              type="text"
              value={playerName}
              onChange={e => { setPlayerName(e.target.value); setError(""); }}
              placeholder="Enter your name..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-4 rounded-xl text-lg transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
          >
            {loading ? "Joining..." : "Join League"}
          </button>
          <button onClick={() => { setMode(null); setError(""); }} className="w-full text-center text-sm text-gray-500 hover:text-white transition-colors">
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}
