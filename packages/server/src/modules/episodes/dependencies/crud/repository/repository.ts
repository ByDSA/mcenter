import type { DomainEvent } from "#core/domain-event-emitter";
import type { CanCreateOne, CanDeleteOneByIdAndGet } from "#utils/layers/repository";
import type { EpisodeDependency as Model, EpisodeDependencyEntity as Entity } from "../../models";
import type { EpisodeDependencyCrudDtos } from "$shared/models/episodes/dependencies/dto/transport";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { EpisodeCompKey } from "#episodes/models";
import { assertFoundClient } from "#utils/validation/found";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { EpisodeDependencyOdm } from "./odm";
import { EpisodeDependencyEvents } from "./events";
import { getCriteriaPipeline } from "./criteria-pipeline";

type Id = Entity["id"];

@Injectable()
export class EpisodeDependenciesRepository implements
CanCreateOne<Model>,
CanDeleteOneByIdAndGet<Model, Id> {
  constructor() { }

  @OnEvent(EpisodeDependencyEvents.WILDCARD)
  handleEvents(ev: DomainEvent<object>) {
    logDomainEvent(ev);
  }

  @EmitEntityEvent(EpisodeDependencyEvents.Created.TYPE)
  async createOne(entry: Model): Promise<void> {
    const entryDocOdm = EpisodeDependencyOdm.toDoc(entry);

    await EpisodeDependencyOdm.Model.create(entryDocOdm);
  }

  async getAll(): Promise<Entity[]> {
    const docsOdm = await EpisodeDependencyOdm.Model.find();

    return docsOdm.map(EpisodeDependencyOdm.toEntity);
  }

  async getNextByLast(lastCompKey: EpisodeCompKey): Promise<Entity | null> {
    return (await this.getManyByCriteria( {
      filter: {
        lastCompKey,
      },
    } ))[0] ?? null;
  }

  async getManyByCriteria(
    criteria: EpisodeDependencyCrudDtos.GetMany.Criteria,
  ): Promise<Entity[]> {
    const pipeline = getCriteriaPipeline(criteria);
    const docsOdm: EpisodeDependencyOdm.FullDoc[] = await EpisodeDependencyOdm.Model.aggregate(
      pipeline,
    );

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(EpisodeDependencyOdm.toEntity);
  }

  @EmitEntityEvent(EpisodeDependencyEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: Id): Promise<Entity> {
    const docOdm = await EpisodeDependencyOdm.Model.findByIdAndDelete(id);

    assertFoundClient(docOdm);

    return EpisodeDependencyOdm.toEntity(docOdm);
  }
}
