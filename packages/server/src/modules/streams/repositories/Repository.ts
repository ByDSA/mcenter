import { Injectable } from "@nestjs/common";
import { LogElementResponse } from "$shared/utils/http";
import { showError } from "$shared/utils/errors/showError";
import { assertIsSerieEntity } from "$shared/models/series";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { logDomainEvent } from "#modules/log";
import { SerieId } from "#modules/series";
import { SERIES_QUEUE_NAME } from "#series/models";
import { EventType } from "#utils/event-sourcing";
import { CanCreateOne, CanGetAll, CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import { BrokerEvent } from "#utils/message-broker";
import { Stream, StreamId, StreamMode, StreamOriginType } from "../models";
import { DocOdm, ModelOdm } from "./odm";
import { streamDocOdmToModel, streamToDocOdm } from "./adapters";

@Injectable()
export class StreamsRepository
implements CanGetOneById<Stream, StreamId>,
CanUpdateOneById<Stream, StreamId>,
CanCreateOne<Stream>, CanGetAll<Stream> {
  constructor(private domainMessageBroker: DomainMessageBroker) {
    this.domainMessageBroker.subscribe(SERIES_QUEUE_NAME, async (event: BrokerEvent<any>) => {
      logDomainEvent(SERIES_QUEUE_NAME, event);

      if (event.type === EventType.CREATED) {
        const serie = event.payload.entity;

        assertIsSerieEntity(serie);
        await this.fixDefaultStreamForSerie(serie.id);
      }

      return Promise.resolve();
    } ).catch(showError);
  }

  static providers = Object.freeze([
    DomainMessageBroker,
  ]);

  async fixDefaultStreamForSerie(serieId: SerieId): Promise<LogElementResponse | null> {
    const hasDefault = await this.hasDefaultForSerie(serieId);

    if (!hasDefault) {
      await this.createDefaultFromSerie(serieId);

      return {
        message: `Created default stream for serie ${serieId}`,
        type: "StreamCreated",
      };
    }

    return null;
  }

  async getAll(): Promise<Stream[]> {
    const allStreamsDocOdm = await this.#getAllDocOdm();

    return allStreamsDocOdm.map(streamDocOdmToModel);
  }

  async #getAllDocOdm(): Promise<DocOdm[]> {
    const allStreamsDocOdm = await ModelOdm.find( {}, {
      _id: 0,
    } );

    return allStreamsDocOdm;
  }

  async getManyBySerieId(id: SerieId): Promise<Stream[]> {
    const allStreamsDocOdm = await this.#getAllDocOdm();
    const docsOdm = allStreamsDocOdm.filter(streamDocOdm => {
      const origins = streamDocOdm.group.origins.filter(o=>o.type === "serie" && o.id === id);

      return origins.length > 0;
    } );

    return docsOdm.map(streamDocOdmToModel);
  }

  async createDefaultFromSerie(serieId: SerieId): Promise<void> {
    const stream: Stream = {
      group: {
        origins: [
          {
            type: StreamOriginType.SERIE,
            id: serieId,
          },
        ],
      },
      mode: StreamMode.SEQUENTIAL,
      id: serieId,
    };

    await this.createOne(stream);
  }

  async hasDefaultForSerie(serieId: SerieId): Promise<boolean> {
    const streamDocOdm = await ModelOdm.findOne( {
      "group.origins": {
        $elemMatch: {
          type: StreamOriginType.SERIE,
          id: serieId,
        },
      },
    } );

    return !!streamDocOdm;
  }

  async createOne(stream: Stream): Promise<void> {
    const docOdm = streamToDocOdm(stream);

    await ModelOdm.create(docOdm);
  }

  async getOneById(id: StreamId): Promise<Stream | null> {
    const docOdm = await ModelOdm.findOne( {
      id,
    }, {
      _id: 0,
    } );

    if (!docOdm)
      return null;

    return streamDocOdmToModel(docOdm);
  }

  async updateOneById(id: StreamId, stream: Stream): Promise<void> {
    const docOdm = streamToDocOdm(stream);

    await ModelOdm.findOneAndUpdate( {
      id,
    }, docOdm);
  }
}
