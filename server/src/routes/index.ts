// eslint-disable-next-line import/no-cycle
import App from "@app/app";
import apiMusicRoutes from "./music";
import apiSerieRoutes from "./series";
import apiUserRoutes from "./user";
import apiVideoRoutes from "./video";

export default function f(app: App) {
  apiMusicRoutes(app);
  apiVideoRoutes(app);
  apiSerieRoutes(app);
  apiUserRoutes(app);
}
