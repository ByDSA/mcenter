import { getPortFromServer } from "#shared/utils/nodejs/http";
import request from "supertest";
import { App } from "./App";

describe("app", () => {
  describe("sin parámetros", () => {
    it("se crea sin ningún error", () => {
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

      describe("exposición del servidor", () => {
        beforeAll(() => {
          app.run();
        } );

        it("el servidor se ha añadido a la lista de servidores de la app", () => {
          const servers = app.getServers();

          expect(servers).not.toHaveLength(0);
        } );

        it("tiene un puerto asignado el servidor", () => {
          const servers = app.getServers();

          expect(servers).not.toHaveLength(0);

          const port = getPortFromServer(servers[0]);

          expect(port).not.toBe(0);
        } );

        it("se cierra el servidor sin ningún error", () => {
          expect(app.getServers()).not.toHaveLength(0);

          app.close();

          expect(app.getServers()).toHaveLength(0);
        } );

        afterAll(() => {
          app.close();
        } );
      } );
    } );
  } );
} );
