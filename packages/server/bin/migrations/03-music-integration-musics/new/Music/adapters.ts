/* eslint-disable import/prefer-default-export */
import { Music, assertIsMusic } from "$shared/models/musics";
import { DocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): Music {
  const model: Music = {
    hash: docOdm.hash,
    title: docOdm.title,
    url: docOdm.url,
    path: docOdm.path,
    weight: docOdm.weight,
    artist: docOdm.artist,
    tags: docOdm.tags,
    mediaInfo: {
      duration: docOdm.mediaInfo.duration,
    },
    disabled: docOdm.disabled,
    lastTimePlayed: docOdm.lastTimePlayed,
    size: docOdm.size,
    timestamps: {
      createdAt: docOdm.timestamps.createdAt,
      updatedAt: docOdm.timestamps.updatedAt,
    },
    album: docOdm.album,
    country: docOdm.country,
    game: docOdm.game,
    todo: docOdm.todo,
    year: docOdm.year,
  };

  assertIsMusic(model);

  return model;
}