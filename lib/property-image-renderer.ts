import path from "node:path";

import type { OwnedPropertySnapshot } from "@prisma/client";
import sharp from "sharp";

import { getNearbyLunarAttractions } from "./lunar-attractions";
import {
  renderLrocTerrainCrop,
  type LunarTerrainCrop,
} from "./lroc-terrain-renderer";

const MAP_MINIMUM = 0;
const MAP_MAXIMUM = 1000;
const FULL_WIDTH = 1600;
const FULL_HEIGHT = 1000;
const THUMB_WIDTH = 800;
const THUMB_HEIGHT = 500;
const IMAGE_AREA_RATIO = 0.76;
const POSTCARD_FULL_WIDTH = 1920;
const POSTCARD_FULL_HEIGHT = 1080;
const POSTCARD_THUMB_WIDTH = 960;
const POSTCARD_THUMB_HEIGHT = 540;

type LunarPoint = [number, number];

export type RenderSize = "full" | "thumb";
export type PropertyImageView = "virtual" | "postcard" | "scenic" | "locator";

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

function buildLocatorOverlaySvg(input: {
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

export async function renderOwnedPropertyLocatorImage(
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
    /* turbopackIgnore: true */ process.cwd(),
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
  const overlay = buildLocatorOverlaySvg({
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

function scenicCoordinateTransformer(input: {
  crop: LunarTerrainCrop;
  outputWidth: number;
  outputHeight: number;
}) {
  const cropWidth = input.crop.maximumX - input.crop.minimumX;
  const cropHeight = input.crop.maximumY - input.crop.minimumY;

  return ([y, x]: LunarPoint): [number, number] => [
    ((x - input.crop.minimumX) / cropWidth) * input.outputWidth,
    ((input.crop.maximumY - y) / cropHeight) * input.outputHeight,
  ];
}

function scenicCropForSnapshot(
  snapshot: OwnedPropertySnapshot,
  outputWidth: number,
  outputHeight: number
): LunarTerrainCrop {
  const cellSpan = Math.max(
    snapshot.propertyWidth,
    snapshot.propertyHeight,
    0.001
  );
  const widthMultiplier =
    snapshot.propertyType === "Rural Acre"
      ? 6.2
      : snapshot.propertyType === "Town Block"
      ? 7.0
      : 7.8;
  const cropWidth = clamp(cellSpan * widthMultiplier, 10, 44);
  const cropHeight = cropWidth * (outputHeight / outputWidth);

  return {
    minimumX: snapshot.centerX - cropWidth / 2,
    maximumX: snapshot.centerX + cropWidth / 2,
    minimumY: snapshot.centerY - cropHeight / 2,
    maximumY: snapshot.centerY + cropHeight / 2,
  };
}

function formatDistance(distanceKilometers: number): string {
  if (distanceKilometers < 10) {
    return `${distanceKilometers.toFixed(1)} km`;
  }

  return `${Math.round(distanceKilometers).toLocaleString("en-US")} km`;
}

function scenicOverlaySvg(input: {
  snapshot: OwnedPropertySnapshot;
  crop: LunarTerrainCrop;
  outputWidth: number;
  outputHeight: number;
}): Buffer {
  const transform = scenicCoordinateTransformer(input);
  const propertyPolygon = parsePolygon(input.snapshot.polygon).map(transform);
  const propertyPoints = pointsToSvg(propertyPolygon);
  const [propertyCenterX, propertyCenterY] = transform([
    input.snapshot.centerY,
    input.snapshot.centerX,
  ]);
  const nearby = getNearbyLunarAttractions(
    input.snapshot.centerX,
    input.snapshot.centerY,
    1
  );
  const nearest = nearby[0];
  const padding = Math.round(input.outputWidth * 0.045);
  const titleSize = Math.round(input.outputWidth * 0.037);
  const propertyIdSize = Math.round(input.outputWidth * 0.024);
  const detailSize = Math.round(input.outputWidth * 0.0145);
  const smallSize = Math.round(input.outputWidth * 0.0112);
  const footerHeight = Math.round(input.outputHeight * 0.23);
  const footerTop = input.outputHeight - footerHeight;
  const location = escapeXml(input.snapshot.locationLabel);
  const propertyId = escapeXml(input.snapshot.propertyId);
  const certificate = escapeXml(input.snapshot.certificateNumber);
  const propertyType = escapeXml(propertyTypeLabel(input.snapshot.propertyType));
  const nearestFeature = nearest
    ? `${escapeXml(nearest.name)} · ${formatDistance(
        nearest.distanceKilometers
      )} ${escapeXml(nearest.direction)}`
    : "Recorded parcel centered on real lunar terrain";
  const labelWidth = Math.round(input.outputWidth * 0.2);
  const labelHeight = Math.round(input.outputHeight * 0.07);
  const labelX = clamp(
    propertyCenterX - labelWidth / 2,
    padding,
    input.outputWidth - padding - labelWidth
  );
  const labelY =
    propertyCenterY > input.outputHeight * 0.45
      ? Math.max(26, propertyCenterY - labelHeight - 28)
      : Math.min(
          footerTop - labelHeight - 18,
          propertyCenterY + 28
        );
  const pointerTop = labelY < propertyCenterY ? labelY + labelHeight : labelY;
  const pointerBottom = labelY < propertyCenterY ? propertyCenterY - 10 : propertyCenterY + 10;

  return Buffer.from(`
    <svg width="${input.outputWidth}" height="${input.outputHeight}" viewBox="0 0 ${input.outputWidth} ${input.outputHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="terrainShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#020617" stop-opacity="0.42" />
          <stop offset="0.32" stop-color="#020617" stop-opacity="0.03" />
          <stop offset="0.72" stop-color="#020617" stop-opacity="0.05" />
          <stop offset="1" stop-color="#020617" stop-opacity="0.88" />
        </linearGradient>
        <radialGradient id="terrainVignette" cx="50%" cy="45%" r="72%">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="0.72" stop-color="#020617" stop-opacity="0.10" />
          <stop offset="1" stop-color="#020617" stop-opacity="0.68" />
        </radialGradient>
        <linearGradient id="exactFooter" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#020617" stop-opacity="0.95" />
          <stop offset="1" stop-color="#0f172a" stop-opacity="0.9" />
        </linearGradient>
        <linearGradient id="labelGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#020617" stop-opacity="0.9" />
          <stop offset="1" stop-color="#111827" stop-opacity="0.86" />
        </linearGradient>
        <filter id="exactGoldGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      <rect x="0" y="0" width="${input.outputWidth}" height="${input.outputHeight}" fill="url(#terrainShade)" />
      <rect x="0" y="0" width="${input.outputWidth}" height="${input.outputHeight}" fill="url(#terrainVignette)" />

      <polygon points="${propertyPoints}" fill="#facc15" fill-opacity="0.05" stroke="#f8fafc" stroke-opacity="0.92" stroke-width="${Math.max(
        1.5,
        input.outputWidth * 0.0011
      )}" />
      <polygon points="${propertyPoints}" fill="none" stroke="#facc15" stroke-opacity="0.94" stroke-width="${Math.max(
        2.5,
        input.outputWidth * 0.0016
      )}" filter="url(#exactGoldGlow)" />
      <circle cx="${propertyCenterX.toFixed(1)}" cy="${propertyCenterY.toFixed(
        1
      )}" r="${Math.max(3, Math.round(input.outputWidth * 0.0032))}" fill="#ffffff" stroke="#facc15" stroke-width="1.8" />

      <g transform="translate(${padding} ${Math.round(
        input.outputHeight * 0.072
      )})">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="800" fill="#facc15" letter-spacing="5">LUNASCAPE</text>
        <text x="0" y="${Math.round(
          titleSize * 1.02
        )}" font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="900" fill="#ffffff" letter-spacing="1">EXACT PROPERTY VIEW</text>
        <text x="0" y="${Math.round(
          titleSize * 1.68
        )}" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="700" fill="#cbd5e1" letter-spacing="2">REAL LUNAR TERRAIN DIRECTLY BENEATH YOUR PURCHASED PARCEL</text>
      </g>

      <g>
        <line x1="${propertyCenterX.toFixed(1)}" y1="${pointerTop.toFixed(
          1
        )}" x2="${propertyCenterX.toFixed(1)}" y2="${pointerBottom.toFixed(
          1
        )}" stroke="#facc15" stroke-width="2.5" stroke-opacity="0.9" />
        <rect x="${labelX}" y="${labelY}" width="${labelWidth}" height="${labelHeight}" rx="${Math.round(input.outputHeight * 0.018)}" fill="url(#labelGlass)" stroke="#facc15" stroke-opacity="0.75" />
        <text x="${labelX + labelWidth / 2}" y="${labelY + labelHeight * 0.48}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="800" fill="#facc15" letter-spacing="2">EXACT OWNED PARCEL</text>
        <text x="${labelX + labelWidth / 2}" y="${labelY + labelHeight * 0.78}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(12, Math.round(smallSize * 0.92))}" font-weight="700" fill="#ffffff">${propertyId}</text>
      </g>

      <rect x="0" y="${footerTop}" width="${input.outputWidth}" height="${footerHeight}" fill="url(#exactFooter)" />
      <rect x="0" y="${footerTop}" width="${input.outputWidth}" height="${Math.max(
        4,
        input.outputHeight * 0.006
      )}" fill="#facc15" />

      <text x="${padding}" y="${footerTop + titleSize * 0.95}" font-family="Arial, Helvetica, sans-serif" font-size="${propertyIdSize}" font-weight="900" fill="#facc15">${propertyId}</text>
      <text x="${padding}" y="${footerTop + titleSize * 1.62}" font-family="Arial, Helvetica, sans-serif" font-size="${detailSize}" font-weight="700" fill="#ffffff">${propertyType} · ${location}</text>
      <text x="${padding}" y="${footerTop + titleSize * 2.2}" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="700" fill="#cbd5e1">NEAREST FEATURE · ${nearestFeature}</text>
      <text x="${padding}" y="${footerTop + titleSize * 2.8}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(11, Math.round(smallSize * 0.84))}" fill="#64748b">The gold outline marks the exact parcel you purchased. The surrounding terrain provides immediate local context.</text>

      <text x="${input.outputWidth - padding}" y="${footerTop + titleSize * 0.98}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="700" fill="#94a3b8">CERTIFICATE</text>
      <text x="${input.outputWidth - padding}" y="${footerTop + titleSize * 1.62}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${detailSize}" font-weight="900" fill="#facc15">${certificate}</text>
      <text x="${input.outputWidth - padding}" y="${footerTop + titleSize * 2.22}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="700" fill="#cbd5e1">ORBITAL ONE REALTY · 2026 FOUNDING COLLECTION</text>
      <text x="${input.outputWidth - padding}" y="${footerTop + titleSize * 2.82}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(11, Math.round(smallSize * 0.84))}" fill="#64748b">Real LROC terrain · Exact parcel centered · Novelty commemorative image</text>
    </svg>
  `);
}

export async function renderOwnedPropertyScenicImage(
  snapshot: OwnedPropertySnapshot,
  size: RenderSize = "full"
): Promise<Buffer> {
  const outputWidth = size === "thumb" ? THUMB_WIDTH : FULL_WIDTH;
  const outputHeight = size === "thumb" ? THUMB_HEIGHT : FULL_HEIGHT;
  const requestedCrop = scenicCropForSnapshot(
    snapshot,
    outputWidth,
    outputHeight
  );
  const { image: terrain, crop } = await renderLrocTerrainCrop({
    crop: requestedCrop,
    outputWidth,
    outputHeight,
  });
  const overlay = scenicOverlaySvg({
    snapshot,
    crop,
    outputWidth,
    outputHeight,
  });

  return sharp(terrain)
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

function deterministicHash(value: string): number {
  let hash = 2166136261;

  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function seededUnit(seed: number, index: number): number {
  let value = seed + Math.imul(index + 1, 0x9e3779b1);
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return (value >>> 0) / 4294967295;
}

function postcardCropForSnapshot(
  snapshot: OwnedPropertySnapshot,
  outputWidth: number,
  outputHeight: number
): LunarTerrainCrop {
  const cellSpan = Math.max(
    snapshot.propertyWidth,
    snapshot.propertyHeight,
    0.001
  );
  const cropWidth = clamp(cellSpan * 42, 150, 310);
  const cropHeight = cropWidth * (outputHeight / outputWidth) * 1.28;

  return {
    minimumX: snapshot.centerX - cropWidth / 2,
    maximumX: snapshot.centerX + cropWidth / 2,
    minimumY: snapshot.centerY - cropHeight * 0.58,
    maximumY: snapshot.centerY + cropHeight * 0.42,
  };
}

async function createPerspectiveTerrain(input: {
  terrain: Buffer;
  outputWidth: number;
  groundHeight: number;
}): Promise<Buffer> {
  const sourceHeight = 1120;
  const source = await sharp(input.terrain)
    .resize(input.outputWidth, sourceHeight, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .modulate({ brightness: 0.88 })
    .linear(1.16, -12)
    .sharpen({ sigma: 1.05, m1: 0.9, m2: 1.45 })
    .png()
    .toBuffer();
  const stripCount = 82;
  const weights = Array.from({ length: stripCount }, (_, index) => {
    const progress = index / Math.max(1, stripCount - 1);
    return 0.34 + Math.pow(progress, 1.65) * 1.9;
  });
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  const composites: Array<{
    input: Buffer;
    left: number;
    top: number;
  }> = [];
  let destinationY = 0;

  for (let index = 0; index < stripCount; index += 1) {
    const sourceTop = Math.floor((index * sourceHeight) / stripCount);
    const sourceBottom = Math.floor(((index + 1) * sourceHeight) / stripCount);
    const sourceStripHeight = Math.max(1, sourceBottom - sourceTop);
    const remainingHeight = input.groundHeight - destinationY;
    const destinationHeight =
      index === stripCount - 1
        ? Math.max(1, remainingHeight)
        : Math.max(1, Math.round((weights[index] / totalWeight) * input.groundHeight));
    const progress = index / Math.max(1, stripCount - 1);
    const widthRatio = 0.54 + 0.46 * Math.pow(progress, 0.78);
    const destinationWidth = Math.max(1, Math.round(input.outputWidth * widthRatio));
    const strip = await sharp(source)
      .extract({
        left: 0,
        top: sourceTop,
        width: input.outputWidth,
        height: sourceStripHeight,
      })
      .resize(destinationWidth, destinationHeight, {
        fit: "fill",
        kernel: sharp.kernel.lanczos3,
      })
      .png()
      .toBuffer();

    composites.push({
      input: strip,
      left: Math.round((input.outputWidth - destinationWidth) / 2),
      top: destinationY,
    });
    destinationY += destinationHeight;
  }

  return sharp({
    create: {
      width: input.outputWidth,
      height: input.groundHeight,
      channels: 4,
      background: { r: 2, g: 6, b: 18, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();
}

function postcardOverlaySvg(input: {
  snapshot: OwnedPropertySnapshot;
  outputWidth: number;
  outputHeight: number;
  horizonY: number;
  terrainSource: "tiles" | "preview";
}): Buffer {
  const seed = deterministicHash(
    `${input.snapshot.propertyId}:${input.snapshot.certificateNumber}`
  );
  const stars = Array.from({ length: 96 }, (_, index) => {
    const x = Math.round(seededUnit(seed, index * 3) * input.outputWidth);
    const y = Math.round(
      seededUnit(seed, index * 3 + 1) * input.horizonY * 0.82
    );
    const radius = 0.7 + seededUnit(seed, index * 3 + 2) * 1.8;
    const opacity = 0.2 + seededUnit(seed ^ 0x5f3759df, index) * 0.55;
    return `<circle cx="${x}" cy="${y}" r="${radius.toFixed(2)}" fill="#f8fafc" fill-opacity="${opacity.toFixed(2)}" />`;
  }).join("");
  const nearby = getNearbyLunarAttractions(
    input.snapshot.centerX,
    input.snapshot.centerY,
    1
  );
  const nearest = nearby[0];
  const nearestFeature = nearest
    ? `${escapeXml(nearest.name)} · ${formatDistance(
        nearest.distanceKilometers
      )} ${escapeXml(nearest.direction)}`
    : "Open lunar terrain";
  const propertyId = escapeXml(input.snapshot.propertyId);
  const certificate = escapeXml(input.snapshot.certificateNumber);
  const location = escapeXml(input.snapshot.locationLabel);
  const propertyType = escapeXml(propertyTypeLabel(input.snapshot.propertyType));
  const settlementName = input.snapshot.cityName || input.snapshot.townName || "";
  const hasSettlement = Boolean(settlementName);
  const nearbyFeatureActive = Boolean(
    nearest && nearest.distanceKilometers <= 180
  );
  const padding = Math.round(input.outputWidth * 0.05);
  const titleSize = Math.round(input.outputWidth * 0.044);
  const propertySize = Math.round(input.outputWidth * 0.024);
  const detailSize = Math.round(input.outputWidth * 0.0142);
  const smallSize = Math.round(input.outputWidth * 0.0105);
  const footerHeight = Math.round(input.outputHeight * 0.205);
  const footerTop = input.outputHeight - footerHeight;
  const lightX = Math.round(
    input.outputWidth * (0.2 + seededUnit(seed, 440) * 0.58)
  );
  const contextLine = hasSettlement
    ? `Nearby community inspiration · ${escapeXml(settlementName)}`
    : nearbyFeatureActive && nearest
    ? `Nearby landscape inspiration · ${escapeXml(nearest.name)}`
    : "Open lunar terrain inspiration";
  const settlementSilhouette = hasSettlement
    ? `<g opacity="0.22" transform="translate(${Math.round(
        input.outputWidth * 0.72
      )} ${input.horizonY + Math.round(input.outputHeight * 0.06)})">
          <ellipse cx="0" cy="16" rx="58" ry="15" fill="#cbd5e1" fill-opacity="0.10" />
          <path d="M-68 18 L-48 -12 L-26 18 Z" fill="#cbd5e1" fill-opacity="0.14" />
          <path d="M-22 18 A18 16 0 0 1 14 18 Z" fill="#e2e8f0" fill-opacity="0.18" />
          <rect x="20" y="-4" width="16" height="22" rx="3" fill="#cbd5e1" fill-opacity="0.14" />
          <rect x="42" y="-10" width="10" height="28" rx="3" fill="#cbd5e1" fill-opacity="0.12" />
          <path d="M58 18 A15 13 0 0 1 88 18 Z" fill="#e2e8f0" fill-opacity="0.17" />
        </g>`
    : "";
  const featureBackdrop = nearbyFeatureActive
    ? `<path d="M0 ${input.horizonY + Math.round(
        input.outputHeight * 0.13
      )} C ${Math.round(input.outputWidth * 0.12)} ${
        input.horizonY + Math.round(input.outputHeight * 0.05)
      }, ${Math.round(input.outputWidth * 0.28)} ${
        input.horizonY + Math.round(input.outputHeight * 0.17)
      }, ${Math.round(input.outputWidth * 0.42)} ${
        input.horizonY + Math.round(input.outputHeight * 0.08)
      } S ${Math.round(input.outputWidth * 0.72)} ${
        input.horizonY + Math.round(input.outputHeight * 0.16)
      }, ${input.outputWidth} ${
        input.horizonY + Math.round(input.outputHeight * 0.1)
      } L ${input.outputWidth} ${input.outputHeight} L 0 ${input.outputHeight} Z" fill="#e2e8f0" fill-opacity="0.07" />`
    : "";

  return Buffer.from(`
    <svg width="${input.outputWidth}" height="${input.outputHeight}" viewBox="0 0 ${input.outputWidth} ${input.outputHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#01030a" />
          <stop offset="0.62" stop-color="#050a18" />
          <stop offset="1" stop-color="#111827" />
        </linearGradient>
        <linearGradient id="groundShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#020617" stop-opacity="0.48" />
          <stop offset="0.28" stop-color="#020617" stop-opacity="0.08" />
          <stop offset="0.73" stop-color="#020617" stop-opacity="0.05" />
          <stop offset="1" stop-color="#020617" stop-opacity="0.76" />
        </linearGradient>
        <radialGradient id="horizonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#fde68a" stop-opacity="0.62" />
          <stop offset="0.18" stop-color="#facc15" stop-opacity="0.18" />
          <stop offset="0.62" stop-color="#facc15" stop-opacity="0.03" />
          <stop offset="1" stop-color="#facc15" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="footerGlass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#020617" stop-opacity="0.95" />
          <stop offset="1" stop-color="#111827" stop-opacity="0.9" />
        </linearGradient>
        <filter id="softGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="18" />
        </filter>
      </defs>

      <rect x="0" y="0" width="${input.outputWidth}" height="${input.horizonY + 24}" fill="url(#sky)" />
      ${stars}
      <ellipse cx="${lightX}" cy="${input.horizonY - 8}" rx="${Math.round(
        input.outputWidth * 0.18
      )}" ry="${Math.round(
        input.outputHeight * 0.09
      )}" fill="url(#horizonGlow)" filter="url(#softGlow)" />
      <line x1="0" y1="${input.horizonY}" x2="${input.outputWidth}" y2="${input.horizonY}" stroke="#f8fafc" stroke-opacity="0.18" stroke-width="2" />
      ${featureBackdrop}
      ${settlementSilhouette}
      <rect x="0" y="${input.horizonY}" width="${input.outputWidth}" height="${input.outputHeight - input.horizonY}" fill="url(#groundShade)" />

      <g transform="translate(${padding} ${Math.round(
        input.outputHeight * 0.09
      )})">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="900" fill="#facc15" letter-spacing="7">LUNASCAPE</text>
        <text x="0" y="${Math.round(
          titleSize * 1.12
        )}" font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="900" fill="#ffffff" letter-spacing="1">YOUR LUNASCAPE PROPERTY</text>
        <text x="0" y="${Math.round(
          titleSize * 1.77
        )}" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="700" fill="#cbd5e1" letter-spacing="3">VIRTUAL PROPERTY PREVIEW · BUILT FOR YOUR FUTURE LUNASCAPE EXPERIENCE</text>
      </g>

      <g transform="translate(${input.outputWidth - padding} ${Math.round(
        input.outputHeight * 0.095
      )})">
        <rect x="-${Math.round(
          input.outputWidth * 0.28
        )}" y="-${Math.round(
          input.outputHeight * 0.038
        )}" width="${Math.round(
          input.outputWidth * 0.28
        )}" height="${Math.round(
          input.outputHeight * 0.075
        )}" rx="${Math.round(
          input.outputHeight * 0.02
        )}" fill="#020617" fill-opacity="0.68" stroke="#facc15" stroke-opacity="0.45" />
        <text x="-${Math.round(
          input.outputWidth * 0.018
        )}" y="${Math.round(
          input.outputHeight * 0.009
        )}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="800" fill="#f8fafc" letter-spacing="2">REAL TERRAIN · VIRTUAL INTERPRETATION</text>
      </g>

      <rect x="0" y="${footerTop}" width="${input.outputWidth}" height="${footerHeight}" fill="url(#footerGlass)" />
      <rect x="0" y="${footerTop}" width="${input.outputWidth}" height="${Math.max(
        5,
        input.outputHeight * 0.006
      )}" fill="#facc15" />

      <text x="${padding}" y="${footerTop + propertySize * 1.08}" font-family="Arial, Helvetica, sans-serif" font-size="${propertySize}" font-weight="900" fill="#facc15">${propertyId}</text>
      <text x="${padding}" y="${footerTop + propertySize * 1.82}" font-family="Arial, Helvetica, sans-serif" font-size="${detailSize}" font-weight="800" fill="#ffffff">${propertyType} · ${location}</text>
      <text x="${padding}" y="${footerTop + propertySize * 2.47}" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="700" fill="#cbd5e1">${escapeXml(contextLine)}</text>

      <text x="${input.outputWidth - padding}" y="${footerTop + propertySize * 0.98}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="800" fill="#94a3b8">NEAREST FEATURE</text>
      <text x="${input.outputWidth - padding}" y="${footerTop + propertySize * 1.68}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${detailSize}" font-weight="900" fill="#facc15">${nearestFeature}</text>
      <text x="${input.outputWidth - padding}" y="${footerTop + propertySize * 2.36}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="800" fill="#cbd5e1">CERTIFICATE · ${certificate}</text>

      <text x="${input.outputWidth / 2}" y="${input.outputHeight - Math.round(
        input.outputHeight * 0.024
      )}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(
        12,
        Math.round(smallSize * 0.78)
      )}" fill="#64748b">Virtual LunaScape preview inspired by real ${input.terrainSource === "tiles" ? "high-resolution " : ""}lunar terrain and nearby context · Novelty commemorative image</text>
    </svg>
  `);
}

function virtualCropForSnapshot(
  snapshot: OwnedPropertySnapshot,
  outputWidth: number,
  outputHeight: number
): LunarTerrainCrop {
  const cellSpan = Math.max(
    snapshot.propertyWidth,
    snapshot.propertyHeight,
    0.001
  );
  const cropWidth = clamp(cellSpan * 20, 55, 140);
  const cropHeight = cropWidth * (outputHeight / outputWidth) * 1.1;

  return {
    minimumX: snapshot.centerX - cropWidth / 2,
    maximumX: snapshot.centerX + cropWidth / 2,
    minimumY: snapshot.centerY - cropHeight * 0.57,
    maximumY: snapshot.centerY + cropHeight * 0.43,
  };
}

async function createVirtualTerrainScene(input: {
  terrain: Buffer;
  outputWidth: number;
  groundHeight: number;
}): Promise<Buffer> {
  const sourceHeight = 980;
  const source = await sharp(input.terrain)
    .resize(input.outputWidth, sourceHeight, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    })
    .modulate({ brightness: 0.92 })
    .linear(1.1, -7)
    .sharpen({ sigma: 0.9, m1: 0.8, m2: 1.2 })
    .png()
    .toBuffer();

  const stripCount = 64;
  const weights = Array.from({ length: stripCount }, (_, index) => {
    const progress = index / Math.max(1, stripCount - 1);
    return 0.58 + Math.pow(progress, 1.25) * 0.95;
  });
  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  const composites: Array<{ input: Buffer; left: number; top: number }> = [];
  let destinationY = 0;

  for (let index = 0; index < stripCount; index += 1) {
    const sourceTop = Math.floor((index * sourceHeight) / stripCount);
    const sourceBottom = Math.floor(((index + 1) * sourceHeight) / stripCount);
    const sourceStripHeight = Math.max(1, sourceBottom - sourceTop);
    const remainingHeight = input.groundHeight - destinationY;
    const destinationHeight =
      index === stripCount - 1
        ? Math.max(1, remainingHeight)
        : Math.max(1, Math.round((weights[index] / totalWeight) * input.groundHeight));
    const progress = index / Math.max(1, stripCount - 1);
    const widthRatio = 0.9 + 0.1 * Math.pow(progress, 0.8);
    const destinationWidth = Math.max(1, Math.round(input.outputWidth * widthRatio));
    const strip = await sharp(source)
      .extract({
        left: 0,
        top: sourceTop,
        width: input.outputWidth,
        height: sourceStripHeight,
      })
      .resize(destinationWidth, destinationHeight, {
        fit: "fill",
        kernel: sharp.kernel.lanczos3,
      })
      .png()
      .toBuffer();

    composites.push({
      input: strip,
      left: Math.round((input.outputWidth - destinationWidth) / 2),
      top: destinationY,
    });
    destinationY += destinationHeight;
  }

  return sharp({
    create: {
      width: input.outputWidth,
      height: input.groundHeight,
      channels: 4,
      background: { r: 8, g: 12, b: 20, alpha: 1 },
    },
  })
    .composite(composites)
    .png()
    .toBuffer();
}

function virtualOverlaySvg(input: {
  snapshot: OwnedPropertySnapshot;
  outputWidth: number;
  outputHeight: number;
  horizonY: number;
  terrainSource: "tiles" | "preview";
}): Buffer {
  const seed = deterministicHash(
    `${input.snapshot.propertyId}:${input.snapshot.certificateNumber}:virtual`
  );
  const stars = Array.from({ length: 70 }, (_, index) => {
    const x = Math.round(seededUnit(seed, index * 3) * input.outputWidth);
    const y = Math.round(
      seededUnit(seed, index * 3 + 1) * input.horizonY * 0.76
    );
    const radius = 0.6 + seededUnit(seed, index * 3 + 2) * 1.3;
    const opacity = 0.18 + seededUnit(seed ^ 0x7f4a7c15, index) * 0.42;
    return `<circle cx="${x}" cy="${y}" r="${radius.toFixed(2)}" fill="#f8fafc" fill-opacity="${opacity.toFixed(2)}" />`;
  }).join("");

  const nearby = getNearbyLunarAttractions(
    input.snapshot.centerX,
    input.snapshot.centerY,
    1
  );
  const nearest = nearby[0];
  const nearestFeature = nearest
    ? `${escapeXml(nearest.name)} · ${formatDistance(
        nearest.distanceKilometers
      )} ${escapeXml(nearest.direction)}`
    : "Open lunar terrain";
  const settlementName = input.snapshot.cityName || input.snapshot.townName || "";
  const hasSettlement = Boolean(settlementName);
  const nearbyFeatureActive = Boolean(nearest && nearest.distanceKilometers <= 180);
  const propertyId = escapeXml(input.snapshot.propertyId);
  const location = escapeXml(input.snapshot.locationLabel);
  const propertyType = escapeXml(propertyTypeLabel(input.snapshot.propertyType));
  const certificate = escapeXml(input.snapshot.certificateNumber);
  const padding = Math.round(input.outputWidth * 0.045);
  const titleSize = Math.round(input.outputWidth * 0.04);
  const detailSize = Math.round(input.outputWidth * 0.0135);
  const smallSize = Math.round(input.outputWidth * 0.0102);
  const footerHeight = Math.round(input.outputHeight * 0.18);
  const footerTop = input.outputHeight - footerHeight;
  const lightX = Math.round(
    input.outputWidth * (0.22 + seededUnit(seed, 301) * 0.52)
  );
  const contextLine = hasSettlement
    ? `Nearby community inspiration · ${escapeXml(settlementName)}`
    : nearbyFeatureActive && nearest
    ? `Nearby landscape inspiration · ${escapeXml(nearest.name)}`
    : "Open lunar terrain inspiration";

  const settlementSilhouette = hasSettlement
    ? `<g opacity="0.17" transform="translate(${Math.round(
        input.outputWidth * 0.76
      )} ${input.horizonY + Math.round(input.outputHeight * 0.05)})">
          <ellipse cx="0" cy="18" rx="72" ry="17" fill="#e2e8f0" fill-opacity="0.07" />
          <path d="M-86 18 L-58 -18 L-28 18 Z" fill="#e2e8f0" fill-opacity="0.10" />
          <path d="M-18 18 A22 18 0 0 1 26 18 Z" fill="#f8fafc" fill-opacity="0.10" />
          <rect x="34" y="-6" width="15" height="24" rx="3" fill="#e2e8f0" fill-opacity="0.09" />
          <rect x="55" y="-12" width="11" height="30" rx="3" fill="#e2e8f0" fill-opacity="0.08" />
        </g>`
    : "";

  const featureBackdrop = nearbyFeatureActive
    ? `<path d="M0 ${input.horizonY + Math.round(input.outputHeight * 0.11)} C ${Math.round(
        input.outputWidth * 0.12
      )} ${input.horizonY + Math.round(input.outputHeight * 0.02)}, ${Math.round(
        input.outputWidth * 0.3
      )} ${input.horizonY + Math.round(input.outputHeight * 0.14)}, ${Math.round(
        input.outputWidth * 0.48
      )} ${input.horizonY + Math.round(input.outputHeight * 0.04)} S ${Math.round(
        input.outputWidth * 0.76
      )} ${input.horizonY + Math.round(input.outputHeight * 0.15)}, ${input.outputWidth} ${
        input.horizonY + Math.round(input.outputHeight * 0.08)
      } L ${input.outputWidth} ${input.outputHeight} L 0 ${input.outputHeight} Z" fill="#f8fafc" fill-opacity="0.05" />`
    : "";

  return Buffer.from(`
    <svg width="${input.outputWidth}" height="${input.outputHeight}" viewBox="0 0 ${input.outputWidth} ${input.outputHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="virtualSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#02030a" />
          <stop offset="0.6" stop-color="#07101f" />
          <stop offset="1" stop-color="#0f172a" />
        </linearGradient>
        <linearGradient id="virtualGroundShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#020617" stop-opacity="0.32" />
          <stop offset="0.38" stop-color="#020617" stop-opacity="0.08" />
          <stop offset="1" stop-color="#020617" stop-opacity="0.72" />
        </linearGradient>
        <radialGradient id="virtualHorizonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#fef3c7" stop-opacity="0.55" />
          <stop offset="0.2" stop-color="#fde68a" stop-opacity="0.16" />
          <stop offset="0.7" stop-color="#facc15" stop-opacity="0.02" />
          <stop offset="1" stop-color="#facc15" stop-opacity="0" />
        </radialGradient>
        <linearGradient id="virtualFooter" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#020617" stop-opacity="0.92" />
          <stop offset="1" stop-color="#111827" stop-opacity="0.88" />
        </linearGradient>
        <filter id="virtualSoftGlow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
      </defs>

      <rect x="0" y="0" width="${input.outputWidth}" height="${input.horizonY + 30}" fill="url(#virtualSky)" />
      ${stars}
      <ellipse cx="${lightX}" cy="${input.horizonY - 6}" rx="${Math.round(
        input.outputWidth * 0.2
      )}" ry="${Math.round(
        input.outputHeight * 0.08
      )}" fill="url(#virtualHorizonGlow)" filter="url(#virtualSoftGlow)" />
      <line x1="0" y1="${input.horizonY}" x2="${input.outputWidth}" y2="${input.horizonY}" stroke="#f8fafc" stroke-opacity="0.14" stroke-width="2" />
      ${featureBackdrop}
      ${settlementSilhouette}
      <rect x="0" y="${input.horizonY}" width="${input.outputWidth}" height="${input.outputHeight - input.horizonY}" fill="url(#virtualGroundShade)" />

      <g transform="translate(${padding} ${Math.round(input.outputHeight * 0.088)})">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="900" fill="#67e8f9" letter-spacing="6">LUNASCAPE</text>
        <text x="0" y="${Math.round(titleSize * 1.12)}" font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="900" fill="#ffffff">YOUR LUNASCAPE PROPERTY</text>
        <text x="0" y="${Math.round(titleSize * 1.76)}" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="700" fill="#cbd5e1" letter-spacing="2">VIRTUAL PREVIEW FOR YOUR FUTURE LUNASCAPE EXPERIENCE</text>
      </g>

      <rect x="0" y="${footerTop}" width="${input.outputWidth}" height="${footerHeight}" fill="url(#virtualFooter)" />
      <rect x="0" y="${footerTop}" width="${input.outputWidth}" height="${Math.max(4, input.outputHeight * 0.005)}" fill="#67e8f9" />
      <text x="${padding}" y="${footerTop + Math.round(detailSize * 1.8)}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(detailSize * 1.55)}" font-weight="900" fill="#67e8f9">${propertyId}</text>
      <text x="${padding}" y="${footerTop + Math.round(detailSize * 3.25)}" font-family="Arial, Helvetica, sans-serif" font-size="${detailSize}" font-weight="800" fill="#ffffff">${propertyType} · ${location}</text>
      <text x="${padding}" y="${footerTop + Math.round(detailSize * 4.55)}" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="700" fill="#cbd5e1">${escapeXml(contextLine)}</text>

      <text x="${input.outputWidth - padding}" y="${footerTop + Math.round(detailSize * 1.6)}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="800" fill="#94a3b8">NEAREST FEATURE</text>
      <text x="${input.outputWidth - padding}" y="${footerTop + Math.round(detailSize * 2.95)}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${detailSize}" font-weight="900" fill="#67e8f9">${nearestFeature}</text>
      <text x="${input.outputWidth - padding}" y="${footerTop + Math.round(detailSize * 4.35)}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="800" fill="#cbd5e1">CERTIFICATE · ${certificate}</text>
      <text x="${input.outputWidth / 2}" y="${input.outputHeight - Math.round(input.outputHeight * 0.022)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(11, Math.round(smallSize * 0.78))}" fill="#64748b">Virtual LunaScape preview inspired by real ${input.terrainSource === "tiles" ? "high-resolution " : ""}lunar terrain and local context · Novelty commemorative image</text>
    </svg>
  `);
}

export async function renderOwnedPropertyVirtualImage(
  snapshot: OwnedPropertySnapshot,
  size: RenderSize = "full"
): Promise<Buffer> {
  const outputWidth =
    size === "thumb" ? POSTCARD_THUMB_WIDTH : POSTCARD_FULL_WIDTH;
  const outputHeight =
    size === "thumb" ? POSTCARD_THUMB_HEIGHT : POSTCARD_FULL_HEIGHT;
  const horizonY = Math.round(outputHeight * 0.34);
  const footerHeight = Math.round(outputHeight * 0.18);
  const groundHeight = outputHeight - horizonY - footerHeight + 18;
  const requestedCrop = virtualCropForSnapshot(snapshot, outputWidth, Math.round(outputHeight * 0.72));
  const { image: terrain, source } = await renderLrocTerrainCrop({
    crop: requestedCrop,
    outputWidth,
    outputHeight: Math.max(760, Math.round(outputHeight * 1.05)),
  });
  const virtualTerrain = await createVirtualTerrainScene({
    terrain,
    outputWidth,
    groundHeight,
  });
  const overlay = virtualOverlaySvg({
    snapshot,
    outputWidth,
    outputHeight,
    horizonY,
    terrainSource: source,
  });

  return sharp({
    create: {
      width: outputWidth,
      height: outputHeight,
      channels: 4,
      background: { r: 2, g: 4, b: 10, alpha: 1 },
    },
  })
    .composite([
      { input: virtualTerrain, left: 0, top: horizonY },
      { input: overlay, left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

export async function renderOwnedPropertyPostcardImage(
  snapshot: OwnedPropertySnapshot,
  size: RenderSize = "full"
): Promise<Buffer> {
  const outputWidth =
    size === "thumb" ? POSTCARD_THUMB_WIDTH : POSTCARD_FULL_WIDTH;
  const outputHeight =
    size === "thumb" ? POSTCARD_THUMB_HEIGHT : POSTCARD_FULL_HEIGHT;
  const horizonY = Math.round(outputHeight * 0.315);
  const footerHeight = Math.round(outputHeight * 0.205);
  const groundHeight = outputHeight - horizonY - footerHeight + 16;
  const requestedCrop = postcardCropForSnapshot(
    snapshot,
    outputWidth,
    Math.round(outputHeight * 0.66)
  );
  const { image: terrain, source } = await renderLrocTerrainCrop({
    crop: requestedCrop,
    outputWidth,
    outputHeight: Math.max(640, Math.round(outputHeight * 1.12)),
  });
  const perspectiveTerrain = await createPerspectiveTerrain({
    terrain,
    outputWidth,
    groundHeight,
  });
  const overlay = postcardOverlaySvg({
    snapshot,
    outputWidth,
    outputHeight,
    horizonY,
    terrainSource: source,
  });

  return sharp({
    create: {
      width: outputWidth,
      height: outputHeight,
      channels: 4,
      background: { r: 1, g: 3, b: 10, alpha: 1 },
    },
  })
    .composite([
      {
        input: perspectiveTerrain,
        left: 0,
        top: horizonY,
      },
      { input: overlay, left: 0, top: 0 },
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

export async function renderOwnedPropertyImage(
  snapshot: OwnedPropertySnapshot,
  size: RenderSize = "full",
  view: PropertyImageView = "scenic"
): Promise<Buffer> {
  if (view === "locator") {
    return renderOwnedPropertyLocatorImage(snapshot, size);
  }

  if (view === "virtual") {
    return renderOwnedPropertyVirtualImage(snapshot, size);
  }

  if (view === "postcard") {
    return renderOwnedPropertyPostcardImage(snapshot, size);
  }

  return renderOwnedPropertyScenicImage(snapshot, size);
}
