import mongoose, { UpdateQuery } from "mongoose";
import { assertIsMusicEntity, MusicEntity } from "$shared/models/musics";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { MusicFileInfoOdm } from "#musics/file-info/repositories/odm";
import { timestampsModelToDocOdm } from "#modules/resources/odm/Timestamps";
import { Music } from "../../models";
import { DocOdm, FullDocOdm } from "./odm";

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

export function musicDocOdmToEntity(docOdm: FullDocOdm): MusicEntity {
  const entity: MusicEntity = {
    id: docOdm._id.toString(),
    title: docOdm.title,
    url: docOdm.url,
    weight: docOdm.weight,
    artist: docOdm.artist,
    tags: docOdmToModelTags(docOdm),
    disabled: docOdm.disabled,
    lastTimePlayed: docOdm.lastTimePlayed,
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

  if (docOdm.fileInfos)
    entity.fileInfos = docOdm.fileInfos.map(MusicFileInfoOdm.toEntity);

  assertIsMusicEntity(entity);

  return entity;
}

export function musicToDocOdm(model: Music): DocOdm {
  const docOdm: DocOdm = {
    title: model.title,
    url: model.url,
    weight: model.weight,
    artist: model.artist,
    timestamps: timestampsModelToDocOdm(model.timestamps),
  };

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

  if (model.album !== undefined)
    docOdm.album = model.album;

  if (model.country !== undefined)
    docOdm.country = model.country;

  if (model.game !== undefined)
    docOdm.game = model.game;

  if (model.year !== undefined)
    docOdm.year = model.year;

  return docOdm;
}

export function musicEntityToDocOdm(entity: MusicEntity): FullDocOdm {
  return {
    ...musicToDocOdm(entity),
    _id: new mongoose.Types.ObjectId(entity.id),
  };
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

export function patchParamsToUpdateQuery(params: PatchOneParams<Music>): UpdateQuery<DocOdm> {
  const { entity } = params;
  const docOdmTags = modelTagsToDocOdmTags(entity.tags);
  const updateQuery: UpdateQuery<DocOdm> = {
    title: entity.title,
    url: entity.url,
    weight: entity.weight,
    artist: entity.artist,
    tags: docOdmTags.tags,
    onlyTags: docOdmTags.onlyTags,
    disabled: entity.disabled,
    lastTimePlayed: entity.lastTimePlayed,
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
