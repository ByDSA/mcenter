import App from "@app/app";
import getApp from "./get";
import getAllApp from "./getAll";
import getObj from "./getObj";
import { getFullUrl, ROUTE_GET, ROUTE_GET_ALL } from "./urls";

export default function routes(app: App) {
  const { expressApp } = app;

  if (!expressApp)
    throw new Error();

  expressApp.get(`${ROUTE_GET}/:url`, getApp(app));
  expressApp.get(`${ROUTE_GET_ALL}`, getAllApp(app));
}

export {
  getFullUrl as getFullUrlVideo,
  getObj as getVideoObj,
};
