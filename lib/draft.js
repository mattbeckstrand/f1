// Fisher-Yates shuffle
export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Generate snake draft order
// e.g. 3 players, 2 rounds: [0,1,2, 2,1,0]
export function generateSnakeOrder(players, rounds) {
  const order = [];
  for (let round = 0; round < rounds; round++) {
    const roundOrder = round % 2 === 0
      ? [...players]
      : [...players].reverse();
    order.push(...roundOrder);
  }
  return order;
}

// Calculate number of draft rounds based on group size
export function calculateRounds(numPlayers) {
  return Math.floor(22 / numPlayers);
}

// Get who picks at a given index
export function getCurrentPicker(order, currentPickIndex) {
  if (currentPickIndex >= order.length) return null;
  return order[currentPickIndex];
}

// Check if draft is complete
export function isDraftComplete(order, currentPickIndex) {
  return currentPickIndex >= order.length;
}

// Get picks organized by round for display
export function getDraftBoard(picks, order, numPlayers) {
  const rounds = Math.ceil(order.length / numPlayers);
  const board = [];
  for (let r = 0; r < rounds; r++) {
    const roundPicks = [];
    for (let p = 0; p < numPlayers; p++) {
      const idx = r * numPlayers + p;
      roundPicks.push({
        player: order[idx],
        driverId: picks[idx] || null,
      });
    }
    board.push(roundPicks);
  }
  return board;
}
