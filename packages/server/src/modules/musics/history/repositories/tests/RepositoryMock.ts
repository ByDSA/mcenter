import { PublicMethodsOf } from "#shared/utils/types";
import { MusicHistoryRepository } from "../Repository";

export class MusicHistoryRepositoryMock implements PublicMethodsOf<MusicHistoryRepository> {
  getManyCriteria = jest.fn();

  getLast = jest.fn();

  createOne = jest.fn();

  getAll = jest.fn();
}
