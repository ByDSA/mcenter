import { PORT } from "@app/routes/routes.config";
import "module-alias/register";
import App from "./src/app";
import mediaServer from "./src/music/MediaServer";

const settings = {
  port: +PORT,
};
const app = new App(settings);

app.run();

mediaServer.run();
