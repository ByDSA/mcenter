import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicHistoryEntryCrudDtos } from "$shared/models/musics/history/dto/transport";
import { MusicId } from "$shared/models/musics";
import { getDateNow } from "$shared/utils/time";
import { OnEvent } from "@nestjs/event-emitter";
import { assertFoundClient } from "#utils/validation/found";
import { CanCreateOne, CanCreateOneAndGet, CanDeleteOneByIdAndGet, CanGetAll, CanGetManyByCriteria, CanGetOneById } from "#utils/layers/repository";
import { MusicHistoryEntry, MusicHistoryEntryEntity } from "#musics/history/models";
import { showError } from "#core/logging/show-error";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEvent } from "#core/domain-event-emitter";
import { MusicsRepository } from "../../../crud/repository";
import { docOdmToEntity, docOdmToModel } from "./odm/adapters";
import { getCriteriaPipeline } from "./criteria-pipeline";
import { MusicHistoryEntryOdm } from "./odm";
import { MusicHistoryEntryEvents } from "./events";

type Model = MusicHistoryEntry;
type Entity = MusicHistoryEntryEntity;

type DocOdm = MusicHistoryEntryOdm.Doc;
const ModelOdm = MusicHistoryEntryOdm.Model;

export type GetManyCriteria = MusicHistoryEntryCrudDtos.GetManyByCriteria.Criteria;
type EntryId = Entity["id"];

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
    private readonly musicRepo: MusicsRepository,
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
      await this.musicRepo.patchOneByIdAndGet(deletedId, {
        entity: {
          lastTimePlayed: actualLastTimePlayed,
        },
      } ).catch(showError);
    }
  }

  async isLast(id: MusicId): Promise<boolean> {
    const lastOdm = await ModelOdm.findOne( {} ).sort( {
      "date.timestamp": -1,
    } );

    return lastOdm?.musicId === id;
  }

  async createNewEntryNowFor(musicId: MusicId): Promise<Model> {
    const newEntry: Model = {
      date: getDateNow(),
      resourceId: musicId,
    };

    return await this.createOneAndGet(newEntry);
  }

  async createNewEntryNowIfShouldFor(musicId: string) {
    const isLast = await this.isLast(musicId);

    // Si se llama en paralelo, esta condición podría no servir e igualmente añadirse al historial
    if (!isLast)
      await this.createNewEntryNowFor(musicId);
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

       if (criteria.expand?.includes("music-file-infos"))
         assertIsDefined(docsOdm[0].music.fileInfos, "Lookup music file info failed");
     }

     return docsOdm.map(docOdmToEntity);
   }

   async getAll(): Promise<Entity[]> {
     const docsOdm = await ModelOdm.find();

     return docsOdm.map(MusicHistoryEntryOdm.toEntity);
   }

   async #getLastOdm(): Promise<DocOdm | null> {
     const docsOdm = await ModelOdm.find( {}, {
       _id: 0,
     } ).sort( {
       "date.timestamp": -1,
     } )
       .limit(1);

     if (docsOdm.length === 0)
       return null;

     return docsOdm[0];
   }

   async getLast(): Promise<Model | null> {
     const docOdm = await this.#getLastOdm();

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
