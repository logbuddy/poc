const separator = '|/herodot/|';

const pushIfNew = (val, res) => {
    if (!res.includes(val)) {
        res.push(val);
    }
};

const flattenObject = (obj, parent = null, res = []) => {
    if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const propName = parent ? parent + separator + key : key;
                if (typeof obj[key] === 'object' && !Array.isArray(obj[key]) && obj[key] !== null) {
                    flattenObject(obj[key], propName, res);
                } else if (Array.isArray(obj[key])) {
                    for (let i in obj[key]) {
                        if (typeof obj[key][i] === 'object' && !Array.isArray(obj[key][i]) && obj[key][i] !== null) {
                            res.push(flattenObject(obj[key][i], propName));
                        } else {
                            const resEntry = {};
                            resEntry[propName] = flattenObject(obj[key][i], propName);
                            res.push(resEntry);
                        }
                    }
                } else {
                    const resEntry = {};
                    resEntry[propName] = obj[key];
                    res.push(resEntry);
                }
            }
        }
        return res;
    } else {
        return obj;
    }
}

const flattenToKeyValuePairs = (elem, res = []) => {
    if (Array.isArray(elem)) {
        for (let arrVal of elem) {
            flattenToKeyValuePairs(arrVal, res);
        }
    } else if (typeof elem === 'object' && elem !== null) {
        res.push(flattenObject(elem).flat(999));
    } else {
        return elem;
    }
    return res.flat(999);
}

const getBrokenDownKeys = (arr) => {
    const res = [];
    for (let obj of arr) {
        for (let objKey in obj) {
            const val = obj[objKey];
            const parts = objKey.split(separator).reverse();
            let prevPart = null;
            for (let part of parts) {
                let thisPart = part;
                if (prevPart !== null) {
                    thisPart = thisPart + separator + prevPart;
                }
                prevPart = thisPart;
                pushIfNew(thisPart, res);
            }
        }
    }
    return res;
};

const getBrokenDownKeysAndValues = (arr) => {
    const res = [];
    for (let obj of arr) {
        for (let objKey in obj) {
            const val = obj[objKey];
            const parts = objKey.split(separator).reverse();
            let prevPart = null;
            for (let part of parts) {
                let thisPart = part;
                if (prevPart !== null) {
                    thisPart = thisPart + separator + prevPart;
                }
                prevPart = thisPart;
                pushIfNew(thisPart + separator + val, res);
            }
        }
    }
    return res;
};

const getBrokenDownValues = (elem, res = []) => {
    if (elem === null) {
        pushIfNew(elem, res);
        return res;
    }

    if (Array.isArray(elem)) {
        for (let arrElem of elem) {
            getBrokenDownValues(arrElem, res);
        }
        return res;
    }

    if (typeof(elem) === 'object') {
        for (let objKey in elem) {
            getBrokenDownValues(elem[objKey], res);
        }
        return res;
    }

    pushIfNew(elem, res)
    return res;
};

export const JsonHelper = {
    flattenToKeyValuePairs,
    getBrokenDownKeys,
    getBrokenDownKeysAndValues,
    getBrokenDownValues,
    separator
}

export default JsonHelper;
