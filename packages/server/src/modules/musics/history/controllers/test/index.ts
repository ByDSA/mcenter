import { PublicMethodsOf } from "#shared/utils/types";
import RestController from "../RestController";
import { getRouterMock } from "#tests/main";

export class HistoryListRestControllerMock implements PublicMethodsOf<RestController> {
  deleteOneEntryById = jest.fn();

  getOneById = jest.fn();

  getRouter = getRouterMock;

  getManyEntriesByHistoryListId = jest.fn();

  getManyEntriesByHistoryListIdSearch = jest.fn();

  getAll = jest.fn();

  getManyEntriesBySearch = jest.fn();
}
