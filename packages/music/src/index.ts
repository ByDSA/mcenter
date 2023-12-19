import express, { Request, Response } from "express";
import { ENVS } from "./env";

const app = express();

app.get("/api/get/random", (req: Request, res: Response) => {
  const {redirectServer} = ENVS;
  const {tags} = req.query;
  let query = "";

  if (tags)
    query += `?tags=${tags}`;

  const newUrl = `${redirectServer}/api/musics/get/random${query}`;

  res.redirect(newUrl);
} );

app.get("/api/get/raw/:name", (req: Request, res: Response) => {
  const { name } = req.params;
  const newUrl = `${ENVS.redirectServer }/api/musics/get/raw/${ name}`;

  res.redirect(newUrl);
} );

app.get("/api/update/fix/all", (_: Request, res: Response) => {
  const newUrl = `${ENVS.redirectServer}/api/musics/update/fix/all`;

  res.redirect(newUrl);
} );

app.get("/api/update/fix/integrity", (_: Request, res: Response) => {
  const newUrl = `${ENVS.redirectServer}/api/musics/update/fix/integrity`;

  res.redirect(newUrl);
} );

app.listen(ENVS.port, () => {
  console.log(`Server listening on port ${ENVS.port}`);
} );