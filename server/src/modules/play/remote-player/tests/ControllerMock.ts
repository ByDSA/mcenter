import { PublicMethodsOf } from "#shared/utils/types";
import { Router } from "express";
import RemotePlayerController from "../Controller";

export default class ControllerMock implements PublicMethodsOf<RemotePlayerController> {
  getRouter = jest.fn((): Router => Router());

  getStatus = jest.fn();

  pauseToggle = jest.fn();

  getPlaylist = jest.fn();
}