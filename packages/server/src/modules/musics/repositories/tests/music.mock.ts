import { MusicRepository } from "#modules/musics";
import { PublicMethodsOf } from "#shared/utils/types";
import Repository from "../Repository";

const repository = new Repository();

export async function initializeMock() {
  await repository.createFromPath("dk.mp3");
}

export async function clearMock() {
  await repository.deleteAll();
}

export class RepositoryMock implements PublicMethodsOf<MusicRepository> {
  findByHash = jest.fn();

  findByUrl = jest.fn();

  findAll = jest.fn();

  findByPath = jest.fn();

  findOrCreateFromPath = jest.fn();

  findOrCreateFromYoutube = jest.fn();

  deleteOneByPath = jest.fn();

  updateOneByUrl = jest.fn();

  updateOneByHash = jest.fn();

  updateOneByPath = jest.fn();

  createFromPath = jest.fn();

  deleteAll = jest.fn();
}
