import { checkHistory, findHistoryByNameAndUsername, HistoryInterface } from ".";
import { TestingApp1 } from "../../../../tests/TestingApps";
import App from "../../../app";
import { findUserByName } from "../user";

describe("no change db", () => {
  const app: App = new TestingApp1();

  beforeAll(async () => {
    await app.run();
  } );

  afterAll(async () => {
    await app.kill();
  } );
  it("findByName", async () => {
    const { history: actual } = await findHistoryByNameAndUsername( {
      username: "user1",
      name: "music",
    } );
    const expected: HistoryInterface = {
      name: "music",
      content: [],
    };

    checkHistory(actual, expected);
  } );
} );
describe("change db", () => {
  const app: App = new TestingApp1();

  beforeEach(async () => {
    await app.run();
  } );

  afterEach(async () => {
    await app.kill();
  } );

  it("create", async () => {
    const username = "user1";
    const name = "historyTest";
    const expected: HistoryInterface = {
      name,
      content: [],
    };
    let actualUser = await findUserByName(username);

    if (!actualUser || !actualUser.histories)
      throw new Error();

    actualUser.histories.push(expected);

    actualUser = await actualUser.save();

    if (!actualUser || !actualUser.histories)
      throw new Error();

    const [actual] = actualUser.histories.filter((h) => h.name === name);

    checkHistory(actual, expected);
  } );

  it("change updateAt on update", async () => {
    const username = "user1";
    const name = "music";

    async function getUpdatedAt() {
      const { history, user } = await findHistoryByNameAndUsername( {
        username,
        name,
      } );

      if (!user)
        throw new Error();

      if (!history)
        throw new Error();

      return {
        history,
        user,
        updatedAt: history?.updatedAt,
      };
    }

    const { updatedAt: oldUpdatedAt, history, user } = await getUpdatedAt();

    history.name = "newName";

    await user.save();

    const newUpdatedAt = user.updatedAt;

    expect(newUpdatedAt).toBeDefined();
    expect(oldUpdatedAt).not.toBe(newUpdatedAt);
  } );
} );
