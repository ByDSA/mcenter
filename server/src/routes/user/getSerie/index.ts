import Mode from "@app/actions/GroupPicker/mode";
import { GroupInterface } from "@app/db/models/resources/group";
import { VideoInterface } from "@app/db/models/resources/video";
import { Request, Response } from "express";
import get from "./get";
import pickFunc from "./pick";

export default async function getSerie(req: Request, res: Response) {
  const { pick, mode } = req.query;
  const { userName, serieUrl } = req.params;
  let ret: GroupInterface | VideoInterface | null = null;

  if (pick) {
    if (mode && (mode === Mode.RANDOM || mode === Mode.SEQUENTIAL)) {
      ret = await pickFunc( {
        userName,
        serieUrl,
        mode,
      } );
    } else {
      res.sendStatus(400);

      return;
    }
  } else {
    ret = await get( {
      userName,
      serieUrl,
    } );
  }

  if (!ret) {
    res.sendStatus(404);

    return;
  }

  res.send(ret);
}
