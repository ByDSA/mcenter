import App from "./src/app";
import mediaServer from "./src/music/MediaServer";

const app = new App();

app.run();

mediaServer.run();
