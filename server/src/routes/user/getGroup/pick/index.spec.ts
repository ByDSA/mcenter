/* eslint-disable import/no-extraneous-dependencies */
import App from "@app/app";
import { TestingApp1 } from "@tests/TestingApps";
import request from "supertest";

const app: App = new TestingApp1();

beforeAll(async () => {
  await app.run();
} );

afterAll(async () => {
  await app.kill();
} );

it("not found", async () => {
  await request(app.expressApp)
    .get("/api/user/get/user1/group/notfound?pick=1&mode=seq")
    .expect(404);
} );

it("no mode, bad request", async () => {
  await request(app.expressApp)
    .get("/api/user/get/user1/group/group-1?pick=1")
    .expect(400);
} );

it("mode rand ok", async () => {
  await request(app.expressApp)
    .get("/api/user/get/user1/group/group-1?pick=1&mode=rand")
    .expect(200);
} );

it("mode rand raw ok", async () => {
  await request(app.expressApp)
    .get("/api/user/get/user1/group/group-1?pick=1&mode=rand&raw=1")
    .expect(200);
} );

it("mode seq ok", async () => {
  await request(app.expressApp)
    .get("/api/user/get/user1/group/group-1?pick=1&mode=seq")
    .expect(200);
} );

it("mode seq raw ok", async () => {
  await request(app.expressApp)
    .get("/api/user/get/user1/group/group-1?pick=1&mode=seq&raw=1")
    .expect(200);
} );
