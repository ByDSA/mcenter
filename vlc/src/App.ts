import WebSocketsService from "./play/WebSocketsService";

type Params = {
  webSocketsService: WebSocketsService;
};
export default class App {
  #webSocketsService: WebSocketsService;

  constructor( {webSocketsService}: Params) {
    this.#webSocketsService = webSocketsService;
  }

  start() {
    setTimeout(this.#webSocketsService.startSocket.bind(this.#webSocketsService), 0); // Porque sino intenta acceder síncronamente a 'app.httpServer' antes de que se haya creado
  }
}