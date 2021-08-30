import { findUserByName } from "@models/user";
import { Request, Response } from "express";

export default async function get(req: Request, res: Response) {
  const { userName } = req.params;
  const user = await findUserByName(userName);

  if (!user) {
    res.sendStatus(404);

    return;
  }

  res.send(user);
}
