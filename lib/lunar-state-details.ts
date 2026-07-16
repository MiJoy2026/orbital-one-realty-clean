export type LunarStateDetail = {
  nickname: string;
  description: string;
  highlights: string[];

  searchAliases?: string[];
  featuredAttractionIds?: string[];
  launchReady?: boolean;
};

export const lunarStateDetails: Record<string, LunarStateDetail> = {

"Hammel": {
  nickname: "Gateway Highlands",
  description:
    "Hammel is the flagship gateway state of the Orbital One Realty atlas. Known for its broad highland terrain, prominent horizons, and strong exploration identity, Hammel offers a balanced mix of rural acreage, city blocks, and town properties for novelty lunar ownership.",
  highlights: [
    "Flagship Orbital One lunar state",
    "Three launch-ready lunar cities",
    "Twenty named lunar towns",
    "Popular rural acreage region",
    "Strong exploration and pioneer theme",
  ],
  searchAliases: [
    "Gateway Highlands",
    "Hammel State",
    "Gateway State",
    "Hammel Highlands",
  ],
  featuredAttractionIds: [
    "apollo11",
    "maretranquillitatis",
  ],
  launchReady: false,
},

"Clavius": {
  nickname: "The Grand Crater State",
  description:
    "Named after one of the Moon's most famous crater formations, Clavius offers a dramatic identity and a strong connection to lunar exploration history.",
  highlights: [
    "Famous crater region",
    "Collector favorite",
    "Strong lunar heritage",
    "Prestigious territory",
  ],
},

"Schiller": {
  nickname: "The Long Horizon",
  description:
    "Known for its distinctive elongated lunar features, Schiller represents adventure, exploration, and unique novelty ownership opportunities.",
  highlights: [
    "Distinctive terrain",
    "Explorer appeal",
    "Unique identity",
    "Town block opportunities",
  ],
},

"Rhetta": {
  nickname: "The Discovery Frontier",
  description:
    "A growing destination within the Orbital One Realty atlas, Rhetta combines novelty city ownership opportunities with a strong spirit of exploration.",
  highlights: [
    "City block destination",
    "Exploration themed",
    "Popular gifting region",
    "Growing territory",
  ],
},

"Mar Serenitatis": {
  nickname: "The Sea of Serenity",
  description:
    "One of the most elegant and recognizable lunar regions. Mar Serenitatis offers a calm, prestigious identity for novelty lunar property ownership.",
  highlights: [
    "Iconic lunar location",
    "Premium prestige",
    "Recognizable name",
    "Excellent keepsake territory",
  ],
},
};