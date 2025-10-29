import { Injectable, Logger } from "@nestjs/common";
import { Index, MeiliSearch, SearchParams, SearchResponse } from "meilisearch";
import { OnEvent } from "@nestjs/event-emitter";
import { Music, MusicEntity, MusicUserInfoEntity } from "$shared/models/musics";
import { MusicOdm } from "#musics/crud/repositories/music/odm";
import { MusicEvents } from "#musics/crud/repositories/music/events";
import { DomainEvent, EntityEvent, PatchEvent } from "#core/domain-event-emitter";
import { assertFoundServer } from "#utils/validation/found";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { MusicsUsersOdm } from "#musics/crud/repositories/user-info/odm";
import { MusicsUsersEvents } from "#musics/crud/repositories/user-info/events";
import { waitForTask } from "./utils";
import { countries, generateSynonymsFromGroup } from "./synonyms";

type MusicDoc = {
  musicId: string;
  title: string;
  artist: string;
  game?: string;
  country?: string;
  addedAt: number;
  tags: string[] | null;
  onlyTags: string[] | null;
};

type UserInfoDoc = {
  userId: string | null;
  musicId: string;
  lastTimePlayedAt: number;
  weight: number;
  tags: string[] | null;
  onlyTags: string[] | null;
};
type Doc = MusicDoc & Omit<UserInfoDoc, "musicId"> & {
  id: string;
};

export {
  Doc as MusicDocMeili,
};

export const MEILISEARCH_MUSICS_MAX_HITS = 10_000;

@Injectable()
export class MusicsIndexService {
  private indexName = "musics";

  private logger = new Logger(MusicsIndexService.name);

  private index: Index<Doc>;

  constructor(
    private readonly meiliSearch: MeiliSearch,
  ) {
    this.index = this.meiliSearch.index(this.indexName);
  }

  @OnEvent(MusicEvents.WILDCARD)
  async handleMusicEvents(ev: DomainEvent<unknown>) {
    if (ev.type === MusicEvents.Patched.TYPE) {
      const typedEv = ev as PatchEvent<Music>;
      const id = typedEv.payload.entityId;
      const docOdm = await MusicOdm.Model.findById(id);

      assertFoundServer(docOdm);

      let doc: MusicDoc = this.mapMusicOdm(docOdm);

      await this.updateMusic(doc);
    } else if (ev.type === MusicEvents.Created.TYPE) {
      const typedEv = ev as EntityEvent<MusicEntity>;
      let doc: MusicDoc = this.mapMusicModel(typedEv.payload.entity);

      await this.updateMusic(doc);
    } else if (ev.type === MusicEvents.Deleted.TYPE) {
      const typedEv = ev as EntityEvent<{ id: string }>;

      await this.index.deleteDocuments( {
        filter: `musicId = ${typedEv.payload.entity.id}`,
      } );
    } else
      throw new Error("Event type not handled: " + ev.type);
  }

  @OnEvent(MusicsUsersEvents.WILDCARD)
  async handleUserInfoEvents(ev: DomainEvent<unknown>) {
    if (ev.type === MusicsUsersEvents.Patched.TYPE) {
      const typedEv = ev as MusicsUsersEvents.Patched.Event;
      const { _id } = typedEv.payload.entityId;
      const docOdm = await MusicsUsersOdm.Model.findById(_id);

      assertFoundServer(docOdm);

      let doc: UserInfoDoc = this.mapUserInfoOdm(docOdm);

      await this.updateUserInfo(doc);
    } else if (ev.type === MusicsUsersEvents.Created.TYPE) {
      const typedEv = ev as MusicsUsersEvents.Created.Event;
      let doc: UserInfoDoc = this.mapUserInfoModel(typedEv.payload.entity);

      await this.updateUserInfo(doc);
    } else if (ev.type === MusicsUsersEvents.Deleted.TYPE) {
      const typedEv = ev as MusicsUsersEvents.Deleted.Event;

      await this.index.deleteDocument(genId( {
        musicId: typedEv.payload.entity.musicId,
        userId: typedEv.payload.entity.userId,
      } ));
    } else
      throw new Error("Event type not handled: " + ev.type);
  }

  async syncAll() {
    const musics = await MusicOdm.Model.find().lean(); // .lean() elimina overhead de Mongoose
    const musicsUsers = await MusicsUsersOdm.Model.find().lean();
    const usersIds: (string)[] = await this.getUserIds();
    // OPTIMIZACIÓN: Crear mapa de musicsUsers eficientemente
    const musicsUsersMap = new Map<string, Map<string, MusicsUsersOdm.FullDoc>>();

    for (const mu of musicsUsers) {
      const userId = mu.userId.toString();
      const musicId = mu.musicId.toString();

      if (!musicsUsersMap.has(userId))
        musicsUsersMap.set(userId, new Map());

      musicsUsersMap.get(userId)!.set(musicId, mu);
    }

    // OPTIMIZACIÓN: Pre-mapear músicas UNA SOLA VEZ (evitar mapear N veces)
    const musicsParts = new Map<string, MusicDoc>();

    for (const music of musics) {
      const musicId = music._id.toString();

      musicsParts.set(musicId, this.mapMusicOdm(music));
    }

    // Procesar por lotes (chunks) para evitar RAM overflow por documentsForSearch
    const BATCH_SIZE = 1;

    await this.index.deleteAllDocuments();

    let total = 0;

    for (let i = 0; i < usersIds.length; i += BATCH_SIZE) {
      const usersBatch = usersIds.slice(i, i + BATCH_SIZE);
      const documentsForSearch: Doc[] = [];

      for (const userId of usersBatch) {
        const userMusicsMap = musicsUsersMap.get(userId);

        for (const music of musics) {
          const musicId = music._id.toString();
          const musicPart = musicsParts.get(musicId)!; // Ya mapeado
          const userMusic = userMusicsMap?.get(musicId);
          const doc = {
            id: genId( {
              userId,
              musicId,
            } ),
            ...musicPart,
            tags: [...musicPart.tags ?? [], ...userMusic?.tags ?? []],
            lastTimePlayedAt: userMusic?.lastTimePlayed ?? 0,
            userId,
            weight: userMusic?.weight ?? 0,
          };

          documentsForSearch.push(doc);
          total++;
        }
      }

      const task = await this.index.addDocuments(documentsForSearch);

      await waitForTask(this.meiliSearch, task.taskUid);
    }

    await this.index.updateSettings( {
      pagination: {
        maxTotalHits: MEILISEARCH_MUSICS_MAX_HITS, // Para que en el picker permita > 1000
        // TODO: cuando se haga para episodes, añadir algo como esto
      },
    } );

    this.logger.log(`Sincronizados ${total} documentos`);
  }

  async addOne(doc: Doc): Promise<void> {
    await this.index.addDocuments([doc]);
  }

  private async getUserIds(): Promise<string[]> {
    const usersIds = (await UserOdm.Model.find( {}, {
      _id: true,
    } )).map(u=>u._id.toString());

    return ["NONE", ...usersIds];
  }

  async updateMusic(musicDoc: MusicDoc): Promise<void> {
    const usersIds = await this.getUserIds();
    const docs = usersIds.map(_id=>{
      const userId = _id.toString();
      const id = genId( {
        musicId: musicDoc.musicId,
        userId,
      } );

      return {
        ...musicDoc,
        id,
        userId,
      } as Partial<Doc>;
    } );

    await this.index.updateDocuments(docs);
  }

  async updateUserInfo(
    userInfoDoc: UserInfoDoc,
  ): Promise<void> {
    const id = genId(userInfoDoc);
    const doc = {
      ...userInfoDoc,
      id,
    } satisfies Partial<Doc>;

    await this.index.updateDocuments([doc]);
  }

  async addMany(docs: Doc[]): Promise<void> {
    await this.index.addDocuments(docs);
  }

  private mapMusicOdm(m: MusicOdm.FullDoc): MusicDoc {
    return {
      musicId: m._id.toString(),
      title: m.title,
      artist: m.artist,
      game: m.game,
      country: m.country,
      addedAt: Math.floor(m.addedAt.getTime() / 1000),
      tags: m.tags ?? null,
      onlyTags: m.onlyTags ?? null,
    } satisfies MusicDoc;
  }

  private mapUserInfoOdm(m: MusicsUsersOdm.FullDoc): UserInfoDoc {
    return {
      musicId: m.musicId.toString(),
      userId: m.userId.toString(),
      lastTimePlayedAt: m.lastTimePlayed,
      weight: m.weight,
      tags: m.tags ?? null,
      onlyTags: null,
    } satisfies UserInfoDoc;
  }

  private mapMusicModel(m: MusicEntity): MusicDoc {
    return {
      musicId: m.id,
      title: m.title,
      artist: m.artist,
      game: m.game,
      country: m.country,
      addedAt: Math.floor(m.addedAt.getTime() / 1000),
      tags: m.tags ?? null,
      onlyTags: null,
    } satisfies MusicDoc;
  }

  private mapUserInfoModel(m: MusicUserInfoEntity): UserInfoDoc {
    return {
      userId: m.userId,
      musicId: m.id,
      lastTimePlayedAt: m.lastTimePlayed,
      weight: m.weight,
      tags: m.tags ?? null,
      onlyTags: null,
    } satisfies UserInfoDoc;
  }

  async initialize() {
    await this.index.updateSearchableAttributes([
      "title",
      "artist",
      "game",
      "album",
      "country",
    ]);

    await this.index.updateFilterableAttributes([
      "weight",
      "tags",
      "onlyTags",
      "addedAt",
      "lastTimePlayedAt",
      // internos:
      "musicId",
      "userId",
    ]);

    await this.index.updateSortableAttributes([
      "addedAt",
      "weight",
    ]);

    await this.index.updateSynonyms( {
      ...countries,
      ...generateSynonymsFromGroup("digimon adventure"),
      ...generateSynonymsFromGroup("digimon 02", "digimon adventure 02"),
      ...generateSynonymsFromGroup("digimon 3", "digimon tamers"),
      ...generateSynonymsFromGroup("digimon 4", "digimon frontier"),
      digi: ["digimon"],
      poke: ["pokemon"],
    } );

    await this.index.updateRankingRules([
      "words", // Número de palabras que coinciden
      "proximity", // Proximidad entre palabras de la query
      "exactness", // Exactitud de la coincidencia (no tiene en cuenta sinónimos)
      "weight:desc",
      "attribute", // Orden de los atributos searchable (title > artist...)
      "typo", // Tolerancia a errores tipográficos
      "sort", // Ordenación personalizada
    ]);
  }

  async search(
    userId: string | null,
    query: string,
    options?: SearchParams,
  ): Promise<SearchResponse<Doc, SearchParams>> {
    const filters: string[] = [];

    if (userId)
      filters.push(`userId = '${userId}'`);
    else
      filters.push("userId = 'NONE'");

    if (options?.filter) {
      if (Array.isArray(options.filter)) {
        const flatFilters = options.filter.flat();

        filters.push(...flatFilters.map(f => String(f)));
      } else if (typeof options.filter === "string")
        filters.push(options.filter);
    }

    const result = await this.index.search<Doc>(query, {
      ...options,
      filter: filters.length > 0 ? filters : undefined,
      matchingStrategy: "last",
    } );

    return result;
  }
}

type GenIdProps = {
  musicId: string;
  userId: string | null;
};
function genId( { musicId,
  userId }: GenIdProps) {
  return `${musicId}_${userId}`;
}
