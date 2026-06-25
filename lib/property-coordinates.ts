export const stateCenters: Record<
  string,
  {
    x: number;
    y: number;
  }
> = {
  Clavius: { x: 420, y: 690 },
  Schiller: { x: 610, y: 410 },
  Copernicus: { x: 330, y: 275 },
  Tycho: { x: 455, y: 575 },
  Plato: { x: 470, y: 160 },
  Kepler: { x: 365, y: 330 },
  Aristarchus: { x: 250, y: 250 },
  Archimedes: { x: 520, y: 235 },

  // Temporary default for the remaining states.
  // We'll replace these with true atlas coordinates
  // as we continue building the map.

  Default: { x: 500, y: 500 },
};

export function getPropertyCoordinates(
  state: string,
  propertyId: string
) {
  const center = stateCenters[state] ?? stateCenters.Default;

  // Create a deterministic offset from the property ID.
  // The same property will always receive the same location.

  let hash = 0;

  for (const ch of propertyId) {
    hash = (hash * 31 + ch.charCodeAt(0)) % 100000;
  }

  const angle = (hash % 360) * (Math.PI / 180);

  const radius = 15 + (hash % 40);

  return {
    x: center.x + Math.cos(angle) * radius,
    y: center.y + Math.sin(angle) * radius,
  };
}