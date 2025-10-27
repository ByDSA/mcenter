import { Injectable } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { OnEvent } from "@nestjs/event-emitter";
import { Types, UpdateQuery } from "mongoose";
import { assertIsDefined } from "$shared/utils/validation";
import { WithRequired } from "$shared/utils/objects";
import { assertFoundClient } from "#utils/validation/found";
import { CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { EpisodeEntity, EpisodeEntityWithUserInfo } from "#episodes/models";
import { showError } from "#core/logging/show-error";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { EpisodeUserInfoEntity } from "#episodes/models";
import { EpisodeHistoryEntryEvents } from "../../../history/crud/repository/events";
import { EpisodeOdm } from "../episodes/odm";
import { EpisodesRepository } from "../episodes";
import { EpisodesUsersEvents } from "./events";
import { EpisodesUsersOdm } from "./odm";

type Entity = EpisodeUserInfoEntity;

type UserInfoKey = {
  episodeId: EpisodeEntity["id"];
  userId: string;
};

type GetFullSerieForUserProps = {
  userId: string;
  seriesKey: string;
};

@Injectable()
export class EpisodesUsersRepository
implements
CanPatchOneByIdAndGet<Entity, UserInfoKey>,
CanGetOneById<Entity, UserInfoKey> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) { }

  @OnEvent(EpisodesUsersEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  @OnEvent(EpisodeHistoryEntryEvents.Created.TYPE)
  async handleCreateHistoryEntryEvents(event: EpisodeHistoryEntryEvents.Created.Event) {
    const { entity } = event.payload;

    await this.patchOneByIdAndGet( {
      episodeId: entity.resourceId,
      userId: event.payload.entity.userId,
    }, {
      entity: {
        lastTimePlayed: entity.date.timestamp,
      },
    } ).catch(showError);
  }

  async getFullSerieForUser(
    { seriesKey: serieKey,
      userId }: GetFullSerieForUserProps,
    criteria?: Parameters<EpisodesRepository["getManyBySerieKey"]>[1],
  ): Promise<EpisodeEntityWithUserInfo[]> {
    const docs: WithRequired<EpisodeOdm.FullDoc, "userInfo">[] = await EpisodeOdm.Model.aggregate([
      {
        $match: {
          seriesKey: serieKey,
        },
      },
      {
        $lookup: {
          from: EpisodesUsersOdm.Model.collection.name,
          let: {
            episodeId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$episodeId", "$$episodeId"],
                    },
                    {
                      $eq: ["$userId", new Types.ObjectId(userId)],
                    },
                  ],
                },
              },
            },
          ],
          as: "userInfoArray",
        },
      },
      {
        $addFields: {
          userInfo: {
            $ifNull: [
              {
                $arrayElemAt: ["$userInfoArray", 0],
              },
              {
                _id: new Types.ObjectId(),
                createdAt: new Date(),
                updatedAt: new Date(),
                episodeId: "$_id" as any,
                lastTimePlayed: 0,
                userId: new Types.ObjectId(userId),
                weight: 0,
              } satisfies EpisodesUsersOdm.FullDoc,
            ],
          },
        },
      },
      {
        $project: {
          userInfoArray: 0,
        },
      },
    ]);

    // TODO: hacer sort en aggregate
    if (criteria?.sort) {
      if (criteria.sort.episodeCompKey)
        docs.sort((a, b)=>a.episodeKey.localeCompare(b.episodeKey));
    }

    const ret = docs.map(EpisodeOdm.toEntity) as EpisodeEntityWithUserInfo[];

    if (ret.length > 0)
      assertIsDefined(ret[0].userInfo, "Lookup userInfo failed");

    return ret;
  }

  async getOneById( { episodeId, userId }: UserInfoKey): Promise<Entity | null> {
    const doc = await EpisodesUsersOdm.Model.findOne( {
      episodeId,
      userId,
    } );

    assertFoundClient(doc);

    return EpisodesUsersOdm.toEntity(doc);
  }

  async getAll(): Promise<Entity[]> {
    const docs = await EpisodesUsersOdm.Model.find();

    return docs.map(EpisodesUsersOdm.toEntity);
  }

  async patchOneByIdAndGet(
    key: UserInfoKey,
    params: PatchOneParams<Entity>,
  ): Promise<Entity> {
    const { entity } = params;
    const updateQuery: UpdateQuery<EpisodesUsersOdm.Doc> = {
      $set: {
        ...entity,
      },
    };

    if (updateQuery.$set?.tags?.length === 0)
      delete updateQuery.$set.tags;

    if (entity.tags?.length === 0) {
      updateQuery.$unset = {
        ...updateQuery.$unset,
        tags: true,
      };
    }

    const doc = await EpisodesUsersOdm.Model.findOneAndUpdate(
      {
        episodeId: new Types.ObjectId(key.episodeId),
        userId: new Types.ObjectId(key.userId),
      },
      {
        ...updateQuery,
        $setOnInsert: {
          episodeId: new Types.ObjectId(key.episodeId),
          userId: new Types.ObjectId(key.userId),
        },
      },
      {
        upsert: true,
        new: true,
        timestamps: true,
      },
    );

    assertFoundClient(doc);

    const ret = EpisodesUsersOdm.toEntity(doc);

    this.domainEventEmitter.emitPatch(EpisodesUsersEvents.Patched.TYPE, {
      entity,
      id: {
        episodeId: key.episodeId,
        userId: key.userId,
        _id: ret.id,
      } satisfies EpisodesUsersEvents.Patched.Event["payload"]["entityId"],
      unset: params.unset,
    } );

    return ret;
  }

  @EmitEntityEvent(EpisodesUsersEvents.Created.TYPE)
  async createOneAndGet(entity: Entity): Promise<Entity> {
    const docOdm = EpisodesUsersOdm.toDoc(entity);
    const gotDoc = await EpisodesUsersOdm.Model.create(docOdm);

    return EpisodesUsersOdm.toEntity(gotDoc);
  }
}
