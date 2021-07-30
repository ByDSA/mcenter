import { Express } from "express";
import get from "./get";
import getGroup from "./getGroup";
import { GET, GET_GROUP } from "./urls";

export default function routes(app: Express) {
  app.get(`${GET}`, get);

  app.get(`${GET_GROUP}`, getGroup);
}
