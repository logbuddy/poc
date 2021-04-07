import DatetimeHelper from '../../shared/DatetimeHelper.mjs';
import { strict as assert } from 'assert';

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
