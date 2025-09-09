import { Injectable, Logger } from "@nestjs/common";
import { Index, MeiliSearch, SearchParams, SearchResponse } from "meilisearch";
import { OnEvent } from "@nestjs/event-emitter";
import { Music, MusicEntity } from "$shared/models/musics";
import { MusicOdm } from "#musics/crud/repository/odm";
import { MusicEvents } from "#musics/crud/repository/events";
import { DomainEvent, EntityEvent, PatchEvent } from "#core/domain-event-emitter";
import { assertFoundServer } from "#utils/validation/found";
import { countries, generateSynonymsFromGroup } from "./synonyms";
import { waitForTask } from "./utils";

type Doc = {
  id: string;
  title: string;
  artist: string;
  game?: string;
  country?: string;
  addedAt: number;
  lastTimePlayedAt: number;
  weight: number;
  tags: string[] | null;
  onlyTags: string[] | null;
};

export {
  Doc as MusicDocMeili,
};

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
  async handleEvents(ev: DomainEvent<unknown>) {
    if (ev.type === MusicEvents.Patched.TYPE) {
      const typedEv = ev as PatchEvent<Music>;
      const id = typedEv.payload.entityId;
      const docOdm = await MusicOdm.Model.findById(id);

      assertFoundServer(docOdm);

      let doc: Doc = this.mapOdm(docOdm);

      await this.updateOne(doc);
    } else if (ev.type === MusicEvents.Created.TYPE) {
      const typedEv = ev as EntityEvent<MusicEntity>;
      let doc: Doc = this.mapModel(typedEv.payload.entity);

      await this.updateOne(doc);
    } else if (ev.type === MusicEvents.Deleted.TYPE) {
      const typedEv = ev as EntityEvent<{ id: string }>;

      await this.index.deleteDocument(typedEv.payload.entity.id);
    } else
      throw new Error("Event type not handled: " + ev.type);
  }

  async syncAll() {
    const musics = await MusicOdm.Model.find();
    const documentsForSearch = musics.map(this.mapOdm);

    await this.index.deleteAllDocuments();
    const task = await this.index.addDocuments(documentsForSearch);

    await waitForTask(this.meiliSearch, task.taskUid);

    this.logger.log(`Sincronizados ${documentsForSearch.length} documentos`);
  }

  async addOne(doc: Doc): Promise<void> {
    await this.index.addDocuments([doc]);
  }

  async updateOne(doc: Doc): Promise<void> {
    await this.index.updateDocuments([doc]);
  }

  async addMany(docs: Doc[]): Promise<void> {
    await this.index.addDocuments(docs);
  }

  private mapOdm(m: MusicOdm.FullDoc): Doc {
    return {
      id: m._id.toString(),
      title: m.title,
      artist: m.artist,
      game: m.game,
      country: m.country,
      addedAt: Math.floor(m.timestamps.addedAt.getTime() / 1000),
      weight: m.weight,
      lastTimePlayedAt: m.lastTimePlayed ?? 0,
      tags: m.tags ?? null,
      onlyTags: m.onlyTags ?? null,
    } satisfies Doc;
  }

  private mapModel(m: MusicEntity): Doc {
    return {
      id: m.id,
      title: m.title,
      artist: m.artist,
      game: m.game,
      country: m.country,
      addedAt: Math.floor(m.timestamps.addedAt.getTime() / 1000),
      weight: m.weight,
      lastTimePlayedAt: m.lastTimePlayed ?? 0,
      tags: m.tags ?? null,
      onlyTags: null,
    } satisfies Doc;
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
    query: string,
    options?: SearchParams,
  ): Promise<SearchResponse<Doc, SearchParams>> {
    const result = await this.index.search<Doc>(query, {
      ...options,
      matchingStrategy: "last",
    } );

    return result;
  }
}
