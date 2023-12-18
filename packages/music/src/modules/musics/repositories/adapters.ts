/* eslint-disable import/prefer-default-export */
import { Music } from "#shared/models/musics";
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
  };

  // TODO: descomentar cuando se arreglen los datos en producción
  // assertIsMusic(model);

  return model;
}