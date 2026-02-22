import { Injectable } from "@nestjs/common";
import { MusicEntity, MusicEntityWithUserInfo } from "#musics/models";
import { MusicHistoryRepository } from "../history/crud/repository";
import { MusicsRepository } from "../crud/repositories/music";
import { queryToExpressionNode } from "../crud/repositories/music/queries/queries";
import { MusicFilterApplier, MusicWeightFixerApplier } from "./model";
import { MusicPickerRandom } from "./model/music-picker";

type Entity = MusicEntity;
type Params = {
  query: string | null;
  userId: string | null;
};

@Injectable()
export class MusicGetRandomService {
  constructor(
    private readonly musicHistoryRepo: MusicHistoryRepository,
    private readonly musicRepo: MusicsRepository,
  ) { }

  async getRandom( { query, userId }: Params): Promise<MusicEntity | null> {
    const musics = await this.findMusics(userId, query);

    if (musics.length === 0)
      return null;

    const picked = await this.randomPick(userId, musics);

    if (!picked)
      return null;

    if (!userId && picked.userInfo) {
      const { userInfo, ...pickedWithoutUserInfo } = picked;

      return pickedWithoutUserInfo;
    }

    return picked;
  }

  private async getLastMusicIdInHistory(userId: string | null): Promise<string | null> {
    if (userId === null)
      return null;

    const lastOneEntry = await this.musicHistoryRepo.getLast(userId);

    if (!lastOneEntry)
      return null;

    return lastOneEntry.resourceId;
  }

  private async randomPick(
    userId: string | null,
    musics: Entity[],
    n: number = 1,
  ): Promise<Entity | null> {
    const lastId = await this.getLastMusicIdInHistory(userId);
    const picker = new MusicPickerRandom( {
      resources: musics,
      lastId,
      filterApplier: new MusicFilterApplier( {
        resources: musics,
        lastId,
      } ),
      weightFixerApplier: new MusicWeightFixerApplier(),
    } );
    let [picked] = await picker.pick(n);

    if (!picked)
      return null;

    return picked;
  }

  private async findMusics(
    userId: string | null,
    query: string | null,
  ): Promise<MusicEntityWithUserInfo[]> {
    let musics: MusicEntityWithUserInfo[];

    if (!query) {
      musics = await this.musicRepo.getAll( {
        criteria: {
          expand: ["userInfo"],
        },
        requestingUserId: userId ?? undefined,
      } ) as MusicEntityWithUserInfo[];
    } else {
      const params = queryToExpressionNode(query);

      musics = await this.musicRepo.getManyByQuery(params, {
        criteria: {
          expand: ["userInfo"],
        },
        requestingUserId: userId ?? undefined,
      } ) as MusicEntityWithUserInfo[];
    }

    return musics.filter((m) => !m.offloaded);
  }
}
