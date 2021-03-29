const JsonHelper = require('../../shared/JsonHelper');
const assert = require('assert/strict');


console.debug(
    JSON.stringify(
    JsonHelper.splitObjectPaths(
        {
            name: "test",
            lols: ['abc', 'de', { hurks: 'murks' }],
            address: {
                personal: "abc",
                office: {
                    building: 'random',
                    street: 'some street',
                    users: [
                        { name: 'Han' },
                        { name: 'Luke' },
                    ]
                }
            }
        }
    ), null, 2)
);

/*
assert.deepEqual(
    JsonHelper.splitObjectPaths({ foo: { bar: 'baz' } }),
    [
        'foo',
        'foo.bar',
        'bar'
    ]
);
*/