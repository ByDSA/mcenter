import App from "@app/app";
import { TestingApp1 } from "@tests/TestingApps";
import { checkUser, compareHash, findUserByName, getGroupInUserById, getGroupInUserByName, getGroupInUserByUrl, hash, UserInterface, UserModel } from ".";
import { checkGroup, GroupInterface } from "../resources/group";
import { findMusicByUrl, MusicInterface } from "../resources/music";
import { MusicTypeStr } from "../resources/types";

describe("all tests", () => {
  describe("mock", () => {
    const app: App = new TestingApp1();

    beforeAll(async () => {
      await app.run();
    } );

    afterAll(async () => {
      await app.kill();
    } );
    it("group-1", async () => {
      const userPromise = findUserByName("user1");
      const musicPromise = findMusicByUrl("dk");
      const user = <UserInterface> await userPromise;

      expect(user).toBeDefined();

      const actual = getGroupInUserByUrl( {
        user,
        url: "group-1",
      } );
      const music = <MusicInterface> await musicPromise;

      expect(music).not.toBeNull();
      const expected: GroupInterface = {
        name: "group 1",
        url: "group-1",
        type: "fixed",
        visibility: "public",
        content: [
          {
            id: music._id,
            type: MusicTypeStr,
          },
        ],
      };

      checkGroup(actual, expected);
    } );
  } );
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

    it("create", async () => {
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

    it("findByName", async () => {
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

  describe("getInGroup", () => {
    let user: UserInterface;
    let expected: GroupInterface;
    const app: App = new TestingApp1();

    beforeAll(async () => {
      await app.run();
      user = <UserInterface> await findUserByName("user1");
      // eslint-disable-next-line prefer-destructuring
      expected = (<GroupInterface[]>user.groups)[0];
    } );

    afterAll(async () => {
      await app.kill();
    } );

    it("getGroupById", async () => {
      const actual = await getGroupInUserById( {
        id: expected._id,
        user,
      } );

      checkGroup(actual, expected);
    } );

    it("getGroupByName", async () => {
      const actual = await getGroupInUserByName( {
        name: expected.name,
        user,
      } );

      checkGroup(actual, expected);
    } );
    it("getGroupByUrl", async () => {
      const actual = await getGroupInUserByUrl( {
        url: expected.url,
        user,
      } );

      checkGroup(actual, expected);
    } );
  } );
} );
