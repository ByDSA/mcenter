import { connect, disconnect } from "./database";

describe("connect", () => {
  it("connection", async () => {
    await connect();
    await disconnect();
  } );
} );
