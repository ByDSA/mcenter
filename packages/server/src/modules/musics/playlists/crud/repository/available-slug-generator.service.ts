/* eslint-disable import/no-cycle */
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { MusicPlaylistEntity } from "../../models";
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
    let currentSlug = base;
    let playlist: MusicPlaylistEntity | null;
    let i = 1;

    while (true) {
      playlist = await this.repo.getOneBySlug( {
        slug: currentSlug,
        userId,
      } );

      if (!playlist)
        return currentSlug;

      i++;
      currentSlug = `${base}-${i}`;
    }
  }
}
