import App from "./App";
import { getEnvs } from "./Envs";
import { PlayerService } from "./modules/player-service";
import { VLCProcessService } from "./modules/vlc";
import { VLCWebInterface } from "./modules/vlc/http-interface";
import { WebSocketsService } from "./modules/ws-client";

const app = new App();
const webSocketsService = new WebSocketsService( {
  playerService: new PlayerService( {
    playerWebInterfaceService: new VLCWebInterface( {
      port: getEnvs().VLC_HTTP_PORT,
      password: getEnvs().VLC_HTTP_PASSWORD,
      host: "localhost",
    } ),
    playerProcessService: new VLCProcessService(),
  } ),
} );

app.addDependencies( {
  webSocketsService,
} );
app.start();