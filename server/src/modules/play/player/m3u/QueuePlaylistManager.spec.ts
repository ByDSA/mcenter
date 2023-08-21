import { createTmpFolder } from "#tests/utils";
import { existsSync, rmdirSync } from "node:fs";
import QueuePlaylistManager from "./QueuePlaylistManager";

const FOLDER = createTmpFolder();

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