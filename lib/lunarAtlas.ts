export type LunarAtlasState = {
  name: string;
  theme: string;
  motto: string;
  description: string;
  capital: string;
  cities: string[];
  towns: string[];
};

const townNames = [
  "Landing",
  "Vista",
  "Ridge",
  "Horizon",
  "Outpost",
  "Harbor",
  "Heights",
  "Point",
  "Valley",
  "Crest",
  "Bay",
  "Station",
  "Crossing",
  "Gardens",
  "Summit",
  "Plains",
  "Trail",
  "Base",
  "Fields",
  "Watch",
];

const stateSeeds = [
  ["Apollo", "Apollo Program", "Where Humanity Took Its First Giant Leap", "Armstrong City", ["Armstrong City", "Aldrin City", "Collins City"]],
  ["Mercury", "Early Human Spaceflight", "Where It All Began", "Freedom City", ["Freedom City", "Liberty City", "Friendship City"]],
  ["Gemini", "Path to Apollo", "Learning to Reach Further", "Gemini City", ["Gemini City", "Titan City", "Rendezvous City"]],
  ["Artemis", "Future Lunar Exploration", "The Next Giant Leap Begins Here", "Orion City", ["Orion City", "Gateway City", "Artemis City"]],
  ["Gateway", "Lunar Infrastructure", "The Doorway to Tomorrow", "Gateway City", ["Gateway City", "Habitat City", "Docking City"]],
  ["Orion", "Deep Space Crew Exploration", "Carry Humanity Forward", "Orion City", ["Orion City", "Navigator City", "Crew City"]],
  ["Nova", "Innovation Frontier", "New Light on a New World", "Nova City", ["Nova City", "Fusion City", "Aurora City"]],
  ["Frontier", "Settlement and Expansion", "Build Beyond the Horizon", "Frontier City", ["Frontier City", "Outpost City", "Trailhead City"]],
  ["Pioneer", "Exploration Heritage", "Always First Beyond the Known", "Pioneer City", ["Pioneer City", "Surveyor City", "Ranger City"]],
  ["Enterprise", "Innovation", "Imagine the Future", "Enterprise City", ["Enterprise City", "Innovation City", "Vision City"]],

  ["Galileo", "Astronomy", "Explore Beyond the Horizon", "Galileo City", ["Galileo City", "Kepler City", "Hubble City"]],
  ["Kepler", "Orbital Science", "Where Worlds Find Their Paths", "Kepler City", ["Kepler City", "Orbit City", "Transit City"]],
  ["Hubble", "Deep Space Imaging", "Look Farther, See More", "Hubble City", ["Hubble City", "Webb City", "Observatory City"]],
  ["Copernicus", "Scientific Revolution", "Changing the Center of Everything", "Copernicus City", ["Copernicus City", "Heliocentric City", "Revolution City"]],
  ["Newton", "Physics and Gravity", "The Laws That Move the Worlds", "Newton City", ["Newton City", "Gravity City", "Principia City"]],
  ["Einstein", "Relativity and Wonder", "Imagination Encircles the Universe", "Einstein City", ["Einstein City", "Relativity City", "Photon City"]],
  ["Sagan", "Cosmic Perspective", "We Are Made of Starstuff", "Sagan City", ["Sagan City", "Cosmos City", "Pale Blue City"]],
  ["Hawking", "Cosmology", "Look Up at the Stars", "Hawking City", ["Hawking City", "Black Hole City", "Singularity City"]],
  ["Curie", "Science and Discovery", "Radiance Through Discovery", "Curie City", ["Curie City", "Radium City", "Discovery City"]],
  ["Tesla", "Energy and Invention", "Powering the Future", "Tesla City", ["Tesla City", "Current City", "Resonance City"]],

  ["Tycho", "Lunar Geography", "Inspired by the Moon Itself", "Tycho City", ["Tycho City", "Clavius City", "Plato City"]],
  ["Clavius", "Great Lunar Craters", "Ancient Strength Beneath the Stars", "Clavius City", ["Clavius City", "Southern City", "Highland City"]],
  ["Plato", "Lunar Plains and Craters", "Dark Beauty Under Starlight", "Plato City", ["Plato City", "Alpine City", "Mare City"]],
  ["Tranquillitatis", "Lunar Maria", "Calm Seas, Historic Ground", "Tranquility City", ["Tranquility City", "Eagle City", "Mare City"]],
  ["Serenity", "Tranquility and Reflection", "Peace Among the Stars", "Serenity City", ["Serenity City", "Harmony City", "Luna City"]],
  ["Imbrium", "Lunar Basin", "Great Basin of Moonlight", "Imbrium City", ["Imbrium City", "Rain Sea City", "Basin City"]],
  ["Crisium", "Lunar Mare", "The Sea at the Moon's Edge", "Crisium City", ["Crisium City", "Eastern City", "Mare Edge City"]],
  ["Aristarchus", "Bright Lunar Highlands", "The Moon's Bright Beacon", "Aristarchus City", ["Aristarchus City", "Brightpeak City", "Rille City"]],
  ["Orientale", "Distant Lunar Basin", "Gateway to the Far Horizon", "Orientale City", ["Orientale City", "Far Basin City", "Western City"]],
  ["Aitken", "South Pole Basin", "The Deep Memory of the Moon", "Aitken City", ["Aitken City", "South Basin City", "Deep Moon City"]],

  ["Discovery", "Space Shuttle Program", "Built to Explore", "Discovery City", ["Discovery City", "Atlantis City", "Endeavour City"]],
  ["Atlantis", "Orbital Construction", "Building Beyond Earth", "Atlantis City", ["Atlantis City", "Docking City", "Station City"]],
  ["Endeavour", "Scientific Missions", "Reach With Purpose", "Endeavour City", ["Endeavour City", "Laboratory City", "Expedition City"]],
  ["Columbia", "Shuttle Legacy", "Forever Among the Stars", "Columbia City", ["Columbia City", "Legacy City", "Orbiter City"]],
  ["Challenger", "Courage and Remembrance", "Ad Astra Per Aspera", "Challenger City", ["Challenger City", "Courage City", "Teacher City"]],
  ["Voyager", "Deep Space Exploration", "Into the Infinite", "Voyager City", ["Voyager City", "Cassini City", "Pioneer City"]],
  ["Cassini", "Outer Planet Discovery", "Grace Through the Rings", "Cassini City", ["Cassini City", "Titan City", "Saturn City"]],
  ["Horizon", "Far Worlds", "Beyond Every Boundary", "Horizon City", ["Horizon City", "Pluto City", "Kuiper City"]],
  ["Odyssey", "Adventure and Journey", "Every Journey Begins with Wonder", "Odyssey City", ["Odyssey City", "Voyage City", "Quest City"]],

  ["Ride", "Human Spaceflight", "Reach for the Stars", "Ride City", ["Ride City", "Trailblazer City", "Challenger City"]],
  ["Gagarin", "First Human in Space", "Orbit Belongs to Dreamers", "Gagarin City", ["Gagarin City", "Vostok City", "Cosmonaut City"]],
  ["Tereshkova", "Women in Space", "Sky Without Limits", "Tereshkova City", ["Tereshkova City", "Vostok Six City", "Valentina City"]],
  ["Glenn", "American Orbit", "Friendship Around the World", "Glenn City", ["Glenn City", "Friendship City", "Mercury City"]],
  ["Armstrong", "First Step Legacy", "Quiet Courage, Giant Leap", "Armstrong City", ["Armstrong City", "Eagle City", "Wapakoneta City"]],
  ["Aldrin", "Lunar Surface Exploration", "Bold Steps on New Ground", "Aldrin City", ["Aldrin City", "Buzz City", "EVA City"]],
  ["Collins", "Orbital Command", "Alone Above the Moon, With All Humanity", "Collins City", ["Collins City", "Columbia City", "Command City"]],
  ["Jemison", "Science and Inspiration", "Open the Door to Tomorrow", "Jemison City", ["Jemison City", "Science City", "Endeavour City"]],

  ["Radiance", "Luxury Lunar Living", "Shine Beneath the Stars", "Radiance City", ["Radiance City", "Goldleaf City", "Starlight City"]],
  ["Celeste", "Elegant Lunar Retreats", "A Celestial Place to Belong", "Celeste City", ["Celeste City", "Sapphire City", "Aurora City"]],
  ["Aurora", "Polar Light and Wonder", "Where Night Becomes Light", "Aurora City", ["Aurora City", "Polaris City", "Dawn City"]],
  ["Unity", "Community and Belonging", "Together Among the Stars", "Unity City", ["Unity City", "Harmony City", "Alliance City"]],
  ["Legacy", "Heritage and Recognition", "A Name Written Among the Stars", "Legacy City", ["Legacy City", "Heritage City", "Founder City"]],
  ["Novae", "New Beginnings", "A New Light for Every Dream", "Novae City", ["Novae City", "Genesis City", "Dawn City"]],
  ["Zenith", "Premium High Ground", "Rise to the Highest View", "Zenith City", ["Zenith City", "Summit City", "Apex City"]],
  ["Eclipse", "Mystery and Shadow", "Where Light Meets Legend", "Eclipse City", ["Eclipse City", "Shadow City", "Umbra City"]],
  ["Solstice", "Cycles and Seasons", "Marking Time Beneath the Moon", "Solstice City", ["Solstice City", "Equinox City", "Meridian City"]],
] as const;

export const lunarAtlasStates: LunarAtlasState[] = stateSeeds.map(
  ([name, theme, motto, capital, cities]) => ({
    name,
    theme,
    motto,
    capital,
    cities: [...cities],
    description: `${name} State is part of the official Orbital One lunar atlas, themed around ${theme.toLowerCase()}.`,
    towns: townNames.map((town) => `${name} ${town}`),
  })
);