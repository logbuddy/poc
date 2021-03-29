const flattenObject = (obj, parent = null, res = []) => {
    if (typeof obj === 'object' && !Array.isArray(obj) && obj !== null) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const propName = parent ? parent + '.' + key : key;
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

module.exports = {
    flattenToKeyValuePairs
}