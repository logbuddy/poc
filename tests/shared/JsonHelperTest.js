const JsonHelper = require('../../shared/JsonHelper');
const assert = require('assert/strict');


console.debug(
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
    )
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