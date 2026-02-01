import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicHistoryEntryCrudDtos } from "$shared/models/musics/history/dto/transport";
import { getDateNow } from "$shared/utils/time";
import { OnEvent } from "@nestjs/event-emitter";
import { assertFoundClient } from "#utils/validation/found";
import { CanCreateOne, CanCreateOneAndGet, CanDeleteOneByIdAndGet, CanGetAll, CanGetManyByCriteria, CanGetOneById } from "#utils/layers/repository";
import { MusicHistoryEntry, MusicHistoryEntryEntity } from "#musics/history/models";
import { showError } from "#core/logging/show-error";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEvent } from "#core/domain-event-emitter";
import { MusicsUsersRepository } from "#musics/crud/repositories/user-info/repository";
import { MusicHistoryEntryEvents } from "./events";
import { MusicHistoryEntryOdm } from "./odm";
import { getCriteriaPipeline } from "./odm/criteria-pipeline";
import { docOdmToEntity, docOdmToModel } from "./odm/adapters";

type Model = MusicHistoryEntry;
type Entity = MusicHistoryEntryEntity;

type DocOdm = MusicHistoryEntryOdm.Doc;
const ModelOdm = MusicHistoryEntryOdm.Model;

export type GetManyCriteria = MusicHistoryEntryCrudDtos.GetMany.Criteria;
type EntryId = Entity["id"];

type CreateNewEntryNowForProps = {
  musicId: string;
  userId: string;
};

@Injectable()
export class MusicHistoryRepository
implements
CanCreateOne<Model>,
CanCreateOneAndGet<Entity>,
CanGetManyByCriteria<Entity, GetManyCriteria>,
CanGetAll<Entity>,
CanGetOneById<Entity, EntryId>,
CanDeleteOneByIdAndGet<Entity, EntryId> {
  constructor(
    private readonly musicsUsersRepo: MusicsUsersRepository,
  ) { }

  @OnEvent(MusicHistoryEntryEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @OnEvent(MusicHistoryEntryEvents.Deleted.TYPE)
  async handleDeleteEvents(event: MusicHistoryEntryEvents.Deleted.Event) {
    const deletedId = event.payload.entity.resourceId;
    const deletedTimestamp = event.payload.entity.date.timestamp;
    const actualLastTimePlayed = await this.calcLastTimePlayedOf(deletedId) ?? 0;

    if (actualLastTimePlayed < deletedTimestamp) {
      await this.musicsUsersRepo.patchOneByIdAndGet( {
        musicId: deletedId,
        userId: event.payload.entity.userId,
      }, {
        entity: {
          lastTimePlayed: actualLastTimePlayed,
        },
      } ).catch(showError);
    }
  }

  async isLast( { musicId, userId }: CreateNewEntryNowForProps): Promise<boolean> {
    const lastOdm = await ModelOdm.findOne( {
      userId,
    } ).sort( {
      "date.timestamp": -1,
    } );

    return lastOdm?.musicId.toString() === musicId;
  }

  async createNewEntryNowFor( { musicId, userId }: CreateNewEntryNowForProps): Promise<Model> {
    const newEntry: Model = {
      date: getDateNow(),
      resourceId: musicId,
      userId,
    };

    return await this.createOneAndGet(newEntry);
  }

  async createNewEntryNowIfShouldFor(props: CreateNewEntryNowForProps) {
    const isLast = await this.isLast(props);

    // Si se llama en paralelo, esta condición podría no servir e igualmente añadirse al historial
    if (!isLast)
      await this.createNewEntryNowFor(props);
  }

  @EmitEntityEvent(MusicHistoryEntryEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: EntryId): Promise<Entity> {
    const deleted = await ModelOdm.findByIdAndDelete(id);

    assertFoundClient(deleted);

    const ret = MusicHistoryEntryOdm.toEntity(deleted);

    return ret;
  }

  async getOneById(id: EntryId): Promise<Entity | null> {
    const docOdm = await ModelOdm.findById(id);

    if (docOdm)
      return MusicHistoryEntryOdm.toEntity(docOdm);

    return null;
  }

  async calcLastTimePlayedOf(id: Entity["id"]): Promise<number | null> {
    const docOdm = await ModelOdm.findOne( {
      musicId: id,
    } )
      .sort( {
        "date.timestamp": -1,
      } );

    return docOdm?.date?.timestamp ?? null;
  }

  async getManyByCriteria(criteria: GetManyCriteria): Promise<Entity[]> {
    const pipeline = getCriteriaPipeline(criteria);
    const docsOdm: MusicHistoryEntryOdm.FullDoc[] = await ModelOdm.aggregate(pipeline);

    if (docsOdm.length === 0)
      return [];

    if (criteria.expand?.includes("musics")) {
      assertIsDefined(docsOdm[0].music, "Lookup music failed");
      assertIsDefined(docsOdm[0].music.userInfo, "Lookup music.userInfo failed");

      if (criteria.expand?.includes("musicsFileInfos"))
        assertIsDefined(docsOdm[0].music.fileInfos, "Lookup music file info failed");
    }

    return docsOdm.map(docOdmToEntity);
  }

  async getAll(): Promise<Entity[]> {
    const docsOdm = await ModelOdm.find();

    return docsOdm.map(MusicHistoryEntryOdm.toEntity);
  }

  async #getLastOdm(userId: string): Promise<DocOdm | null> {
    const docsOdm = await ModelOdm.find( {
      userId,
    }, {
      _id: 0,
    } ).sort( {
      "date.timestamp": -1,
    } )
      .limit(1);

    if (docsOdm.length === 0)
      return null;

    return docsOdm[0];
  }

  async getLast(userId: string): Promise<Model | null> {
    const docOdm = await this.#getLastOdm(userId);

    if (!docOdm)
      return null;

    return docOdmToModel(docOdm);
  }

  @EmitEntityEvent(MusicHistoryEntryEvents.Created.TYPE)
  async createOne(model: Model): Promise<void> {
    await this.#createOneAndGetOdm(model);
  }

  async #createOneAndGetOdm(model: Model): Promise<MusicHistoryEntryOdm.FullDoc> {
    const docOdm = MusicHistoryEntryOdm.toDoc(model);
    const ret = await ModelOdm.create(docOdm);

    return ret;
  }

  @EmitEntityEvent(MusicHistoryEntryEvents.Created.TYPE)
  async createOneAndGet(model: Model): Promise<Entity> {
    const docOdm = await this.#createOneAndGetOdm(model);

    return MusicHistoryEntryOdm.toEntity(docOdm);
  }
}
