import { TimestampInterface } from "../timestamp";

export type TypeResource = "Music" | "Video" | { serieId: string };

export type HistoryItem = {
    idResource: string;
    date: number;
};

export default interface Interface extends TimestampInterface {
    _id?: string;
    name: string;
    typeResource: TypeResource;
    content?: HistoryItem[];
}
