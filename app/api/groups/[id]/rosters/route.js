import { getRosters } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = await params;
  const rosters = await getRosters(id);

  if (!rosters) {
    return Response.json({ error: "No rosters yet (draft not complete)" }, { status: 404 });
  }

  return Response.json(rosters);
}
