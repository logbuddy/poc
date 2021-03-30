import JsonHelper from '../../../../shared/JsonHelper.mjs';

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
                    const brokenDownKeysAndValues = JsonHelper.getBrokenDownKeysAndValues(
                        JsonHelper.flattenToKeyValuePairs(parsedJson)
                    );

                    console.debug(
                        'brokenDownKeysAndValues',
                        brokenDownKeysAndValues
                    );

                    console.debug(
                        'uniqueValues',
                        JsonHelper.getUniqueValues(
                            brokenDownKeysAndValues
                        )
                    );
                } else {
                    console.debug("Not going to handle payload because it's neither object nor array");
                }
            }
        } else {
            console.debug('No valid INSERT detected.');
        }
    }
    return `Successfully processed ${event.Records.length} records.`;
}
