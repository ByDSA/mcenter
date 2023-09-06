import { PublicMethodsOf } from "#shared/utils/types";
import { PlayerService } from "../player";

export default class PlayerServiceMock implements PublicMethodsOf<PlayerService> {
  play = jest.fn();
}