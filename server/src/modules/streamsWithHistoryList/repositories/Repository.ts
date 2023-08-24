import { StreamId } from "#modules/streams";
import { CanCreateOneAndGet, CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import { Model } from "../models";
import { ModelOdm } from "./stream.odm";

/**
 * @deprecated
 */
export default class StreamWithHistoryListRepository
implements CanGetOneById<Model, StreamId>,
CanUpdateOneById<Model, StreamId>,
CanCreateOneAndGet<Model> {
  async createOneAndGet(model: Model): Promise<Model> {
    return ModelOdm.create(model);
  }

  async getOneById(id: StreamId): Promise<Model | null> {
    console.log(`getting stream by id=${id}`);
    const streams = await ModelOdm.find( {
      id,
    }, {
      _id: 0,
    } );
    const stream: Model | null | undefined = streams[0];

    return stream ?? null;
  }

  async updateOneById(id: StreamId, model: Model): Promise<void> {
    await ModelOdm.findOneAndUpdate( {
      id,
    }, model);
  }
}