import mongoose from "mongoose";
import { fixtureMusics } from "#musics/tests";
import { MusicEntity } from "../../../models";
import { docOdmToEntity, musicEntityToDocOdm } from "./adapters";
import { DocOdm, FullDocOdm } from "./odm";

function removeUndefinedProps(obj: Record<string, any>) {
  Object.keys(obj).forEach((key) => obj[key] === undefined && delete obj[key]);
}

describe("musicModelToDocOdm", () => {
  it("should convert Music model to DocOdm correctly", () => {
    const music = fixtureMusics.Disk.Samples.A_AOT4;
    const expectedDocOdm: DocOdm = {
      _id: new mongoose.Types.ObjectId(music.id),
      title: music.title,
      url: music.slug,
      weight: music.weight,
      artist: music.artist,
      tags: ["t1"],
      onlyTags: ["t2"],
      disabled: music.disabled,
      lastTimePlayed: music.lastTimePlayed,
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

    const result = musicEntityToDocOdm(music);

    expect(result).toEqual(expectedDocOdm);
  } );

  it("should handle undefined optional fields", () => {
    const music: MusicEntity = {
      id: new mongoose.Types.ObjectId().toString(),
      title: "Test Title",
      slug: "http://test.url",
      timestamps: {
        createdAt: new Date(),
        updatedAt: new Date(),
        addedAt: new Date(),
      },
      artist: "Test Artist",
      weight: 1,
    };
    const expectedDocOdm: DocOdm = {
      _id: new mongoose.Types.ObjectId(music.id),
      title: music.title,
      url: music.slug,
      timestamps: {
        createdAt: music.timestamps.createdAt,
        updatedAt: music.timestamps.updatedAt,
        addedAt: music.timestamps.addedAt,
      },
      artist: music.artist,
      weight: music.weight,
    };
    const result = musicEntityToDocOdm(music);

    expect(result).toEqual(expectedDocOdm);
  } );
} );

describe("musicDocOdmToModel", () => {
  it("should convert DocOdm to Music model correctly", () => {
    const docOdm: FullDocOdm = {
      _id: new mongoose.Types.ObjectId(),
      title: "Test Title",
      url: "http://test.url",
      weight: 1,
      artist: "Test Artist",
      tags: ["tag1"],
      onlyTags: ["tag2"],
      disabled: false,
      lastTimePlayed: +new Date(),
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
    const expectedMusic: MusicEntity = {
      id: docOdm._id.toString(),
      title: docOdm.title,
      slug: docOdm.url,
      weight: docOdm.weight,
      artist: docOdm.artist,
      tags: ["tag1", "only-tag2"],
      disabled: docOdm.disabled,
      lastTimePlayed: docOdm.lastTimePlayed,
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
    const result = docOdmToEntity(docOdm);

    expect(result).toEqual(expectedMusic);
  } );

  it("should handle undefined optional fields", () => {
    const docOdm: FullDocOdm = {
      _id: new mongoose.Types.ObjectId(),
      title: "Test Title",
      url: "http://test.url",
      timestamps: {
        createdAt: new Date(),
        updatedAt: new Date(),
        addedAt: new Date(),
      },
      artist: "Test Artist",
      weight: 1,
    };
    const expectedMusic: MusicEntity = {
      id: docOdm._id.toString(),
      title: docOdm.title,
      slug: docOdm.url,
      timestamps: {
        createdAt: docOdm.timestamps.createdAt,
        updatedAt: docOdm.timestamps.updatedAt,
        addedAt: docOdm.timestamps.addedAt,
      },
      artist: docOdm.artist,
      weight: docOdm.weight,
    };
    const result = docOdmToEntity(docOdm);

    expect(result).toEqual(expectedMusic);
  } );
} );

describe("reversibility", () => {
  it("should be reversible: model->odm->model", () => {
    const music: MusicEntity = fixtureMusics.Disk.Samples.A_AOT4;
    const docOdm = musicEntityToDocOdm(music);
    const result = docOdmToEntity(docOdm);

    expect(result).toEqual(music);
  } );

  it("should be reversible: odm->model->odm", () => {
    const docOdm: FullDocOdm = {
      _id: new mongoose.Types.ObjectId(),
      title: fixtureMusics.Disk.Samples.A_AOT4.title,
      url: fixtureMusics.Disk.Samples.A_AOT4.slug,
      artist: fixtureMusics.Disk.Samples.A_AOT4.artist,
      tags: ["t1", "t3"],
      onlyTags: ["t2", "t3"],
      timestamps: {
        createdAt: fixtureMusics.Disk.Samples.A_AOT4.timestamps.createdAt,
        updatedAt: fixtureMusics.Disk.Samples.A_AOT4.timestamps.updatedAt,
        addedAt: fixtureMusics.Disk.Samples.A_AOT4.timestamps.addedAt,
      },
      weight: fixtureMusics.Disk.Samples.A_AOT4.weight,
    };
    const music = docOdmToEntity(docOdm);
    const result = musicEntityToDocOdm(music);

    expect(result).toEqual(docOdm);
  } );
} );
