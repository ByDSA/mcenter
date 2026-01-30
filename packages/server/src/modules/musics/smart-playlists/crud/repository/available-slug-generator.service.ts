/* eslint-disable import/no-cycle */
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { getUniqueString } from "#modules/resources/get-unique-string";
import { MusicSmartPlaylistRepository } from "./repository";

type Props = {
  slug: string;
  userId: string;
};

@Injectable()
export class MusicSmartPlaylistAvailableSlugGeneratorService {
  constructor(
    @Inject(forwardRef(() => MusicSmartPlaylistRepository))
    private readonly repo: MusicSmartPlaylistRepository,
  ) {}

  async getAvailable( { slug: base, userId }: Props): Promise<string> {
    return await getUniqueString(
      base,
      async (candidate) => {
        const query = await this.repo.getOneBySlug( {
          slug: candidate,
          ownerUserId: userId,
        } );

        return !query;
      },
    );
  }
}
