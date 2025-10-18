import mongoose from "mongoose";
import { fixtureUsers } from "$sharedSrc/models/auth/tests/fixtures";
import { fixtureMusics } from "#musics/tests";
import { MusicEntity } from "../../../../models";
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
      artist: music.artist,
      tags: ["t1"],
      onlyTags: ["t2"],
      disabled: music.disabled,
      uploaderUserId: new mongoose.Types.ObjectId(fixtureUsers.Admin.User.id),
      album: music.album,
      country: music.country,
      game: music.game,
      year: music.year,
      createdAt: music.createdAt,
      updatedAt: music.updatedAt,
      addedAt: music.addedAt,
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
      artist: "Test Artist",
      uploaderUserId: fixtureUsers.Admin.User.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      addedAt: new Date(),
    };
    const expectedDocOdm: DocOdm = {
      _id: new mongoose.Types.ObjectId(music.id),
      title: music.title,
      url: music.slug,
      artist: music.artist,
      uploaderUserId: new mongoose.Types.ObjectId(fixtureUsers.Admin.User.id),
      createdAt: music.createdAt,
      updatedAt: music.updatedAt,
      addedAt: music.addedAt,
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
      artist: "Test Artist",
      tags: ["tag1"],
      onlyTags: ["tag2"],
      disabled: false,
      uploaderUserId: new mongoose.Types.ObjectId(fixtureUsers.Admin.User.id),
      album: "Test Album",
      country: "Test Country",
      game: "Test Game",
      year: 2021,
      createdAt: new Date(),
      updatedAt: new Date(),
      addedAt: new Date(),
    };
    const expectedMusic: MusicEntity = {
      id: docOdm._id.toString(),
      title: docOdm.title,
      slug: docOdm.url,
      artist: docOdm.artist,
      tags: ["tag1", "only-tag2"],
      disabled: docOdm.disabled,
      uploaderUserId: fixtureUsers.Admin.User.id,
      album: docOdm.album,
      country: docOdm.country,
      game: docOdm.game,
      year: docOdm.year,
      createdAt: docOdm.createdAt,
      updatedAt: docOdm.updatedAt,
      addedAt: docOdm.addedAt,
    };
    const result = docOdmToEntity(docOdm);

    expect(result).toEqual(expectedMusic);
  } );

  it("should handle undefined optional fields", () => {
    const docOdm: FullDocOdm = {
      _id: new mongoose.Types.ObjectId(),
      title: "Test Title",
      url: "http://test.url",
      uploaderUserId: new mongoose.Types.ObjectId(fixtureUsers.Admin.User.id),
      artist: "Test Artist",
      createdAt: new Date(),
      updatedAt: new Date(),
      addedAt: new Date(),
    };
    const expectedMusic: MusicEntity = {
      id: docOdm._id.toString(),
      title: docOdm.title,
      slug: docOdm.url,
      uploaderUserId: fixtureUsers.Admin.User.id,
      artist: docOdm.artist,
      createdAt: docOdm.createdAt,
      updatedAt: docOdm.updatedAt,
      addedAt: docOdm.addedAt,
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
      uploaderUserId: new mongoose.Types.ObjectId(fixtureUsers.Admin.User.id),
      createdAt: fixtureMusics.Disk.Samples.A_AOT4.createdAt,
      updatedAt: fixtureMusics.Disk.Samples.A_AOT4.updatedAt,
      addedAt: fixtureMusics.Disk.Samples.A_AOT4.addedAt,
    };
    const music = docOdmToEntity(docOdm);
    const result = musicEntityToDocOdm(music);

    expect(result).toEqual(docOdm);
  } );
} );
