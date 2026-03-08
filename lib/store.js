import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.Database_KV_REST_API_URL,
  token: process.env.Database_KV_REST_API_TOKEN,
});

// Group metadata
export async function getGroup(id) {
  return redis.get(`group:${id}`);
}
export async function saveGroup(id, data) {
  await redis.set(`group:${id}`, data);
}

// Join code reverse lookup
export async function getGroupIdByCode(code) {
  return redis.get(`group_code:${code}`);
}
export async function saveGroupCode(code, groupId) {
  await redis.set(`group_code:${code}`, groupId);
}

// Draft state
export async function getDraft(groupId) {
  return redis.get(`group:${groupId}:draft`);
}
export async function saveDraft(groupId, data) {
  await redis.set(`group:${groupId}:draft`, data);
}

// Rosters (final picks after draft)
export async function getRosters(groupId) {
  return redis.get(`group:${groupId}:rosters`);
}
export async function saveRosters(groupId, data) {
  await redis.set(`group:${groupId}:rosters`, data);
}

// Scores & standings
export async function getScores(groupId) {
  return redis.get(`group:${groupId}:scores`);
}
export async function saveScores(groupId, data) {
  await redis.set(`group:${groupId}:scores`, data);
}

// Cached race results (shared across groups)
export async function getRaceCache(year, round) {
  return redis.get(`race:${year}:${round}`);
}
export async function saveRaceCache(year, round, data) {
  await redis.set(`race:${year}:${round}`, data);
}
