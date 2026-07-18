import { lunarStateDetails } from "@/lib/lunar-state-details";

export type LunarAtlasState = {
  name: string;
  theme: string;
  motto: string;
  description: string;
  capital: string;
  cities: string[];
  towns: string[];
};

export const lunarAtlasStates: LunarAtlasState[] = Object.entries(
  lunarStateDetails
).map(([name, details]) => {
  const cities = details.cities.map((city) => city.name);
  const towns = details.towns.map((town) => town.name);

  return {
    name,
    theme: details.nickname,
    motto: details.highlights[0] ?? details.nickname,
    description: details.description,
    capital: cities[0] ?? `${name} City`,
    cities,
    towns,
  };
});