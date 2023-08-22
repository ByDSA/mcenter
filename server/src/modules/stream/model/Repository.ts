import { StreamWithHistoryList, StreamWithHistoryListRepository } from "#modules/streamWithHistoryList";
import { StreamModel } from "#modules/streamWithHistoryList/model/odm/stream.odm";
import { CanCreateOne, CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import Stream, { StreamId } from "./Stream";

export default class StreamRepository
implements CanGetOneById<Stream, StreamId>,
CanUpdateOneById<Stream, StreamId>,
CanCreateOne<Stream> {
  async createOne(stream: Stream): Promise<void> {
    const streamWithHistoryListRepository = new StreamWithHistoryListRepository();
    const streamWithHistoryList: StreamWithHistoryList = {
      id: stream.id,
      mode: stream.mode,
      history: [],
      group: stream.group,
      maxHistorySize: -1,
    };

    await streamWithHistoryListRepository.createOneAndGet(streamWithHistoryList);
  }

  async getOneById(id: StreamId): Promise<StreamWithHistoryList | null> {
    console.log(`getting stream by id=${id}`);
    const streams = await StreamModel.find( {
      id,
    }, {
      _id: 0,
    } );
    const stream: StreamWithHistoryList | null | undefined = streams[0];

    return stream;
  }

  async updateOneById(id: StreamId, stream: StreamWithHistoryList): Promise<void> {
    await StreamModel.findOneAndUpdate( {
      id,
    }, stream);
  }
}