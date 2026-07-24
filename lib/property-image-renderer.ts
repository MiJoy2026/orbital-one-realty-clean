import path from "node:path";

import type { OwnedPropertySnapshot } from "@prisma/client";
import sharp from "sharp";

const MAP_MINIMUM = 0;
const MAP_MAXIMUM = 1000;
const FULL_WIDTH = 1600;
const FULL_HEIGHT = 1000;
const THUMB_WIDTH = 800;
const THUMB_HEIGHT = 500;
const IMAGE_AREA_RATIO = 0.76;

type LunarPoint = [number, number];

type RenderSize = "full" | "thumb";

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function parsePolygon(value: unknown): LunarPoint[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (point): point is [number, number] =>
        Array.isArray(point) &&
        point.length === 2 &&
        Number.isFinite(point[0]) &&
        Number.isFinite(point[1])
    )
    .map(([y, x]) => [Number(y), Number(x)]);
}

function createCoordinateTransformer(input: {
  cropMinimumX: number;
  cropMinimumY: number;
  cropWidth: number;
  cropHeight: number;
  outputWidth: number;
  imageHeight: number;
}) {
  return ([y, x]: LunarPoint): [number, number] => [
    ((x - input.cropMinimumX) / input.cropWidth) * input.outputWidth,
    ((y - input.cropMinimumY) / input.cropHeight) * input.imageHeight,
  ];
}

function pointsToSvg(points: [number, number][]): string {
  return points
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
}

function buildGridLines(input: {
  snapshot: OwnedPropertySnapshot;
  cropMinimumX: number;
  cropMinimumY: number;
  cropMaximumX: number;
  cropMaximumY: number;
  transform: (point: LunarPoint) => [number, number];
}): string {
  const { snapshot } = input;
  const lines: string[] = [];
  const maximumLines = 120;
  let lineCount = 0;

  if (snapshot.propertyWidth > 0) {
    const firstColumn = Math.floor(
      (input.cropMinimumX - snapshot.minimumX) / snapshot.propertyWidth
    );
    const lastColumn = Math.ceil(
      (input.cropMaximumX - snapshot.minimumX) / snapshot.propertyWidth
    );

    for (let column = firstColumn; column <= lastColumn; column += 1) {
      if (lineCount >= maximumLines) break;
      const x = snapshot.minimumX + column * snapshot.propertyWidth;
      const [screenX] = input.transform([input.cropMinimumY, x]);
      lines.push(
        `<line x1="${screenX.toFixed(2)}" y1="0" x2="${screenX.toFixed(
          2
        )}" y2="100%" />`
      );
      lineCount += 1;
    }
  }

  if (snapshot.propertyHeight > 0) {
    const firstRow = Math.floor(
      (input.cropMinimumY - snapshot.minimumY) / snapshot.propertyHeight
    );
    const lastRow = Math.ceil(
      (input.cropMaximumY - snapshot.minimumY) / snapshot.propertyHeight
    );

    for (let row = firstRow; row <= lastRow; row += 1) {
      if (lineCount >= maximumLines * 2) break;
      const y = snapshot.minimumY + row * snapshot.propertyHeight;
      const [, screenY] = input.transform([y, input.cropMinimumX]);
      lines.push(
        `<line x1="0" y1="${screenY.toFixed(2)}" x2="100%" y2="${screenY.toFixed(
          2
        )}" />`
      );
      lineCount += 1;
    }
  }

  return lines.join("");
}

function propertyTypeLabel(propertyType: string): string {
  if (propertyType === "City Block") return "CITY BLOCK";
  if (propertyType === "Town Block") return "TOWN BLOCK";
  return "RURAL ACRE";
}

function buildOverlaySvg(input: {
  snapshot: OwnedPropertySnapshot;
  outputWidth: number;
  outputHeight: number;
  imageHeight: number;
  cropMinimumX: number;
  cropMinimumY: number;
  cropMaximumX: number;
  cropMaximumY: number;
}): Buffer {
  const cropWidth = input.cropMaximumX - input.cropMinimumX;
  const cropHeight = input.cropMaximumY - input.cropMinimumY;
  const transform = createCoordinateTransformer({
    cropMinimumX: input.cropMinimumX,
    cropMinimumY: input.cropMinimumY,
    cropWidth,
    cropHeight,
    outputWidth: input.outputWidth,
    imageHeight: input.imageHeight,
  });
  const propertyPolygon = parsePolygon(input.snapshot.polygon).map(transform);
  const contextPolygon = parsePolygon(input.snapshot.contextBoundary)
    .map(transform)
    .filter(
      ([x, y]) =>
        x > -input.outputWidth &&
        x < input.outputWidth * 2 &&
        y > -input.imageHeight &&
        y < input.imageHeight * 2
    );
  const gridLines = buildGridLines({
    snapshot: input.snapshot,
    cropMinimumX: input.cropMinimumX,
    cropMinimumY: input.cropMinimumY,
    cropMaximumX: input.cropMaximumX,
    cropMaximumY: input.cropMaximumY,
    transform,
  });
  const [propertyCenterX, propertyCenterY] = transform([
    input.snapshot.centerY,
    input.snapshot.centerX,
  ]);
  const footerTop = input.imageHeight;
  const titleSize = Math.round(input.outputWidth * 0.031);
  const propertyIdSize = Math.round(input.outputWidth * 0.021);
  const detailSize = Math.round(input.outputWidth * 0.014);
  const smallSize = Math.round(input.outputWidth * 0.011);
  const padding = Math.round(input.outputWidth * 0.04);
  const location = escapeXml(input.snapshot.locationLabel);
  const propertyId = escapeXml(input.snapshot.propertyId);
  const certificate = escapeXml(input.snapshot.certificateNumber);
  const geography = escapeXml(
    input.snapshot.geographyLabel ||
      (input.snapshot.geographyReleaseNumber
        ? `Geography Release ${input.snapshot.geographyReleaseNumber}`
        : "LunaSphere Geography")
  );
  const propertyType = propertyTypeLabel(input.snapshot.propertyType);
  const propertyPoints = pointsToSvg(propertyPolygon);
  const contextPoints = pointsToSvg(contextPolygon);
  const markerRadius = Math.max(4, input.outputWidth * 0.0045);

  return Buffer.from(`
    <svg width="${input.outputWidth}" height="${input.outputHeight}" viewBox="0 0 ${input.outputWidth} ${input.outputHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mapShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#020617" stop-opacity="0.08" />
          <stop offset="0.72" stop-color="#020617" stop-opacity="0.05" />
          <stop offset="1" stop-color="#020617" stop-opacity="0.82" />
        </linearGradient>
        <linearGradient id="footer" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#030712" />
          <stop offset="1" stop-color="#111827" />
        </linearGradient>
        <filter id="goldGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="${input.outputWidth}" height="${input.imageHeight}" fill="url(#mapShade)" />

      <g stroke="#e2e8f0" stroke-width="1" stroke-opacity="0.20" fill="none">
        ${gridLines}
      </g>

      ${
        contextPolygon.length >= 3
          ? `<polygon points="${contextPoints}" fill="none" stroke="#67e8f9" stroke-width="${Math.max(
              2,
              input.outputWidth * 0.002
            )}" stroke-opacity="0.55" stroke-dasharray="10 8" />`
          : ""
      }

      <polygon points="${propertyPoints}" fill="#facc15" fill-opacity="0.34" stroke="#facc15" stroke-width="${Math.max(
        5,
        input.outputWidth * 0.004
      )}" filter="url(#goldGlow)" />
      <circle cx="${propertyCenterX.toFixed(2)}" cy="${propertyCenterY.toFixed(
        2
      )}" r="${markerRadius}" fill="#ffffff" stroke="#facc15" stroke-width="${Math.max(
        2,
        markerRadius * 0.45
      )}" />

      <g transform="translate(${padding} ${Math.round(
        input.imageHeight * 0.075
      )})">
        <rect x="0" y="0" rx="${Math.round(
          input.outputWidth * 0.012
        )}" width="${Math.round(input.outputWidth * 0.34)}" height="${Math.round(
          input.outputWidth * 0.054
        )}" fill="#020617" fill-opacity="0.82" stroke="#facc15" stroke-opacity="0.70" />
        <text x="${Math.round(input.outputWidth * 0.018)}" y="${Math.round(
          input.outputWidth * 0.035
        )}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(
          input.outputWidth * 0.017
        )}" font-weight="800" fill="#facc15" letter-spacing="2">YOUR LUNAR PROPERTY</text>
      </g>

      <rect x="0" y="${footerTop}" width="${input.outputWidth}" height="${input.outputHeight - footerTop}" fill="url(#footer)" />
      <rect x="0" y="${footerTop}" width="${input.outputWidth}" height="${Math.max(
        4,
        input.outputHeight * 0.006
      )}" fill="#facc15" />

      <text x="${padding}" y="${footerTop + titleSize * 1.35}" font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="900" fill="#facc15" letter-spacing="2">ORBITAL ONE REALTY</text>
      <text x="${padding}" y="${footerTop + titleSize * 2.15}" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="700" fill="#cbd5e1" letter-spacing="3">LUNASCAPE · OWNED PROPERTY IMAGE</text>

      <text x="${padding}" y="${footerTop + titleSize * 3.05}" font-family="Arial, Helvetica, sans-serif" font-size="${propertyIdSize}" font-weight="800" fill="#ffffff">${propertyId}</text>
      <text x="${padding}" y="${footerTop + titleSize * 3.72}" font-family="Arial, Helvetica, sans-serif" font-size="${detailSize}" font-weight="600" fill="#cbd5e1">${escapeXml(
        propertyType
      )} · ${location}</text>

      <text x="${input.outputWidth - padding}" y="${footerTop + titleSize * 1.45}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="700" fill="#94a3b8">CERTIFICATE</text>
      <text x="${input.outputWidth - padding}" y="${footerTop + titleSize * 2.15}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${detailSize}" font-weight="800" fill="#facc15">${certificate}</text>
      <text x="${input.outputWidth - padding}" y="${footerTop + titleSize * 3.02}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="700" fill="#94a3b8">${geography} · Grid V${input.snapshot.inventoryGridVersion} · ${input.snapshot.inventorySubdivisionFactor}×${input.snapshot.inventorySubdivisionFactor}</text>
      <text x="${input.outputWidth - padding}" y="${footerTop + titleSize * 3.68}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" fill="#64748b">Novelty and commemorative property image · Renderer V${input.snapshot.imageRendererVersion}</text>
    </svg>
  `);
}

export async function renderOwnedPropertyImage(
  snapshot: OwnedPropertySnapshot,
  size: RenderSize = "full"
): Promise<Buffer> {
  const outputWidth = size === "thumb" ? THUMB_WIDTH : FULL_WIDTH;
  const outputHeight = size === "thumb" ? THUMB_HEIGHT : FULL_HEIGHT;
  const imageHeight = Math.round(outputHeight * IMAGE_AREA_RATIO);
  const cellSpan = Math.max(
    snapshot.propertyWidth,
    snapshot.propertyHeight,
    0.0001
  );
  const contextWidth = clamp(cellSpan * 18, 12, 72);
  const contextHeight = contextWidth * (imageHeight / outputWidth);
  let cropMinimumX = snapshot.centerX - contextWidth / 2;
  let cropMaximumX = snapshot.centerX + contextWidth / 2;
  let cropMinimumY = snapshot.centerY - contextHeight / 2;
  let cropMaximumY = snapshot.centerY + contextHeight / 2;

  if (cropMinimumX < MAP_MINIMUM) {
    cropMaximumX += MAP_MINIMUM - cropMinimumX;
    cropMinimumX = MAP_MINIMUM;
  }
  if (cropMaximumX > MAP_MAXIMUM) {
    cropMinimumX -= cropMaximumX - MAP_MAXIMUM;
    cropMaximumX = MAP_MAXIMUM;
  }
  if (cropMinimumY < MAP_MINIMUM) {
    cropMaximumY += MAP_MINIMUM - cropMinimumY;
    cropMinimumY = MAP_MINIMUM;
  }
  if (cropMaximumY > MAP_MAXIMUM) {
    cropMinimumY -= cropMaximumY - MAP_MAXIMUM;
    cropMaximumY = MAP_MAXIMUM;
  }

  cropMinimumX = clamp(cropMinimumX, MAP_MINIMUM, MAP_MAXIMUM);
  cropMaximumX = clamp(cropMaximumX, MAP_MINIMUM, MAP_MAXIMUM);
  cropMinimumY = clamp(cropMinimumY, MAP_MINIMUM, MAP_MAXIMUM);
  cropMaximumY = clamp(cropMaximumY, MAP_MINIMUM, MAP_MAXIMUM);

  const terrainPath = path.join(
    process.cwd(),
    "public",
    snapshot.terrainImageSource.replace(/^\/+/, "")
  );
  const source = sharp(terrainPath, { failOn: "none" });
  const metadata = await source.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("The lunar terrain image dimensions could not be read.");
  }

  const sourceLeft = clamp(
    Math.floor((cropMinimumX / MAP_MAXIMUM) * metadata.width),
    0,
    metadata.width - 1
  );
  const sourceTop = clamp(
    Math.floor((cropMinimumY / MAP_MAXIMUM) * metadata.height),
    0,
    metadata.height - 1
  );
  const sourceRight = clamp(
    Math.ceil((cropMaximumX / MAP_MAXIMUM) * metadata.width),
    sourceLeft + 1,
    metadata.width
  );
  const sourceBottom = clamp(
    Math.ceil((cropMaximumY / MAP_MAXIMUM) * metadata.height),
    sourceTop + 1,
    metadata.height
  );
  const terrain = await sharp(terrainPath, { failOn: "none" })
    .extract({
      left: sourceLeft,
      top: sourceTop,
      width: sourceRight - sourceLeft,
      height: sourceBottom - sourceTop,
    })
    .resize(outputWidth, imageHeight, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .modulate({ brightness: 0.78, saturation: 0.18 })
    .sharpen()
    .png()
    .toBuffer();
  const overlay = buildOverlaySvg({
    snapshot,
    outputWidth,
    outputHeight,
    imageHeight,
    cropMinimumX,
    cropMinimumY,
    cropMaximumX,
    cropMaximumY,
  });

  return sharp({
    create: {
      width: outputWidth,
      height: outputHeight,
      channels: 4,
      background: { r: 2, g: 6, b: 23, alpha: 1 },
    },
  })
    .composite([
      { input: terrain, top: 0, left: 0 },
      { input: overlay, top: 0, left: 0 },
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}
