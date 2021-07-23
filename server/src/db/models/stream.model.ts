import mongoose, { Document } from "mongoose";
import { getDateTypeNow } from "./date";
import { getById as getSerieById } from "./group/model";
import { History, HistorySchema } from "./history";
import { Episode } from "./video";

enum Mode {
    SEQUENTIAL = "SEQUENTIAL",
    RANDOM = "RANDOM"
}

interface Stream extends Document {
    id: string;
    group: string;
    mode: Mode.RANDOM | Mode.SEQUENTIAL;
    maxHistorySize: number;
    history: History[];
}

const NAME = "Stream";
const schema = new mongoose.Schema( {
  id: {
    type: String,
    required: true,
  },
  group: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    enum: [Mode.SEQUENTIAL, Mode.RANDOM],
    required: true,
  },
  maxHistorySize: {
    type: Number,
    required: true,
  },
  history: {
    type: [HistorySchema],
  },
} );
const Model = mongoose.model<Stream>(NAME, schema);

export async function getById(id: string): Promise<Stream | null> {
  console.log(`getting stream by id=${id}`);
  const streams = await Model.find( {
    id,
  }, {
    _id: 0,
  } );

  console.log(`Got stream with id: ${streams[0].id}`);
  let stream: Stream | null | undefined = streams[0];

  if (!stream)
    stream = await createFromSerie(id);

  return stream;
}

export async function addToHistory(stream: Stream, episode: Episode) {
  const newEntry: History = {
    date: getDateTypeNow(),
    episodeId: episode.id,
  };

  stream.history.push(newEntry);
  const saved = await Model.findOneAndUpdate( {
    id: stream.id,
  }, stream);
}

export async function createFromSerie(serieId: string): Promise<Stream | null> {
  console.log(`createFromSerie ${serieId}`);
  const serie = await getSerieById(serieId);

  if (!serie)
    return null;

  const newStream: Stream = new Model( {
    id: serieId,
    group: `series/${serieId}`,
    mode: Mode.SEQUENTIAL,
    maxHistorySize: 1,
    history: [
    ],
  } );

  newStream.save();

  return newStream;
}

export {
  schema as SteamSchema, Mode, Stream, Model as StreamModel,
};
