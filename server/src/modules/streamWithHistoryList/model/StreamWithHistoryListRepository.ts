import { StreamId } from "#modules/stream";
import { CanCreateOneAndGet, CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import StreamWithHistoryList from "./StreamWithHistoryList";
import { StreamModel } from "./odm/stream.odm";

/**
 * @deprecated
 */
export default class StreamWithHistoryListRepository
implements CanGetOneById<StreamWithHistoryList, StreamId>,
CanUpdateOneById<StreamWithHistoryList, StreamId>,
CanCreateOneAndGet<StreamWithHistoryList> {
  async createOneAndGet(streamWithHistoryList: StreamWithHistoryList): Promise<StreamWithHistoryList> {
    return StreamModel.create(streamWithHistoryList);
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