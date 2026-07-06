import { lunarAttractions } from "./lunar-attractions";
import { getAllPropertiesWithCoordinates } from "./property-service";

function getDistance(
  pointA: { x: number; y: number },
  pointB: { x: number; y: number }
) {
  const dx = pointA.x - pointB.x;
  const dy = pointA.y - pointB.y;

  return Math.sqrt(dx * dx + dy * dy);
}

export async function getNearbyPropertiesForAttraction(
  attractionId: string,
  limit = 3
) {
  const attraction = lunarAttractions.find(
    (item) => item.id === attractionId
  );

  if (!attraction) {
    return [];
  }

  const properties = await getAllPropertiesWithCoordinates();

  return properties
  .map((property) => ({
      ...property,
      distance: getDistance(
        { x: attraction.x, y: attraction.y },
        {
          x: property.mapX ?? 500,
          y: property.mapY ?? 500,
        }
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}