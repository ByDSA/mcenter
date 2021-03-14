import { Picker } from "./Picker";

export class RemoverPicker<T> extends Picker<T> {
    onAfterPick = (picked: T): void => {
        let index: number = this.data.indexOf(picked);
        if (index === -1)
            return;

        this.data.splice(index, 1);
    }
}