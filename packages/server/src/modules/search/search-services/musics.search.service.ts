import { Injectable } from "@nestjs/common";
import { SearchParams } from "meilisearch";
import { MEILISEARCH_MUSICS_MAX_HITS, MusicDocMeili, MusicsIndexService } from "../indexes/musics.service";

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
    const { hits, estimatedTotalHits } = await this.musicsIndexService.search("", {
      ...options,
      filter: queryFilter,
      limit: (options?.limit ?? 0) === 0 ? MEILISEARCH_MUSICS_MAX_HITS : options?.limit,
    } );

    return {
      data: hits,
      total: estimatedTotalHits,
    };
  }
}
