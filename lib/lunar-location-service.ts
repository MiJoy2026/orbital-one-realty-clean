import { getLunarStateCenter } from "./lunar-map-regions";
import { lunarStates } from "./moon-data";

export function getAllCities() {
  return lunarStates.flatMap((state) =>
    state.cities.map((city) => ({
      name: city,
      state: state.name,
    }))
  );
}

export function getAllTowns() {
  return lunarStates.flatMap((state) =>
    state.towns.map((town) => ({
      name: town,
      state: state.name,
    }))
  );
}

export function getCitiesByState(stateName: string) {
  const state = lunarStates.find(
    (item) => item.name.toLowerCase() === stateName.toLowerCase()
  );

  return state?.cities ?? [];
}

export function getTownsByState(stateName: string) {
  const state = lunarStates.find(
    (item) => item.name.toLowerCase() === stateName.toLowerCase()
  );

  return state?.towns ?? [];
}

export function getStateForCity(cityName: string) {
  return lunarStates.find((state) =>
    state.cities.some(
      (city) => city.toLowerCase() === cityName.toLowerCase()
    )
  );
}

export function getStateForTown(townName: string) {
  return lunarStates.find((state) =>
    state.towns.some(
      (town) => town.toLowerCase() === townName.toLowerCase()
    )
  );
}
export function getLocationCoordinates(
  stateName: string,
  locationName: string,
  type: "city" | "town"
) {
  const center = getLunarStateCenter(stateName);

  let hash = 0;

  const hashSource =
    `${stateName}:${type}:${locationName}`;

  for (const character of hashSource) {
    hash =
      (hash * 37 + character.charCodeAt(0)) %
      100000;
  }

  const angle =
    (hash % 360) * (Math.PI / 180);

  const radius =
    type === "city"
      ? 18 + (hash % 24)
      : 35 + (hash % 38);

  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}