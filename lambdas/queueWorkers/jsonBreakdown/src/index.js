import JsonHelper from '../../../../shared/JsonHelper.mjs';

const AWS = require('aws-sdk');

const AWS_REGION = 'eu-central-1';

AWS.config.update({region: AWS_REGION});
const docClient = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    for (const record of event.Records) {
        console.log(record.eventID);
        console.log(record.eventName);
        console.log('DynamoDB Record: %j', record.dynamodb);

        if (   record.eventName === 'INSERT'
            && record.dynamodb.hasOwnProperty('NewImage')
            && record.dynamodb.NewImage.hasOwnProperty('servers_id')
            && record.dynamodb.NewImage.hasOwnProperty('server_event_created_at')
            && record.dynamodb.NewImage.hasOwnProperty('server_event_payload')
            && record.dynamodb.NewImage['server_event_payload'].hasOwnProperty('S')
        ) {
            console.debug('Valid INSERT detected.');

            console.debug('Trying to parse payload as JSON', record.dynamodb.NewImage['server_event_payload'].S);

            let parsedJson = null;
            try {
                parsedJson = JSON.parse(record.dynamodb.NewImage['server_event_payload'].S);
            } catch (e) {
                console.error('Cannot parse payload into valid JSON', e);
            }

            if (parsedJson === null) {
                console.error('Could not parse payload into valid JSON');
            } else {

                if (typeof parsedJson === 'object') {
                    const brokenDownKeys = JsonHelper.getBrokenDownKeys(
                        JsonHelper.flattenToKeyValuePairs(parsedJson)
                    );

                    console.debug(
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
                                    'server_event_created_at': record.dynamodb.NewImage['server_event_created_at'].S,
                                    'server_event_source': record.dynamodb.NewImage['server_event_source'].S,
                                    'server_event_payload': record.dynamodb.NewImage['server_event_payload'].S
                                }
                            }
                        });
                    }

                    const batchWritePromises = [];
                    for (let i = 0, j = brokenDownKeysItems.length; i < j; i += 25) {
                        const itemsBatch = brokenDownKeysItems.slice(i, i + 25);

                        if (itemsBatch.length > 0) {
                            batchWritePromises.push(new Promise((resolve, reject) => {
                                docClient.batchWrite({
                                        RequestItems: {
                                            'server_events_by_key': itemsBatch
                                        }
                                    },
                                    (err, data) => {
                                        if (err) {
                                            console.error(err);
                                            reject(err);
                                        } else {
                                            console.log('Success', data);
                                            resolve(data);
                                        }
                                    });
                            }));
                        }
                    }

                    await Promise.all(batchWritePromises);

                    const brokenDownKeysAndValues = JsonHelper.getBrokenDownKeysAndValues(
                        JsonHelper.flattenToKeyValuePairs(parsedJson)
                    );

                    console.debug(
                        'brokenDownKeysAndValues',
                        brokenDownKeysAndValues
                    );
                } else {
                    console.debug("Not going to break down payload because it's neither object nor array");
                }

                const brokenDownValues = JsonHelper.getBrokenDownValues(
                    parsedJson
                );

                console.debug(
                    'brokenDownValues',
                    brokenDownValues
                );
            }
        } else {
            console.debug('No valid INSERT detected.');
        }
    }
    return `Successfully processed ${event.Records.length} records.`;
}
