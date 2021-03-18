function integers(size: number): number[] {
    let arr: number[] = [];
    for (let i = 0; i < size; i++) {
        const n = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER + Math.random());
        arr.push(n); // storing random integers in an array
    }

    return arr;
}

export { integers };
