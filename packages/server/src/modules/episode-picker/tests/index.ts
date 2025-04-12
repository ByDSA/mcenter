import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import { EpisodePickerController } from "../PickerController";

export class EpisodePickerControllerMock implements PublicMethodsOf<EpisodePickerController> {
  getOneById = jest.fn();

  getRouter = getRouterMock;
}
