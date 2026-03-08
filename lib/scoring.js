export const POINTS = {
  1: 25, 2: 18, 3: 15, 4: 12, 5: 10,
  6: 8, 7: 6, 8: 4, 9: 2, 10: 1,
};

export function calculateScore(picks, results) {
  if (!results || Object.keys(results).length === 0) return null;
  return picks.reduce((total, driverId) => {
    const position = results[driverId];
    return total + (POINTS[position] || 0);
  }, 0);
}
