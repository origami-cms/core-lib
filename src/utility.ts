export interface SymbolMap {
    [key: string]: Symbol;
}
// Converts array of strings into object of symbols
export const symbols = (arr: string[]): SymbolMap =>
    arr.reduce((o, i) => {
        o[i] = Symbol(i);

        return o;
    }, {} as SymbolMap);



interface KeyError extends Error {
    key: string;
}

/** Ensure all the keys are present on the object */
export const requireKeys = (arr: string[], obj: { [key: string]: any }) => {
    arr.forEach(i => {
        if (!Object.keys(obj).includes(i)) {
            const e = new Error(`Missing key ${i}`) as KeyError;
            e.key = i;
            throw e;
        }
    });
};
