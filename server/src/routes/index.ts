import { Express } from "express";
import apiMusicRoutes from "./music";
import apiSerieRoutes from "./series";
import apiUserRoutes from "./user";

export default function f(app: Express) {
  apiMusicRoutes(app);
  apiSerieRoutes(app);
  apiUserRoutes(app);
}
