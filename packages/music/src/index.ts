import { MusicController, MusicRepository } from "#modules/musics";
import FixController from "#modules/musics/controllers/FixController";
import GetController from "#modules/musics/controllers/GetController";
import mediaServer from "./MediaServer";
import App from "./routes/app";

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
const app = new App( {
  musicController,
} );

app.run();

mediaServer.run();
