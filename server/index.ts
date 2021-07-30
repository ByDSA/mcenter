import "module-alias/register";
import App, { loadEnv } from "./src/app";

loadEnv();

const settings = {
  port: +(process.env.PORT ?? 8081),
  host: process.env.HOST ?? "localhost",
};
const app = new App(settings);

app.run().then(() => {
  console.info(`Multimedia Center Server started on port: ${app.port}`);
} );

// mediaServer.run();
