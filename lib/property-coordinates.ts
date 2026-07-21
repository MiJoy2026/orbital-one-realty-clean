import { getLunarStateCenter } from "./lunar-map-regions";

export const stateCenters = new Proxy(
  {} as Record<string, { x: number; y: number }>,
  {
    get(_target, property) {
      if (typeof property !== "string") {
        return undefined;
      }

      if (property === "Default") {
        return {
          x: 500,
          y: 500,
        };
      }

      return getLunarStateCenter(property);
    },
  }
);

export function getPropertyCoordinates(
  state: string,
  propertyId: string
) {
  const center = getLunarStateCenter(state);

  let hash = 0;

  for (const character of propertyId) {
    hash =
      (hash * 31 + character.charCodeAt(0)) %
      100000;
  }

  const angle =
    (hash % 360) * (Math.PI / 180);

  const radius = 15 + (hash % 40);

  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}