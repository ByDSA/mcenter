import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { showError } from "$shared/utils/errors/showError";
import { MusicHistoryEntryRestDtos } from "$shared/models/musics/history/dto/transport";
import { assertFound } from "#utils/validation/found";
import { CanCreateOne, CanDeleteOneByIdAndGet, CanGetAll, CanGetManyCriteria, CanGetOneById } from "#utils/layers/repository";
import { EventType, ModelEvent } from "#utils/event-sourcing";
import { MusicHistoryEntry, MusicHistoryEntryEntity } from "#musics/history/models";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { BrokerEvent } from "#utils/message-broker";
import { QUEUE_NAME } from "../events";
import { MusicRepository } from "../../repositories/repository";
import { docOdmToEntity, docOdmToModel, modelToDocOdm } from "./odm/adapters";
import { getCriteriaPipeline } from "./criteria-pipeline";
import { MusicHistoryEntryOdm } from "./odm";

type DocOdm = MusicHistoryEntryOdm.Doc;
const ModelOdm = MusicHistoryEntryOdm.Model;

export type GetManyCriteria = MusicHistoryEntryRestDtos.GetManyByCriteria.Criteria;
type EntryId = Required<MusicHistoryEntry["id"]>;

@Injectable()
export class MusicHistoryRepository
implements
CanCreateOne<MusicHistoryEntry>,
CanGetManyCriteria<MusicHistoryEntry, GetManyCriteria>,
CanGetAll<MusicHistoryEntry>,
CanGetOneById<MusicHistoryEntry, EntryId>,
CanDeleteOneByIdAndGet<MusicHistoryEntry, EntryId> {
  constructor(
    private readonly domainMessageBroker: DomainMessageBroker,
    private readonly musicRepository: MusicRepository,
  ) {
    this.domainMessageBroker.subscribe(QUEUE_NAME, (event: any) => {
      logDomainEvent(QUEUE_NAME, event);

      return Promise.resolve();
    } ).catch(showError);

    this.domainMessageBroker.subscribe(QUEUE_NAME, async (_ev: BrokerEvent<unknown>) => {
      const event = _ev as ModelEvent<MusicHistoryEntry>;

      if (event.type !== EventType.DELETED)
        return;

      const deletedId = event.payload.entity.resourceId;
      const deletedTimestamp = event.payload.entity.date.timestamp;
      const actualLastTimePlayed = await this.calcLastTimePlayedOf(deletedId) ?? 0;

      if (actualLastTimePlayed < deletedTimestamp) {
        await this.musicRepository.patchOneById(deletedId, {
          entity: {
            lastTimePlayed: actualLastTimePlayed,
          },
        } ).catch(showError);
      }
    } ).catch(showError);
  }

  async deleteOneByIdAndGet(id: EntryId): Promise<MusicHistoryEntry> {
    const deleted = await ModelOdm.findByIdAndDelete(id);

    assertFound(deleted);

    const ret = docOdmToModel(deleted);
    const event = new ModelEvent<MusicHistoryEntry>(EventType.DELETED, {
      entity: ret,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);

    return ret;
  }

  async getOneById(id: EntryId): Promise<MusicHistoryEntry | null> {
    const docOdm = await ModelOdm.findById(id);

    if (docOdm)
      return docOdmToModel(docOdm);

    return null;
  }

  async calcLastTimePlayedOf(id: Required<MusicHistoryEntry["id"]>): Promise<number | null> {
    const docOdm = await ModelOdm.findOne( {
      musicId: id,
    } )
      .sort( {
        "date.timestamp": -1,
      } );

    return docOdm?.date?.timestamp ?? null;
  }

  async getManyCriteria(criteria: GetManyCriteria): Promise<MusicHistoryEntryEntity[]> {
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

  async getAll(): Promise<MusicHistoryEntry[]> {
    const docsOdm = await ModelOdm.find( {}, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(docOdmToModel);
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

  async getLast(): Promise<MusicHistoryEntry | null> {
    const docOdm = await this.#getLastOdm();

    if (!docOdm)
      return null;

    return docOdmToModel(docOdm);
  }

  async createOne(model: MusicHistoryEntry): Promise<void> {
    const lastOdm = await this.#getLastOdm();

    if (lastOdm?.musicId === model.resourceId)
      return;

    const docOdm = modelToDocOdm(model);

    await ModelOdm.create(docOdm);

    const event = new ModelEvent<MusicHistoryEntry>(EventType.CREATED, {
      entity: model,
    } );

    await this.domainMessageBroker.publish(QUEUE_NAME, event);
  }
}
