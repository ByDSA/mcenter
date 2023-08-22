import { StreamWithHistoryListRepository } from "#modules/streamsWithHistoryList";
import { assertFound } from "#utils/http/validation";
import { CanCreateOne, CanGetOneById, CanUpdateOneById } from "#utils/layers/repository";
import HistoryList, { HistoryListId } from "../models/HistoryList";
import { historyListToStreamWithHistoryList, streamWithHistoryListToHistoryList } from "../models/adapters";

export default class HistoryListRepository
implements CanUpdateOneById<HistoryList, HistoryListId>,
CanGetOneById<HistoryList, HistoryListId>,
CanCreateOne<HistoryList> {
  #streamWithHistoryListRepository: StreamWithHistoryListRepository;

  constructor() {
    this.#streamWithHistoryListRepository = new StreamWithHistoryListRepository();
  }

  async createOne(historyList: HistoryList): Promise<void> {
    const streamWithHistoryList = await this.#streamWithHistoryListRepository.getOneById(historyList.id);

    if (streamWithHistoryList)
      return;

    await this.#streamWithHistoryListRepository.createOneAndGet(historyListToStreamWithHistoryList(historyList));
  }

  async getOneById(id: HistoryListId): Promise<HistoryList | null> {
    const streamId = id;
    const stream = await this.#streamWithHistoryListRepository.getOneById(streamId);

    if (!stream)
      return null;

    return streamWithHistoryListToHistoryList(stream);
  }

  async updateOneById(id: HistoryListId, list: HistoryList): Promise<void> {
    const streamId = id;
    const stream = await this.#streamWithHistoryListRepository.getOneById(streamId);

    assertFound(stream);
    stream.history = list.entries;

    await this.#streamWithHistoryListRepository.updateOneById(streamId, stream);
  }
}