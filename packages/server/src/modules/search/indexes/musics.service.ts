import { Injectable, Logger } from "@nestjs/common";
import { Index, MeiliSearch, SearchParams, SearchResponse } from "meilisearch";
import { OnEvent } from "@nestjs/event-emitter";
import { Music, MusicEntity } from "$shared/models/musics";
import { MusicOdm } from "#musics/crud/repository/odm";
import { MusicEvents } from "#musics/crud/repository/events";
import { DomainEvent, EntityEvent, PatchEvent } from "#core/domain-event-emitter";
import { assertFoundServer } from "#utils/validation/found";
import { countries, generateSynonymsFromGroup } from "./synonyms";

type Doc = {
  id: string;
  title: string;
  artist: string;
  game?: string;
  country?: string;
  addedAt: number;
  weight: number;
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
    let doc: Doc;

    if (ev.type === MusicEvents.Patched.TYPE) {
      const typedEv = ev as PatchEvent<Music>;
      const id = typedEv.payload.entityId;
      const docOdm = await MusicOdm.Model.findById(id);

      assertFoundServer(docOdm);

      doc = this.mapOdm(docOdm);
    } else if (ev.type === MusicEvents.Created.TYPE) {
      const typedEv = ev as EntityEvent<MusicEntity>;

      doc = this.mapModel(typedEv.payload.entity);
    } else
      throw new Error("Event type not handled: " + ev.type);

    await this.updateOne(doc);
  }

  async syncAll() {
    const musics = await MusicOdm.Model.find();
    const documentsForSearch = musics.map(this.mapOdm);

    await this.index.addDocuments(documentsForSearch);

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
      "title",
      "artist",
      "game",
      "country",
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
