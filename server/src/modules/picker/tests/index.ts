import { PublicMethodsOf } from "#utils/types";
import PickerController from "../Controller";

export class PickerControllerMock implements PublicMethodsOf<PickerController> {
  getOneById = jest.fn();

  getRouter = jest.fn();
}