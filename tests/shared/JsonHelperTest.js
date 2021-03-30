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
                    { firstname: 'Han', lastname: 'Solo', pets: ['horse', 'turtle'], children: [ { firstname: 'Kylo', lastname: null, pets: ['tiger'] } ] },
                    { firstname: 'Luke', lastname: 'Skywalker' },
                ]
            }
        }
    }),
    [
        {
            "name": "test"
        },
        {
            "lols": "abc"
        },
        {
            "lols": "de"
        },
        {
            "lols.hurks": "murks"
        },
        {
            "address.personal": null
        },
        {
            "address.office.pets": "cat"
        },
        {
            "address.office.pets": "dog"
        },
        {
            "address.office.building": "random"
        },
        {
            "address.office.street": "some street"
        },
        {
            "address.office.users.firstname": "Han"
        },
        {
            "address.office.users.lastname": "Solo"
        },
        {
            "address.office.users.pets": "horse"
        },
        {
            "address.office.users.pets": "turtle"
        },
        {
            "address.office.users.children.firstname": "Kylo"
        },
        {
            "address.office.users.children.lastname": null
        },
        {
            "address.office.users.children.pets": "tiger"
        },
        {
            "address.office.users.firstname": "Luke"
        },
        {
            "address.office.users.lastname": "Skywalker"
        }
    ]
);
