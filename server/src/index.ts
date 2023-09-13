import ActionController from "#modules/actions/ActionController";
import EpisodesUpdateLastTimePlayedController from "#modules/actions/EpisodesUpdateLastTimePlayedController";
import { EpisodePickerService, EpisodeRepository, EpisodeRestController } from "#modules/episodes";
import LastTimePlayedService from "#modules/episodes/LastTimePlayedService";
import { HistoryEntryRepository, HistoryListRepository, HistoryListRestController, HistoryListService } from "#modules/historyLists";
import { PickerController } from "#modules/picker";
import { PlaySerieController, PlayService, PlayStreamController, RemotePlayerController, VLCService } from "#modules/play";
import { RemotePlayerService, RemotePlayerWebSocketsService } from "#modules/play/remote-player";
import { VLCWebInterface } from "#modules/play/remote-player/web-interface";
import { SerieRepository } from "#modules/series";
import { StreamRepository } from "#modules/streams";
import { assertIsDefined } from "#shared/utils/validation";
import dotenv from "dotenv";
import { Server } from "http";
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
  const remotePlayerService = genRemotePlayerService();
  const app: ExpressApp = new ExpressApp( {
    db: {
      instance: new RealDatabase(),
    },
    modules: {
      play: {
        playSerieController,
        playStreamController,
        remotePlayer:
        {
          controller: new RemotePlayerController( {
            remotePlayerService,
          } ),
          webSocketsService: new RemotePlayerWebSocketsService( {
            remotePlayerService,
            getHttpServer: () => app.httpServer as Server,
          } ),
        },
      },
      picker: {
        controller: new PickerController(),
      },
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
          episodeRepository,
          serieRepository,
        } ),
      },
      episodes: {
        restController: new EpisodeRestController( {
          episodeRepository,
        } ),
      },
    },
    controllers: {
      cors: true,
    },
  } );

  await app.init();
  app.listen();
} )();

function genRemotePlayerService() {
  const password = process.env.VLC_HTTP_PASSWORD;
  const port = +(process.env.VLC_HTTP_PORT ?? -1);

  assertIsDefined(password, "VLC_HTTP_PASSWORD");

  if (port === -1)
    throw new Error("VLC_HTTP_PORT is not defined");

  const webInterface = new VLCWebInterface( {
    password,
    port,
  } );
  const service = new RemotePlayerService( {
    webInterface,
  } );

  return service;
}