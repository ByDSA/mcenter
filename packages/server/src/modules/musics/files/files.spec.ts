import { join } from "path";
import { FindOptions, findFiles } from ".";
import { MUSIC_DATA_FOLDER } from "#tests/MusicData";
import { AOT4_COPY, A_AOT4, DK, DRIFTVEIL } from "#tests/main/db/fixtures/models/music";
import { md5FileAsync } from "#utils/crypt";

describe("getHashFromFile", () => {
  it("existing path", async () => {
    const expected = DK.hash;
    const fullPath = `${MUSIC_DATA_FOLDER}/${DK.path}`;
    const actual = await md5FileAsync(fullPath);

    expect(actual).toBe(expected);
  } );

  it("existing path folder", () => {
    const path = `${MUSIC_DATA_FOLDER}/`;

    expect(async () => {
      await md5FileAsync(path);
    } ).rejects.toThrow("EISDIR: illegal operation on a directory, read");
  } );

  it("unexisting path", () => {
    const path = "unexisting/path/";

    expect(async () => {
      await md5FileAsync(path);
    } ).rejects.toThrow(`ENOENT: no such file or directory, open '${path}'`);
  } );
} );

describe("findFiles", () => {
  it("tests/files folder", async () => {
    const expected = [
      `${MUSIC_DATA_FOLDER}/${DK.path}`,
      `${MUSIC_DATA_FOLDER}/${AOT4_COPY.path}`,
      `${MUSIC_DATA_FOLDER}/nomusic`,
      `${MUSIC_DATA_FOLDER}/${DRIFTVEIL.path}`];
    const path = `${MUSIC_DATA_FOLDER}/`;
    const actual = await findFiles( {
      folder: path,
    } );

    expect(actual.sort()).toEqual(expected.sort());
  } );

  it("unexisting folder", () => {
    const path = "unexisting/folder";
    const actual = findFiles( {
      folder: path,
    } );
    const expected: string[] = [];

    expect(actual).toStrictEqual(expected);
  } );

  it("void folder", () => {
    const path = "";

    expect(() => {
      findFiles( {
        folder: path,
      } );
    } ).toThrowError();
  } );
} );

describe("findFilesResursive", () => {
  it("tests/files folder", async () => {
    const expected = [
      `${MUSIC_DATA_FOLDER}/${DK.path}`,
      `${MUSIC_DATA_FOLDER}/nomusic`,
      `${MUSIC_DATA_FOLDER}/${AOT4_COPY.path}`,
      `${MUSIC_DATA_FOLDER}/${A_AOT4.path}`,
      `${MUSIC_DATA_FOLDER}/${DRIFTVEIL.path}`];
    const path = `${MUSIC_DATA_FOLDER}/`;
    const actual = await findFiles( {
      folder: path,
      recursive: true,
    } );

    expect(actual.sort()).toEqual(expected.sort());
  } );

  it("unexisting folder", () => {
    const path = "unexisting/folder";
    const actual = findFiles( {
      folder: path,
      recursive: true,
    } );
    const expected: string[] = [];

    expect(actual).toStrictEqual(expected);
  } );

  it("void folder", () => {
    const path = "";

    expect(() => {
      findFiles( {
        folder: path,
        recursive: true,
      } );
    } ).toThrowError();
  } );
} );

describe("findFilesByExtensionRecursive", () => {
  it("tests/files folder", async () => {
    const expected = [
      `${MUSIC_DATA_FOLDER}/${DK.path}`,
      `${MUSIC_DATA_FOLDER}/${AOT4_COPY.path}`,
      `${MUSIC_DATA_FOLDER}/${A_AOT4.path}`,
      `${MUSIC_DATA_FOLDER}/${DRIFTVEIL.path}`];
    const path = "tests/files";
    const actual = await findFiles( {
      folder: path,
      recursive: true,
      extensions: ["mp3"],
    } );

    expect(actual.sort()).toEqual(expected.sort());
  } );

  it("unexisting folder", () => {
    const path = "unexisting/folder";
    const actual = findFiles( {
      folder: path,
      recursive: true,
      extensions: ["mp3"],
    } );
    const expected: string[] = [];

    expect(actual).toStrictEqual(expected);
  } );

  it("void folder", () => {
    const path = "";

    expect(() => {
      findFiles( {
        folder: path,
        recursive: true,
        extensions: ["mp3"],
      } );
    } ).toThrowError();
  } );
} );

describe("findFiles", () => {
  it("unique hash", async () => {
    const expected = [join(MUSIC_DATA_FOLDER, DK.path)];
    const { hash } = DK;
    const options: FindOptions = {
      fileHash: hash,
      folder: MUSIC_DATA_FOLDER,
      recursive: false,
    };
    const actual = await findFiles(options);

    expect(actual).toStrictEqual(expected);
  } );

  it("unique hash 2", async () => {
    const expected = [`${MUSIC_DATA_FOLDER}/${AOT4_COPY.path}`];
    const { hash } = AOT4_COPY;
    const options: FindOptions = {
      fileHash: hash,
      folder: MUSIC_DATA_FOLDER,
      recursive: false,
    };
    const actual = await findFiles(options);

    expect(actual).toStrictEqual(expected);
  } );

  it("not found", async () => {
    const expected: string[] = [];
    const hash = "1234";
    const options: FindOptions = {
      fileHash: hash,
      folder: MUSIC_DATA_FOLDER,
      recursive: false,
    };
    const actual = await findFiles(options);

    expect(actual).toStrictEqual(expected);
  } );
} );

describe("findFilesRecursive", () => {
  it("unique hash", async () => {
    const expected = [`${MUSIC_DATA_FOLDER}/${DK.path}`];
    const { hash } = DK;
    const options = {
      fileHash: hash,
      folder: MUSIC_DATA_FOLDER,
    };
    const actual = await findFiles(options);

    expect(actual).toStrictEqual(expected);
  } );

  it("duplicated hash", async () => {
    const expected = [`${MUSIC_DATA_FOLDER}/${AOT4_COPY.path}`, `${MUSIC_DATA_FOLDER}/${A_AOT4.path}`];
    const { hash } = A_AOT4;
    const options = {
      fileHash: hash,
      folder: MUSIC_DATA_FOLDER,
    };
    const actual = await findFiles(options);

    expect(actual.sort()).toStrictEqual(expected.sort());
  } );

  it("not found", async () => {
    const expected: string[] = [];
    const hash = "1234";
    const options = {
      fileHash: hash,
      folder: MUSIC_DATA_FOLDER,
    };
    const actual = await findFiles(options);

    expect(actual).toStrictEqual(expected);
  } );
} );
