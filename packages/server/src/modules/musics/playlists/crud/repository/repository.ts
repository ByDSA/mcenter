/* eslint-disable import/no-cycle */
import { Injectable, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { MusicEntity } from "$shared/models/musics";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { assertIsDefined } from "$shared/utils/validation";
import { Types } from "mongoose";
import { UserPayload } from "$shared/models/auth";
import { WithRequired } from "$shared/utils/objects";
import { assertFoundClient, assertFoundServer } from "#utils/validation/found";
import { CanDeleteOneByIdAndGet, CanGetOneById } from "#utils/layers/repository";
import { patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { MusicsRepository } from "#musics/crud/repositories/music";
import { fixSlug } from "#musics/crud/builder/fix-slug";
import { MusicPlaylistCrudDtos } from "../../models/dto";
import { MusicPlaylist, MusicPlaylistEntity } from "../../models";
import { MusicPlaylistAvailableSlugGeneratorService } from "./available-slug-generator.service";
import { MusicPlaylistOdm } from "./odm";
import { MusicPlayListEvents } from "./events/playlist";
import { AggregationResult } from "./odm/criteria-pipeline";
import { MusicPlayListTrackEvents } from "./events/track";

type Entity = MusicPlaylistEntity;
type Id = Entity["id"];

type SlugProps = {
  playlistSlug: string;
  requestUserId: string | null;
} & (
  {
  ownerUserId: string;
  ownerUserSlug?: never;
} |
  {
  ownerUserId?: never;
  ownerUserSlug: string;
}
);

type CriteriaOne = MusicPlaylistCrudDtos.GetOne.Criteria;
type CriteriaMany = MusicPlaylistCrudDtos.GetMany.Criteria;

type AddOneTrackProps = {
  id: string;
  musicId: string;
  allowDuplicates?: boolean;
};
type AddManyTracksProps = {
  id: string;
  musics: string[];
  allowDuplicates?: boolean;
};
type RemoveManyTracksProps = {
  id: string;
  tracks: string[];
};
type RemoveManyMusicsProps = {
  id: string;
  musicIds: string[];
};

@Injectable()
export class MusicPlaylistsRepository
implements
CanGetOneById<Entity, Id>,
CanDeleteOneByIdAndGet<Entity, Entity["id"]> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
    private readonly musicsRepo: MusicsRepository,
    private readonly slugService: MusicPlaylistAvailableSlugGeneratorService,
  ) { }

  @OnEvent(MusicPlayListEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @EmitEntityEvent(MusicPlayListEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: string): Promise<Entity> {
    const doc = await MusicPlaylistOdm.Model.findByIdAndDelete(id);

    assertFoundClient(doc);

    return MusicPlaylistOdm.toEntity(doc);
  }

  async guardOwnerPlaylist(
    { userId, playlistId }: {userId: UserPayload["id"];
playlistId: string;},
  ): Promise<MusicPlaylistEntity> {
    const playlist = await this.getOneById(playlistId);

    assertFoundClient(playlist);

    if (playlist.ownerUserId !== userId)
      throw new UnauthorizedException("User is not the owner of the playlist");

    return playlist;
  }

  async moveMusic(id: string, itemId: string, newIndex: number): Promise<Entity> {
    let fixedNewIndex = newIndex;

    if (fixedNewIndex < 0)
      fixedNewIndex = 0;

    const doc = await MusicPlaylistOdm.Model.findById(id);

    assertFoundClient(doc);

    const { list } = doc;

    if (newIndex >= list.length)
      fixedNewIndex = list.length - 1;

    const oldIndex = list.findIndex(e=>e._id.toString() === itemId);

    if (oldIndex === -1)
      throw new UnprocessableEntityException("Invalid item id: " + itemId);

    const [movedItem] = list.splice(oldIndex, 1);

    list.splice(newIndex, 0, movedItem);

    const patchedDoc = await MusicPlaylistOdm.Model.findByIdAndUpdate(id, {
      list,
    } );

    assertFoundClient(patchedDoc);
    const ret = MusicPlaylistOdm.toEntity(patchedDoc);

    this.domainEventEmitter.emit(MusicPlayListTrackEvents.Moved.TYPE, {
      playlist: ret,
      trackListOldPosition: oldIndex,
      trackListNewPosition: newIndex,
    } as MusicPlayListTrackEvents.Moved.Event);

    this.emitPatch( {
      id: ret.id,
      list: ret.list,
    } );

    return ret;
  }

  private emitPatch(playlist: WithRequired<Partial<MusicPlaylistEntity>, "id">) {
    this.domainEventEmitter.emitPatch(MusicPlayListEvents.Patched.TYPE, {
      partialEntity: playlist,
      id: playlist.id,
    } );
  }

  async addOneTrack(
    { id, musicId, allowDuplicates }: AddOneTrackProps,
  ): Promise<MusicPlaylistEntity> {
    const musicObjectId = new Types.ObjectId(musicId);
    const query: Record<string, any> = {
      _id: id,
    };

    if (!allowDuplicates) {
      query["list.musicId"] = {
        $ne: musicObjectId,
      };
    }

    const updated = await MusicPlaylistOdm.Model.findOneAndUpdate(
      query,
      {
        $push: {
          list: {
            musicId: musicObjectId,
            addedAt: new Date(),
          },
        },
      },
      {
        new: true,
      },
    );

    assertFoundClient(updated);

    const ret = MusicPlaylistOdm.toEntity(updated);

    this.domainEventEmitter.emit(MusicPlayListTrackEvents.Added.TYPE, {
      playlist: ret,
      trackListPosition: ret.list.length - 1,
    } as MusicPlayListTrackEvents.Added.Event);

    this.emitPatch( {
      id: ret.id,
      list: ret.list,
    } );

    return ret;
  }

  async addManyTracks( { id,
    musics,
    allowDuplicates }: AddManyTracksProps): Promise<MusicPlaylistCrudDtos.AddManyTracks.Return> {
    const musicPlaylistId = new Types.ObjectId(id);
    let existingPlaylist: MusicPlaylistOdm.FullDoc | null = null;
    let tracksToPush: Array<{ musicId: Types.ObjectId;
addedAt: Date; }>;
    const warnings: MusicPlaylistCrudDtos.AddManyTracks.Warning[] = [];

    if (!allowDuplicates) {
      existingPlaylist = await MusicPlaylistOdm.Model.findOne(
        {
          _id: musicPlaylistId,
        },
      ).lean();

      assertFoundClient(existingPlaylist);

      const existingMusicIds = new Set(existingPlaylist.list.map(item => item.musicId.toString()));
      const skippedMusicIds: string[] = [];

      tracksToPush = musics
        .filter(musicId => {
          if (existingMusicIds.has(musicId)) {
            skippedMusicIds.push(musicId);

            return false;
          }

          return true;
        } )
        .map(musicId => ( {
          musicId: new Types.ObjectId(musicId),
          addedAt: new Date(),
        } ));

      if (skippedMusicIds.length > 0) {
        warnings.push( {
          code: "DUPLICATES_SKIPPED",
          skippedMusicIds,
        } );
      }

      if (tracksToPush.length === 0) {
        return {
          data: MusicPlaylistOdm.toEntity(existingPlaylist),
          warnings,
        };
      }
    } else {
      // Se añaden todas las canciones de entrada, permitiendo duplicados
      tracksToPush = musics.map(musicId => ( {
        musicId: new Types.ObjectId(musicId),
        addedAt: new Date(),
      } ));
    }

    const updated = await MusicPlaylistOdm.Model.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $push: {
          list: {
            $each: tracksToPush,
          },
        },
      },
      {
        new: true,
      },
    );

    assertFoundClient(updated);

    const data = MusicPlaylistOdm.toEntity(updated);
    const startIndex = existingPlaylist?.list.length ?? 0;

    for (let i = startIndex; i < updated.list.length; i++) {
      this.domainEventEmitter.emit(MusicPlayListTrackEvents.Added.TYPE, {
        playlist: data,
        trackListPosition: i,
      } as MusicPlayListTrackEvents.Added.Event);
    }

    this.emitPatch( {
      id: data.id,
      list: data.list,
    } );

    return {
      data,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  async removeManyTracks(
    { id, tracks }: RemoveManyTracksProps,
  ): Promise<MusicPlaylistCrudDtos.RemoveManyTracks.Return> {
    const trackObjectIds = tracks.map(t => new Types.ObjectId(t));
    const tracksToRemoveSet = new Set(tracks.map(t => t.toString()));
    const warnings: MusicPlaylistCrudDtos.RemoveManyTracks.Warning[] = [];
    const originalDoc = await MusicPlaylistOdm.Model.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $pull: {
          list: {
            _id: {
              $in: trackObjectIds,
            },
          },
        },
      },
      {
        new: false,
      },
    );

    assertFoundClient(originalDoc);

    const foundTrackIds = new Set(
      originalDoc.list.map(t => t._id.toString()),
    );
    const notFoundTrackIds = tracks.filter(t => !foundTrackIds.has(t));

    if (notFoundTrackIds.length > 0) {
      warnings.push( {
        code: "TRACKS_NOT_FOUND",
        notFoundTrackIds,
      } );
    }

    // Procesamiento en Memoria
    // (Mucho más rápido que una segunda query, porque podría ser una lista de >1000 canciones)
    const oldEntity = MusicPlaylistOdm.toEntity(originalDoc);
    const keptTracks: MusicPlaylistOdm.FullDoc["list"] = [];
    const eventsToEmit: Array<{ trackListPosition: number }> = [];

    if (originalDoc.list && originalDoc.list.length > 0) {
      originalDoc.list.forEach((track, index) => {
        if (tracksToRemoveSet.has(track._id.toString())) {
          eventsToEmit.push( {
            trackListPosition: index,
          } );
        } else
          keptTracks.push(track);
      } );
    }

    originalDoc.list = keptTracks;
    const newEntity = MusicPlaylistOdm.toEntity(originalDoc);

    for (const eventData of eventsToEmit) {
      this.domainEventEmitter.emit(MusicPlayListTrackEvents.Deleted.TYPE, {
        newPlaylist: newEntity,
        oldPlaylist: oldEntity,
        trackListPosition: eventData.trackListPosition,
      } as MusicPlayListTrackEvents.Deleted.Event);
    }

    this.emitPatch( {
      id: newEntity.id,
      list: newEntity.list,
    } );

    return {
      data: newEntity,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  async removeManyMusics(
    { id, musicIds }: RemoveManyMusicsProps,
  ): Promise<MusicPlaylistCrudDtos.RemoveManyTracks.Return> {
    const musicObjectIds = musicIds.map(m => new Types.ObjectId(m));
    const musicIdsToRemoveSet = new Set(musicIds.map(m => m.toString()));
    const warnings: MusicPlaylistCrudDtos.RemoveManyTracks.Warning[] = [];
    const originalDoc = await MusicPlaylistOdm.Model.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $pull: {
          list: {
            musicId: {
              $in: musicObjectIds,
            },
          },
        },
      },
      {
        new: false,
      },
    );

    assertFoundClient(originalDoc);

    const foundMusicIds = new Set(
      originalDoc.list
        .filter(t => t.musicId)
        .map(t => t.musicId.toString()),
    );
    const notFoundMusicIds = musicIds.filter(m => !foundMusicIds.has(m));

    if (notFoundMusicIds.length > 0) {
      warnings.push( {
        code: "MUSIC_IDS_NOT_FOUND",
        notFoundMusicIds,
      } );
    }

    const oldEntity = MusicPlaylistOdm.toEntity(originalDoc);
    const keptTracks: any[] = [];
    const eventsToEmit: Array<{ trackListPosition: number }> = [];

    if (originalDoc.list && originalDoc.list.length > 0) {
      originalDoc.list.forEach((track, index) => {
      // Comparamos por musicId.
        if (track.musicId && musicIdsToRemoveSet.has(track.musicId.toString())) {
          eventsToEmit.push( {
            trackListPosition: index,
          } );
        } else
          keptTracks.push(track);
      } );
    }

    originalDoc.list = keptTracks;
    const newEntity = MusicPlaylistOdm.toEntity(originalDoc);

    for (const eventData of eventsToEmit) {
      this.domainEventEmitter.emit(MusicPlayListTrackEvents.Deleted.TYPE, {
        newPlaylist: newEntity,
        oldPlaylist: oldEntity,
        trackListPosition: eventData.trackListPosition,
      } as MusicPlayListTrackEvents.Deleted.Event);
    }

    this.emitPatch( {
      id: newEntity.id,
      list: newEntity.list,
    } );

    return {
      data: newEntity,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  async getOneById(id: string): Promise<Entity | null> {
    const doc = await MusicPlaylistOdm.Model.findById(id);

    if (!doc)
      return null;

    return MusicPlaylistOdm.toEntity(doc);
  }

  async getOneByCriteria(
    criteria: CriteriaOne,
    requestUserId: string | null,
  ): Promise<Entity | null> {
    const pipeline = MusicPlaylistOdm.getCriteriaPipeline(criteria, requestUserId);

    if (pipeline.length === 0)
      throw new UnprocessableEntityException(criteria);

    const aggreationResult = await MusicPlaylistOdm.Model.aggregate(pipeline) as AggregationResult;
    const docs = aggreationResult[0].data;

    if (docs.length === 0)
      return null;

    const doc = docs[0];

    if (doc.list.length > 0 && criteria?.expand?.includes("musics"))
      assertIsDefined(doc.list[0].music, "Lookup musics failed");

    return MusicPlaylistOdm.toEntity(doc);
  }

  async getOneBySlug(
    { playlistSlug: slug, ownerUserId, ownerUserSlug, requestUserId }: SlugProps,
    criteria?: CriteriaOne,
  ): Promise<Entity | null> {
    criteria = {
      ...criteria,
      filter: {
        ...criteria?.filter,
        slug,
        ownerUserId,
        ownerUserSlug,
      },
    };

    return await this.getOneByCriteria(criteria, requestUserId);
  }

  async findOneTrackByPosition(
    playlist: MusicPlaylist,
    positionOneBased: number,
    musicCriteria?: MusicCrudDtos.GetOne.Criteria,
  ): Promise<MusicEntity> {
    const track = playlist.list[positionOneBased - 1];

    assertFoundClient(track, "Track position invalid");

    const ret = await this.musicsRepo.getOne( {
      criteria: {
        ...musicCriteria,
        filter: {
          ...musicCriteria?.filter,
          id: track.musicId,
        },
      },
    } );

    assertFoundServer(ret);

    return ret;
  }

  async patchOneByIdAndGet(id: Id, params: MusicPlaylistCrudDtos.Patch.Body): Promise<Entity> {
    let slug;
    const oldDoc = await MusicPlaylistOdm.Model.findById(id);

    assertFoundClient(oldDoc);

    if (params.entity.slug) {
      const baseSlug = fixSlug(params.entity.slug);
      const userId = params.entity.ownerUserId ?? oldDoc.userId.toString();

      assertIsDefined(baseSlug, "Invalid slug");

      if (oldDoc.slug === baseSlug)
        return MusicPlaylistOdm.toEntity(oldDoc);

      assertIsDefined(userId, "User ID is required for slug fix");
      slug = await this.slugService.getAvailable( {
        slug: baseSlug,
        userId,
      } );
      params.entity.slug = slug;
    }

    const updateQuery = patchParamsToUpdateQuery( {
      ...params,
      entity: {
        ...params.entity,
        list: params.entity.list?.replace,
      },
    }, MusicPlaylistOdm.partialToUpdateQuery);

    updateQuery.$set = {
      ...updateQuery.$set,
    };

    const doc = await MusicPlaylistOdm.Model.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    );

    assertFoundClient(doc);

    const ret = MusicPlaylistOdm.toEntity(doc);

    this.domainEventEmitter.emitPatch(MusicPlayListEvents.Patched.TYPE, {
      partialEntity: params.entity,
      newEntity: ret,
      oldEntity: MusicPlaylistOdm.toEntity(oldDoc),
      id,
      unset: params.unset,
    } );

    return ret;
  }

  async getAll(): Promise<Entity[]> {
    const docs = await MusicPlaylistOdm.Model.find( {} );
    const ret = docs.map(MusicPlaylistOdm.toEntity);

    return ret;
  }

  @EmitEntityEvent(MusicPlayListEvents.Created.TYPE)
  async createOneAndGet(
    dto: MusicPlaylistCrudDtos.CreateOne.Body,
    userId: string,
  ): Promise<Entity> {
    const baseSlug = fixSlug(dto.name);

    assertIsDefined(baseSlug, "Invalid slug");
    const slug = await this.slugService.getAvailable( {
      slug: baseSlug,
      userId,
    } );
    const gotDoc = await MusicPlaylistOdm.Model.create( {
      name: dto.name.trim(),
      slug,
      visibility: dto.visibility,
      userId: new Types.ObjectId(userId),
    } );

    return MusicPlaylistOdm.toEntity(gotDoc);
  }

  async getManyByCriteria(criteria: CriteriaMany, requestUserId: string | null): Promise<Entity[]> {
    const pipeline = MusicPlaylistOdm.getCriteriaPipeline(criteria, requestUserId);

    if (pipeline.length === 0)
      throw new UnprocessableEntityException(criteria);

    const aggregationResult = await MusicPlaylistOdm.Model.aggregate(pipeline) as AggregationResult;

    return aggregationResult[0].data.map(MusicPlaylistOdm.toEntity);
  }
}
