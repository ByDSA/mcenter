/* eslint-disable import/no-cycle */
import { Injectable,
  UnauthorizedException } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { PipelineStage, Types } from "mongoose";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { assertIsDefined } from "$shared/utils/validation";
import { MusicSmartPlaylistCrudDtos } from "$shared/models/musics/smart-playlists/dto/transport";
import { assertFoundClient } from "#utils/validation/found";
import { CanDeleteOneByIdAndGet,
  CanGetOneById,
  CanPatchOneByIdAndGet } from "#utils/layers/repository";
import { fixSlug } from "#musics/crud/builder/fix-slug";
import { MongoFilterQuery,
  patchParamsToUpdateQuery } from "#utils/layers/db/mongoose";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { DomainEventEmitter, DomainEvent } from "#core/domain-event-emitter";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { enrichImageCover } from "#modules/image-covers/repositories/odm/utils";
import { enrichOwnerUserPublic } from "#musics/playlists/crud/repository/odm/pipeline-utils";
import { MusicSmartPlaylistModel,
  MusicSmartPlaylistEntity } from "../../models";
import { MusicSmartPlaylistAvailableSlugGeneratorService } from "./available-slug-generator.service";
import { MusicSmartPlaylistEvents } from "./events";
import { MusicSmartPlaylistOdm } from "./odm";

type Entity = MusicSmartPlaylistEntity;
type Model = MusicSmartPlaylistModel;

type SlugProps = {
  slug: string;
  ownerUserId: string;
};

@Injectable()
export class MusicSmartPlaylistRepository
implements
    CanPatchOneByIdAndGet<Entity, string, Model>,
    CanGetOneById<Entity, string>,
    CanDeleteOneByIdAndGet<Entity, string> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
    private readonly slugService: MusicSmartPlaylistAvailableSlugGeneratorService,
  ) {}

  @OnEvent(MusicSmartPlaylistEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  async getOneById(id: string): Promise<Entity | null> {
    const doc = await MusicSmartPlaylistOdm.Model.findById(id);

    if (!doc)
      return null;

    return MusicSmartPlaylistOdm.toEntity(doc);
  }

  async getOneBySlug( { slug, ownerUserId }: SlugProps): Promise<Entity | null> {
    const filter: any = {
      slug,
    };

    if (ownerUserId)
      filter.userId = new Types.ObjectId(ownerUserId);

    const doc = await MusicSmartPlaylistOdm.Model.findOne(filter);

    if (!doc)
      return null;

    return MusicSmartPlaylistOdm.toEntity(doc);
  }

  async getOneByCriteria(
    criteria: MusicSmartPlaylistCrudDtos.GetOne.Criteria,
  ): Promise<Entity | null> {
    const [found] = await this.getManyByCriteria( {
      ...criteria,
      limit: 1,
    } );

    return found ?? null;
  }

  async getManyByCriteria(
    criteria: MusicSmartPlaylistCrudDtos.GetMany.Criteria,
  ): Promise<Entity[]> {
    const pipeline: PipelineStage[] = [];
    // 1. Etapa $match (Filtrado)
    const match: MongoFilterQuery<MusicSmartPlaylistOdm.Doc> = {};

    if (criteria.filter?.ownerUserId)
      match.ownerUserId = new Types.ObjectId(criteria.filter.ownerUserId);

    if (criteria.filter?.name)
      match.name = criteria.filter.name;

    if (criteria.filter?.slug)
      match.slug = criteria.filter.slug;

    if (criteria.filter?.id)
      match._id = new Types.ObjectId(criteria.filter.id);

    // Solo añadimos la etapa $match si hay filtros definidos directos
    if (Object.keys(match).length > 0) {
      pipeline.push( {
        $match: match,
      } );
    }

    // Filtrado por slug de usuario (requiere lookup)
    if (criteria.filter?.ownerUserSlug) {
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "ownerUserId",
            foreignField: "_id",
            as: "__userFilterInfo",
          },
        },
        {
          $match: {
            "__userFilterInfo.publicUsername": criteria.filter.ownerUserSlug,
          },
        },
        {
          $unset: "__userFilterInfo",
        },
      );
    }

    // 2. Etapa $sort (Ordenamiento)
    if (criteria.sort?.updated) {
      pipeline.push( {
        $sort: {
          updatedAt: criteria.sort.updated === "asc" ? 1 : -1,
        },
      } );
    }

    pipeline.push( {
      $skip: criteria.offset ?? 0,
    } );

    if (criteria.limit !== undefined) {
      pipeline.push( {
        $limit: criteria.limit,
      } );
    }

    if (criteria.expand?.includes("imageCover")) {
      pipeline.push(
        ...enrichImageCover( {
          imageCoverIdField: "imageCoverId",
          imageCoverField: "imageCover",
        } ),
      );
    }

    // Si queremos expandir el usuario propietario (similar a playlists)
    if (criteria.expand?.includes("ownerUser")) {
      pipeline.push(
        {
          $lookup: {
            from: "users",
            localField: "ownerUserId",
            foreignField: "_id",
            as: "ownerUser",
          },
        },
        {
          $unwind: {
            path: "$ownerUser",
            preserveNullAndEmptyArrays: true,
          },
        },
      );
    }

    if (criteria.expand?.includes("ownerUserPublic")) {
      pipeline.push(
        ...enrichOwnerUserPublic( {
          localField: "ownerUserId",
          targetField: "ownerUserPublic",
        } ),
      );
    }

    const docs = await MusicSmartPlaylistOdm.Model.aggregate(pipeline);

    return docs.map(MusicSmartPlaylistOdm.toEntity);
  }

  @EmitEntityEvent(MusicSmartPlaylistEvents.Created.TYPE)
  async createOneAndGet(
    dto: MusicSmartPlaylistCrudDtos.CreateOne.Body,
    userId: string,
  ): Promise<Entity> {
    const baseSlug = fixSlug(dto.slug);

    assertIsDefined(baseSlug, "Invalid slug");

    const slug = await this.slugService.getAvailable( {
      slug: baseSlug,
      userId,
    } );
    const newDoc: MusicSmartPlaylistModel = {
      ...dto,
      slug,
      ownerUserId: userId,
      visibility: dto.visibility ?? "private",
    };
    const docOdm = MusicSmartPlaylistOdm.toDoc(newDoc);
    const created = await MusicSmartPlaylistOdm.Model.create(docOdm);

    return MusicSmartPlaylistOdm.toEntity(created);
  }

  async patchOneByIdAndGet(
    id: string,
    params: PatchOneParams<Partial<Model>>,
  ): Promise<Entity> {
    const oldDoc = await MusicSmartPlaylistOdm.Model.findById(id);

    assertFoundClient(oldDoc);

    // Si cambia el slug, recalcular disponibilidad
    if (params.entity.slug) {
      const baseSlug = fixSlug(params.entity.slug);

      assertIsDefined(baseSlug, "Invalid slug");
      const userId = oldDoc.ownerUserId.toString();

      params.entity.slug = await this.slugService.getAvailable( {
        slug: baseSlug,
        userId,
      } );
    }

    const updateQuery = patchParamsToUpdateQuery(
      params,
      MusicSmartPlaylistOdm.partialToUpdateQuery,
    );
    const doc = await MusicSmartPlaylistOdm.Model.findByIdAndUpdate(
      id,
      updateQuery,
      {
        new: true,
      },
    );

    assertFoundClient(doc);

    const entity = MusicSmartPlaylistOdm.toEntity(doc);

    this.domainEventEmitter.emitPatch(MusicSmartPlaylistEvents.Patched.TYPE, {
      partialEntity: params.entity,
      id,
      unset: params.unset,
    } );

    return entity;
  }

  @EmitEntityEvent(MusicSmartPlaylistEvents.Deleted.TYPE)
  async deleteOneByIdAndGet(id: string): Promise<Entity> {
    const doc = await MusicSmartPlaylistOdm.Model.findByIdAndDelete(id);

    assertFoundClient(doc);

    return MusicSmartPlaylistOdm.toEntity(doc);
  }

  // Guardias de seguridad
  async guardOwner(userId: string, queryId: string): Promise<void> {
    const query = await this.getOneById(queryId);

    assertFoundClient(query);

    if (query.ownerUserId !== userId)
      throw new UnauthorizedException("User is not the owner of the query");
  }
}
