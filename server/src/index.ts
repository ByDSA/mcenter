import ActionController from "#modules/actions/ActionController";
import EpisodesUpdateLastTimePlayedController from "#modules/actions/EpisodesUpdateLastTimePlayedController";
import { EpisodePickerService, EpisodeRepository } from "#modules/episodes";
import LastTimePlayedService from "#modules/episodes/LastTimePlayedService";
import { HistoryEntryRepository, HistoryListRepository, HistoryListRestController, HistoryListService } from "#modules/historyLists";
import { PickerController } from "#modules/picker";
import { PlaySerieController, PlayService, PlayStreamController, VLCService } from "#modules/play";
import { SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams";
import dotenv from "dotenv";
import { ExpressApp } from "./main";
import RealDatabase from "./main/db/Database";

(async function main() {
  dotenv.config();

  const streamRepository = new StreamRepository();
  const historyListRepository = new HistoryListRepository();
  const serieRepository = new SerieRepository();
  const episodeRepository = new EpisodeRepository();
  const historyListService = new HistoryListService( {
    episodeRepository,
    historyListRepository,
    historyEntryRepository: new HistoryEntryRepository(),
  } );
  const vlcService = new VLCService();
  const playService = new PlayService( {
    playerService: vlcService,
  } );
  const playSerieController = new PlaySerieController( {
    serieRepository,
    episodeRepository,
    playService,
    historyListService,
  } );
  const episodePickerService = new EpisodePickerService( {
    episodeRepository,
    historyListRepository,
    serieRepository,
    streamRepository,
  } );
  const playStreamController = new PlayStreamController( {
    playService,
    streamRepository,
    episodePickerService,
    historyListService,
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
    actionController: new ActionController( {
      episodesUpdateLastTimePlayedController: new EpisodesUpdateLastTimePlayedController( {
        lastTimePlayedService: new LastTimePlayedService(),
        episodeRepository,
        historyListRepository,
        serieRepository,
        streamRepository,
      } ),
    } ),
    historyList: {
      restController: new HistoryListRestController( {
        historyListRepository,
      } ),
    },
  } );

  await app.init();
  app.listen();
} )();
