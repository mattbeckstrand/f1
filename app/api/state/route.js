import { NextResponse } from "next/server";
import { getState, saveState } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getState());
}

export async function POST(request) {
  const body = await request.json();
  const state = getState();

  switch (body.action) {
    case "addPlayer": {
      if (state.locked) {
        return NextResponse.json({ error: "Picks are locked" }, { status: 400 });
      }
      if (!body.name || !body.picks || body.picks.length !== 5) {
        return NextResponse.json({ error: "Need a name and 5 picks" }, { status: 400 });
      }
      state.players[body.name.trim()] = body.picks;
      saveState(state);
      return NextResponse.json({ ok: true });
    }

    case "removePlayer": {
      delete state.players[body.name];
      saveState(state);
      return NextResponse.json({ ok: true });
    }

    case "setResults": {
      state.results = body.results || {};
      saveState(state);
      return NextResponse.json({ ok: true });
    }

    case "toggleLock": {
      state.locked = !state.locked;
      saveState(state);
      return NextResponse.json({ ok: true, locked: state.locked });
    }

    case "setRaceName": {
      state.raceName = body.raceName || "";
      saveState(state);
      return NextResponse.json({ ok: true });
    }

    case "reset": {
      const fresh = { players: {}, results: {}, locked: false, raceName: state.raceName };
      saveState(fresh);
      return NextResponse.json({ ok: true });
    }

    default:
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
}
