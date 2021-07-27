import { Schema } from "mongoose";
import { TypeResource } from "../resource";
import { TimestampInterface } from "../timestamp";

export type HistoryItem = {
    idResource: Schema.Types.ObjectId;
    typeResource: TypeResource;
    date: number;
};

export default interface Interface extends TimestampInterface {
    _id?: Schema.Types.ObjectId;
    name: string;
    content?: HistoryItem[];
}
