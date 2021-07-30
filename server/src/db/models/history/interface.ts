import { ResourceType } from "@models/resources/resource";
import { TimestampInterface } from "@models/timestamp";
import { Schema } from "mongoose";

export type HistoryItem = {
    idResource: Schema.Types.ObjectId;
    typeResource: ResourceType;
    date: number;
};

export default interface Interface extends TimestampInterface {
    _id?: Schema.Types.ObjectId;
    name: string;
    content?: HistoryItem[];
}
