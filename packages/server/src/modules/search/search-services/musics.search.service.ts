import { Injectable } from "@nestjs/common";
import { SearchParams } from "meilisearch";
import { MusicDocMeili, MusicsIndexService } from "../indexes/musics.service";

type SearchOptions = Pick<SearchParams, "limit" | "offset" | "showRankingScore" | "sort">;

type SearchRet = {
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
}
