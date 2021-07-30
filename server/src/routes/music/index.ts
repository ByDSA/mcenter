import { findOrCreateAndSaveFromYoutube } from "@models/resources/music/create";
import { Express } from "express";
import { ROUTE_CREATE_YT, ROUTE_FIX_ALL, ROUTE_FIX_ONE, ROUTE_GET, ROUTE_GET_ALL, ROUTE_GET_RANDOM } from "./config";
import { fixAll, fixOne } from "./fix";
import get from "./get";
import getAll from "./get-all";
import getRandom from "./get-random";

export default function routes(app: Express) {
  app.get(`${ROUTE_GET}/:url`, get);

  app.get(`${ROUTE_FIX_ALL}`, fixAll);
  app.get(`${ROUTE_FIX_ONE}`, fixOne);

  app.get(`${ROUTE_GET_ALL}`, getAll);

  app.get(`${ROUTE_GET_RANDOM}`, getRandom);

  app.get(`${ROUTE_CREATE_YT}/:id`, async (req, res) => {
    const { id } = req.params;
    const data = await findOrCreateAndSaveFromYoutube(id);

    res.send(data);
  } );
}
