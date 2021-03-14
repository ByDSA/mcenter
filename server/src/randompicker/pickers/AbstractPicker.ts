export abstract class AbstractPicker<DATA, PICK_TYPE = DATA> {
    constructor(protected data: DATA[]) {
    }

    onAfterPick: ((t: PICK_TYPE) => void) | undefined;

    abstract throwDart(dart: number): PICK_TYPE | undefined;

    pickOne(): PICK_TYPE | undefined {
        if (this.weight == 0)
            return undefined;

        let dart = Math.floor(Math.random() * this.weight);

        const ret = this.throwDart(dart);

        if (ret && this.onAfterPick)
            this.onAfterPick(ret);

        return ret;
    }

    get weight(): number {
        return this.data.length;
    }

    pick(n: number = 1): (PICK_TYPE)[] {
        let ret: (PICK_TYPE)[] = [];
        for (let i = 0; i < n; i++) {
            const picked = this.pickOne();
            if (picked)
                ret.push(picked);
        }
        return ret;
    }
}