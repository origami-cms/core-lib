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
