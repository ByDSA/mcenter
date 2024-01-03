import { DepsFromMap, injectDeps } from "#utils/layers/deps";
import { CanCreateOneAndGet, CanGetAll, CanGetOneById, CanUpdateOneByIdAndGet } from "#utils/layers/repository";
import { Model, ModelId } from "../models";
import { docOdmToModel } from "./adapters";
import { DocOdm, ModelOdm } from "./odm";

const DepsMap = {
};

type Deps = DepsFromMap<typeof DepsMap>;
@injectDeps(DepsMap)
export default class SeriesRepository
implements CanGetOneById<Model, ModelId>,
CanUpdateOneByIdAndGet<Model, ModelId>,
CanCreateOneAndGet<Model>,
CanGetAll<Model>
{
  #deps: Deps;

  constructor(deps?: Partial<Deps>) {
    this.#deps = deps as Deps;
  }

  async getAll(): Promise<Model[]> {
    const seriesDocOdm = await ModelOdm.find();

    return seriesDocOdm.map(docOdmToModel);
  }

  async createOneAndGet(model: Model): Promise<Model> {
    const serieOdm: DocOdm = await ModelOdm.create(model).then(s => s.save());
    const serie = docOdmToModel(serieOdm);

    // TODO: pasar a broker message esto: que se cree el stream si no existe al crear la serie
    // Comentado para eliminar dependencias circulares
    // const actualOptions = deepMerge(DEFAULT_CREATION_OPTIONS, options);
    // if (!actualOptions.ignoreStream)
    //   await this.#relationshipWithStreamFixer.fixDefaultStreamForSerie(serie.id);

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