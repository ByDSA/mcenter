/* eslint-disable import/no-cycle */
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { MusicQueriesRepository } from "./repository";

type Props = {
  slug: string;
  userId: string;
};

@Injectable()
export class MusicQueryAvailableSlugGeneratorService {
  constructor(
    @Inject(forwardRef(() => MusicQueriesRepository))
    private readonly repo: MusicQueriesRepository,
  ) {}

  async getAvailable( { slug: base, userId }: Props): Promise<string> {
    let currentSlug = base;
    let i = 1;

    while (true) {
      const query = await this.repo.getOneBySlug( {
        slug: currentSlug,
        ownerUserId: userId,
      } );

      if (!query)
        return currentSlug;

      i++;
      currentSlug = `${base}-${i}`;
    }
  }
}
