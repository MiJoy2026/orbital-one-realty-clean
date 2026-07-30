import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const STORAGE_ZONE = "orbital-one-lunasphere";
const LOCAL_ROOT = path.resolve("public", "atlas", "lroc-tiles-v2");
const REMOTE_ROOT = "lroc-v2";
const STORAGE_BASE_URL = `https://storage.bunnycdn.com/${STORAGE_ZONE}`;
const CONCURRENCY = 24;
const MAX_ATTEMPTS = 6;
const STATE_PATH = path.resolve(
  "node_modules",
  ".cache",
  "orbital-one-lunasphere",
  "lroc-v2-upload-state.json"
);

const accessKey = process.env.BUNNY_STORAGE_PASSWORD?.trim();

if (!accessKey) {
  console.error(
    "BUNNY_STORAGE_PASSWORD is missing. Run this script through the secure PowerShell command provided."
  );
  process.exit(1);
}

function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function collectJpegFiles(directory) {
  const files = [];
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectJpegFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith(".jpg")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function loadCompletedUploads() {
  try {
    const raw = await fs.readFile(STATE_PATH, "utf8");
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed.completed)) {
      return new Set();
    }

    return new Set(parsed.completed);
  } catch (error) {
    if (error?.code === "ENOENT") {
      return new Set();
    }

    console.warn("Could not read the prior upload state; starting a fresh state file.");
    return new Set();
  }
}

async function saveCompletedUploads(completed) {
  await fs.mkdir(path.dirname(STATE_PATH), { recursive: true });

  const temporaryPath = `${STATE_PATH}.tmp`;
  const payload = JSON.stringify(
    {
      updatedAt: new Date().toISOString(),
      completed: [...completed].sort(),
    },
    null,
    2
  );

  await fs.writeFile(temporaryPath, payload, "utf8");
  await fs.rename(temporaryPath, STATE_PATH);
}

async function uploadFile(localPath, relativePath) {
  const encodedPath = relativePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const remoteUrl = `${STORAGE_BASE_URL}/${REMOTE_ROOT}/${encodedPath}`;
  const body = await fs.readFile(localPath);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(remoteUrl, {
        method: "PUT",
        headers: {
          AccessKey: accessKey,
          "Content-Type": "image/jpeg",
        },
        body,
      });

      if (response.status === 201) {
        return;
      }

      const retryable =
        response.status === 408 ||
        response.status === 425 ||
        response.status === 429 ||
        response.status >= 500;

      const responseText = await response.text().catch(() => "");

      if (!retryable || attempt === MAX_ATTEMPTS) {
        throw new Error(
          `HTTP ${response.status}${responseText ? `: ${responseText}` : ""}`
        );
      }

      const retryAfterSeconds = Number(response.headers.get("retry-after"));
      const delay = Number.isFinite(retryAfterSeconds)
        ? retryAfterSeconds * 1000
        : Math.min(30_000, 750 * 2 ** (attempt - 1));

      await sleep(delay);
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        throw error;
      }

      await sleep(Math.min(30_000, 750 * 2 ** (attempt - 1)));
    }
  }
}

function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "calculating";
  }

  const seconds = Math.round(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${remainingSeconds}s`;
}

async function main() {
  await fs.access(LOCAL_ROOT);

  const allFiles = (await collectJpegFiles(LOCAL_ROOT)).sort();
  const completed = await loadCompletedUploads();
  const pending = allFiles
    .map((localPath) => ({
      localPath,
      relativePath: path
        .relative(LOCAL_ROOT, localPath)
        .split(path.sep)
        .join("/"),
    }))
    .filter(({ relativePath }) => !completed.has(relativePath));

  console.log("");
  console.log("Orbital One LunaSphere high-resolution upload");
  console.log(`Local source: ${LOCAL_ROOT}`);
  console.log(`Remote path: ${STORAGE_BASE_URL}/${REMOTE_ROOT}/`);
  console.log(`JPEG tiles found: ${allFiles.toLocaleString()}`);
  console.log(`Already recorded complete: ${completed.size.toLocaleString()}`);
  console.log(`Remaining this run: ${pending.length.toLocaleString()}`);
  console.log(`Concurrent uploads: ${CONCURRENCY}`);
  console.log("");

  if (pending.length === 0) {
    console.log("All high-resolution LunaSphere tiles are already recorded as uploaded.");
    return;
  }

  const startedAt = Date.now();
  let nextIndex = 0;
  let uploadedThisRun = 0;
  let stateDirtyCount = 0;
  const failures = [];

  const saveProgress = async (force = false) => {
    if (!force && stateDirtyCount < 100) {
      return;
    }

    await saveCompletedUploads(completed);
    stateDirtyCount = 0;
  };

  const worker = async () => {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= pending.length) {
        return;
      }

      const item = pending[currentIndex];

      try {
        await uploadFile(item.localPath, item.relativePath);
        completed.add(item.relativePath);
        uploadedThisRun += 1;
        stateDirtyCount += 1;

        if (uploadedThisRun % 100 === 0 || uploadedThisRun === pending.length) {
          const elapsedSeconds = (Date.now() - startedAt) / 1000;
          const rate = uploadedThisRun / Math.max(elapsedSeconds, 0.001);
          const remaining = pending.length - uploadedThisRun;
          const etaSeconds = remaining / Math.max(rate, 0.001);

          console.log(
            `${uploadedThisRun.toLocaleString()} / ${pending.length.toLocaleString()} uploaded ` +
              `(${rate.toFixed(1)} files/sec, ETA ${formatDuration(etaSeconds)})`
          );

          await saveProgress();
        }
      } catch (error) {
        failures.push({
          relativePath: item.relativePath,
          message: error instanceof Error ? error.message : String(error),
        });
        console.error(`FAILED: ${item.relativePath}`);
      }
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, pending.length) }, () => worker())
  );

  await saveProgress(true);

  const elapsedSeconds = (Date.now() - startedAt) / 1000;

  console.log("");
  console.log(`Uploaded this run: ${uploadedThisRun.toLocaleString()}`);
  console.log(`Recorded complete: ${completed.size.toLocaleString()} / ${allFiles.length.toLocaleString()}`);
  console.log(`Elapsed: ${formatDuration(elapsedSeconds)}`);

  if (failures.length > 0) {
    console.error("");
    console.error(`${failures.length.toLocaleString()} tile(s) failed after retries.`);
    console.error("Run the same command again; completed tiles will be skipped.");

    for (const failure of failures.slice(0, 20)) {
      console.error(`- ${failure.relativePath}: ${failure.message}`);
    }

    if (failures.length > 20) {
      console.error(`- ...and ${(failures.length - 20).toLocaleString()} more`);
    }

    process.exitCode = 1;
    return;
  }

  if (completed.size !== allFiles.length) {
    console.error("Upload ended before all tiles were recorded. Run the same command again.");
    process.exitCode = 1;
    return;
  }

  console.log("");
  console.log("SUCCESS: All zoom 0-7 LunaSphere JPEG tiles are uploaded.");
}

main().catch((error) => {
  console.error("");
  console.error("LunaSphere upload failed:");
  console.error(error);
  process.exit(1);
});
