import { Injectable } from "@nestjs/common";
import { SearchParams } from "meilisearch";
import { MusicDocMeili, MusicsIndexService } from "../indexes/musics.service";

type SearchOptions = Pick<SearchParams, "limit" | "offset" | "showRankingScore" | "sort">;

export type SearchRet = {
  data: MusicDocMeili[];
  total: number;
};

@Injectable()
export class MusicsSearchService {
  constructor(
    private readonly musicsIndexService: MusicsIndexService,
  ) {
  }

  async search(query: string, options?: SearchOptions): Promise<SearchRet> {
    const { hits: docs, estimatedTotalHits } = await this.musicsIndexService.search(query, options);

    return {
      data: docs.map(d=>d),
      total: estimatedTotalHits,
    };
  }

  async filter(
    queryFilter: string,
    options?: Omit<SearchOptions, "filter" | "offset">,
  ): Promise<SearchRet> {
    let data: MusicDocMeili[] = [];
    let total = 0;

    // limit = 0 → traer todo
    if (options?.limit === 0) {
      let offset = 0;
      const limit = 1000;

      while (true) {
        const { hits, estimatedTotalHits } = await this.musicsIndexService.search("", {
          ...options,
          filter: queryFilter,
          limit,
          offset,
        } );

        if (offset === 0)
          total = estimatedTotalHits;

        if (hits.length === 0)
          break;

        data.push(...hits);
        offset += limit;
      }

      return {
        data,
        total,
      };
    }

    const { hits, estimatedTotalHits } = await this.musicsIndexService.search("", {
      ...options,
      filter: queryFilter,
    } );

    data = hits;
    total = estimatedTotalHits;

    return {
      data,
      total,
    };
  }
}
