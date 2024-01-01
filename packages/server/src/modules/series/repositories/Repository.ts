import { deepMerge } from "#shared/utils/objects";
import { CanCreateOneAndGet, CanGetAll, CanGetOneById, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { Model, ModelId } from "../models";
import RelationWithStreamFixer from "./RelationshipWithStreamFixer";
import { docOdmToModel } from "./adapters";
import { DocOdm, ModelOdm } from "./odm";

type CreationOptions = {
  ignoreStream?: boolean;
};
const DEFAULT_CREATION_OPTIONS: Required<CreationOptions> = {
  ignoreStream: false,
};

type Params = {
  relationshipWithStreamFixer: RelationWithStreamFixer;
};

export default class Repository
implements CanGetOneById<Model, ModelId>,
CanUpdateOneByIdAndGet<Model, ModelId>,
CanCreateOneAndGet<Model>,
CanGetAll<Model>
{
  #relationshipWithStreamFixer: RelationWithStreamFixer;

  constructor( {relationshipWithStreamFixer: relationshipWithStream}: Params) {
    this.#relationshipWithStreamFixer = relationshipWithStream;
  }

  async getAll(): Promise<Model[]> {
    const seriesDocOdm = await ModelOdm.find();

    return seriesDocOdm.map(docOdmToModel);
  }

  async createOneAndGet(model: Model, options: CreationOptions = DEFAULT_CREATION_OPTIONS): Promise<Model> {
    const actualOptions = deepMerge(DEFAULT_CREATION_OPTIONS, options);
    const serieOdm: DocOdm = await ModelOdm.create(model).then(s => s.save());
    const serie = docOdmToModel(serieOdm);

    if (!actualOptions.ignoreStream)
      await this.#relationshipWithStreamFixer.fixDefaultStreamForSerie(serie.id);

    return serie;
  }

  async getOneById(id: ModelId): Promise<Model | null> {
    const [serieDB]: DocOdm[] = await ModelOdm.find( {
      id,
    }, {
      _id: 0,
    } );

    if (!serieDB)
      return null;

    return docOdmToModel(serieDB);
  }

  async updateOneByIdAndGet(id: ModelId, serie: Model): Promise<Model | null> {
    const docOdm = await ModelOdm.findOneAndUpdate( {
      id,
    }, serie, {
      new: true,
    } );

    if (!docOdm)
      return null;

    return docOdmToModel(docOdm);
  }
}