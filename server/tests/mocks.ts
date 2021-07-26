/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { createMusicFromPath, deleteAllMusics } from "../src/db/models/music";
import { createSerieFromPath, deleteAllSeries } from "../src/db/models/serie";
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
      createMusicFromPath("dk.mp3")
        .then((u) => {
          if (u)
            return u.save();

          return null;
        } ),
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
      createVideoFromPath("sample1.mp4")
        .then((u) => {
          if (u)
            return u.save();

          return null;
        } ),
    ]);
  }

  async clear() {
    await deleteAllVideos();
  }
}

export class SerieMock1 implements Mock {
  async initialize() {
    await this.clear();

    return Promise.all([
      createSerieFromPath("serie 1")
        .then((u) => {
          if (u)
            return u.save();

          return null;
        } ),
    ]);
  }

  async clear() {
    await deleteAllSeries();
  }
}

export class UserMock1 implements Mock {
  async initialize() {
    await this.clear();

    const users: UserInterface[] = [{
      name: "user1",
      role: "User",
      pass: "pass",
      histories: [
        {
          name: "music",
          typeResource: "Music",
          content: [],
        },
      ],
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
      promises.push(new UserModel(uObj).save());

    return Promise.all(promises);
  }

  async clear() {
    await deleteAllUsers();
  }
}
