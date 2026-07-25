export function getLunarCityHref(stateName: string, cityName: string) {
  return `/cities/${encodeURIComponent(cityName)}?state=${encodeURIComponent(
    stateName
  )}`;
}

export function getLunarTownHref(stateName: string, townName: string) {
  return `/towns/${encodeURIComponent(townName)}?state=${encodeURIComponent(
    stateName
  )}`;
}
