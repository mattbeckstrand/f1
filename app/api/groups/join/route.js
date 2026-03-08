import { getGroupIdByCode, getGroup, saveGroup } from "@/lib/store";

export async function POST(req) {
  const { code, playerName } = await req.json();

  if (!code?.trim() || !playerName?.trim()) {
    return Response.json({ error: "Join code and your name are required" }, { status: 400 });
  }

  const groupId = await getGroupIdByCode(code.trim().toUpperCase());
  if (!groupId) {
    return Response.json({ error: "Invalid join code" }, { status: 404 });
  }

  const group = await getGroup(groupId);
  if (!group) {
    return Response.json({ error: "Group not found" }, { status: 404 });
  }

  if (group.draftStatus !== "waiting") {
    return Response.json({ error: "Draft has already started for this group" }, { status: 400 });
  }

  const name = playerName.trim();
  if (group.members.includes(name)) {
    return Response.json({ error: "That name is already taken in this group" }, { status: 400 });
  }

  if (group.members.length >= 10) {
    return Response.json({ error: "Group is full (max 10 players)" }, { status: 400 });
  }

  group.members.push(name);
  await saveGroup(groupId, group);

  return Response.json({ id: groupId, code: group.code });
}
