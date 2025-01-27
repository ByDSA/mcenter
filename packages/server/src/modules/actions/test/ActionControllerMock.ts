import { PublicMethodsOf } from "#shared/utils/types";
import { Router } from "express";
import { ActionController } from "../ActionController";

export class ActionControllerMock implements PublicMethodsOf<ActionController> {
  getRouter: ()=> Router = jest.fn(() => Router());
}
