import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { Types } from "mongoose";
import { PatchOneParams } from "$shared/models/utils/schemas/patch";
import { MusicUserList,
  MusicUserListEntity,
  MusicUserListResourceItem } from "$shared/models/musics/users-lists";
import { MusicPlayListEvents } from "#musics/playlists/crud/repository/events/playlist";
import { MusicSmartPlaylistEvents } from "#musics/smart-playlists/crud/repository/events";
import { MusicPlaylistsRepository } from "#musics/playlists/crud/repository";
import { MusicSmartPlaylistsRepository } from "#musics/smart-playlists/crud/repository";
import { DomainEventEmitter, DomainEvent } from "#core/domain-event-emitter";
import { logDomainEvent } from "#core/logging/log-domain-event";
import { assertFoundClient } from "#utils/validation/found";
import { MusicUserListOdm } from "./odm";
import { MusicUserListEvents } from "./events";

type Entity = MusicUserListEntity;

@Injectable()
export class MusicUsersListsRepository {
  constructor(
    private readonly domainEventEmitter: DomainEventEmitter,
    private readonly playlistsRepo: MusicPlaylistsRepository,
    private readonly queriesRepo: MusicSmartPlaylistsRepository,
  ) {}

  @OnEvent(MusicUserListEvents.WILDCARD)
  handleEvents(ev: DomainEvent<unknown>) {
    logDomainEvent(ev);
  }

  // --- Event Listeners (Actualizados a resourceId) ---
  @OnEvent(MusicPlayListEvents.Created.TYPE)
  async handlePlaylistCreated(ev: MusicPlayListEvents.Created.Event) {
    await this.addItemToList(
      ev.payload.entity.ownerUserId,
      ev.payload.entity.id,
      "playlist",
    );
  }

  @OnEvent(MusicPlayListEvents.Deleted.TYPE)
  async handlePlaylistDeleted(ev: MusicPlayListEvents.Deleted.Event) {
    await this.removeItemFromList(
      ev.payload.entity.ownerUserId,
      ev.payload.entity.id,
    );
  }

  @OnEvent(MusicSmartPlaylistEvents.Created.TYPE)
  async handleQueryCreated(ev: MusicSmartPlaylistEvents.Created.Event) {
    await this.addItemToList(
      ev.payload.entity.ownerUserId,
      ev.payload.entity.id,
      "query",
    );
  }

  @OnEvent(MusicSmartPlaylistEvents.Deleted.TYPE)
  async handleQueryDeleted(ev: MusicSmartPlaylistEvents.Deleted.Event) {
    await this.removeItemFromList(
      ev.payload.entity.ownerUserId,
      ev.payload.entity.id,
    );
  }

  // --- CRUD Básico ---
  async getOneByUserId(userId: string): Promise<Entity> {
    let doc = await MusicUserListOdm.Model.findOne( {
      ownerUserId: new Types.ObjectId(userId),
    } );

    if (!doc) {
      doc = await MusicUserListOdm.Model.create( {
        ownerUserId: new Types.ObjectId(userId),
        list: [],
      } );
    }

    return MusicUserListOdm.toEntity(doc);
  }

  async patchOneByUserIdAndGet(
    userId: string,
    params: PatchOneParams<MusicUserList>,
  ): Promise<Entity> {
    const updateQuery: any = {};

    // Al hacer patch de la lista entera, debemos respetar la estructura de subdocumentos
    if (params.entity.list) {
      updateQuery.list = params.entity.list.map((item) => ( {
        _id: item.id ? new Types.ObjectId(item.id) : new Types.ObjectId(),
        resourceId: new Types.ObjectId(item.resourceId),
        type: item.type,
      } ));
    }

    const doc = await MusicUserListOdm.Model.findOneAndUpdate(
      {
        ownerUserId: new Types.ObjectId(userId),
      },
      {
        $set: updateQuery,
      },
      {
        new: true,
        upsert: true,
      },
    );

    assertFoundClient(doc);
    const entity = MusicUserListOdm.toEntity(doc);

    this.domainEventEmitter.emitPatch(MusicUserListEvents.Patched.TYPE, {
      partialEntity: params.entity,
      id: entity.id,
    } );

    return entity;
  }

  async getAllResourcesSorted(
    userId: string,
    criteria: { expand?: boolean },
  ): Promise<MusicUserListEntity> {
    // 1. Obtener la lista ordenada guardada en DB
    const userListEntity = await this.getOneByUserId(userId);
    // Mapa auxiliar: resourceId -> { entryId, sortIndex }
    const listMap = new Map<string, { id: string;
index: number; }>();

    userListEntity.list.forEach((item, index) => {
      listMap.set(item.resourceId, {
        id: item.id,
        index,
      } );
    } );

    // 2. Obtener todos los recursos reales disponibles
    const [playlists, queries] = await Promise.all([
      this.playlistsRepo.getManyByCriteria( {
        filter: {
          ownerUserId: userId,
        },
        expand: criteria.expand ? ["ownerUserPublic", "imageCover"] : [],
      } ),
      this.queriesRepo.getManyByCriteria( {
        filter: {
          ownerUserId: userId,
        },
        expand: criteria.expand ? ["ownerUser", "imageCover"] : [],
      } ),
    ]);
    const items: MusicUserListResourceItem[] = [];

    // 3. Procesar Playlists y construir el ResourceItem
    for (const playlist of playlists) {
      const entryInfo = listMap.get(playlist.id);

      items.push( {
        type: "playlist",
        id: entryInfo?.id ?? new Types.ObjectId().toString(),
        resourceId: playlist.id,
        resource: criteria.expand ? playlist : undefined,
        sortIndex:
          entryInfo !== undefined ? entryInfo.index : Number.MAX_SAFE_INTEGER,
      } );
    }

    // 4. Procesar Queries
    for (const query of queries) {
      const entryInfo = listMap.get(query.id);

      items.push( {
        type: "smart-playlist",
        id: entryInfo?.id ?? new Types.ObjectId().toString(),
        resourceId: query.id,
        resource: criteria.expand ? query : undefined,
        sortIndex:
          entryInfo !== undefined ? entryInfo.index : Number.MAX_SAFE_INTEGER,
      } );
    }

    // 5. Ordenar
    const list: MusicUserListEntity["list"] = items.sort((a, b) => {
      if (a.sortIndex !== b.sortIndex)
        return a.sortIndex - b.sortIndex;

      // Desempate determinista para items nuevos (Infinity)
      return a.resourceId.localeCompare(b.resourceId);
    } );

    return {
      ...userListEntity,
      list,
    } as MusicUserListEntity;
  }

  // --- Helpers Privados ---
  private async addItemToList(
    userId: string,
    resourceId: string,
    type: "playlist" | "query",
  ) {
    // Solo añadimos si no existe ya ese resourceId en la lista para evitar duplicados lógicos
    const exists = await MusicUserListOdm.Model.exists( {
      ownerUserId: new Types.ObjectId(userId),
      "list.resourceId": new Types.ObjectId(resourceId),
    } );

    if (exists)
      return;

    await MusicUserListOdm.Model.updateOne(
      {
        ownerUserId: new Types.ObjectId(userId),
      },
      {
        $push: {
          list: {
            resourceId: new Types.ObjectId(resourceId),
            type,
          },
        },
      },
      {
        upsert: true,
      },
    );
  }

  private async removeItemFromList(userId: string, resourceId: string) {
    await MusicUserListOdm.Model.updateOne(
      {
        ownerUserId: new Types.ObjectId(userId),
      },
      {
        $pull: {
          list: {
            resourceId: new Types.ObjectId(resourceId),
          },
        },
      },
    );
  }
}
