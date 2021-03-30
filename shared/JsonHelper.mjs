const flattenObject = (obj, parent = null, res = []) => {
    if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const propName = parent ? parent + '|/herodot/|' + key : key;
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


const getBrokenDownKeysAndValues = (arr) => {
    const res = [];
    for (let obj of arr) {
        for (let objKey in obj) {
            const val = obj[objKey];
            const parts = objKey.split('|/herodot/|').reverse();
            let prevPart = null;
            for (let part of parts) {
                let thisPart = part;
                if (prevPart !== null) {
                    thisPart = thisPart + '|/herodot/|' + prevPart;
                }
                prevPart = thisPart;
                const newObj = {};
                newObj[thisPart] = val;
                res.push(newObj);
            }
        }
    }
    return res;
};

const getUniqueValues = (arr) => {
    const res = [];
    for (let obj of arr) {
        for (let objKey in obj) {
            if (!res.includes(obj[objKey])) {
                res.push(obj[objKey]);
            }
        }
    }
    return res;
};

const JsonHelper = {
    flattenToKeyValuePairs,
    getBrokenDownKeysAndValues,
    getUniqueValues
}

export default JsonHelper;
