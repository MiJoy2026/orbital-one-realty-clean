export type LunarCityDetail = {
  name: string;
  description: string;
  featured?: boolean;
};

export type LunarTownDetail = {
  name: string;
  description: string;
  featured?: boolean;
};

export type LunarStateDetail = {
  nickname: string;
  description: string;
  highlights: string[];

  searchAliases?: string[];
  featuredAttractionIds?: string[];
  launchReady?: boolean;

  cities?: LunarCityDetail[];
  towns?: LunarTownDetail[];
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

  cities: [
    {
  name: "Gateway City",
  description:
    "The capital of Hammel and the primary entry point into the Gateway Highlands. Gateway City is envisioned as a bustling lunar hub for commerce, exploration, and future virtual development.",
  featured: true,
  },
    {
      name: "Highland City",
      description:
        "A prominent city overlooking Hammel's elevated terrain, known for expansive views, premium city blocks, and its future role as a scenic residential center.",
    },
    {
      name: "Pioneer City",
      description:
        "A forward-looking city celebrating exploration, settlement, and the founding spirit of Orbital One Realty's earliest lunar communities.",
    },
  ],

  towns: [
    {
  name: "Founders Point",
  description:
    "A commemorative township honoring the earliest Orbital One property owners and founding HOA members.",
  featured: true,
  },
    {
      name: "Horizon",
      description:
        "A peaceful township known for broad lunar views and a strong sense of open space.",
    },
    {
      name: "Moonrise",
      description:
        "A scenic community envisioned around dramatic views of Earth and the lunar horizon.",
    },
    {
      name: "Starlight",
      description:
        "A quiet township themed around astronomy, observation, and the night sky.",
    },
    {
      name: "Explorer",
      description:
        "A community for adventurous customers drawn to discovery and lunar exploration.",
    },
    {
      name: "Discovery",
      description:
        "A future-facing township celebrating scientific progress and new beginnings.",
    },
    {
      name: "Unity",
      description:
        "A community-centered township emphasizing friendship, cooperation, and HOA spirit.",
    },
    {
      name: "Frontier",
      description:
        "A bold township positioned as one of Hammel's gateways to unexplored rural territory.",
    },
    {
      name: "Lunar Harbor",
      description:
        "A welcoming township envisioned as a gathering point for travelers and future virtual residents.",
    },
    {
      name: "Orbiter",
      description:
        "A technology-themed township inspired by lunar orbiters and exploration spacecraft.",
    },
    {
      name: "Highland View",
      description:
        "A scenic township offering panoramic views across Hammel's highland region.",
    },
    {
      name: "Gateway Ridge",
      description:
        "A ridge-top township near Gateway City, suited for premium novelty town-block ownership.",
    },
    {
      name: "First Light",
      description:
        "A symbolic township representing new beginnings and the first light of lunar settlement.",
    },
    {
      name: "Celestial",
      description:
        "An elegant community themed around the Moon's place among the stars.",
    },
    {
      name: "Nova",
      description:
        "A modern township designed around innovation, energy, and bright new possibilities.",
    },
    {
      name: "Tranquil Crossing",
      description:
        "A calm township located along one of Hammel's envisioned future travel corridors.",
    },
    {
      name: "Pioneer Hills",
      description:
        "A residential-style township inspired by exploration, heritage, and elevated terrain.",
    },
    {
      name: "Crater View",
      description:
        "A distinctive township themed around nearby lunar crater scenery.",
    },
    {
      name: "Earthrise",
      description:
        "A premium township inspired by the iconic view of Earth above the lunar horizon.",
    },
    {
      name: "Charter Township",
      description:
        "A community honoring Orbital One Realty's 2026 founding and charter HOA members.",
    },
  ],
},

"Clavius": {
  nickname: "The Grand Crater State",
  description:
    "Clavius is a dramatic Orbital One lunar state inspired by the grandeur of the Moon's southern highlands. Its identity centers on astronomy, observation, crater landscapes, and prestigious novelty lunar communities.",
  highlights: [
    "Grand crater-inspired landscapes",
    "Three astronomy-themed cities",
    "Twenty named lunar towns",
    "Popular collector destination",
    "Strong science and observation theme",
  ],
  searchAliases: [
    "Grand Crater State",
    "Clavius State",
    "Clavius Highlands",
    "Southern Observatory Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Observatory City",
      description:
        "The capital of Clavius and a prominent center for lunar astronomy, observatories, and future scientific development.",
    },
    {
      name: "Crater City",
      description:
        "A dramatic urban destination inspired by Clavius's crater heritage and sweeping highland scenery.",
    },
    {
      name: "Southern Sky City",
      description:
        "A scenic city celebrating the southern lunar horizon, astronomy, and exploration.",
    },
  ],

  towns: [
    {
      name: "Stargazer",
      description:
        "A quiet astronomy-themed community designed for stargazing and observation.",
    },
    {
      name: "Telescope Point",
      description:
        "A future observation community overlooking Clavius's dramatic terrain.",
    },
    {
      name: "Crater Rim",
      description:
        "A scenic township inspired by the towering edges of lunar impact formations.",
    },
    {
      name: "Highland Watch",
      description:
        "A highland community known for broad views across southern lunar territory.",
    },
    {
      name: "Astronomer",
      description:
        "A township honoring generations of astronomers and lunar scientists.",
    },
    {
      name: "Southern Vista",
      description:
        "A panoramic community themed around the Moon's southern horizon.",
    },
    {
      name: "Starfield",
      description:
        "A peaceful town inspired by the uninterrupted lunar night sky.",
    },
    {
      name: "Cosmos Ridge",
      description:
        "A ridge community celebrating astronomy and the wider universe.",
    },
    {
      name: "Lunar Lens",
      description:
        "A technology-themed township inspired by telescopes and scientific imaging.",
    },
    {
      name: "Night Observatory",
      description:
        "A future virtual community centered on scientific observation.",
    },
    {
      name: "Clavius Heights",
      description:
        "An elevated township carrying the proud identity of Clavius State.",
    },
    {
      name: "Eclipse Point",
      description:
        "A dramatic destination inspired by lunar shadows and eclipses.",
    },
    {
      name: "Southern Cross",
      description:
        "An exploration-themed community with a strong celestial identity.",
    },
    {
      name: "Kepler View",
      description:
        "A township honoring orbital science and Johannes Kepler.",
    },
    {
      name: "Galileo Station",
      description:
        "A science-focused settlement inspired by Galileo's astronomical discoveries.",
    },
    {
      name: "Deep Sky",
      description:
        "A remote-feeling community themed around deep-space observation.",
    },
    {
      name: "Meteor Watch",
      description:
        "A township celebrating impact science and lunar history.",
    },
    {
      name: "Moon Shadow",
      description:
        "A distinctive community inspired by the contrast of lunar light and darkness.",
    },
    {
      name: "Celestial Rim",
      description:
        "A premium township envisioned along scenic highland terrain.",
    },
    {
      name: "Scholar's Landing",
      description:
        "A commemorative community honoring science, learning, and discovery.",
    },
  ],
},

"Schiller": {
  nickname: "The Long Horizon",
  description:
    "Schiller is an Orbital One lunar state defined by expansive horizons, cultural expression, and a spirit of artistic exploration. Its communities blend imagination, literature, design, and scenic novelty property opportunities.",
  highlights: [
    "Distinctive long-horizon identity",
    "Arts and culture-themed cities",
    "Twenty creative lunar towns",
    "Scenic novelty property destination",
    "Strong imagination and design theme",
  ],
  searchAliases: [
    "Long Horizon",
    "Schiller State",
    "Schiller Horizon",
    "Lunar Arts Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Horizon City",
      description:
        "The capital of Schiller, known for expansive views, cultural landmarks, and future virtual gathering places.",
    },
    {
      name: "Poet City",
      description:
        "A creative lunar city celebrating literature, imagination, and artistic expression.",
    },
    {
      name: "Gallery City",
      description:
        "A design-centered destination envisioned for virtual art, architecture, and cultural events.",
    },
  ],

  towns: [
    {
      name: "Longview",
      description:
        "A scenic township known for broad views across Schiller's horizon.",
    },
    {
      name: "Moon Canvas",
      description:
        "A creative community inspired by visual art and lunar landscapes.",
    },
    {
      name: "Verse",
      description:
        "A literary township celebrating poetry and imagination.",
    },
    {
      name: "Starlit Stage",
      description:
        "A performance-themed community envisioned for future virtual events.",
    },
    {
      name: "Silver Horizon",
      description:
        "An elegant town inspired by the Moon's bright distant horizon.",
    },
    {
      name: "Muse",
      description:
        "A quiet community for creativity, reflection, and inspiration.",
    },
    {
      name: "Lunar Gallery",
      description:
        "A future cultural district for art, design, and virtual exhibitions.",
    },
    {
      name: "Story Ridge",
      description:
        "A ridge community celebrating storytelling and lunar legends.",
    },
    {
      name: "Sonnet",
      description:
        "A small literary township with a refined cultural identity.",
    },
    {
      name: "Imagination",
      description:
        "A future-focused community encouraging bold ideas and creative building.",
    },
    {
      name: "Schiller View",
      description:
        "A signature township offering a strong connection to the state's identity.",
    },
    {
      name: "Creative Crossing",
      description:
        "A welcoming cultural community at the crossroads of art and exploration.",
    },
    {
      name: "Dreamer's Point",
      description:
        "A tranquil community for customers drawn to wonder and possibility.",
    },
    {
      name: "Melody",
      description:
        "A music-inspired township envisioned for future performances and gatherings.",
    },
    {
      name: "Sculptor's Ridge",
      description:
        "A terrain-inspired community celebrating form, design, and architecture.",
    },
    {
      name: "Canvas Heights",
      description:
        "An elevated cultural township with a scenic artistic identity.",
    },
    {
      name: "Moonlight Theater",
      description:
        "A future entertainment community inspired by stage and cinema.",
    },
    {
      name: "Epic",
      description:
        "A bold township themed around grand stories and exploration.",
    },
    {
      name: "Inspiration Bay",
      description:
        "A peaceful creative retreat within Schiller State.",
    },
    {
      name: "Horizon House",
      description:
        "A community designed around future virtual homes and panoramic lunar views.",
    },
  ],
},

"Rhetta": {
  nickname: "The Discovery Frontier",
  description:
    "Rhetta is an energetic Orbital One lunar state built around discovery, invention, and emerging communities. Its cities and towns celebrate scientific progress, technology, and the excitement of exploring new territory.",
  highlights: [
    "Discovery and innovation identity",
    "Three technology-themed cities",
    "Twenty named frontier towns",
    "Strong future-development potential",
    "Popular gifting and exploration region",
  ],
  searchAliases: [
    "Discovery Frontier",
    "Rhetta State",
    "Rhetta Frontier",
    "Innovation Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Discovery City",
      description:
        "The capital of Rhetta and a central hub for exploration, innovation, and future virtual development.",
    },
    {
      name: "Innovation City",
      description:
        "A technology-focused lunar city celebrating invention, engineering, and new ideas.",
    },
    {
      name: "Venture City",
      description:
        "A bold frontier destination designed around entrepreneurship and lunar expansion.",
    },
  ],

  towns: [
    {
      name: "New Frontier",
      description:
        "A pioneering township at the heart of Rhetta's exploration identity.",
    },
    {
      name: "Inventor",
      description:
        "A community honoring creators, engineers, and problem-solvers.",
    },
    {
      name: "Surveyor",
      description:
        "A mapping and exploration-themed township inspired by lunar survey missions.",
    },
    {
      name: "Pathfinder",
      description:
        "A settlement celebrating those who discover new routes and possibilities.",
    },
    {
      name: "Research Point",
      description:
        "A future scientific community focused on research and experimentation.",
    },
    {
      name: "Launchpad",
      description:
        "An energetic township inspired by spacecraft launches and new beginnings.",
    },
    {
      name: "Rhetta Station",
      description:
        "A central travel and gathering community within Rhetta State.",
    },
    {
      name: "Tech Ridge",
      description:
        "An elevated technology-themed township envisioned for future virtual facilities.",
    },
    {
      name: "Quantum",
      description:
        "A science-inspired community with a modern futuristic identity.",
    },
    {
      name: "Prototype",
      description:
        "A creative settlement focused on testing and building new ideas.",
    },
    {
      name: "Expedition",
      description:
        "A township dedicated to exploration teams and lunar journeys.",
    },
    {
      name: "Signal Point",
      description:
        "A communications-themed community inspired by deep-space transmissions.",
    },
    {
      name: "Navigator",
      description:
        "A settlement celebrating navigation, guidance, and discovery.",
    },
    {
      name: "Future Harbor",
      description:
        "A welcoming destination for future lunar travelers and virtual residents.",
    },
    {
      name: "Data Valley",
      description:
        "A technology district envisioned for information, research, and innovation.",
    },
    {
      name: "Rocket View",
      description:
        "A scenic town inspired by spacecraft and launch activity.",
    },
    {
      name: "Pioneer Lab",
      description:
        "A research-centered community honoring experimental science.",
    },
    {
      name: "Discovery Ridge",
      description:
        "A premium ridge community overlooking Rhetta's frontier terrain.",
    },
    {
      name: "Venture Point",
      description:
        "A bold township for entrepreneurs and future virtual builders.",
    },
    {
      name: "Tomorrow",
      description:
        "A forward-looking community representing promise, progress, and possibility.",
    },
  ],
},

"Maurolycus": {
  nickname: "The Navigator's Realm",
  description:
    "Maurolycus is an Orbital One lunar state inspired by classical astronomy, navigation, and long-distance exploration. Its communities honor star charts, celestial travel, and humanity's enduring desire to find new worlds.",
  highlights: [
    "Classical astronomy identity",
    "Navigation and exploration theme",
    "Three celestial cities",
    "Twenty named navigator towns",
    "Strong heritage and discovery appeal",
  ],
  searchAliases: [
    "Navigator's Realm",
    "Maurolycus State",
    "Navigator State",
    "Celestial Navigation Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Navigator City",
      description:
        "The capital of Maurolycus and a major center for celestial navigation, exploration, and future lunar travel.",
    },
    {
      name: "Star Chart City",
      description:
        "A scientific city inspired by astronomy, mapping, and the study of the night sky.",
    },
    {
      name: "Mariner City",
      description:
        "A city celebrating the tradition of voyagers who navigate by the stars.",
    },
  ],

  towns: [
    {
      name: "Compass Point",
      description:
        "A navigation-themed township marking the way through Maurolycus State.",
    },
    {
      name: "North Star",
      description:
        "A guiding community inspired by Polaris and celestial navigation.",
    },
    {
      name: "Starboard",
      description:
        "A maritime-inspired lunar town honoring historic explorers.",
    },
    {
      name: "Meridian",
      description:
        "A mapping community named for the coordinate lines used in navigation.",
    },
    {
      name: "Celestial Route",
      description:
        "A township envisioned along a future virtual lunar travel corridor.",
    },
    {
      name: "Chart House",
      description:
        "A community dedicated to maps, star charts, and exploration records.",
    },
    {
      name: "Voyager's Rest",
      description:
        "A peaceful settlement for travelers and future virtual explorers.",
    },
    {
      name: "Beacon",
      description:
        "A guiding community representing safety, direction, and discovery.",
    },
    {
      name: "Mariner's Ridge",
      description:
        "A scenic ridge community inspired by long voyages and exploration.",
    },
    {
      name: "Astrolabe",
      description:
        "A township named for the historic instrument used to navigate by the stars.",
    },
    {
      name: "Longitude",
      description:
        "A cartography-themed settlement celebrating precise navigation.",
    },
    {
      name: "Latitude",
      description:
        "A companion community honoring geographic and celestial mapping.",
    },
    {
      name: "Polaris View",
      description:
        "A scenic town inspired by one of history's most important guiding stars.",
    },
    {
      name: "Sextant",
      description:
        "A navigation community named for the classic celestial measuring instrument.",
    },
    {
      name: "Explorer's Harbor",
      description:
        "A welcoming destination for future travelers and virtual visitors.",
    },
    {
      name: "Star Compass",
      description:
        "A community blending navigation heritage with futuristic lunar living.",
    },
    {
      name: "Deep Voyage",
      description:
        "A bold township inspired by humanity's journeys into deep space.",
    },
    {
      name: "Maurolycus Station",
      description:
        "A central transportation and gathering hub within the Navigator's Realm.",
    },
    {
      name: "Path of Light",
      description:
        "A symbolic community representing guidance across the lunar landscape.",
    },
    {
      name: "Worldfinder",
      description:
        "A frontier township honoring explorers who search for distant worlds.",
    },
  ],
},
"Wilhelm": {
  nickname: "The Builder's State",
  description:
    "Wilhelm is an Orbital One lunar state devoted to engineering, construction, infrastructure, and ambitious future development. Its cities and towns celebrate builders, designers, and the technologies that will shape tomorrow's lunar communities.",
  highlights: [
    "Engineering and construction identity",
    "Three development-focused cities",
    "Twenty named builder communities",
    "Strong future virtual-building potential",
    "Premium infrastructure-themed destination",
  ],
  searchAliases: [
    "Builder's State",
    "Wilhelm State",
    "Engineering State",
    "Lunar Construction Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Builder City",
      description:
        "The capital of Wilhelm and a central destination for engineering, construction, and future virtual lunar development.",
      featured: true,
    },
    {
      name: "Foundation City",
      description:
        "A carefully planned city inspired by strong foundations, reliable infrastructure, and lasting lunar communities.",
    },
    {
      name: "Architect City",
      description:
        "A design-focused city celebrating creative architecture, advanced habitats, and futuristic lunar homes.",
    },
  ],

  towns: [
    {
      name: "Blueprint",
      description:
        "A planning-themed community inspired by architectural drawings and future lunar designs.",
      featured: true,
    },
    {
      name: "Steel Ridge",
      description:
        "A rugged township celebrating structural engineering and durable construction.",
    },
    {
      name: "Foundation Point",
      description:
        "A stable community representing the strong beginnings of lunar settlement.",
    },
    {
      name: "Survey Line",
      description:
        "A precision-focused township inspired by surveying and land development.",
    },
    {
      name: "Habitat",
      description:
        "A residential community envisioned around futuristic lunar living spaces.",
    },
    {
      name: "Solar Works",
      description:
        "An energy-themed township inspired by solar arrays and sustainable lunar power.",
    },
    {
      name: "Builder's Crossing",
      description:
        "A growing community where future roads, homes, and neighborhoods may meet.",
    },
    {
      name: "Framework",
      description:
        "A construction-themed town celebrating structure, organization, and progress.",
    },
    {
      name: "Lunar Works",
      description:
        "An industrial-style community inspired by large-scale lunar projects.",
    },
    {
      name: "Design Point",
      description:
        "A creative township for architecture, planning, and future virtual design.",
    },
    {
      name: "Stone Harbor",
      description:
        "A welcoming settlement inspired by strong materials and dependable communities.",
    },
    {
      name: "Transit Ridge",
      description:
        "A transportation-themed township envisioned near future lunar travel routes.",
    },
    {
      name: "Construct",
      description:
        "A bold community centered on building and creating on the lunar surface.",
    },
    {
      name: "Module Station",
      description:
        "A habitat-themed settlement inspired by modular lunar structures.",
    },
    {
      name: "Gridline",
      description:
        "A precisely organized community designed around planning and mapped development.",
    },
    {
      name: "Habitat Heights",
      description:
        "An elevated residential township envisioned for premium virtual lunar homes.",
    },
    {
      name: "Engineering Bay",
      description:
        "A technical community honoring engineers and innovative problem-solving.",
    },
    {
      name: "Future Foundation",
      description:
        "A forward-looking town representing the beginning of long-term lunar settlement.",
    },
    {
      name: "Wilhelm Works",
      description:
        "A signature township carrying Wilhelm's engineering and construction identity.",
    },
    {
      name: "Master Builder",
      description:
        "A commemorative community honoring builders, architects, and creators.",
    },
  ],
},

"Schickard": {
  nickname: "The Academy State",
  description:
    "Schickard is an Orbital One lunar state centered on education, research, learning, and intellectual discovery. Its communities are designed around academies, laboratories, libraries, and the future educational possibilities of the Moon.",
  highlights: [
    "Education and research identity",
    "Three academy-themed cities",
    "Twenty named learning communities",
    "Strong educational-app potential",
    "Science and scholarship destination",
  ],
  searchAliases: [
    "Academy State",
    "Schickard State",
    "Education State",
    "Lunar Research Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Academy City",
      description:
        "The capital of Schickard and a future center for lunar education, research, and virtual learning experiences.",
      featured: true,
    },
    {
      name: "Research City",
      description:
        "A science-focused city envisioned around laboratories, experiments, and discovery.",
    },
    {
      name: "Scholar City",
      description:
        "A distinguished city honoring education, knowledge, and lifelong learning.",
    },
  ],

  towns: [
    {
      name: "Library Point",
      description:
        "A learning-centered township inspired by libraries, archives, and shared knowledge.",
      featured: true,
    },
    {
      name: "Laboratory",
      description:
        "A research community envisioned for scientific experiments and exploration.",
    },
    {
      name: "Scholar's Ridge",
      description:
        "An elevated township honoring students, teachers, and researchers.",
    },
    {
      name: "Discovery Hall",
      description:
        "A community inspired by education, museums, and scientific discovery.",
    },
    {
      name: "Knowledge",
      description:
        "A peaceful township celebrating learning and intellectual growth.",
    },
    {
      name: "Lecture Point",
      description:
        "An education-themed community envisioned for future virtual classes.",
    },
    {
      name: "Science Harbor",
      description:
        "A welcoming research town for future lunar scientists and students.",
    },
    {
      name: "Observatory School",
      description:
        "A community combining astronomy, education, and lunar observation.",
    },
    {
      name: "Learning Station",
      description:
        "A future educational hub serving visitors from across the lunar atlas.",
    },
    {
      name: "Archive",
      description:
        "A township dedicated to preserving records, discoveries, and lunar history.",
    },
    {
      name: "Campus Heights",
      description:
        "An elevated community envisioned as a future virtual lunar campus.",
    },
    {
      name: "Teacher's Point",
      description:
        "A commemorative township honoring educators and mentors.",
    },
    {
      name: "Experiment Ridge",
      description:
        "A science community inspired by research, testing, and innovation.",
    },
    {
      name: "Newton Hall",
      description:
        "A scholarly settlement honoring physics and scientific reasoning.",
    },
    {
      name: "Curie Station",
      description:
        "A research-themed township honoring scientific courage and discovery.",
    },
    {
      name: "Student Harbor",
      description:
        "A welcoming educational community for future learners and explorers.",
    },
    {
      name: "Research Valley",
      description:
        "A broad community envisioned for laboratories and collaborative science.",
    },
    {
      name: "Schickard Academy",
      description:
        "A signature township carrying the state's educational identity.",
    },
    {
      name: "Lunar Classroom",
      description:
        "A future virtual learning community designed for students around the world.",
    },
    {
      name: "Wisdom",
      description:
        "A quiet township representing knowledge, reflection, and understanding.",
    },
  ],
},

"Petavius": {
  nickname: "The Commonwealth State",
  description:
    "Petavius is an Orbital One lunar state inspired by leadership, civic life, public service, and organized communities. Its cities and towns reflect cooperation, representation, and the future governance of thriving lunar settlements.",
  highlights: [
    "Leadership and civic identity",
    "Three government-themed cities",
    "Twenty named civic communities",
    "Strong community and HOA theme",
    "Prestigious organized lunar territory",
  ],
  searchAliases: [
    "Commonwealth State",
    "Petavius State",
    "Leadership State",
    "Lunar Government Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Commonwealth City",
      description:
        "The capital of Petavius and a prominent center for leadership, civic life, and organized lunar communities.",
      featured: true,
    },
    {
      name: "Council City",
      description:
        "A community-focused city envisioned around cooperation, representation, and public service.",
    },
    {
      name: "Liberty City",
      description:
        "A distinguished city celebrating freedom, opportunity, and responsible lunar citizenship.",
    },
  ],

  towns: [
    {
      name: "Founders Hall",
      description:
        "A commemorative township honoring the founders and earliest citizens of Orbital One.",
      featured: true,
    },
    {
      name: "Civic Point",
      description:
        "A community centered on cooperation, participation, and public life.",
    },
    {
      name: "Union",
      description:
        "A township representing unity among lunar residents and communities.",
    },
    {
      name: "Liberty Ridge",
      description:
        "An elevated community celebrating freedom and individual opportunity.",
    },
    {
      name: "Charter",
      description:
        "A settlement honoring foundational agreements and organized communities.",
    },
    {
      name: "Council Harbor",
      description:
        "A welcoming township envisioned for meetings and community gatherings.",
    },
    {
      name: "Republic",
      description:
        "A civic community inspired by representation and shared responsibility.",
    },
    {
      name: "Assembly Point",
      description:
        "A gathering-centered settlement for future events and public discussions.",
    },
    {
      name: "Justice",
      description:
        "A township representing fairness, trust, and responsible community standards.",
    },
    {
      name: "Constitution Ridge",
      description:
        "A distinguished community honoring principles of structured governance.",
    },
    {
      name: "Public Square",
      description:
        "A social township envisioned around future virtual civic spaces.",
    },
    {
      name: "Leadership",
      description:
        "A community honoring service, responsibility, and positive direction.",
    },
    {
      name: "Petavius Hall",
      description:
        "A signature township carrying the proud identity of Petavius State.",
    },
    {
      name: "Unity Council",
      description:
        "A cooperative community emphasizing teamwork and shared goals.",
    },
    {
      name: "Diplomat Point",
      description:
        "A settlement inspired by communication, negotiation, and peaceful cooperation.",
    },
    {
      name: "Common Ground",
      description:
        "A welcoming township representing shared purpose among lunar residents.",
    },
    {
      name: "Civic Heights",
      description:
        "An elevated community envisioned as a premium residential civic district.",
    },
    {
      name: "Governor's Ridge",
      description:
        "A prestigious township inspired by leadership and public service.",
    },
    {
      name: "Freedom Harbor",
      description:
        "A peaceful community celebrating opportunity and future lunar living.",
    },
    {
      name: "HOA Commons",
      description:
        "A community-centered township honoring Orbital One's complimentary HOA membership.",
    },
  ],
},

"Fracastorius": {
  nickname: "The Life Sciences State",
  description:
    "Fracastorius is an Orbital One lunar state inspired by medicine, biology, wellness, and the future science of sustaining life beyond Earth. Its communities celebrate researchers, caregivers, gardens, and healthy lunar living.",
  highlights: [
    "Medicine and life-sciences identity",
    "Three wellness-themed cities",
    "Twenty named research communities",
    "Strong future lunar-garden potential",
    "Health and biology destination",
  ],
  searchAliases: [
    "Life Sciences State",
    "Fracastorius State",
    "Medical State",
    "Lunar Biology Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Life Science City",
      description:
        "The capital of Fracastorius and a future center for lunar medicine, biology, wellness, and research.",
      featured: true,
    },
    {
      name: "Genesis City",
      description:
        "A forward-looking city inspired by life, growth, and sustainable lunar communities.",
    },
    {
      name: "Healing City",
      description:
        "A peaceful city celebrating medicine, care, and the well-being of future lunar residents.",
    },
  ],

  towns: [
    {
      name: "Lunar Garden",
      description:
        "A future-focused township inspired by growing plants and creating lunar gardens.",
      featured: true,
    },
    {
      name: "Bio Station",
      description:
        "A research settlement devoted to biology and life-support science.",
    },
    {
      name: "Wellness Point",
      description:
        "A peaceful community centered on health, balance, and comfortable lunar living.",
    },
    {
      name: "Genesis Ridge",
      description:
        "An elevated township representing growth and new beginnings.",
    },
    {
      name: "Medic Harbor",
      description:
        "A welcoming community honoring doctors, nurses, and caregivers.",
    },
    {
      name: "Life Support",
      description:
        "A technology-themed township inspired by systems that sustain human life.",
    },
    {
      name: "Greenhouse",
      description:
        "A garden-centered settlement envisioned for future lunar agriculture.",
    },
    {
      name: "Research Clinic",
      description:
        "A medical-science community focused on health research and treatment.",
    },
    {
      name: "Botany Point",
      description:
        "A township celebrating plant science and future lunar vegetation.",
    },
    {
      name: "Vitality",
      description:
        "A community representing energy, wellness, and active lunar living.",
    },
    {
      name: "Healing Ridge",
      description:
        "A scenic township designed around peace, recovery, and well-being.",
    },
    {
      name: "Biology Bay",
      description:
        "A research community inspired by living systems and scientific discovery.",
    },
    {
      name: "Care Station",
      description:
        "A community honoring compassion, medicine, and public health.",
    },
    {
      name: "Garden View",
      description:
        "A residential township envisioned near future virtual lunar gardens.",
    },
    {
      name: "Nutrition",
      description:
        "A settlement focused on food science and sustainable lunar living.",
    },
    {
      name: "Microbe Point",
      description:
        "A science-themed community inspired by microbiology and research.",
    },
    {
      name: "Fracastorius Health",
      description:
        "A signature township representing the state's medical identity.",
    },
    {
      name: "Renewal",
      description:
        "A peaceful community representing recovery, growth, and new possibilities.",
    },
    {
      name: "Habitat Biology",
      description:
        "A research settlement studying how life can thrive in lunar habitats.",
    },
    {
      name: "Future Garden",
      description:
        "A visionary township connecting Orbital One Realty to future virtual agriculture.",
    },
  ],
},

"Rupes Altai": {
  nickname: "The Adventure Highlands",
  description:
    "Rupes Altai is an Orbital One lunar state inspired by dramatic ridges, rugged landscapes, exploration, and outdoor adventure. Its communities celebrate climbers, trails, scenic viewpoints, and bold journeys across the lunar highlands.",
  highlights: [
    "Mountain and adventure identity",
    "Three highland-themed cities",
    "Twenty named exploration towns",
    "Dramatic scenic-property appeal",
    "Strong tourism and adventure potential",
  ],
  searchAliases: [
    "Adventure Highlands",
    "Rupes Altai State",
    "Altai Highlands",
    "Lunar Mountain Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Summit City",
      description:
        "The capital of Rupes Altai and a dramatic destination for explorers, climbers, and future lunar adventurers.",
      featured: true,
    },
    {
      name: "Highland City",
      description:
        "A scenic city overlooking rugged terrain and expansive lunar views.",
    },
    {
      name: "Expedition City",
      description:
        "An adventure-focused city envisioned as the starting point for future virtual lunar journeys.",
    },
  ],

  towns: [
    {
      name: "Basecamp",
      description:
        "A featured adventure township inspired by the starting point of great expeditions.",
      featured: true,
    },
    {
      name: "Summit Ridge",
      description:
        "An elevated community offering a bold highland identity.",
    },
    {
      name: "Trailhead",
      description:
        "A township envisioned as the beginning of future lunar exploration routes.",
    },
    {
      name: "Climber's Point",
      description:
        "An adventure community honoring climbers and daring explorers.",
    },
    {
      name: "Altai View",
      description:
        "A scenic settlement overlooking the state's rugged landscape.",
    },
    {
      name: "High Pass",
      description:
        "A travel-themed community inspired by routes through elevated terrain.",
    },
    {
      name: "Adventure Harbor",
      description:
        "A welcoming destination for explorers and future virtual tourists.",
    },
    {
      name: "Explorer's Ridge",
      description:
        "A prominent township designed around discovery and panoramic views.",
    },
    {
      name: "Mountain Watch",
      description:
        "A lookout community inspired by rugged lunar highlands.",
    },
    {
      name: "Lunar Trail",
      description:
        "A settlement envisioned along a future recreational travel route.",
    },
    {
      name: "Peak View",
      description:
        "A premium township inspired by elevated lunar scenery.",
    },
    {
      name: "Rover Camp",
      description:
        "A vehicle-themed community designed around future lunar exploration.",
    },
    {
      name: "Canyon Point",
      description:
        "A dramatic township inspired by deep lunar terrain formations.",
    },
    {
      name: "Highland Crossing",
      description:
        "A travel community connecting imagined routes through Rupes Altai.",
    },
    {
      name: "Alpine Station",
      description:
        "A mountain-inspired settlement celebrating exploration and endurance.",
    },
    {
      name: "Rockfall",
      description:
        "A rugged township inspired by natural lunar geology.",
    },
    {
      name: "Expedition Ridge",
      description:
        "A scenic settlement honoring long-distance lunar journeys.",
    },
    {
      name: "Rupes Base",
      description:
        "A signature community representing the state's adventure identity.",
    },
    {
      name: "Vista Summit",
      description:
        "A premium destination with a strong scenic and exploratory theme.",
    },
    {
      name: "Pathfinder Camp",
      description:
        "A frontier township honoring those who create new paths across the Moon.",
    },
  ],
},
"Mare Undarum": {
  nickname: "The Sea of Waves",
  description:
    "Mare Undarum is an Orbital One lunar state inspired by flowing landscapes, graceful motion, and communities shaped around calm exploration. Its cities and towns celebrate waves, tides, navigation, and peaceful lunar living.",
  highlights: [
    "Sea and wave-inspired identity",
    "Three waterfront-themed cities",
    "Twenty named lunar communities",
    "Calm residential character",
    "Strong scenic-property appeal",
  ],
  searchAliases: [
    "Sea of Waves",
    "Mare Undarum State",
    "Undarum State",
    "Lunar Wave Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Wavecrest City",
      description:
        "The capital of Mare Undarum and a scenic center inspired by graceful movement, calm horizons, and future lunar living.",
      featured: true,
    },
    {
      name: "Tide City",
      description:
        "A peaceful city built around themes of rhythm, balance, and flowing lunar terrain.",
    },
    {
      name: "Harbor City",
      description:
        "A welcoming destination envisioned as a future gathering place for residents and visitors.",
    },
  ],

  towns: [
    {
      name: "Moonwave",
      description:
        "A featured township inspired by the flowing appearance of lunar terrain.",
      featured: true,
    },
    {
      name: "Silver Tide",
      description:
        "A peaceful community reflecting the Moon's silver landscape.",
    },
    {
      name: "Wave Point",
      description:
        "A scenic township with a strong connection to Mare Undarum's identity.",
    },
    {
      name: "Tranquil Harbor",
      description:
        "A calm residential community envisioned for relaxing lunar living.",
    },
    {
      name: "Tidal Ridge",
      description:
        "An elevated town inspired by rhythm, movement, and broad views.",
    },
    {
      name: "Sea Glass",
      description:
        "An elegant community themed around light, texture, and lunar beauty.",
    },
    {
      name: "Undarum Bay",
      description:
        "A signature township celebrating the Sea of Waves.",
    },
    {
      name: "Current Point",
      description:
        "A modern community inspired by movement and exploration.",
    },
    {
      name: "Moon Harbor",
      description:
        "A welcoming township designed as a future virtual gathering place.",
    },
    {
      name: "Quiet Tide",
      description:
        "A peaceful settlement offering a calm novelty-property identity.",
    },
    {
      name: "Ripple Ridge",
      description:
        "A scenic community inspired by repeating terrain patterns.",
    },
    {
      name: "Sailor's Rest",
      description:
        "A navigation-themed town honoring travelers and explorers.",
    },
    {
      name: "Blue Horizon",
      description:
        "A township inspired by distant Earth and open lunar views.",
    },
    {
      name: "Wave Garden",
      description:
        "A future residential community envisioned with flowing virtual landscapes.",
    },
    {
      name: "Harbor Lights",
      description:
        "A bright and welcoming settlement inspired by future lunar communities.",
    },
    {
      name: "Tidewatch",
      description:
        "A lookout community designed around observation and scenic horizons.",
    },
    {
      name: "Silver Current",
      description:
        "A modern township combining lunar elegance with forward movement.",
    },
    {
      name: "Sea View",
      description:
        "A premium community inspired by the broad lunar mare landscape.",
    },
    {
      name: "Calm Crossing",
      description:
        "A quiet town envisioned along a future virtual travel route.",
    },
    {
      name: "Wavehaven",
      description:
        "A peaceful settlement representing comfort, belonging, and lunar discovery.",
    },
  ],
},

"Grimaldi": {
  nickname: "The Western Gateway",
  description:
    "Grimaldi is an Orbital One lunar state inspired by western horizons, distant exploration, and gateways into new territory. Its cities and towns celebrate travel, observation, and bold communities near the edge of the known atlas.",
  highlights: [
    "Western gateway identity",
    "Three exploration-themed cities",
    "Twenty frontier communities",
    "Strong horizon-view appeal",
    "Distinctive travel and discovery theme",
  ],
  searchAliases: [
    "Western Gateway",
    "Grimaldi State",
    "Western Lunar State",
    "Grimaldi Frontier",
  ],
  launchReady: false,

  cities: [
    {
      name: "Western Gate City",
      description:
        "The capital of Grimaldi and a major gateway into the western regions of the Orbital One atlas.",
      featured: true,
    },
    {
      name: "Horizon City",
      description:
        "A scenic city celebrating broad views and distant lunar exploration.",
    },
    {
      name: "Voyager City",
      description:
        "A travel-focused city honoring explorers who journey beyond familiar territory.",
    },
  ],

  towns: [
    {
      name: "Westward Point",
      description:
        "A featured frontier community representing journeys toward new horizons.",
      featured: true,
    },
    {
      name: "Far Horizon",
      description:
        "A scenic township inspired by Grimaldi's distant western views.",
    },
    {
      name: "Gateway Ridge",
      description:
        "An elevated settlement marking entry into western lunar territory.",
    },
    {
      name: "Voyager's Rest",
      description:
        "A peaceful community for travelers, explorers, and future virtual residents.",
    },
    {
      name: "Western Watch",
      description:
        "A lookout town overlooking Grimaldi's broad terrain.",
    },
    {
      name: "Frontier Gate",
      description:
        "A bold community positioned as a symbolic entrance to new territory.",
    },
    {
      name: "Grimaldi Harbor",
      description:
        "A welcoming settlement carrying the state's proud western identity.",
    },
    {
      name: "Sunset Ridge",
      description:
        "A scenic town inspired by light along the lunar horizon.",
    },
    {
      name: "Traveler",
      description:
        "A community honoring movement, exploration, and discovery.",
    },
    {
      name: "Edge Station",
      description:
        "A remote-feeling township envisioned near the atlas frontier.",
    },
    {
      name: "West Haven",
      description:
        "A comfortable residential community with a strong sense of place.",
    },
    {
      name: "Distant View",
      description:
        "A premium township inspired by panoramic lunar scenery.",
    },
    {
      name: "Pathfinder West",
      description:
        "An exploration settlement honoring those who create new routes.",
    },
    {
      name: "Boundary Point",
      description:
        "A distinctive community inspired by borders and geographic discovery.",
    },
    {
      name: "Pioneer Gate",
      description:
        "A township celebrating courageous settlement and expansion.",
    },
    {
      name: "Western Trail",
      description:
        "A future travel community envisioned along lunar exploration routes.",
    },
    {
      name: "Grimaldi View",
      description:
        "A signature settlement overlooking the state's terrain.",
    },
    {
      name: "Outer Ridge",
      description:
        "A rugged residential town near the western edge of the atlas.",
    },
    {
      name: "Explorer's Gate",
      description:
        "A gathering point for future virtual journeys into new regions.",
    },
    {
      name: "New West",
      description:
        "A forward-looking community representing opportunity and growth.",
    },
  ],
},

"Letronne": {
  nickname: "The Crescent State",
  description:
    "Letronne is an Orbital One lunar state inspired by graceful curves, elegant communities, and distinctive lunar formations. Its cities and towns combine refined design, scenic living, and a strong identity centered on the crescent shape.",
  highlights: [
    "Elegant crescent identity",
    "Three design-focused cities",
    "Twenty refined communities",
    "Strong premium-property appeal",
    "Distinctive scenic atmosphere",
  ],
  searchAliases: [
    "Crescent State",
    "Letronne State",
    "Lunar Crescent Region",
    "Letronne Crescent",
  ],
  launchReady: false,

  cities: [
    {
      name: "Crescent City",
      description:
        "The capital of Letronne and an elegant center inspired by graceful lunar curves and refined community design.",
      featured: true,
    },
    {
      name: "Arc City",
      description:
        "A modern city celebrating architecture, geometry, and sweeping lunar landscapes.",
    },
    {
      name: "Silver Curve City",
      description:
        "A premium city inspired by the Moon's bright curved horizon.",
    },
  ],

  towns: [
    {
      name: "Crescent Point",
      description:
        "A featured community carrying Letronne's graceful crescent identity.",
      featured: true,
    },
    {
      name: "Silver Arc",
      description:
        "An elegant township inspired by lunar light and curved terrain.",
    },
    {
      name: "Moon Curve",
      description:
        "A scenic residential town with a distinctive geometric theme.",
    },
    {
      name: "Letronne View",
      description:
        "A signature settlement overlooking the state's landscape.",
    },
    {
      name: "Arc Ridge",
      description:
        "An elevated community shaped around graceful design and broad views.",
    },
    {
      name: "Crescent Harbor",
      description:
        "A welcoming township envisioned as a refined virtual destination.",
    },
    {
      name: "Silver Bend",
      description:
        "A peaceful community inspired by curved lunar formations.",
    },
    {
      name: "Moonlight Arc",
      description:
        "A scenic town reflecting the elegance of lunar light.",
    },
    {
      name: "Curved Horizon",
      description:
        "A premium community with a strong panoramic identity.",
    },
    {
      name: "Design Point",
      description:
        "A creative town celebrating architecture and thoughtful planning.",
    },
    {
      name: "Elegant Ridge",
      description:
        "A refined settlement suited to future premium virtual homes.",
    },
    {
      name: "Lunar Crescent",
      description:
        "A central community honoring Letronne's defining theme.",
    },
    {
      name: "Arcadia Point",
      description:
        "A peaceful township inspired by beauty, comfort, and belonging.",
    },
    {
      name: "Silver Harbor",
      description:
        "An elegant gathering community for future residents and visitors.",
    },
    {
      name: "Crescent Gardens",
      description:
        "A future residential town envisioned with curved virtual landscapes.",
    },
    {
      name: "Letronne Heights",
      description:
        "An elevated premium community carrying the state's identity.",
    },
    {
      name: "Moon Arch",
      description:
        "A striking settlement inspired by architectural forms.",
    },
    {
      name: "Gentle Curve",
      description:
        "A quiet township offering a calm and refined atmosphere.",
    },
    {
      name: "Crescent Crossing",
      description:
        "A travel-oriented community positioned along future lunar routes.",
    },
    {
      name: "Bright Arc",
      description:
        "A luminous town representing optimism and elegant lunar living.",
    },
  ],
},

"Montes Riphaeus": {
  nickname: "The Silver Mountains",
  description:
    "Montes Riphaeus is an Orbital One lunar state inspired by mountain scenery, highland communities, and premium elevated destinations. Its cities and towns celebrate ridges, peaks, exploration, and scenic lunar living.",
  highlights: [
    "Mountain and highland identity",
    "Three scenic cities",
    "Twenty elevated communities",
    "Strong premium-view appeal",
    "Adventure and residential character",
  ],
  searchAliases: [
    "Silver Mountains",
    "Montes Riphaeus State",
    "Riphaeus Mountains",
    "Lunar Mountain State",
  ],
  launchReady: false,

  cities: [
    {
      name: "Silver Peak City",
      description:
        "The capital of Montes Riphaeus and a premium destination inspired by elevated terrain and panoramic lunar views.",
      featured: true,
    },
    {
      name: "Mountain City",
      description:
        "A rugged city celebrating lunar highlands, exploration, and outdoor adventure.",
    },
    {
      name: "Ridgeview City",
      description:
        "A scenic residential center overlooking the Silver Mountains.",
    },
  ],

  towns: [
    {
      name: "Silver Summit",
      description:
        "A featured premium township inspired by bright mountain peaks.",
      featured: true,
    },
    {
      name: "Riphaeus Ridge",
      description:
        "A signature highland community carrying the state's mountain identity.",
    },
    {
      name: "Peak Harbor",
      description:
        "A welcoming elevated community for future residents and explorers.",
    },
    {
      name: "Mountain View",
      description:
        "A scenic town designed around broad highland vistas.",
    },
    {
      name: "Highland Trail",
      description:
        "An exploration community envisioned along future lunar travel routes.",
    },
    {
      name: "Silver Ridge",
      description:
        "A refined settlement inspired by bright lunar terrain.",
    },
    {
      name: "Summit Station",
      description:
        "A travel and adventure hub near imagined mountain routes.",
    },
    {
      name: "Climber's Rest",
      description:
        "A peaceful town honoring climbers and highland explorers.",
    },
    {
      name: "Peak Point",
      description:
        "A dramatic residential community with a strong elevated identity.",
    },
    {
      name: "Mountain Watch",
      description:
        "A lookout settlement designed around observation and scenic terrain.",
    },
    {
      name: "Ridge Crossing",
      description:
        "A future transportation community connecting highland destinations.",
    },
    {
      name: "Alpine Harbor",
      description:
        "A mountain-inspired residential community with a welcoming character.",
    },
    {
      name: "Silver Vista",
      description:
        "A premium town offering panoramic lunar views.",
    },
    {
      name: "Riphaeus Base",
      description:
        "A central adventure community serving the surrounding highlands.",
    },
    {
      name: "High Peak",
      description:
        "An elevated settlement representing ambition and achievement.",
    },
    {
      name: "Lunar Alpine",
      description:
        "A scenic residential town inspired by mountain living.",
    },
    {
      name: "Summit Gardens",
      description:
        "A future virtual community combining gardens and elevated terrain.",
    },
    {
      name: "Ridge Haven",
      description:
        "A peaceful premium settlement surrounded by scenic landscapes.",
    },
    {
      name: "Mountain Gate",
      description:
        "A gateway community leading into the Silver Mountains.",
    },
    {
      name: "Explorer Summit",
      description:
        "A bold township honoring adventure, discovery, and highland travel.",
    },
  ],
},

"Ptolemaeus": {
  nickname: "The Cartographer State",
  description:
    "Ptolemaeus is an Orbital One lunar state inspired by maps, coordinates, astronomy, and the organization of new worlds. Its cities and towns celebrate cartographers, planners, surveyors, and explorers who transform unknown places into understandable destinations.",
  highlights: [
    "Mapping and cartography identity",
    "Three planning-focused cities",
    "Twenty named survey communities",
    "Strong atlas and navigation connection",
    "Ideal future administrative center",
  ],
  searchAliases: [
    "Cartographer State",
    "Ptolemaeus State",
    "Mapping State",
    "Lunar Atlas Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Atlas City",
      description:
        "The capital of Ptolemaeus and a central hub for maps, coordinates, planning, and lunar navigation.",
      featured: true,
    },
    {
      name: "Cartographer City",
      description:
        "A scholarly city celebrating mapmakers and the organization of lunar geography.",
    },
    {
      name: "Meridian City",
      description:
        "A precision-focused city inspired by coordinate systems and global navigation.",
    },
  ],

  towns: [
    {
      name: "Mapmaker Point",
      description:
        "A featured settlement honoring cartographers and lunar atlas builders.",
      featured: true,
    },
    {
      name: "Prime Meridian",
      description:
        "A precision-themed township inspired by geographic reference lines.",
    },
    {
      name: "Survey Ridge",
      description:
        "An elevated community celebrating measurement and land planning.",
    },
    {
      name: "Compass Harbor",
      description:
        "A navigation town designed as a welcoming point for travelers.",
    },
    {
      name: "Coordinate",
      description:
        "A modern settlement inspired by exact lunar positioning.",
    },
    {
      name: "Atlas Point",
      description:
        "A signature community carrying Ptolemaeus's mapping identity.",
    },
    {
      name: "Grid Station",
      description:
        "An organized township inspired by mapped lunar property systems.",
    },
    {
      name: "Longitude Ridge",
      description:
        "A scenic town named for geographic east-west positioning.",
    },
    {
      name: "Latitude View",
      description:
        "A residential community inspired by north-south mapping coordinates.",
    },
    {
      name: "Surveyor's Rest",
      description:
        "A peaceful settlement honoring those who measure and map new territory.",
    },
    {
      name: "Chart Harbor",
      description:
        "A welcoming community centered on maps and exploration records.",
    },
    {
      name: "Boundary Point",
      description:
        "A township inspired by borders, regions, and property organization.",
    },
    {
      name: "Navigator's Grid",
      description:
        "A navigation settlement connecting travel and atlas technology.",
    },
    {
      name: "Map Room",
      description:
        "A scholarly town envisioned for future virtual atlas exhibits.",
    },
    {
      name: "Ptolemaeus Station",
      description:
        "A central gathering and transportation community.",
    },
    {
      name: "Reference Point",
      description:
        "A symbolic township representing accuracy and dependable navigation.",
    },
    {
      name: "World Chart",
      description:
        "A broad community inspired by mapping entire worlds.",
    },
    {
      name: "Parcel Grid",
      description:
        "A property-themed town celebrating the organized lunar parcel system.",
    },
    {
      name: "Atlas Crossing",
      description:
        "A future travel community connecting mapped destinations.",
    },
    {
      name: "Explorer's Chart",
      description:
        "A frontier settlement honoring maps used in exploration.",
    },
  ],
},


};