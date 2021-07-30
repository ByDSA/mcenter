import { PORT } from "@app/routes/routes.config";
import "module-alias/register";
import mediaServer from "./src/actions/music/MediaServer";
import App from "./src/app";

const settings = {
  port: +PORT,
};
const app = new App(settings);

app.run();

mediaServer.run();
