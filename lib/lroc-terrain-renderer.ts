import { access } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const MAP_MINIMUM = 0;
const MAP_MAXIMUM = 1000;
const TILE_SIZE = 256;
const TILE_ZOOM = 7;
const TILE_COUNT = 2 ** TILE_ZOOM;
const TILE_ROOT_CANDIDATES = [
  path.resolve(/* turbopackIgnore: true */ process.cwd(), "public", "atlas", "lroc-tiles-v2"),
  path.resolve(/* turbopackIgnore: true */ process.cwd(), "public", "atlas", "lroc-tiles"),
] as const;

export type LunarTerrainCrop = {
  minimumX: number;
  minimumY: number;
  maximumX: number;
  maximumY: number;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizeCrop(
  crop: LunarTerrainCrop,
  outputWidth: number,
  outputHeight: number
): LunarTerrainCrop {
  const targetAspect = outputWidth / outputHeight;
  let width = Math.max(crop.maximumX - crop.minimumX, 0.001);
  let height = Math.max(crop.maximumY - crop.minimumY, 0.001);
  const centerX = (crop.minimumX + crop.maximumX) / 2;
  const centerY = (crop.minimumY + crop.maximumY) / 2;

  if (width / height < targetAspect) {
    width = height * targetAspect;
  } else {
    height = width / targetAspect;
  }

  let minimumX = centerX - width / 2;
  let maximumX = centerX + width / 2;
  let minimumY = centerY - height / 2;
  let maximumY = centerY + height / 2;

  if (minimumX < MAP_MINIMUM) {
    maximumX += MAP_MINIMUM - minimumX;
    minimumX = MAP_MINIMUM;
  }
  if (maximumX > MAP_MAXIMUM) {
    minimumX -= maximumX - MAP_MAXIMUM;
    maximumX = MAP_MAXIMUM;
  }
  if (minimumY < MAP_MINIMUM) {
    maximumY += MAP_MINIMUM - minimumY;
    minimumY = MAP_MINIMUM;
  }
  if (maximumY > MAP_MAXIMUM) {
    minimumY -= maximumY - MAP_MAXIMUM;
    maximumY = MAP_MAXIMUM;
  }

  return {
    minimumX: clamp(minimumX, MAP_MINIMUM, MAP_MAXIMUM),
    minimumY: clamp(minimumY, MAP_MINIMUM, MAP_MAXIMUM),
    maximumX: clamp(maximumX, MAP_MINIMUM, MAP_MAXIMUM),
    maximumY: clamp(maximumY, MAP_MINIMUM, MAP_MAXIMUM),
  };
}

async function resolveTileRoot(): Promise<string | null> {
  for (const root of TILE_ROOT_CANDIDATES) {
    try {
      await access(path.join(/* turbopackIgnore: true */ root, String(TILE_ZOOM)));
      return root;
    } catch {
      // try next candidate
    }
  }

  return null;
}

async function loadTile(root: string, x: number, y: number): Promise<Buffer> {
  const candidates = [
    path.join(/* turbopackIgnore: true */ root, String(TILE_ZOOM), String(x), `${y}.jpg`),
    path.join(/* turbopackIgnore: true */ root, String(TILE_ZOOM), String(x), `${y}.png`),
  ];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return await sharp(candidate, { failOn: "none" }).png().toBuffer();
    } catch {
      // try next candidate
    }
  }

  return sharp({
    create: {
      width: TILE_SIZE,
      height: TILE_SIZE,
      channels: 4,
      background: { r: 144, g: 148, b: 154, alpha: 1 },
    },
  })
    .png()
    .toBuffer();
}

async function renderTileCrop(input: {
  crop: LunarTerrainCrop;
  outputWidth: number;
  outputHeight: number;
}): Promise<Buffer> {
  const root = await resolveTileRoot();

  if (!root) {
    throw new Error("No LROC tile root is available.");
  }

  const normalized = normalizeCrop(
    input.crop,
    input.outputWidth,
    input.outputHeight
  );
  const globalSize = TILE_COUNT * TILE_SIZE;
  const left = clamp(
    Math.floor((normalized.minimumX / MAP_MAXIMUM) * globalSize),
    0,
    globalSize - 1
  );
  const right = clamp(
    Math.ceil((normalized.maximumX / MAP_MAXIMUM) * globalSize),
    left + 1,
    globalSize
  );
  const top = clamp(
    Math.floor(((MAP_MAXIMUM - normalized.maximumY) / MAP_MAXIMUM) * globalSize),
    0,
    globalSize - 1
  );
  const bottom = clamp(
    Math.ceil(((MAP_MAXIMUM - normalized.minimumY) / MAP_MAXIMUM) * globalSize),
    top + 1,
    globalSize
  );

  const minimumTileX = clamp(Math.floor(left / TILE_SIZE), 0, TILE_COUNT - 1);
  const maximumTileX = clamp(Math.floor((right - 1) / TILE_SIZE), 0, TILE_COUNT - 1);
  const minimumTileY = clamp(Math.floor(top / TILE_SIZE), 0, TILE_COUNT - 1);
  const maximumTileY = clamp(Math.floor((bottom - 1) / TILE_SIZE), 0, TILE_COUNT - 1);

  const tileColumns = maximumTileX - minimumTileX + 1;
  const tileRows = maximumTileY - minimumTileY + 1;
  const canvasWidth = tileColumns * TILE_SIZE;
  const canvasHeight = tileRows * TILE_SIZE;

  const composites: Array<{
    input: Buffer;
    left: number;
    top: number;
  }> = [];
  for (let tileX = minimumTileX; tileX <= maximumTileX; tileX += 1) {
    for (let tileY = minimumTileY; tileY <= maximumTileY; tileY += 1) {
      composites.push({
        input: await loadTile(root, tileX, tileY),
        left: (tileX - minimumTileX) * TILE_SIZE,
        top: (tileY - minimumTileY) * TILE_SIZE,
      });
    }
  }

  const stitched = await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 132, g: 136, b: 142, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();

  const extractLeft = left - minimumTileX * TILE_SIZE;
  const extractTop = top - minimumTileY * TILE_SIZE;
  const extractWidth = Math.max(1, right - left);
  const extractHeight = Math.max(1, bottom - top);

  return sharp(stitched)
    .extract({
      left: extractLeft,
      top: extractTop,
      width: extractWidth,
      height: extractHeight,
    })
    .resize(input.outputWidth, input.outputHeight, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .greyscale()
    .modulate({ brightness: 0.94 })
    .linear(1.05, -3)
    .sharpen({ sigma: 0.8, m1: 0.8, m2: 1.25 })
    .tint({ r: 218, g: 221, b: 228 })
    .png()
    .toBuffer();
}

export async function renderLrocTerrainCrop(input: {
  crop: LunarTerrainCrop;
  outputWidth: number;
  outputHeight: number;
}): Promise<{
  image: Buffer;
  crop: LunarTerrainCrop;
  source: "tiles" | "preview";
}> {
  const crop = normalizeCrop(input.crop, input.outputWidth, input.outputHeight);

  try {
    const image = await renderTileCrop({
      crop,
      outputWidth: input.outputWidth,
      outputHeight: input.outputHeight,
    });
    return { image, crop, source: "tiles" };
  } catch {
    const terrainPath = path.resolve(
      /* turbopackIgnore: true */ process.cwd(),
      "public",
      "atlas",
      "lroc-preview.jpg"
    );
    const source = sharp(terrainPath, { failOn: "none" });
    const metadata = await source.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error("The LROC terrain source dimensions could not be read.");
    }

    const left = clamp(
      Math.floor((crop.minimumX / MAP_MAXIMUM) * metadata.width),
      0,
      metadata.width - 1
    );
    const right = clamp(
      Math.ceil((crop.maximumX / MAP_MAXIMUM) * metadata.width),
      left + 1,
      metadata.width
    );
    const top = clamp(
      Math.floor(((MAP_MAXIMUM - crop.maximumY) / MAP_MAXIMUM) * metadata.height),
      0,
      metadata.height - 1
    );
    const bottom = clamp(
      Math.ceil(((MAP_MAXIMUM - crop.minimumY) / MAP_MAXIMUM) * metadata.height),
      top + 1,
      metadata.height
    );
    const image = await sharp(terrainPath, { failOn: "none" })
      .extract({
        left,
        top,
        width: right - left,
        height: bottom - top,
      })
      .resize(input.outputWidth, input.outputHeight, {
        fit: "fill",
        kernel: sharp.kernel.lanczos3,
      })
      .greyscale()
      .modulate({ brightness: 0.94 })
      .linear(1.05, -3)
      .sharpen({ sigma: 0.8, m1: 0.8, m2: 1.25 })
      .tint({ r: 218, g: 221, b: 228 })
      .png()
      .toBuffer();

    return { image, crop, source: "preview" };
  }
}
