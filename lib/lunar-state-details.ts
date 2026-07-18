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

  cities: LunarCityDetail[];
  towns: LunarTownDetail[];
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
"Theophilus": {
  nickname: "The Radiant Crater State",
  description:
    "Theophilus is an Orbital One lunar state inspired by bright crater terrain, dramatic light, and bold scientific exploration. Its communities celebrate observation, illumination, geology, and scenic lunar living.",
  highlights: [
    "Bright crater and illumination identity",
    "Three observation-themed cities",
    "Twenty named lunar communities",
    "Strong scenic and scientific appeal",
    "Premium crater-view destination",
  ],
  searchAliases: [
    "Radiant Crater State",
    "Theophilus State",
    "Bright Crater Region",
    "Lunar Light State",
  ],
  launchReady: false,

  cities: [
    {
      name: "Radiance City",
      description:
        "The capital of Theophilus and a brilliant center inspired by crater light, scientific observation, and premium lunar living.",
      featured: true,
    },
    {
      name: "Craterlight City",
      description:
        "A scenic city celebrating illuminated crater walls and dramatic lunar terrain.",
    },
    {
      name: "Beacon City",
      description:
        "A forward-looking city inspired by guidance, discovery, and light across the lunar landscape.",
    },
  ],

  towns: [
    {
      name: "Bright Rim",
      description:
        "A featured township inspired by illuminated crater edges and panoramic views.",
      featured: true,
    },
    {
      name: "Radiant Point",
      description:
        "A luminous community carrying Theophilus's bright lunar identity.",
    },
    {
      name: "Beacon Ridge",
      description:
        "An elevated settlement inspired by guidance and scenic observation.",
    },
    {
      name: "Crater Glow",
      description:
        "A dramatic township celebrating the contrast of lunar light and shadow.",
    },
    {
      name: "Sunlit Harbor",
      description:
        "A welcoming residential community inspired by bright lunar terrain.",
    },
    {
      name: "Theophilus View",
      description:
        "A signature township overlooking the state's crater-inspired landscape.",
    },
    {
      name: "Lightwatch",
      description:
        "An observation community focused on changing lunar illumination.",
    },
    {
      name: "Eastern Beacon",
      description:
        "A guiding township with a strong exploration identity.",
    },
    {
      name: "Radiant Crossing",
      description:
        "A travel-oriented community envisioned along future lunar routes.",
    },
    {
      name: "Crater Vista",
      description:
        "A premium settlement inspired by broad crater views.",
    },
    {
      name: "Morning Light",
      description:
        "A peaceful township representing new beginnings and discovery.",
    },
    {
      name: "Solar Ridge",
      description:
        "An energy-themed community inspired by sunlight and lunar power.",
    },
    {
      name: "Luminous Point",
      description:
        "An elegant residential town with a bright and optimistic identity.",
    },
    {
      name: "Shadow Line",
      description:
        "A distinctive settlement inspired by the boundary between light and darkness.",
    },
    {
      name: "Beacon Harbor",
      description:
        "A welcoming town envisioned as a future gathering destination.",
    },
    {
      name: "Radiance Heights",
      description:
        "An elevated premium community offering dramatic lunar scenery.",
    },
    {
      name: "Crater Sunrise",
      description:
        "A scenic township inspired by light moving across crater terrain.",
    },
    {
      name: "Bright Horizon",
      description:
        "A residential community centered on open views and lunar illumination.",
    },
    {
      name: "Observation Point",
      description:
        "A science-focused township designed around terrain and light observation.",
    },
    {
      name: "Golden Rim",
      description:
        "A premium community inspired by brightly illuminated crater edges.",
    },
  ],
},

"Colombo": {
  nickname: "The Voyager's Coast",
  description:
    "Colombo is an Orbital One lunar state inspired by voyages, ports, trade routes, and bold travel into distant territory. Its cities and towns celebrate navigators, travelers, gathering places, and future lunar transportation.",
  highlights: [
    "Voyage and transportation identity",
    "Three travel-themed cities",
    "Twenty named lunar communities",
    "Strong commercial and exploration appeal",
    "Future transportation-hub potential",
  ],
  searchAliases: [
    "Voyager's Coast",
    "Colombo State",
    "Lunar Port Region",
    "Voyager State",
  ],
  launchReady: false,

  cities: [
    {
      name: "Voyager City",
      description:
        "The capital of Colombo and a central destination for lunar travel, commerce, and future transportation networks.",
      featured: true,
    },
    {
      name: "Port City",
      description:
        "A welcoming city envisioned as a major arrival and departure point for future virtual travelers.",
    },
    {
      name: "Mariner City",
      description:
        "An exploration-focused city honoring navigators, travelers, and long lunar journeys.",
    },
  ],

  towns: [
    {
      name: "Voyager Harbor",
      description:
        "A featured township envisioned as a welcoming gateway for lunar travelers.",
      featured: true,
    },
    {
      name: "Mariner's Point",
      description:
        "A navigation community honoring generations of explorers.",
    },
    {
      name: "Port Horizon",
      description:
        "A scenic travel town overlooking imagined lunar routes.",
    },
    {
      name: "Colombo Station",
      description:
        "A signature transportation community carrying the state's identity.",
    },
    {
      name: "Traveler's Rest",
      description:
        "A peaceful residential town for explorers and future virtual visitors.",
    },
    {
      name: "Docking Point",
      description:
        "A spacecraft-themed settlement inspired by arrivals and departures.",
    },
    {
      name: "Trade Harbor",
      description:
        "A commerce-focused community envisioned for future lunar exchange.",
    },
    {
      name: "Navigation Ridge",
      description:
        "An elevated town inspired by route planning and exploration.",
    },
    {
      name: "Journey Bay",
      description:
        "A welcoming settlement celebrating movement and discovery.",
    },
    {
      name: "Cargo Station",
      description:
        "A logistics-themed community inspired by future lunar supply systems.",
    },
    {
      name: "Sailor's View",
      description:
        "A scenic township honoring historic navigation traditions.",
    },
    {
      name: "Departure Point",
      description:
        "A bold community representing the beginning of new journeys.",
    },
    {
      name: "Arrival Harbor",
      description:
        "A welcoming destination for future residents and travelers.",
    },
    {
      name: "Route Finder",
      description:
        "A navigation settlement focused on discovering new lunar paths.",
    },
    {
      name: "Colombo Crossing",
      description:
        "A central travel community connecting imagined lunar routes.",
    },
    {
      name: "Voyage Ridge",
      description:
        "A scenic settlement honoring long-distance exploration.",
    },
    {
      name: "Transit Harbor",
      description:
        "A transportation-focused town envisioned as a future lunar hub.",
    },
    {
      name: "Compass Bay",
      description:
        "A guiding community inspired by direction and travel.",
    },
    {
      name: "New Passage",
      description:
        "A frontier settlement representing discovery and new opportunities.",
    },
    {
      name: "Explorer Port",
      description:
        "A bold township designed for future virtual expeditions.",
    },
  ],
},

"Langrenus": {
  nickname: "The Eastern Crown",
  description:
    "Langrenus is an Orbital One lunar state inspired by commanding eastern views, distinguished communities, and a prestigious crater-region identity. Its cities and towns combine elegance, observation, and strong residential appeal.",
  highlights: [
    "Prestigious eastern identity",
    "Three refined lunar cities",
    "Twenty named communities",
    "Strong crater-view appeal",
    "Premium residential character",
  ],
  searchAliases: [
    "Eastern Crown",
    "Langrenus State",
    "Eastern Lunar State",
    "Crown Crater Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Crown City",
      description:
        "The capital of Langrenus and a prestigious destination inspired by eastern lunar views and distinguished community design.",
      featured: true,
    },
    {
      name: "Eastern City",
      description:
        "A scenic city celebrating the Moon's eastern horizon and expansive terrain.",
    },
    {
      name: "Regal City",
      description:
        "An elegant residential center designed around premium lunar living.",
    },
  ],

  towns: [
    {
      name: "Crown Point",
      description:
        "A featured premium township carrying Langrenus's distinguished identity.",
      featured: true,
    },
    {
      name: "Eastern Ridge",
      description:
        "An elevated residential community overlooking the eastern lunar horizon.",
    },
    {
      name: "Regal Harbor",
      description:
        "A welcoming and refined destination for future residents.",
    },
    {
      name: "Langrenus View",
      description:
        "A signature town offering a strong connection to the state's landscape.",
    },
    {
      name: "Crown Heights",
      description:
        "A premium elevated settlement with a prestigious residential character.",
    },
    {
      name: "Royal Crescent",
      description:
        "An elegant community inspired by lunar curves and refined design.",
    },
    {
      name: "Eastern Watch",
      description:
        "A lookout town centered on scenic observation.",
    },
    {
      name: "Majestic Ridge",
      description:
        "A dramatic residential settlement inspired by elevated terrain.",
    },
    {
      name: "Silver Crown",
      description:
        "A luminous community reflecting the Moon's bright surface.",
    },
    {
      name: "Noble Point",
      description:
        "A distinguished town designed around premium novelty ownership.",
    },
    {
      name: "Crown Harbor",
      description:
        "A welcoming gathering place within Langrenus State.",
    },
    {
      name: "Eastern Gate",
      description:
        "A symbolic gateway into the state's refined communities.",
    },
    {
      name: "Regent Ridge",
      description:
        "An elevated township with a dignified identity.",
    },
    {
      name: "Lunar Court",
      description:
        "A community-inspired settlement envisioned around elegant virtual spaces.",
    },
    {
      name: "Langrenus Heights",
      description:
        "A premium residential district carrying the state's name.",
    },
    {
      name: "Crown Crossing",
      description:
        "A future travel community connecting Langrenus destinations.",
    },
    {
      name: "Eastern Palace",
      description:
        "A luxury-themed settlement inspired by futuristic lunar architecture.",
    },
    {
      name: "Royal Horizon",
      description:
        "A scenic township overlooking broad lunar views.",
    },
    {
      name: "Crescent Court",
      description:
        "An elegant community suited to future virtual homes and gardens.",
    },
    {
      name: "Sovereign Point",
      description:
        "A prestigious destination representing independence and distinction.",
    },
  ],
},

"Byrgius": {
  nickname: "The Raylands",
  description:
    "Byrgius is an Orbital One lunar state inspired by bright ejecta rays, powerful impact history, and energetic landscapes. Its cities and towns celebrate motion, geology, illumination, and dramatic lunar scenery.",
  highlights: [
    "Bright-ray and impact identity",
    "Three energetic lunar cities",
    "Twenty named communities",
    "Strong geology and scenery appeal",
    "Distinctive high-contrast terrain theme",
  ],
  searchAliases: [
    "Raylands",
    "Byrgius State",
    "Bright Ray State",
    "Lunar Ejecta Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Ray City",
      description:
        "The capital of Byrgius and a dramatic center inspired by bright ejecta rays and powerful lunar geology.",
      featured: true,
    },
    {
      name: "Impact City",
      description:
        "A bold city celebrating crater formation, geology, and lunar history.",
    },
    {
      name: "Radiant City",
      description:
        "A luminous residential center designed around scenic ray-pattern terrain.",
    },
  ],

  towns: [
    {
      name: "Bright Ray",
      description:
        "A featured township inspired by the brilliant streaks surrounding lunar impacts.",
      featured: true,
    },
    {
      name: "Impact Point",
      description:
        "A geology-themed community celebrating the Moon's impact history.",
    },
    {
      name: "Ejecta Ridge",
      description:
        "An elevated settlement inspired by material scattered from ancient impacts.",
    },
    {
      name: "Ray Harbor",
      description:
        "A welcoming community carrying Byrgius's bright identity.",
    },
    {
      name: "Crater Line",
      description:
        "A dramatic township inspired by lunar impact formations.",
    },
    {
      name: "Radiant Ridge",
      description:
        "A scenic settlement overlooking bright lunar terrain.",
    },
    {
      name: "Byrgius View",
      description:
        "A signature community connected to the state's geological identity.",
    },
    {
      name: "Impact Crossing",
      description:
        "A travel-oriented town envisioned among dramatic lunar formations.",
    },
    {
      name: "Silver Ray",
      description:
        "An elegant residential township inspired by bright surface markings.",
    },
    {
      name: "Meteor Point",
      description:
        "A science-themed community honoring celestial impacts.",
    },
    {
      name: "Blast Ridge",
      description:
        "A rugged town inspired by powerful geological events.",
    },
    {
      name: "Raywatch",
      description:
        "An observation community focused on lunar ray systems.",
    },
    {
      name: "Crater Harbor",
      description:
        "A welcoming settlement near imagined crater scenery.",
    },
    {
      name: "Radiance Point",
      description:
        "A premium residential community with a bright visual identity.",
    },
    {
      name: "Impact Basin",
      description:
        "A township inspired by large-scale lunar geology.",
    },
    {
      name: "Lunar Streak",
      description:
        "A distinctive community named for visible lunar ray patterns.",
    },
    {
      name: "Byrgius Station",
      description:
        "A central gathering and exploration hub within the Raylands.",
    },
    {
      name: "Bright Horizon",
      description:
        "A scenic township offering broad lunar views.",
    },
    {
      name: "Meteor Ridge",
      description:
        "An elevated residential settlement inspired by impact science.",
    },
    {
      name: "Rayfield",
      description:
        "A broad community representing the bright terrain of Byrgius.",
    },
  ],
},

"Mare Humorum": {
  nickname: "The Sea of Moisture",
  description:
    "Mare Humorum is an Orbital One lunar state inspired by calm basin terrain, reflective landscapes, and balanced residential communities. Its cities and towns emphasize serenity, wellness, gardens, and comfortable lunar living.",
  highlights: [
    "Calm mare and basin identity",
    "Three wellness-themed cities",
    "Twenty peaceful communities",
    "Strong residential and garden appeal",
    "Relaxed scenic atmosphere",
  ],
  searchAliases: [
    "Sea of Moisture",
    "Mare Humorum State",
    "Humorum State",
    "Lunar Basin Community",
  ],
  launchReady: false,

  cities: [
    {
      name: "Serenity City",
      description:
        "The capital of Mare Humorum and a peaceful center for comfortable lunar living, wellness, and future virtual communities.",
      featured: true,
    },
    {
      name: "Basin City",
      description:
        "A scenic city inspired by broad mare terrain and sheltered residential development.",
    },
    {
      name: "Garden City",
      description:
        "A future-focused city envisioned around virtual lunar gardens and sustainable living.",
    },
  ],

  towns: [
    {
      name: "Serenity Harbor",
      description:
        "A featured peaceful community designed around comfort and belonging.",
      featured: true,
    },
    {
      name: "Quiet Basin",
      description:
        "A calm residential township inspired by sheltered lunar terrain.",
    },
    {
      name: "Moon Garden",
      description:
        "A future virtual community envisioned with gardens and landscaped spaces.",
    },
    {
      name: "Humorum View",
      description:
        "A signature settlement overlooking the Sea of Moisture region.",
    },
    {
      name: "Peaceful Ridge",
      description:
        "An elevated residential community with a quiet atmosphere.",
    },
    {
      name: "Wellness Point",
      description:
        "A community focused on health, comfort, and balanced lunar living.",
    },
    {
      name: "Basin Harbor",
      description:
        "A welcoming township nestled within Mare Humorum's identity.",
    },
    {
      name: "Tranquil Garden",
      description:
        "A peaceful settlement inspired by future virtual landscaping.",
    },
    {
      name: "Stillwater",
      description:
        "A calm community named for the mare's smooth visual character.",
    },
    {
      name: "Gentle Horizon",
      description:
        "A scenic township with broad, relaxing lunar views.",
    },
    {
      name: "Garden Ridge",
      description:
        "An elevated residential town envisioned with future green spaces.",
    },
    {
      name: "Reflection Point",
      description:
        "A quiet community designed around contemplation and scenic terrain.",
    },
    {
      name: "Harmony",
      description:
        "A community-centered town celebrating cooperation and peaceful living.",
    },
    {
      name: "Humorum Harbor",
      description:
        "A signature welcoming destination within the state.",
    },
    {
      name: "Serene Crossing",
      description:
        "A travel-oriented town with a calm residential identity.",
    },
    {
      name: "Moon Meadow",
      description:
        "A future virtual landscape community inspired by open gardens.",
    },
    {
      name: "Comfort Point",
      description:
        "A residential settlement centered on welcoming lunar living.",
    },
    {
      name: "Basin Gardens",
      description:
        "A community envisioned for future virtual homes and landscaped areas.",
    },
    {
      name: "Quiet Horizon",
      description:
        "A premium settlement with a peaceful scenic character.",
    },
    {
      name: "Peace Harbor",
      description:
        "A calm community representing safety, comfort, and belonging.",
    },
  ],
},
"Pitatus": {
  nickname: "The Reflection Basin",
  description:
    "Pitatus is an Orbital One lunar state inspired by reflective landscapes, thoughtful planning, and peaceful basin communities. Its cities and towns emphasize balance, observation, and comfortable lunar living.",
  highlights: [
    "Reflective basin identity",
    "Three peaceful lunar cities",
    "Twenty named communities",
    "Strong residential appeal",
    "Observation and wellness theme",
  ],
  searchAliases: [
    "Reflection Basin",
    "Pitatus State",
    "Pitatus Basin",
    "Reflective Lunar Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Reflection City",
      description:
        "The capital of Pitatus and a peaceful center for thoughtful design, observation, and comfortable lunar living.",
      featured: true,
    },
    {
      name: "Mirror City",
      description:
        "A refined city inspired by reflection, symmetry, and bright lunar terrain.",
    },
    {
      name: "Basinview City",
      description:
        "A scenic residential city overlooking Pitatus's broad basin landscape.",
    },
  ],

  towns: [
    {
      name: "Mirror Point",
      description:
        "A featured township inspired by reflection and balanced lunar design.",
      featured: true,
    },
    {
      name: "Still Horizon",
      description:
        "A calm community known for quiet views and peaceful surroundings.",
    },
    {
      name: "Reflection Ridge",
      description:
        "An elevated town overlooking Pitatus's basin terrain.",
    },
    {
      name: "Silver Mirror",
      description:
        "An elegant settlement inspired by the Moon's bright surface.",
    },
    {
      name: "Quiet Harbor",
      description:
        "A welcoming residential community with a calm identity.",
    },
    {
      name: "Basin Point",
      description:
        "A signature township connected to Pitatus's landscape.",
    },
    {
      name: "Moon Reflection",
      description:
        "A scenic community centered on light, shadow, and observation.",
    },
    {
      name: "Balanced Ridge",
      description:
        "A carefully planned settlement emphasizing harmony and order.",
    },
    {
      name: "Pitatus View",
      description:
        "A premium town offering broad views across the state.",
    },
    {
      name: "Mirror Harbor",
      description:
        "A refined gathering community for future residents.",
    },
    {
      name: "Still Basin",
      description:
        "A peaceful residential town inspired by smooth lunar terrain.",
    },
    {
      name: "Reflection Crossing",
      description:
        "A future travel community linking Pitatus destinations.",
    },
    {
      name: "Silver Basin",
      description:
        "A bright residential settlement with a distinctive visual identity.",
    },
    {
      name: "Calm Ridge",
      description:
        "An elevated town designed around peaceful lunar living.",
    },
    {
      name: "Observation Harbor",
      description:
        "A community focused on viewing and studying lunar terrain.",
    },
    {
      name: "Moon Mirror",
      description:
        "A reflective-themed residential township.",
    },
    {
      name: "Harmony Point",
      description:
        "A community celebrating balance, cooperation, and belonging.",
    },
    {
      name: "Basin Gardens",
      description:
        "A future virtual community envisioned with homes and landscaped spaces.",
    },
    {
      name: "Quiet Reflection",
      description:
        "A tranquil settlement suited to peaceful novelty ownership.",
    },
    {
      name: "Serene View",
      description:
        "A premium township offering a calm and scenic atmosphere.",
    },
  ],
},

"Purbach": {
  nickname: "The Heritage Highlands",
  description:
    "Purbach is an Orbital One lunar state inspired by heritage, tradition, astronomy, and enduring highland communities. Its cities and towns celebrate history, craftsmanship, and the preservation of lunar identity.",
  highlights: [
    "Heritage and tradition identity",
    "Three historic-themed cities",
    "Twenty named communities",
    "Strong collector appeal",
    "Astronomy and craftsmanship theme",
  ],
  searchAliases: [
    "Heritage Highlands",
    "Purbach State",
    "Purbach Highlands",
    "Lunar Heritage Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Heritage City",
      description:
        "The capital of Purbach and a distinguished center for lunar history, tradition, and lasting community identity.",
      featured: true,
    },
    {
      name: "Legacy City",
      description:
        "A city honoring exploration history and the preservation of important achievements.",
    },
    {
      name: "Craft City",
      description:
        "A creative city celebrating builders, artisans, and careful workmanship.",
    },
  ],

  towns: [
    {
      name: "Heritage Point",
      description:
        "A featured township honoring lunar history and Orbital One tradition.",
      featured: true,
    },
    {
      name: "Legacy Ridge",
      description:
        "An elevated community celebrating lasting achievements.",
    },
    {
      name: "Founder's Harbor",
      description:
        "A commemorative town honoring early Orbital One members.",
    },
    {
      name: "Tradition",
      description:
        "A community centered on heritage and shared identity.",
    },
    {
      name: "Craftsman Point",
      description:
        "A settlement honoring skilled builders and creators.",
    },
    {
      name: "Purbach View",
      description:
        "A signature town overlooking the Heritage Highlands.",
    },
    {
      name: "History Ridge",
      description:
        "A scenic community inspired by lunar exploration history.",
    },
    {
      name: "Archive Harbor",
      description:
        "A township dedicated to preserving records and stories.",
    },
    {
      name: "Charter Point",
      description:
        "A community honoring foundational Orbital One traditions.",
    },
    {
      name: "Legacy Crossing",
      description:
        "A future travel settlement connecting historic destinations.",
    },
    {
      name: "Artisan Ridge",
      description:
        "An elevated creative community celebrating craftsmanship.",
    },
    {
      name: "Old Horizon",
      description:
        "A peaceful town inspired by timeless lunar views.",
    },
    {
      name: "Heritage Hall",
      description:
        "A gathering community envisioned for history and cultural events.",
    },
    {
      name: "Pioneer Legacy",
      description:
        "A township honoring exploration and settlement.",
    },
    {
      name: "Tradition Harbor",
      description:
        "A welcoming community with a strong shared identity.",
    },
    {
      name: "Memory Point",
      description:
        "A reflective settlement celebrating important milestones.",
    },
    {
      name: "Lunar Heritage",
      description:
        "A signature community carrying Purbach's historic theme.",
    },
    {
      name: "Craft Ridge",
      description:
        "A residential town inspired by thoughtful design.",
    },
    {
      name: "Founders View",
      description:
        "A premium community honoring Orbital One's founding era.",
    },
    {
      name: "Timeless",
      description:
        "A peaceful township representing permanence and legacy.",
    },
  ],
},

"Bessel": {
  nickname: "The Precision State",
  description:
    "Bessel is an Orbital One lunar state inspired by measurement, mathematics, accuracy, and dependable scientific work. Its cities and towns celebrate precision engineering, calculations, and orderly lunar development.",
  highlights: [
    "Mathematics and precision identity",
    "Three science-focused cities",
    "Twenty named communities",
    "Strong engineering appeal",
    "Orderly development theme",
  ],
  searchAliases: [
    "Precision State",
    "Bessel State",
    "Mathematics State",
    "Lunar Measurement Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Precision City",
      description:
        "The capital of Bessel and a center for mathematics, accurate measurement, and organized lunar development.",
      featured: true,
    },
    {
      name: "Metric City",
      description:
        "A science-focused city inspired by standards, measurements, and dependable systems.",
    },
    {
      name: "Calculation City",
      description:
        "A technology city celebrating mathematics, data, and careful planning.",
    },
  ],

  towns: [
    {
      name: "Exact Point",
      description:
        "A featured township representing accuracy and dependable planning.",
      featured: true,
    },
    {
      name: "Measure Ridge",
      description:
        "An elevated community inspired by measurement and surveying.",
    },
    {
      name: "Decimal",
      description:
        "A mathematics-themed town with a clean modern identity.",
    },
    {
      name: "Metric Point",
      description:
        "A community honoring consistent scientific standards.",
    },
    {
      name: "Bessel Line",
      description:
        "A signature settlement inspired by mapped coordinates.",
    },
    {
      name: "Calculation Ridge",
      description:
        "A technical town focused on mathematics and planning.",
    },
    {
      name: "Standard Harbor",
      description:
        "A dependable community representing reliable systems.",
    },
    {
      name: "Survey Point",
      description:
        "A mapping settlement inspired by precise land measurement.",
    },
    {
      name: "Equation",
      description:
        "A scholarly township celebrating mathematical reasoning.",
    },
    {
      name: "Accuracy",
      description:
        "A community centered on quality and careful work.",
    },
    {
      name: "Data Ridge",
      description:
        "An elevated technology settlement inspired by information.",
    },
    {
      name: "Number Station",
      description:
        "A mathematics community designed around organization.",
    },
    {
      name: "Calibration Point",
      description:
        "A science town honoring measurement and testing.",
    },
    {
      name: "Bessel View",
      description:
        "A signature residential community within the Precision State.",
    },
    {
      name: "Formula Harbor",
      description:
        "A welcoming settlement inspired by mathematics and science.",
    },
    {
      name: "Measured Horizon",
      description:
        "A scenic town combining precision with broad lunar views.",
    },
    {
      name: "Grid Accuracy",
      description:
        "A community connected to the Orbital One parcel system.",
    },
    {
      name: "Reliable Ridge",
      description:
        "A residential town representing stability and trust.",
    },
    {
      name: "Precision Crossing",
      description:
        "A future travel community organized around exact routes.",
    },
    {
      name: "True Point",
      description:
        "A township representing correctness, clarity, and direction.",
    },
  ],
},

"Menalaus": {
  nickname: "The Passage State",
  description:
    "Menalaus is an Orbital One lunar state inspired by pathways, mountain passages, connected communities, and movement across the lunar landscape. Its cities and towns celebrate routes, bridges, and exploration corridors.",
  highlights: [
    "Pathway and passage identity",
    "Three travel-focused cities",
    "Twenty connected communities",
    "Strong transportation potential",
    "Scenic route and highland theme",
  ],
  searchAliases: [
    "Passage State",
    "Menalaus State",
    "Lunar Passage Region",
    "Menalaus Corridor",
  ],
  launchReady: false,

  cities: [
    {
      name: "Passage City",
      description:
        "The capital of Menalaus and a central hub for lunar routes, travel, and connected communities.",
      featured: true,
    },
    {
      name: "Crossroads City",
      description:
        "A transportation city positioned around imagined lunar travel corridors.",
    },
    {
      name: "Bridge City",
      description:
        "A community-focused city celebrating connection and cooperation.",
    },
  ],

  towns: [
    {
      name: "Gateway Pass",
      description:
        "A featured township marking an important route through Menalaus.",
      featured: true,
    },
    {
      name: "Crossing Point",
      description:
        "A travel community where future routes may meet.",
    },
    {
      name: "High Pass",
      description:
        "A scenic town inspired by elevated lunar terrain.",
    },
    {
      name: "Bridge Harbor",
      description:
        "A welcoming community representing connection.",
    },
    {
      name: "Menalaus Route",
      description:
        "A signature settlement carrying the state's travel identity.",
    },
    {
      name: "Trail Ridge",
      description:
        "An elevated community envisioned along an exploration path.",
    },
    {
      name: "Passage View",
      description:
        "A residential town overlooking imagined lunar corridors.",
    },
    {
      name: "Junction",
      description:
        "A central community connecting multiple destinations.",
    },
    {
      name: "Traveler's Gate",
      description:
        "A welcoming entry point for future virtual explorers.",
    },
    {
      name: "Route Harbor",
      description:
        "A transportation-themed gathering community.",
    },
    {
      name: "Pathfinder Ridge",
      description:
        "A scenic settlement honoring those who discover new routes.",
    },
    {
      name: "Transit Point",
      description:
        "A future travel hub within Menalaus State.",
    },
    {
      name: "Bridgeview",
      description:
        "A residential community celebrating connection and cooperation.",
    },
    {
      name: "Corridor Station",
      description:
        "A settlement envisioned along a major lunar route.",
    },
    {
      name: "Mountain Passage",
      description:
        "A highland town inspired by routes through rugged terrain.",
    },
    {
      name: "Open Road",
      description:
        "A frontier community representing freedom and exploration.",
    },
    {
      name: "Connection Ridge",
      description:
        "An elevated town symbolizing community and shared purpose.",
    },
    {
      name: "Menalaus Crossing",
      description:
        "A central travel destination carrying the state's name.",
    },
    {
      name: "Wayfinder",
      description:
        "A navigation community for future lunar travelers.",
    },
    {
      name: "Journey Point",
      description:
        "A bold settlement representing movement and new experiences.",
    },
  ],
},

"Dionysius": {
  nickname: "The Celebration State",
  description:
    "Dionysius is an Orbital One lunar state inspired by celebration, entertainment, hospitality, and vibrant community life. Its cities and towns are designed around gatherings, events, creativity, and memorable lunar experiences.",
  highlights: [
    "Celebration and hospitality identity",
    "Three entertainment-focused cities",
    "Twenty vibrant communities",
    "Strong tourism potential",
    "Social and event-centered theme",
  ],
  searchAliases: [
    "Celebration State",
    "Dionysius State",
    "Entertainment State",
    "Lunar Festival Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Festival City",
      description:
        "The capital of Dionysius and a lively center for celebrations, entertainment, and future virtual events.",
      featured: true,
    },
    {
      name: "Harmony City",
      description:
        "A welcoming city built around music, friendship, and community.",
    },
    {
      name: "Celebration City",
      description:
        "A vibrant destination envisioned for gatherings and memorable lunar experiences.",
    },
  ],

  towns: [
    {
      name: "Festival Point",
      description:
        "A featured township designed around celebrations and community events.",
      featured: true,
    },
    {
      name: "Harmony Harbor",
      description:
        "A welcoming settlement inspired by music and friendship.",
    },
    {
      name: "Starlight Stage",
      description:
        "A performance community envisioned for future virtual shows.",
    },
    {
      name: "Celebration Ridge",
      description:
        "An elevated town with a lively social identity.",
    },
    {
      name: "Music Point",
      description:
        "A creative township celebrating sound and performance.",
    },
    {
      name: "Dionysius Plaza",
      description:
        "A signature gathering destination within the state.",
    },
    {
      name: "Festival Harbor",
      description:
        "A welcoming community for events and visitors.",
    },
    {
      name: "Joy",
      description:
        "A cheerful residential town representing happiness.",
    },
    {
      name: "Moonlight Stage",
      description:
        "A performance-themed community inspired by lunar evenings.",
    },
    {
      name: "Unity Festival",
      description:
        "A community emphasizing friendship and shared celebration.",
    },
    {
      name: "Entertainment Ridge",
      description:
        "A scenic district for future virtual attractions.",
    },
    {
      name: "Grand Parade",
      description:
        "A lively town envisioned for festivals and community events.",
    },
    {
      name: "Celebration Harbor",
      description:
        "A hospitality community welcoming residents and guests.",
    },
    {
      name: "Melody",
      description:
        "A peaceful music-inspired residential settlement.",
    },
    {
      name: "Bright Night",
      description:
        "A vibrant town themed around lights and entertainment.",
    },
    {
      name: "Gathering Point",
      description:
        "A central community designed for social connection.",
    },
    {
      name: "Festival Gardens",
      description:
        "A future virtual town with landscaped event spaces.",
    },
    {
      name: "Dionysius View",
      description:
        "A signature residential community carrying the state's name.",
    },
    {
      name: "Community Stage",
      description:
        "A gathering town for future performances and meetings.",
    },
    {
      name: "Moon Jubilee",
      description:
        "A joyful destination celebrating lunar ownership and exploration.",
    },
  ],
},
"Mar Serenitatis": {
  nickname: "The Sea of Serenity",
  description:
    "Mar Serenitatis is an elegant Orbital One lunar state inspired by calm landscapes, refined communities, and premium lunar living. Its cities and towns emphasize serenity, beauty, hospitality, and peaceful residential experiences.",
  highlights: [
    "Serenity and premium-living identity",
    "Three elegant lunar cities",
    "Twenty peaceful communities",
    "Strong residential and gift appeal",
    "Refined scenic atmosphere",
  ],
  searchAliases: [
    "Sea of Serenity",
    "Mar Serenitatis State",
    "Serenitatis State",
    "Serenity Lunar Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Serenity City",
      description:
        "The capital of Mar Serenitatis and an elegant center for peaceful lunar living, hospitality, and premium virtual communities.",
      featured: true,
    },
    {
      name: "Harmony City",
      description:
        "A welcoming city inspired by balance, friendship, and thoughtfully designed lunar neighborhoods.",
    },
    {
      name: "Celestial City",
      description:
        "A refined residential city celebrating beauty, the stars, and the Moon's serene landscape.",
    },
  ],

  towns: [
    {
      name: "Serenity Point",
      description:
        "A featured premium township designed around peace, comfort, and scenic lunar living.",
      featured: true,
    },
    {
      name: "Harmony Harbor",
      description:
        "A welcoming community centered on friendship, cooperation, and belonging.",
    },
    {
      name: "Serene Ridge",
      description:
        "An elevated residential town with calm views across the lunar landscape.",
    },
    {
      name: "Celestial Gardens",
      description:
        "A future virtual community envisioned with elegant homes and landscaped gardens.",
    },
    {
      name: "Peaceful Horizon",
      description:
        "A quiet township offering broad and relaxing lunar views.",
    },
    {
      name: "Serenitatis View",
      description:
        "A signature residential community carrying the state's prestigious identity.",
    },
    {
      name: "Tranquil Harbor",
      description:
        "A comfortable gathering community for future residents and visitors.",
    },
    {
      name: "Silver Serenity",
      description:
        "An elegant settlement inspired by the Moon's bright and peaceful terrain.",
    },
    {
      name: "Harmony Ridge",
      description:
        "A scenic community emphasizing balance and thoughtful development.",
    },
    {
      name: "Moonlight Haven",
      description:
        "A peaceful residential town inspired by quiet lunar evenings.",
    },
    {
      name: "Serene Crossing",
      description:
        "A calm travel-oriented community along an imagined lunar route.",
    },
    {
      name: "Celestial Point",
      description:
        "A refined township celebrating the Moon's place among the stars.",
    },
    {
      name: "Peace Harbor",
      description:
        "A welcoming residential settlement representing safety and comfort.",
    },
    {
      name: "Serenity Gardens",
      description:
        "A future virtual neighborhood envisioned with peaceful landscaped spaces.",
    },
    {
      name: "Quiet Crescent",
      description:
        "An elegant community inspired by lunar curves and tranquility.",
    },
    {
      name: "Harmony View",
      description:
        "A premium township offering scenic views and a community-centered identity.",
    },
    {
      name: "Calm Horizon",
      description:
        "A peaceful settlement designed around open space and relaxation.",
    },
    {
      name: "Serene Heights",
      description:
        "An elevated premium residential community within Mar Serenitatis.",
    },
    {
      name: "Celestial Harbor",
      description:
        "A welcoming destination for future virtual travelers and residents.",
    },
    {
      name: "Still Moon",
      description:
        "A quiet township representing calm, permanence, and lunar beauty.",
    },
  ],
},

"Macrobius": {
  nickname: "The Timekeeper State",
  description:
    "Macrobius is an Orbital One lunar state inspired by timekeeping, calendars, astronomy, and the measured cycles of the heavens. Its communities celebrate observatories, clocks, seasons, and humanity's effort to understand time.",
  highlights: [
    "Timekeeping and astronomy identity",
    "Three calendar-themed cities",
    "Twenty named communities",
    "Strong science and observation appeal",
    "Distinctive celestial-cycle theme",
  ],
  searchAliases: [
    "Timekeeper State",
    "Macrobius State",
    "Lunar Calendar Region",
    "Celestial Time State",
  ],
  launchReady: false,

  cities: [
    {
      name: "Timekeeper City",
      description:
        "The capital of Macrobius and a central destination for astronomy, calendars, and the measurement of celestial time.",
      featured: true,
    },
    {
      name: "Calendar City",
      description:
        "A scholarly city inspired by lunar cycles, seasons, and organized time.",
    },
    {
      name: "Chronos City",
      description:
        "A futuristic city celebrating precision clocks, history, and the passage of time.",
    },
  ],

  towns: [
    {
      name: "Meridian Clock",
      description:
        "A featured township inspired by precise celestial timekeeping.",
      featured: true,
    },
    {
      name: "Lunar Calendar",
      description:
        "A community celebrating the cycles and phases of the Moon.",
    },
    {
      name: "Chronometer Point",
      description:
        "A precision-themed town honoring accurate time measurement.",
    },
    {
      name: "Solstice Ridge",
      description:
        "An elevated settlement inspired by seasonal astronomical events.",
    },
    {
      name: "Equinox Harbor",
      description:
        "A balanced community named for equal periods of day and night.",
    },
    {
      name: "Macrobius Time",
      description:
        "A signature township carrying the state's timekeeping identity.",
    },
    {
      name: "Hourglass Point",
      description:
        "A symbolic community representing the passage of time.",
    },
    {
      name: "Moonphase",
      description:
        "A residential town inspired by the changing appearance of the Moon.",
    },
    {
      name: "Calendar Ridge",
      description:
        "A scholarly settlement celebrating dates, cycles, and planning.",
    },
    {
      name: "Celestial Clock",
      description:
        "A technology-themed community inspired by astronomical movement.",
    },
    {
      name: "Epoch",
      description:
        "A distinctive township representing important periods in history.",
    },
    {
      name: "Orbit Time",
      description:
        "A science community connecting orbital motion with time measurement.",
    },
    {
      name: "Season Point",
      description:
        "A town inspired by recurring cycles and celestial patterns.",
    },
    {
      name: "Astronomer's Hour",
      description:
        "A quiet observation community honoring astronomical study.",
    },
    {
      name: "Timeless Ridge",
      description:
        "A scenic residential settlement representing permanence and legacy.",
    },
    {
      name: "Second Station",
      description:
        "A precision-themed township named for the fundamental unit of time.",
    },
    {
      name: "Century Harbor",
      description:
        "A community celebrating history and long-term lunar development.",
    },
    {
      name: "Cycle View",
      description:
        "A scenic town inspired by repeating celestial motion.",
    },
    {
      name: "Clockwork Crossing",
      description:
        "A future travel community organized around precision and timing.",
    },
    {
      name: "Tomorrow Point",
      description:
        "A forward-looking settlement representing the future of lunar life.",
    },
  ],
},

"Cleomedes": {
  nickname: "The Wisdom State",
  description:
    "Cleomedes is an Orbital One lunar state inspired by philosophy, reason, ethics, and the pursuit of wisdom. Its cities and towns celebrate thoughtful communities, discussion, learning, and responsible lunar citizenship.",
  highlights: [
    "Philosophy and wisdom identity",
    "Three knowledge-centered cities",
    "Twenty thoughtful communities",
    "Strong education and civic appeal",
    "Reflection and reason theme",
  ],
  searchAliases: [
    "Wisdom State",
    "Cleomedes State",
    "Philosophy State",
    "Lunar Wisdom Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Wisdom City",
      description:
        "The capital of Cleomedes and a distinguished center for philosophy, reason, learning, and responsible lunar community life.",
      featured: true,
    },
    {
      name: "Reason City",
      description:
        "A thoughtful city inspired by logic, science, and careful decision-making.",
    },
    {
      name: "Philosopher City",
      description:
        "A scholarly city celebrating ideas, discussion, and humanity's search for understanding.",
    },
  ],

  towns: [
    {
      name: "Wisdom Point",
      description:
        "A featured township centered on thoughtful living and lifelong learning.",
      featured: true,
    },
    {
      name: "Reason Ridge",
      description:
        "An elevated community celebrating logic and careful judgment.",
    },
    {
      name: "Socratic Harbor",
      description:
        "A welcoming town inspired by questions, discussion, and discovery.",
    },
    {
      name: "Ethics Point",
      description:
        "A community focused on fairness, responsibility, and trust.",
    },
    {
      name: "Philosopher's Rest",
      description:
        "A peaceful settlement for contemplation and reflection.",
    },
    {
      name: "Cleomedes Hall",
      description:
        "A signature gathering community carrying the state's scholarly identity.",
    },
    {
      name: "Logic Ridge",
      description:
        "A precision-oriented town inspired by reason and structure.",
    },
    {
      name: "Dialogue",
      description:
        "A community designed around conversation and shared understanding.",
    },
    {
      name: "Insight Point",
      description:
        "A scenic settlement celebrating discovery and deeper understanding.",
    },
    {
      name: "Knowledge Harbor",
      description:
        "A welcoming scholarly community for future learners and residents.",
    },
    {
      name: "Reflection Ridge",
      description:
        "A quiet elevated town suited to contemplation and peaceful living.",
    },
    {
      name: "Truth",
      description:
        "A symbolic township representing honesty and clear understanding.",
    },
    {
      name: "Scholar's Crossing",
      description:
        "A future travel and learning community connecting Cleomedes destinations.",
    },
    {
      name: "Reasoned View",
      description:
        "A residential settlement centered on perspective and thoughtful planning.",
    },
    {
      name: "Virtue Point",
      description:
        "A community celebrating positive character and responsible citizenship.",
    },
    {
      name: "The Forum",
      description:
        "A future virtual gathering place for discussion and community events.",
    },
    {
      name: "Thought Harbor",
      description:
        "A peaceful town designed around reflection and creativity.",
    },
    {
      name: "Understanding",
      description:
        "A welcoming community representing empathy and shared knowledge.",
    },
    {
      name: "Wisdom Heights",
      description:
        "An elevated premium settlement within the Wisdom State.",
    },
    {
      name: "Questions Point",
      description:
        "A curious township honoring inquiry and exploration.",
    },
  ],
},

"Hevelius": {
  nickname: "The Observatory State",
  description:
    "Hevelius is an Orbital One lunar state inspired by telescopes, observatories, star charts, and detailed astronomical study. Its cities and towns celebrate the people and instruments that expanded humanity's view of the universe.",
  highlights: [
    "Astronomy and telescope identity",
    "Three observatory-centered cities",
    "Twenty named communities",
    "Strong educational and attraction appeal",
    "Deep-sky observation theme",
  ],
  searchAliases: [
    "Observatory State",
    "Hevelius State",
    "Telescope State",
    "Lunar Astronomy Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Observatory City",
      description:
        "The capital of Hevelius and a major center for telescopes, astronomy, and future virtual observation experiences.",
      featured: true,
    },
    {
      name: "Telescope City",
      description:
        "A science-focused city honoring instruments that revealed distant worlds.",
    },
    {
      name: "Star Chart City",
      description:
        "A scholarly city inspired by detailed astronomical maps and celestial navigation.",
    },
  ],

  towns: [
    {
      name: "Great Telescope",
      description:
        "A featured township inspired by the instruments used to study the universe.",
      featured: true,
    },
    {
      name: "Observatory Ridge",
      description:
        "An elevated town designed around clear views and astronomical study.",
    },
    {
      name: "Star Chart Point",
      description:
        "A mapping community inspired by detailed celestial charts.",
    },
    {
      name: "Deep Sky Harbor",
      description:
        "A welcoming settlement celebrating distant stars and galaxies.",
    },
    {
      name: "Hevelius View",
      description:
        "A signature residential town carrying the state's astronomy identity.",
    },
    {
      name: "Lens Point",
      description:
        "A technology community inspired by optics and telescope design.",
    },
    {
      name: "Night Watch",
      description:
        "An observation township focused on the lunar sky.",
    },
    {
      name: "Astronomer's Ridge",
      description:
        "A scenic settlement honoring generations of sky watchers.",
    },
    {
      name: "Celestial Atlas",
      description:
        "A scholarly town connecting astronomy with mapping.",
    },
    {
      name: "Moon Scope",
      description:
        "A community inspired by close observation of lunar terrain.",
    },
    {
      name: "Starfield Station",
      description:
        "A future virtual destination for astronomy experiences.",
    },
    {
      name: "Optics Harbor",
      description:
        "A technology town celebrating lenses, mirrors, and scientific instruments.",
    },
    {
      name: "Constellation Point",
      description:
        "A residential community named for patterns in the night sky.",
    },
    {
      name: "Northern Lens",
      description:
        "A scenic astronomy-themed settlement.",
    },
    {
      name: "Sky Survey",
      description:
        "A research community dedicated to mapping the heavens.",
    },
    {
      name: "Observatory Gardens",
      description:
        "A future virtual neighborhood combining landscaped spaces and astronomy.",
    },
    {
      name: "Stargazer Harbor",
      description:
        "A welcoming community for residents who love the night sky.",
    },
    {
      name: "Hevelius Station",
      description:
        "A central gathering and research hub within the state.",
    },
    {
      name: "Far Light",
      description:
        "A township inspired by light traveling across vast distances.",
    },
    {
      name: "Cosmic View",
      description:
        "A premium settlement offering a strong deep-space identity.",
    },
  ],
},

"Kepler": {
  nickname: "The Orbital State",
  description:
    "Kepler is an Orbital One lunar state inspired by orbital mechanics, scientific discovery, mathematics, and innovation. Its cities and towns celebrate the laws of planetary motion and humanity's ability to understand the paths of worlds.",
  highlights: [
    "Orbital science and innovation identity",
    "Three technology-centered cities",
    "Twenty named communities",
    "Strong educational and engineering appeal",
    "Planetary-motion theme",
  ],
  searchAliases: [
    "Orbital State",
    "Kepler State",
    "Orbital Mechanics State",
    "Planetary Motion Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Orbit City",
      description:
        "The capital of Kepler and a major center for orbital science, mathematics, engineering, and future lunar technology.",
      featured: true,
    },
    {
      name: "Ellipse City",
      description:
        "A science-focused city inspired by the elliptical paths of planets and spacecraft.",
    },
    {
      name: "Kepler City",
      description:
        "A distinguished city honoring Johannes Kepler and the laws of planetary motion.",
    },
  ],

  towns: [
    {
      name: "Orbital Point",
      description:
        "A featured township inspired by the paths of planets, moons, and spacecraft.",
      featured: true,
    },
    {
      name: "Ellipse Ridge",
      description:
        "An elevated community inspired by curved orbital paths.",
    },
    {
      name: "Planetary Harbor",
      description:
        "A welcoming settlement celebrating worlds throughout the solar system.",
    },
    {
      name: "Kepler Station",
      description:
        "A signature research and transportation hub within the state.",
    },
    {
      name: "First Law",
      description:
        "A science-themed township honoring Kepler's first law of planetary motion.",
    },
    {
      name: "Second Law",
      description:
        "A community inspired by the relationship between motion and orbital area.",
    },
    {
      name: "Third Law",
      description:
        "A scholarly town celebrating the mathematical harmony of planetary periods.",
    },
    {
      name: "Orbit Ridge",
      description:
        "A scenic residential community with a strong spaceflight identity.",
    },
    {
      name: "Transit Point",
      description:
        "A transportation town inspired by planetary and spacecraft movement.",
    },
    {
      name: "Aphelion",
      description:
        "A distinctive township named for the farthest point in an orbit.",
    },
    {
      name: "Perihelion",
      description:
        "A companion community named for the closest point to the Sun.",
    },
    {
      name: "Motion Harbor",
      description:
        "A welcoming settlement celebrating movement and exploration.",
    },
    {
      name: "Orbital Mechanics",
      description:
        "A technology-focused community centered on spaceflight science.",
    },
    {
      name: "Kepler View",
      description:
        "A premium residential township carrying the state's scientific identity.",
    },
    {
      name: "Planet Path",
      description:
        "A future travel community inspired by orbital routes.",
    },
    {
      name: "Celestial Motion",
      description:
        "A scholarly settlement celebrating the movement of worlds.",
    },
    {
      name: "Ellipse Harbor",
      description:
        "A residential community with a graceful scientific theme.",
    },
    {
      name: "Gravity Point",
      description:
        "A physics-inspired town connected to orbital motion.",
    },
    {
      name: "Star Orbit",
      description:
        "A community representing planets moving around distant stars.",
    },
    {
      name: "Discovery Trajectory",
      description:
        "A forward-looking settlement honoring science and exploration.",
    },
  ],
},
"Plato": {
  nickname: "The Academy Highlands",
  description:
    "Plato is an Orbital One lunar state inspired by philosophy, education, great ideas, and the pursuit of higher understanding. Its cities and towns celebrate academies, discussion, literature, and thoughtful lunar community life.",
  highlights: [
    "Education and philosophy identity",
    "Three academy-centered cities",
    "Twenty named communities",
    "Strong educational appeal",
    "Knowledge and discussion theme",
  ],
  searchAliases: [
    "Academy Highlands",
    "Plato State",
    "Plato Academy",
    "Lunar Philosophy Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Academy City",
      description:
        "The capital of Plato and a distinguished center for education, philosophy, literature, and future virtual learning.",
      featured: true,
    },
    {
      name: "Dialogue City",
      description:
        "A thoughtful city inspired by discussion, debate, and shared understanding.",
    },
    {
      name: "Republic City",
      description:
        "A civic and scholarly city celebrating ideas about leadership, society, and community.",
    },
  ],

  towns: [
    {
      name: "Academy Point",
      description:
        "A featured township inspired by learning, scholarship, and higher education.",
      featured: true,
    },
    {
      name: "Philosopher's Ridge",
      description:
        "An elevated community centered on reflection and thoughtful living.",
    },
    {
      name: "Dialogue Harbor",
      description:
        "A welcoming settlement designed around conversation and shared ideas.",
    },
    {
      name: "Republic Point",
      description:
        "A civic-minded community inspired by society and responsible citizenship.",
    },
    {
      name: "Wisdom Garden",
      description:
        "A future virtual neighborhood combining learning and landscaped spaces.",
    },
    {
      name: "Plato View",
      description:
        "A signature residential town carrying the state's philosophical identity.",
    },
    {
      name: "Scholar Harbor",
      description:
        "A welcoming community for learners, teachers, and future residents.",
    },
    {
      name: "The Symposium",
      description:
        "A gathering town envisioned for discussion, events, and community exchange.",
    },
    {
      name: "Reason Point",
      description:
        "A settlement celebrating logic and careful decision-making.",
    },
    {
      name: "Academy Ridge",
      description:
        "An elevated residential community with a strong educational identity.",
    },
    {
      name: "Knowledge Crossing",
      description:
        "A future travel community connecting Plato's learning destinations.",
    },
    {
      name: "The Republic",
      description:
        "A symbolic township inspired by civic philosophy and ideal communities.",
    },
    {
      name: "Learning Harbor",
      description:
        "A welcoming town dedicated to education and discovery.",
    },
    {
      name: "Thought Ridge",
      description:
        "A quiet elevated settlement designed for reflection.",
    },
    {
      name: "Plato Academy",
      description:
        "A signature scholarly community carrying the state's name.",
    },
    {
      name: "Idea Point",
      description:
        "A creative township celebrating imagination and new thinking.",
    },
    {
      name: "Truth Harbor",
      description:
        "A community representing honesty, knowledge, and understanding.",
    },
    {
      name: "Logic Gardens",
      description:
        "A future virtual residential area combining order and design.",
    },
    {
      name: "Scholar's View",
      description:
        "A premium community with broad scenic and intellectual appeal.",
    },
    {
      name: "Great Questions",
      description:
        "A curious settlement honoring inquiry and exploration.",
    },
  ],
},

"Aristoteles": {
  nickname: "The Natural Philosophy State",
  description:
    "Aristoteles is an Orbital One lunar state inspired by science, observation, nature, logic, and leadership. Its cities and towns celebrate systematic study, careful reasoning, and humanity's effort to understand the natural world.",
  highlights: [
    "Science and natural-philosophy identity",
    "Three research-centered cities",
    "Twenty named communities",
    "Strong education and leadership appeal",
    "Observation and logic theme",
  ],
  searchAliases: [
    "Natural Philosophy State",
    "Aristoteles State",
    "Aristotle State",
    "Lunar Science Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Natural Science City",
      description:
        "The capital of Aristoteles and a major center for observation, science, logic, and the study of the natural world.",
      featured: true,
    },
    {
      name: "Lyceum City",
      description:
        "A scholarly city inspired by learning, teaching, and systematic inquiry.",
    },
    {
      name: "Logic City",
      description:
        "A carefully planned city celebrating reason, structure, and scientific thought.",
    },
  ],

  towns: [
    {
      name: "Lyceum Point",
      description:
        "A featured township inspired by teaching, study, and intellectual life.",
      featured: true,
    },
    {
      name: "Logic Ridge",
      description:
        "An elevated community celebrating reason and careful analysis.",
    },
    {
      name: "Natural Harbor",
      description:
        "A welcoming settlement inspired by observation of the natural world.",
    },
    {
      name: "Aristoteles View",
      description:
        "A signature community carrying the state's scientific identity.",
    },
    {
      name: "Observation Point",
      description:
        "A research-focused town centered on detailed study and discovery.",
    },
    {
      name: "Reason Crossing",
      description:
        "A future travel community connecting science and civic life.",
    },
    {
      name: "Lyceum Harbor",
      description:
        "A scholarly residential settlement for students and teachers.",
    },
    {
      name: "Natural Order",
      description:
        "A township representing structure and patterns in the universe.",
    },
    {
      name: "Science Ridge",
      description:
        "An elevated community designed around research and exploration.",
    },
    {
      name: "Logic Harbor",
      description:
        "A welcoming town celebrating clarity and dependable reasoning.",
    },
    {
      name: "Aristotle Point",
      description:
        "A commemorative settlement honoring classical science and philosophy.",
    },
    {
      name: "Evidence Ridge",
      description:
        "A research community focused on observation and proof.",
    },
    {
      name: "Inquiry",
      description:
        "A curious township dedicated to asking questions and finding answers.",
    },
    {
      name: "Natural View",
      description:
        "A scenic residential town inspired by the lunar environment.",
    },
    {
      name: "Method Harbor",
      description:
        "A community celebrating organized scientific investigation.",
    },
    {
      name: "Lyceum Gardens",
      description:
        "A future virtual neighborhood combining education and landscaped spaces.",
    },
    {
      name: "Reasoned Horizon",
      description:
        "A scenic settlement representing perspective and thoughtful planning.",
    },
    {
      name: "Science Crossing",
      description:
        "A future travel hub connecting research communities.",
    },
    {
      name: "Knowledge Point",
      description:
        "A residential town centered on learning and shared understanding.",
    },
    {
      name: "Natural Philosophy",
      description:
        "A signature township honoring the state's central theme.",
    },
  ],
},

"Rumker": {
  nickname: "The Volcanic Dome State",
  description:
    "Rumker is an Orbital One lunar state inspired by volcanic domes, geology, hidden forces, and the dramatic shaping of the lunar surface. Its cities and towns celebrate exploration, geological science, elevated terrain, and bold discovery.",
  highlights: [
    "Volcanic and geological identity",
    "Three terrain-focused cities",
    "Twenty named communities",
    "Strong exploration appeal",
    "Distinctive dome and highland theme",
  ],
  searchAliases: [
    "Volcanic Dome State",
    "Rumker State",
    "Rumker Highlands",
    "Lunar Volcano Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Dome City",
      description:
        "The capital of Rumker and a dramatic center inspired by lunar volcanic domes, geology, and future exploration.",
      featured: true,
    },
    {
      name: "Volcanic City",
      description:
        "A bold city celebrating the hidden forces that shaped the lunar surface.",
    },
    {
      name: "Geology City",
      description:
        "A science-focused city centered on rocks, terrain, and planetary history.",
    },
  ],

  towns: [
    {
      name: "Rumker Dome",
      description:
        "A featured township inspired by the state's famous volcanic-dome identity.",
      featured: true,
    },
    {
      name: "Lava Ridge",
      description:
        "An elevated community inspired by ancient volcanic activity.",
    },
    {
      name: "Geology Point",
      description:
        "A science-centered settlement devoted to lunar terrain and rocks.",
    },
    {
      name: "Dome Harbor",
      description:
        "A welcoming residential town carrying Rumker's geological identity.",
    },
    {
      name: "Volcanic View",
      description:
        "A scenic township overlooking dramatic dome-like terrain.",
    },
    {
      name: "Magma Point",
      description:
        "A bold community inspired by molten rock and planetary formation.",
    },
    {
      name: "Rumker Ridge",
      description:
        "An elevated signature settlement within the state.",
    },
    {
      name: "Lava Crossing",
      description:
        "A travel-oriented community inspired by ancient flow paths.",
    },
    {
      name: "Stone Harbor",
      description:
        "A dependable residential town celebrating geological strength.",
    },
    {
      name: "Crust Point",
      description:
        "A science-themed community named for the Moon's outer layer.",
    },
    {
      name: "Dome Gardens",
      description:
        "A future virtual neighborhood designed around elevated terrain.",
    },
    {
      name: "Volcano Ridge",
      description:
        "A rugged residential settlement with a dramatic identity.",
    },
    {
      name: "Mineral Harbor",
      description:
        "A geology-focused town inspired by lunar minerals and resources.",
    },
    {
      name: "Basalt Point",
      description:
        "A community celebrating one of the Moon's most important rock types.",
    },
    {
      name: "Rumker Station",
      description:
        "A central research and gathering hub for geological exploration.",
    },
    {
      name: "Ancient Flow",
      description:
        "A township inspired by the Moon's volcanic past.",
    },
    {
      name: "Geology Ridge",
      description:
        "An elevated science community overlooking varied terrain.",
    },
    {
      name: "Dome View",
      description:
        "A premium settlement offering a strong connection to the state's landscape.",
    },
    {
      name: "Rockfield",
      description:
        "A broad residential community inspired by lunar geology.",
    },
    {
      name: "Hidden Fire",
      description:
        "A distinctive township representing the Moon's ancient internal forces.",
    },
  ],
},

"Sinus Iridum": {
  nickname: "The Bay of Rainbows",
  description:
    "Sinus Iridum is an Orbital One lunar state inspired by beauty, color, luxury, tourism, and one of the Moon's most celebrated scenic regions. Its cities and towns emphasize elegant living, memorable views, and premium visitor experiences.",
  highlights: [
    "Luxury and scenic-tourism identity",
    "Three premium lunar cities",
    "Twenty named communities",
    "Strong gift and collector appeal",
    "Distinctive Bay of Rainbows theme",
  ],
  searchAliases: [
    "Bay of Rainbows",
    "Sinus Iridum State",
    "Rainbow Bay",
    "Lunar Rainbow Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Rainbow City",
      description:
        "The capital of Sinus Iridum and a premium destination inspired by beauty, color, tourism, and elegant lunar living.",
      featured: true,
    },
    {
      name: "Iridum City",
      description:
        "A refined city celebrating the state's famous bay and scenic identity.",
    },
    {
      name: "Prism City",
      description:
        "A colorful futuristic city inspired by light, design, and luxury.",
    },
  ],

  towns: [
    {
      name: "Rainbow Point",
      description:
        "A featured premium township inspired by the beauty of the Bay of Rainbows.",
      featured: true,
    },
    {
      name: "Prism Ridge",
      description:
        "An elevated community celebrating light, color, and elegant design.",
    },
    {
      name: "Iridum Harbor",
      description:
        "A welcoming signature settlement carrying the state's famous name.",
    },
    {
      name: "Silver Rainbow",
      description:
        "An elegant residential town inspired by lunar light and color.",
    },
    {
      name: "Bay View",
      description:
        "A scenic premium community overlooking the region's graceful terrain.",
    },
    {
      name: "Rainbow Harbor",
      description:
        "A welcoming tourism and residential destination.",
    },
    {
      name: "Prism Point",
      description:
        "A modern township inspired by light splitting into color.",
    },
    {
      name: "Iridum View",
      description:
        "A signature premium settlement connected to the Bay of Rainbows.",
    },
    {
      name: "Color Ridge",
      description:
        "An elevated town with a bright and artistic identity.",
    },
    {
      name: "Luxury Harbor",
      description:
        "A refined residential community designed for premium virtual living.",
    },
    {
      name: "Rainbow Gardens",
      description:
        "A future virtual neighborhood with colorful landscaped spaces.",
    },
    {
      name: "Moon Prism",
      description:
        "A distinctive settlement inspired by lunar light.",
    },
    {
      name: "Iridum Heights",
      description:
        "An elevated premium residential community.",
    },
    {
      name: "Scenic Crossing",
      description:
        "A future travel town connecting major tourism destinations.",
    },
    {
      name: "Bright Bay",
      description:
        "A welcoming community reflecting the state's scenic character.",
    },
    {
      name: "Aurora Point",
      description:
        "A colorful town inspired by light and wonder.",
    },
    {
      name: "Rainbow Crescent",
      description:
        "An elegant residential settlement with a graceful design theme.",
    },
    {
      name: "Tourist Harbor",
      description:
        "A future virtual destination for visitors and property owners.",
    },
    {
      name: "Prismatic View",
      description:
        "A premium township offering a colorful futuristic identity.",
    },
    {
      name: "Bay of Light",
      description:
        "A signature scenic community representing beauty and possibility.",
    },
  ],
},
"Cassini": {
  nickname: "The Explorer State",
  description:
    "Cassini is an Orbital One lunar state inspired by planetary exploration, spacecraft engineering, and humanity's quest to understand the outer Solar System. Its communities celebrate discovery, innovation, and scientific achievement.",
  highlights: [
    "Planetary exploration identity",
    "Three engineering-focused cities",
    "Twenty exploration communities",
    "Strong science and technology appeal",
    "Inspired by legendary space missions",
  ],
  searchAliases: [
    "Explorer State",
    "Cassini State",
    "Cassini Mission",
    "Planetary Exploration",
  ],
  launchReady: false,

  cities: [
    {
      name: "Explorer City",
      description:
        "The capital of Cassini and a center for planetary exploration, engineering, and future space innovation.",
      featured: true,
    },
    {
      name: "Mission City",
      description:
        "A technology-driven city celebrating spacecraft and scientific discovery.",
    },
    {
      name: "Titan City",
      description:
        "A city inspired by Saturn's largest moon and the discoveries of the Cassini mission.",
    },
  ],

  towns: [
    { name: "Explorer Point", description: "Featured community celebrating lunar exploration.", featured: true },
    { name: "Mission Ridge", description: "Engineering-inspired residential community." },
    { name: "Titan Harbor", description: "Named for Saturn's largest moon." },
    { name: "Cassini View", description: "Signature township carrying the state's identity." },
    { name: "Orbiter Point", description: "Celebrating robotic exploration." },
    { name: "Discovery Ridge", description: "Community inspired by scientific achievement." },
    { name: "Saturn Harbor", description: "Recognizing the Cassini mission destination." },
    { name: "Probe Station", description: "Technology-centered settlement." },
    { name: "Engineering Point", description: "Celebrating spacecraft engineering." },
    { name: "Innovation Harbor", description: "Future-focused residential community." },
    { name: "Explorer Ridge", description: "Scenic community for adventurers." },
    { name: "Trajectory", description: "Named after orbital flight paths." },
    { name: "Mission Crossing", description: "Travel community linking exploration districts." },
    { name: "Science Point", description: "Research-inspired township." },
    { name: "Outer Worlds", description: "Celebrating exploration beyond Earth." },
    { name: "Navigation Ridge", description: "Inspired by deep-space navigation." },
    { name: "Voyager Harbor", description: "Honoring robotic explorers." },
    { name: "Planet View", description: "Scenic astronomy community." },
    { name: "Ringwatch", description: "Inspired by Saturn's rings." },
    { name: "Discovery Station", description: "Future science and gathering hub." },
  ],
},

"Eudoxus": {
  nickname: "The Mathematics State",
  description:
    "Eudoxus celebrates mathematics, geometry, astronomy, and the elegant order found throughout the universe.",
  highlights: [
    "Mathematics identity",
    "Geometry-inspired cities",
    "Scientific excellence",
    "Educational appeal",
    "Precision planning",
  ],
  searchAliases: [
    "Mathematics State",
    "Eudoxus State",
    "Geometry State",
    "Mathematical Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Geometry City",
      description:
        "The capital of Eudoxus celebrating mathematics and scientific thought.",
      featured: true,
    },
    {
      name: "Vector City",
      description:
        "A city inspired by direction, engineering, and precision.",
    },
    {
      name: "Formula City",
      description:
        "A scholarly center honoring mathematics and discovery.",
    },
  ],

  towns: [
    { name: "Geometry Point", description: "Featured mathematics community.", featured: true },
    { name: "Vector Ridge", description: "Engineering-inspired township." },
    { name: "Equation Harbor", description: "Scientific residential settlement." },
    { name: "Formula Point", description: "Celebrating mathematical discovery." },
    { name: "Eudoxus View", description: "Signature community." },
    { name: "Proof Ridge", description: "Logic-centered township." },
    { name: "Radius", description: "Geometry-inspired town." },
    { name: "Circle Point", description: "Named for perfect geometry." },
    { name: "Compass Harbor", description: "Survey and mapping community." },
    { name: "Triangle Ridge", description: "Mathematics neighborhood." },
    { name: "Golden Ratio", description: "Inspired by classical mathematics." },
    { name: "Parallax", description: "Astronomy-themed settlement." },
    { name: "Theorem Point", description: "Scholarly community." },
    { name: "Coordinate", description: "Inspired by mapping systems." },
    { name: "Measure Harbor", description: "Precision residential district." },
    { name: "Arc Ridge", description: "Geometry community." },
    { name: "Compass Point", description: "Navigation-inspired township." },
    { name: "Scholar's Formula", description: "Learning-centered community." },
    { name: "Calculation Crossing", description: "Future science district." },
    { name: "Celestial Math", description: "Astronomy and mathematics combined." },
  ],
},

"Geminus": {
  nickname: "The Twin Peaks State",
  description:
    "Geminus celebrates partnership, cooperation, balance, and communities that thrive by working together.",
  highlights: [
    "Partnership identity",
    "Twin-city inspiration",
    "Community cooperation",
    "Balanced development",
    "Strong family appeal",
  ],
  searchAliases: [
    "Twin Peaks State",
    "Geminus State",
    "Twin State",
    "Partnership Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Twin City",
      description:
        "The capital of Geminus celebrating partnership and cooperation.",
      featured: true,
    },
    {
      name: "Unity City",
      description:
        "A welcoming city centered on collaboration and friendship.",
    },
    {
      name: "Harmony City",
      description:
        "A balanced community designed around cooperation.",
    },
  ],

  towns: [
    { name: "Twin Point", description: "Featured partnership community.", featured: true },
    { name: "Unity Ridge", description: "Community cooperation township." },
    { name: "Harmony Harbor", description: "Welcoming residential settlement." },
    { name: "Balance Point", description: "Inspired by stability." },
    { name: "Geminus View", description: "Signature township." },
    { name: "Together", description: "Community-centered neighborhood." },
    { name: "Twin Peaks", description: "Scenic elevated community." },
    { name: "Partner Ridge", description: "Celebrating teamwork." },
    { name: "Shared Horizon", description: "Residential settlement." },
    { name: "Companion Harbor", description: "Friendship-themed town." },
    { name: "Alliance Point", description: "Cooperation community." },
    { name: "Neighbor Ridge", description: "Welcoming township." },
    { name: "Family Harbor", description: "Residential community." },
    { name: "Twin Crossing", description: "Travel-oriented district." },
    { name: "Connection", description: "Celebrating community." },
    { name: "Together Point", description: "Shared future identity." },
    { name: "Bridge Harbor", description: "Connecting communities." },
    { name: "Friendly View", description: "Scenic neighborhood." },
    { name: "Common Ground", description: "Shared community values." },
    { name: "Unity Station", description: "Future gathering hub." },
  ],
},

"Seleucus": {
  nickname: "The Frontier State",
  description:
    "Seleucus represents distant horizons, pioneering exploration, and the adventurous spirit of discovering new frontiers on the Moon.",
  highlights: [
    "Frontier identity",
    "Explorer communities",
    "Western horizon theme",
    "Adventure appeal",
    "Future expansion",
  ],
  searchAliases: [
    "Frontier State",
    "Seleucus State",
    "Explorer Frontier",
    "Western Frontier",
  ],
  launchReady: false,

  cities: [
    {
      name: "Frontier City",
      description:
        "The capital of Seleucus celebrating exploration and new beginnings.",
      featured: true,
    },
    {
      name: "Pioneer City",
      description:
        "A bold city inspired by exploration and courage.",
    },
    {
      name: "Trailhead City",
      description:
        "The starting point for future lunar adventures.",
    },
  ],

  towns: [
    { name: "Frontier Point", description: "Featured explorer community.", featured: true },
    { name: "Pioneer Ridge", description: "Settlement inspired by exploration." },
    { name: "Trail Harbor", description: "Welcoming frontier community." },
    { name: "Seleucus View", description: "Signature township." },
    { name: "West Horizon", description: "Scenic frontier settlement." },
    { name: "Explorer Ridge", description: "Adventure-themed community." },
    { name: "Pathfinder Point", description: "Honoring pioneers." },
    { name: "Trail Crossing", description: "Travel-oriented town." },
    { name: "New Frontier", description: "Future expansion settlement." },
    { name: "Discovery Ridge", description: "Celebrating exploration." },
    { name: "Survey Harbor", description: "Mapping and discovery." },
    { name: "West Gate", description: "Gateway to new territory." },
    { name: "Prospector Point", description: "Adventure community." },
    { name: "Trail View", description: "Scenic township." },
    { name: "Pioneer Harbor", description: "Welcoming settlement." },
    { name: "Open Horizon", description: "Broad frontier views." },
    { name: "Explorer's Rest", description: "Peaceful residential town." },
    { name: "Journey Ridge", description: "Inspired by exploration." },
    { name: "Expansion Point", description: "Future growth community." },
    { name: "Frontier Station", description: "Central gathering hub." },
  ],
},
"Aristarchus": {
  nickname: "The Beacon Highlands",
  description:
    "Aristarchus is an Orbital One lunar state inspired by brilliant terrain, observation, geology, and one of the Moon's most visually striking regions. Its cities and towns celebrate light, discovery, exploration, and dramatic lunar scenery.",
  highlights: [
    "Bright highland identity",
    "Three observation-focused cities",
    "Twenty named communities",
    "Strong geology and scenic appeal",
    "Distinctive beacon and exploration theme",
  ],
  searchAliases: [
    "Beacon Highlands",
    "Aristarchus State",
    "Bright Highlands",
    "Lunar Beacon Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Beacon City",
      description:
        "The capital of Aristarchus and a brilliant center for observation, exploration, geology, and scenic lunar living.",
      featured: true,
    },
    {
      name: "Brightland City",
      description:
        "A striking city inspired by the luminous terrain associated with Aristarchus.",
    },
    {
      name: "Observation City",
      description:
        "A science-centered city designed around astronomy, geology, and detailed lunar study.",
    },
  ],

  towns: [
    {
      name: "Beacon Point",
      description:
        "A featured township inspired by the brilliant appearance of the Aristarchus region.",
      featured: true,
    },
    {
      name: "Bright Ridge",
      description:
        "An elevated residential community overlooking luminous lunar terrain.",
    },
    {
      name: "Aristarchus View",
      description:
        "A signature township carrying the state's famous identity.",
    },
    {
      name: "Luminous Harbor",
      description:
        "A welcoming settlement inspired by light and scenic beauty.",
    },
    {
      name: "Observation Ridge",
      description:
        "A science-focused community designed around lunar observation.",
    },
    {
      name: "Beacon Harbor",
      description:
        "A welcoming destination for future residents and explorers.",
    },
    {
      name: "Bright Horizon",
      description:
        "A scenic town offering broad views across the lunar surface.",
    },
    {
      name: "Geology Point",
      description:
        "A research community inspired by rocks, terrain, and lunar history.",
    },
    {
      name: "Aristarchus Station",
      description:
        "A central exploration and gathering hub within the state.",
    },
    {
      name: "Silver Beacon",
      description:
        "An elegant residential community with a luminous identity.",
    },
    {
      name: "Highland Watch",
      description:
        "A lookout settlement overlooking Aristarchus terrain.",
    },
    {
      name: "Bright Crossing",
      description:
        "A future travel community connecting major state destinations.",
    },
    {
      name: "Lightfield",
      description:
        "A broad residential township inspired by reflective lunar terrain.",
    },
    {
      name: "Explorer's Beacon",
      description:
        "A bold community honoring discovery and navigation.",
    },
    {
      name: "Radiant Ridge",
      description:
        "A premium elevated settlement offering dramatic views.",
    },
    {
      name: "Craterlight",
      description:
        "A scenic town inspired by sunlight across crater terrain.",
    },
    {
      name: "Discovery Harbor",
      description:
        "A welcoming community celebrating scientific exploration.",
    },
    {
      name: "Beacon Gardens",
      description:
        "A future virtual neighborhood combining scenic landscapes and lunar homes.",
    },
    {
      name: "Bright Summit",
      description:
        "An elevated premium community representing ambition and achievement.",
    },
    {
      name: "Lunar Lighthouse",
      description:
        "A distinctive township symbolizing guidance across the Moon.",
    },
  ],
},

"Timocharis": {
  nickname: "The Surveyor State",
  description:
    "Timocharis is an Orbital One lunar state inspired by surveying, precision mapping, observation, and organized development. Its cities and towns celebrate explorers who measure terrain, establish coordinates, and prepare new regions for settlement.",
  highlights: [
    "Surveying and mapping identity",
    "Three planning-focused cities",
    "Twenty named communities",
    "Strong property and navigation connection",
    "Precision-development theme",
  ],
  searchAliases: [
    "Surveyor State",
    "Timocharis State",
    "Lunar Survey Region",
    "Mapping and Development State",
  ],
  launchReady: false,

  cities: [
    {
      name: "Surveyor City",
      description:
        "The capital of Timocharis and a central hub for mapping, measurement, planning, and organized lunar development.",
      featured: true,
    },
    {
      name: "Coordinate City",
      description:
        "A precision-focused city inspired by lunar coordinates and exact location systems.",
    },
    {
      name: "Planner City",
      description:
        "A carefully organized city celebrating future communities, infrastructure, and land development.",
    },
  ],

  towns: [
    {
      name: "Survey Point",
      description:
        "A featured township honoring surveyors and lunar mapmakers.",
      featured: true,
    },
    {
      name: "Coordinate Ridge",
      description:
        "An elevated community inspired by precise lunar positioning.",
    },
    {
      name: "Timocharis Grid",
      description:
        "A signature township connected to the Orbital One parcel system.",
    },
    {
      name: "Planner's Harbor",
      description:
        "A welcoming settlement centered on thoughtful development.",
    },
    {
      name: "Boundary Point",
      description:
        "A community inspired by property lines and regional organization.",
    },
    {
      name: "Survey Ridge",
      description:
        "An elevated town designed around land measurement and observation.",
    },
    {
      name: "Mapline",
      description:
        "A modern settlement inspired by mapped routes and boundaries.",
    },
    {
      name: "Coordinate Harbor",
      description:
        "A navigation-centered residential community.",
    },
    {
      name: "Grid Point",
      description:
        "A carefully organized township connected to parcel planning.",
    },
    {
      name: "Timocharis View",
      description:
        "A signature residential town carrying the state's identity.",
    },
    {
      name: "Landmark Ridge",
      description:
        "A scenic settlement built around identifiable lunar features.",
    },
    {
      name: "Reference Harbor",
      description:
        "A dependable community representing accurate navigation.",
    },
    {
      name: "Parcel Point",
      description:
        "A property-themed township celebrating lunar ownership.",
    },
    {
      name: "Survey Crossing",
      description:
        "A future travel community linking mapped destinations.",
    },
    {
      name: "Measured Horizon",
      description:
        "A scenic town combining precision and broad lunar views.",
    },
    {
      name: "Planner Ridge",
      description:
        "An elevated community envisioned for orderly virtual development.",
    },
    {
      name: "Mapmaker's Rest",
      description:
        "A peaceful settlement honoring cartographers and survey teams.",
    },
    {
      name: "True North",
      description:
        "A navigation community representing dependable direction.",
    },
    {
      name: "Survey Gardens",
      description:
        "A future virtual neighborhood designed with organized landscapes.",
    },
    {
      name: "Atlas Station",
      description:
        "A central mapping and transportation hub within Timocharis.",
    },
  ],
},

"Montes Apenninus": {
  nickname: "The Grand Mountain State",
  description:
    "Montes Apenninus is an Orbital One lunar state inspired by towering mountains, dramatic ridges, exploration, and premium highland communities. Its cities and towns celebrate adventure, panoramic views, and some of the Moon's most impressive terrain.",
  highlights: [
    "Grand mountain identity",
    "Three highland cities",
    "Twenty named communities",
    "Strong scenic and adventure appeal",
    "Premium elevated-property theme",
  ],
  searchAliases: [
    "Grand Mountain State",
    "Montes Apenninus State",
    "Apennine Mountains",
    "Lunar Mountain Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Apennine City",
      description:
        "The capital of Montes Apenninus and a dramatic center for mountain exploration, premium views, and future highland communities.",
      featured: true,
    },
    {
      name: "Summit City",
      description:
        "An elevated city inspired by towering peaks and panoramic lunar scenery.",
    },
    {
      name: "Expedition City",
      description:
        "An adventure-focused city envisioned as the beginning of major lunar journeys.",
    },
  ],

  towns: [
    {
      name: "Apennine Summit",
      description:
        "A featured premium township inspired by the state's towering mountain terrain.",
      featured: true,
    },
    {
      name: "Mountain Ridge",
      description:
        "An elevated residential community offering dramatic lunar views.",
    },
    {
      name: "Summit Harbor",
      description:
        "A welcoming highland settlement for future residents and explorers.",
    },
    {
      name: "Apenninus View",
      description:
        "A signature township overlooking the Grand Mountain State.",
    },
    {
      name: "High Peak",
      description:
        "A bold premium community inspired by elevated terrain.",
    },
    {
      name: "Expedition Point",
      description:
        "An adventure town designed around exploration and travel.",
    },
    {
      name: "Mountain Watch",
      description:
        "A lookout community offering broad views across the lunar surface.",
    },
    {
      name: "Climber's Harbor",
      description:
        "A welcoming settlement honoring climbers and explorers.",
    },
    {
      name: "Alpine Ridge",
      description:
        "A scenic residential town inspired by mountain living.",
    },
    {
      name: "Summit Crossing",
      description:
        "A future travel community connecting elevated destinations.",
    },
    {
      name: "Apennine Base",
      description:
        "A central adventure hub serving the surrounding highlands.",
    },
    {
      name: "Peak View",
      description:
        "A premium residential community centered on scenic terrain.",
    },
    {
      name: "Highland Trail",
      description:
        "A travel-oriented township envisioned along a lunar exploration route.",
    },
    {
      name: "Mountain Gate",
      description:
        "A gateway settlement leading into the Apennine highlands.",
    },
    {
      name: "Rover Ridge",
      description:
        "A vehicle-themed community inspired by lunar exploration.",
    },
    {
      name: "Explorer Summit",
      description:
        "A bold settlement honoring discovery and achievement.",
    },
    {
      name: "Apennine Gardens",
      description:
        "A future virtual neighborhood combining mountain views and landscaping.",
    },
    {
      name: "Vista Peak",
      description:
        "A premium township offering panoramic lunar scenery.",
    },
    {
      name: "Expedition Harbor",
      description:
        "A welcoming gathering place for future adventurers.",
    },
    {
      name: "Grand Summit",
      description:
        "A distinguished community representing the height of lunar living.",
    },
  ],
},

"Reinhold": {
  nickname: "The Restoration State",
  description:
    "Reinhold is an Orbital One lunar state inspired by renewal, restoration, preservation, and rebuilding for the future. Its cities and towns celebrate craftsmanship, resilience, conservation, and the careful improvement of lunar communities.",
  highlights: [
    "Restoration and renewal identity",
    "Three rebuilding-focused cities",
    "Twenty named communities",
    "Strong preservation and craftsmanship appeal",
    "Resilience and future-development theme",
  ],
  searchAliases: [
    "Restoration State",
    "Reinhold State",
    "Renewal State",
    "Lunar Preservation Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Renewal City",
      description:
        "The capital of Reinhold and a center for restoration, resilient construction, preservation, and future community improvement.",
      featured: true,
    },
    {
      name: "Restoration City",
      description:
        "A carefully planned city devoted to rebuilding, conservation, and thoughtful design.",
    },
    {
      name: "Heritage City",
      description:
        "A city celebrating preservation, craftsmanship, and lasting lunar identity.",
    },
  ],

  towns: [
    {
      name: "Renewal Point",
      description:
        "A featured township representing fresh beginnings and future growth.",
      featured: true,
    },
    {
      name: "Restoration Ridge",
      description:
        "An elevated community focused on rebuilding and improvement.",
    },
    {
      name: "Reinhold Harbor",
      description:
        "A welcoming signature settlement carrying the state's identity.",
    },
    {
      name: "Preservation Point",
      description:
        "A community dedicated to protecting important lunar heritage.",
    },
    {
      name: "Rebuild Ridge",
      description:
        "A resilient settlement inspired by construction and renewal.",
    },
    {
      name: "Heritage Harbor",
      description:
        "A welcoming town celebrating history and lasting community traditions.",
    },
    {
      name: "Craftsman Point",
      description:
        "A township honoring careful workmanship and dependable building.",
    },
    {
      name: "Second Beginning",
      description:
        "A hopeful residential community representing new opportunities.",
    },
    {
      name: "Renewed Horizon",
      description:
        "A scenic town inspired by progress and positive change.",
    },
    {
      name: "Reinhold View",
      description:
        "A signature residential community overlooking the state's terrain.",
    },
    {
      name: "Conservation Ridge",
      description:
        "An elevated settlement focused on thoughtful use of lunar resources.",
    },
    {
      name: "Restored Harbor",
      description:
        "A comfortable community built around renewal and belonging.",
    },
    {
      name: "Legacy Point",
      description:
        "A township preserving the achievements of earlier generations.",
    },
    {
      name: "Reconstruction Station",
      description:
        "A technology hub inspired by rebuilding future lunar communities.",
    },
    {
      name: "Resilience",
      description:
        "A strong residential settlement representing endurance.",
    },
    {
      name: "Future Heritage",
      description:
        "A community connecting preservation with new development.",
    },
    {
      name: "Renewal Gardens",
      description:
        "A future virtual neighborhood combining restoration and landscaping.",
    },
    {
      name: "Craft Ridge",
      description:
        "An elevated town inspired by design, skill, and careful construction.",
    },
    {
      name: "Reinhold Crossing",
      description:
        "A future travel community connecting restored districts.",
    },
    {
      name: "New Foundation",
      description:
        "A forward-looking settlement representing strong beginnings.",
    },
  ],
},
"Eddington": {
  nickname: "The Cosmic Theory State",
  description:
    "Eddington is an Orbital One lunar state inspired by astrophysics, relativity, stellar science, and humanity's effort to understand the structure of the universe. Its cities and towns celebrate scientific theory, observation, light, gravity, and cosmic discovery.",
  highlights: [
    "Astrophysics and relativity identity",
    "Three science-centered cities",
    "Twenty named communities",
    "Strong educational appeal",
    "Light, gravity, and stellar-science theme",
  ],
  searchAliases: [
    "Cosmic Theory State",
    "Eddington State",
    "Astrophysics State",
    "Relativity Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Relativity City",
      description:
        "The capital of Eddington and a major center for astrophysics, gravity, stellar science, and the study of the universe.",
      featured: true,
    },
    {
      name: "Starlight City",
      description:
        "A science-focused city inspired by the light traveling from distant stars.",
    },
    {
      name: "Cosmic Theory City",
      description:
        "A scholarly city celebrating equations, models, and humanity's understanding of space.",
    },
  ],

  towns: [
    {
      name: "Relativity Point",
      description:
        "A featured township inspired by the relationship between space, time, gravity, and motion.",
      featured: true,
    },
    {
      name: "Starlight Ridge",
      description:
        "An elevated residential community celebrating light from distant stars.",
    },
    {
      name: "Eddington View",
      description:
        "A signature settlement carrying the state's scientific identity.",
    },
    {
      name: "Gravity Harbor",
      description:
        "A welcoming science-themed community inspired by gravitational forces.",
    },
    {
      name: "Cosmic Ridge",
      description:
        "A scenic township centered on astronomy and the wider universe.",
    },
    {
      name: "Photon Point",
      description:
        "A community named for particles of light.",
    },
    {
      name: "Stellar Harbor",
      description:
        "A welcoming settlement inspired by stars and stellar evolution.",
    },
    {
      name: "Theory Crossing",
      description:
        "A future travel and learning community connecting scientific destinations.",
    },
    {
      name: "Space-Time",
      description:
        "A distinctive township inspired by the connected fabric of space and time.",
    },
    {
      name: "Solar Eclipse",
      description:
        "An observation community honoring Eddington's famous eclipse work.",
    },
    {
      name: "Gravity Ridge",
      description:
        "An elevated science community inspired by the force shaping worlds.",
    },
    {
      name: "Cosmic Harbor",
      description:
        "A residential settlement celebrating the scale of the universe.",
    },
    {
      name: "Light Curve",
      description:
        "An astronomy town inspired by measuring changing stellar brightness.",
    },
    {
      name: "Star Theory",
      description:
        "A scholarly settlement focused on stellar structure and evolution.",
    },
    {
      name: "Eddington Station",
      description:
        "A central research and gathering hub within the state.",
    },
    {
      name: "Curved Light",
      description:
        "A township inspired by light bending through gravitational fields.",
    },
    {
      name: "Astrophysics Point",
      description:
        "A community centered on the physics of stars, galaxies, and space.",
    },
    {
      name: "Relativity Gardens",
      description:
        "A future virtual neighborhood combining scientific design and landscaping.",
    },
    {
      name: "Infinite Horizon",
      description:
        "A premium township inspired by the vastness of the cosmos.",
    },
    {
      name: "Cosmic Discovery",
      description:
        "A forward-looking settlement honoring scientific exploration.",
    },
  ],
},

"Delisic": {
  nickname: "The Artisan State",
  description:
    "Delisic is an Orbital One lunar state inspired by craftsmanship, design, decorative arts, and carefully built communities. Its cities and towns celebrate makers, artists, architects, and the beauty of creating something lasting on the Moon.",
  highlights: [
    "Artisan and craftsmanship identity",
    "Three design-centered cities",
    "Twenty named communities",
    "Strong virtual-building appeal",
    "Architecture and creative-work theme",
  ],
  searchAliases: [
    "Artisan State",
    "Delisic State",
    "Craftsmanship State",
    "Lunar Design Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Artisan City",
      description:
        "The capital of Delisic and a creative center for craftsmanship, design, architecture, and future virtual building.",
      featured: true,
    },
    {
      name: "Makers City",
      description:
        "A hands-on city celebrating builders, inventors, artists, and creators.",
    },
    {
      name: "Design City",
      description:
        "A refined city inspired by architecture, planning, and beautiful lunar communities.",
    },
  ],

  towns: [
    {
      name: "Artisan Point",
      description:
        "A featured township honoring creators, builders, and skilled craftspeople.",
      featured: true,
    },
    {
      name: "Makers Ridge",
      description:
        "An elevated community celebrating hands-on creation and innovation.",
    },
    {
      name: "Delisic View",
      description:
        "A signature residential town carrying the state's creative identity.",
    },
    {
      name: "Design Harbor",
      description:
        "A welcoming community centered on architecture and thoughtful planning.",
    },
    {
      name: "Craft Point",
      description:
        "A township honoring careful workmanship and quality design.",
    },
    {
      name: "Studio Ridge",
      description:
        "An elevated creative community envisioned for future virtual studios.",
    },
    {
      name: "Builder's Harbor",
      description:
        "A welcoming settlement for makers and future lunar homeowners.",
    },
    {
      name: "Creative Crossing",
      description:
        "A travel and gathering community connecting artistic districts.",
    },
    {
      name: "Sculptor Point",
      description:
        "A town inspired by form, structure, and artistic expression.",
    },
    {
      name: "Architect Ridge",
      description:
        "A premium residential settlement celebrating futuristic lunar design.",
    },
    {
      name: "Workshop Harbor",
      description:
        "A practical community envisioned around building and fabrication.",
    },
    {
      name: "Mooncraft",
      description:
        "A signature township combining lunar living with craftsmanship.",
    },
    {
      name: "Design Point",
      description:
        "A carefully planned town focused on beauty and function.",
    },
    {
      name: "Artisan Gardens",
      description:
        "A future virtual neighborhood combining crafted homes and landscaped spaces.",
    },
    {
      name: "Makers Harbor",
      description:
        "A welcoming creative settlement for builders and inventors.",
    },
    {
      name: "Gallery Ridge",
      description:
        "An elevated community envisioned for art and design exhibitions.",
    },
    {
      name: "Crafted Horizon",
      description:
        "A scenic township celebrating carefully designed lunar living.",
    },
    {
      name: "Delisic Station",
      description:
        "A central commerce and gathering hub for the Artisan State.",
    },
    {
      name: "Masterwork Point",
      description:
        "A premium community representing exceptional craftsmanship.",
    },
    {
      name: "Creative Legacy",
      description:
        "A settlement honoring lasting works of art, design, and construction.",
    },
  ],
},

"Heis": {
  nickname: "The Quiet Sky State",
  description:
    "Heis is an Orbital One lunar state inspired by peaceful observation, quiet horizons, subtle beauty, and calm residential communities. Its cities and towns emphasize relaxation, astronomy, privacy, and comfortable lunar living.",
  highlights: [
    "Quiet-sky and peaceful-living identity",
    "Three calm residential cities",
    "Twenty named communities",
    "Strong privacy and scenic appeal",
    "Observation and relaxation theme",
  ],
  searchAliases: [
    "Quiet Sky State",
    "Heis State",
    "Peaceful Lunar State",
    "Quiet Horizon Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Quiet Sky City",
      description:
        "The capital of Heis and a peaceful center for astronomy, comfortable lunar living, and quiet residential communities.",
      featured: true,
    },
    {
      name: "Stillness City",
      description:
        "A calm city designed around privacy, reflection, and restful lunar living.",
    },
    {
      name: "Nightview City",
      description:
        "A scenic residential city inspired by uninterrupted views of the stars.",
    },
  ],

  towns: [
    {
      name: "Quiet Sky Point",
      description:
        "A featured peaceful township offering a calm lunar identity.",
      featured: true,
    },
    {
      name: "Still Ridge",
      description:
        "An elevated community designed around quiet living and scenic views.",
    },
    {
      name: "Heis View",
      description:
        "A signature township overlooking the Quiet Sky State.",
    },
    {
      name: "Peace Harbor",
      description:
        "A welcoming residential settlement centered on comfort and belonging.",
    },
    {
      name: "Nightwatch",
      description:
        "An observation community inspired by the clear lunar sky.",
    },
    {
      name: "Silent Horizon",
      description:
        "A scenic town offering broad and peaceful lunar views.",
    },
    {
      name: "Still Harbor",
      description:
        "A quiet residential settlement with a relaxed atmosphere.",
    },
    {
      name: "Star Silence",
      description:
        "A distinctive township inspired by the stillness of space.",
    },
    {
      name: "Quiet Crossing",
      description:
        "A calm travel community along an imagined lunar route.",
    },
    {
      name: "Moon Rest",
      description:
        "A peaceful town designed around relaxation and comfortable living.",
    },
    {
      name: "Night Ridge",
      description:
        "An elevated residential community with strong astronomy appeal.",
    },
    {
      name: "Serene Point",
      description:
        "A premium settlement centered on peace and scenic terrain.",
    },
    {
      name: "Heis Harbor",
      description:
        "A welcoming signature destination within the state.",
    },
    {
      name: "Quiet Gardens",
      description:
        "A future virtual neighborhood envisioned with tranquil landscaped spaces.",
    },
    {
      name: "Still Moon",
      description:
        "A calm community representing permanence and serenity.",
    },
    {
      name: "Dark Sky Point",
      description:
        "An astronomy town inspired by excellent celestial viewing.",
    },
    {
      name: "Peaceful Ridge",
      description:
        "An elevated community suited to relaxed lunar living.",
    },
    {
      name: "Night Harbor",
      description:
        "A welcoming settlement inspired by the stars and lunar night.",
    },
    {
      name: "Quiet Haven",
      description:
        "A comfortable township representing privacy and belonging.",
    },
    {
      name: "Restful Horizon",
      description:
        "A scenic premium community offering calm panoramic views.",
    },
  ],
},

"Harding": {
  nickname: "The Endurance State",
  description:
    "Harding is an Orbital One lunar state inspired by resilience, strength, dependable communities, and the determination required to build beyond Earth. Its cities and towns celebrate endurance, reliability, protection, and long-term lunar settlement.",
  highlights: [
    "Strength and endurance identity",
    "Three resilience-focused cities",
    "Twenty named communities",
    "Strong dependable-property appeal",
    "Long-term settlement theme",
  ],
  searchAliases: [
    "Endurance State",
    "Harding State",
    "Resilience State",
    "Lunar Strength Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Endurance City",
      description:
        "The capital of Harding and a strong center for resilient communities, dependable infrastructure, and long-term lunar settlement.",
      featured: true,
    },
    {
      name: "Fortitude City",
      description:
        "A city inspired by courage, strength, and determination.",
    },
    {
      name: "Stronghold City",
      description:
        "A dependable city designed around protection, stability, and lasting development.",
    },
  ],

  towns: [
    {
      name: "Endurance Point",
      description:
        "A featured township representing resilience and long-term lunar living.",
      featured: true,
    },
    {
      name: "Fortitude Ridge",
      description:
        "An elevated community inspired by courage and persistence.",
    },
    {
      name: "Harding View",
      description:
        "A signature residential town carrying the state's strong identity.",
    },
    {
      name: "Stronghold Harbor",
      description:
        "A welcoming settlement designed around safety and dependability.",
    },
    {
      name: "Resilience Point",
      description:
        "A community representing the ability to recover and continue forward.",
    },
    {
      name: "Steadfast Ridge",
      description:
        "An elevated residential settlement centered on stability.",
    },
    {
      name: "Guardian Harbor",
      description:
        "A protective community inspired by safety and service.",
    },
    {
      name: "Enduring Horizon",
      description:
        "A scenic town representing permanence and long-term vision.",
    },
    {
      name: "Harding Station",
      description:
        "A central transportation and gathering hub within the state.",
    },
    {
      name: "Reliable Point",
      description:
        "A dependable residential community centered on trust.",
    },
    {
      name: "Fortress Ridge",
      description:
        "A strong elevated settlement inspired by protection and security.",
    },
    {
      name: "Courage Harbor",
      description:
        "A welcoming township celebrating bravery and determination.",
    },
    {
      name: "Lasting Foundation",
      description:
        "A construction-themed community built around permanence.",
    },
    {
      name: "Resilient Crossing",
      description:
        "A future travel community connecting dependable districts.",
    },
    {
      name: "Strength Point",
      description:
        "A bold township representing physical and community strength.",
    },
    {
      name: "Endurance Gardens",
      description:
        "A future virtual neighborhood designed for lasting homes and landscapes.",
    },
    {
      name: "Steady Harbor",
      description:
        "A comfortable residential settlement with a reliable identity.",
    },
    {
      name: "Harding Ridge",
      description:
        "An elevated signature community within the Endurance State.",
    },
    {
      name: "Future Stronghold",
      description:
        "A forward-looking town envisioned for lasting lunar settlement.",
    },
    {
      name: "Unbroken Point",
      description:
        "A distinctive township symbolizing resilience and perseverance.",
    },
  ],
},
"Markov": {
  nickname: "The Probability State",
  description:
    "Markov is an Orbital One lunar state inspired by probability, patterns, data, prediction, and systems that evolve over time. Its cities and towns celebrate mathematics, analytics, forecasting, and thoughtful decision-making.",
  highlights: [
    "Probability and data identity",
    "Three analytics-focused cities",
    "Twenty named communities",
    "Strong mathematics and technology appeal",
    "Prediction and pattern-recognition theme",
  ],
  searchAliases: [
    "Probability State",
    "Markov State",
    "Data State",
    "Lunar Analytics Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Probability City",
      description:
        "The capital of Markov and a major center for mathematics, analytics, forecasting, and data-driven lunar development.",
      featured: true,
    },
    {
      name: "Pattern City",
      description:
        "A technology-focused city inspired by recurring structures, trends, and scientific discovery.",
    },
    {
      name: "Forecast City",
      description:
        "A forward-looking city celebrating prediction, planning, and informed decision-making.",
    },
  ],

  towns: [
    {
      name: "Probability Point",
      description:
        "A featured township inspired by chance, mathematics, and informed prediction.",
      featured: true,
    },
    {
      name: "Pattern Ridge",
      description:
        "An elevated community celebrating recurring structures and organized development.",
    },
    {
      name: "Markov View",
      description:
        "A signature residential town carrying the state's analytical identity.",
    },
    {
      name: "Data Harbor",
      description:
        "A welcoming technology settlement centered on information and research.",
    },
    {
      name: "Forecast Point",
      description:
        "A planning community focused on preparing for future possibilities.",
    },
    {
      name: "Transition Ridge",
      description:
        "A township inspired by systems changing from one state to another.",
    },
    {
      name: "Sequence Harbor",
      description:
        "A mathematics-themed residential community celebrating ordered events.",
    },
    {
      name: "Prediction Point",
      description:
        "A forward-looking settlement built around analysis and planning.",
    },
    {
      name: "Markov Chain",
      description:
        "A signature science community inspired by connected probabilities.",
    },
    {
      name: "Analytics Ridge",
      description:
        "An elevated technology town focused on interpreting data.",
    },
    {
      name: "Outcome Harbor",
      description:
        "A welcoming community representing possible results and future paths.",
    },
    {
      name: "Variable Point",
      description:
        "A mathematics settlement inspired by changing values and conditions.",
    },
    {
      name: "Data Crossing",
      description:
        "A future travel and technology hub connecting analytical districts.",
    },
    {
      name: "Probability Gardens",
      description:
        "A future virtual neighborhood combining organized design and landscaping.",
    },
    {
      name: "Trend Ridge",
      description:
        "A scenic community inspired by patterns that develop over time.",
    },
    {
      name: "Model Harbor",
      description:
        "A research settlement celebrating simulations and scientific models.",
    },
    {
      name: "Markov Station",
      description:
        "A central research and gathering hub within the Probability State.",
    },
    {
      name: "Future Pattern",
      description:
        "A forward-looking township representing growth and emerging possibilities.",
    },
    {
      name: "Calculated Horizon",
      description:
        "A scenic residential community combining precision with broad lunar views.",
    },
    {
      name: "Possible Worlds",
      description:
        "A distinctive settlement celebrating imagination, probability, and alternative futures.",
    },
  ],
},

"Timaeus": {
  nickname: "The Cosmic Harmony State",
  description:
    "Timaeus is an Orbital One lunar state inspired by cosmic order, creation, harmony, geometry, and humanity's effort to understand the structure of the universe. Its cities and towns celebrate balance, design, philosophy, and celestial beauty.",
  highlights: [
    "Cosmic harmony identity",
    "Three philosophy-and-design cities",
    "Twenty named communities",
    "Strong educational and scenic appeal",
    "Creation, geometry, and balance theme",
  ],
  searchAliases: [
    "Cosmic Harmony State",
    "Timaeus State",
    "Harmony of the Cosmos",
    "Lunar Creation Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Harmony City",
      description:
        "The capital of Timaeus and a distinguished center for cosmic philosophy, geometry, balance, and thoughtful lunar design.",
      featured: true,
    },
    {
      name: "Creation City",
      description:
        "A forward-looking city inspired by origins, design, and the formation of new communities.",
    },
    {
      name: "Cosmos City",
      description:
        "A scenic city celebrating the structure, beauty, and scale of the universe.",
    },
  ],

  towns: [
    {
      name: "Harmony Point",
      description:
        "A featured township inspired by balance, cooperation, and cosmic order.",
      featured: true,
    },
    {
      name: "Creation Ridge",
      description:
        "An elevated community representing new beginnings and thoughtful design.",
    },
    {
      name: "Timaeus View",
      description:
        "A signature settlement carrying the state's philosophical identity.",
    },
    {
      name: "Cosmos Harbor",
      description:
        "A welcoming residential community celebrating the wider universe.",
    },
    {
      name: "Sacred Geometry",
      description:
        "A design-focused town inspired by mathematical form and proportion.",
    },
    {
      name: "Balance Ridge",
      description:
        "An elevated settlement centered on harmony and stable development.",
    },
    {
      name: "Creation Harbor",
      description:
        "A welcoming town representing growth and new opportunities.",
    },
    {
      name: "Cosmic Order",
      description:
        "A scholarly township inspired by the structure of the universe.",
    },
    {
      name: "Timaeus Gardens",
      description:
        "A future virtual neighborhood combining geometry and landscaped spaces.",
    },
    {
      name: "Element Point",
      description:
        "A science-themed community inspired by the building blocks of nature.",
    },
    {
      name: "Harmony Ridge",
      description:
        "A scenic residential settlement celebrating balance and cooperation.",
    },
    {
      name: "World Builder",
      description:
        "A future-focused township inspired by design and virtual construction.",
    },
    {
      name: "Celestial Form",
      description:
        "An elegant community celebrating shapes, stars, and cosmic beauty.",
    },
    {
      name: "Cosmos Crossing",
      description:
        "A travel-oriented settlement connecting major state destinations.",
    },
    {
      name: "Origin Point",
      description:
        "A symbolic township representing beginnings and creation.",
    },
    {
      name: "Geometric Harbor",
      description:
        "A welcoming community designed around order and careful planning.",
    },
    {
      name: "Universal View",
      description:
        "A premium residential town inspired by the scale of the cosmos.",
    },
    {
      name: "Timaeus Station",
      description:
        "A central learning and gathering hub within the state.",
    },
    {
      name: "Balanced Horizon",
      description:
        "A scenic community combining symmetry and broad lunar views.",
    },
    {
      name: "Living Cosmos",
      description:
        "A distinctive township representing an active and interconnected universe.",
    },
  ],
},

"Archytas": {
  nickname: "The Engineering Scholar State",
  description:
    "Archytas is an Orbital One lunar state inspired by engineering, mathematics, mechanics, music, and practical invention. Its cities and towns celebrate problem-solving, machines, structure, and the connection between science and creativity.",
  highlights: [
    "Engineering and mechanics identity",
    "Three invention-focused cities",
    "Twenty named communities",
    "Strong science and construction appeal",
    "Mathematics, music, and technology theme",
  ],
  searchAliases: [
    "Engineering Scholar State",
    "Archytas State",
    "Mechanics State",
    "Lunar Invention Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Mechanics City",
      description:
        "The capital of Archytas and a major center for engineering, machines, mathematics, and practical lunar invention.",
      featured: true,
    },
    {
      name: "Inventor City",
      description:
        "A creative city celebrating devices, experiments, and useful new technologies.",
    },
    {
      name: "Harmony Works City",
      description:
        "A distinctive city connecting engineering, mathematics, music, and design.",
    },
  ],

  towns: [
    {
      name: "Mechanics Point",
      description:
        "A featured township inspired by motion, machines, and practical engineering.",
      featured: true,
    },
    {
      name: "Inventor Ridge",
      description:
        "An elevated creative community honoring builders and problem-solvers.",
    },
    {
      name: "Archytas View",
      description:
        "A signature residential town carrying the state's engineering identity.",
    },
    {
      name: "Machine Harbor",
      description:
        "A welcoming technology settlement centered on mechanical design.",
    },
    {
      name: "Geometry Works",
      description:
        "A mathematics-and-construction community inspired by precise forms.",
    },
    {
      name: "Engineering Ridge",
      description:
        "An elevated settlement focused on technology and infrastructure.",
    },
    {
      name: "Inventor Harbor",
      description:
        "A welcoming town for creators, engineers, and future builders.",
    },
    {
      name: "Mechanical Point",
      description:
        "A practical community inspired by moving parts and dependable systems.",
    },
    {
      name: "Archytas Station",
      description:
        "A central research, transportation, and fabrication hub.",
    },
    {
      name: "Harmony Ridge",
      description:
        "A scenic township connecting mathematics, music, and balanced design.",
    },
    {
      name: "Flying Machine",
      description:
        "A bold settlement inspired by early ideas about mechanical flight.",
    },
    {
      name: "Workshop Point",
      description:
        "A hands-on community envisioned around future virtual fabrication.",
    },
    {
      name: "Gear Harbor",
      description:
        "A technology-themed residential town inspired by mechanical systems.",
    },
    {
      name: "Innovation Crossing",
      description:
        "A future travel and commerce community linking invention districts.",
    },
    {
      name: "Archytas Gardens",
      description:
        "A future virtual neighborhood combining engineering and landscaping.",
    },
    {
      name: "Mechanical Horizon",
      description:
        "A scenic settlement celebrating machines and future development.",
    },
    {
      name: "Design Engine",
      description:
        "A creative township centered on useful and beautiful technology.",
    },
    {
      name: "Builder Scholar",
      description:
        "A community honoring the connection between knowledge and practical skill.",
    },
    {
      name: "Precision Works",
      description:
        "A dependable settlement focused on quality engineering.",
    },
    {
      name: "Future Mechanics",
      description:
        "A forward-looking township representing advanced lunar technology.",
    },
  ],
},

"Protagoras": {
  nickname: "The Human Perspective State",
  description:
    "Protagoras is an Orbital One lunar state inspired by human perspective, communication, debate, community values, and the idea that people shape the worlds they build. Its cities and towns celebrate expression, citizenship, and shared lunar experiences.",
  highlights: [
    "Human perspective and communication identity",
    "Three civic-and-culture cities",
    "Twenty named communities",
    "Strong social and educational appeal",
    "Debate, expression, and community theme",
  ],
  searchAliases: [
    "Human Perspective State",
    "Protagoras State",
    "Human Measure State",
    "Lunar Communication Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Perspective City",
      description:
        "The capital of Protagoras and a central destination for communication, civic life, debate, and human-centered lunar communities.",
      featured: true,
    },
    {
      name: "Dialogue City",
      description:
        "A welcoming city designed around conversation, learning, and shared understanding.",
    },
    {
      name: "Citizen City",
      description:
        "A community-focused city celebrating participation, identity, and responsible lunar citizenship.",
    },
  ],

  towns: [
    {
      name: "Perspective Point",
      description:
        "A featured township inspired by individual viewpoints and shared understanding.",
      featured: true,
    },
    {
      name: "Dialogue Ridge",
      description:
        "An elevated community celebrating conversation and respectful debate.",
    },
    {
      name: "Protagoras View",
      description:
        "A signature settlement carrying the state's human-centered identity.",
    },
    {
      name: "Citizen Harbor",
      description:
        "A welcoming community built around participation and belonging.",
    },
    {
      name: "Human Measure",
      description:
        "A philosophical township inspired by the importance of human experience.",
    },
    {
      name: "Debate Point",
      description:
        "A learning community focused on ideas, discussion, and civic exchange.",
    },
    {
      name: "Community Ridge",
      description:
        "An elevated residential settlement centered on cooperation.",
    },
    {
      name: "Voice Harbor",
      description:
        "A welcoming town celebrating expression and communication.",
    },
    {
      name: "Shared Horizon",
      description:
        "A scenic township representing common goals and future possibilities.",
    },
    {
      name: "Protagoras Hall",
      description:
        "A signature gathering community envisioned for discussion and events.",
    },
    {
      name: "Expression Point",
      description:
        "A creative settlement celebrating speech, art, and individuality.",
    },
    {
      name: "Civic Crossing",
      description:
        "A future travel and community hub connecting public districts.",
    },
    {
      name: "Common Ground",
      description:
        "A welcoming town representing cooperation and shared purpose.",
    },
    {
      name: "Perspective Gardens",
      description:
        "A future virtual neighborhood designed around community and landscaping.",
    },
    {
      name: "Humanity Ridge",
      description:
        "An elevated settlement celebrating human achievement and connection.",
    },
    {
      name: "Citizen Point",
      description:
        "A civic-focused community inspired by participation and responsibility.",
    },
    {
      name: "Open Forum",
      description:
        "A virtual gathering town for discussion, meetings, and community events.",
    },
    {
      name: "Understanding Harbor",
      description:
        "A peaceful settlement representing empathy and communication.",
    },
    {
      name: "Many Views",
      description:
        "A diverse community celebrating different perspectives.",
    },
    {
      name: "Shared Future",
      description:
        "A forward-looking township centered on cooperation and possibility.",
    },
  ],
},
"Le Monnier": {
  nickname: "The Heritage State",
  description:
    "Le Monnier is an Orbital One lunar state inspired by astronomy, exploration, and the preservation of humanity's scientific heritage. Its communities celebrate knowledge, discovery, education, and the enduring legacy of lunar exploration for future generations.",
  highlights: [
    "Scientific heritage identity",
    "Three education-focused cities",
    "Twenty heritage communities",
    "Strong astronomy appeal",
    "Legacy and preservation theme",
  ],
  searchAliases: [
    "Heritage State",
    "Le Monnier State",
    "Scientific Heritage",
    "Legacy State",
  ],
  launchReady: false,

  cities: [
    {
      name: "Heritage City",
      description:
        "The capital of Le Monnier celebrating astronomy, history, education, and the preservation of humanity's exploration legacy.",
      featured: true,
    },
    {
      name: "Legacy City",
      description:
        "A city dedicated to preserving knowledge and inspiring future explorers.",
    },
    {
      name: "Discovery City",
      description:
        "A scholarly city celebrating scientific breakthroughs and lunar history.",
    },
  ],

  towns: [
    { name: "Heritage Point", description: "Featured community celebrating scientific history.", featured: true },
    { name: "Legacy Ridge", description: "Residential community honoring explorers." },
    { name: "Le Monnier View", description: "Signature township carrying the state's identity." },
    { name: "Discovery Harbor", description: "Community celebrating scientific achievement." },
    { name: "Astronomy Point", description: "Named for the science of the heavens." },
    { name: "Observatory Ridge", description: "Scenic astronomy-inspired settlement." },
    { name: "Scholar Harbor", description: "Welcoming educational community." },
    { name: "Explorer's Legacy", description: "Honoring generations of lunar pioneers." },
    { name: "Knowledge Point", description: "Community centered on learning." },
    { name: "Archive Ridge", description: "Celebrating preservation of history." },
    { name: "Heritage Harbor", description: "Residential settlement honoring the past." },
    { name: "Lunar History", description: "A township celebrating Moon exploration." },
    { name: "Discovery Ridge", description: "Community inspired by scientific curiosity." },
    { name: "Education Point", description: "Learning-centered township." },
    { name: "Founders Harbor", description: "Honoring the pioneers of exploration." },
    { name: "Historic Crossing", description: "Travel community linking heritage districts." },
    { name: "Museum Point", description: "Celebrating knowledge and preservation." },
    { name: "Legacy Gardens", description: "Future landscaped neighborhood." },
    { name: "Astronomer's Rest", description: "Peaceful community honoring observers." },
    { name: "Heritage Station", description: "Central gathering hub for the Heritage State." },
  ],
},

"Mare Frigoris": {
  nickname: "The Northern Frontier",
  description:
    "Mare Frigoris is an Orbital One lunar state inspired by the Moon's great northern plains. Its communities celebrate wide horizons, exploration, resilience, and the beauty of expansive lunar landscapes stretching across the northern frontier.",
  highlights: [
    "Northern frontier identity",
    "Three frontier cities",
    "Twenty scenic communities",
    "Wide-open landscape appeal",
    "Exploration and resilience theme",
  ],
  searchAliases: [
    "Northern Frontier",
    "Mare Frigoris State",
    "Northern Plains",
    "Frigoris State",
  ],
  launchReady: false,

  cities: [
    {
      name: "Frontier City",
      description:
        "The capital of Mare Frigoris celebrating exploration across the Moon's northern frontier.",
      featured: true,
    },
    {
      name: "North Star City",
      description:
        "A scenic city inspired by navigation, exploration, and broad northern horizons.",
    },
    {
      name: "Polar View City",
      description:
        "A peaceful city overlooking the expansive northern lunar plains.",
    },
  ],

  towns: [
    { name: "Northern Point", description: "Featured township representing the northern frontier.", featured: true },
    { name: "Frontier Ridge", description: "Residential community inspired by exploration." },
    { name: "Frigoris View", description: "Signature township overlooking the northern plains." },
    { name: "North Harbor", description: "Welcoming frontier settlement." },
    { name: "Polar Ridge", description: "Named for the Moon's northern regions." },
    { name: "Explorer Harbor", description: "Celebrating adventurous lunar living." },
    { name: "Frozen Horizon", description: "Scenic community inspired by Mare Frigoris." },
    { name: "Northern Crossing", description: "Travel community connecting frontier settlements." },
    { name: "Wide Sky", description: "Open residential township with panoramic views." },
    { name: "Cold Plains", description: "Inspired by the broad northern mare." },
    { name: "Aurora Point", description: "Named for the beauty of northern skies." },
    { name: "Northwatch", description: "Observation-focused community." },
    { name: "Pioneer Harbor", description: "Welcoming explorer settlement." },
    { name: "Frontier Outlook", description: "Premium scenic township." },
    { name: "Ice Horizon", description: "Broad landscape-inspired community." },
    { name: "Compass Ridge", description: "Navigation-themed residential town." },
    { name: "Northwind", description: "Peaceful northern community." },
    { name: "Frigoris Gardens", description: "Future landscaped neighborhood." },
    { name: "Explorer's North", description: "Adventure-themed township." },
    { name: "Northern Station", description: "Central transportation and gathering hub." },
  ],
},
"Copernicus": {
  nickname: "The Scientific Revolution",
  description:
    "Copernicus is an Orbital One lunar state inspired by transformative ideas, astronomy, discovery, and the courage to view the universe differently. Its cities and towns celebrate scientific progress, observation, and bold new perspectives.",
  highlights: [
    "Scientific-revolution identity",
    "Three astronomy-themed cities",
    "Twenty named communities",
    "Strong educational and collector appeal",
    "Prominent crater-region character",
  ],
  searchAliases: [
    "Scientific Revolution",
    "Copernicus State",
    "Copernican State",
    "Lunar Revolution Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Revolution City",
      description:
        "The capital of Copernicus and a major center for astronomy, discovery, and ideas that transform humanity's understanding of the universe.",
      featured: true,
    },
    {
      name: "Heliocentric City",
      description:
        "A scholarly city inspired by the Sun-centered model of the solar system.",
    },
    {
      name: "Discovery City",
      description:
        "A forward-looking city celebrating observation, evidence, and scientific progress.",
    },
  ],

  towns: [
    {
      name: "Revolution Point",
      description:
        "A featured township honoring ideas that changed humanity's view of the cosmos.",
      featured: true,
    },
    {
      name: "Heliocentric Ridge",
      description:
        "An elevated scientific community inspired by the Sun-centered solar system.",
    },
    {
      name: "Copernicus View",
      description:
        "A signature settlement connected to the state's celebrated lunar identity.",
    },
    {
      name: "New Perspective",
      description:
        "A community representing curiosity and a willingness to see things differently.",
    },
    {
      name: "Astronomy Harbor",
      description:
        "A welcoming township for future observers, learners, and residents.",
    },
    {
      name: "Solar Center",
      description:
        "A science-themed community inspired by the Sun's central role in the solar system.",
    },
    {
      name: "Observation Ridge",
      description:
        "A scenic settlement designed around astronomy and lunar observation.",
    },
    {
      name: "Orbit Point",
      description:
        "A community celebrating planetary motion and celestial paths.",
    },
    {
      name: "Evidence",
      description:
        "A scholarly township honoring scientific investigation and proof.",
    },
    {
      name: "Crater Harbor",
      description:
        "A welcoming settlement inspired by Copernicus's dramatic crater terrain.",
    },
    {
      name: "Scientific Crossing",
      description:
        "A future travel and learning community connecting major destinations.",
    },
    {
      name: "Planetary View",
      description:
        "A residential township inspired by worlds across the solar system.",
    },
    {
      name: "Copernican Ridge",
      description:
        "An elevated premium community carrying the state's scientific identity.",
    },
    {
      name: "New World",
      description:
        "A frontier settlement representing discovery and changing ideas.",
    },
    {
      name: "Solar Harbor",
      description:
        "A bright community inspired by energy, science, and exploration.",
    },
    {
      name: "Cosmic Order",
      description:
        "A township celebrating the structure and motion of the universe.",
    },
    {
      name: "Revolution Gardens",
      description:
        "A future virtual neighborhood combining innovation and landscaped spaces.",
    },
    {
      name: "Scholar's Orbit",
      description:
        "A learning-focused community honoring astronomy and mathematical discovery.",
    },
    {
      name: "Changing Horizon",
      description:
        "A scenic settlement representing new perspectives and possibilities.",
    },
    {
      name: "Copernicus Station",
      description:
        "A central research and gathering hub within the Scientific Revolution.",
    },
  ],
},

"Mare Vaporum": {
  nickname: "The Sea of Vapors",
  description:
    "Mare Vaporum is an Orbital One lunar state inspired by mist-like landscapes, atmospheric imagination, and graceful communities. Its cities and towns combine mystery, wellness, elegance, and futuristic lunar design.",
  highlights: [
    "Mist and vapor-inspired identity",
    "Three atmospheric cities",
    "Twenty named communities",
    "Strong scenic and wellness appeal",
    "Distinctive futuristic character",
  ],
  searchAliases: [
    "Sea of Vapors",
    "Mare Vaporum State",
    "Vaporum State",
    "Lunar Mist Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Vapor City",
      description:
        "The capital of Mare Vaporum and an elegant center inspired by atmospheric imagination, graceful landscapes, and futuristic lunar living.",
      featured: true,
    },
    {
      name: "Mist City",
      description:
        "A calm residential city designed around mystery, softness, and scenic terrain.",
    },
    {
      name: "Cloud City",
      description:
        "A futuristic city inspired by elevated habitats and imaginative lunar architecture.",
    },
  ],

  towns: [
    {
      name: "Silver Mist",
      description:
        "A featured township inspired by soft light and the appearance of lunar haze.",
      featured: true,
    },
    {
      name: "Vapor Point",
      description:
        "A signature community carrying Mare Vaporum's atmospheric identity.",
    },
    {
      name: "Mist Harbor",
      description:
        "A peaceful residential settlement with a calm and welcoming character.",
    },
    {
      name: "Cloud Ridge",
      description:
        "An elevated community envisioned around futuristic lunar homes.",
    },
    {
      name: "Vaporum View",
      description:
        "A scenic township overlooking the Sea of Vapors region.",
    },
    {
      name: "Moon Fog",
      description:
        "A mysterious community inspired by imagined lunar atmosphere.",
    },
    {
      name: "Silver Vapor",
      description:
        "An elegant residential town reflecting the Moon's bright surface.",
    },
    {
      name: "Mist Crossing",
      description:
        "A travel-oriented settlement along an imagined lunar corridor.",
    },
    {
      name: "Cloud Harbor",
      description:
        "A welcoming future destination for residents and virtual visitors.",
    },
    {
      name: "Gentle Haze",
      description:
        "A quiet community centered on comfort and scenic lunar living.",
    },
    {
      name: "Vapor Ridge",
      description:
        "An elevated town offering a distinctive atmospheric identity.",
    },
    {
      name: "Dream Mist",
      description:
        "A peaceful community inspired by imagination and possibility.",
    },
    {
      name: "Floating Horizon",
      description:
        "A scenic settlement envisioned around broad and graceful views.",
    },
    {
      name: "Vaporum Gardens",
      description:
        "A future virtual neighborhood designed with soft landscaped spaces.",
    },
    {
      name: "Cloud Point",
      description:
        "A modern township inspired by elevated futuristic development.",
    },
    {
      name: "Quiet Vapor",
      description:
        "A calm residential settlement suited to peaceful novelty ownership.",
    },
    {
      name: "Silver Haze",
      description:
        "An elegant community combining mystery and lunar beauty.",
    },
    {
      name: "Mistwatch",
      description:
        "An observation township focused on changing light and terrain.",
    },
    {
      name: "Vapor Haven",
      description:
        "A comfortable community representing belonging and relaxation.",
    },
    {
      name: "Atmosphere Point",
      description:
        "A futuristic settlement celebrating environmental science and imagination.",
    },
  ],
},

"Julius Caesar": {
  nickname: "The Imperial State",
  description:
    "Julius Caesar is an Orbital One lunar state inspired by leadership, classical history, architecture, and ambitious civic communities. Its cities and towns celebrate organization, public life, monuments, and enduring legacy.",
  highlights: [
    "Classical leadership identity",
    "Three monumental cities",
    "Twenty named civic communities",
    "Strong history and collector appeal",
    "Architecture and legacy theme",
  ],
  searchAliases: [
    "Imperial State",
    "Julius Caesar State",
    "Caesar State",
    "Classical Lunar Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Imperial City",
      description:
        "The capital of Julius Caesar and a monumental center for leadership, civic life, architecture, and lasting lunar legacy.",
      featured: true,
    },
    {
      name: "Forum City",
      description:
        "A community-centered city envisioned around public gatherings and civic discussion.",
    },
    {
      name: "Monument City",
      description:
        "A distinguished city inspired by grand architecture and historical recognition.",
    },
  ],

  towns: [
    {
      name: "Caesar Point",
      description:
        "A featured township carrying the state's classical and leadership identity.",
      featured: true,
    },
    {
      name: "Imperial Ridge",
      description:
        "An elevated community inspired by ambition and monumental design.",
    },
    {
      name: "Forum Harbor",
      description:
        "A welcoming civic settlement designed for gatherings and public life.",
    },
    {
      name: "Senate Point",
      description:
        "A community inspired by representation, leadership, and debate.",
    },
    {
      name: "Roman View",
      description:
        "A scenic township reflecting classical architecture and heritage.",
    },
    {
      name: "Julius Station",
      description:
        "A signature transportation and gathering hub within the state.",
    },
    {
      name: "Monument Ridge",
      description:
        "A premium residential settlement inspired by lasting achievements.",
    },
    {
      name: "Civic Forum",
      description:
        "A community-centered town envisioned for meetings and virtual events.",
    },
    {
      name: "Legacy Harbor",
      description:
        "A welcoming settlement celebrating history and enduring recognition.",
    },
    {
      name: "Triumph Point",
      description:
        "A bold township representing achievement and success.",
    },
    {
      name: "Classical Gardens",
      description:
        "A future virtual neighborhood inspired by formal landscaped spaces.",
    },
    {
      name: "Imperial Crossing",
      description:
        "A travel community connecting imagined civic districts.",
    },
    {
      name: "Marble Ridge",
      description:
        "An elegant residential town inspired by classical building materials.",
    },
    {
      name: "Caesar View",
      description:
        "A signature premium settlement overlooking the state's terrain.",
    },
    {
      name: "Republic Point",
      description:
        "A civic community representing public service and shared responsibility.",
    },
    {
      name: "Victory Harbor",
      description:
        "A welcoming township celebrating achievement and progress.",
    },
    {
      name: "Column Heights",
      description:
        "An architectural community inspired by classical structural design.",
    },
    {
      name: "History Crossing",
      description:
        "A settlement linking heritage, exploration, and future development.",
    },
    {
      name: "Public Square",
      description:
        "A future virtual gathering destination for residents and visitors.",
    },
    {
      name: "Eternal City",
      description:
        "A distinguished township representing permanence and enduring lunar legacy.",
    },
  ],
},

"Taruntius": {
  nickname: "The Energy State",
  description:
    "Taruntius is an Orbital One lunar state inspired by power, motion, renewable energy, and dynamic development. Its cities and towns celebrate solar technology, electricity, engineering, and the systems that will support future lunar communities.",
  highlights: [
    "Energy and technology identity",
    "Three power-focused cities",
    "Twenty named communities",
    "Strong engineering and development appeal",
    "Renewable lunar-energy theme",
  ],
  searchAliases: [
    "Energy State",
    "Taruntius State",
    "Lunar Power Region",
    "Solar Energy State",
  ],
  launchReady: false,

  cities: [
    {
      name: "Energy City",
      description:
        "The capital of Taruntius and a major center for lunar power systems, renewable energy, and future technological development.",
      featured: true,
    },
    {
      name: "Solar City",
      description:
        "A sustainable city inspired by solar arrays and clean lunar energy.",
    },
    {
      name: "Current City",
      description:
        "A technology-focused city celebrating electricity, motion, and modern infrastructure.",
    },
  ],

  towns: [
    {
      name: "Solar Point",
      description:
        "A featured township inspired by sunlight and renewable lunar power.",
      featured: true,
    },
    {
      name: "Energy Ridge",
      description:
        "An elevated community centered on power generation and technology.",
    },
    {
      name: "Current Harbor",
      description:
        "A welcoming settlement carrying Taruntius's electrical identity.",
    },
    {
      name: "Power Station",
      description:
        "A technology town inspired by future lunar energy infrastructure.",
    },
    {
      name: "Solar Array",
      description:
        "A sustainable community themed around large-scale solar systems.",
    },
    {
      name: "Taruntius Grid",
      description:
        "A signature township representing organized lunar energy distribution.",
    },
    {
      name: "Voltage Point",
      description:
        "An engineering community inspired by electrical potential.",
    },
    {
      name: "Fusion Ridge",
      description:
        "A futuristic settlement inspired by advanced energy research.",
    },
    {
      name: "Renewable Harbor",
      description:
        "A welcoming residential town centered on sustainable development.",
    },
    {
      name: "Photon",
      description:
        "A science-themed community named for particles of light.",
    },
    {
      name: "Electric Horizon",
      description:
        "A modern residential settlement with a dynamic identity.",
    },
    {
      name: "Power Crossing",
      description:
        "A transportation community connecting future energy districts.",
    },
    {
      name: "Solar Harbor",
      description:
        "A bright and sustainable residential destination.",
    },
    {
      name: "Battery Point",
      description:
        "A technology town inspired by energy storage and dependable systems.",
    },
    {
      name: "Energy Gardens",
      description:
        "A future virtual neighborhood combining renewable power and landscaping.",
    },
    {
      name: "Current Ridge",
      description:
        "An elevated community celebrating electrical flow and innovation.",
    },
    {
      name: "Bright Grid",
      description:
        "A township inspired by connected energy infrastructure.",
    },
    {
      name: "Taruntius Station",
      description:
        "A central engineering and transportation hub within the state.",
    },
    {
      name: "Solar Future",
      description:
        "A forward-looking settlement representing sustainable lunar life.",
    },
    {
      name: "Power Horizon",
      description:
        "A scenic community offering a strong technology and development identity.",
    },
  ],
},

"J. Herschel": {
  nickname: "The Deep Sky State",
  description:
    "J. Herschel is an Orbital One lunar state inspired by deep-sky astronomy, stellar observation, nebulae, and humanity's exploration of the wider universe. Its cities and towns celebrate observatories, star catalogs, and distant celestial wonders.",
  highlights: [
    "Deep-sky astronomy identity",
    "Three observation-focused cities",
    "Twenty named communities",
    "Strong educational and attraction appeal",
    "Stars, nebulae, and galaxy theme",
  ],
  searchAliases: [
    "Deep Sky State",
    "J. Herschel State",
    "Herschel State",
    "Lunar Deep Sky Region",
  ],
  launchReady: false,

  cities: [
    {
      name: "Deep Sky City",
      description:
        "The capital of J. Herschel and a major center for stellar astronomy, observatories, and future deep-space educational experiences.",
      featured: true,
    },
    {
      name: "Nebula City",
      description:
        "A scenic city inspired by colorful clouds of gas and distant star formation.",
    },
    {
      name: "Galaxy City",
      description:
        "A futuristic city celebrating the immense collections of stars beyond the Milky Way.",
    },
  ],

  towns: [
    {
      name: "Herschel Point",
      description:
        "A featured township honoring astronomers who mapped and studied the deep sky.",
      featured: true,
    },
    {
      name: "Nebula Ridge",
      description:
        "An elevated community inspired by distant stellar clouds.",
    },
    {
      name: "Galaxy Harbor",
      description:
        "A welcoming settlement celebrating galaxies throughout the universe.",
    },
    {
      name: "Deep Sky View",
      description:
        "A premium township centered on astronomy and broad celestial views.",
    },
    {
      name: "Star Catalog",
      description:
        "A scholarly community inspired by organized records of celestial objects.",
    },
    {
      name: "Herschel Station",
      description:
        "A signature research and gathering hub within the Deep Sky State.",
    },
    {
      name: "Nebula Point",
      description:
        "A scenic community named for distant clouds of gas and dust.",
    },
    {
      name: "Galaxy Ridge",
      description:
        "An elevated residential settlement with a strong cosmic identity.",
    },
    {
      name: "Stellar Harbor",
      description:
        "A welcoming town inspired by stars across the universe.",
    },
    {
      name: "Deep Field",
      description:
        "A township honoring long-exposure images of distant galaxies.",
    },
    {
      name: "Cosmic Survey",
      description:
        "A research community dedicated to mapping the wider universe.",
    },
    {
      name: "Star Cluster",
      description:
        "A residential settlement inspired by groups of nearby stars.",
    },
    {
      name: "Far Galaxy",
      description:
        "A frontier community representing the most distant celestial destinations.",
    },
    {
      name: "Herschel View",
      description:
        "A signature residential town carrying the state's astronomy identity.",
    },
    {
      name: "Nebula Gardens",
      description:
        "A future virtual community inspired by colorful cosmic forms.",
    },
    {
      name: "Starlight Ridge",
      description:
        "A scenic elevated town celebrating light from distant stars.",
    },
    {
      name: "Cosmic Harbor",
      description:
        "A welcoming destination for future virtual astronomy visitors.",
    },
    {
      name: "Galaxy Crossing",
      description:
        "A travel-themed settlement connecting imagined deep-sky destinations.",
    },
    {
      name: "Infinite View",
      description:
        "A premium township inspired by the vast scale of the universe.",
    },
    {
      name: "Discovery Nebula",
      description:
        "A forward-looking community honoring observation and exploration.",
    },
  ],
},

};