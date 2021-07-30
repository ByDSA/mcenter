import { findUserByName } from "@models/user";
import { Request, Response } from "express";

export default async function get(req: Request, res: Response) {
  const { username } = req.params;
  const user = await findUserByName(username);

  if (!user) {
    res.sendStatus(404);

    return;
  }

  res.send(user);
}
