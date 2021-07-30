import Mode from "@app/actions/GroupPicker/mode";
import { Request, Response } from "express";
import get from "./get";
import pickFunc from "./pick";

export default async function getGroup(req: Request, res: Response) {
  const { pick, mode } = req.query;
  const { username, group } = req.params;
  let ret = null;

  if (pick) {
    if (mode && (mode === Mode.RANDOM || mode === Mode.SEQUENTIAL)) {
      ret = await pickFunc( {
        username,
        group,
        mode,
      } );
    } else {
      res.sendStatus(400);

      return;
    }
  } else {
    ret = await get( {
      username,
      group,
    } );
  }

  if (!ret) {
    res.sendStatus(404);

    return;
  }

  res.send(ret);
}
