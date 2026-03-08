import { getGroup, saveGroup, getDraft, saveDraft, saveRosters } from "@/lib/store";
import { shuffleArray, generateSnakeOrder, calculateRounds, isDraftComplete } from "@/lib/draft";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = await params;
  const draft = await getDraft(id);

  if (!draft) {
    return Response.json({ error: "Draft not started" }, { status: 404 });
  }

  return Response.json(draft);
}

export async function POST(req, { params }) {
  const { id } = await params;
  const body = await req.json();

  if (body.action === "start") {
    return startDraft(id, body.playerName);
  }

  if (body.action === "pick") {
    return makePick(id, body.playerName, body.driverId);
  }

  return Response.json({ error: "Unknown action" }, { status: 400 });
}

async function startDraft(groupId, playerName) {
  const group = await getGroup(groupId);
  if (!group) return Response.json({ error: "Group not found" }, { status: 404 });
  if (group.creator !== playerName) return Response.json({ error: "Only the group creator can start the draft" }, { status: 403 });
  if (group.draftStatus !== "waiting") return Response.json({ error: "Draft already started" }, { status: 400 });
  if (group.members.length < 2) return Response.json({ error: "Need at least 2 players to draft" }, { status: 400 });

  const rounds = calculateRounds(group.members.length);
  const shuffled = shuffleArray(group.members);
  const order = generateSnakeOrder(shuffled, rounds);

  const draft = {
    order,
    picks: [],
    currentPickIndex: 0,
    rounds,
    playerOrder: shuffled,
    startedAt: Date.now(),
  };

  group.draftStatus = "drafting";
  await saveGroup(groupId, group);
  await saveDraft(groupId, draft);

  return Response.json(draft);
}

async function makePick(groupId, playerName, driverId) {
  const draft = await getDraft(groupId);
  if (!draft) return Response.json({ error: "Draft not started" }, { status: 400 });

  if (isDraftComplete(draft.order, draft.currentPickIndex)) {
    return Response.json({ error: "Draft is complete" }, { status: 400 });
  }

  const currentPicker = draft.order[draft.currentPickIndex];
  if (currentPicker !== playerName) {
    return Response.json({ error: `It's ${currentPicker}'s turn to pick` }, { status: 400 });
  }

  // Check driver not already picked
  if (draft.picks.includes(driverId)) {
    return Response.json({ error: "That driver has already been picked" }, { status: 400 });
  }

  draft.picks.push(driverId);
  draft.currentPickIndex++;

  await saveDraft(groupId, draft);

  // Check if draft is now complete
  if (isDraftComplete(draft.order, draft.currentPickIndex)) {
    await finalizeDraft(groupId, draft);
  }

  return Response.json(draft);
}

async function finalizeDraft(groupId, draft) {
  // Build rosters from picks
  const rosters = {};
  for (let i = 0; i < draft.picks.length; i++) {
    const player = draft.order[i];
    if (!rosters[player]) rosters[player] = [];
    rosters[player].push(draft.picks[i]);
  }

  await saveRosters(groupId, rosters);

  const group = await getGroup(groupId);
  group.draftStatus = "complete";
  await saveGroup(groupId, group);
}
