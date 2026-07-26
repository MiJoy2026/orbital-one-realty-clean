import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Orbital One Realty",
    short_name: "Orbital One",
    description:
      "Explore novelty lunar property, LunaSphere states, cities, towns, landmarks, and personalized Moon property gifts.",
    start_url: "/",
    display: "standalone",
    background_color: "#02040a",
    theme_color: "#02040a",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
