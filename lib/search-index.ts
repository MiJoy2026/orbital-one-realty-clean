import { lunarAttractions } from "@/lib/lunar-attractions";
import { lunarStates, stateCenters } from "@/lib/moon-data";
import { lunarStateDetails } from "@/lib/lunar-state-details";
import { getLocationCoordinates } from "@/lib/lunar-location-service";
import { getParcelGridForZoom } from "@/lib/parcel-grid";


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
    x: stateCenters[state.name]?.x ?? 500,
    y: stateCenters[state.name]?.y ?? 500,
    zoom: 1,
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

const parcelSearchResults: AtlasSearchResult[] = lunarStates.flatMap((state) =>
  getParcelGridForZoom(state.name, 7).map((parcel) => ({
    id: parcel.parcelKey,
    name: parcel.parcelKey,
    subtitle: `Rural Acre • ${state.name}`,
    type: "Parcel",
    x: parcel.centerX,
    y: parcel.centerY,
    zoom: 7,
    searchTerms: [
      state.name,
      "rural acre",
      "parcel",
    ],
  }))
);

export const atlasSearchIndex: AtlasSearchResult[] = [
  ...attractionSearchResults,
  ...stateSearchResults,
  ...citySearchResults,
  ...townSearchResults,
  ...parcelSearchResults,
];

export function searchAtlas(
  query: string,
  limit = 8
): AtlasSearchResult[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return atlasSearchIndex
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