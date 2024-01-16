/* eslint-disable import/prefer-default-export */
import { Music, MusicVO, assertIsMusic } from "#shared/models/musics";
import { UpdateQuery } from "mongoose";
import { DocOdm } from "./odm";
import { PatchOneParams } from "./types";

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

export function patchParamsToUpdateQuery(params: PatchOneParams): UpdateQuery<DocOdm> {
  const {entity} = params;
  const updateQuery: UpdateQuery<DocOdm> = {
    hash: entity.hash,
    title: entity.title,
    url: entity.url,
    path: entity.path,
    weight: entity.weight,
    artist: entity.artist,
    tags: entity.tags,
    disabled: entity.disabled,
    lastTimePlayed: entity.lastTimePlayed,
    size: entity.size,
    album: entity.album,
    country: entity.country,
    game: entity.game,
  };

  if (params.unset && params.unset.length > 0) {
    updateQuery.$unset = params.unset.reduce((acc, key) => {
      acc[key] = 1;

      return acc;
    }, {
    } as Record<keyof MusicVO, 1>);
  }

  if (entity.mediaInfo){
    updateQuery.mediaInfo = {
      duration: entity.mediaInfo.duration,
    };
  }

  if (entity.timestamps) {
    updateQuery.timestamps = {
      createdAt: entity.timestamps.createdAt,
      updatedAt: entity.timestamps.updatedAt,
    };
  }

  // eslint-disable-next-line no-restricted-syntax
  for (const key in updateQuery) {
    if ((updateQuery as any)[key] === undefined)
      delete (updateQuery as any)[key];
  }

  return updateQuery;
}