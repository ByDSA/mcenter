/* eslint-disable import/prefer-default-export */
import { Music, assertIsMusic } from "#shared/models/musics";
import { DocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): Music {
  const model: Music = {
    // eslint-disable-next-line no-underscore-dangle
    id: docOdm._id.toString(),
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

export function partialModelToPartialDocOdm(model: Partial<Music>): Partial<DocOdm> {
  const docOdm: Partial<DocOdm> = {
    hash: model.hash,
    title: model.title,
    url: model.url,
    path: model.path,
    weight: model.weight,
    artist: model.artist,
    tags: model.tags,
    disabled: model.disabled,
    lastTimePlayed: model.lastTimePlayed,
    size: model.size,
    album: model.album,
    country: model.country,
    game: model.game,
  };

  if (model.mediaInfo){
    docOdm.mediaInfo = {
      duration: model.mediaInfo.duration,
    };
  }

  if (model.timestamps) {
    docOdm.timestamps = {
      createdAt: model.timestamps.createdAt,
      updatedAt: model.timestamps.updatedAt,
    };
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const key in docOdm) {
    if ((docOdm as any)[key] === undefined)
      delete (docOdm as any)[key];
  }

  return docOdm;
}