import mongoose from "mongoose";
import { Music } from "../models";
import { musicDocOdmToModel, musicModelToDocOdm } from "./adapters";
import { DocOdm } from "./odm";
import { A_AOT4 } from "#tests/main/db/fixtures/models/music";

function removeUndefinedProps(obj: Record<string, any>) {
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
}

describe("musicModelToDocOdm", () => {
  it("should convert Music model to DocOdm correctly", () => {
    const music: Music = A_AOT4;
    const expectedDocOdm: DocOdm = {
      _id: new mongoose.Types.ObjectId(music.id),
      hash: music.hash,
      title: music.title,
      url: music.url,
      path: music.path,
      weight: music.weight,
      artist: music.artist,
      tags: ["t1"],
      onlyTags: ["t2"],
      disabled: music.disabled,
      lastTimePlayed: music.lastTimePlayed,
      size: music.size,
      mediaInfo: {
        duration: music.mediaInfo.duration,
      },
      timestamps: {
        createdAt: music.timestamps.createdAt,
        updatedAt: music.timestamps.updatedAt,
        addedAt: music.timestamps.addedAt,
      },
      album: music.album,
      country: music.country,
      game: music.game,
      year: music.year,
    };

    removeUndefinedProps(expectedDocOdm);

    const result = musicModelToDocOdm(music);

    expect(result).toEqual(expectedDocOdm);
  } );

  it("should handle undefined optional fields", () => {
    const music: Music = {
      id: new mongoose.Types.ObjectId().toString(),
      hash: "hash123",
      title: "Test Title",
      url: "http://test.url",
      mediaInfo: {
        duration: 300,
      },
      timestamps: {
        createdAt: new Date(),
        updatedAt: new Date(),
        addedAt: new Date(),
      },
      artist: "Test Artist",
      path: "test/path",
      size: 100,
      weight: 1,
    };
    const expectedDocOdm: DocOdm = {
      _id: new mongoose.Types.ObjectId(music.id),
      hash: music.hash,
      title: music.title,
      url: music.url,
      mediaInfo: {
        duration: music.mediaInfo.duration,
      },
      timestamps: {
        createdAt: music.timestamps.createdAt,
        updatedAt: music.timestamps.updatedAt,
        addedAt: music.timestamps.addedAt,
      },
      artist: music.artist,
      path: music.path,
      size: music.size,
      weight: music.weight,
    };
    const result = musicModelToDocOdm(music);

    expect(result).toEqual(expectedDocOdm);
  } );
} );

describe("musicDocOdmToModel", () => {
  it("should convert DocOdm to Music model correctly", () => {
    const docOdm: DocOdm = {
      _id: new mongoose.Types.ObjectId(),
      hash: A_AOT4.hash,
      title: "Test Title",
      url: "http://test.url",
      path: "test/path",
      weight: 1,
      artist: "Test Artist",
      tags: ["tag1"],
      onlyTags: ["tag2"],
      disabled: false,
      lastTimePlayed: +new Date(),
      size: 100,
      mediaInfo: {
        duration: 300,
      },
      timestamps: {
        createdAt: new Date(),
        updatedAt: new Date(),
        addedAt: new Date(),
      },
      album: "Test Album",
      country: "Test Country",
      game: "Test Game",
      year: 2021,
    };
    const expectedMusic: Music = {
      id: docOdm._id.toString(),
      hash: docOdm.hash,
      title: docOdm.title,
      url: docOdm.url,
      path: docOdm.path,
      weight: docOdm.weight,
      artist: docOdm.artist,
      tags: ["tag1", "only-tag2"],
      disabled: docOdm.disabled,
      lastTimePlayed: docOdm.lastTimePlayed,
      size: docOdm.size,
      mediaInfo: {
        duration: docOdm.mediaInfo.duration,
      },
      timestamps: {
        createdAt: docOdm.timestamps.createdAt,
        updatedAt: docOdm.timestamps.updatedAt,
        addedAt: docOdm.timestamps.addedAt,
      },
      album: docOdm.album,
      country: docOdm.country,
      game: docOdm.game,
      year: docOdm.year,
    };
    const result = musicDocOdmToModel(docOdm);

    expect(result).toEqual(expectedMusic);
  } );

  it("should handle undefined optional fields", () => {
    const docOdm: DocOdm = {
      _id: new mongoose.Types.ObjectId(),
      hash: A_AOT4.hash,
      title: "Test Title",
      url: "http://test.url",
      mediaInfo: {
        duration: 300,
      },
      timestamps: {
        createdAt: new Date(),
        updatedAt: new Date(),
        addedAt: new Date(),
      },
      artist: "Test Artist",
      path: "test/path",
      size: 100,
      weight: 1,
    };
    const expectedMusic: Music = {
      id: docOdm._id.toString(),
      hash: docOdm.hash,
      title: docOdm.title,
      url: docOdm.url,
      mediaInfo: {
        duration: docOdm.mediaInfo.duration,
      },
      timestamps: {
        createdAt: docOdm.timestamps.createdAt,
        updatedAt: docOdm.timestamps.updatedAt,
        addedAt: docOdm.timestamps.addedAt,
      },
      artist: docOdm.artist,
      path: docOdm.path,
      size: docOdm.size,
      weight: docOdm.weight,
    };
    const result = musicDocOdmToModel(docOdm);

    expect(result).toEqual(expectedMusic);
  } );
} );

describe("reversibility", () => {
  it("should be reversible: model->odm->model", () => {
    const music: Music = A_AOT4;
    const docOdm = musicModelToDocOdm(music);
    const result = musicDocOdmToModel(docOdm);

    expect(result).toEqual(music);
  } );

  it("should be reversible: odm->model->odm", () => {
    const docOdm: DocOdm = {
      _id: new mongoose.Types.ObjectId(),
      hash: A_AOT4.hash,
      title: A_AOT4.title,
      url: A_AOT4.url,
      artist: A_AOT4.artist,
      mediaInfo: {
        duration: A_AOT4.mediaInfo.duration,
      },
      tags: ["t1", "t3"],
      onlyTags: ["t2", "t3"],
      timestamps: {
        createdAt: A_AOT4.timestamps.createdAt,
        updatedAt: A_AOT4.timestamps.updatedAt,
        addedAt: A_AOT4.timestamps.addedAt,
      },
      path: A_AOT4.path,
      size: A_AOT4.size,
      weight: A_AOT4.weight,
    };
    const music = musicDocOdmToModel(docOdm);
    const result = musicModelToDocOdm(music);

    expect(result).toEqual(docOdm);
  } );
} );
