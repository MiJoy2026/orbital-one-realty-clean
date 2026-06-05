export type PropertyStatus = "Available" | "Sold";
export type PropertyType = "Rural Acre" | "Town Block" | "City Block";

export type LunarProperty = {
  id: string;
  state: string;
  city?: string;
  town?: string;
  type: PropertyType;
  size: string;
  price: number;
  status: PropertyStatus;
  nearbyAttractions: string[];
};

export const lunarStates = Array.from({ length: 57 }, (_, index) => ({
  id: index + 1,
  name: `Lunar State ${index + 1}`,
  cities: [
    `City ${index + 1}-A`,
    `City ${index + 1}-B`,
    `City ${index + 1}-C`,
  ],
  towns: Array.from(
    { length: 20 },
    (_, townIndex) => `Town ${index + 1}-${townIndex + 1}`
  ),
}));

export const sampleProperties: LunarProperty[] = [
  {
    id: "R-001",
    state: "Lunar State 1",
    type: "Rural Acre",
    size: "1 Acre",
    price: 24.95,
    status: "Available",
    nearbyAttractions: ["Apollo 11 Landing Site", "Sea of Tranquility"],
  },
  {
    id: "R-002",
    state: "Lunar State 1",
    type: "Rural Acre",
    size: "1/2 Acre",
    price: 16.95,
    status: "Available",
    nearbyAttractions: ["Famous Lunar Craters", "Historic Moon Plains"],
  },
  {
    id: "R-003",
    state: "Lunar State 2",
    type: "Rural Acre",
    size: "1 Acre",
    price: 24.95,
    status: "Sold",
    nearbyAttractions: ["Tycho Crater", "Southern Highlands"],
  },
  {
    id: "T-001",
    state: "Lunar State 3",
    town: "Town 3-1",
    type: "Town Block",
    size: "Town Block",
    price: 39.95,
    status: "Available",
    nearbyAttractions: ["Copernicus Crater", "Lunar Ridge Trail"],
  },
  {
    id: "T-002",
    state: "Lunar State 3",
    town: "Town 3-2",
    type: "Town Block",
    size: "Town Block",
    price: 39.95,
    status: "Sold",
    nearbyAttractions: ["Mare Imbrium", "Lunar Overlook"],
  },
  {
    id: "C-001",
    state: "Lunar State 4",
    city: "City 4-A",
    type: "City Block",
    size: "City Block",
    price: 54.95,
    status: "Available",
    nearbyAttractions: ["Aristarchus Plateau", "Bright Crater Field"],
  },
  {
    id: "C-002",
    state: "Lunar State 4",
    city: "City 4-B",
    type: "City Block",
    size: "City Block",
    price: 54.95,
    status: "Sold",
    nearbyAttractions: ["Lunar North Vista", "Highland Ridge"],
  },
];