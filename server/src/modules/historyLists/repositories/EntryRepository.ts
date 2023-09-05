import { ModelId } from "#modules/episodes/models";
import { CanCreateOneBySuperId } from "#utils/layers/repository";
import { Entry } from "../models";
import { entryToDocOdm } from "./adapters";
import { ModelOdm } from "./odm";

export default class EntryRepository
implements CanCreateOneBySuperId<Entry, ModelId> {
  async createOneBySuperId(id: ModelId, entry: Entry): Promise<void> {
    const entryDocOdm = entryToDocOdm(entry);

    await ModelOdm.updateOne( {
      id,
    }, {
      $push: {
        entries: entryDocOdm,
      },
    } );

    console.log("Añadido al historial!", entry);
  }
}