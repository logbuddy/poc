import dateFormat from './dateFormat.js';

const set = require('date-fns').set;
const subDays = require('date-fns').subDays;
const addHours = require('date-fns').addHours;
const endOfToday = require('date-fns').endOfToday;
const parse = require('date-fns').parse;

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

const dateObjectToUTCDatetimeString = (o) =>
    JSON.stringify(o).replace('"', '').substr(0, 19) + 'Z'
;

const getListOfHoursBetweenUtcDateStrings = (startString, endString) => {
    const hours = [];

    let currentHour = new Date(
        Date.UTC(
            startString.substr(0, 4),
            parseInt(startString.substr(5, 2)) - 1,
            startString.substr(8, 2),
            startString.substr(11, 2),
        )
    );

    const endDate = new Date(
        Date.UTC(
            endString.substr(0, 4),
            parseInt(endString.substr(5, 2)) - 1,
            endString.substr(8, 2),
            endString.substr(11, 2),
        )
    );

    while (currentHour <= endDate) {
        hours.push(
            JSON.stringify(currentHour).replace('"', '').substring(0, 13)
        );
        currentHour = addHours(currentHour, 1);
    }
    return hours;
};

const DatetimeHelper = {
    getUTCDatetimeString,
    dateObjectToUTCDatetimeString,
    getListOfHoursBetweenUtcDateStrings,
    timelineConfig: {
        ticksNumber: 7,
        timelineIntervalStart: set(subDays(new Date(), 7), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
        timelineIntervalEnd: endOfToday(),
        selectedTimelineIntervalStart: set(subDays(new Date(), 1), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 }),
        selectedTimelineIntervalEnd: endOfToday(),
    }
};

export default DatetimeHelper;
