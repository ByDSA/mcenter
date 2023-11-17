import express from "express";
import App from "./App";
import WebSocketsService from "./play/WebSocketsService";

const expressApp = express();
const httpServer = expressApp.listen(3000, () => {
  console.log("Listening on port 3000");
} );
const webSocketsService = new WebSocketsService( {
  getHttpServer: () => httpServer,
} );
const app = new App( {
  webSocketsService,
} );

app.start();