import { PublicMethodsOf } from "#shared/utils/types";
import PickerController from "../PickerController";
import { getRouterMock } from "#tests/main";

export class EpisodePickerControllerMock implements PublicMethodsOf<PickerController> {
  getOneById = jest.fn();

  getRouter = getRouterMock;
}
