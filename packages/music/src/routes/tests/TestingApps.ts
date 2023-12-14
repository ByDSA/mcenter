/* eslint-disable import/prefer-default-export */
import { MusicController, MusicRepository } from "#modules/musics";
import FixController from "#modules/musics/controllers/FixController";
import GetController from "#modules/musics/controllers/GetController";
import { clearMock, initializeMock } from "../../modules/musics/repositories/tests/music.mock";
import App from "../app";

export class TestingApp1 extends App {
  #musicRepository: MusicRepository;

  constructor() {
    const musicRepository = new MusicRepository();
    const fixController = new FixController( {
      musicRepository,
    } );
    const getController = new GetController( {
      musicRepository,
    } );
    const musicController = new MusicController( {
      fixController,
      getController,
    } );

    super( {
      musicController,
    } );
    this.#musicRepository = musicRepository;
  }

  async run() {
    await super.run();

    await clearMock();
    await initializeMock();
  }

  async kill() {
    await clearMock();

    return super.kill();
  }

  getMusicRepository(): MusicRepository {
    return this.#musicRepository;
  }
}
