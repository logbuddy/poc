const AWS = require('aws-sdk');
const {'v1': uuidv1, 'v4': uuidv4} = require('uuid');

const AWS_REGION = 'eu-central-1';

AWS.config.update({region: AWS_REGION});
const docClient = new AWS.DynamoDB.DocumentClient();

const corsHeaders = {
    "Access-Control-Allow-Headers" : "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST"
};

const corsOptionsResponse = {
    statusCode: 200,
    headers: corsHeaders,
    body: ''
};

const handleRegisterAccountRequest = async (event) => {

    if (event.routeKey === 'OPTIONS /users') {
        return corsOptionsResponse;

    } else {

        let newUserCredentialsJson;
        if (event.isBase64Encoded) {
            newUserCredentialsJson = (Buffer.from(event.body, 'base64')).toString('utf8');
        } else {
            newUserCredentialsJson = event.body;
        }
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

const handleCreateWebappApiKey = async (event) => {
    if (event.routeKey === 'OPTIONS /webapp-api-keys') {
        return corsOptionsResponse;

    } else {

        let credentialsFromRequestJson;
        if (event.isBase64Encoded) {
            credentialsFromRequestJson = (Buffer.from(event.body, 'base64')).toString('utf8');
        } else {
            credentialsFromRequestJson = event.body;
        }
        console.debug(credentialsFromRequestJson);

        const credentialsFromRequest = JSON.parse(credentialsFromRequestJson);

        const getParams = {
            TableName: 'credentials',
            Key: {
                email: credentialsFromRequest.email,
            }
        };

        let credentialsFromDb = null;
        await docClient.get(getParams, function(err, data) {
            if (err) {
                throw new Error(err);
            } else {
                console.debug(data);
                if (data.hasOwnProperty('Item')) {
                    credentialsFromDb = data.Item;
                }
            }
        }).promise();

        if (credentialsFromDb !== null) {

            const bcrypt = require('bcrypt');

            const passwordIsValid = await bcrypt.compare(credentialsFromRequest.password, credentialsFromDb['password_hash']);

            if (!passwordIsValid) {
                return {
                    statusCode: 403,
                    headers: corsHeaders,
                    body: JSON.stringify('Invalid credentials.')
                };
            }

            const apiKeyId = uuidv4();
            const putParamsApiKeys = {
                TableName: 'webapp_api_keys',
                Item: {
                    id: apiKeyId,
                    users_id: credentialsFromDb['users_id']
                }
            };

            let response = null;
            await docClient.put(putParamsApiKeys, function(err) {
                if (err) {
                    response = {
                        statusCode: 500,
                        headers: corsHeaders,
                        body: JSON.stringify(`Error: ${err}`)
                    }
                } else {
                    response = {
                        statusCode: 201,
                        headers: corsHeaders,
                        body: JSON.stringify(apiKeyId)
                    }
                }
            }).promise();

            return response;
        } else {
            return {
                statusCode: 404,
                headers: corsHeaders,
                body: JSON.stringify(`User ${credentialsFromRequest.email} does not exist.`)
            };
        }
    }
};

const handleInsertGameEventsRequest = async (event) => {

    const verifyAuthInformation = async (userId, apiKeyId, serverId) => {
        const params = {
            TableName: 'logging_api_keys',
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
                        && data.Items[i].servers_id === serverId
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

    console.debug('Request body: ', event.body);

    let requestBodyJson = null;
    {
        if (event.isBase64Encoded) {
            requestBodyJson = (Buffer.from(event.body, 'base64')).toString('utf8');
        } else {
            requestBodyJson = event.body;
        }
    }

    console.debug('Event body as UTF-8: ', requestBodyJson);

    const requestBodyObject = JSON.parse(requestBodyJson);

    const userId = requestBodyObject['userId'];
    const apiKeyId = requestBodyObject['apiKeyId'];
    const serverId = requestBodyObject['serverId'];

    console.log('Starting verify...');
    let verificationSuccessful = await verifyAuthInformation(
        userId,
        apiKeyId,
        serverId
    );

    if (verificationSuccessful) {
        console.log('Verification successful.');
    } else {
        console.log('Verification not successful.');
        return {
            statusCode: 400,
            body: JSON.stringify(`Could not verify request based on auth values userId: ${userId}, apiKeyId: ${apiKeyId}, serverId: ${serverId}.`)
        };
    }

    const lambdaEventContent = JSON.stringify(event, null, 2);

    const serverEvents = requestBodyObject.events;

    const items = [];
    for (let i = 0; i < serverEvents.length; i++) {
        items.push({
            PutRequest: {
                Item: {
                    'servers_id': serverId,
                    'id': uuidv1(),
                    'received_at': Date.now(),
                    'users_id': userId,
                    'api_keys_id': apiKeyId,
                    'server_event_created_at': serverEvents[i].createdAt,
                    'server_event_source': serverEvents[i].source,
                    'server_event_payload': serverEvents[i].payload,
                    'lambda_event_full': lambdaEventContent,
                    'lambda_event_headers_x_forwarded_for': event.headers['x-forwarded-for'],
                    'lambda_event_headers_user_agent': event.headers['user-agent'],
                }
            }
        });
    }

    const params = {
        RequestItems: {
            'server_events': items
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

    console.debug('Received event:' + JSON.stringify(event, null, 2));

    if (   event.routeKey === 'POST /users'
        || event.routeKey === 'OPTIONS /users'
    ) {
        return handleRegisterAccountRequest(event);
    }

    if (   event.routeKey === 'POST /webapp-api-keys'
        || event.routeKey === 'OPTIONS /webapp-api-keys'
    ) {
        return handleCreateWebappApiKey(event);
    }

    if (event.routeKey === 'POST /server-events') {
        return handleInsertGameEventsRequest(event);
    }

    return {
        statusCode: 404,
        body: JSON.stringify(`No handler for routeKey ${event.routeKey}.`)
    };
};
