import path from "node:path";

import sharp from "sharp";

const MAP_MINIMUM = 0;
const MAP_MAXIMUM = 1000;

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

export async function renderLrocTerrainCrop(input: {
  crop: LunarTerrainCrop;
  outputWidth: number;
  outputHeight: number;
}): Promise<{ image: Buffer; crop: LunarTerrainCrop }> {
  const crop = normalizeCrop(
    input.crop,
    input.outputWidth,
    input.outputHeight
  );
  const terrainPath = path.resolve(
    process.cwd(),
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
    Math.floor(
      ((MAP_MAXIMUM - crop.maximumY) / MAP_MAXIMUM) * metadata.height
    ),
    0,
    metadata.height - 1
  );
  const bottom = clamp(
    Math.ceil(
      ((MAP_MAXIMUM - crop.minimumY) / MAP_MAXIMUM) * metadata.height
    ),
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

  return { image, crop };
}
