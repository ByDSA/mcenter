import { StreamWithHistoryList, StreamWithHistoryListModelOdm, StreamWithHistoryListRepository } from "#modules/streamsWithHistoryList";
import { CanCreateOne, CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import Model, { ModelId } from "../models/Stream";

export default class Repository
implements CanGetOneById<Model, ModelId>,
CanUpdateOneById<Model, ModelId>,
CanCreateOne<Model> {
  async createOne(stream: Model): Promise<void> {
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

  async getOneById(id: ModelId): Promise<StreamWithHistoryList | null> {
    console.log(`getting stream by id=${id}`);
    const streams = await StreamWithHistoryListModelOdm.find( {
      id,
    }, {
      _id: 0,
    } );
    const stream: StreamWithHistoryList | null | undefined = streams[0];

    return stream;
  }

  async updateOneById(id: ModelId, stream: StreamWithHistoryList): Promise<void> {
    await StreamWithHistoryListModelOdm.findOneAndUpdate( {
      id,
    }, stream);
  }
}