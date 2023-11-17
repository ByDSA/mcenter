import { assertIsDefined } from "#shared/utils/validation";
import dotenv from "dotenv";
import { Server } from "http";
import ActionController from "#modules/actions/ActionController";
import EpisodesUpdateLastTimePlayedController from "#modules/actions/EpisodesUpdateLastTimePlayedController";
import FixerController from "#modules/actions/FixerController";
import { DomainMessageBroker } from "#modules/domain-message-broker";
import { EpisodeAddNewFileInfosController, EpisodeFileInfoRepository, EpisodePickerService, EpisodeRepository, EpisodeRestController, EpisodeUpdateFileInfoController, SavedSerieTreeService } from "#modules/episodes";
import LastTimePlayedService from "#modules/episodes/LastTimePlayedService";
import { HistoryEntryRepository, HistoryListRepository, HistoryListRestController, HistoryListService } from "#modules/historyLists";
import { PickerController } from "#modules/picker";
import { PlaySerieController, PlayService, PlayStreamController, RemotePlayerController } from "#modules/play";
import { RemoteFrontPlayerService, RemoteFrontPlayerWebSocketsServerService } from "#modules/play/remote-player";
import VlcBackServiceImp from "#modules/play/remote-player/service/VlcBackServiceImp";
import { SerieRelationshipWithStreamFixer, SerieRepository } from "#modules/series";
import { StreamRepository, StreamRestController } from "#modules/streams";
import { ExpressApp } from "./main";
import RealDatabase from "./main/db/Database";

(async function main() {
  dotenv.config();

  const domainMessageBroker = new DomainMessageBroker();

  DomainMessageBroker.setSingleton(domainMessageBroker);
  const streamRepository = new StreamRepository();
  const historyListRepository = new HistoryListRepository();
  const serieRelationshipWithStreamFixer = new SerieRelationshipWithStreamFixer( {
    streamRepository,
  } );
  const serieRepository = new SerieRepository( {
    relationshipWithStreamFixer: serieRelationshipWithStreamFixer,
  } );
  const episodeRepository = new EpisodeRepository( {
    domainMessageBroker,
  } );
  const historyListService = new HistoryListService( {
    episodeRepository,
    historyListRepository,
    historyEntryRepository: new HistoryEntryRepository(),
  } );
  const playService = new PlayService();
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
    domainMessageBroker,
  } );
  const playStreamController = new PlayStreamController( {
    playService,
    streamRepository,
    episodePickerService,
    historyListService,
  } );
  const remotePlayerService = genRemotePlayerService();
  const fixerController = new FixerController( {
    episodeRepository,
    serieRepository,
    streamRepository,
    serieRelationshipWithStreamFixer,
  } );
  const episodeFileInfoRepository = new EpisodeFileInfoRepository();
  const lastTimePlayedService = new LastTimePlayedService( {
    domainMessageBroker,
    episodeRepository,
  } );
  const app: ExpressApp = new ExpressApp( {
    db: {
      instance: new RealDatabase(),
    },
    modules: {
      domainMessageBroker: {
        instance: domainMessageBroker,
      },
      play: {
        playSerieController,
        playStreamController,
        remotePlayer:
        {
          controller: new RemotePlayerController( {
            remotePlayerService,
          } ),
          webSocketsService: new RemoteFrontPlayerWebSocketsServerService( {
            remoteFrontPlayerService: remotePlayerService,
            getHttpServer: () => app.httpServer as Server,
          } ),
        },
      },
      picker: {
        controller: new PickerController( {
          domainMessageBroker,
        } ),
      },
      actionController: new ActionController( {
        episodesUpdateLastTimePlayedController: new EpisodesUpdateLastTimePlayedController( {
          lastTimePlayedService,
          episodeRepository,
          historyListRepository,
          serieRepository,
          streamRepository,
        } ),
        episodesUpdateFileInfoController: new EpisodeUpdateFileInfoController( {
          savedSerieTreeService: new SavedSerieTreeService( {
            episodeRepository,
            serieRepository,
          } ),
          episodeFileRepository: episodeFileInfoRepository,
        } ),
        episodesAddNewFilesController: new EpisodeAddNewFileInfosController( {
          domainMessageBroker,
        } ),
        fixerController,
      } ),
      historyList: {
        restController: new HistoryListRestController( {
          historyListRepository,
          episodeRepository,
          serieRepository,
          lastTimePlayedService,
        } ),
      },
      streams: {
        restController: new StreamRestController( {
          streamRepository,
          serieRepository,
          historyListRepository,
        } ),
      },
      episodes: {
        restController: new EpisodeRestController( {
          episodeRepository,
          serieRepo: serieRepository,
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

  const vlcBackService = new VlcBackServiceImp();
  const service = new RemoteFrontPlayerService( {
    vlcBackService,
  } );

  return service;
}