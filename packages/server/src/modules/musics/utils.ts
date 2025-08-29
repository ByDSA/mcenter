import path from "node:path";

export const ENVS = Object.freeze( {
  mediaPath: process.env.MEDIA_FOLDER_PATH as string,
  mongo: {
    db: process.env.MONGO_DB as string,
    user: process.env.MONGO_USER as string | undefined,
    password: process.env.MONGO_PASSWORD as string | undefined,
    port: process.env.MONGO_PORT ? +process.env.MONGO_PORT : undefined,
    hostname: process.env.MONGO_HOSTNAME as string,
  },
  port: +(process.env.PORT ?? 8080),
} );

export const MUSIC_MEDIA_PATH = path.join(ENVS.mediaPath, "music", "data");

export function getAbsolutePath(relativePath: string = ""): string {
  let mediaPath = MUSIC_MEDIA_PATH;

  if (!mediaPath.startsWith("/"))
    mediaPath = path.join(process.cwd(), mediaPath);

  return path.join(mediaPath, relativePath);
}
