import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();

const sourcePath = path.join(
  projectRoot,
  "source-imagery",
  "WAC_GLOBAL_O000N0000_100M.tiff"
);

const outputRoot = path.join(
  projectRoot,
  "public",
  "atlas",
  "lroc-tiles"
);

const tileSize = 256;
const maximumZoom = 5;
const jpegQuality = 88;

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function createTile({
  zoom,
  x,
  y,
  sourceWidth,
  sourceHeight,
}) {
  const tilesAcross = 2 ** zoom;

  const sourceLeft = Math.floor((x * sourceWidth) / tilesAcross);
  const sourceTop = Math.floor((y * sourceHeight) / tilesAcross);

  const sourceRight = Math.floor(((x + 1) * sourceWidth) / tilesAcross);
  const sourceBottom = Math.floor(((y + 1) * sourceHeight) / tilesAcross);

  const extractWidth = Math.max(1, sourceRight - sourceLeft);
  const extractHeight = Math.max(1, sourceBottom - sourceTop);

  const tileDirectory = path.join(
    outputRoot,
    String(zoom),
    String(x)
  );

  const tilePath = path.join(tileDirectory, `${y}.jpg`);

  await fs.mkdir(tileDirectory, {
    recursive: true,
  });

  await sharp(sourcePath, {
    limitInputPixels: false,
    sequentialRead: false,
    failOn: "none",
  })
    .extract({
      left: sourceLeft,
      top: sourceTop,
      width: extractWidth,
      height: extractHeight,
    })
    .resize(tileSize, tileSize, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .normalize()
    .jpeg({
      quality: jpegQuality,
      mozjpeg: true,
    })
    .toFile(tilePath);
}

async function generateZoomLevel({
  zoom,
  sourceWidth,
  sourceHeight,
}) {
  const tilesAcross = 2 ** zoom;
  const tileCount = tilesAcross * tilesAcross;

  console.log("");
  console.log(
    `Generating zoom ${zoom}: ${tilesAcross} × ${tilesAcross} (${tileCount.toLocaleString()} tiles)`
  );

  let completed = 0;

  for (let y = 0; y < tilesAcross; y++) {
    for (let x = 0; x < tilesAcross; x++) {
      await createTile({
        zoom,
        x,
        y,
        sourceWidth,
        sourceHeight,
      });

      completed++;

      if (
        completed % 100 === 0 ||
        completed === tileCount
      ) {
        const percentage = (
          (completed / tileCount) *
          100
        ).toFixed(1);

        console.log(
          `Zoom ${zoom}: ${completed.toLocaleString()} of ${tileCount.toLocaleString()} tiles (${percentage}%)`
        );
      }
    }
  }

  console.log(`Zoom ${zoom} complete.`);
}

async function main() {
  if (!(await fileExists(sourcePath))) {
    throw new Error(`Source mosaic not found: ${sourcePath}`);
  }

  console.log("Preparing high-resolution LROC lunar tiles...");
  console.log(`Source: ${sourcePath}`);

  const metadata = await sharp(sourcePath, {
    limitInputPixels: false,
    sequentialRead: true,
    failOn: "none",
  }).metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to read the source mosaic dimensions.");
  }

  console.log(
    `Source dimensions: ${metadata.width} × ${metadata.height}`
  );

  await fs.rm(outputRoot, {
    recursive: true,
    force: true,
  });

  await fs.mkdir(outputRoot, {
    recursive: true,
  });

  for (let zoom = 0; zoom <= maximumZoom; zoom++) {
    await generateZoomLevel({
      zoom,
      sourceWidth: metadata.width,
      sourceHeight: metadata.height,
    });
  }

  console.log("");
  console.log("High-resolution lunar tiles generated successfully.");
  console.log(`Output: ${outputRoot}`);
}

main().catch((error) => {
  console.error("");
  console.error("High-resolution tile generation failed:");
  console.error(error);
  process.exit(1);
});