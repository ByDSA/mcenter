import { AllKeysOf } from "$shared/utils/types";
import { Types } from "mongoose";
import { Stream, StreamEntity } from "../../../models";
import { DocOdm, FullDocOdm } from "./odm";

export function streamDocOdmToModel(docOdm: DocOdm): Stream {
  return {
    key: docOdm.key,
    group: groupDocOdmToModel(docOdm.group),
    mode: docOdm.mode,
  };
}

export function streamDocOdmToEntity(docOdm: FullDocOdm): StreamEntity {
  return {
    ...streamDocOdmToModel(docOdm),
    id: docOdm._id.toString(),
  };
}

function groupDocOdmToModel(groupDocOdm: DocOdm["group"]): Stream["group"] {
  return {
    origins: groupDocOdm.origins.map(originDocOdm => ( {
      type: originDocOdm.type,
      id: originDocOdm.id,
    } )),
  };
}

export function streamToDocOdm(model: Stream): DocOdm {
  return {
    key: model.key,
    group: model.group,
    mode: model.mode,
  } satisfies AllKeysOf<Omit<DocOdm, "_id">>;
}

export function entityToFullDoc(entity: StreamEntity): FullDocOdm {
  return {
    _id: new Types.ObjectId(entity.id),
    ...streamToDocOdm(entity),
  } satisfies AllKeysOf<FullDocOdm>;
}
