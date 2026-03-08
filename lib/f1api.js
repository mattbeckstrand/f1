import { API_ID_MAP } from "./drivers";

const BASE_URL = "https://api.jolpi.ca/ergast/f1";

// Fetch race results from Jolpica API
export async function fetchRaceResults(year, round) {
  const url = `${BASE_URL}/${year}/${round}/results.json`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Jolpica API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  const race = data.MRData?.RaceTable?.Races?.[0];

  if (!race) {
    throw new Error(`No results found for ${year} round ${round}`);
  }

  const results = {};

  for (const r of race.Results) {
    const apiId = r.Driver.driverId;
    const localId = API_ID_MAP[apiId] || apiId;

    const isFinished = r.status === "Finished" || r.status.startsWith("+");
    const isDNF = !isFinished && r.positionText !== "";

    results[localId] = {
      position: parseInt(r.position, 10),
      grid: parseInt(r.grid, 10),
      status: isDNF ? "DNF" : "Finished",
      fastestLapRank: r.FastestLap ? parseInt(r.FastestLap.rank, 10) : null,
    };
  }

  return {
    raceName: race.raceName,
    round: parseInt(race.round, 10),
    date: race.date,
    results,
  };
}
