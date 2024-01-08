import { MusicRepository } from "#modules/musics";
import { PublicMethodsOf } from "#shared/utils/types";

export default class RepositoryMock implements PublicMethodsOf<MusicRepository> {
  getOneById = jest.fn();

  patchOneById = jest.fn();

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

  updateHashOf = jest.fn();

  find = jest.fn();
}
