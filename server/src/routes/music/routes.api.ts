import { Express } from "express";
import { findOrCreateAndSaveFromYoutube } from "../../db/models/music/create";
import { ROUTE_CREATE_YT, ROUTE_FIX_ALL, ROUTE_FIX_ONE, ROUTE_GET_ALL, ROUTE_GET_RANDOM, ROUTE_RAW } from "../routes.api.config";
import { fixAll, fixOne } from "./routes.fix";
import getAll from "./routes.get-all";
import getRandom from "./routes.get-random";
import rawAccess from "./routes.raw";

export default function apiRoutes(app: Express) {
  app.get(`${ROUTE_RAW}/:name`, rawAccess);

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
