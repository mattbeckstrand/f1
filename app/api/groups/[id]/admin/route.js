import { getGroup, saveGroup, getRosters, getScores, saveScores, getRaceCache, saveRaceCache } from "@/lib/store";
import { fetchRaceResults } from "@/lib/f1api";
import { scoreAllRosters } from "@/lib/scoring";

export async function POST(req, { params }) {
  const { id } = await params;
  const body = await req.json();
  const group = await getGroup(id);

  if (!group) return Response.json({ error: "Group not found" }, { status: 404 });
  if (group.creator !== body.playerName) {
    return Response.json({ error: "Only the group creator can perform admin actions" }, { status: 403 });
  }

  if (body.action === "fetchResults") {
    return fetchAndScore(id, body.year || 2026, body.round);
  }

  if (body.action === "removeMember") {
    return removeMember(id, group, body.memberName);
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

async function fetchAndScore(groupId, year, round) {
  if (!round) return Response.json({ error: "Round number is required" }, { status: 400 });

  // Check cache first
  let raceData = await getRaceCache(year, round);

  if (!raceData) {
    try {
      raceData = await fetchRaceResults(year, round);
      await saveRaceCache(year, round, raceData);
    } catch (e) {
      return Response.json({ error: e.message }, { status: 502 });
    }
  }

  // Score each player's roster
  const rosters = await getRosters(groupId);
  if (!rosters) return Response.json({ error: "No rosters - draft not complete" }, { status: 400 });

  const raceScores = scoreAllRosters(rosters, raceData.results);

  // Update cumulative standings
  const allScores = await getScores(groupId) || { races: {}, standings: {} };

  allScores.races[round] = {
    raceName: raceData.raceName,
    date: raceData.date,
    scores: raceScores,
  };

  // Recalculate cumulative standings
  const standings = {};
  for (const [player] of Object.entries(rosters)) {
    standings[player] = 0;
  }
  for (const race of Object.values(allScores.races)) {
    for (const [player, score] of Object.entries(race.scores)) {
      standings[player] = (standings[player] || 0) + score.total;
    }
  }
  allScores.standings = standings;

  await saveScores(groupId, allScores);

  return Response.json({ raceScores, standings, raceName: raceData.raceName });
}

async function removeMember(groupId, group, memberName) {
  if (!memberName) return Response.json({ error: "Member name required" }, { status: 400 });
  if (memberName === group.creator) return Response.json({ error: "Cannot remove the group creator" }, { status: 400 });
  if (group.draftStatus !== "waiting") return Response.json({ error: "Cannot remove members after draft starts" }, { status: 400 });

  group.members = group.members.filter(m => m !== memberName);
  await saveGroup(groupId, group);

  return Response.json({ members: group.members });
}
