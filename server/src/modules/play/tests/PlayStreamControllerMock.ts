import { PublicMethodsOf } from "#shared/utils/types";
import { Router } from "express";
import PlayStreamController from "../PlayStreamController";

export default class PlayStreamControllerMock implements PublicMethodsOf<PlayStreamController> {
  playStream = jest.fn();

  getRouter = jest.fn((): Router => Router());
}