/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/no-extraneous-dependencies
import request from "supertest";
import App from "../../../routes/app";
import { TestingApp1 } from "../../../routes/tests/TestingApps";

const app: App = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );
it("getRandom", async () => {
  await request(app.expressApp)
    .get("/api/get/random")
    .expect(200);
} );
