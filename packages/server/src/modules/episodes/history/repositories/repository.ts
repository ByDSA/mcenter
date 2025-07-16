import type { SerieId } from "#modules/series";
import type { EpisodeEntity, EpisodeId } from "#episodes/models";
import type { BrokerEvent } from "#utils/message-broker";
import type { CanCreateOne, CanDeleteOneByIdAndGet } from "#utils/layers/repository";
import type { EpisodeHistoryEntryId as Id, EpisodeHistoryEntry as Model, EpisodeHistoryEntryEntity as Entity, EpisodeHistoryEntryEntity } from "../models";
import type { EpisodeHistoryEntriesCriteria } from "$shared/models/episodes/history/dto/transport";
import type { FilterQuery, PipelineStage } from "mongoose";
import type { Criteria } from "$shared/models/episodes/history/dto/transport/rest/get-many-by-criteria";
import { showError } from "$shared/utils/errors/showError";
import { Injectable } from "@nestjs/common";
import { assertIsDefined } from "$shared/utils/validation";
import { EventType, ModelEvent, ModelMessage } from "#utils/event-sourcing";
import { logDomainEvent } from "#modules/log";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { assertFound } from "#utils/validation/found";
import { createEpisodeHistoryEntryByEpisodeFullId } from "../models";
import { EpisodeHistoryEntriesModelOdm as ModelOdm } from "./odm";
import { EPISODE_HISTORY_ENTRIES_QUEUE_NAME } from "./events";
import { entryToDocOdm } from "./odm";
import { docOdmToEntryEntity } from "./odm/adapters";
import { DocOdm } from "./odm/mongo";

export type EpisodeHistoryEntryEvent = BrokerEvent<ModelMessage<EpisodeHistoryEntryEntity>>;

@Injectable()
export class EpisodeHistoryEntriesRepository implements
CanCreateOne<Model>,
CanDeleteOneByIdAndGet<Model, Id> {
  constructor(
    private readonly domainMessageBroker: DomainMessageBroker,
  ) {
    this.domainMessageBroker.subscribe(
      EPISODE_HISTORY_ENTRIES_QUEUE_NAME,
      (event: EpisodeHistoryEntryEvent) => {
        logDomainEvent(EPISODE_HISTORY_ENTRIES_QUEUE_NAME, event);

        return Promise.resolve();
      },
    ).catch(showError);
  }

  async createOne(entry: Model): Promise<void> {
    const entryDocOdm = entryToDocOdm(entry);

    await ModelOdm.create(entryDocOdm);

    const event = new ModelEvent<Model>(EventType.CREATED, {
      entity: entry,
    } );

    await this.domainMessageBroker.publish(EPISODE_HISTORY_ENTRIES_QUEUE_NAME, event);
  }

  async getAll(): Promise<Entity[]> {
    const docsOdm = await ModelOdm.find( {}, {
      _id: 0,
    } );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(docOdmToEntryEntity);
  }

  async getManyBySerieId(serieId: SerieId): Promise<Entity[]> {
    return await this.getManyByCriteria( {
      filter: {
        serieId,
      },
    } );
  }

  async getManyByCriteria(criteria: EpisodeHistoryEntriesCriteria): Promise<Entity[]> {
    const pipeline = getCriteriaPipeline(criteria);
    const docsOdm = await ModelOdm.aggregate(pipeline);

    if (docsOdm.length === 0)
      return [];

    if (criteria.expand?.includes("series"))
      assertIsDefined(docsOdm[0].serie, "Lookup serie failed");

    if (criteria.expand?.includes("episodes"))
      assertIsDefined(docsOdm[0].episode, "Lookup episode failed");

    return docsOdm.map(docOdmToEntryEntity);
  }

  async deleteOneByIdAndGet(id: Id): Promise<Entity> {
    const docOdm = await ModelOdm.findByIdAndDelete(id);

    assertFound(docOdm);

    return docOdmToEntryEntity(docOdm);
  }

  async findLastForEpisodeId(episodeId: EpisodeId): Promise<Entity | null> {
    const last = await ModelOdm.findOne( {
      episodeId,
    }, {}, {
      sort: {
        "date.timestamp": -1,
      },
    } );

    if (!last)
      return null;

    return docOdmToEntryEntity(last);
  }

  async findLastForSerieId(serieId: SerieId): Promise<Entity | null> {
    const last = await ModelOdm.findOne( {
      "episodeId.serieId": serieId,
    }, {}, {
      sort: {
        "date.timestamp": -1,
      },
    } );

    if (!last)
      return null;

    return docOdmToEntryEntity(last);
  }

  async createNewEntryNowFor(episodeId: EpisodeId) {
    const newEntry: Model = createEpisodeHistoryEntryByEpisodeFullId(episodeId);

    await this.createOne(newEntry);
  }

  async addEpisodesToHistory(episodes: EpisodeEntity[]) {
    // TODO: usar bulk insert (quitar await en for)
    for (const episode of episodes)
      await this.createNewEntryNowFor(episode.id);
  }

  async calcEpisodeLastTimePlayed(episodeId: EpisodeId): Promise<number | null> {
    const last = await this.findLastForEpisodeId(episodeId);

    if (last === null)
      return null;

    let lastTimePlayed = last.date.timestamp;

    if (lastTimePlayed <= 0)
      return null;

    return lastTimePlayed;
  }
}

function buildMongooseSort(body: Criteria): Record<string, -1 | 1> | undefined {
  if (!body.sort?.timestamp)
    return undefined;

  return {
    "date.timestamp": body.sort.timestamp === "asc" ? 1 : -1,
  };
}

function buildMongooseFilter(criteria: Criteria): FilterQuery<DocOdm> {
  const filter: FilterQuery<DocOdm> = {};

  if (criteria.filter) {
    if (criteria.filter.serieId)
      filter["episodeId.serieId"] = criteria.filter.serieId;

    if (criteria.filter.episodeId)
      filter["episodeId.code"] = criteria.filter.episodeId;

    if (criteria.filter.timestampMax !== undefined) {
      filter["date.timestamp"] = {
        $lte: criteria.filter.timestampMax,
      };
    }
  }

  return filter;
}

function getCriteriaPipeline(criteria: Criteria) {
  const filter = buildMongooseFilter(criteria);
  const sort = buildMongooseSort(criteria);
  const pipeline: PipelineStage[] = [
    {
      $match: filter,
    },
  ];

  if (sort) {
    pipeline.push( {
      $sort: sort,
    } );
  }

  if (criteria.offset) {
    pipeline.push( {
      $skip: criteria.offset,
    } );
  }

  if (criteria.limit) {
    pipeline.push( {
      $limit: criteria.limit,
    } );
  }

  // Agregar lookups para expand
  if (criteria.expand) {
    if (criteria.expand.includes("series")) {
      pipeline.push( {
        $lookup: {
          from: "series", // nombre de la colección de series
          localField: "episodeId.serieId",
          foreignField: "id",
          as: "serie",
        },
      } );

      // Convertir el array a objeto único
      pipeline.push( {
        $addFields: {
          serie: {
            $arrayElemAt: ["$serie", 0],
          },
        },
      } );
    }

    if (criteria.expand.includes("episodes")) {
      pipeline.push( {
        $lookup: {
          from: "episodes", // nombre de la colección de episodios
          let: {
            serieId: "$episodeId.serieId",
            code: "$episodeId.code",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$serieId", "$$serieId"],
                    },
                    {
                      $eq: ["$episodeId", "$$code"],
                    },
                  ],
                },
              },
            },
          ],
          as: "episode",
        },
      } );

      // Convertir el array a objeto único
      pipeline.push( {
        $addFields: {
          episode: {
            $arrayElemAt: ["$episode", 0],
          },
        },
      } );
    }
  }

  return pipeline;
}
