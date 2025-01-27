import { PublicMethodsOf } from "#shared/utils/types";
import { VLCProcessService } from "../Service";

export class PlayerServiceMock implements PublicMethodsOf<VLCProcessService> {
  playResource = jest.fn();

  isProcessOpen = jest.fn();
}
