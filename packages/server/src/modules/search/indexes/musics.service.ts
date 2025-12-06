import { Injectable, Logger, UnprocessableEntityException } from "@nestjs/common";
import { Index, MeiliSearch, SearchParams, SearchResponse } from "meilisearch";
import { OnEvent } from "@nestjs/event-emitter";
import { Music, MusicEntity, MusicUserInfoEntity } from "$shared/models/musics";
import { MusicPlaylistEntity } from "$shared/models/musics/playlists";
import { MusicOdm } from "#musics/crud/repositories/music/odm";
import { MusicEvents } from "#musics/crud/repositories/music/events";
import { DomainEvent, EntityEvent, PatchEvent } from "#core/domain-event-emitter";
import { assertFoundServer } from "#utils/validation/found";
import { UserOdm } from "#core/auth/users/crud/repository/odm";
import { MusicsUsersOdm } from "#musics/crud/repositories/user-info/odm";
import { MusicsUsersEvents } from "#musics/crud/repositories/user-info/events";
import { MusicPlaylistOdm } from "#musics/playlists/crud/repository/odm";
import { MusicPlayListTrackEvents } from "#musics/playlists/crud/repository/events/track";
import { MusicPlayListEvents } from "#musics/playlists/crud/repository/events/playlist";
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
};

type UserInfoDoc = {
  userId: string | null;
  musicId: string;
  lastTimePlayedAt: number;
  weight: number;
  tags: string[] | null;
  privatePlaylistSlugs: string[];
};
type Doc = MusicDoc & UserInfoDoc & {
  id: string;
};

export {
  Doc as MusicDocMeili,
};

type AddPrivatePlaylistProps = {
  musicId: string;
  userId: string;
  slug: string;
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

  @OnEvent(MusicPlayListTrackEvents.WILDCARD)
  async handleAddMusicToPlaylistEvents(ev: DomainEvent<unknown>) {
    if (ev.type === MusicPlayListTrackEvents.Added.TYPE) {
      const { playlist, trackListPosition } = ev.payload as MusicPlayListTrackEvents.Added.Event;

      if (playlist.visibility !== "private")
        return;

      await this.addPrivatePlaylist( {
        musicId: playlist.list[trackListPosition].musicId,
        slug: playlist.slug,
        userId: playlist.ownerUserId,
      } );
    } else if (ev.type === MusicPlayListTrackEvents.Deleted.TYPE) {
      const { oldPlaylist,
        newPlaylist,
        trackListPosition } = ev.payload as MusicPlayListTrackEvents.Deleted.Event;

      if (newPlaylist.visibility !== "private")
        return;

      await this.removePrivatePlaylist( {
        musicId: oldPlaylist.list[trackListPosition].musicId,
        slug: oldPlaylist.slug,
        userId: oldPlaylist.ownerUserId,
      } );
    }
  }

  @OnEvent(MusicPlayListEvents.Patched.TYPE)
  async handleChangePlaylist(ev: MusicPlayListEvents.Patched.Event) {
    if (ev.payload.key === "slug") {
      if (!ev.payload.oldEntity || !ev.payload.newEntity)
        throw new UnprocessableEntityException();

      const oldSlug = ev.payload.oldValue as string;
      const newSlug = ev.payload.value as string;
      const { newEntity, oldEntity } = ev.payload;

      for (const track of oldEntity.list) {
        await this.replacePrivatePlaylist( {
          musicId: track.musicId,
          oldSlug,
          slug: newSlug,
          userId: newEntity.ownerUserId,
        } );
      }
    } else if (ev.payload.key === "visibility") {
      const { newEntity } = ev.payload;

      if (!ev.payload.oldEntity || !newEntity)
        throw new UnprocessableEntityException();

      const oldVisibility = ev.payload.oldValue as MusicPlaylistEntity["visibility"];
      const newVisibility = ev.payload.value as MusicPlaylistEntity["visibility"];

      if (oldVisibility === newVisibility) // Por si acaso, aunque se supone que nunca pasa
        return;

      if (oldVisibility === "private" && newVisibility === "public") {
        for (const track of newEntity.list) {
          await this.removePrivatePlaylist( {
            musicId: track.musicId,
            slug: newEntity.slug,
            userId: newEntity.ownerUserId,
          } );
        }
      } else if (oldVisibility === "public" && newVisibility === "private") {
        for (const track of newEntity.list) {
          await this.addPrivatePlaylist( {
            musicId: track.musicId,
            slug: newEntity.slug,
            userId: newEntity.ownerUserId,
          } );
        }
      }
    }
  }

  async syncAll() {
    const musics = await MusicOdm.Model.find().lean(); // .lean() elimina overhead de Mongoose
    const musicsUsers = await MusicsUsersOdm.Model.find().lean();
    const privatePlaylists = await MusicPlaylistOdm.Model.find().lean();
    const usersIds: (string)[] = await this.getUserIds();
    const playlistsByUser = new Map<string, Map<string, string[]>>();

    for (const playlist of privatePlaylists) {
      const uId = playlist.userId.toString();

      // Si este usuario no está en el mapa, lo inicializamos
      if (!playlistsByUser.has(uId))
        playlistsByUser.set(uId, new Map());

      const userMusicsMap = playlistsByUser.get(uId)!;
      const { slug } = playlist;

      for (const item of playlist.list) {
        const mId = item.musicId.toString();

        if (!userMusicsMap.has(mId))
          userMusicsMap.set(mId, []);

        // Hacemos push del slug
        userMusicsMap.get(mId)!.push(slug);
      }
    }

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
    const EMPTY_SLUGS: string[] = [];

    for (let i = 0; i < usersIds.length; i += BATCH_SIZE) {
      const usersBatch = usersIds.slice(i, i + BATCH_SIZE);
      const documentsForSearch: Doc[] = [];

      for (const userId of usersBatch) {
        const userMusicsMap = musicsUsersMap.get(userId);
        const userPlaylistMap = playlistsByUser.get(userId);

        for (const music of musics) {
          const musicId = music._id.toString();
          const musicPart = musicsParts.get(musicId)!; // Ya mapeado
          const userMusic = userMusicsMap?.get(musicId);
          const privateSlugs = userPlaylistMap?.get(musicId) ?? EMPTY_SLUGS;
          const doc: Doc = {
            id: genId( {
              userId,
              musicId,
            } ),
            ...musicPart,
            tags: [...musicPart.tags ?? [], ...userMusic?.tags ?? []],
            lastTimePlayedAt: userMusic?.lastTimePlayed ?? 0,
            userId,
            weight: userMusic?.weight ?? 0,
            privatePlaylistSlugs: privateSlugs,
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

  async removePrivatePlaylist( { musicId, slug, userId }: AddPrivatePlaylistProps) {
    const id = genId( {
      musicId,
      userId,
    } );
    const doc = await this.index.getDocument<Doc>(id);
    const existingSlugs = doc?.privatePlaylistSlugs ?? [];
    const index = existingSlugs.indexOf(slug);

    if (index > -1)
      existingSlugs.splice(index, 1);

    const updateDoc = {
      id,
      userId,
      privatePlaylistSlugs: existingSlugs,
    } as Partial<Doc>;

    await this.index.updateDocuments([updateDoc]);
  }

  async addPrivatePlaylist( { musicId, slug, userId }: AddPrivatePlaylistProps) {
    const id = genId( {
      musicId,
      userId,
    } );
    const doc = await this.index.getDocument<Doc>(id);
    const existingSlugs = doc?.privatePlaylistSlugs ?? [];

    if (!existingSlugs.includes(slug))
      existingSlugs.push(slug);

    const updateDoc = {
      id,
      userId,
      privatePlaylistSlugs: existingSlugs,
    } as Partial<Doc>;

    await this.index.updateDocuments([updateDoc]);
  }

  async replacePrivatePlaylist( { musicId,
    slug,
    userId,
    oldSlug }: AddPrivatePlaylistProps & {oldSlug: string} ) {
    const id = genId( {
      musicId,
      userId,
    } );
    const doc = await this.index.getDocument<Doc>(id);
    const existingSlugs = doc?.privatePlaylistSlugs;

    if (!existingSlugs)
      return;

    const index = existingSlugs.indexOf(oldSlug);

    if (index === -1)
      return;

    existingSlugs[index] = slug;

    const updateDoc = {
      id,
      userId,
      privatePlaylistSlugs: existingSlugs,
    } as Partial<Doc>;

    await this.index.updateDocuments([updateDoc]);
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
    } satisfies MusicDoc;
  }

  private mapUserInfoOdm(m: MusicsUsersOdm.FullDoc): UserInfoDoc {
    return {
      musicId: m.musicId.toString(),
      userId: m.userId.toString(),
      lastTimePlayedAt: m.lastTimePlayed,
      weight: m.weight,
      tags: m.tags ?? null,
      privatePlaylistSlugs: [],
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
    } satisfies MusicDoc;
  }

  private mapUserInfoModel(m: MusicUserInfoEntity): UserInfoDoc {
    return {
      userId: m.userId,
      musicId: m.id,
      lastTimePlayedAt: m.lastTimePlayed,
      weight: m.weight,
      tags: m.tags ?? null,
      privatePlaylistSlugs: [],
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
      "addedAt",
      "lastTimePlayedAt",
      // internos:
      "musicId",
      "userId",
      "privatePlaylistSlugs",
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
