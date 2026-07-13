export type LunarAttractionType =
  | "Landing Site"
  | "Crater"
  | "Lunar Mare"
  | "Mountain Range"
  | "Valley"
  | "Rille"
  | "Historic Site"
  | "Other";

export type LunarAttraction = {
  id: string;
  name: string;
  type: LunarAttractionType;
  state: string;

  x: number;
  y: number;

  description: string;
  image: string;

  featured?: boolean;
  tagline?: string;

  /**
   * Controls when the attraction appears on the atlas.
   *
   * Example:
   * minZoom: 1 means the marker appears at zoom 1 and deeper.
   */
  minZoom?: number;

  /**
   * Optional maximum zoom for labels that should disappear
   * at extremely close range.
   */
  maxZoom?: number;

  quickFacts?: {
    label: string;
    value: string;
  }[];

  history?: string;
  gallery?: string[];
};

export const lunarAttractions: LunarAttraction[] = [
  {
    id: "apollo11",
    name: "Apollo 11 Landing Site",
    type: "Landing Site",
    state: "Tranquillitatis",
    x: 505,
    y: 500,
    description:
      "The first human landing site on the Moon during the Apollo 11 mission.",
    image: "/attractions/apollo11.jpg",
    featured: true,
    tagline: "The first place humans walked on another world.",
    minZoom: 3,
    quickFacts: [
      {
        label: "Mission",
        value: "Apollo 11",
      },
      {
        label: "Landing Date",
        value: "July 20, 1969",
      },
      {
        label: "Location",
        value: "Mare Tranquillitatis",
      },
      {
        label: "Type",
        value: "Historic Landing Site",
      },
    ],
    history:
      "Apollo 11 marked the first time humans set foot on another world. On July 20, 1969, the lunar module Eagle landed in Mare Tranquillitatis, the Sea of Tranquility, while millions watched from Earth. Neil Armstrong and Buzz Aldrin walked on the lunar surface, collected samples, deployed scientific instruments, and left behind one of humanity's most famous footprints. Today, the Apollo 11 landing site remains one of the most historic locations beyond Earth.",
    gallery: [
      "/attractions/apollo11/hero.jpg",
      "/attractions/apollo11/orbit.jpg",
      "/attractions/apollo11/eagle.jpg",
      "/attractions/apollo11/bootprint.jpg",
    ],
  },

  {
    id: "tycho",
    name: "Tycho Crater",
    type: "Crater",
    state: "Tycho",
    x: 455,
    y: 575,
    description:
      "One of the Moon's youngest and brightest impact craters.",
    image: "/attractions/tycho.jpg",
    featured: true,
    tagline: "A brilliant crater surrounded by sweeping lunar rays.",
    minZoom: 1,
    quickFacts: [
      {
        label: "Feature Type",
        value: "Impact Crater",
      },
      {
        label: "Region",
        value: "Southern Lunar Highlands",
      },
      {
        label: "Known For",
        value: "Bright Ejecta Rays",
      },
    ],
  },

  {
    id: "copernicus",
    name: "Copernicus Crater",
    type: "Crater",
    state: "Copernicus",
    x: 335,
    y: 290,
    description:
      "A spectacular impact crater with extensive ejecta rays.",
    image: "/attractions/copernicus.jpg",
    featured: true,
    tagline: "One of the Moon's most recognizable impact formations.",
    minZoom: 1,
    quickFacts: [
      {
        label: "Feature Type",
        value: "Impact Crater",
      },
      {
        label: "Known For",
        value: "Terraced Walls and Ejecta Rays",
      },
    ],
  },

  {
    id: "plato",
    name: "Plato Crater",
    type: "Crater",
    state: "Plato",
    x: 470,
    y: 165,
    description:
      "A large lava-filled crater famous among lunar observers.",
    image: "/attractions/plato.jpg",
    tagline: "A dark, smooth-floored crater near Mare Imbrium.",
    minZoom: 2,
    quickFacts: [
      {
        label: "Feature Type",
        value: "Lava-Filled Impact Crater",
      },
      {
        label: "Known For",
        value: "Dark Interior Floor",
      },
    ],
  },

  {
    id: "maretranquillitatis",
    name: "Mare Tranquillitatis",
    type: "Lunar Mare",
    state: "Tranquillitatis",
    x: 520,
    y: 460,
    description:
      "The Sea of Tranquility, the broad lunar mare where Apollo 11 landed.",
    image: "/attractions/maretranquillitatis.jpg",
    featured: true,
    tagline: "The historic Sea of Tranquility.",
    minZoom: 0,
    quickFacts: [
      {
        label: "English Name",
        value: "Sea of Tranquility",
      },
      {
        label: "Feature Type",
        value: "Lunar Mare",
      },
      {
        label: "Historic Mission",
        value: "Apollo 11",
      },
    ],
  },

  {
    id: "montesapenninus",
    name: "Montes Apenninus",
    type: "Mountain Range",
    state: "Archimedes",
    x: 535,
    y: 235,
    description:
      "One of the Moon's most impressive mountain ranges.",
    image: "/attractions/montesapenninus.jpg",
    tagline: "A towering mountain chain along the edge of Mare Imbrium.",
    minZoom: 2,
    quickFacts: [
      {
        label: "Feature Type",
        value: "Mountain Range",
      },
      {
        label: "Region",
        value: "Mare Imbrium Basin",
      },
    ],
  },
];

export function getVisibleLunarAttractions(zoomLevel: number) {
  return lunarAttractions.filter((attraction) => {
    const minimumZoom = attraction.minZoom ?? 0;
    const maximumZoom = attraction.maxZoom ?? Number.POSITIVE_INFINITY;

    return zoomLevel >= minimumZoom && zoomLevel <= maximumZoom;
  });
}

export function getLunarAttractionById(attractionId: string) {
  return lunarAttractions.find(
    (attraction) =>
      attraction.id.toLowerCase() === attractionId.toLowerCase()
  );
}

export function getLunarAttractionsByState(stateName: string) {
  return lunarAttractions.filter(
    (attraction) =>
      attraction.state.toLowerCase() === stateName.toLowerCase()
  );
}

export function getLunarAttractionsByType(type: LunarAttractionType) {
  return lunarAttractions.filter(
    (attraction) => attraction.type === type
  );
}
export function getNearbyLunarAttractions(
  mapX: number,
  mapY: number,
  limit = 3
) {
  return lunarAttractions
    .map((attraction) => {
      const horizontalDistance = attraction.x - mapX;
      const verticalDistance = attraction.y - mapY;

      const distance = Math.sqrt(
        horizontalDistance ** 2 + verticalDistance ** 2
      );

      return {
        ...attraction,
        distance,
      };
    })
    .sort((first, second) => first.distance - second.distance)
    .slice(0, limit);
}