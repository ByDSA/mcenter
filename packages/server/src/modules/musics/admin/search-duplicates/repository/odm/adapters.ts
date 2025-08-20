import { DocOdm } from "./odm";

export function docOdmsToModels(docOdms: DocOdm[]) {
  return docOdms.map(d=> (d.group.map(i=>i.toString())));
}
