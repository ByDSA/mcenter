/* eslint-disable no-await-in-loop */
import { assertIsNotEmpty } from "#shared/utils/validation";
import { Episode } from "#modules/episodes";

type PlayParams = {
  force?: boolean;
  episodes: Episode[];
};
export default class PlayService {
  constructor() {
  }

  async play( {episodes, force}: PlayParams): Promise<boolean> {
    assertIsNotEmpty(episodes);

    throw new Error("Not implemented");
  }
}