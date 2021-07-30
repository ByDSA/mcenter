import { loadEnv } from "@app/env";
import { connect, disconnect } from "./database";

describe("connect", () => {
  it("connection", async () => {
    loadEnv();
    await connect();
    await disconnect();
  } );
} );
