import { EpisodeRepository } from "#modules/episodes";
import { HistoryListRepository, HistoryListService } from "#modules/historyLists";
import { PickerController } from "#modules/picker";
import { PlaySerieController, PlayService, PlayStreamController, VLCService } from "#modules/play";
import { SerieRepository } from "#modules/series";
import { StreamRepository, StreamService } from "#modules/streams";
import dotenv from "dotenv";
import { ExpressApp } from "./main";
import RealDatabase from "./main/db/Database";

(async function main() {
  dotenv.config();

  const streamRepository = new StreamRepository();
  const streamService = new StreamService();
  const historyListRepository = new HistoryListRepository();
  const serieRepository = new SerieRepository();
  const episodeRepository = new EpisodeRepository();
  const historyService = new HistoryListService( {
    episodeRepository,
    historyRepository: historyListRepository,
  } );
  const vlcService = new VLCService();
  const playService = new PlayService( {
    playerService: vlcService,
    historyListRepository,
    historyListService: historyService,
  } );
  const playSerieController = new PlaySerieController( {
    serieRepository,
    episodeRepository,
    playService,
  } );
  const playStreamController = new PlayStreamController( {
    playService,
    streamRepository,
    streamService,
  } );
  const app = new ExpressApp( {
    db: {
      instance: new RealDatabase(),
    },
    play: {
      playSerieController,
      playStreamController,
    },
    pickerController: new PickerController(),
  } );

  await app.init();
  app.listen();
} )();
