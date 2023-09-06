import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import RestController from "../RestController";

export class HistoryListRestControllerMock implements PublicMethodsOf<RestController> {
  getOneById = jest.fn();

  getRouter = getRouterMock;

  getManyEntriesByHistoryListId = jest.fn();

  getManyEntriesByHistoryListIdSearch = jest.fn();

  getAll = jest.fn();

  getManyEntriesBySearch = jest.fn();
}