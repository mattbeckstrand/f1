import { nanoid, customAlphabet } from "nanoid";
import { saveGroup, saveGroupCode } from "@/lib/store";

const generateCode = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6);

export async function POST(req) {
  const { groupName, playerName } = await req.json();

  if (!groupName?.trim() || !playerName?.trim()) {
    return Response.json({ error: "Group name and your name are required" }, { status: 400 });
  }

  const id = nanoid(12);
  const code = generateCode();

  const group = {
    id,
    name: groupName.trim(),
    code,
    creator: playerName.trim(),
    members: [playerName.trim()],
    draftStatus: "waiting", // waiting | drafting | complete
    createdAt: Date.now(),
  };

  await saveGroup(id, group);
  await saveGroupCode(code, id);

  return Response.json({ id, code });
}
