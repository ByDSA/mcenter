import { PublicMethodsOf } from "#shared/utils/types";
import EpisodeFileInfoRepository from "../Repository";

export class EpisodeFileInfoRepositoryMock implements PublicMethodsOf<EpisodeFileInfoRepository> {
  updateOneBySuperId = jest.fn();

  updateMany = jest.fn();

  getOneByPath = jest.fn();

  getAllBySuperId = jest.fn();
}