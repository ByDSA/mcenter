import mongoose, { UpdateQuery } from "mongoose";
import { Music, assertIsMusic } from "../models";
import { DocOdm } from "./odm";
import { PatchOneParams } from "./types";

function docOdmToModelTags(docOdm: DocOdm): string[] | undefined {
  if (!docOdm.tags && !docOdm.onlyTags)
    return undefined;

  let tags: string[] | undefined;

  if (docOdm.tags)
    tags = [...docOdm.tags];

  if (docOdm.onlyTags) {
    if (!tags)
      tags = [];

    tags.push(...docOdm.onlyTags.map((tag) => `only-${tag}`));

    return tags;
  }

  return tags;
}

export function musicDocOdmToModel(docOdm: DocOdm): Music {
  const model: Music = {

    id: docOdm._id.toString(),
    hash: docOdm.hash,
    title: docOdm.title,
    url: docOdm.url,
    path: docOdm.path,
    weight: docOdm.weight,
    artist: docOdm.artist,
    tags: docOdmToModelTags(docOdm),
    mediaInfo: {
      duration: docOdm.mediaInfo.duration,
    },
    disabled: docOdm.disabled,
    lastTimePlayed: docOdm.lastTimePlayed,
    size: docOdm.size,
    timestamps: {
      createdAt: docOdm.timestamps.createdAt,
      updatedAt: docOdm.timestamps.updatedAt,
      addedAt: docOdm.timestamps.addedAt,
    },
    album: docOdm.album,
    country: docOdm.country,
    game: docOdm.game,
    year: docOdm.year,
  };

  assertIsMusic(model);

  return model;
}

export function musicModelToDocOdm(model: Music): DocOdm {
  const docOdm: Partial<DocOdm> = {
    hash: model.hash,
    title: model.title,
    url: model.url,
  };

  if (model.id !== undefined)

    docOdm._id = new mongoose.Types.ObjectId(model.id);

  if (model.path !== undefined)
    docOdm.path = model.path;

  if (model.weight !== undefined)
    docOdm.weight = model.weight;

  if (model.artist !== undefined)
    docOdm.artist = model.artist;

  if (model.tags !== undefined) {
    const docOdmTags = modelTagsToDocOdmTags(model.tags);

    if (docOdmTags.tags)
      docOdm.tags = docOdmTags.tags;

    if (docOdmTags.onlyTags)
      docOdm.onlyTags = docOdmTags.onlyTags;
  }

  if (model.disabled !== undefined)
    docOdm.disabled = model.disabled;

  if (model.lastTimePlayed !== undefined)
    docOdm.lastTimePlayed = model.lastTimePlayed;

  if (model.size !== undefined)
    docOdm.size = model.size;

  if (model.album !== undefined)
    docOdm.album = model.album;

  if (model.country !== undefined)
    docOdm.country = model.country;

  if (model.game !== undefined)
    docOdm.game = model.game;

  if (model.year !== undefined)
    docOdm.year = model.year;

  if (model.mediaInfo !== undefined) {
    docOdm.mediaInfo = {
      duration: model.mediaInfo.duration,
    };
  }

  if (model.timestamps) {
    docOdm.timestamps = {
      createdAt: model.timestamps.createdAt,
      updatedAt: model.timestamps.updatedAt,
      addedAt: model.timestamps.addedAt,
    };
  }

  return docOdm as DocOdm;
}

function modelTagsToDocOdmTags(
  tags: string[] | undefined,
): { tags?: string[];
onlyTags?: string[]; } {
  if (!tags)
    return {};

  const retTags = tags.filter((tag) => !tag.startsWith("only-"));
  const retOnlyTags = tags.filter((tag) => tag.startsWith("only-")).map((tag) => tag.slice(5));

  return {
    tags: retTags.length > 0 ? retTags : undefined,
    onlyTags: retOnlyTags.length > 0 ? retOnlyTags : undefined,
  };
}

export function patchParamsToUpdateQuery(params: PatchOneParams): UpdateQuery<DocOdm> {
  const { entity } = params;
  const docOdmTags = modelTagsToDocOdmTags(entity.tags);
  const updateQuery: UpdateQuery<DocOdm> = {
    hash: entity.hash,
    title: entity.title,
    url: entity.url,
    path: entity.path,
    weight: entity.weight,
    artist: entity.artist,
    tags: docOdmTags.tags,
    onlyTags: docOdmTags.onlyTags,
    disabled: entity.disabled,
    lastTimePlayed: entity.lastTimePlayed,
    size: entity.size,
    album: entity.album,
    country: entity.country,
    game: entity.game,
    year: entity.year,
  };

  if (params.unset && params.unset.length > 0) {
    updateQuery.$unset = params.unset.reduce((acc, path) => {
      const key = path.join(".");

      acc[key] = 1;

      return acc;
    }, {} as Record<string, 1>);

    // updateQuery.$pull = params.unset.reduce((acc, path) => {
    //   const key = path.toSpliced(-1).join(".");
    //   acc[key] = null;
    //   return acc;
    // }, {
    // } );
  }

  if (entity.mediaInfo) {
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
