import { DatetimeHelper } from '../src/index.js';
import { strict as assert } from 'assert';

export default () => {
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
        DatetimeHelper.getListOfHoursBetweenUtcDateStrings(
            '2021-01-01T00:00:00Z',
            '2021-01-01T03:00:00Z',
        ),
        [
            '2021-01-01T00',
            '2021-01-01T01',
            '2021-01-01T02',
            '2021-01-01T03',
        ]
    );

    assert.deepEqual(
        DatetimeHelper.getListOfHoursBetweenUtcDateStrings(
            '2021-01-01T00:00:00Z',
            '2021-01-01T02:59:59Z',
        ),
        [
            '2021-01-01T00',
            '2021-01-01T01',
            '2021-01-01T02',
        ]
    );

    assert.deepEqual(
        DatetimeHelper.getListOfHoursBetweenUtcDateStrings(
            '2021-01-01T00:59:59Z',
            '2021-01-01T02:59:59Z',
        ),
        [
            '2021-01-01T00',
            '2021-01-01T01',
            '2021-01-01T02',
        ]
    );

    assert.deepEqual(
        DatetimeHelper.getListOfHoursBetweenUtcDateStrings(
            '2021-01-31T23:05:07.348Z',
            '2021-02-01T01:59:59Z',
        ),
        [
            '2021-01-31T23',
            '2021-02-01T00',
            '2021-02-01T01',
        ]
    );
};
