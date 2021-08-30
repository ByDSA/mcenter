import { Response } from "express";

type Params = {
  fullPath: string;
  res: Response;
};
export default function download( { fullPath, res }: Params) {
  res.download(fullPath, (error) => {
    if (error)
      res.sendStatus(500);
  } );
}
