import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");
const DATA_FILE = join(DATA_DIR, "state.json");

const DEFAULT_STATE = {
  players: {},
  results: {},
  locked: false,
  raceName: "Australian Grand Prix 2026",
};

let cache = null;

export function getState() {
  if (cache) return cache;
  try {
    if (existsSync(DATA_FILE)) {
      cache = JSON.parse(readFileSync(DATA_FILE, "utf-8"));
      return cache;
    }
  } catch {}
  cache = { ...DEFAULT_STATE };
  saveState(cache);
  return cache;
}

export function saveState(state) {
  cache = state;
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  } catch {}
}
