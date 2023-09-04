import { PublicMethodsOf } from "#utils/types";
import RestController from "../RestController";

export class HistoryListRestControllerMock implements PublicMethodsOf<RestController> {
  getOneById = jest.fn();

  getRouter = jest.fn();
}