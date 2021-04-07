const dateFormat = require('./dateFormat');

const set = require('date-fns').set;
const subDays = require('date-fns').subDays;
const endOfToday = require('date-fns').endOfToday;

const getUTCDatetimeString = (val) => {
    // is this an integer for an epoch timestamp, but given as a string?
    if (   typeof(val) === 'string'
        && !isNaN(parseInt(val))
        && /^\d+$/.test(val)
    ) {
        val = parseInt(val);
    }

    // is this an integer for an epoch timestamp?
    if (Number.isInteger(val) && val <= 4102444800) {
        return dateFormat(new Date(val * 1000), 'isoUtcDateTime');
    }

    // string with or without T separator, but without timezone specifier at the end,
    // like '2021-03-24T08:30:39'
    if (   typeof(val) === 'string'
        && val.length === 19
    ) {
        val = val + 'Z';
    }

    try {
        return dateFormat(new Date(val), 'isoUtcDateTime');
    } catch (e) {
        console.error(e);
        return null;
    }
};

const dateObjectToUTCDatetimeString = (o) => {
    return JSON.stringify(o).replace('"', '').substring(0, 19) + 'Z';
};

const DatetimeHelper = {
    getUTCDatetimeString,
    dateObjectToUTCDatetimeString,
    timelineConfig: {
        ticksNumber: 7,
        timelineIntervalStart: set(subDays(new Date(), 7), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
        timelineIntervalEnd: endOfToday(),
        selectedIntervalStart: set(subDays(new Date(), 1), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
        selectedIntervalEnd: endOfToday(),
    }
};

module.exports = DatetimeHelper;