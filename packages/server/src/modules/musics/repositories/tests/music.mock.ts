import { PublicMethodsOf } from "#shared/utils/types";
import { MusicRepository } from "#musics/index";

export class MusicRepositoryMock implements PublicMethodsOf<MusicRepository> {
  getOneById = jest.fn();

  patchOneById = jest.fn();

  findOneByHash = jest.fn();

  findOneByUrl = jest.fn();

  findAll = jest.fn();

  findOneByPath = jest.fn();

  findOrCreateOneFromPath = jest.fn();

  findOrCreateOneFromYoutube = jest.fn();

  deleteOneByPath = jest.fn();

  updateOneByUrl = jest.fn();

  updateOneByHash = jest.fn();

  updateOneByPath = jest.fn();

  createOneFromPath = jest.fn();

  updateHashOf = jest.fn();

  find = jest.fn();
}
