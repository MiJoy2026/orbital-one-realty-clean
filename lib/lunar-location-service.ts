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
  const stateCenters: Record<string, { x: number; y: number }> = {
    Clavius: { x: 420, y: 690 },
    Schiller: { x: 610, y: 410 },
    Copernicus: { x: 330, y: 275 },
    Tycho: { x: 455, y: 575 },
    Plato: { x: 470, y: 160 },
    Kepler: { x: 365, y: 330 },
    Aristarchus: { x: 250, y: 250 },
    Archimedes: { x: 520, y: 235 },
    Default: { x: 500, y: 500 },
  };

  const center = stateCenters[stateName] ?? stateCenters.Default;

  let hash = 0;

  for (const ch of locationName) {
    hash = (hash * 37 + ch.charCodeAt(0)) % 100000;
  }

  const angle = (hash % 360) * (Math.PI / 180);

  // Cities are closer to the state center than towns.
  const radius =
    type === "city"
      ? 35 + (hash % 20)
      : 70 + (hash % 35);

  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}