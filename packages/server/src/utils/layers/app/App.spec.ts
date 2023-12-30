import { getPortFromServer } from "#shared/utils/nodejs/http";
import { assertIsNotEmpty } from "#shared/utils/validation";
import request from "supertest";
import App from "./App";

describe("App", () => {
  describe("Sin parámetros", () => {
    it("Se crea sin ningún error", () => {
      const app = App.create();

      expect(app).toBeTruthy();
    } );

    describe("una vez creado", () => {
      let app: App;

      beforeAll(() => {
        app = App.create();
      } );
      it("request a /", async () => {
        await request(app.getExpressApp())
          .get("/")
          .expect(200)
          .expect("El servicio está en funcionamiento");
      } );

      describe("Exposición del servidor", () => {
        beforeAll(() => {
          app.run();
        } );

        it("el servidor se ha añadido a la lista de servidores de la app", () => {
          const servers = app.getServers();

          assertIsNotEmpty(servers);
        } );

        it("tiene un puerto asignado el servidor", () => {
          const servers = app.getServers();

          assertIsNotEmpty(servers);

          const port = getPortFromServer(servers[0]);

          expect(port).not.toBe(0);
        } );

        it("se cierra el servidor sin ningún error", () => {
          app.close();
        } );

        afterAll(() => {
          app.close();
        } );
      } );
    } );
  } );
} );