import { PublicMethodsOf } from "#shared/utils/types";
import { getRouterMock } from "#tests/main";
import PickerController from "../../episodes/controllers/PickerController";

export class PickerControllerMock implements PublicMethodsOf<PickerController> {
  getOneById = jest.fn();

  getRouter = getRouterMock;
}