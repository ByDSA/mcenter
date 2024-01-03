import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import PickerController from "../PickerController";

export class EpisodePickerControllerMock implements PublicMethodsOf<PickerController> {
  getOneById = jest.fn();

  getRouter = getRouterMock;
}