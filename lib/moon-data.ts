export type PropertyStatus = "Available" | "Sold";
export type PropertyType = "Rural Acre" | "Town Block" | "City Block";

const lunarStateNames = [
  "Hammel",
  "Clavius",
  "Schiller",
  "Rhetta",
  "Maurolycus",
  "Tycho",
  "Wilhelm",
  "Schickard",
  "Petavius",
  "Fracastorius",
  "Rupes Altai",
  "Mare Undarum",
  "Grimaldi",
  "Letronne",
  "Montes Riphaeus",
  "Ptolemaeus",
  "Theophilus",
  "Colombo",
  "Langrenus",
  "Byrgius",
  "Mare Humorum",
  "Pitatus",
  "Purbach",
  "Bessel",
  "Menalaus",
  "Dionysius",
  "Mar Serenitatis",
  "Macrobius",
  "Cleomedes",
  "Hevelius",
  "Kepler",
  "Copernicus",
  "Mare Vaporum",
  "Julius Caesar",
  "Taruntius",
  "J. Herschel",
  "Plato",
  "Aristoteles",
  "Rumker",
  "Sinus Iridum",
  "Cassini",
  "Eudoxus",
  "Geminus",
  "Seleucus",
  "Aristarchus",
  "Timocharis",
  "Montes Apenninus",
  "Reinhold",
  "Eddington",
  "Delisic",
  "Heis",
  "Harding",
  "Markov",
  "Timaeus",
  "Archytas",
  "Protagoras",
  "Le Monnier",
];

const hammelCities = [
  "Gateway City",
  "Highland City",
  "Pioneer City",
];

const hammelTowns = [
  "Founders Point",
  "Horizon",
  "Moonrise",
  "Starlight",
  "Explorer",
  "Discovery",
  "Unity",
  "Frontier",
  "Lunar Harbor",
  "Orbiter",
  "Highland View",
  "Gateway Ridge",
  "First Light",
  "Celestial",
  "Nova",
  "Tranquil Crossing",
  "Pioneer Hills",
  "Crater View",
  "Earthrise",
  "Charter Township",
];

export const stateCenters: Record<string, { x: number; y: number }> = {
  Hammel: {
    x: 500,
    y: 500,
  },
};

export const lunarStates = lunarStateNames.map((name, index) => {
  if (name === "Hammel") {
    return {
      id: index + 1,
      name,
      cities: hammelCities,
      towns: hammelTowns,
    };
  }

  return {
    id: index + 1,
    name,
    cities: [
      `${name} City One`,
      `${name} City Two`,
      `${name} City Three`,
    ],
    towns: Array.from(
      { length: 20 },
      (_, townIndex) => `${name} Town ${townIndex + 1}`
    ),
  };
});