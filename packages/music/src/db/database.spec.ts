import { loadEnv } from "../env";
import { connect, disconnect } from "./database";

describe("connect", () => {
  it("connection", async () => {
    loadEnv();
    await connect();
    await disconnect();
  } );
} );
