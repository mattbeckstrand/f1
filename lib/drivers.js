export const DRIVERS = [
  { id: "verstappen", name: "Max Verstappen", number: 1, team: "Red Bull Racing", teamColor: "#3671C6" },
  { id: "hadjar", name: "Isack Hadjar", number: 6, team: "Red Bull Racing", teamColor: "#3671C6" },
  { id: "leclerc", name: "Charles Leclerc", number: 16, team: "Ferrari", teamColor: "#E8002D" },
  { id: "hamilton", name: "Lewis Hamilton", number: 44, team: "Ferrari", teamColor: "#E8002D" },
  { id: "norris", name: "Lando Norris", number: 4, team: "McLaren", teamColor: "#FF8000" },
  { id: "piastri", name: "Oscar Piastri", number: 81, team: "McLaren", teamColor: "#FF8000" },
  { id: "russell", name: "George Russell", number: 63, team: "Mercedes", teamColor: "#27F4D2" },
  { id: "antonelli", name: "Kimi Antonelli", number: 12, team: "Mercedes", teamColor: "#27F4D2" },
  { id: "alonso", name: "Fernando Alonso", number: 14, team: "Aston Martin", teamColor: "#229971" },
  { id: "stroll", name: "Lance Stroll", number: 18, team: "Aston Martin", teamColor: "#229971" },
  { id: "albon", name: "Alex Albon", number: 23, team: "Williams", teamColor: "#64C4FF" },
  { id: "sainz", name: "Carlos Sainz", number: 55, team: "Williams", teamColor: "#64C4FF" },
  { id: "lawson", name: "Liam Lawson", number: 30, team: "Racing Bulls", teamColor: "#6692FF" },
  { id: "lindblad", name: "Arvid Lindblad", number: 40, team: "Racing Bulls", teamColor: "#6692FF" },
  { id: "ocon", name: "Esteban Ocon", number: 31, team: "Haas", teamColor: "#B6BABD" },
  { id: "bearman", name: "Oliver Bearman", number: 87, team: "Haas", teamColor: "#B6BABD" },
  { id: "gasly", name: "Pierre Gasly", number: 10, team: "Alpine", teamColor: "#0093CC" },
  { id: "doohan", name: "Jack Doohan", number: 7, team: "Alpine", teamColor: "#0093CC" },
  { id: "hulkenberg", name: "Nico Hulkenberg", number: 27, team: "Audi", teamColor: "#00e701" },
  { id: "bortoleto", name: "Gabriel Bortoleto", number: 5, team: "Audi", teamColor: "#00e701" },
  { id: "bottas", name: "Valtteri Bottas", number: 77, team: "Cadillac", teamColor: "#C0C0C0" },
  { id: "perez", name: "Sergio Perez", number: 11, team: "Cadillac", teamColor: "#C0C0C0" },
];

export const TEAMS = [...new Set(DRIVERS.map(d => d.team))];

export function getDriver(id) {
  return DRIVERS.find(d => d.id === id);
}
