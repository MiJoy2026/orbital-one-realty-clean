import { lunarStateDetails } from "@/lib/lunar-state-details";
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

export const lunarStates = lunarStateNames.map((name, index) => {
  const details = lunarStateDetails[name];

  const finalizedCities = details?.cities?.map((city) => city.name);
  const finalizedTowns = details?.towns?.map((town) => town.name);

  return {
    id: index + 1,
    name,

    cities:
      finalizedCities && finalizedCities.length === 3
        ? finalizedCities
        : [
            `${name} City One`,
            `${name} City Two`,
            `${name} City Three`,
          ],

    towns:
      finalizedTowns && finalizedTowns.length === 20
        ? finalizedTowns
        : Array.from(
            { length: 20 },
            (_, townIndex) => `${name} Town ${townIndex + 1}`
          ),
  };
});

  export const stateCenters: Record<string, { x: number; y: number }> = {
  Hammel: {
    x: 500,
    y: 500,
  },
};