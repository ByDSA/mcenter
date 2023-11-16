import { existsSync, mkdirSync, rmdirSync } from "node:fs";
import { join } from "node:path";
import QueuePlaylistManager from "./QueuePlaylistManager";

const FOLDER = getOrCreateTmpFolder();

afterAll(() => {
  if (existsSync(FOLDER))
    rmdirSync(FOLDER);
} );

function sampleQueuePlaylistManager(folder: string) {
  const queue = new QueuePlaylistManager(folder);
  const element = {
    path: "aaa",
  };
  const element2 = {
    path: "bbb",
  };
  const element3 = {
    path: "ccc",
  };

  queue.add(element, element2);
  queue.add(element3);

  return queue;
}

it("create files ", () => {
  const folder = FOLDER;

  sampleQueuePlaylistManager(folder);

  expect(existsSync(`${folder}/next_0.m3u8`)).toBeTruthy();
  expect(existsSync(`${folder}/next_1.m3u8`)).toBeTruthy();
} );

it("clear files ", () => {
  const folder = FOLDER;
  const queue = sampleQueuePlaylistManager(folder);

  queue.clear();

  expect(existsSync(`${folder}/next_0.m3u8`)).toBeFalsy();
  expect(existsSync(`${folder}/next_1.m3u8`)).toBeFalsy();
} );

function getOrCreateTmpFolder() {
  const tmp = join(__dirname, "..", "..", "..", "..", "tests", "tmp");

  if (!existsSync(tmp))
    mkdirSync(tmp);

  return tmp;
}