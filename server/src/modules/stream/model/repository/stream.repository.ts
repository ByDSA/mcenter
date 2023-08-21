import { SerieId, SerieRepository, SerieWithEpisodes } from "#modules/series/serie";
import { CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import Stream, { StreamId } from "../stream.entity";
import { Mode, StreamDocument, StreamModel } from "./odm/stream.odm";

type Params = {
  serieRepository: SerieRepository;
};
export default class StreamRepository
implements CanGetOneById<Stream, StreamId>,
CanUpdateOneById<Stream, StreamId> {
  #serieRepository: SerieRepository;

  constructor( {serieRepository}: Params) {
    this.#serieRepository = serieRepository;
  }

  createFromSerie(serie: SerieWithEpisodes): Promise<Stream | null> {
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

  async getOneById(id: StreamId): Promise<Stream | null> {
    console.log(`getting stream by id=${id}`);
    const streams = await StreamModel.find( {
      id,
    }, {
      _id: 0,
    } );
    const stream: Stream | null | undefined = streams[0];

    return stream;
  }

  async getOneByIdOrCreateFromSerie(id: StreamId): Promise<Stream | null> {
    let stream = await this.getOneById(id);

    if (!stream) {
      const serieId = id as SerieId;
      const serie = await this.#serieRepository.getOneById(serieId);

      if (!serie)
        return null;

      stream = await this.createFromSerie(serie);
    } else
      console.log(`Got stream with id=${stream.id}`);

    return stream;
  }

  async updateOneById(id: StreamId, stream: Stream): Promise<void> {
    await StreamModel.findOneAndUpdate( {
      id,
    }, stream);
  }
}