import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const projectRoot = process.cwd();

const sourcePath = path.join(
  projectRoot,
  "source-imagery",
  "WAC_GLOBAL_O000N0000_100M.tiff"
);

const previewDirectory = path.join(
  projectRoot,
  "public",
  "atlas"
);

const previewPath = path.join(
  previewDirectory,
  "lroc-preview.jpg"
);

async function main() {
  console.log("Inspecting LROC lunar mosaic...");
  console.log(`Source: ${sourcePath}`);

  await fs.access(sourcePath);
  await fs.mkdir(previewDirectory, { recursive: true });

  const lunarImage = sharp(sourcePath, {
    limitInputPixels: false,
    sequentialRead: true,
    failOn: "none",
  });

  const metadata = await lunarImage.metadata();

  console.log("");
  console.log("Image metadata:");
  console.log(`Format: ${metadata.format ?? "Unknown"}`);
  console.log(`Width: ${metadata.width ?? "Unknown"} pixels`);
  console.log(`Height: ${metadata.height ?? "Unknown"} pixels`);
  console.log(`Bands: ${metadata.bands ?? "Unknown"}`);
  console.log(`Color space: ${metadata.space ?? "Unknown"}`);
  console.log(`Bit depth: ${metadata.depth ?? "Unknown"}`);

  console.log("");
  console.log("Creating a 2048-pixel preview...");

  await sharp(sourcePath, {
    limitInputPixels: false,
    sequentialRead: true,
    failOn: "none",
  })
    .resize({
      width: 2048,
      height: 2048,
      fit: "contain",
      background: "#000000",
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 90,
      mozjpeg: true,
    })
    .toFile(previewPath);

  console.log("");
  console.log("Lunar mosaic inspection completed.");
  console.log(`Preview created: ${previewPath}`);
}

main().catch((error) => {
  console.error("");
  console.error("Inspection failed:");
  console.error(error);
  process.exit(1);
});