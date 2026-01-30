import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { getUniqueString } from "#modules/resources/get-unique-string";
import { SeriesRepository } from "./repository";

@Injectable()
export class SeriesAvailableSlugGeneratorService {
  constructor(
    @Inject(forwardRef(() => SeriesRepository))
    private readonly repo: SeriesRepository,
  ) {}

  async getAvailableKey(baseKey: string): Promise<string> {
    return await getUniqueString(
      baseKey,
      async (candidate) => {
        const serie = await this.repo.getOneByKey(candidate);

        return !serie;
      },
    );
  }
}
