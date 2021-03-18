import express, { Request, Response } from 'express';
import playFunc from "./src/actions/play";
import playStreamFunc from "./src/actions/playStream";
import showSerieFunc from "./src/actions/showSerie";
import showStreamFunc from "./src/actions/showStream";
import { connect } from "./src/db/database";
import asyncCalculateNextEpisodeByIdStream from "./src/EpisodePicker";
const s = require("./src/scheduler");

const app = express();

app.disable('x-powered-by');

const PORT = 8080;

connect();

app.get('/', (req: Request, res: Response) => {
    res.send("Hello World! ");
});

app.get('/api/play/stream/:id/:number?', playStreamFunc);

app.get('/api/play/:type/:id', playFunc);

app.get('/api/crud/series/:id', showSerieFunc);
app.get('/api/crud/streams/:id', showStreamFunc);


app.get('/api/stop', (req: Request, res: Response) => {
    res.send("Stop");
});

app.get('/api/schedule', (req: Request, res: Response) => {
    res.send("Play");
});

app.get('/api/test/picker/:idstream', async (req: Request, res: Response) => {
    const { idstream } = req.params;
    const nextEpisode = await asyncCalculateNextEpisodeByIdStream(idstream);
    res.send(nextEpisode);
});

app.listen(PORT, function () {
    console.log(`Server Listening on ${PORT}`);
});
