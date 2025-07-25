import { Injectable } from "@nestjs/common";
import { LogElementResponse } from "$shared/utils/http";
import { showError } from "$shared/utils/errors/showError";
import { assertIsSerieEntity, Serie, SeriesKey } from "$shared/models/series";
import { StreamRestDtos } from "$shared/models/streams/dto/transport";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { SERIES_QUEUE_NAME } from "#series/models";
import { EventType } from "#utils/event-sourcing";
import { CanCreateOneAndGet, CanGetAll, CanGetManyByCriteria } from "#utils/layers/repository";
import { BrokerEvent } from "#utils/message-broker";
import { EpisodeHistoryEntriesRepository } from "#episodes/history";
import { SerieRepository } from "#modules/series/repositories";
import { Stream, StreamEntity, StreamMode, StreamOriginType } from "../models";
import { StreamOdm } from "./odm";
import { buildCriteriaPipeline } from "./odm/criteria-pipeline";

type CriteriaMany = StreamRestDtos.GetManyByCriteria.Criteria;
@Injectable()
export class StreamsRepository
implements
CanGetManyByCriteria<StreamEntity, CriteriaMany>,
CanCreateOneAndGet<StreamEntity>,
CanGetAll<StreamEntity> {
  constructor(
private readonly domainMessageBroker: DomainMessageBroker,
    private readonly serieRepository: SerieRepository,
    private readonly episodeHistoryEntriesRepository: EpisodeHistoryEntriesRepository,
  ) {
    this.domainMessageBroker.subscribe(SERIES_QUEUE_NAME, async (event: BrokerEvent<any>) => {
      logDomainEvent(SERIES_QUEUE_NAME, event);

      if (event.type === EventType.CREATED) {
        const serie = event.payload.entity;

        assertIsSerieEntity(serie);
        await this.fixDefaultStreamForSerie(serie.key);
      }

      return Promise.resolve();
    } ).catch(showError);
  }

  async getManyByCriteria(criteria: CriteriaMany) {
    const pipeline = buildCriteriaPipeline(criteria);
    let got = await StreamOdm.Model.aggregate(pipeline);

    return got.map(StreamOdm.toEntity);
  }

  async fixDefaultStreamForSerie(seriesKey: SeriesKey): Promise<LogElementResponse | null> {
    const hasDefault = await this.hasDefaultForSerie(seriesKey);

    if (!hasDefault) {
      await this.createDefaultFromSerie(seriesKey);

      return {
        message: `Created default stream for serie ${seriesKey}`,
        type: "StreamCreated",
      };
    }

    return null;
  }

  async getAll(): Promise<StreamEntity[]> {
    const docs = await StreamOdm.Model.find();

    return docs.map(StreamOdm.toEntity);
  }

  private async createDefaultFromSerie(seriesKey: SeriesKey): Promise<StreamEntity> {
    const stream: Stream = {
      group: {
        origins: [
          {
            type: StreamOriginType.SERIE,
            id: seriesKey,
          },
        ],
      },
      mode: StreamMode.SEQUENTIAL,
      key: seriesKey,
    };

    return await this.createOneAndGet(stream);
  }

  async hasDefaultForSerie(seriesKey: SeriesKey): Promise<boolean> {
    const streamDocOdm = await StreamOdm.Model.findOne( {
      "group.origins": {
        $elemMatch: {
          type: StreamOriginType.SERIE,
          id: seriesKey,
        },
      },
    } );

    return !!streamDocOdm;
  }

  async createOneAndGet(stream: Stream): Promise<StreamEntity> {
    const docOdm = StreamOdm.toDoc(stream);
    const [got]: StreamOdm.FullDoc[] = await StreamOdm.Model.create([docOdm], {
      new: true,
    } );

    return StreamOdm.toEntity(got);
  }

  async getOneByKey(key: StreamEntity["key"]): Promise<StreamEntity | null> {
    const docOdm = await StreamOdm.Model.findOne( {
      key,
    } );

    if (!docOdm)
      return null;

    return StreamOdm.toEntity(docOdm);
  }

  async getOneOrCreateBySeriesKey(seriesKey: Serie["key"]): Promise<StreamEntity> {
    const docOdm = await StreamOdm.Model.findOne( {
      key: seriesKey,
    } );

    if (!docOdm)
      return this.createDefaultFromSerie(seriesKey);

    return StreamOdm.toEntity(docOdm);
  }
}
