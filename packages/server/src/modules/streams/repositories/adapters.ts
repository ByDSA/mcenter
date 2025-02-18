import { Stream } from "../models";
import { DocOdm } from "./odm";

export function streamDocOdmToModel(docOdm: DocOdm): Stream {
  return {
    id: docOdm.id,
    group: groupDocOdmToModel(docOdm.group),
    mode: docOdm.mode,
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
    id: model.id,
    group: model.group,
    mode: model.mode,
  };
}
