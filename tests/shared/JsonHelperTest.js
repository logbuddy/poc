const JsonHelper = require('../../shared/JsonHelper');
const assert = require('assert/strict');

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
        lols: ['abc', 'de', { hurks: 'murks' }],
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
        { name: 'test' },
        { lols: 'abc' },
        { lols: 'de' },
        { 'lols|/logbuddy/|hurks': 'murks' },
        { 'address|/logbuddy/|personal': null },
        { 'address|/logbuddy/|office|/logbuddy/|pets': 'cat' },
        { 'address|/logbuddy/|office|/logbuddy/|pets': 'dog' },
        { 'address|/logbuddy/|office|/logbuddy/|building': 'random' },
        { 'address|/logbuddy/|office|/logbuddy/|street': 'some street' },
        { 'address|/logbuddy/|office|/logbuddy/|users|/logbuddy/|firstname': 'Han' },
        { 'address|/logbuddy/|office|/logbuddy/|users|/logbuddy/|lastname': 'Solo' },
        { 'address|/logbuddy/|office|/logbuddy/|users|/logbuddy/|pets': 'horse' },
        { 'address|/logbuddy/|office|/logbuddy/|users|/logbuddy/|pets': 'turtle' },
        { 'address|/logbuddy/|office|/logbuddy/|users|/logbuddy/|children|/logbuddy/|firstname': 'Kylo' },
        { 'address|/logbuddy/|office|/logbuddy/|users|/logbuddy/|children|/logbuddy/|lastname': null },
        { 'address|/logbuddy/|office|/logbuddy/|users|/logbuddy/|children|/logbuddy/|pets': 'tiger' },
        { 'address|/logbuddy/|office|/logbuddy/|users|/logbuddy/|firstname': 'Luke' },
        { 'address|/logbuddy/|office|/logbuddy/|users|/logbuddy/|lastname': 'Skywalker' }
    ]
);
