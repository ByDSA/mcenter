import App from "@app/app";
import get from "./get";
import getGroupApp from "./getGroup";
import getSerie from "./getSerie";
import { GET, GET_GROUP, GET_SERIE } from "./urls";

export default function routes(app: App) {
  const { expressApp } = app;

  if (!expressApp)
    throw new Error();

  expressApp.get(`${GET}`, get);
  expressApp.get(`${GET_GROUP}`, getGroupApp(app));
  expressApp.get(`${GET_SERIE}`, getSerie);
}
