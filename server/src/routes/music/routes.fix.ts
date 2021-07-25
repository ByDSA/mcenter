/* eslint-disable no-continue */
/* eslint-disable no-labels */
/* eslint-disable no-restricted-syntax */
import express from "express";
import fs from "fs";
import { createMusicFromPath, findAllMusics, findMusicByHash, findMusicByPath, findMusicByUrl, findMusicFiles, getMusicFullPath, Music } from "../../db/models/music";
import { loadEnv } from "../../env";
import { calcHashFromFile, findFiles } from "../../files";

export async function fixAll(req: express.Request, res: express.Response) {
  const remoteMusic = await findAllMusics();
  const localMusic = await fixDataFromLocalFiles();

  mainLoop: for (const m of remoteMusic) {
    for (const ml of localMusic) {
      if (m && ml && m.path === ml.path)
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
    music = await findMusicByUrl(url);

    if (music)
      path = music.path;
  }

  let existsPath = false;

  if (path)
    existsPath = fs.existsSync(getMusicFullPath(path));

  if (!path || (!music && !existsPath)) {
    res.sendStatus(404);

    return;
  }

  await fixDataFromLocalFile(path);

  if (music) {
    const { hash } = music;

    loadEnv();
    const folder = <string>process.env.MUSICS_PATH;
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

function fixDataFromLocalFiles(): Promise<(Music|null)[]> {
  const files = findMusicFiles();
  const musics = files.map((relativePath) => fixDataFromLocalFile(relativePath));

  return Promise.all(musics);
}

async function fixDataFromLocalFile(relativePath: string) {
  const fullPath = getMusicFullPath(relativePath);
  const hash = calcHashFromFile(fullPath);
  const musicByHash = await findMusicByHash(hash);
  let music;

  if (musicByHash) {
    music = musicByHash;

    if (music.path !== relativePath) {
      music.path = relativePath;
      music.save();
    }
  } else {
    const musicByPath = await findMusicByPath(relativePath);

    if (musicByPath) {
      musicByPath.hash = hash;
      music = musicByPath;
    } else
      music = await createMusicFromPath(relativePath);

    if (music)
      music.save();
  }

  return music;
}
