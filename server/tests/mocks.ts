/* eslint-disable no-underscore-dangle */
/* eslint-disable max-classes-per-file */
/* eslint-disable class-methods-use-this */
import { VideoTypeStr } from "@app/db/models/resources/types";
import { strict as assert } from "assert";
import { Schema } from "mongoose";
import { deleteAllGroups, Group, GroupInterface, GroupModel } from "../src/db/models/resources/group";
import { createMusicFromPath, deleteAllMusics, findMusicByUrl } from "../src/db/models/resources/music";
import { createSerieFromPath, deleteAllSeries, findSerieByUrl } from "../src/db/models/resources/serie";
import { createVideoFromPath, deleteAllVideos, findVideoByUrl } from "../src/db/models/resources/video";
import { deleteAllUsers, User, UserInterface, UserModel } from "../src/db/models/user";

export interface Mock {
  initialize(): Promise<any[]>;
  clear(): Promise<void>;
}

export class MusicMock1 implements Mock {
  async initialize() {
    await this.clear();

    const m1 = await createMusicFromPath("dk.mp3");

    m1?.save();

    return [m1];
  }

  async clear() {
    await deleteAllMusics();
  }
}

export class VideoMock1 implements Mock {
  async initialize() {
    await this.clear();

    return [createVideoFromPath("sample1.mp4")
      .then((u) => {
        if (u)
          return u.save();

        return null;
      } )];
  }

  async clear() {
    await deleteAllVideos();
  }
}

export class SerieMock1 implements Mock {
  async initialize() {
    await this.clear();

    const serie1 = await createSerieFromPath("serie 1");

    assert.notEqual(serie1, null);

    if (serie1)
      serie1.save();

    return [serie1];
  }

  async clear() {
    await deleteAllSeries();
  }
}

export class UserMock1 implements Mock {
  async initialize() {
    await this.clear();

    const m1 = await findMusicByUrl("dk");
    const m1Id = m1?._id;
    const s1 = await findSerieByUrl("serie-1");
    const serieId: Schema.Types.ObjectId = s1?._id;
    const s1Ep1Id: Schema.Types.ObjectId = s1?.episodes[0]._id;

    assert.notEqual(m1Id, null);
    assert.notEqual(serieId, null);
    assert.notEqual(s1Ep1Id, null);
    const g1 = new GroupModel( {
      visibility: "public",
      type: "fixed",
      url: "group-1",
      name: "group 1",
      content: [
        {
          type: "music",
          id: m1Id,
        },
      ],
    } );
    const groupSerie1 = new GroupModel( {
      visibility: "public",
      type: "fixed",
      url: "serie#serie-1",
      name: "serie 1",
      content: [
        {
          type: {
            serieId,
          },
          id: s1Ep1Id,
        },
      ],
    } );
    const users: UserInterface[] = [{
      name: "user1",
      role: "User",
      pass: "pass",
      histories: [
        {
          name: "music",
          content: [],
        },
      ],
      groups: [
        g1, groupSerie1,
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
    const promises: Promise<User>[] = [];

    for (const uObj of users)
      promises.push(new UserModel(uObj).save());

    return Promise.all(promises);
  }

  async clear() {
    await deleteAllUsers();
  }
}

export class GroupMock1 implements Mock {
  async initialize() {
    await this.clear();

    const v1 = await findVideoByUrl("sample1");
    const m1 = await findMusicByUrl("dk");

    assert.notEqual(v1, null);
    assert.notEqual(m1, null);

    const objs: GroupInterface[] = [{
      name: "group 1",
      url: "group-1",
      type: "fixed",
      visibility: "public",
      content: [
        {
          id: <Schema.Types.ObjectId>v1?._id,
          type: VideoTypeStr,
          weight: 0,
        },
      ],
    },
    {
      name: "group 2",
      url: "group-2",
      type: "fixed",
      visibility: "public",
      content: [
        {
          id: <Schema.Types.ObjectId>m1?._id,
          type: "music",
        },
      ],
    },
    ];
    const promises: Promise<Group>[] = [];

    for (const obj of objs)
      promises.push(new GroupModel(obj).save());

    return Promise.all(promises);
  }

  async clear() {
    await deleteAllGroups();
  }
}
