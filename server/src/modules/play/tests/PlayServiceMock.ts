import { PublicMethodsOf } from "#utils/types";
import PlayerService from "../player/PlayerService";

export default class PlayServiceMock implements PublicMethodsOf<PlayerService> {
  play = jest.fn();
}