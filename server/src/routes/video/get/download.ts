import { getVideoFullPath, VideoInterface } from "@app/db/models/resources/video";
import download from "@routes/download";
import { Response } from "express";

type Params = {
  video: VideoInterface;
  res: Response;
};

export default function downloadVideo( { video, res }: Params) {
  const fullPath = getVideoFullPath(video.path);

  download( {
    fullPath,
    res,
  } );
}
