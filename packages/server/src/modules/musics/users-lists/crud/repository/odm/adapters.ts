import { Types } from "mongoose";
import { removeUndefinedDeep } from "$shared/utils/objects/removeUndefinedValues";
import { MusicUserList, MusicUserListEntity } from "$shared/models/musics/users-lists";
import { DocOdm, FullDocOdm } from "./odm";

export function modelToDocOdm(model: MusicUserList): DocOdm {
  const doc: DocOdm = {
    ownerUserId: new Types.ObjectId(model.ownerUserId),
    list: model.list.map((item) => ( {
      _id: item.id ? new Types.ObjectId(item.id) : new Types.ObjectId(),
      resourceId: new Types.ObjectId(item.resourceId),
      type: item.type,
    } )),
  };

  return removeUndefinedDeep(doc);
}

export function docOdmToEntity(doc: FullDocOdm): MusicUserListEntity {
  const entity: MusicUserListEntity = {
    id: doc._id.toString(),
    ownerUserId: doc.ownerUserId.toString(),
    list: doc.list.map((item) => ( {
      id: item._id?.toString() ?? new Types.ObjectId().toString(),
      resourceId: item.resourceId.toString(),
      type: item.type,
      resource: undefined, // Se rellena en capa superior si es necesario, o via aggregate
    } )),
  };

  return removeUndefinedDeep(entity);
}
