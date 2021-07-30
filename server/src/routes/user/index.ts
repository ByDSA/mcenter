import { Express } from "express";
import { GET, GET_GROUP } from "./config";
import get from "./get";
import getGroup from "./getGroup";

export default function routes(app: Express) {
  app.get(`${GET}`, get);

  app.get(`${GET_GROUP}`, getGroup);
}
