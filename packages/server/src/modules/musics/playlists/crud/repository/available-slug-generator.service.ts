/* eslint-disable import/no-cycle */
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { getUniqueString } from "#modules/resources/get-unique-string";
import { MusicPlaylistsRepository } from "./repository";

type Props = {
  slug: string;
  userId: string;
};
@Injectable()
export class MusicPlaylistAvailableSlugGeneratorService {
  constructor(
    @Inject(forwardRef(()=>MusicPlaylistsRepository))
    private readonly repo: MusicPlaylistsRepository,
  ) {
  }

  async getAvailable( { slug: base,
    userId }: Props): Promise<string> {
    return await getUniqueString(
      base,
      async (candidate) => {
        const playlist = await this.repo.getOneBySlug( {
          playlistSlug: candidate,
          ownerUserId: userId,
          requestUserId: userId,
        } );

        return !playlist;
      },
      // No maxLength explícito en el original, pero se puede añadir si es necesario
    );
  }
}
