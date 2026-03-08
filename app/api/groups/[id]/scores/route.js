import { getScores } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const { id } = await params;
  const scores = await getScores(id);

  return Response.json(scores || { races: {}, standings: {} });
}
