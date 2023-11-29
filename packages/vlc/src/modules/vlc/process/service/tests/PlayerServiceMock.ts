import { PublicMethodsOf } from "#shared/utils/types";
import PlayerService from "../Service";

export default class PlayerServiceMock implements PublicMethodsOf<PlayerService> {
  playResource = jest.fn();

  isProcessOpen = jest.fn();
}