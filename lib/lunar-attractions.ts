export type LunarAttraction = {
  id: string;
  name: string;
  type: string;
  state: string;
  x: number;
  y: number;
  description: string;
  image: string;
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
  },

  {
    id: "maretranquillitatis",
    name: "Mare Tranquillitatis",
    type: "Lunar Mare",
    state: "Tranquillitatis",
    x: 520,
    y: 460,
    description:
      "The Sea of Tranquility, where Apollo 11 landed.",
      image: "/attractions/maretranquillitatis.jpg",
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
  },
];