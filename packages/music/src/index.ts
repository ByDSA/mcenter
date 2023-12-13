import mediaServer from "./MediaServer";
import App from "./routes/app";

const app = new App();

app.run();

mediaServer.run();
