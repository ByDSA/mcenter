/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import { loadEnv } from "@actions/utils/env";
import fs from "fs";
import { createFromPath } from "./create";
import Doc from "./document";
import { calcHashFile, findFileByHash, findFiles, getFullPath } from "./files";
import { findAll, findByHash, findByPath, findByUrl } from "./find";

export async function fixAll() {
  const remoteMusic = await findAll();
  const localMusic = await fixDataFromLocalFiles();

  // eslint-disable-next-line no-labels
  mainLoop: for (const m of remoteMusic) {
    for (const ml of localMusic) {
      if (m && ml && m.path === ml.path)
        // eslint-disable-next-line no-labels
        continue mainLoop;
    }

    m.remove();
  }

  return localMusic;
}

function fixDataFromLocalFiles(): Promise<(Doc|null)[]> {
  const files = findFiles();
  const musics = files.map((relativePath) => fixDataFromLocalFile(relativePath));

  return Promise.all(musics);
}

async function fixDataFromLocalFile(relativePath: string) {
  const hash = calcHashFile(relativePath);
  const musicByHash = await findByHash(hash);
  let music;

  if (musicByHash) {
    music = musicByHash;

    if (music.path !== relativePath) {
      music.path = relativePath;
      music.save();
    }
  } else {
    const musicByPath = await findByPath(relativePath);

    if (musicByPath) {
      musicByPath.hash = hash;
      music = musicByPath;
    } else
      music = await createFromPath(relativePath);

    if (music)
      music.save();
  }

  return music;
}

type FixOneParams = { url?: string; local?: string};
export async function fixOne( { url, local }: FixOneParams) {
  let relativePath = local;
  let music: Doc | null = null;

  if (!relativePath && url) {
    music = await findByUrl(url);

    if (music)
      relativePath = music.path;
  }

  let existsPath = false;

  if (relativePath) {
    const fullPath = getFullPath(relativePath);

    existsPath = fs.existsSync(fullPath);
  }

  if (!relativePath || (!music && !existsPath))
    return null;

  music = await fixDataFromLocalFile(relativePath);

  if (music) {
    const { hash } = music;

    loadEnv();
    const file = await findFileByHash(hash);

    if (file) {
      // eslint-disable-next-line prefer-destructuring
      music.path = file;
      music.save();
    } else
      music.remove();
  }

  return music;
}
