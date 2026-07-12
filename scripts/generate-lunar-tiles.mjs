import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();

const sourcePath = path.join(
  projectRoot,
  "public",
  "atlas",
  "moon-atlas-v2.jpg"
);

const outputRoot = path.join(
  projectRoot,
  "public",
  "atlas",
  "tiles"
);

const tileSize = 256;
const maximumZoom = 5;

async function directoryExists(directoryPath) {
  try {
    await fs.access(directoryPath);
    return true;
  } catch {
    return false;
  }
}

async function generateZoomLevel({
  sourceBuffer,
  zoom,
  squareSize,
}) {
  const tilesAcross = 2 ** zoom;
  const zoomSize = tilesAcross * tileSize;

  console.log(
    `Generating zoom ${zoom}: ${tilesAcross} × ${tilesAcross} tiles`
  );

  const levelBuffer = await sharp(sourceBuffer)
    .resize(zoomSize, zoomSize, {
      fit: "fill",
    })
    .jpeg({
      quality: 88,
      mozjpeg: true,
    })
    .toBuffer();

  for (let x = 0; x < tilesAcross; x++) {
    const xDirectory = path.join(
      outputRoot,
      String(zoom),
      String(x)
    );

    await fs.mkdir(xDirectory, {
      recursive: true,
    });

    for (let y = 0; y < tilesAcross; y++) {
      const tilePath = path.join(
        xDirectory,
        `${y}.jpg`
      );

      await sharp(levelBuffer)
        .extract({
          left: x * tileSize,
          top: y * tileSize,
          width: tileSize,
          height: tileSize,
        })
        .jpeg({
          quality: 88,
          mozjpeg: true,
        })
        .toFile(tilePath);
    }
  }

  console.log(`Zoom ${zoom} complete.`);
}

async function main() {
  if (!(await directoryExists(sourcePath))) {
    throw new Error(
      `Source image not found: ${sourcePath}`
    );
  }

  console.log("Preparing Orbital One lunar image tiles...");

  await fs.rm(outputRoot, {
    recursive: true,
    force: true,
  });

  await fs.mkdir(outputRoot, {
    recursive: true,
  });

  const source = sharp(sourcePath);
  const metadata = await source.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error(
      "Unable to determine the source image dimensions."
    );
  }

  const squareSize = Math.min(
    metadata.width,
    metadata.height
  );

  const sourceBuffer = await source
    .resize(squareSize, squareSize, {
      fit: "cover",
      position: "centre",
    })
    .jpeg({
      quality: 92,
      mozjpeg: true,
    })
    .toBuffer();

  for (let zoom = 0; zoom <= maximumZoom; zoom++) {
    await generateZoomLevel({
      sourceBuffer,
      zoom,
      squareSize,
    });
  }

  console.log("Lunar tiles generated successfully.");
  console.log(`Output folder: ${outputRoot}`);
}

main().catch((error) => {
  console.error("Tile generation failed:");
  console.error(error);
  process.exit(1);
});