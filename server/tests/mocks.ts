/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { createMusicFromPath, deleteAllMusics } from "../src/db/models/music";
import { deleteAllUsers, UserInterface, UserModel } from "../src/db/models/user";
import { createVideoFromPath, deleteAllVideos } from "../src/db/models/video";

export interface Mock {
  initialize(): Promise<any[]>;
  clear(): Promise<void>;
}

export class MusicMock1 implements Mock {
  async initialize() {
    await this.clear();

    return Promise.all([
      createMusicFromPath("dk.mp3").then((u) => u.save()),
    ]);
  }

  async clear() {
    await deleteAllMusics();
  }
}

export class VideoMock1 implements Mock {
  async initialize() {
    await this.clear();

    return Promise.all([
      createVideoFromPath("sample1.mp4").then((u) => u.save()),
    ]);
  }

  async clear() {
    await deleteAllVideos();
  }
}

export class UserMock1 implements Mock {
  async initialize() {
    await this.clear();

    const users: UserInterface[] = [{
      name: "user1",
      role: "User",
      pass: "pass",
    },
    {
      name: "user2",
      role: "Admin",
      pass: "pass2",
    },
    {
      name: "user3",
      role: "Admin",
      pass: "pass",
    }];
    const promises = [];

    for (const uObj of users)
      promises.push(UserModel.create(uObj).then((u) => u.save()));

    return Promise.all(promises);
  }

  async clear() {
    await deleteAllUsers();
  }
}
