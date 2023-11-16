import express, { Request, Response } from "express";

const vlcService = new VLCService();
const playService = new PlayService( {
  playerService: vlcService,
} );
const app = express();

app.post("/play", async (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = await playService.play(id);

  res.send(ok);
} );

app.listen(3000, () => {
  console.log("Listening on port 3000");
} );