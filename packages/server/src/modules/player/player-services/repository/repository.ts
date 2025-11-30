import assert from "assert";
import { Injectable } from "@nestjs/common";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { OnEvent } from "@nestjs/event-emitter";
import { RemotePlayerCrudDtos } from "$shared/models/player/remote-player/dto/transport";
import { UserEntity } from "$shared/models/auth";
import { Types } from "mongoose";
import { assertIsDefined } from "$shared/utils/validation";
import { assertFoundClient } from "#utils/validation/found";
import { CanDeleteOneByIdAndGet, CanGetManyByCriteria, CanGetOneById, CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { DomainEvent } from "#core/domain-event-emitter";
import { RemotePlayer, RemotePlayerEntity } from "../models";
import { RemotePlayerEvents } from "./events";
import { RemotePlayerOdm } from "./odm";

type CriteriaMany = RemotePlayerCrudDtos.GetMany.Criteria;
type CriteriaOne = Omit<RemotePlayerCrudDtos.GetMany.Criteria, "limit" | "offset" | "sort">;
type Entity = RemotePlayerEntity;
type Model = RemotePlayer;

@Injectable()
export class RemotePlayersRepository
implements
CanPatchOneByIdAndGet<Entity, Entity["id"], Model>,
CanGetOneById<Entity, Entity["id"]>,
CanDeleteOneByIdAndGet<Entity, Entity["id"]>,
CanGetManyByCriteria<Entity, CriteriaMany> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) { }

  @OnEvent(RemotePlayerEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  async deleteOneByIdAndGet(id: string): Promise<Entity> {
    const doc = await RemotePlayerOdm.Model.findByIdAndDelete(id);

    assertFoundClient(doc);

    const ret = RemotePlayerOdm.toEntity(doc);

    this.domainEventEmitter.emitEntity(RemotePlayerEvents.Deleted.TYPE, ret);

    return ret;
  }

  async getOneById(id: string, _criteria?: CriteriaOne): Promise<Entity | null> {
    const doc = await RemotePlayerOdm.Model.findById(id);

    assertFoundClient(doc);

    return RemotePlayerOdm.toEntity(doc);
  }

  async getAllViewersOf(remotePlayerId: string): Promise<UserEntity["id"][]> {
    const allDocs: RemotePlayerOdm.FullDoc[] = await this.getManyByCriteriaInner( {
      expand: ["permissions"],
      filter: {
        id: remotePlayerId,
      },
    } );

    assert(allDocs.length === 1);

    const doc = allDocs[0];

    assertIsDefined(doc.permissions);

    return doc.permissions.map(p=>p.userId.toString());
  }

  async getAllVisiblesForUser(userId: UserEntity["id"]): Promise<Entity[]> {
    const allDocs: RemotePlayerOdm.FullDoc[] = await this.getManyByCriteriaInner( {
      expand: ["permissions"],
    } );
    const docs = allDocs.filter(
      d=>d.ownerId.toString() === userId
      || d.permissions?.some(p=>p.userId.toString() === userId),
    );

    return docs.map(RemotePlayerOdm.toEntity);
  }

  async canView( { remotePlayerId, userId }: {userId: string;
remotePlayerId: string;} ): Promise<boolean> {
    const remotePlayers = await this.getManyByCriteriaInner( {
      expand: ["permissions"],
      filter: {
        id: remotePlayerId,
      },
    } );

    if (!remotePlayers || remotePlayers.length !== 1)
      return false;

    const remotePlayer = remotePlayers[0];

    return remotePlayer.permissions?.some(p=>p.userId.toString() === userId) ?? false;
  }

  private async getManyByCriteriaInner(criteria: CriteriaMany): Promise<RemotePlayerOdm.FullDoc[]> {
    const actualCriteria: CriteriaMany = {
      ...criteria,
      limit: criteria.limit ?? 10,
    };
    const pipeline: any[] = [];

    // Lookup para "expandir"
    if (actualCriteria.expand?.includes("owner")) {
      pipeline.push( {
        $lookup: {
          from: "users",
          localField: "ownerId",
          foreignField: "_id",
          as: "owner",
        },
      } );

      // Convertir array a objeto único
      pipeline.push( {
        $unwind: {
          path: "$owner",
          preserveNullAndEmptyArrays: true,
        },
      } );
    }

    if (actualCriteria.expand?.includes("permissions")) {
      pipeline.push( {
        $lookup: {
          from: "remote_player_permissions",
          localField: "_id",
          foreignField: "remotePlayerId",
          as: "permissions",
        },
      } );
    }

    if (actualCriteria.filter?.id) {
      pipeline.push( {
        $match: {
          _id: new Types.ObjectId(actualCriteria.filter.id),
        },
      } );
    }

    // Paginación
    pipeline.push( {
      $skip: actualCriteria.offset ?? 0,
    } );
    pipeline.push( {
      $limit: actualCriteria.limit ?? 10,
    } );

    const docs: RemotePlayerOdm.FullDoc[] = await RemotePlayerOdm.Model.aggregate(pipeline);

    return docs;
  }

  async getManyByCriteria(criteria: CriteriaMany): Promise<Entity[]> {
    const docs = await this.getManyByCriteriaInner(criteria);

    return docs.map(RemotePlayerOdm.toEntity);
  }

  async patchOneByIdAndGet(id: Entity["id"], params: PatchOneParams<Model>): Promise<Entity> {
    const { entity: paramEntity } = params;
    const updateQuery = patchParamsToUpdateQuery( {
      ...params,
      entity: paramEntity,
    }, RemotePlayerOdm.partialToDoc);
    const doc = await RemotePlayerOdm.Model.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    );

    assertFoundClient(doc);

    const ret = RemotePlayerOdm.toEntity(doc);

    this.domainEventEmitter.emitPatch(RemotePlayerEvents.Patched.TYPE, {
      partialEntity: paramEntity,
      id,
      unset: params.unset,
    } );

    return ret;
  }

  async getAll(): Promise<Entity[]> {
    const docs = await RemotePlayerOdm.Model.find( {} );
    const ret = docs.map(RemotePlayerOdm.toEntity);

    return ret;
  }

  @EmitEntityEvent(RemotePlayerEvents.Created.TYPE)
  async createOneAndGet(model: Model): Promise<Entity> {
    const docOdm = RemotePlayerOdm.toDoc(model);
    const gotDoc = await RemotePlayerOdm.Model.create(docOdm);

    return RemotePlayerOdm.toEntity(gotDoc);
  }

  async getOneBySecretToken(token: string): Promise<Entity | null> {
    const doc = await RemotePlayerOdm.Model.findOne( {
      secretToken: token,
    } );

    if (!doc)
      return null;

    return RemotePlayerOdm.toEntity(doc);
  }
}
