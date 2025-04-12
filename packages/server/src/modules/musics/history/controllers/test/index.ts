import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import { MusicHistoryRestController } from "../RestController";

export class MusicHistoryListRestControllerMock
implements PublicMethodsOf<MusicHistoryRestController> {
  deleteOneEntryById = jest.fn();

  getOneById = jest.fn();

  getRouter = getRouterMock;

  getManyEntriesByHistoryListId = jest.fn();

  getManyEntriesByHistoryListIdSearch = jest.fn();

  getAll = jest.fn();

  getManyEntriesBySearch = jest.fn();
}
