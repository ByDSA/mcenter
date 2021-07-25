import { checkUser, compareHash, findUserByName, hash, UserInterface, UserModel } from ".";
import { TestingApp1 } from "../../../../tests/TestingApps";
import App from "../../../app";

describe("all tests", () => {
  describe("password", () => {
    it("compare hash function", () => {
      const actualPass = "12345";
      const actualHash = hash(actualPass);
      const comparation = compareHash(actualPass, actualHash);

      expect(comparation).toBeTruthy();
    } );
  } );

  describe("crud", () => {
    const app: App = new TestingApp1();

    beforeAll(async () => {
      await app.run();
    } );

    afterAll(async () => {
      await app.kill();
    } );

    it("add user", async () => {
      const expected: UserInterface = {
        name: "userNew",
        pass: "hashPass",
        role: "User",
      };
      const newUser = await new UserModel(expected);

      await newUser.save();

      const actual = await UserModel.findOne( {
        name: "userNew",
      } );

      checkUser(actual, expected);
    } );

    it("get users", async () => {
      const actual = await findUserByName("user1");
      const expected: UserInterface = {
        name: "user1",
        pass: "pass",
        role: "User",
      };

      checkUser(actual, expected);
    } );

    it("change pass", async () => {
      const user = await findUserByName("user2");

      if (!user)
        throw new Error();

      const newPass = "changedPass";

      user.pass = newPass;
      await user.save();

      const comparation = user.comparePassSync(newPass);

      expect(comparation).toBeTruthy();
    } );

    it("change updateAt on update", async () => {
      const user = await findUserByName("user2");

      if (!user)
        throw new Error();

      const oldUpdatedAt = user.updatedAt;

      user.name = "user22";
      await user.save();
      const newUpdatedAt = user.updatedAt;

      expect(oldUpdatedAt).not.toBe(newUpdatedAt);
    } );
  } );
} );
