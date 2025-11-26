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
import { AggregationResult } from "./odm/criteria-pipeline";
import { MusicPlaylistOdm } from "./odm";
import { MusicPlayListEvents } from "./events";

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

    return await this.patchOneByIdAndGet(id, {
      entity: {
        list: list.map(MusicPlaylistOdm.entryDocToModel),
      },
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

    return MusicPlaylistOdm.toEntity(updated);
  }

  async addManyTracks( { id, musics, unique }: AddManyTracksProps): Promise<MusicPlaylistEntity> {
    const musicPlaylistId = new Types.ObjectId(id);
    let tracksToPush: Array<{ musicId: Types.ObjectId;
addedAt: Date; }>;

    if (unique) {
      const existingPlaylist = await MusicPlaylistOdm.Model.findOne(
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

    return MusicPlaylistOdm.toEntity(updated);
  }

  async removeManyTracks(
    { id, tracks }: RemoveManyTracksProps,
  ): Promise<MusicPlaylistEntity> {
    const trackObjectIds = tracks.map(t=>new Types.ObjectId(t));
    const updated = await MusicPlaylistOdm.Model.findOneAndUpdate(
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
        new: true,
      },
    );

    assertFoundClient(updated);

    return MusicPlaylistOdm.toEntity(updated);
  }

  async removeManyMusics( { id, musicIds }: RemoveManyMusicsProps): Promise<MusicPlaylistEntity> {
    const musicsObjectIds = musicIds.map(t=>new Types.ObjectId(t));
    const updated = await MusicPlaylistOdm.Model.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $pull: {
          list: {
            musicId: {
              $in: musicsObjectIds,
            },
          },
        },
      },
      {
        new: true,
      },
    );

    assertFoundClient(updated);

    return MusicPlaylistOdm.toEntity(updated);
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

  async patchOneByIdAndGet(id: Id, params: PatchOneParams<Entity>): Promise<Entity> {
    let slug;

    if (params.entity.slug) {
      const baseSlug = fixSlug(params.entity.slug);
      const userId = params.entity.userId ?? await MusicPlaylistOdm.Model.findById(id).then(doc=>{
        assertIsDefined(doc, "Document not found for slug fix");

        return doc.userId.toString();
      } );

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
      entity: params.entity,
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
