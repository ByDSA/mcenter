import App from "@app/app";
import { findOrCreateAndSaveFromYoutube } from "@models/resources/music/create";
import { fixAll, fixOne } from "./fix";
import getApp from "./get";
import getAllApp from "./getAll";
import getObj from "./getObj";
import { getFullUrl, ROUTE_CREATE_YT, ROUTE_FIX_ALL, ROUTE_FIX_ONE, ROUTE_GET, ROUTE_GET_ALL } from "./urls";

export default function routes(app: App) {
  const { expressApp } = app;

  if (!expressApp)
    throw new Error();

  expressApp.get(`${ROUTE_GET}/:url`, getApp(app));
  expressApp.get(`${ROUTE_GET_ALL}`, getAllApp(app));

  expressApp.get(`${ROUTE_FIX_ALL}`, fixAll);
  expressApp.get(`${ROUTE_FIX_ONE}`, fixOne);

  expressApp.get(`${ROUTE_CREATE_YT}/:id`, async (req, res) => {
    const { id } = req.params;
    const data = await findOrCreateAndSaveFromYoutube(id);

    res.send(data);
  } );
}

export {
  getFullUrl as getFullUrlMusic,
  getObj as getMusicObj,
};
