import { StreamId } from "#modules/streams";
import { CanCreateOneAndGet, CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import { StreamWithHistoryList } from "../models";
import { ModelOdm } from "./Stream.odm";

/**
 * @deprecated
 */
export default class Repository
implements CanGetOneById<StreamWithHistoryList, StreamId>,
CanUpdateOneById<StreamWithHistoryList, StreamId>,
CanCreateOneAndGet<StreamWithHistoryList> {
  async createOneAndGet(model: StreamWithHistoryList): Promise<StreamWithHistoryList> {
    return ModelOdm.create(model);
  }

  async getOneById(id: StreamId): Promise<StreamWithHistoryList | null> {
    console.log(`getting stream by id=${id}`);
    const streams = await ModelOdm.find( {
      id,
    }, {
      _id: 0,
    } );
    const stream: StreamWithHistoryList | null | undefined = streams[0];

    return stream ?? null;
  }

  async updateOneById(id: StreamId, model: StreamWithHistoryList): Promise<void> {
    await ModelOdm.findOneAndUpdate( {
      id,
    }, model);
  }
}