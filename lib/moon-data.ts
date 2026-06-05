export type PropertyStatus = "Available" | "Sold";
export type PropertyType = "Rural Acre" | "Town Block" | "City Block";

export type LunarProperty = {
  id: string;
  state: string;
  city?: string;
  town?: string;
  type: PropertyType;
  size: string;
  price: number;
  status: PropertyStatus;
  nearbyAttractions: string[];
};

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

export const lunarStates = lunarStateNames.map((name, index) => ({
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
}));

export const sampleProperties: LunarProperty[] = [
  {
    id: "R-001",
    state: "Hammel",
    type: "Rural Acre",
    size: "1 Acre",
    price: 24.95,
    status: "Available",
    nearbyAttractions: ["Apollo 11 Landing Site", "Sea of Tranquility"],
  },
  {
    id: "R-002",
    state: "Hammel",
    type: "Rural Acre",
    size: "1/2 Acre",
    price: 16.95,
    status: "Available",
    nearbyAttractions: ["Famous Lunar Craters", "Historic Moon Plains"],
  },
  {
    id: "R-003",
    state: "Clavius",
    type: "Rural Acre",
    size: "1 Acre",
    price: 24.95,
    status: "Sold",
    nearbyAttractions: ["Tycho Crater", "Southern Highlands"],
  },
  {
    id: "T-001",
    state: "Schiller",
    town: "Schiller Town 1",
    type: "Town Block",
    size: "Town Block",
    price: 39.95,
    status: "Available",
    nearbyAttractions: ["Copernicus Crater", "Lunar Ridge Trail"],
  },
  {
    id: "T-002",
    state: "Schiller",
    town: "Schiller Town 2",
    type: "Town Block",
    size: "Town Block",
    price: 39.95,
    status: "Sold",
    nearbyAttractions: ["Mare Imbrium", "Lunar Overlook"],
  },
  {
    id: "C-001",
    state: "Rhetta",
    city: "Rhetta City One",
    type: "City Block",
    size: "City Block",
    price: 54.95,
    status: "Available",
    nearbyAttractions: ["Aristarchus Plateau", "Bright Crater Field"],
  },
  {
    id: "C-002",
    state: "Rhetta",
    city: "Rhetta City Two",
    type: "City Block",
    size: "City Block",
    price: 54.95,
    status: "Sold",
    nearbyAttractions: ["Lunar North Vista", "Highland Ridge"],
  },
];