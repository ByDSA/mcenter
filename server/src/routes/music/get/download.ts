import { getMusicFullPath, MusicInterface } from "@app/db/models/resources/music";
import download from "@routes/download";
import { Response } from "express";

type Params = {
  music: MusicInterface;
  res: Response;
};

export default function downloadMusic( { music, res }: Params) {
  const fullPath = getMusicFullPath(music.path);

  download( {
    fullPath,
    res,
  } );
}
