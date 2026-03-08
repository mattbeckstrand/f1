import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.Database_KV_REST_API_URL,
  token: process.env.Database_KV_REST_API_TOKEN,
});

const STATE_KEY = "fantasy_f1_state";

const DEFAULT_STATE = {
  players: {},
  results: {},
  locked: false,
  raceName: "Australian Grand Prix 2026",
};

export async function getState() {
  const state = await redis.get(STATE_KEY);
  if (state) return state;
  await saveState(DEFAULT_STATE);
  return DEFAULT_STATE;
}

export async function saveState(state) {
  await redis.set(STATE_KEY, state);
}
