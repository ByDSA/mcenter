import { join, basename, dirname } from "node:path";
import fs from "node:fs";
import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import { MovieEntity, MovieId } from "$shared/models/movies";
import { Types, UpdateQuery } from "mongoose";
import { OnEvent } from "@nestjs/event-emitter";
import { MovieFileInfoCrudDtos } from "$shared/models/movies/file-info/dto/transport";
import { CanCreateOneAndGet, CanGetAll, CanGetOneById } from "#utils/layers/repository";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { DomainEvent, DomainEventEmitter } from "#core/domain-event-emitter";
import { MovieEvents } from "#modules/movies/crud/repositories/movie/events";
import { showError } from "#core/logging/show-error";
import { assertFoundClient } from "#utils/validation/found";
import { MongoFilterQuery } from "#utils/layers/db/mongoose";
import { MovieFileInfo, MovieFileInfoEntity } from "../../models";
import { MovieFileInfoOdm } from "./odm";
import { MovieFileInfoEvents } from "./events";
import { DocOdm } from "./odm/odm";
import { MOVIES_MEDIA_PATH } from "#modules/movies/utils";

type Entity = MovieFileInfoEntity;
type CreateOneDto = MovieFileInfoCrudDtos.CreateOne.Body;
type PatchOneDto = MovieFileInfoCrudDtos.PatchOne.Body;

@Injectable()
export class MovieFileInfoRepository
implements
CanCreateOneAndGet<CreateOneDto>,
CanGetAll<Entity>,
CanGetOneById<Entity, Entity["id"]> {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
  ) {}

  @OnEvent(MovieFileInfoEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  // Cuando se elimina una película, se eliminan también sus file-infos en cascada
  @OnEvent(MovieEvents.Deleted.TYPE)
  async handleDeleteMovie(event: MovieEvents.Deleted.Event) {
    const { entity } = event.payload;

    await this.deleteManyByMovieId(entity.id)
      .catch(showError);
  }

  async getOneById(id: Entity["id"]): Promise<Entity | null> {
    const doc = await MovieFileInfoOdm.Model.findById(id);

    if (!doc)
      return null;

    return MovieFileInfoOdm.toEntity(doc);
  }

  async getAll(): Promise<Entity[]> {
    const docs = await MovieFileInfoOdm.Model.find();

    return docs.map(MovieFileInfoOdm.toEntity);
  }

  async getAllByMovieId(movieId: MovieId): Promise<Entity[]> {
    const docs = await MovieFileInfoOdm.Model.find( {
      movieId,
    } );

    return docs.map(MovieFileInfoOdm.toEntity);
  }

  async getManyByIds(ids: string[]): Promise<Entity[]> {
    const filter = {
      _id: {
        $in: ids.map(id => new Types.ObjectId(id)),
      },
    } satisfies MongoFilterQuery<DocOdm>;
    const docs = await MovieFileInfoOdm.Model.find(filter);

    return docs.map(MovieFileInfoOdm.toEntity);
  }

  async getOneByPath(path: Entity["path"]): Promise<Entity | null> {
    const doc = await MovieFileInfoOdm.Model.findOne( {
      path,
    } );

    if (!doc)
      return null;

    return MovieFileInfoOdm.toEntity(doc);
  }

  async getOneByHash(hash: Entity["hash"]): Promise<Entity | null> {
    const doc = await MovieFileInfoOdm.Model.findOne( {
      hash,
    } );

    if (!doc)
      return null;

    return MovieFileInfoOdm.toEntity(doc);
  }

  async createOneAndGet(model: CreateOneDto): Promise<Entity> {
    const docOdm = MovieFileInfoOdm.partialToDoc(model as Partial<MovieFileInfo>);
    const got = await MovieFileInfoOdm.Model.create(docOdm);

    this.domainEventEmitter.emitEntity(
      MovieFileInfoEvents.Created.TYPE,
      MovieFileInfoOdm.toEntity(got),
    );

    return MovieFileInfoOdm.toEntity(got);
  }

  async patchOneByIdAndGet(id: string, dto: PatchOneDto): Promise<Entity> {
    const docOdm = MovieFileInfoOdm.partialToDoc(dto.entity);
    const update: UpdateQuery<Entity> = {
      $set: docOdm,
    };

    if (dto.unset?.length)
      update.$unset = Object.fromEntries(dto.unset.map((field) => [field, ""]));

    const ret = await MovieFileInfoOdm.Model.findByIdAndUpdate(id, update, {
      new: true,
    } );

    assertFoundClient(ret);

    this.domainEventEmitter.emitPatch(MovieFileInfoEvents.Patched.TYPE, {
      partialEntity: dto.entity,
      id,
      unset: dto.unset,
    } );

    return MovieFileInfoOdm.toEntity(ret);
  }

  async patchOneByPath(path: string, dto: PatchOneDto): Promise<Entity> {
    const docOdm = MovieFileInfoOdm.partialToDoc(dto.entity);
    const ret = await MovieFileInfoOdm.Model.findOneAndUpdate( {
      path,
    }, docOdm, {
      new: true,
    } );

    assertFoundClient(ret);

    this.domainEventEmitter.emitPatch(MovieFileInfoEvents.Patched.TYPE, {
      partialEntity: dto.entity,
      id: ret._id.toString(),
      unset: dto.unset,
    } );

    return MovieFileInfoOdm.toEntity(ret);
  }

  async deleteOneById(id: string): Promise<Entity> {
    const fileInfo = await MovieFileInfoOdm.Model.findById(id);

    assertFoundClient(fileInfo);

    const { movieId } = fileInfo;
    const count = await MovieFileInfoOdm.Model.count( {
      movieId,
    } );

    if (count <= 1) {
      throw new UnprocessableEntityException(
        "No se puede eliminar el último archivo de una película. Elimine la \
película si desea borrar el archivo.",
      );
    }

    // Mover archivo a carpeta de eliminados
    const absPath = join(MOVIES_MEDIA_PATH, fileInfo.path);
    const filename = basename(absPath);
    const newPath = join(MOVIES_MEDIA_PATH, "..", "deleted", filename);

    await fs.promises.mkdir(dirname(newPath), {
      recursive: true,
    } );
    await fs.promises.rename(absPath, newPath);

    await MovieFileInfoOdm.Model.deleteOne( {
      _id: id,
    } );

    const entity = MovieFileInfoOdm.toEntity(fileInfo);

    this.domainEventEmitter.emitEntity(MovieFileInfoEvents.Deleted.TYPE, entity);

    return entity;
  }

  async deleteManyByMovieId(id: MovieEntity["id"]): Promise<void> {
    await MovieFileInfoOdm.Model.deleteMany( {
      movieId: new Types.ObjectId(id),
    } );
  }

  async deleteOneByPath(path: string): Promise<void> {
    await MovieFileInfoOdm.Model.deleteOne( {
      path,
    } );
  }
}
