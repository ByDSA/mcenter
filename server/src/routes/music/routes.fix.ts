/* eslint-disable no-continue */
/* eslint-disable no-labels */
/* eslint-disable no-restricted-syntax */
import express from "express";
import fs from "fs";
import { createFromPath, findAll, findByHash, findByPath, findByUrl, Music } from "../../db/models/music";
import { getFullPathMusic, loadEnv } from "../../env";
import { calcHashFromFile, findAllValidMusicFiles, findFiles } from "../../files";

export async function fixAll(req: express.Request, res: express.Response) {
  const remoteMusic = await findAll();
  const localMusic = await fixDataFromLocalFiles();

  mainLoop: for (const m of remoteMusic) {
    for (const ml of localMusic) {
      if (m.path === ml.path)
        continue mainLoop;
    }

    m.remove();
  }

  res.send(localMusic);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fixOne(req: express.Request, res: express.Response) {
  const local = <string | undefined>req.query.local;
  const url = <string | undefined>req.query.url;
  let path = local;
  let music: Music | null = null;

  if (!path && url) {
    music = await findByUrl(url);

    if (music)
      path = music.path;
  }

  let existsPath = false;

  if (path)
    existsPath = fs.existsSync(getFullPathMusic(path));

  if (!path || (!music && !existsPath)) {
    res.sendStatus(404);

    return;
  }

  await fixDataFromLocalFile(path);

  if (music) {
    const { hash } = music;

    loadEnv();
    const folder = <string>process.env.MEDIA_PATH;
    const files = findFiles( {
      fileHash: hash,
      folder,
      onlyFirst: true,
    } );

    if (files.length > 0) {
      // eslint-disable-next-line prefer-destructuring
      music.path = files[0];
      music.save();
    } else
      music.remove();
  }

  res.sendStatus(200);
}

function fixDataFromLocalFiles(): Promise<Music[]> {
  const files = findAllValidMusicFiles();
  const musics = files.map((relativePath) => fixDataFromLocalFile(relativePath));

  return Promise.all(musics);
}

async function fixDataFromLocalFile(relativePath: string) {
  const fullPath = getFullPathMusic(relativePath);
  const hash = calcHashFromFile(fullPath);
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

    music.save();
  }

  return music;
}
