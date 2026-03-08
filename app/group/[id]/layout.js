"use client";

import { useState, useEffect, createContext, useContext } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { getSession } from "@/lib/session";

const GroupContext = createContext(null);
export const useGroup = () => useContext(GroupContext);

export default function GroupLayout({ children }) {
  const { id } = useParams();
  const pathname = usePathname();
  const [group, setGroup] = useState(null);
  const [session, setSessionState] = useState(null);

  useEffect(() => {
    const s = getSession();
    if (s) setSessionState(s);
  }, []);

  useEffect(() => {
    const load = () => fetch(`/api/groups/${id}`).then(r => r.ok ? r.json() : null).then(setGroup);
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [id]);

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-xl text-gray-500">Loading...</div>
      </div>
    );
  }

  const tabs = [
    { label: "Dashboard", href: `/group/${id}` },
    { label: "Standings", href: `/group/${id}/standings` },
    { label: "Admin", href: `/group/${id}/admin` },
  ];

  return (
    <GroupContext.Provider value={{ group, session, groupId: id }}>
      <div className="pt-6 pb-20">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="text-red-500 font-semibold tracking-[0.3em] text-xs uppercase hover:text-red-400">
            FANTASY F1
          </Link>
          <h1 className="text-2xl font-black mt-1">{group.name}</h1>
          {session && (
            <p className="text-gray-500 text-sm mt-1">
              Playing as <span className="text-gray-300">{session.playerName}</span>
            </p>
          )}
        </div>

        {children}

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur border-t border-white/5">
          <div className="max-w-lg mx-auto flex">
            {tabs.map(tab => {
              const active = pathname === tab.href;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                    active ? "text-red-400" : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </GroupContext.Provider>
  );
}
