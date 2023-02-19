import { SerieId, SerieRepository } from "#modules/series/serie";
import { CanFindById, CanUpdateOneById, Repository } from "#modules/utils/base/repository";
import Stream, { StreamId } from "../stream.entity";
import { Mode, StreamDocument, StreamModel } from "./odm/stream.odm";

/* eslint-disable class-methods-use-this */
export default class StreamRepository
  extends Repository
  implements
CanFindById<Stream, StreamId>,
CanUpdateOneById<Stream, StreamId> {
  async createFromSerie(serieId: SerieId): Promise<Stream | null> {
    console.log(`createFromSerie ${serieId}`);
    const serie = await SerieRepository.getInstance<SerieRepository>().findOneById(serieId);

    if (!serie)
      return null;

    const newStream: StreamDocument = new StreamModel( {
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

  async findOneById(id: StreamId): Promise<Stream | null> {
    console.log(`getting stream by id=${id}`);
    const streams = await StreamModel.find( {
      id,
    }, {
      _id: 0,
    } );

    console.log(`Got stream with id: ${streams[0].id}`);
    let stream: Stream | null | undefined = streams[0];

    if (!stream)
      stream = await this.createFromSerie(id);

    return stream;
  }

  async updateOneById(id: StreamId, stream: Stream): Promise<void> {
    const streamDocument = new StreamModel(stream);

    await StreamModel.findOneAndUpdate( {
      id,
    }, streamDocument);
  }
}