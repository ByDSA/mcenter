/* eslint-disable import/no-default-export */
/* eslint-disable camelcase */
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MCenter",
    short_name: "MCenter",
    description: "Multimedia Center",
    start_url: "/",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    theme_color: "#3DC3FF",
    background_color: "#000000",
    display: "standalone",
  };
}
