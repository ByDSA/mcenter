/* eslint-disable camelcase */
import { NextRequest, NextResponse, userAgent } from "next/server";
import { MetadataRoute } from "next";
import { getBrowserEnv } from "#modules/utils/env";

// Definimos los iconos fuera para reutilizarlos
const icons: MetadataRoute.Manifest["icons"] = [
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
];
const baseManifest: MetadataRoute.Manifest = {
  name: "MCenter",
  short_name: "MCenter",
  description: "Multimedia Center",
  start_url: "/",
  icons,
  theme_color: "#3DC3FF",
  background_color: "#000000",
  display: "standalone",
  prefer_related_applications: true,
  related_applications: [
    {
      platform: "webapp",
      url: "/manifest.json", // Debe apuntar a la ruta donde se sirve este JSON
    },
  ],
};

// eslint-disable-next-line require-await
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const currentPath = (searchParams.get("path") ?? "");
  const manifestUrl = request.nextUrl.pathname + request.nextUrl.search;
  let dynamicProps = {};
  const nameParam = searchParams.get("name");
  let name = nameParam;
  let start_url = currentPath;
  const browserEnv = getBrowserEnv( {
    userAgent: userAgent(request).ua,
  } );

  if (browserEnv === "desktop") {
    if (start_url.startsWith("/musics"))
      start_url = "/musics";
    else
      start_url = "/";
  }

  if (!name) {
    if (start_url.startsWith("/musics"))
      name = "MCenter Music";
    else
      name = "MCenter";
  }

  dynamicProps = {
    name,
    short_name: name,
    start_url,

  };

  return NextResponse.json( {
    ...baseManifest,
    ...dynamicProps,
    related_applications: [
      {
        platform: "webapp",
        url: manifestUrl,
      },
    ],
  } );
}
