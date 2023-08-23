import { EpisodeRepository } from "#modules/episodes";
import { HistoryListRepository, HistoryListService } from "#modules/historyLists";
import { PlaySerieController, PlayService, PlayStreamController, VLCService } from "#modules/play";
import { SerieWithEpisodesRepository } from "#modules/seriesWithEpisodes";
import { StreamWithHistoryListRepository, StreamWithHistoryListService } from "#modules/streamsWithHistoryList";
import dotenv from "dotenv";
import showPickerFunc from "./actions/showPicker";
import { ExpressApp } from "./main";
import RealDatabase from "./main/db/Database";

(async function main() {
  dotenv.config();

  const streamWithHistoryListRepository = new StreamWithHistoryListRepository();
  const streamWithHistoryListService = new StreamWithHistoryListService();
  const historyListRepository = new HistoryListRepository();
  const serieWithEpisodesRepository = new SerieWithEpisodesRepository();
  const episodeRepository = new EpisodeRepository( {
    serieWithEpisodesRepository,
  } );
  const historyService = new HistoryListService( {
    episodeRepository,
    historyRepository: historyListRepository,
  } );
  const vlcService = new VLCService();
  const playService = new PlayService( {
    vlcService,
    streamWithHistoryListRepository,
    historyListService: historyService,
  } );
  const playSerieController = new PlaySerieController( {
    serieRepository: serieWithEpisodesRepository,
    playService,
  } );
  const playStreamController = new PlayStreamController( {
    playService,
    streamWithHistoryListRepository,
    serieWithEpisodesRepository,
    streamWithHistoryListService,
  } );
  const app = new ExpressApp( {
    db: {
      instance: new RealDatabase(),
    },
    play: {
      playSerieController,
      playStreamController,
    },
    showPickerFunc,
  } );

  await app.init();
  app.listen();
} )();
