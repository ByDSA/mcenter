import { Model } from "../models";
import { DocOdm } from "./odm";

export function docOdmToModel(docOdm: DocOdm): Model {
  return {
    id: docOdm.id,
    group: groupDocOdmToModel(docOdm.group),
    mode: docOdm.mode,
  };
}

function groupDocOdmToModel(groupDocOdm: DocOdm["group"]): Model["group"] {
  return {
    origins: groupDocOdm.origins.map(originDocOdm => ( {
      type: originDocOdm.type,
      id: originDocOdm.id,
    } )),
  };
}

export function modelToDocOdm(model: Model): DocOdm {
  return {
    id: model.id,
    group: model.group,
    mode: model.mode,
  };
}