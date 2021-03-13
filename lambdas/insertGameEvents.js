const AWS = require('aws-sdk');
const {'v1': uuidv1} = require('uuid');

AWS.config.update({region: 'eu-central-1'});
const docClient = new AWS.DynamoDB.DocumentClient();

const verifyAuthHeaders = async (userId, apiKeyId, gameserverId) => {
    const params = {
        TableName: 'api_keys',
        KeyConditionExpression: 'users_id = :users_id',
        ExpressionAttributeValues: {
            ':users_id': userId
        }
    };

    let result = false;
    await docClient.query(params, function(err, data) {
        if (err) {
            throw new Error(err);
        } else {
            console.log(data);
            for (let i = 0; i < data.Count; i++) {
                if (   data.Items[i].users_id === userId
                    && data.Items[i].gameservers_id === gameserverId
                    && data.Items[i].id === apiKeyId
                ) {
                    console.log(`Item ${i} looks good.`)
                    result = true;
                    return;
                } else {
                    console.log(`Item ${i} does not look good.`)
                }
            }
        }
    }).promise();

    return result;
};

exports.handler = async (event) => {

    const userId = event.headers['x-herodot-user-id'];
    const apiKeyId = event.headers['x-herodot-api-key-id'];
    const gameserverId = event.headers['x-herodot-gameserver-id'];

    console.log('Starting verify...');
    let verificationSuccessful = await verifyAuthHeaders(
        userId,
        apiKeyId,
        gameserverId
    );

    if (verificationSuccessful) {
        console.log('Verification successful.');
    } else {
        console.log('Verification not successful.');
        return {
            statusCode: 400,
            body: JSON.stringify(`Could not verify request based on auth values userId: ${userId}, apiKeyId: ${apiKeyId}, gameserverId: ${gameserverId}.`)
        };
    }

    console.debug('Event body: ', event.body);

    const gameserverEventsJson = (Buffer.from(event.body, 'base64')).toString('utf8');

    console.debug('Event body as UTF-8: ', gameserverEventsJson);

    const gameserverEvents = JSON.parse(gameserverEventsJson);

    const lambdaEventContent = JSON.stringify(event, null, 2);

    const items = [];
    for (let i = 0; i < gameserverEvents.length; i++) {
        items.push({
            PutRequest: {
                Item: {
                    'gameservers_id': gameserverId,
                    'id': uuidv1(),
                    'received_at': Date.now(),
                    'users_id': userId,
                    'api_keys_id': apiKeyId,
                    'gameserver_event_created_at': gameserverEvents[i].createdAt,
                    'gameserver_event_source': gameserverEvents[i].source,
                    'gameserver_event_payload': gameserverEvents[i].payload,
                    'lambda_event_full': lambdaEventContent,
                    'lambda_event_headers_x_forwarded_for': event.headers['x-forwarded-for'],
                    'lambda_event_headers_user_agent': event.headers['user-agent'],
                }
            }
        });
    }

    const params = {
        RequestItems: {
            'gameserver_events': items
        }
    };

    console.log('Starting write to DDB...');
    await docClient.batchWrite(params, function(err, data) {
        if (err) {
            throw new Error(err);
        } else {
            console.log('Success', data);
        }
    }).promise();

    return {
        statusCode: 201,
        body: JSON.stringify('Successfully stored your game events.')
    };
};
