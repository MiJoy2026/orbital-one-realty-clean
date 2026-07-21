import { lunarStateDetails } from "@/lib/lunar-state-details";

export type PropertyStatus = "Available" | "Sold";
export type PropertyType = "Rural Acre" | "Town Block" | "City Block";

export const lunarStateNames = Object.keys(lunarStateDetails);

export const lunarStates = lunarStateNames.map((name, index) => {
  const details = lunarStateDetails[name];

  return {
    id: index + 1,
    name,

    cities: details.cities.map((city) => city.name),
    towns: details.towns.map((town) => town.name),
  };
});