import { PublicMethodsOf } from "#shared/utils/types";
import { EpisodePickerController } from "../PickerController";
import { getRouterMock } from "#tests/main";

export class EpisodePickerControllerMock implements PublicMethodsOf<EpisodePickerController> {
  getOneById = jest.fn();

  getRouter = getRouterMock;
}
