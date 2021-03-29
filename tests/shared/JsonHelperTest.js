const JsonHelper = require('../../shared/JsonHelper');
const assert = require('assert/strict');

const res =
    JsonHelper.splitObjectPaths(
        {
            name: "test",
            lols: ['abc', 'de', { hurks: 'murks' }],
            address: {
                personal: 'abc',
                office: {
                    pets: ['cat', 'dog'],
                    building: 'random',
                    street: 'some street',
                    users: [
                        { firstname: 'Han', lastname: 'Solo', pets: ['horse', 'turtle'] },
                        { firstname: 'Luke', lastname: 'Skywalker' },
                    ]
                }
            }
        }
    );

console.debug(JSON.stringify(res, null, 2))

assert.deepEqual(
    res,
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
            "address.personal": "abc"
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
            "address.office.users.firstname": "Luke"
        },
        {
            "address.office.users.lastname": "Skywalker"
        }
    ]
);
