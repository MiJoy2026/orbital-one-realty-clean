import {
  cloneGeographyDocument,
  hasCompatibleGeographyDocumentStructure,
  hasCompatibleTopologyStructure,
  normalizeGeographyDocument,
  type LunaSphereGeographyDocument,
} from "./lunasphere-geography-document";

export {
  hasCompatibleGeographyDocumentStructure,
  hasCompatibleTopologyStructure,
};

export const LUNASPHERE_STUDIO_DRAFT_STORAGE_KEY =
  "lunasphere-studio:geography-draft:v2";
const LEGACY_DRAFT_STORAGE_KEY =
  "lunasphere-studio:state-topology-draft:v1";

const DRAFT_FORMAT = "lunasphere-studio-geography-draft";
const DRAFT_STORAGE_VERSION = 2;
const LEGACY_DRAFT_FORMAT = "lunasphere-studio-topology-draft";
const LEGACY_DRAFT_STORAGE_VERSION = 1;

export type LunaSphereStudioDraftEnvelope = {
  format: typeof DRAFT_FORMAT;
  storageVersion: typeof DRAFT_STORAGE_VERSION;
  savedAt: string;
  geography: LunaSphereGeographyDocument;
};

export type LoadStudioDraftResult =
  | {
      status: "empty";
    }
  | {
      status: "loaded";
      savedAt: string;
      geography: LunaSphereGeographyDocument;
      migratedLegacyDraft: boolean;
    }
  | {
      status: "invalid";
      message: string;
    };

export type SaveStudioDraftResult =
  | {
      ok: true;
      savedAt: string;
      geography: LunaSphereGeographyDocument;
    }
  | {
      ok: false;
      message: string;
    };

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;
type StorageRemover = Pick<Storage, "removeItem">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseStoredJson(storedValue: string): unknown | null {
  try {
    return JSON.parse(storedValue);
  } catch {
    return null;
  }
}

export function loadLunaSphereStudioDraft(
  storage: StorageReader,
  baselineGeography: LunaSphereGeographyDocument
): LoadStudioDraftResult {
  let storedValue: string | null;
  let legacyStoredValue: string | null;

  try {
    storedValue = storage.getItem(
      LUNASPHERE_STUDIO_DRAFT_STORAGE_KEY
    );
    legacyStoredValue = storage.getItem(LEGACY_DRAFT_STORAGE_KEY);
  } catch {
    return {
      status: "invalid",
      message: "Browser storage could not be read.",
    };
  }

  if (storedValue) {
    const parsedValue = parseStoredJson(storedValue);

    if (
      isRecord(parsedValue) &&
      parsedValue.format === DRAFT_FORMAT &&
      parsedValue.storageVersion === DRAFT_STORAGE_VERSION &&
      typeof parsedValue.savedAt === "string" &&
      hasCompatibleGeographyDocumentStructure(
        parsedValue.geography,
        baselineGeography
      )
    ) {
      return {
        status: "loaded",
        savedAt: parsedValue.savedAt,
        geography: cloneGeographyDocument(parsedValue.geography),
        migratedLegacyDraft: false,
      };
    }

    return {
      status: "invalid",
      message:
        "The saved Studio geography draft is incompatible with this LunaSphere version.",
    };
  }

  if (!legacyStoredValue) {
    return { status: "empty" };
  }

  const parsedLegacyValue = parseStoredJson(legacyStoredValue);

  if (
    !isRecord(parsedLegacyValue) ||
    parsedLegacyValue.format !== LEGACY_DRAFT_FORMAT ||
    parsedLegacyValue.storageVersion !==
      LEGACY_DRAFT_STORAGE_VERSION ||
    typeof parsedLegacyValue.savedAt !== "string"
  ) {
    return {
      status: "invalid",
      message:
        "The saved legacy Studio draft is incompatible with this LunaSphere version.",
    };
  }

  const migratedGeography = normalizeGeographyDocument(
    parsedLegacyValue.topology,
    baselineGeography
  );

  if (!migratedGeography) {
    return {
      status: "invalid",
      message:
        "The saved legacy Studio draft is incompatible with this LunaSphere version.",
    };
  }

  return {
    status: "loaded",
    savedAt: parsedLegacyValue.savedAt,
    geography: migratedGeography,
    migratedLegacyDraft: true,
  };
}

export function saveLunaSphereStudioDraft(
  storage: StorageWriter,
  geography: LunaSphereGeographyDocument
): SaveStudioDraftResult {
  const savedAt = new Date().toISOString();
  const geographySnapshot = cloneGeographyDocument(geography);
  const envelope: LunaSphereStudioDraftEnvelope = {
    format: DRAFT_FORMAT,
    storageVersion: DRAFT_STORAGE_VERSION,
    savedAt,
    geography: geographySnapshot,
  };

  try {
    storage.setItem(
      LUNASPHERE_STUDIO_DRAFT_STORAGE_KEY,
      JSON.stringify(envelope)
    );
  } catch {
    return {
      ok: false,
      message:
        "The browser could not save the LunaSphere Studio draft.",
    };
  }

  return {
    ok: true,
    savedAt,
    geography: geographySnapshot,
  };
}

export function clearLunaSphereStudioDraft(
  storage: StorageRemover
): boolean {
  try {
    storage.removeItem(LUNASPHERE_STUDIO_DRAFT_STORAGE_KEY);
    storage.removeItem(LEGACY_DRAFT_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
