import mongoose from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { PaginatedResult } from "$shared/utils/http/responses";
import { MusicFileInfoOdm } from "#musics/file-info/crud/repository/odm";
import { TimestampsOdm } from "#modules/resources/odm/timestamps";
import { Music, MusicEntity, MusicUserInfo } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";
import { AggregationResult } from "./criteria-pipeline";
import { FullDocOdm as MusicUserInfoFullDocOdm } from "./userInfo.odm";

type Model = Music;
type Entity = MusicEntity;

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const entity: Entity = {
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
    userInfo: docOdm.userInfo ? docOdmToModelUserInfo(docOdm.userInfo) : undefined,
  } satisfies AllKeysOf<Entity>;

  return removeUndefinedDeep(entity);
}

export function modelToDocOdm(model: Model): DocOdm {
  const docOdmTags = model.tags ? modelTagsToDocOdmTags(model.tags) : undefined;
  const docOdm: DocOdm = {
    title: model.title,
    url: model.slug,
    weight: model.weight,
    artist: model.artist,
    timestamps: TimestampsOdm.toDocOdm(model.timestamps),
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

export function musicEntityToDocOdm(entity: Entity): FullDocOdm {
  return {
    ...modelToDocOdm(entity),
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

export function partialToDocOdm(partial: Partial<Model>): Partial<DocOdm> {
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

export function aggregationResultToResponse(
  aggregationResult: AggregationResult,
): PaginatedResult<Entity> {
  const result = aggregationResult[0] ?? [];
  const data = result.data.map(docOdmToEntity);
  const metadata: PaginatedResult<Entity>["metadata"] = {};
  const totalCount = result.metadata[0]?.totalCount;

  if (totalCount !== undefined)
    metadata.totalCount = totalCount;

  return {
    data,
    metadata,
  };
}

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

function docOdmToModelUserInfo(docOdm: MusicUserInfoFullDocOdm): MusicUserInfo {
  return {
    lastTimePlayed: docOdm.lastTimePlayed,
    weight: docOdm.weight,
    tags: docOdm.tags,
  };
}
