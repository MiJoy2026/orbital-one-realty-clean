import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();

const sourcePath = path.join(
  projectRoot,
  "source-imagery",
  "WAC_GLOBAL_O000N0000_100M.tiff"
);

const outputPath = path.join(
  projectRoot,
  "public",
  "atlas",
  "lroc-tiles-v2"
);

const tileSize = 256;
const maximumZoom = 7;
const pyramidSize = tileSize * 2 ** maximumZoom;

async function main() {
  console.log("Generating Orbital One LROC tile pyramid...");
  console.log(`Source: ${sourcePath}`);
  console.log(`Output: ${outputPath}`);
  console.log(`Pyramid size: ${pyramidSize} × ${pyramidSize}`);
  console.log("This will generate zoom levels 0 through 7.");
  console.log("The process may take a considerable amount of time.");

  await fs.access(sourcePath);

  await fs.rm(outputPath, {
    recursive: true,
    force: true,
  });

  await sharp(sourcePath, {
    limitInputPixels: false,
    sequentialRead: true,
    failOn: "none",
  })
    .resize(pyramidSize, pyramidSize, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .jpeg({
      quality: 88,
      mozjpeg: true,
    })
    .tile({
      layout: "google",
      size: tileSize,
      depth: "onetile",
      container: "fs",
      skipBlanks: -1,
    })
    .toFile(outputPath);

  console.log("");
  console.log("LROC tile pyramid generated successfully.");
  console.log(`Output folder: ${outputPath}`);
}

main().catch((error) => {
  console.error("");
  console.error("LROC pyramid generation failed:");
  console.error(error);
  process.exit(1);
});