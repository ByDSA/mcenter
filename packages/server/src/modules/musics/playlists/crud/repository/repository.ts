/* eslint-disable import/no-cycle */
import { Injectable, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { OnEvent } from "@nestjs/event-emitter";
import { MusicEntity } from "$shared/models/musics";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { assertIsDefined } from "$shared/utils/validation";
import { Types } from "mongoose";
import { UserPayload } from "$shared/models/auth";
import { assertFoundClient, assertFoundServer } from "#utils/validation/found";
import { CanDeleteOneByIdAndGet, CanGetOneByCriteria, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
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

type Model = MusicPlaylist;
type Entity = MusicPlaylistEntity;
type Id = Entity["id"];

type SlugProps = {
  slug: string;
  userId: string;
};

type CriteriaOne = MusicPlaylistCrudDtos.GetOne.Criteria;
type CriteriaMany = MusicPlaylistCrudDtos.GetMany.Criteria;

type AddOneTrackProps = {
  id: string;
  musicId: string;
  unique?: boolean;
};
type AddManyTracksProps = {
  id: string;
  musics: string[];
  unique?: boolean;
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
CanPatchOneByIdAndGet<Entity, Id, Model>,
CanGetOneById<Entity, Id>,
CanGetOneByCriteria<Entity, CriteriaOne>,
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

    if (playlist.userId !== userId)
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

    this.emitPatch(ret);

    return ret;
  }

  private emitPatch(playlist: MusicPlaylistEntity) {
    this.domainEventEmitter.emitPatch(MusicPlayListEvents.Patched.TYPE, {
      partialEntity: playlist,
      id: playlist.id,
    } );
  }

  async addOneTrack( { id, musicId, unique }: AddOneTrackProps): Promise<MusicPlaylistEntity> {
    const musicObjectId = new Types.ObjectId(musicId);
    const query: Record<string, any> = {
      _id: id,
    };

    if (unique) {
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

    this.emitPatch(ret);

    return ret;
  }

  async addManyTracks( { id, musics, unique }: AddManyTracksProps): Promise<MusicPlaylistEntity> {
    const musicPlaylistId = new Types.ObjectId(id);
    let existingPlaylist: MusicPlaylistOdm.FullDoc | null = null;
    let tracksToPush: Array<{ musicId: Types.ObjectId;
addedAt: Date; }>;

    if (unique) {
      existingPlaylist = await MusicPlaylistOdm.Model.findOne(
        {
          _id: musicPlaylistId,
        },
      ).lean();

      assertFoundClient(existingPlaylist);

      const existingMusicIds = new Set(existingPlaylist.list.map(item => item.musicId.toString()));

      tracksToPush = musics
        .filter(musicId => !existingMusicIds.has(musicId))
        .map(musicId => ( {
          musicId: new Types.ObjectId(musicId),
          addedAt: new Date(),
        } ));

      if (tracksToPush.length === 0)
        return MusicPlaylistOdm.toEntity(existingPlaylist);
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

    const ret = MusicPlaylistOdm.toEntity(updated);
    const startIndex = existingPlaylist?.list.length ?? 0;

    for (let i = startIndex; i < updated.list.length; i++) {
      this.domainEventEmitter.emit(MusicPlayListTrackEvents.Added.TYPE, {
        playlist: ret,
        trackListPosition: i,
      } as MusicPlayListTrackEvents.Added.Event);
    }

    this.emitPatch(ret);

    return ret;
  }

  async removeManyTracks(
    { id, tracks }: RemoveManyTracksProps,
  ): Promise<MusicPlaylistEntity> {
    const trackObjectIds = tracks.map(t => new Types.ObjectId(t));
    const tracksToRemoveSet = new Set(tracks.map(t => t.toString()));
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

    this.emitPatch(newEntity);

    return newEntity;
  }

  async removeManyMusics(
    { id, musicIds }: RemoveManyMusicsProps,
  ): Promise<MusicPlaylistEntity> {
    const musicObjectIds = musicIds.map(m => new Types.ObjectId(m));
    const musicIdsToRemoveSet = new Set(musicIds.map(m => m.toString()));
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

    this.emitPatch(newEntity);

    return newEntity;
  }

  async getOneById(id: string): Promise<Entity | null> {
    const doc = await MusicPlaylistOdm.Model.findById(id);

    assertFoundClient(doc);

    return MusicPlaylistOdm.toEntity(doc);
  }

  async getOneByCriteria(criteria: CriteriaOne): Promise<Entity | null> {
    const pipeline = MusicPlaylistOdm.getCriteriaPipeline(criteria);

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
    { slug, userId }: SlugProps,
    criteria?: CriteriaOne,
  ): Promise<Entity | null> {
    criteria = {
      ...criteria,
      filter: {
        ...criteria?.filter,
        slug: slug,
        userId,
      },
    };

    return await this.getOneByCriteria(criteria);
  }

  async findOneTrackByPosition(
    playlist: MusicPlaylist,
    positionOneBased: number,
    musicCriteria?: MusicCrudDtos.GetOne.Criteria,
  ): Promise<MusicEntity> {
    const track = playlist.list[positionOneBased - 1];

    assertFoundClient(track, "Track position invalid");

    const ret = await this.musicsRepo.getOne(null, {
      ...musicCriteria,
      filter: {
        ...musicCriteria?.filter,
        id: track.musicId,
      },
    } );

    assertFoundServer(ret);

    return ret;
  }

  async patchOneByIdAndGet(id: Id, params: PatchOneParams<Omit<Entity, "list">>): Promise<Entity> {
    let slug;
    const oldDoc = await MusicPlaylistOdm.Model.findById(id);

    assertFoundClient(oldDoc);

    if (params.entity.slug) {
      const baseSlug = fixSlug(params.entity.slug);
      const userId = params.entity.userId ?? oldDoc.userId.toString();

      assertIsDefined(baseSlug, "Invalid slug");
      assertIsDefined(userId, "User ID is required for slug fix");
      slug = await this.slugService.getAvailable( {
        slug: baseSlug,
        userId,
      } );
      params.entity.slug = slug;
    }

    const updateQuery = patchParamsToUpdateQuery( {
      ...params,
      entity: params.entity,
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
    const baseSlug = fixSlug(dto.slug);

    assertIsDefined(baseSlug, "Invalid slug");
    const slug = await this.slugService.getAvailable( {
      slug: baseSlug,
      userId,
    } );
    const gotDoc = await MusicPlaylistOdm.Model.create( {
      name: dto.name.trim(),
      slug,
      userId: new Types.ObjectId(userId),
    } );

    return MusicPlaylistOdm.toEntity(gotDoc);
  }

  async getManyByCriteria(criteria: CriteriaMany): Promise<Entity[]> {
    const actualCriteria: CriteriaMany = {
      ...criteria,
      limit: criteria.limit ?? 10,
    };
    const pipeline = MusicPlaylistOdm.getCriteriaPipeline(actualCriteria);

    if (pipeline.length === 0)
      throw new UnprocessableEntityException(actualCriteria);

    const aggregationResult = await MusicPlaylistOdm.Model.aggregate(pipeline) as AggregationResult;

    return aggregationResult[0].data.map(MusicPlaylistOdm.toEntity);
  }
}
