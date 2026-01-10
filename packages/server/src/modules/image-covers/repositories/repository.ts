import { Injectable } from "@nestjs/common";
import { ImageCoverCrudDtos } from "$shared/models/image-covers/dto/transport";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { OnEvent } from "@nestjs/event-emitter";
import { ImageCover, ImageCoverEntity } from "$shared/models/image-covers";
import { assertFoundClient } from "#utils/validation/found";
import { EmitEntityEvent } from "#core/domain-event-emitter/emit-event";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEvent } from "#core/domain-event-emitter";
import { DomainEventEmitter } from "#core/domain-event-emitter";
import { ImageCoverOdm } from "./odm";
import { ImageCoverEvents } from "./events";

type CreateOneDto = Omit<ImageCover, "createdAt" | "updatedAt">;

type Criteria = ImageCoverCrudDtos.GetMany.Criteria;
type CriteriaOne = ImageCoverCrudDtos.GetOne.Criteria;

type GetOneProps = {
  criteria: CriteriaOne;
};
type GetManyProps = {
  criteria: Criteria;
};

@Injectable()
export class ImageCoversRepository {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) {
  }

  @OnEvent(ImageCoverEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  async getMany(props: GetManyProps): Promise<ImageCoverEntity[]> {
    const { criteria } = props;
    const { filter, offset, limit } = criteria;
    const res = await ImageCoverOdm.Model.find( {
      ...(filter?.id && {
        _id: filter.id,
      } ),
      ...(filter?.searchLabel
        && {
          "metadata.label": {
            $regex: filter.searchLabel,
            $options: "i",
          },
        } ),
    } )
      .skip(offset ?? 0)
      .limit(limit ?? 50)
      .exec();

    return res.map(ImageCoverOdm.toEntity);
  }

  async patchOneByIdAndGet(
    id: string,
    patchParams: PatchOneParams<Partial<ImageCover>>,
  ): Promise<ImageCoverEntity> {
    const { entity } = patchParams;
    const partialDocOdm = ImageCoverOdm.partialToDoc(entity);

    if (Object.keys(partialDocOdm).length === 0)
      throw new Error("Empty partialDocOdm, nothing to patch");

    const updateResult = await ImageCoverOdm.Model.updateOne( {
      _id: id,
    }, partialDocOdm);

    if (updateResult.modifiedCount === 0 || updateResult.acknowledged === false)
      assertFoundClient(null);

    this.domainEventEmitter.emitPatch(ImageCoverEvents.Patched.TYPE, {
      partialEntity: entity,
      id,
    } );

    const ret = await this.getOneById(id);

    assertFoundClient(ret);

    return ret;
  }

  async getOneById(
    id: string,
    props?: Omit<GetOneProps, "criteria"> & {criteria: Pick<GetOneProps["criteria"], "expand">},
  ): Promise<ImageCoverEntity | null> {
    const criteria = props?.criteria;

    // Si no hay criteria, usar findById (más eficiente)
    if (!criteria?.expand || Object.keys(criteria.expand).length === 0) {
      const docOdm = await ImageCoverOdm.Model.findById(id);

      return docOdm ? ImageCoverOdm.toEntity(docOdm) : null;
    }

    // Si hay expand, usar aggregate para poder aplicar las transformaciones
    const [entity] = await this.getMany( {
      criteria: {
        ...criteria,
        filter: {
          id,
        },
        limit: 1,
      },
    } );

    return entity;
  }

  async deleteOneByIdAndGet(id: string): Promise<ImageCoverEntity> {
    const toDelete = await this.getOneById(id);

    assertFoundClient(toDelete);

    const deleteResult = await ImageCoverOdm.Model.deleteOne( {
      _id: id,
    } );

    if (deleteResult.deletedCount === 0 || deleteResult.acknowledged === false)
      throw new Error("Failed to delete ImageCover");

    this.domainEventEmitter.emitEntity(ImageCoverEvents.Deleted.TYPE, {
      id,
      deletedEntity: toDelete,
    } );

    return toDelete;
  }

  async getAll(): Promise<ImageCoverEntity[]> {
    const docsOdm: ImageCoverOdm.FullDoc[] = await ImageCoverOdm.Model.find();

    if (docsOdm.length === 0)
      return [];

    return docsOdm.map(ImageCoverOdm.toEntity);
  }

  async getOne(props: GetOneProps): Promise<ImageCoverEntity | null> {
    const [entity] = await this.getMany( {
      criteria: {
        ...props.criteria,
        limit: 1,
      },
    } );

    return entity;
  }

  async getManyBySearchLabel(
    searchLabel: string,
    props?: Omit<GetManyProps, "criteria"> & {criteria: Omit<GetManyProps["criteria"], "filter">},
  ): Promise<ImageCoverEntity[]> {
    return await this.getMany( {
      criteria: {
        ...props?.criteria,
        filter: {
          searchLabel,
        },
      },
    } );
  }

  @EmitEntityEvent(ImageCoverEvents.Created.TYPE)
  async createOneAndGet(createDto: CreateOneDto): Promise<ImageCoverEntity> {
    const created = await ImageCoverOdm.Model.create(createDto);

    return ImageCoverOdm.toEntity(created);
  }
}
