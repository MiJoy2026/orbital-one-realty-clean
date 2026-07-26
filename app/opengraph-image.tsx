import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt =
  "Orbital One Realty novelty lunar property and LunaSphere Moon atlas";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function OpenGraphImage() {
  const image = await readFile(
    join(process.cwd(), "public", "seo", "orbital-one-social.png")
  );

  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
