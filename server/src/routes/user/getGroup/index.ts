import Mode from "@app/actions/GroupPicker/mode";
import App from "@app/app";
import download from "@app/routes/download";
import { Request, Response } from "express";
import get from "./get";
import pickFunc from "./pick";

export default function getGroupApp(app: App) {
  return (req: Request, res: Response) => getGroup(req, res, app);
}

async function getGroup(req: Request, res: Response, app: App) {
  const { pick, mode, raw } = req.query;
  const { userName, groupUrl } = req.params;

  if (pick) {
    if (mode && (mode === Mode.RANDOM || mode === Mode.SEQUENTIAL)) {
      const pickedWithFullPath = await pickFunc( {
        userName,
        groupUrl,
        mode,
        app,
      } );

      if (pickedWithFullPath) {
        if (raw) {
          download( {
            fullPath: pickedWithFullPath.fullPath,
            res,
          } );
        } else {
          const pickedWithoutFullPath: { fullPath?: string } = {
            ...pickedWithFullPath,
          };

          delete pickedWithoutFullPath.fullPath;
          res.send(pickedWithoutFullPath);
        }
      } else
        res.sendStatus(404);
    } else
      res.sendStatus(400);
  } else {
    const got = await get( {
      userName,
      groupUrl,
    } );

    if (got)
      res.send(got);
    else
      res.sendStatus(404);
  }
}
