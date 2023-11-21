import PlayerService from "#modules/PlayerService";

export default class PlayerServiceMock implements PlayerService {
  isRunning = jest.fn();

  pauseToggle = jest.fn();

  next = jest.fn();

  previous = jest.fn();

  stop = jest.fn();

  fullscreenToggle = jest.fn();

  seek = jest.fn();

  onStatusChange = jest.fn();

  playResource = jest.fn();

  play = jest.fn();
}