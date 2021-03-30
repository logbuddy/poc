import JsonHelper from '../../shared/JsonHelper.mjs';
import { strict as assert } from 'assert';

assert.deepEqual(
    JsonHelper.flattenToKeyValuePairs('Hello'),
    'Hello'
);

assert.deepEqual(
    JsonHelper.flattenToKeyValuePairs([1, 2, 3]),
    []
);

assert.deepEqual(
    JsonHelper.flattenToKeyValuePairs([1, 2, 3, { foo: 'bar' }]),
    [ { foo: 'bar' } ]
);

assert.deepEqual(
    JsonHelper.flattenToKeyValuePairs([ { foo: 'bar' } ]),
    [ { foo: 'bar' } ]
);

assert.deepEqual(
    JsonHelper.flattenToKeyValuePairs({
        name: 'test',
        lols: ['abc', 'de', { hurks: 123.456 }],
        address: {
            personal: null,
            office: {
                pets: ['cat', 'dog'],
                building: 'random',
                street: 'some street',
                users: [
                    { firstname: 'Han', lastname: 'Solo', pets: ['horse', 'turtle'], children: [ { firstname: 'Kylo', 'lastname': null, pets: ['tiger'] } ] },
                    { firstname: 'Luke', lastname: 'Skywalker' },
                ]
            }
        }
    }),
    [
        { 'name': 'test' },
        { 'lols': 'abc' },
        { 'lols': 'de' },
        { 'lols|/herodot/|hurks': 123.456 },
        { 'address|/herodot/|personal': null },
        { 'address|/herodot/|office|/herodot/|pets': 'cat' },
        { 'address|/herodot/|office|/herodot/|pets': 'dog' },
        { 'address|/herodot/|office|/herodot/|building': 'random' },
        { 'address|/herodot/|office|/herodot/|street': 'some street' },
        { 'address|/herodot/|office|/herodot/|users|/herodot/|firstname': 'Han' },
        { 'address|/herodot/|office|/herodot/|users|/herodot/|lastname': 'Solo' },
        { 'address|/herodot/|office|/herodot/|users|/herodot/|pets': 'horse' },
        { 'address|/herodot/|office|/herodot/|users|/herodot/|pets': 'turtle' },
        { 'address|/herodot/|office|/herodot/|users|/herodot/|children|/herodot/|firstname': 'Kylo' },
        { 'address|/herodot/|office|/herodot/|users|/herodot/|children|/herodot/|lastname': null },
        { 'address|/herodot/|office|/herodot/|users|/herodot/|children|/herodot/|pets': 'tiger' },
        { 'address|/herodot/|office|/herodot/|users|/herodot/|firstname': 'Luke' },
        { 'address|/herodot/|office|/herodot/|users|/herodot/|lastname': 'Skywalker' }
    ]
);


assert.deepEqual(
    JsonHelper.getBrokenDownKeysAndValues(
    [
            { 'name': 'test' },
            { 'lols': 'abc' },
            { 'lols': 'de' },
            { 'lols|/herodot/|hurks': 123.456 },
            { 'address|/herodot/|office|/herodot/|pets': 'cat' }
        ]
    ),
    [
        { 'name': 'test' },
        { 'lols': 'abc' },
        { 'lols': 'de' },
        { 'hurks': 123.456 },
        { 'lols|/herodot/|hurks': 123.456 },
        { 'pets': 'cat' },
        { 'office|/herodot/|pets': 'cat' },
        { 'address|/herodot/|office|/herodot/|pets': 'cat' }
    ]
);


assert.deepEqual(
    JsonHelper.getUniqueValues(
        [
            { 'name': 'test' },
            { 'lols': 'abc' },
            { 'lols': 'de' },
            { 'hurks': 123.456 },
            { 'lols|/herodot/|hurks': 123.456 },
            { 'pets': 'cat' },
            { 'office|/herodot/|pets': 'cat' },
            { 'address|/herodot/|office|/herodot/|pets': 'cat' }
        ]
    ),
    [
        'test',
        'abc',
        'de',
        123.456,
        'cat'
    ]
);
