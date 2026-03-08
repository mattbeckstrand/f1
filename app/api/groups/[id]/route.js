import { getGroup } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = await params;
  const group = await getGroup(id);

  if (!group) {
    return Response.json({ error: "Group not found" }, { status: 404 });
  }

  return Response.json(group);
}
