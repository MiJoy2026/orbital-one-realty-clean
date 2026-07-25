import path from "node:path";

import type { OwnedPropertySnapshot } from "@prisma/client";
import sharp from "sharp";

import { getNearbyLunarAttractions } from "./lunar-attractions";

export type LunaScapeRenderSize = "full" | "thumb";

const FULL_WIDTH = 1920;
const FULL_HEIGHT = 1080;
const THUMB_WIDTH = 960;
const THUMB_HEIGHT = 540;

const OPEN_TERRAIN_SCENE = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  "public",
  "lunascape",
  "virtual-scenes",
  "open-terrain.png"
);
const TOWN_SCENE = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  "public",
  "lunascape",
  "virtual-scenes",
  "town-community.jpg"
);
const CITY_SCENE = path.resolve(
  /* turbopackIgnore: true */ process.cwd(),
  "public",
  "lunascape",
  "virtual-scenes",
  "city-community.jpg"
);

const ATTRACTION_IMAGE_PATHS: Record<string, string> = {
  apollo11: path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    "attractions",
    "apollo11.jpg"
  ),
  tycho: path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    "attractions",
    "tycho.jpg"
  ),
  copernicus: path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    "attractions",
    "copernicus.jpg"
  ),
  plato: path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    "attractions",
    "plato.jpg"
  ),
  maretranquillitatis: path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    "attractions",
    "maretranquillitatis.jpg"
  ),
  montesapenninus: path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    "public",
    "attractions",
    "montesapenninus.jpg"
  ),
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function propertyTypeLabel(propertyType: string): string {
  if (propertyType === "City Block") return "CITY BLOCK";
  if (propertyType === "Town Block") return "TOWN BLOCK";
  return "RURAL PROPERTY";
}

function formatDistance(distanceKilometers: number): string {
  if (distanceKilometers < 10) {
    return `${distanceKilometers.toFixed(1)} km`;
  }

  return `${Math.round(distanceKilometers).toLocaleString("en-US")} km`;
}

function sceneForSnapshot(snapshot: OwnedPropertySnapshot): {
  path: string;
  sceneType: "city" | "town" | "terrain";
} {
  if (snapshot.propertyType === "City Block" || snapshot.cityName) {
    return { path: CITY_SCENE, sceneType: "city" };
  }

  if (snapshot.propertyType === "Town Block" || snapshot.townName) {
    return { path: TOWN_SCENE, sceneType: "town" };
  }

  return { path: OPEN_TERRAIN_SCENE, sceneType: "terrain" };
}

async function createAttractionAccent(input: {
  attractionId: string;
  width: number;
  height: number;
}): Promise<Buffer | null> {
  const sourcePath = ATTRACTION_IMAGE_PATHS[input.attractionId];

  if (!sourcePath) {
    return null;
  }

  const accentWidth = Math.round(input.width * 0.46);
  const accentHeight = Math.round(input.height * 0.43);
  const image = await sharp(sourcePath, { failOn: "none" })
    .resize(accentWidth, accentHeight, {
      fit: "cover",
      position: "centre",
      kernel: sharp.kernel.lanczos3,
    })
    .greyscale()
    .modulate({ brightness: 0.78 })
    .blur(0.7)
    .ensureAlpha(0.16)
    .png()
    .toBuffer();

  const mask = Buffer.from(`
    <svg width="${accentWidth}" height="${accentHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fade" cx="72%" cy="42%" r="70%">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.86" />
          <stop offset="0.48" stop-color="#ffffff" stop-opacity="0.42" />
          <stop offset="1" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#fade)" />
    </svg>
  `);

  return sharp(image)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

function buildOverlay(input: {
  snapshot: OwnedPropertySnapshot;
  outputWidth: number;
  outputHeight: number;
  sceneType: "city" | "town" | "terrain";
  nearbyFeatureLabel: string;
  contextLabel: string;
}): Buffer {
  const padding = Math.round(input.outputWidth * 0.046);
  const titleSize = Math.round(input.outputWidth * 0.042);
  const idSize = Math.round(input.outputWidth * 0.022);
  const detailSize = Math.round(input.outputWidth * 0.0135);
  const smallSize = Math.round(input.outputWidth * 0.0102);
  const footerHeight = Math.round(input.outputHeight * 0.19);
  const footerTop = input.outputHeight - footerHeight;
  const propertyId = escapeXml(input.snapshot.propertyId);
  const certificate = escapeXml(input.snapshot.certificateNumber);
  const location = escapeXml(input.snapshot.locationLabel);
  const propertyType = escapeXml(propertyTypeLabel(input.snapshot.propertyType));
  const sceneDescription =
    input.sceneType === "city"
      ? "CITY PROPERTY EXPERIENCE"
      : input.sceneType === "town"
      ? "TOWN PROPERTY EXPERIENCE"
      : "LUNAR TERRAIN EXPERIENCE";

  return Buffer.from(`
    <svg width="${input.outputWidth}" height="${input.outputHeight}" viewBox="0 0 ${input.outputWidth} ${input.outputHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="topShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#020617" stop-opacity="0.60" />
          <stop offset="0.28" stop-color="#020617" stop-opacity="0.06" />
          <stop offset="0.76" stop-color="#020617" stop-opacity="0.04" />
          <stop offset="1" stop-color="#020617" stop-opacity="0.82" />
        </linearGradient>
        <radialGradient id="vignette" cx="50%" cy="44%" r="74%">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0" />
          <stop offset="0.72" stop-color="#020617" stop-opacity="0.06" />
          <stop offset="1" stop-color="#020617" stop-opacity="0.62" />
        </radialGradient>
        <linearGradient id="footer" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#020617" stop-opacity="0.95" />
          <stop offset="1" stop-color="#0f172a" stop-opacity="0.90" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="${input.outputWidth}" height="${input.outputHeight}" fill="url(#topShade)" />
      <rect x="0" y="0" width="${input.outputWidth}" height="${input.outputHeight}" fill="url(#vignette)" />

      <g transform="translate(${padding} ${Math.round(input.outputHeight * 0.085)})">
        <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="900" fill="#67e8f9" letter-spacing="7">LUNASCAPE</text>
        <text x="0" y="${Math.round(titleSize * 1.12)}" font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="900" fill="#ffffff" letter-spacing="1">YOUR LUNASCAPE PROPERTY</text>
        <text x="0" y="${Math.round(titleSize * 1.76)}" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="800" fill="#cbd5e1" letter-spacing="3">${sceneDescription} · VIRTUAL PROPERTY PREVIEW</text>
      </g>

      <rect x="0" y="${footerTop}" width="${input.outputWidth}" height="${footerHeight}" fill="url(#footer)" />
      <rect x="0" y="${footerTop}" width="${input.outputWidth}" height="${Math.max(4, input.outputHeight * 0.005)}" fill="#67e8f9" />

      <text x="${padding}" y="${footerTop + idSize * 1.10}" font-family="Arial, Helvetica, sans-serif" font-size="${idSize}" font-weight="900" fill="#67e8f9">${propertyId}</text>
      <text x="${padding}" y="${footerTop + idSize * 1.82}" font-family="Arial, Helvetica, sans-serif" font-size="${detailSize}" font-weight="800" fill="#ffffff">${propertyType} · ${location}</text>
      <text x="${padding}" y="${footerTop + idSize * 2.46}" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="700" fill="#cbd5e1">${escapeXml(input.contextLabel)}</text>

      <text x="${input.outputWidth - padding}" y="${footerTop + idSize * 1.00}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="800" fill="#94a3b8">LOCAL CONTEXT</text>
      <text x="${input.outputWidth - padding}" y="${footerTop + idSize * 1.72}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${detailSize}" font-weight="900" fill="#67e8f9">${escapeXml(input.nearbyFeatureLabel)}</text>
      <text x="${input.outputWidth - padding}" y="${footerTop + idSize * 2.40}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="${smallSize}" font-weight="800" fill="#cbd5e1">CERTIFICATE · ${certificate}</text>

      <text x="${input.outputWidth / 2}" y="${input.outputHeight - Math.round(input.outputHeight * 0.022)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.max(11, Math.round(smallSize * 0.78))}" fill="#64748b">Virtual LunaScape interpretation inspired by the property type, location, and nearby lunar context · Novelty commemorative image</text>
    </svg>
  `);
}

export async function renderLunaScapeVirtualImage(
  snapshot: OwnedPropertySnapshot,
  size: LunaScapeRenderSize = "full"
): Promise<Buffer> {
  const outputWidth = size === "thumb" ? THUMB_WIDTH : FULL_WIDTH;
  const outputHeight = size === "thumb" ? THUMB_HEIGHT : FULL_HEIGHT;
  const scene = sceneForSnapshot(snapshot);
  const nearby = getNearbyLunarAttractions(snapshot.centerX, snapshot.centerY, 1);
  const nearest = nearby[0];
  const nearbyEnough = Boolean(nearest && nearest.distanceKilometers <= 220);
  const attractionAccent =
    nearbyEnough && nearest
      ? await createAttractionAccent({
          attractionId: nearest.id,
          width: outputWidth,
          height: outputHeight,
        })
      : null;
  const communityName = snapshot.cityName || snapshot.townName;
  const contextLabel = communityName
    ? `Community setting · ${communityName}`
    : nearbyEnough && nearest
    ? `Nearby landscape inspiration · ${nearest.name}`
    : "Open lunar land and terrain";
  const nearbyFeatureLabel =
    nearbyEnough && nearest
      ? `${nearest.name} · ${formatDistance(nearest.distanceKilometers)} ${nearest.direction}`
      : communityName
      ? communityName
      : "Open lunar terrain";

  const base = await sharp(scene.path, { failOn: "none" })
    .resize(outputWidth, outputHeight, {
      fit: "cover",
      position: "centre",
      kernel: sharp.kernel.lanczos3,
    })
    .greyscale()
    .modulate({ brightness: 0.92 })
    .linear(1.06, -4)
    .sharpen({ sigma: 0.7, m1: 0.7, m2: 1.1 })
    .png()
    .toBuffer();
  const overlay = buildOverlay({
    snapshot,
    outputWidth,
    outputHeight,
    sceneType: scene.sceneType,
    nearbyFeatureLabel,
    contextLabel,
  });
  const composites: Array<{ input: Buffer; left: number; top: number }> = [];

  if (attractionAccent) {
    composites.push({
      input: attractionAccent,
      left: Math.round(outputWidth * 0.52),
      top: Math.round(outputHeight * 0.07),
    });
  }

  composites.push({ input: overlay, left: 0, top: 0 });

  return sharp(base)
    .composite(composites)
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}
