import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { OnEvent } from "@nestjs/event-emitter";
import { MusicEntity } from "$shared/models/musics";
import { MusicCrudDtos } from "$shared/models/musics/dto/transport";
import { assertIsDefined } from "$shared/utils/validation";
import { assertFoundClient, assertFoundServer } from "#utils/validation/found";
import { CanDeleteOneByIdAndGet, CanGetOneByCriteria, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { MusicsRepository } from "#musics/crud/repository";
import { MusicPlaylistCrudDtos } from "../../models/dto";
import { MusicPlaylist, MusicPlaylistEntity } from "../../models";
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

    if (criteria?.expand?.includes("musics"))
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

    const ret = await this.musicsRepo.getOne( {
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
    const updateQuery = patchParamsToUpdateQuery( {
      ...params,
      entity: params.entity,
    }, MusicPlaylistOdm.partialToUpdateQuery);

    updateQuery.$set = {
      ...updateQuery.$set,
      "timestamps.updatedAt": new Date(),
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
  async createOneAndGet(model: Model): Promise<Entity> {
    const docOdm = MusicPlaylistOdm.toDoc(model);
    const gotDoc = await MusicPlaylistOdm.Model.create(docOdm);

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
