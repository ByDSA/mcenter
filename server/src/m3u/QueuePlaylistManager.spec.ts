import fs from "fs";
import { QueuePlaylistManager } from "./QueuePlaylistManager";

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
  const folder = "/home/daniel/Escritorio";

  sampleQueuePlaylistManager(folder);

  expect(fs.existsSync(`${folder}/next_0.m3u8`)).toBeTruthy();
  expect(fs.existsSync(`${folder}/next_1.m3u8`)).toBeTruthy();
} );

it("clear files ", () => {
  const folder = "/home/daniel/Escritorio";
  const queue = sampleQueuePlaylistManager(folder);

  queue.clear();

  expect(fs.existsSync(`${folder}/next_0.m3u8`)).toBeFalsy();
  expect(fs.existsSync(`${folder}/next_1.m3u8`)).toBeFalsy();
} );