import { lunarAttractions } from "@/lib/lunar-attractions";
import { lunarStates } from "@/lib/moon-data";
import { getLunarStateCenter } from "@/lib/lunar-map-regions";
import { lunarStateDetails } from "@/lib/lunar-state-details";
import { getLocationCoordinates } from "@/lib/lunar-location-service";


export type AtlasSearchResultType =
  | "Attraction"
  | "State"
  | "City"
  | "Town"
  | "Parcel";

export type AtlasSearchResult = {
  id: string;
  name: string;
  subtitle: string;
  type: AtlasSearchResultType;
  x: number;
  y: number;
  zoom: number;
  searchTerms?: string[];
};

const attractionSearchResults: AtlasSearchResult[] = lunarAttractions.map(
  (attraction) => ({
    id: attraction.id,
    name: attraction.name,
    subtitle: `${attraction.type} • ${attraction.state}`,
    type: "Attraction",
    x: attraction.x,
    y: attraction.y,
    zoom: Math.max(attraction.minZoom ?? 3, 3),
  })
);

const stateSearchResults: AtlasSearchResult[] = lunarStates.map((state) => {
  const details = lunarStateDetails[state.name];

  const aliases = details?.searchAliases ?? [];

  return {
    id: state.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: state.name,
    subtitle: details?.nickname
      ? `Lunar State • ${details.nickname}`
      : "Orbital One Lunar State",
    type: "State",
    x: getLunarStateCenter(state.name).x,
    y: getLunarStateCenter(state.name).y,
    zoom: 3,
    searchTerms: aliases,
  };
});

const citySearchResults: AtlasSearchResult[] = lunarStates.flatMap((state) =>
  state.cities.map((city) => {
    const coordinates = getLocationCoordinates(state.name, city, "city");

    return {
      id: `${state.name}-${city}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
      name: city,
      subtitle: `Lunar City • ${state.name}`,
      type: "City",
      x: coordinates.x,
      y: coordinates.y,
      zoom: 3,
      searchTerms: [state.name],
    };
  })
);

const townSearchResults: AtlasSearchResult[] = lunarStates.flatMap((state) =>
  state.towns.map((town) => {
    const coordinates = getLocationCoordinates(state.name, town, "town");

    return {
      id: `${state.name}-${town}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-"),
      name: town,
      subtitle: `Lunar Town • ${state.name}`,
      type: "Town",
      x: coordinates.x,
      y: coordinates.y,
      zoom: 5,
      searchTerms: [state.name],
    };
  })
);

function createStateSlug(stateName: string): string {
  return stateName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createExactParcelSearchResult(
  query: string
): AtlasSearchResult | null {
  const normalizedPropertyKey = query.trim().toUpperCase();
  const cityBlockMatch = normalizedPropertyKey.match(
    /^(.*)-CITY-(\d{2})-CB-C\d{3}-R\d{3}$/
  );

  if (cityBlockMatch) {
    const state = lunarStates.find(
      (candidate) => createStateSlug(candidate.name) === cityBlockMatch[1]
    );
    const cityNumber = Number(cityBlockMatch[2]);
    const cityName = state?.cities[cityNumber - 1];

    if (!state || !cityName) {
      return null;
    }

    const stateCenter = getLunarStateCenter(state.name);

    return {
      id: normalizedPropertyKey,
      name: normalizedPropertyKey,
      subtitle: `City Block • ${state.name}`,
      type: "Parcel",
      x: stateCenter.x,
      y: stateCenter.y,
      zoom: 7,
      searchTerms: [state.name, cityName, "city block", "block"],
    };
  }

  if (!/^[A-Z0-9-]+-R-C\d{3}-R\d{3}$/.test(normalizedPropertyKey)) {
    return null;
  }

  const state = lunarStates.find((candidate) =>
    normalizedPropertyKey.startsWith(
      `${createStateSlug(candidate.name)}-R-C`
    )
  );

  if (!state) {
    return null;
  }

  const stateCenter = getLunarStateCenter(state.name);

  return {
    id: normalizedPropertyKey,
    name: normalizedPropertyKey,
    subtitle: `Rural Acre • ${state.name}`,
    type: "Parcel",
    x: stateCenter.x,
    y: stateCenter.y,
    zoom: 7,
    searchTerms: [state.name, "rural acre", "parcel"],
  };
}

export const atlasSearchIndex: AtlasSearchResult[] = [
  ...attractionSearchResults,
  ...stateSearchResults,
  ...citySearchResults,
  ...townSearchResults,
];

export function searchAtlas(
  query: string,
  limit = 8
): AtlasSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const exactParcelResult = createExactParcelSearchResult(query);
  const searchIndex = exactParcelResult
    ? [exactParcelResult, ...atlasSearchIndex]
    : atlasSearchIndex;

  return searchIndex
    .map((result) => {
      const normalizedName = result.name.toLowerCase();
      const normalizedSubtitle = result.subtitle.toLowerCase();
      const normalizedId = result.id.toLowerCase();
      const normalizedSearchTerms = (result.searchTerms ?? []).map((term) =>
        term.toLowerCase()
      );

      let score = 0;

      if (normalizedName === normalizedQuery) {
        score += 100;
      } else if (normalizedName.startsWith(normalizedQuery)) {
        score += 75;
      } else if (normalizedName.includes(normalizedQuery)) {
        score += 50;
      }

      if (normalizedId === normalizedQuery) {
        score += 90;
      } else if (normalizedId.startsWith(normalizedQuery)) {
        score += 60;
      } else if (normalizedId.includes(normalizedQuery)) {
        score += 30;
      }

      if (normalizedSubtitle.includes(normalizedQuery)) {
        score += 20;
      }

      if (
          normalizedSearchTerms.some((term) =>
          term.includes(normalizedQuery)
          )
        ) {
          score += 40;
        }
      return {
        result,
        score,
      };
    })
    .filter((entry) => entry.score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, limit)
    .map((entry) => entry.result);
}