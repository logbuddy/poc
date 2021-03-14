const AWS = require('aws-sdk');
const {'v1': uuidv1} = require('uuid');

const AWS_REGION = 'eu-central-1';

AWS.config.update({region: AWS_REGION});
const docClient = new AWS.DynamoDB.DocumentClient();

const handleRegisterAccountRequest = async (event) => {

    const corsHeaders = {
        "Access-Control-Allow-Headers" : "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST"
    };

    if (event.routeKey === 'OPTIONS /users') {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: ''
        };

    } else {

        const newUserCredentialsJson = (Buffer.from(event.body, 'base64')).toString('utf8');
        console.debug(newUserCredentialsJson);

        const newUserCredentials = JSON.parse(newUserCredentialsJson);

        const getParams = {
            TableName: 'credentials',
            Key: {
                email: newUserCredentials.email,
            }
        };

        let userExists = false;
        await docClient.get(getParams, function(err, data) {
            if (err) {
                console.error(err);
            } else {
                console.debug(data);
                if (data.hasOwnProperty('Item')) {
                    userExists = true;
                }
            }
        }).promise();

        if (userExists) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify(`User ${newUserCredentials.email} already exists.`)
            };
        } else {

            const bcrypt = require('bcrypt');

            const hash = await bcrypt.hash(newUserCredentials.password, 10);
            const userId = uuidv1();

            console.log('Hash: ', hash);
            console.log('Id: ', userId);

            const putParamsCredentials = {
                TableName: 'credentials',
                Item: {
                    email: newUserCredentials.email,
                    'password_hash': hash,
                    users_id: userId
                }
            };

            await docClient.put(putParamsCredentials, function(err, data) {
                if (err) {
                    console.error(err);
                } else {
                    console.debug(data);
                }
            }).promise();

            const putParamsUsers = {
                TableName: 'users',
                Item: {
                    id: userId,
                    credentials_email: newUserCredentials.email
                }
            };

            await docClient.put(putParamsUsers, function(err, data) {
                if (err) {
                    console.error(err);
                } else {
                    console.debug(data);
                }
            }).promise();

            return {
                statusCode: 201,
                headers: corsHeaders,
                body: JSON.stringify(userId)
            };
        }
    }
};

const handleInsertGameEventsRequest = async (event) => {

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

exports.handler = async (event) => {

    if (   event.routeKey === 'POST /users'
        || event.routeKey === 'OPTIONS /users'
    ) {
        return handleRegisterAccountRequest(event);
    }

    if (event.routeKey === 'POST /game-events') {
        return handleInsertGameEventsRequest(event);
    }

    return {
        statusCode: 404,
        body: JSON.stringify(`No handler for routeKey ${event.routeKey}.`)
    };
};
