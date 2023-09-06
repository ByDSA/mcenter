import { PublicMethodsOf } from "#shared/utils/types";
import { Router } from "express";
import PlaySerieController from "../PlaySerieController";

export default class PlaySerieControllerMock implements PublicMethodsOf<PlaySerieController> {
  playSerie = jest.fn();

  getRouter = jest.fn((): Router => Router());
}