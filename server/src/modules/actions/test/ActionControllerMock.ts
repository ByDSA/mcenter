import { PublicMethodsOf } from "#utils/types";
import { Router } from "express";
import ActionController from "../ActionController";

export default class ActionControllerMock implements PublicMethodsOf<ActionController> {
  getRouter: ()=> Router = jest.fn(() => Router());
}