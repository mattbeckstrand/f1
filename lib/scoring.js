// F1 standard points
const POSITION_POINTS = {
  1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
  6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
};

const FASTEST_LAP_BONUS = 5;
const DNF_PENALTY = -10;

// Score a single driver for a race
export function scoreDriver(driverId, raceResult) {
  const result = raceResult[driverId];
  if (!result) return { total: 0, breakdown: {} };

  const breakdown = {};
  let total = 0;

  // Position points
  const posPoints = POSITION_POINTS[result.position] || 0;
  if (posPoints) {
    breakdown.position = posPoints;
    total += posPoints;
  }

  // Grid delta (+1 per position gained, -1 per position lost)
  if (result.grid && result.position && result.status !== "DNF") {
    const grid = result.grid === 0 ? 20 : result.grid; // pit lane start = 20
    const delta = grid - result.position; // positive = gained positions
    if (delta !== 0) {
      breakdown.gridDelta = delta;
      total += delta;
    }
  }

  // Fastest lap bonus
  if (result.fastestLapRank === 1) {
    breakdown.fastestLap = FASTEST_LAP_BONUS;
    total += FASTEST_LAP_BONUS;
  }

  // DNF penalty
  if (result.status === "DNF") {
    breakdown.dnf = DNF_PENALTY;
    total += DNF_PENALTY;
  }

  breakdown.total = total;
  return { total, breakdown };
}

// Score an entire roster for a race
export function scoreRoster(driverIds, raceResult) {
  const drivers = {};
  let total = 0;

  for (const id of driverIds) {
    const score = scoreDriver(id, raceResult);
    drivers[id] = score;
    total += score.total;
  }

  return { total, drivers };
}

// Score all players' rosters for a race
export function scoreAllRosters(rosters, raceResult) {
  const scores = {};
  for (const [player, driverIds] of Object.entries(rosters)) {
    scores[player] = scoreRoster(driverIds, raceResult);
  }
  return scores;
}
