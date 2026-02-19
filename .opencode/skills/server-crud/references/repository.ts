import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Types } from "mongoose";
import { assertFoundClient } from "#utils/validation/found";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEvent, DomainEventEmitter } from "#core/domain-event-emitter";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { MyEntity } from "../../models";
import { MyEntityOdm } from "./odm";
import { MyEntityEvents } from "./events";
import type { MyEntityCrudDtos } from "$shared/models/<entity>/dto/transport";
import { getCriteriaPipeline } from "./criteria-pipeline";

@Injectable()
export class MyEntityRepository {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter
  ) {}

  @OnEvent(MyEntityEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  async getOneById(id: string): Promise<MyEntity | null> {
    const doc = await MyEntityOdm.Model.findById(id);
    return doc ? MyEntityOdm.toEntity(doc) : null;
  }

  @EmitEntityEvent(MyEntityEvents.Created.TYPE)
  async createOneAndGet(dto: MyEntity): Promise<MyEntity> {
    const created = await MyEntityOdm.Model.create({ ...dto, createdAt: new Date(), updatedAt: new Date() });
    return MyEntityOdm.toEntity(created);
  }

  async patchOneByIdAndGet(id: string, params: PatchOneParams<Partial<MyEntity>>): Promise<MyEntity> {
    const partial = MyEntityOdm.partialToDoc(params.entity);
    const result = await MyEntityOdm.Model.updateOne({ _id: new Types.ObjectId(id) }, partial);

    if (result.matchedCount === 0) assertFoundClient(null);

    this.domainEventEmitter.emitPatch(MyEntityEvents.Patched.TYPE, { partialEntity: params.entity, id });

    const updated = await this.getOneById(id);
    assertFoundClient(updated);
    return updated;
  }

  @EmitEntityEvent(MyEntityEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: string): Promise<MyEntity> {
    const doc = await MyEntityOdm.Model.findByIdAndDelete(id);
    assertFoundClient(doc);
    return MyEntityOdm.toEntity(doc);
  }

  async getAll(): Promise<MyEntity[]> {
    const docs = await MyEntityOdm.Model.find( {} );
    const ret = docs.map(MyEntityOdm.toEntity);

    return ret;
  }

    async getManyByCriteria(
    criteria: MyEntityCrudDtos.GetMany.Criteria,
  ): Promise<MyEntity[]> {
    // There's a sample in modules/episodes/crud/repisodes/repository/odm/criteria-pipeline.ts
    const pipeline = getCriteriaPipeline(criteria);
    const docsOdm: MyEntityOdm.FullDoc[] = await MyEntityOdm.Model.aggregate(
      pipeline,
    );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(MyEntityOdm.toEntity);
  }
}