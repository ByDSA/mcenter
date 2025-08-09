import mongoose from "mongoose";
import { MusicEntity } from "$shared/models/musics";
import { AllKeysOf } from "$shared/utils/types";
import { MusicFileInfoOdm } from "#musics/file-info/crud/repository/odm";
import { timestampsModelToDocOdm } from "#modules/resources/odm/timestamps";
import { Music } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";

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
    slug: docOdm.url,
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
    spotifyId: docOdm.spotifyId,
    fileInfos: docOdm.fileInfos?.map(MusicFileInfoOdm.toEntity),
  } satisfies AllKeysOf<MusicEntity>;

   return removeUndefinedDeep(entity);
}

export function musicToDocOdm(model: Music): DocOdm {
  const docOdmTags = model.tags ? modelTagsToDocOdmTags(model.tags) : undefined;
  const docOdm: DocOdm = {
    title: model.title,
    url: model.slug,
    weight: model.weight,
    artist: model.artist,
    timestamps: timestampsModelToDocOdm(model.timestamps),
    disabled: model.disabled,
    lastTimePlayed: model.lastTimePlayed,
    album: model.album,
    country: model.country,
    game: model.game,
    year: model.year,
    spotifyId: model.spotifyId,
    tags: docOdmTags?.tags,
    onlyTags: docOdmTags?.onlyTags,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return removeUndefinedDeep(docOdm);
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

export function partialToDocOdm(partial: Partial<Music>): Partial<DocOdm> {
  const docOdmTags = modelTagsToDocOdmTags(partial.tags);
  const ret: Partial<DocOdm> = {
    title: partial.title,
    url: partial.slug,
    weight: partial.weight,
    artist: partial.artist,
    tags: docOdmTags.tags,
    onlyTags: docOdmTags.onlyTags,
    disabled: partial.disabled,
    lastTimePlayed: partial.lastTimePlayed,
    album: partial.album,
    country: partial.country,
    game: partial.game,
    year: partial.year,
    spotifyId: partial.spotifyId,
    timestamps: partial.timestamps
      ? {
        createdAt: partial.timestamps.createdAt,
        updatedAt: partial.timestamps.updatedAt,
        addedAt: partial.timestamps.addedAt,
      }
      : undefined,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;

  return ret;
}
