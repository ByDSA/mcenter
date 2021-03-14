import { AbstractPicker } from "./AbstractPicker";

export class Picker<T> extends AbstractPicker<T> {
    throwDart(dart: number): T | undefined {
        return this.data[dart];
    }
}