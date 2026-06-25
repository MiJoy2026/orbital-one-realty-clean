import { sampleProperties } from "./moon-data";
import { getPropertyCoordinates } from "./property-coordinates";

export function getAllPropertiesWithCoordinates() {
  return sampleProperties.map((property) => {
    const coordinates = getPropertyCoordinates(property.state, property.id);

    return {
      ...property,
      mapX: coordinates.x,
      mapY: coordinates.y,
    };
  });
}

export function getPropertyById(propertyId: string) {
  return getAllPropertiesWithCoordinates().find(
    (property) => property.id.toLowerCase() === propertyId.toLowerCase()
  );
}

export function getNearbyProperties(propertyId: string, limit = 5) {
  const selectedProperty = getPropertyById(propertyId);

  if (!selectedProperty) {
    return [];
  }

  return getAllPropertiesWithCoordinates()
    .filter(
      (property) =>
        property.id !== selectedProperty.id &&
        property.state === selectedProperty.state
    )
    .slice(0, limit);
}

export function getPropertiesByState(stateName: string) {
  return getAllPropertiesWithCoordinates().filter(
    (property) => property.state.toLowerCase() === stateName.toLowerCase()
  );
}

export function getPropertyCountsByState() {
  const properties = getAllPropertiesWithCoordinates();

  return properties.reduce<
    Record<
      string,
      {
        total: number;
        available: number;
        sold: number;
      }
    >
  >((result, property) => {
    if (!result[property.state]) {
      result[property.state] = {
        total: 0,
        available: 0,
        sold: 0,
      };
    }

    result[property.state].total++;

    if (property.status === "Available") {
      result[property.state].available++;
    } else {
      result[property.state].sold++;
    }

    return result;
  }, {});
}