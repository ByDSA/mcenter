import { Serie, SerieId, SerieRepository } from "#modules/series/serie";
import { CanFindById, CanUpdateOneById, Repository } from "#modules/utils/base/repository";
import Stream, { StreamId } from "../stream.entity";
import { Mode, StreamDocument, StreamModel } from "./odm/stream.odm";

/* eslint-disable class-methods-use-this */
export default class StreamRepository
  extends Repository
  implements
CanFindById<Stream, StreamId>,
CanUpdateOneById<Stream, StreamId> {
  createFromSerie(serie: Serie): Promise<Stream | null> {
    const serieId = serie.id as SerieId;

    console.log(`createFromSerie ${serieId}`);

    if (!serie)
      return Promise.resolve(null);

    const newStream: StreamDocument = new StreamModel( {
      id: serieId,
      group: `series/${serieId}`,
      mode: Mode.SEQUENTIAL,
      maxHistorySize: 1,
      history: [
      ],
    } );

    return newStream.save();
  }

  async findOneById(id: StreamId): Promise<Stream | null> {
    console.log(`getting stream by id=${id}`);
    const streams = await StreamModel.find( {
      id,
    }, {
      _id: 0,
    } );
    let stream: Stream | null | undefined = streams[0];

    if (!stream) {
      const serieId = id as SerieId;
      const serie = await SerieRepository.getInstance<SerieRepository>().findOneById(serieId);

      if (!serie)
        return null;

      stream = await this.createFromSerie(serie);
    } else
      console.log(`Got stream with id=${streams[0].id}`);

    return stream;
  }

  async updateOneById(id: StreamId, stream: Stream): Promise<void> {
    await StreamModel.findOneAndUpdate( {
      id,
    }, stream);
  }
}