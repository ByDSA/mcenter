import { findFiles, FindOptions, fixHashFile } from ".";

describe("findFiles", () => {
  it("tests/files folder", () => {
    const expected = [
      "tests/files/music/dk.mp3",
      "tests/files/music/aot4_copy.mp3",
      "tests/files/music/nomusic",
      "tests/files/music/Driftveil.mp3"];
    const path = "tests/files/music";
    const actual = findFiles( {
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
  it("tests/files/music folder", () => {
    const expected = [
      "tests/files/music/dk.mp3",
      "tests/files/music/nomusic",
      "tests/files/music/aot4_copy.mp3",
      "tests/files/music/a/aot4.mp3",
      "tests/files/music/Driftveil.mp3"];
    const path = "tests/files/music";
    const actual = findFiles( {
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
  it("tests/files folder", () => {
    const expected = [
      "tests/files/music/dk.mp3",
      "tests/files/music/aot4_copy.mp3",
      "tests/files/music/a/aot4.mp3",
      "tests/files/music/Driftveil.mp3"];
    const path = "tests/files/music";
    const actual = findFiles( {
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
  it("unique hash", () => {
    const expected = ["tests/files/music/dk.mp3"];
    const hash = "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872";
    const options: FindOptions = {
      fileHash: hash,
      folder: "tests/files/music",
      recursive: false,
    };
    const actual = findFiles(options);

    expect(actual).toStrictEqual(expected);
  } );

  it("unique hash 2", () => {
    const expected = ["tests/files/music/aot4_copy.mp3"];
    const hash = "54ca5061257adafcedee8523e4f8cc3f0347ab9143cddb0fd9b4997498e34ce2";
    const options: FindOptions = {
      fileHash: hash,
      folder: "tests/files/music",
      recursive: false,
    };
    const actual = findFiles(options);

    expect(actual).toStrictEqual(expected);
  } );

  it("not found", () => {
    const expected: string[] = [];
    const hash = "1234";
    const options: FindOptions = {
      fileHash: hash,
      folder: "tests/files/music",
      recursive: false,
    };
    const actual = findFiles(options);

    expect(actual).toStrictEqual(expected);
  } );
} );

describe("findFilesRecursive", () => {
  it("unique hash", () => {
    const expected = ["tests/files/music/dk.mp3"];
    const hash = "eacf40b68de85b759524e3bd0bea1b4393360f682db3a7f3ec25ff46b1d01872";
    const options = {
      fileHash: hash,
      folder: "tests/files/music",
    };
    const actual = findFiles(options);

    expect(actual).toStrictEqual(expected);
  } );

  it("duplicated hash", () => {
    const expected = ["tests/files/music/aot4_copy.mp3", "tests/files/music/a/aot4.mp3"];
    const hash = "54ca5061257adafcedee8523e4f8cc3f0347ab9143cddb0fd9b4997498e34ce2";
    const options = {
      fileHash: hash,
      folder: "tests/files/music",
    };
    const actual = findFiles(options);

    expect(actual.sort()).toStrictEqual(expected.sort());
  } );

  it("not found", () => {
    const expected: string[] = [];
    const hash = "1234";
    const options = {
      fileHash: hash,
      folder: "tests/files/music",
    };
    const actual = findFiles(options);

    expect(actual).toStrictEqual(expected);
  } );
} );

describe("fixHashFile", () => {
  it("no fix: file exists, hash correct", () => {
    const hash = "54ca5061257adafcedee8523e4f8cc3f0347ab9143cddb0fd9b4997498e34ce2";
    const path = "tests/files/music/aot4_copy.mp3";
    const expected = {
      hash,
      path,
    };
    const actual = fixHashFile( {
      hash,
      path,
    } );

    expect(actual).toStrictEqual(expected);
  } );

  it("file exists, hash incorrect", () => {
    const wrongHash = "wronghash";
    const expectedHash = "54ca5061257adafcedee8523e4f8cc3f0347ab9143cddb0fd9b4997498e34ce2";
    const path = "tests/files/music/aot4_copy.mp3";
    const expected = {
      hash: expectedHash,
      path,
    };
    const actual = fixHashFile( {
      hash: wrongHash,
      path,
    } );

    expect(actual).toStrictEqual(expected);
  } );

  it("file incorrent, hash correct", () => {
    const wrongPath = "wrongfile";
    const expectedPath = "./tests/files/music/a/aot4.mp3";
    const hash = "54ca5061257adafcedee8523e4f8cc3f0347ab9143cddb0fd9b4997498e34ce2";
    const expected = {
      hash,
      path: expectedPath,
    };
    const actual = fixHashFile( {
      hash,
      path: wrongPath,
    } );

    expect(actual).toStrictEqual(expected);
  } );

  it("file incorrent, hash incorrect", () => {
    const wrongPath = "wrongfile";
    const hash = "wrongHash";
    const actual = fixHashFile( {
      hash,
      path: wrongPath,
    } );

    expect(actual).toBeUndefined();
  } );
} );
