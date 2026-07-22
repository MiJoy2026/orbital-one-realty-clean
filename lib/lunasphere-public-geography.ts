/**
 * Serializable geography DTOs shared by server loaders and client map layers.
 * These types contain no database or Prisma dependencies.
 */
export type PublicLunaSphereSettlement = {
  id: string;
  stateId: string;
  stateName: string;
  stateNumber: number;
  kind: "city" | "town";
  territoryNumber: number;
  name: string;
  slug: string;
  center: [number, number];
  boundary: [number, number][];
};
