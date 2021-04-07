const DatetimeHelper = require('../src/DatetimeHelper.js');
const set = require('date-fns').set;
const assert = require('assert').strict;

assert.deepEqual(
    [
        DatetimeHelper.getUTCDatetimeString('2021-04-03T16:18:05Z'),
        DatetimeHelper.getUTCDatetimeString('2021-04-03T16:18:05+0000'),

        DatetimeHelper.getUTCDatetimeString('2021-04-03T18:18:05+0200'),
        DatetimeHelper.getUTCDatetimeString('2021-03-24T09:30:39+0100'),

        DatetimeHelper.getUTCDatetimeString('2021-03-24T08:30:39'),
        DatetimeHelper.getUTCDatetimeString('2021-03-24 08:30:39'),

        DatetimeHelper.getUTCDatetimeString('1617466685'),
        DatetimeHelper.getUTCDatetimeString(1617466685),

        DatetimeHelper.getUTCDatetimeString('1617466685000'),
        DatetimeHelper.getUTCDatetimeString(1617466685000),
    ],
    [
        '2021-04-03T16:18:05Z',
        '2021-04-03T16:18:05Z',

        '2021-04-03T16:18:05Z',
        '2021-03-24T08:30:39Z',

        '2021-03-24T08:30:39Z',
        '2021-03-24T08:30:39Z',

        '2021-04-03T16:18:05Z',
        '2021-04-03T16:18:05Z',

        '2021-04-03T16:18:05Z',
        '2021-04-03T16:18:05Z',
    ]
);

assert.deepEqual(
    DatetimeHelper.getListOfHoursBetween(
        new Date(Date.UTC(2021, 0, 1, 0, 0, 0, 0)),
        new Date(Date.UTC(2021, 0, 1, 3, 0, 0, 0)),
    ),
    [
        '2021-01-01T00',
        '2021-01-01T01',
        '2021-01-01T02',
        '2021-01-01T03',
    ]
);

assert.deepEqual(
    DatetimeHelper.getListOfHoursBetween(
        new Date(Date.UTC(2021, 0, 1, 0, 0, 0, 1)),
        new Date(Date.UTC(2021, 0, 1, 3, 0, 0, 0)),
    ),
    [
        '2021-01-01T00',
        '2021-01-01T01',
        '2021-01-01T02',
        '2021-01-01T03',
    ]
);
