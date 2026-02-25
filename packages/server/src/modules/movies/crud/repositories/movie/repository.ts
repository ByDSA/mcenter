import { MovieCrudDtos } from "$shared/models/movies/dto/transport";
import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Types } from "mongoose";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { MovieEntity } from "$shared/models/movies";
import { assertFoundClient } from "#utils/validation/found";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEvent, DomainEventEmitter } from "#core/domain-event-emitter";
import { MovieOdm } from "./odm";
import { MovieEvents } from "./events";

@Injectable()
export class MovieRepository {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) {}

  @OnEvent(MovieEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  async getOneById(id: string): Promise<MovieEntity | null> {
    const doc = await MovieOdm.Model.findById(id);

    return doc ? MovieOdm.toEntity(doc) : null;
  }

  @EmitEntityEvent(MovieEvents.Created.TYPE)
  async createOneAndGet(
    dto: MovieCrudDtos.CreateOne.RepoDto,
  ): Promise<MovieEntity> {
    const created = await MovieOdm.Model.create(
      {
        ...dto,
        uploaderUserId: new Types.ObjectId(dto.uploaderUserId),
        imageCoverId: dto.imageCoverId ? new Types.ObjectId(dto.imageCoverId) : undefined,
        addedAt: new Date(),
      },
    );

    return MovieOdm.toEntity(created);
  }

  async patchOneByIdAndGet(
    id: string,
    params: PatchOneParams<Partial<MovieEntity>>,
  ): Promise<MovieEntity> {
    const partial = MovieOdm.partialToDoc(params.entity);
    const result = await MovieOdm.Model.updateOne( {
      _id: new Types.ObjectId(id),
    }, partial);

    if (result.matchedCount === 0)
      assertFoundClient(null);

    this.domainEventEmitter.emitPatch(
      MovieEvents.Patched.TYPE,
      {
        partialEntity: params.entity,
        id,
      },
    );

    const updated = await this.getOneById(id);

    assertFoundClient(updated);

    return updated;
  }

  @EmitEntityEvent(MovieEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: string): Promise<MovieEntity> {
    const doc = await MovieOdm.Model.findByIdAndDelete(id);

    assertFoundClient(doc);

    return MovieOdm.toEntity(doc);
  }

  async getAll(): Promise<MovieEntity[]> {
    const docs = await MovieOdm.Model.find( {} );

    return docs.map(MovieOdm.toEntity);
  }

  async getManyByCriteria(
    criteria: MovieCrudDtos.GetMany.Criteria,
  ): Promise<MovieEntity[]> {
    const filter: Record<string, unknown> = {};

    if (criteria.filter) {
      if (criteria.filter.id)
        filter._id = new Types.ObjectId(criteria.filter.id);

      if (criteria.filter.ids) {
        filter._id = {
          $in: criteria.filter.ids.map(id => new Types.ObjectId(id)),
        };
      }

      if (criteria.filter.slug)
        filter.slug = criteria.filter.slug;

      if (criteria.filter.title) {
        filter.title = {
          $regex: criteria.filter.title,
          $options: "i",
        };
      }

      if (criteria.filter.genre) {
        filter.genre = {
          $regex: criteria.filter.genre,
          $options: "i",
        };
      }

      if (criteria.filter.year)
        filter.year = criteria.filter.year;

      if (criteria.filter.director) {
        filter.director = {
          $regex: criteria.filter.director,
          $options: "i",
        };
      }
    }

    // Get sort key and direction from the criteria
    const sortObj = criteria.sort as Record<string, "asc" | "desc"> | undefined;
    const sort: Record<string, -1 | 1> = {};

    if (sortObj) {
      const sortKey = Object.keys(sortObj)[0] || "createdAt";

      sort[sortKey] = sortObj[sortKey] === "asc" ? 1 : -1;
    } else
      sort.createdAt = -1;

    // Get limit and offset from criteria
    const limit = (criteria as { limit?: number } ).limit ?? 20;
    const skip = (criteria as { offset?: number } ).offset ?? 0;
    const docsOdm = await MovieOdm.Model.find(filter)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .exec();

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(MovieOdm.toEntity);
  }
}
