import {
  LUNAR_CANVAS,
  LUNASPHERE_WORLD_METADATA,
  WORLD_COUNTS,
  calculatePolygonArea,
  createSlug,
  createStateId,
  isFiniteCoordinate,
  isInsideCanvas,
  type LunarCoordinate,
  type LunarPolygon,
  type MutableLunarCoordinate,
} from "./lunasphere-world-model";

export type TopologySourceRegion = {
  name: string;
  positions: readonly LunarCoordinate[];
  labelPosition: LunarCoordinate;
};

const DEFAULT_COORDINATE_PRECISION = 4;
const DEFAULT_COMPARISON_TOLERANCE = 0.001;
const SALEABLE_MOON_TOLERANCE = 0.01;

export type LunaSphereTopologyStatus =
  | "draft"
  | "approved"
  | "published"
  | "archived";

export type LunaSphereBoundaryKind =
  | "shared-state-border"
  | "moon-perimeter";

export type LunaSphereEdgeDirection = "forward" | "reverse";

export type LunaSphereTopologyNode = {
  id: string;
  coordinate: MutableLunarCoordinate;
};

/**
 * A topology edge is an ordered polyline. Shared state borders are stored once
 * and referenced in opposite directions by the two neighboring states.
 */
export type LunaSphereTopologyEdge = {
  id: string;
  nodeIds: string[];
  stateIds: string[];
  kind: LunaSphereBoundaryKind;
};

export type LunaSphereStateEdgeReference = {
  edgeId: string;
  direction: LunaSphereEdgeDirection;
};

export type LunaSphereTopologyState = {
  id: string;
  stateNumber: number;
  name: string;
  slug: string;
  labelPosition: MutableLunarCoordinate;
  edges: LunaSphereStateEdgeReference[];
};

export type LunaSphereTopology = {
  id: string;
  worldId: string;
  worldVersion: string;
  schemaVersion: number;
  revision: number;
  status: LunaSphereTopologyStatus;
  coordinatePrecision: number;
  nodes: LunaSphereTopologyNode[];
  edges: LunaSphereTopologyEdge[];
  states: LunaSphereTopologyState[];
};

export type TopologyValidationSeverity =
  | "error"
  | "warning"
  | "information";

export type TopologyValidationIssue = {
  severity: TopologyValidationSeverity;
  code: string;
  message: string;
  entityId?: string;
  entityName?: string;
};

export type TopologyValidationResult = {
  valid: boolean;
  errors: TopologyValidationIssue[];
  warnings: TopologyValidationIssue[];
  information: TopologyValidationIssue[];
  issueCount: number;
};

export type TopologyReconstructionComparison = {
  valid: boolean;
  comparedStateCount: number;
  mismatchedStateNames: string[];
  maximumCoordinateDifference: number;
};

type AtomicEdge = {
  id: string;
  nodeIds: [string, string];
  stateIds: string[];
};

type AtomicStateEdgeReference = {
  edgeId: string;
  direction: LunaSphereEdgeDirection;
};

type AtomicState = Omit<LunaSphereTopologyState, "edges"> & {
  edges: AtomicStateEdgeReference[];
};

function padNumber(value: number, width: number): string {
  return Math.trunc(value).toString().padStart(width, "0");
}

function roundCoordinateValue(
  value: number,
  precision: number
): number {
  const multiplier = 10 ** precision;
  return Math.round(value * multiplier) / multiplier;
}

function normalizeCoordinate(
  coordinate: LunarCoordinate,
  precision: number
): MutableLunarCoordinate {
  return [
    roundCoordinateValue(coordinate[0], precision),
    roundCoordinateValue(coordinate[1], precision),
  ];
}

function coordinateKey(
  coordinate: LunarCoordinate,
  precision: number
): string {
  const [y, x] = normalizeCoordinate(coordinate, precision);
  return `${y.toFixed(precision)}:${x.toFixed(precision)}`;
}

function coordinatesAreEqual(
  first: LunarCoordinate,
  second: LunarCoordinate,
  tolerance = DEFAULT_COMPARISON_TOLERANCE
): boolean {
  return (
    Math.abs(first[0] - second[0]) <= tolerance &&
    Math.abs(first[1] - second[1]) <= tolerance
  );
}

function normalizePolygon(
  polygon: LunarPolygon,
  precision: number
): MutableLunarCoordinate[] {
  const normalized: MutableLunarCoordinate[] = [];
  const equalityTolerance = 10 ** -precision;

  for (const coordinate of polygon) {
    const nextCoordinate = normalizeCoordinate(
      coordinate,
      precision
    );
    const previousCoordinate = normalized.at(-1);

    if (
      !previousCoordinate ||
      !coordinatesAreEqual(
        previousCoordinate,
        nextCoordinate,
        equalityTolerance
      )
    ) {
      normalized.push(nextCoordinate);
    }
  }

  if (
    normalized.length > 1 &&
    coordinatesAreEqual(
      normalized[0],
      normalized[normalized.length - 1],
      equalityTolerance
    )
  ) {
    normalized.pop();
  }

  return normalized;
}

function canonicalPairKey(
  firstValue: string,
  secondValue: string
): string {
  return firstValue < secondValue
    ? `${firstValue}:${secondValue}`
    : `${secondValue}:${firstValue}`;
}

function canonicalSequenceKey(values: readonly string[]): string {
  const forwardKey = values.join(":");
  const reverseKey = [...values].reverse().join(":");
  return forwardKey < reverseKey ? forwardKey : reverseKey;
}

function stateOwnerSignature(stateIds: readonly string[]): string {
  return [...stateIds].sort().join(":");
}

function createValidationResult(
  issues: TopologyValidationIssue[]
): TopologyValidationResult {
  const errors = issues.filter(
    (issue) => issue.severity === "error"
  );
  const warnings = issues.filter(
    (issue) => issue.severity === "warning"
  );
  const information = issues.filter(
    (issue) => issue.severity === "information"
  );

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    information,
    issueCount: issues.length,
  };
}

function getDirectedAtomicNodeIds(
  edge: AtomicEdge,
  direction: LunaSphereEdgeDirection
): [string, string] {
  return direction === "forward"
    ? edge.nodeIds
    : [edge.nodeIds[1], edge.nodeIds[0]];
}

function rotateAtomicReferencesToGroupBoundary(
  references: readonly AtomicStateEdgeReference[],
  atomicEdgeById: ReadonlyMap<string, AtomicEdge>
): AtomicStateEdgeReference[] {
  if (references.length < 2) {
    return [...references];
  }

  const signatures = references.map((reference) => {
    const edge = atomicEdgeById.get(reference.edgeId);
    return edge ? stateOwnerSignature(edge.stateIds) : "missing";
  });

  const rotationIndex = signatures.findIndex(
    (signature, index) =>
      signature !==
      signatures[(index - 1 + signatures.length) % signatures.length]
  );

  if (rotationIndex <= 0) {
    return [...references];
  }

  return [
    ...references.slice(rotationIndex),
    ...references.slice(0, rotationIndex),
  ];
}

function createMergedTopology(
  atomicEdges: readonly AtomicEdge[],
  atomicStates: readonly AtomicState[]
): {
  edges: LunaSphereTopologyEdge[];
  states: LunaSphereTopologyState[];
} {
  const atomicEdgeById = new Map(
    atomicEdges.map((edge) => [edge.id, edge] as const)
  );
  const mergedEdges: LunaSphereTopologyEdge[] = [];
  const mergedEdgeIdByAtomicSequence = new Map<string, string>();
  const mergedEdgeById = new Map<
    string,
    LunaSphereTopologyEdge
  >();

  const states = atomicStates.map((state) => {
    const references = rotateAtomicReferencesToGroupBoundary(
      state.edges,
      atomicEdgeById
    );
    const groups: AtomicStateEdgeReference[][] = [];

    for (const reference of references) {
      const edge = atomicEdgeById.get(reference.edgeId);

      if (!edge) {
        continue;
      }

      const signature = stateOwnerSignature(edge.stateIds);
      const currentGroup = groups.at(-1);
      const currentGroupEdge = currentGroup
        ? atomicEdgeById.get(currentGroup[0].edgeId)
        : undefined;
      const currentSignature = currentGroupEdge
        ? stateOwnerSignature(currentGroupEdge.stateIds)
        : null;

      if (!currentGroup || currentSignature !== signature) {
        groups.push([reference]);
      } else {
        currentGroup.push(reference);
      }
    }

    const mergedReferences: LunaSphereStateEdgeReference[] = [];

    for (const group of groups) {
      const atomicEdgeIds = group.map(
        (reference) => reference.edgeId
      );
      const sequenceKey = canonicalSequenceKey(atomicEdgeIds);
      let mergedEdgeId =
        mergedEdgeIdByAtomicSequence.get(sequenceKey);
      let mergedEdge = mergedEdgeId
        ? mergedEdgeById.get(mergedEdgeId)
        : undefined;

      const firstAtomicEdge = atomicEdgeById.get(group[0].edgeId);

      if (!firstAtomicEdge) {
        continue;
      }

      const directedNodeIds: string[] = [];

      for (const reference of group) {
        const atomicEdge = atomicEdgeById.get(reference.edgeId);

        if (!atomicEdge) {
          continue;
        }

        const [startNodeId, endNodeId] =
          getDirectedAtomicNodeIds(
            atomicEdge,
            reference.direction
          );

        if (directedNodeIds.length === 0) {
          directedNodeIds.push(startNodeId, endNodeId);
        } else if (directedNodeIds.at(-1) === startNodeId) {
          directedNodeIds.push(endNodeId);
        }
      }

      if (!mergedEdge) {
        mergedEdgeId = `edge-${padNumber(
          mergedEdges.length + 1,
          5
        )}`;
        mergedEdge = {
          id: mergedEdgeId,
          nodeIds: directedNodeIds,
          stateIds: [...firstAtomicEdge.stateIds].sort(),
          kind:
            firstAtomicEdge.stateIds.length === 2
              ? "shared-state-border"
              : "moon-perimeter",
        };

        mergedEdges.push(mergedEdge);
        mergedEdgeById.set(mergedEdgeId, mergedEdge);
        mergedEdgeIdByAtomicSequence.set(
          sequenceKey,
          mergedEdgeId
        );
      }

      const direction: LunaSphereEdgeDirection =
        mergedEdge.nodeIds[0] === directedNodeIds[0] &&
        mergedEdge.nodeIds.at(-1) === directedNodeIds.at(-1)
          ? "forward"
          : "reverse";

      mergedReferences.push({
        edgeId: mergedEdge.id,
        direction,
      });
    }

    return {
      ...state,
      edges: mergedReferences,
    };
  });

  return {
    edges: mergedEdges,
    states,
  };
}

export function createTopologyFromRegions(
  regions: readonly TopologySourceRegion[],
  options: {
    topologyId?: string;
    status?: LunaSphereTopologyStatus;
    coordinatePrecision?: number;
  } = {}
): LunaSphereTopology {
  const coordinatePrecision =
    options.coordinatePrecision ?? DEFAULT_COORDINATE_PRECISION;

  const nodes: LunaSphereTopologyNode[] = [];
  const atomicEdges: AtomicEdge[] = [];
  const atomicStates: AtomicState[] = [];

  const nodeIdByCoordinate = new Map<string, string>();
  const atomicEdgeIdByNodePair = new Map<string, string>();
  const atomicEdgeById = new Map<string, AtomicEdge>();

  function getOrCreateNodeId(
    coordinate: LunarCoordinate
  ): string {
    const normalizedCoordinate = normalizeCoordinate(
      coordinate,
      coordinatePrecision
    );
    const key = coordinateKey(
      normalizedCoordinate,
      coordinatePrecision
    );
    const existingNodeId = nodeIdByCoordinate.get(key);

    if (existingNodeId) {
      return existingNodeId;
    }

    const nodeId = `node-${padNumber(nodes.length + 1, 5)}`;

    nodes.push({
      id: nodeId,
      coordinate: normalizedCoordinate,
    });
    nodeIdByCoordinate.set(key, nodeId);

    return nodeId;
  }

  regions.forEach((region, regionIndex) => {
    const stateNumber = regionIndex + 1;
    const stateId = createStateId(stateNumber);
    const polygon = normalizePolygon(
      region.positions,
      coordinatePrecision
    );
    const edgeReferences: AtomicStateEdgeReference[] = [];

    if (polygon.length >= 2) {
      for (let index = 0; index < polygon.length; index += 1) {
        const startCoordinate = polygon[index];
        const endCoordinate = polygon[(index + 1) % polygon.length];
        const startNodeId = getOrCreateNodeId(startCoordinate);
        const endNodeId = getOrCreateNodeId(endCoordinate);

        if (startNodeId === endNodeId) {
          continue;
        }

        const edgeKey = canonicalPairKey(
          startNodeId,
          endNodeId
        );
        let atomicEdgeId =
          atomicEdgeIdByNodePair.get(edgeKey);
        let atomicEdge = atomicEdgeId
          ? atomicEdgeById.get(atomicEdgeId)
          : undefined;

        if (!atomicEdge) {
          atomicEdgeId = `atomic-edge-${padNumber(
            atomicEdges.length + 1,
            5
          )}`;
          atomicEdge = {
            id: atomicEdgeId,
            nodeIds: [startNodeId, endNodeId],
            stateIds: [],
          };

          atomicEdges.push(atomicEdge);
          atomicEdgeById.set(atomicEdgeId, atomicEdge);
          atomicEdgeIdByNodePair.set(edgeKey, atomicEdgeId);
        }

        if (!atomicEdge.stateIds.includes(stateId)) {
          atomicEdge.stateIds.push(stateId);
        }

        const direction: LunaSphereEdgeDirection =
          atomicEdge.nodeIds[0] === startNodeId &&
          atomicEdge.nodeIds[1] === endNodeId
            ? "forward"
            : "reverse";

        edgeReferences.push({
          edgeId: atomicEdge.id,
          direction,
        });
      }
    }

    atomicStates.push({
      id: stateId,
      stateNumber,
      name: region.name,
      slug: createSlug(region.name),
      labelPosition: normalizeCoordinate(
        region.labelPosition,
        coordinatePrecision
      ),
      edges: edgeReferences,
    });
  });

  const { edges, states } = createMergedTopology(
    atomicEdges,
    atomicStates
  );

  return {
    id:
      options.topologyId ??
      `${LUNASPHERE_WORLD_METADATA.id}-topology-${LUNASPHERE_WORLD_METADATA.worldVersion}`,
    worldId: LUNASPHERE_WORLD_METADATA.id,
    worldVersion: LUNASPHERE_WORLD_METADATA.worldVersion,
    schemaVersion: 1,
    revision: 1,
    status: options.status ?? "draft",
    coordinatePrecision,
    nodes,
    edges,
    states,
  };
}

export function cloneTopology(
  topology: LunaSphereTopology
): LunaSphereTopology {
  return {
    ...topology,
    nodes: topology.nodes.map((node) => ({
      ...node,
      coordinate: [...node.coordinate] as MutableLunarCoordinate,
    })),
    edges: topology.edges.map((edge) => ({
      ...edge,
      nodeIds: [...edge.nodeIds],
      stateIds: [...edge.stateIds],
    })),
    states: topology.states.map((state) => ({
      ...state,
      labelPosition: [
        ...state.labelPosition,
      ] as MutableLunarCoordinate,
      edges: state.edges.map((edgeReference) => ({
        ...edgeReference,
      })),
    })),
  };
}

export function getTopologyState(
  topology: LunaSphereTopology,
  stateIdOrName: string
): LunaSphereTopologyState | undefined {
  const normalizedValue = stateIdOrName.trim().toLowerCase();

  return topology.states.find(
    (state) =>
      state.id.toLowerCase() === normalizedValue ||
      state.name.toLowerCase() === normalizedValue ||
      state.slug.toLowerCase() === normalizedValue
  );
}

export function getDirectedEdgeNodeIds(
  edge: LunaSphereTopologyEdge,
  direction: LunaSphereEdgeDirection
): string[] {
  return direction === "forward"
    ? [...edge.nodeIds]
    : [...edge.nodeIds].reverse();
}

export function getStateBoundaryNodeIds(
  topology: LunaSphereTopology,
  stateIdOrName: string
): string[] {
  const state = getTopologyState(topology, stateIdOrName);

  if (!state) {
    return [];
  }

  const edgeById = new Map(
    topology.edges.map((edge) => [edge.id, edge] as const)
  );
  const boundaryNodeIds: string[] = [];

  for (const edgeReference of state.edges) {
    const edge = edgeById.get(edgeReference.edgeId);

    if (!edge) {
      continue;
    }

    const directedNodeIds = getDirectedEdgeNodeIds(
      edge,
      edgeReference.direction
    );

    if (directedNodeIds.length < 2) {
      continue;
    }

    boundaryNodeIds.push(...directedNodeIds.slice(0, -1));
  }

  return boundaryNodeIds;
}

export function getStateBoundaryFromTopology(
  topology: LunaSphereTopology,
  stateIdOrName: string
): MutableLunarCoordinate[] {
  const nodeById = new Map(
    topology.nodes.map((node) => [node.id, node] as const)
  );

  return getStateBoundaryNodeIds(topology, stateIdOrName)
    .map((nodeId) => nodeById.get(nodeId))
    .filter(
      (node): node is LunaSphereTopologyNode => Boolean(node)
    )
    .map((node) => [
      node.coordinate[0],
      node.coordinate[1],
    ]);
}

export function topologyToLunarMapRegions(
  topology: LunaSphereTopology
): TopologySourceRegion[] {
  return topology.states.map((state) => ({
    name: state.name,
    labelPosition: [
      state.labelPosition[0],
      state.labelPosition[1],
    ],
    positions: getStateBoundaryFromTopology(
      topology,
      state.id
    ),
  }));
}

export function getStateNodeIds(
  topology: LunaSphereTopology,
  stateIdOrName: string
): string[] {
  return [
    ...new Set(
      getStateBoundaryNodeIds(topology, stateIdOrName)
    ),
  ];
}

export function getStateEdges(
  topology: LunaSphereTopology,
  stateIdOrName: string
): LunaSphereTopologyEdge[] {
  const state = getTopologyState(topology, stateIdOrName);

  if (!state) {
    return [];
  }

  const edgeById = new Map(
    topology.edges.map((edge) => [edge.id, edge] as const)
  );

  return state.edges
    .map((edgeReference) => edgeById.get(edgeReference.edgeId))
    .filter(
      (edge): edge is LunaSphereTopologyEdge => Boolean(edge)
    );
}

/**
 * Restores every edge used by one state from a known baseline topology.
 * Shared edges and junction nodes are restored once, so neighboring states
 * remain connected and receive the same border correction automatically.
 */
export function restoreTopologyState(
  topology: LunaSphereTopology,
  baseline: LunaSphereTopology,
  stateIdOrName: string
): LunaSphereTopology {
  const currentState = getTopologyState(
    topology,
    stateIdOrName
  );
  const baselineState = getTopologyState(
    baseline,
    stateIdOrName
  );

  if (!currentState || !baselineState) {
    return topology;
  }

  const affectedEdgeIds = new Set(
    baselineState.edges.map(
      (edgeReference) => edgeReference.edgeId
    )
  );
  const baselineEdgeById = new Map(
    baseline.edges.map((edge) => [edge.id, edge] as const)
  );
  const baselineNodeById = new Map(
    baseline.nodes.map((node) => [node.id, node] as const)
  );
  const currentNodeById = new Map(
    topology.nodes.map((node) => [node.id, node] as const)
  );

  const edges = topology.edges.map((edge) => {
    if (!affectedEdgeIds.has(edge.id)) {
      return {
        ...edge,
        nodeIds: [...edge.nodeIds],
        stateIds: [...edge.stateIds],
      };
    }

    const baselineEdge = baselineEdgeById.get(edge.id);

    return baselineEdge
      ? {
          ...baselineEdge,
          nodeIds: [...baselineEdge.nodeIds],
          stateIds: [...baselineEdge.stateIds],
        }
      : {
          ...edge,
          nodeIds: [...edge.nodeIds],
          stateIds: [...edge.stateIds],
        };
  });

  const referencedNodeIds = new Set(
    edges.flatMap((edge) => edge.nodeIds)
  );
  const restoredNodeIds = new Set(
    baseline.edges
      .filter((edge) => affectedEdgeIds.has(edge.id))
      .flatMap((edge) => edge.nodeIds)
  );
  const orderedNodeIds = [
    ...topology.nodes.map((node) => node.id),
    ...baseline.nodes.map((node) => node.id),
  ].filter(
    (nodeId, index, allNodeIds) =>
      referencedNodeIds.has(nodeId) &&
      allNodeIds.indexOf(nodeId) === index
  );

  const nodes = orderedNodeIds
    .map((nodeId) => {
      const sourceNode = restoredNodeIds.has(nodeId)
        ? baselineNodeById.get(nodeId)
        : currentNodeById.get(nodeId) ??
          baselineNodeById.get(nodeId);

      return sourceNode
        ? {
            ...sourceNode,
            coordinate: [
              sourceNode.coordinate[0],
              sourceNode.coordinate[1],
            ] as MutableLunarCoordinate,
          }
        : null;
    })
    .filter(
      (node): node is LunaSphereTopologyNode =>
        Boolean(node)
    );

  return {
    ...topology,
    revision: topology.revision + 1,
    nodes,
    edges,
  };
}

export function moveTopologyNode(
  topology: LunaSphereTopology,
  nodeId: string,
  nextCoordinate: LunarCoordinate
): LunaSphereTopology {
  if (!isFiniteCoordinate(nextCoordinate)) {
    return topology;
  }

  const normalizedCoordinate = normalizeCoordinate(
    nextCoordinate,
    topology.coordinatePrecision
  );
  let nodeWasFound = false;

  const nodes = topology.nodes.map((node) => {
    if (node.id !== nodeId) {
      return node;
    }

    nodeWasFound = true;

    return {
      ...node,
      coordinate: normalizedCoordinate,
    };
  });

  return nodeWasFound
    ? {
        ...topology,
        revision: topology.revision + 1,
        nodes,
      }
    : topology;
}

function getNextNodeId(
  topology: LunaSphereTopology
): string {
  const highestNodeNumber = topology.nodes.reduce(
    (highestValue, node) => {
      const match = node.id.match(/^node-(\d+)$/);
      const nodeNumber = match ? Number(match[1]) : 0;
      return Math.max(highestValue, nodeNumber);
    },
    0
  );

  return `node-${padNumber(highestNodeNumber + 1, 5)}`;
}

/**
 * Adds a shape-control point between two existing points on an edge. Because
 * the edge itself is shared, both neighboring states receive the same detail.
 */
export function insertTopologyEdgeNode(
  topology: LunaSphereTopology,
  edgeId: string,
  segmentIndex: number,
  coordinate: LunarCoordinate
): LunaSphereTopology {
  if (!isFiniteCoordinate(coordinate)) {
    return topology;
  }

  const edge = topology.edges.find(
    (candidate) => candidate.id === edgeId
  );

  if (
    !edge ||
    segmentIndex < 0 ||
    segmentIndex >= edge.nodeIds.length - 1
  ) {
    return topology;
  }

  const normalizedCoordinate = normalizeCoordinate(
    coordinate,
    topology.coordinatePrecision
  );
  const nodeById = new Map(
    topology.nodes.map((node) => [node.id, node] as const)
  );
  const segmentStart = nodeById.get(edge.nodeIds[segmentIndex]);
  const segmentEnd = nodeById.get(edge.nodeIds[segmentIndex + 1]);

  if (
    !segmentStart ||
    !segmentEnd ||
    coordinatesAreEqual(
      normalizedCoordinate,
      segmentStart.coordinate
    ) ||
    coordinatesAreEqual(
      normalizedCoordinate,
      segmentEnd.coordinate
    )
  ) {
    return topology;
  }

  const nodeId = getNextNodeId(topology);

  return {
    ...topology,
    revision: topology.revision + 1,
    nodes: [
      ...topology.nodes,
      {
        id: nodeId,
        coordinate: normalizedCoordinate,
      },
    ],
    edges: topology.edges.map((candidate) =>
      candidate.id === edgeId
        ? {
            ...candidate,
            nodeIds: [
              ...candidate.nodeIds.slice(0, segmentIndex + 1),
              nodeId,
              ...candidate.nodeIds.slice(segmentIndex + 1),
            ],
          }
        : candidate
    ),
  };
}

/**
 * Removes only an interior shape-control point. Junction/end nodes are kept so
 * state adjacency cannot be broken accidentally.
 */
export function removeTopologyEdgeNode(
  topology: LunaSphereTopology,
  edgeId: string,
  nodeId: string
): LunaSphereTopology {
  const edge = topology.edges.find(
    (candidate) => candidate.id === edgeId
  );

  if (!edge || edge.nodeIds.length <= 2) {
    return topology;
  }

  const nodeIndex = edge.nodeIds.indexOf(nodeId);

  if (nodeIndex <= 0 || nodeIndex >= edge.nodeIds.length - 1) {
    return topology;
  }

  const nodeIsUsedElsewhere = topology.edges.some(
    (candidate) =>
      candidate.id !== edgeId && candidate.nodeIds.includes(nodeId)
  );

  return {
    ...topology,
    revision: topology.revision + 1,
    nodes: nodeIsUsedElsewhere
      ? topology.nodes
      : topology.nodes.filter((node) => node.id !== nodeId),
    edges: topology.edges.map((candidate) =>
      candidate.id === edgeId
        ? {
            ...candidate,
            nodeIds: candidate.nodeIds.filter(
              (candidateNodeId) => candidateNodeId !== nodeId
            ),
          }
        : candidate
    ),
  };
}

function isInsideSaleableMoonWithTolerance(
  coordinate: LunarCoordinate
): boolean {
  const [y, x] = coordinate;
  const deltaX = x - LUNAR_CANVAS.centerX;
  const deltaY = y - LUNAR_CANVAS.centerY;
  const maximumRadius =
    LUNAR_CANVAS.saleableRadius + SALEABLE_MOON_TOLERANCE;

  return (
    deltaX * deltaX + deltaY * deltaY <=
    maximumRadius * maximumRadius
  );
}

export function validateTopology(
  topology: LunaSphereTopology
): TopologyValidationResult {
  const issues: TopologyValidationIssue[] = [];
  const nodeById = new Map(
    topology.nodes.map((node) => [node.id, node] as const)
  );
  const edgeById = new Map(
    topology.edges.map((edge) => [edge.id, edge] as const)
  );
  const stateById = new Map(
    topology.states.map((state) => [state.id, state] as const)
  );

  if (topology.states.length !== WORLD_COUNTS.states) {
    issues.push({
      severity: "error",
      code: "TOPOLOGY_STATE_COUNT_MISMATCH",
      message: `Topology requires exactly ${WORLD_COUNTS.states} states; received ${topology.states.length}.`,
    });
  }

  const seenNodeIds = new Set<string>();

  for (const node of topology.nodes) {
    if (seenNodeIds.has(node.id)) {
      issues.push({
        severity: "error",
        code: "DUPLICATE_TOPOLOGY_NODE_ID",
        message: `Duplicate topology node ID: ${node.id}.`,
        entityId: node.id,
      });
    }

    seenNodeIds.add(node.id);

    if (!isFiniteCoordinate(node.coordinate)) {
      issues.push({
        severity: "error",
        code: "INVALID_TOPOLOGY_NODE_COORDINATE",
        message: `Node ${node.id} contains an invalid coordinate.`,
        entityId: node.id,
      });
      continue;
    }

    if (!isInsideCanvas(node.coordinate)) {
      issues.push({
        severity: "error",
        code: "TOPOLOGY_NODE_OUTSIDE_CANVAS",
        message: `Node ${node.id} is outside the LunaSphere canvas.`,
        entityId: node.id,
      });
    }
  }

  const seenEdgeIds = new Set<string>();
  const usedNodeIds = new Set<string>();

  for (const edge of topology.edges) {
    if (seenEdgeIds.has(edge.id)) {
      issues.push({
        severity: "error",
        code: "DUPLICATE_TOPOLOGY_EDGE_ID",
        message: `Duplicate topology edge ID: ${edge.id}.`,
        entityId: edge.id,
      });
    }

    seenEdgeIds.add(edge.id);

    if (edge.nodeIds.length < 2) {
      issues.push({
        severity: "error",
        code: "TOPOLOGY_EDGE_TOO_FEW_NODES",
        message: `Edge ${edge.id} must contain at least two nodes.`,
        entityId: edge.id,
      });
    }

    edge.nodeIds.forEach((nodeId, nodeIndex) => {
      usedNodeIds.add(nodeId);

      if (!nodeById.has(nodeId)) {
        issues.push({
          severity: "error",
          code: "TOPOLOGY_EDGE_NODE_MISSING",
          message: `Edge ${edge.id} references missing node ${nodeId}.`,
          entityId: edge.id,
        });
      }

      if (
        nodeIndex > 0 &&
        edge.nodeIds[nodeIndex - 1] === nodeId
      ) {
        issues.push({
          severity: "error",
          code: "TOPOLOGY_EDGE_DUPLICATE_ADJACENT_NODE",
          message: `Edge ${edge.id} contains duplicate adjacent node ${nodeId}.`,
          entityId: edge.id,
        });
      }
    });

    if (edge.stateIds.length < 1 || edge.stateIds.length > 2) {
      issues.push({
        severity: "error",
        code: "TOPOLOGY_EDGE_STATE_COUNT_INVALID",
        message: `Edge ${edge.id} must belong to one or two states; received ${edge.stateIds.length}.`,
        entityId: edge.id,
      });
    }

    for (const stateId of edge.stateIds) {
      if (!stateById.has(stateId)) {
        issues.push({
          severity: "error",
          code: "TOPOLOGY_EDGE_STATE_MISSING",
          message: `Edge ${edge.id} references missing state ${stateId}.`,
          entityId: edge.id,
        });
      }
    }

    const expectedKind: LunaSphereBoundaryKind =
      edge.stateIds.length === 2
        ? "shared-state-border"
        : "moon-perimeter";

    if (edge.kind !== expectedKind) {
      issues.push({
        severity: "error",
        code: "TOPOLOGY_EDGE_KIND_MISMATCH",
        message: `Edge ${edge.id} has kind ${edge.kind}, but its ownership requires ${expectedKind}.`,
        entityId: edge.id,
      });
    }
  }

  for (const node of topology.nodes) {
    if (!usedNodeIds.has(node.id)) {
      issues.push({
        severity: "warning",
        code: "TOPOLOGY_ORPHAN_NODE",
        message: `Node ${node.id} is not used by any boundary edge.`,
        entityId: node.id,
      });
    }
  }

  const seenStateIds = new Set<string>();
  const seenStateNumbers = new Set<number>();
  const seenStateSlugs = new Set<string>();

  for (const state of topology.states) {
    if (seenStateIds.has(state.id)) {
      issues.push({
        severity: "error",
        code: "DUPLICATE_TOPOLOGY_STATE_ID",
        message: `Duplicate topology state ID: ${state.id}.`,
        entityId: state.id,
        entityName: state.name,
      });
    }

    seenStateIds.add(state.id);

    if (seenStateNumbers.has(state.stateNumber)) {
      issues.push({
        severity: "error",
        code: "DUPLICATE_TOPOLOGY_STATE_NUMBER",
        message: `Duplicate topology state number: ${state.stateNumber}.`,
        entityId: state.id,
        entityName: state.name,
      });
    }

    seenStateNumbers.add(state.stateNumber);

    if (seenStateSlugs.has(state.slug)) {
      issues.push({
        severity: "error",
        code: "DUPLICATE_TOPOLOGY_STATE_SLUG",
        message: `Duplicate topology state slug: ${state.slug}.`,
        entityId: state.id,
        entityName: state.name,
      });
    }

    seenStateSlugs.add(state.slug);

    if (state.edges.length < 3) {
      issues.push({
        severity: "error",
        code: "TOPOLOGY_STATE_TOO_FEW_EDGES",
        message: `${state.name} must contain at least three boundary edges.`,
        entityId: state.id,
        entityName: state.name,
      });
    }

    const directedStateEdges: string[][] = [];

    for (const edgeReference of state.edges) {
      const edge = edgeById.get(edgeReference.edgeId);

      if (!edge) {
        issues.push({
          severity: "error",
          code: "TOPOLOGY_STATE_EDGE_MISSING",
          message: `${state.name} references missing edge ${edgeReference.edgeId}.`,
          entityId: state.id,
          entityName: state.name,
        });
        continue;
      }

      if (!edge.stateIds.includes(state.id)) {
        issues.push({
          severity: "error",
          code: "TOPOLOGY_STATE_EDGE_OWNERSHIP_MISMATCH",
          message: `${state.name} references edge ${edge.id}, but the edge does not list the state as an owner.`,
          entityId: state.id,
          entityName: state.name,
        });
      }

      directedStateEdges.push(
        getDirectedEdgeNodeIds(edge, edgeReference.direction)
      );
    }

    for (
      let edgeIndex = 0;
      edgeIndex < directedStateEdges.length;
      edgeIndex += 1
    ) {
      const currentEdge = directedStateEdges[edgeIndex];
      const nextEdge =
        directedStateEdges[
          (edgeIndex + 1) % directedStateEdges.length
        ];

      if (
        currentEdge.length > 0 &&
        nextEdge.length > 0 &&
        currentEdge.at(-1) !== nextEdge[0]
      ) {
        issues.push({
          severity: "error",
          code: "TOPOLOGY_STATE_EDGE_DISCONTINUITY",
          message: `${state.name} contains a gap between consecutive boundary edges.`,
          entityId: state.id,
          entityName: state.name,
        });
        break;
      }
    }

    const boundary = getStateBoundaryFromTopology(
      topology,
      state.id
    );

    if (boundary.length < 3) {
      continue;
    }

    if (calculatePolygonArea(boundary) <= 0) {
      issues.push({
        severity: "error",
        code: "TOPOLOGY_STATE_ZERO_AREA",
        message: `${state.name} reconstructs to a zero-area boundary.`,
        entityId: state.id,
        entityName: state.name,
      });
    }

    for (const coordinate of boundary) {
      if (!isInsideSaleableMoonWithTolerance(coordinate)) {
        issues.push({
          severity: "warning",
          code: "TOPOLOGY_STATE_OUTSIDE_SALEABLE_MOON",
          message: `${state.name} contains a boundary node outside the saleable lunar disc.`,
          entityId: state.id,
          entityName: state.name,
        });
        break;
      }
    }
  }

  return createValidationResult(issues);
}

export function compareTopologyToRegions(
  topology: LunaSphereTopology,
  regions: readonly TopologySourceRegion[],
  tolerance = DEFAULT_COMPARISON_TOLERANCE
): TopologyReconstructionComparison {
  const mismatchedStateNames: string[] = [];
  let maximumCoordinateDifference = 0;

  for (const region of regions) {
    const originalBoundary = normalizePolygon(
      region.positions,
      topology.coordinatePrecision
    );
    const reconstructedBoundary = getStateBoundaryFromTopology(
      topology,
      region.name
    );

    if (originalBoundary.length !== reconstructedBoundary.length) {
      mismatchedStateNames.push(region.name);
      continue;
    }

    const candidateStartIndexes = reconstructedBoundary
      .map((coordinate, index) =>
        coordinatesAreEqual(
          originalBoundary[0],
          coordinate,
          tolerance
        )
          ? index
          : -1
      )
      .filter((index) => index >= 0);

    let stateMatches = false;
    let smallestStateMaximumDifference =
      Number.POSITIVE_INFINITY;

    for (const startIndex of candidateStartIndexes) {
      let candidateMatches = true;
      let candidateMaximumDifference = 0;

      for (
        let index = 0;
        index < originalBoundary.length;
        index += 1
      ) {
        const originalCoordinate = originalBoundary[index];
        const reconstructedCoordinate =
          reconstructedBoundary[
            (startIndex + index) % reconstructedBoundary.length
          ];
        const coordinateDifference = Math.max(
          Math.abs(
            originalCoordinate[0] - reconstructedCoordinate[0]
          ),
          Math.abs(
            originalCoordinate[1] - reconstructedCoordinate[1]
          )
        );

        candidateMaximumDifference = Math.max(
          candidateMaximumDifference,
          coordinateDifference
        );

        if (coordinateDifference > tolerance) {
          candidateMatches = false;
          break;
        }
      }

      smallestStateMaximumDifference = Math.min(
        smallestStateMaximumDifference,
        candidateMaximumDifference
      );

      if (candidateMatches) {
        stateMatches = true;
        maximumCoordinateDifference = Math.max(
          maximumCoordinateDifference,
          candidateMaximumDifference
        );
        break;
      }
    }

    if (!stateMatches) {
      if (Number.isFinite(smallestStateMaximumDifference)) {
        maximumCoordinateDifference = Math.max(
          maximumCoordinateDifference,
          smallestStateMaximumDifference
        );
      }

      mismatchedStateNames.push(region.name);
    }
  }

  return {
    valid:
      regions.length === topology.states.length &&
      mismatchedStateNames.length === 0,
    comparedStateCount: regions.length,
    mismatchedStateNames,
    maximumCoordinateDifference,
  };
}

export function createTopologySummary(
  topology: LunaSphereTopology
): {
  stateCount: number;
  nodeCount: number;
  edgeCount: number;
  sharedEdgeCount: number;
  moonPerimeterEdgeCount: number;
  boundaryVertexCount: number;
} {
  return {
    stateCount: topology.states.length,
    nodeCount: topology.nodes.length,
    edgeCount: topology.edges.length,
    sharedEdgeCount: topology.edges.filter(
      (edge) => edge.kind === "shared-state-border"
    ).length,
    moonPerimeterEdgeCount: topology.edges.filter(
      (edge) => edge.kind === "moon-perimeter"
    ).length,
    boundaryVertexCount: topology.states.reduce(
      (total, state) =>
        total +
        getStateBoundaryNodeIds(topology, state.id).length,
      0
    ),
  };
}
