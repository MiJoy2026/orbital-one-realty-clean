export type LunarMapRegion = {
  name: string;
  positions: [number, number][];
  labelPosition: [number, number];
};

export const lunarMapRegions: LunarMapRegion[] = [
  {
    name: "Hammel",
    labelPosition: [610, 560],
    positions: [
      [555, 470],
      [675, 500],
      [690, 610],
      [600, 650],
      [545, 575],
    ],
  },
  {
    name: "Clavius",
    labelPosition: [585, 700],
    positions: [
      [520, 610],
      [650, 620],
      [665, 750],
      [565, 785],
      [500, 700],
    ],
  },
      {
    name: "Schiller",
    labelPosition: [500, 330],
    positions: [
      [430, 190],
      [610, 220],
      [640, 390],
      [500, 455],
      [365, 360],
    ],
  },
  {
    name: "Rhetta",
    labelPosition: [680, 460],
    positions: [
      [610, 330],
      [760, 355],
      [780, 510],
      [675, 575],
      [575, 485],
    ],
  },
  {
    name: "Mar Serenitatis",
    labelPosition: [665, 845],
    positions: [
      [610, 760],
      [735, 780],
      [760, 895],
      [650, 930],
      [575, 845],
    ],
  }
];