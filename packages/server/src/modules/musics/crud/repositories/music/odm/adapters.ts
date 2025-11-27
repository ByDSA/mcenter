import mongoose, { Types } from "mongoose";
import { AllKeysOf } from "$shared/utils/types";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { PaginatedResult } from "$shared/utils/http/responses";
import { MusicFileInfoOdm } from "#musics/file-info/crud/repository/odm";
import { MusicsUsersOdm } from "#musics/crud/repositories/user-info/odm";
import { Music, MusicEntity } from "../../../../models";
import { DocOdm, FullDocOdm } from "./odm";

export type AggregationResult = {
  data: FullDocOdm[];
  metadata: {
    totalCount?: number;
  }[];
}[];

type Model = Music;
type Entity = MusicEntity;

export function docOdmToEntity(docOdm: FullDocOdm): Entity {
  const entity: Entity = {
    id: docOdm._id.toString(),
    title: docOdm.title,
    slug: docOdm.url,
    artist: docOdm.artist,
    tags: docOdmToModelTags(docOdm),
    disabled: docOdm.disabled,
    uploaderUserId: docOdm.uploaderUserId.toString(),
    album: docOdm.album,
    country: docOdm.country,
    game: docOdm.game,
    year: docOdm.year,
    spotifyId: docOdm.spotifyId,
    createdAt: docOdm.createdAt,
    updatedAt: docOdm.updatedAt,
    addedAt: docOdm.addedAt,
    releasedOn: docOdm.releasedOn,
    fileInfos: docOdm.fileInfos?.map(MusicFileInfoOdm.toEntity),
    userInfo: docOdm.userInfo ? MusicsUsersOdm.toModel(docOdm.userInfo) : undefined,
    isFav: docOdm.isFav,
  } satisfies AllKeysOf<Entity>;

  return removeUndefinedDeep(entity);
}

export function modelToDocOdm(model: Model): DocOdm {
  const docOdmTags = model.tags ? modelTagsToDocOdmTags(model.tags) : undefined;
  const docOdm: DocOdm = {
    title: model.title,
    url: model.slug,
    artist: model.artist,
    uploaderUserId: new Types.ObjectId(model.uploaderUserId),
    disabled: model.disabled,
    album: model.album,
    country: model.country,
    game: model.game,
    year: model.year,
    spotifyId: model.spotifyId,
    tags: docOdmTags?.tags,
    onlyTags: docOdmTags?.onlyTags,
    addedAt: model.addedAt,
    createdAt: model.createdAt,
    releasedOn: model.releasedOn,
    updatedAt: model.updatedAt,
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
    artist: partial.artist,
    tags: docOdmTags.tags,
    onlyTags: docOdmTags.onlyTags,
    disabled: partial.disabled,
    album: partial.album,
    country: partial.country,
    game: partial.game,
    year: partial.year,
    spotifyId: partial.spotifyId,
    uploaderUserId: partial.uploaderUserId ? new Types.ObjectId(partial.uploaderUserId) : undefined,
    createdAt: partial.createdAt,
    updatedAt: partial.updatedAt,
    addedAt: partial.addedAt,
    releasedOn: partial.releasedOn,
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
