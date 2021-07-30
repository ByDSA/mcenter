import { loadEnv } from "@actions/utils/env";
import { connect, disconnect } from ".";

describe("connect", () => {
  it("connection", async () => {
    loadEnv();
    await connect();
    await disconnect();
  } );
} );
