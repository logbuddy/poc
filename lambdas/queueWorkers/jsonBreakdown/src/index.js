import { JsonHelper } from 'herodot-shared';

const AWS = require('aws-sdk');

const AWS_REGION = 'eu-central-1';


const consoleOp = false;
const _console = {};
_console.debug = (...data) => {
    if (consoleOp) console.debug(...data);
}
_console.log = (...data) => {
    if (consoleOp) console.log(...data);
}
_console.error = (...data) => {
    if (consoleOp) console.error(...data);
}


AWS.config.update({region: AWS_REGION});
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    for (const record of event.Records) {
        _console.log(record.eventID);
        _console.log(record.eventName);
        _console.log('DynamoDB Record: %j', record.dynamodb);

        if (   record.eventName === 'INSERT'
            && record.dynamodb.hasOwnProperty('NewImage')
            && record.dynamodb.NewImage.hasOwnProperty('servers_id')
            && record.dynamodb.NewImage.hasOwnProperty('sort_value')
            && record.dynamodb.NewImage.hasOwnProperty('server_event_created_at')
            && record.dynamodb.NewImage.hasOwnProperty('server_event_created_at_utc')
            && record.dynamodb.NewImage.hasOwnProperty('server_event_source')
            && record.dynamodb.NewImage.hasOwnProperty('server_event_payload')
            && record.dynamodb.NewImage['server_event_payload'].hasOwnProperty('S')
        ) {
            _console.debug('Valid INSERT detected.');

            _console.debug('Trying to parse payload as JSON', record.dynamodb.NewImage['server_event_payload'].S);

            let parsedJson = null;
            try {
                parsedJson = JSON.parse(record.dynamodb.NewImage['server_event_payload'].S);
            } catch (e) {
                _console.error('Cannot parse payload into valid JSON', e);
            }

            if (parsedJson === null) {
                _console.error('Could not parse payload into valid JSON');
            } else {

                if (typeof parsedJson === 'object') {
                    const brokenDownKeys = JsonHelper.getBrokenDownKeys(
                        JsonHelper.flattenToKeyValuePairs(parsedJson)
                    );

                    _console.debug(
                        'brokenDownKeys',
                        brokenDownKeys
                    );

                    const brokenDownKeysItems = [];
                    for (let brokenDownKey of brokenDownKeys) {
                        brokenDownKeysItems.push({
                            PutRequest: {
                                Item: {
                                    'servers_id_key': record.dynamodb.NewImage['servers_id'].S + '_' + brokenDownKey,
                                    'sort_value': record.dynamodb.NewImage['sort_value'].S,
                                    'servers_id': record.dynamodb.NewImage['servers_id'].S,
                                    'users_id': record.dynamodb.NewImage['users_id'].S,
                                    'received_at': record.dynamodb.NewImage['received_at'].S,
                                    'server_events_id': record.dynamodb.NewImage['id'].S,
                                    'server_event_created_at': record.dynamodb.NewImage['server_event_created_at'].S,
                                    'server_event_created_at_utc': record.dynamodb.NewImage['server_event_created_at_utc'].S,
                                    'server_event_source': record.dynamodb.NewImage['server_event_source'].S,
                                    'server_event_payload': record.dynamodb.NewImage['server_event_payload'].S
                                }
                            }
                        });
                    }

                    const batchWritePromisesForBrokenDownKeysItems = [];
                    for (let i = 0, j = brokenDownKeysItems.length; i < j; i += 25) {
                        const itemsBatch = brokenDownKeysItems.slice(i, i + 25);

                        if (itemsBatch.length > 0) {
                            batchWritePromisesForBrokenDownKeysItems.push(new Promise((resolve, reject) => {
                                docClient.batchWrite({
                                        RequestItems: {
                                            'server_events_by_key': itemsBatch
                                        }
                                    },
                                    (err, data) => {
                                        if (err) {
                                            _console.error(err);
                                            reject(err);
                                        } else {
                                            _console.log('Success', data);
                                            resolve(data);
                                        }
                                    });
                            }));
                        }
                    }

                    try {
                        await Promise.all(batchWritePromisesForBrokenDownKeysItems);
                        _console.log('All batchWritePromisesForBrokenDownKeysItems finished successfully.');
                    } catch (e) {
                        _console.error('batchWritePromisesForBrokenDownKeysItems finished with error.', e);
                    }


                    const brokenDownKeysAndValues = JsonHelper.getBrokenDownKeysAndValues(
                        JsonHelper.flattenToKeyValuePairs(parsedJson)
                    );

                    _console.debug(
                        'brokenDownKeysAndValues',
                        brokenDownKeysAndValues
                    );

                    const brokenDownKeysAndValuesItems = [];
                    for (let brokenDownKeyAndValue of brokenDownKeysAndValues) {
                        brokenDownKeysAndValuesItems.push({
                            PutRequest: {
                                Item: {
                                    'servers_id_key_value': record.dynamodb.NewImage['servers_id'].S + '_' + brokenDownKeyAndValue,
                                    'sort_value': record.dynamodb.NewImage['sort_value'].S,
                                    'servers_id': record.dynamodb.NewImage['servers_id'].S,
                                    'users_id': record.dynamodb.NewImage['users_id'].S,
                                    'received_at': record.dynamodb.NewImage['received_at'].S,
                                    'server_events_id': record.dynamodb.NewImage['id'].S,
                                    'server_event_created_at': record.dynamodb.NewImage['server_event_created_at'].S,
                                    'server_event_created_at_utc': record.dynamodb.NewImage['server_event_created_at_utc'].S,
                                    'server_event_source': record.dynamodb.NewImage['server_event_source'].S,
                                    'server_event_payload': record.dynamodb.NewImage['server_event_payload'].S
                                }
                            }
                        });
                    }

                    const batchWritePromisesForBrokenDownKeysAndValuesItems = [];
                    for (let i = 0, j = brokenDownKeysAndValuesItems.length; i < j; i += 25) {
                        const itemsBatch = brokenDownKeysAndValuesItems.slice(i, i + 25);

                        if (itemsBatch.length > 0) {
                            batchWritePromisesForBrokenDownKeysAndValuesItems.push(new Promise((resolve, reject) => {
                                docClient.batchWrite({
                                        RequestItems: {
                                            'server_events_by_key_value': itemsBatch
                                        }
                                    },
                                    (err, data) => {
                                        if (err) {
                                            _console.error(err);
                                            reject(err);
                                        } else {
                                            _console.log('Success', data);
                                            resolve(data);
                                        }
                                    });
                            }));
                        }
                    }

                    try {
                        await Promise.all(batchWritePromisesForBrokenDownKeysAndValuesItems);
                        _console.log('All batchWritePromisesForBrokenDownKeysAndValuesItems finished successfully.');
                    } catch (e) {
                        _console.error('batchWritePromisesForBrokenDownKeysAndValuesItems finished with error.', e);
                    }
                    
                } else {
                    _console.debug("Not going to break down payload because it's neither object nor array");
                }

                const brokenDownValues = JsonHelper.getBrokenDownValues(
                    parsedJson
                );

                _console.debug(
                    'brokenDownValues',
                    brokenDownValues
                );

                const brokenDownValuesItems = [];
                for (let brokenDownKeyAndValue of brokenDownValues) {
                    brokenDownValuesItems.push({
                        PutRequest: {
                            Item: {
                                'servers_id_value': record.dynamodb.NewImage['servers_id'].S + '_' + brokenDownKeyAndValue,
                                'sort_value': record.dynamodb.NewImage['sort_value'].S,
                                'servers_id': record.dynamodb.NewImage['servers_id'].S,
                                'users_id': record.dynamodb.NewImage['users_id'].S,
                                'received_at': record.dynamodb.NewImage['received_at'].S,
                                'server_events_id': record.dynamodb.NewImage['id'].S,
                                'server_event_created_at': record.dynamodb.NewImage['server_event_created_at'].S,
                                'server_event_created_at_utc': record.dynamodb.NewImage['server_event_created_at_utc'].S,
                                'server_event_source': record.dynamodb.NewImage['server_event_source'].S,
                                'server_event_payload': record.dynamodb.NewImage['server_event_payload'].S
                            }
                        }
                    });
                }

                const batchWritePromisesForBrokenDownValuesItems = [];
                for (let i = 0, j = brokenDownValuesItems.length; i < j; i += 25) {
                    const itemsBatch = brokenDownValuesItems.slice(i, i + 25);

                    if (itemsBatch.length > 0) {
                        batchWritePromisesForBrokenDownValuesItems.push(new Promise((resolve, reject) => {
                            docClient.batchWrite({
                                    RequestItems: {
                                        'server_events_by_value': itemsBatch
                                    }
                                },
                                (err, data) => {
                                    if (err) {
                                        _console.error(err);
                                        reject(err);
                                    } else {
                                        _console.log('Success', data);
                                        resolve(data);
                                    }
                                });
                        }));
                    }
                }

                try {
                    await Promise.all(batchWritePromisesForBrokenDownValuesItems);
                    _console.log('All batchWritePromisesForBrokenDownValuesItems finished successfully.');
                } catch (e) {
                    _console.error('batchWritePromisesForBrokenDownValuesItems finished with error.', e);
                }
            }
        } else {
            _console.debug('No valid INSERT detected.');
        }
    }
    _console.log(`Successfully processed ${event.Records.length} records.`);
    return `Successfully processed ${event.Records.length} records.`;
}
