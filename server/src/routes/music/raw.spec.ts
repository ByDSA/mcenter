// eslint-disable-next-line import/no-extraneous-dependencies
import request from "supertest";
import { TestingApp1 } from "../../../tests/TestingApps";
import App from "../../app";

const app: App = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );

it("raw not found", async () => {
  await request(app.expressApp)
    .get("/api/music/raw/notfound")
    .expect(404);
} );

it("found", async () => {
  await request(app.expressApp)
    .get("/api/music/raw/dk")
    .expect(200);
} );
