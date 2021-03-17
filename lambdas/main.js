const AWS = require('aws-sdk');
const {'v1': uuidv1, 'v4': uuidv4} = require('uuid');

const AWS_REGION = 'eu-central-1';

AWS.config.update({region: AWS_REGION});
const docClient = new AWS.DynamoDB.DocumentClient();

const corsHeaders = {
    "Access-Control-Allow-Headers" : "Content-Type,X-Herodot-Webapp-Api-Key-Id",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
};

const corsOptionsResponse = {
    statusCode: 200,
    headers: corsHeaders,
    body: ''
};

const getRequestBodyParsedAsJson = (event) => {
    let requestBodyJson = null;
    {
        if (event.isBase64Encoded) {
            requestBodyJson = (Buffer.from(event.body, 'base64')).toString('utf8');
        } else {
            requestBodyJson = event.body;
        }
    }

    console.debug('Event body as UTF-8: ', requestBodyJson);

    return JSON.parse(requestBodyJson);
};

const authenticateWebappRequest = async (eventHeaders) => {
    console.debug('About to authenticate webapp request with api key id', eventHeaders['x-herodot-webapp-api-key-id']);
    const getParamsWebappApiKey = {
        TableName: 'webapp_api_keys',
        Key: {
            id: eventHeaders['x-herodot-webapp-api-key-id'],
        }
    };

    const getWebappApiKeyResultPromise = new Promise((resolve, reject) => {
        docClient.get(getParamsWebappApiKey, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.debug(data);
                if (data.hasOwnProperty('Item')) {
                    resolve(data.Item);
                } else {
                    reject(new Error('Missing property "Item".'));
                }
            }
        });
    });

    let getWebappApiKeyResult;
    try {
        console.debug('About to await getWebappApiKeyResultPromise');
        getWebappApiKeyResult = await getWebappApiKeyResultPromise;
    } catch (e) {
        console.error('await getWebappApiKeyResultPromise exception', e);
        getWebappApiKeyResult = null;
    }

    console.debug('getWebappApiKeyResult', getWebappApiKeyResult);

    return getWebappApiKeyResult;
};

const unknownWebappApiKeyIdResponse = {
    statusCode: 403,
    headers: corsHeaders,
    body: JSON.stringify('Unknown webapp api key id.')
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
        console.debug('newUserCredentialsJson', newUserCredentialsJson);

        const newUserCredentials = JSON.parse(newUserCredentialsJson);

        const getParams = {
            TableName: 'credentials',
            Key: {
                email: newUserCredentials.email,
            }
        };

        const userExists = await new Promise((resolve, reject) => {
            docClient.get(getParams, function(err, data) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.debug('getCredentials result', data);
                    if (data.hasOwnProperty('Item')) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            });
        });

        if (userExists) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify(`User ${newUserCredentials.email} already exists.`)
            };
        } else {

            const bcrypt = require('bcrypt');

            const hash = await bcrypt.hash(newUserCredentials.password, 8);
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

            await new Promise((resolve, reject) => {
                docClient.put(putParamsCredentials, function(err, data) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        console.debug('putCredentialsResult', data);
                        resolve(data);
                    }
                });
            });

            const putParamsUsers = {
                TableName: 'users',
                Item: {
                    id: userId,
                    credentials_email: newUserCredentials.email
                }
            };

            await new Promise((resolve, reject) => {
                docClient.put(putParamsUsers, function(err, data) {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        console.debug('putUsersResult', data);
                        resolve(data);
                    }
                });
            });

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
        console.debug('credentialsFromRequestJson', credentialsFromRequestJson);

        const credentialsFromRequest = JSON.parse(credentialsFromRequestJson);

        const getParams = {
            TableName: 'credentials',
            Key: {
                email: credentialsFromRequest.email,
            }
        };


        const credentialsFromDb = await new Promise((resolve, reject) => {
            docClient.get(getParams, function(err, data) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.debug('getCredentialsResult', data);
                    if (data.hasOwnProperty('Item')) {
                        resolve(data.Item);
                    } else {
                        resolve(null);
                    }
                }
            });
        });

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

            const response = await new Promise((resolve, reject) => {
                docClient.put(putParamsApiKeys, function(err) {
                    if (err) {
                        console.error(err);
                        resolve({
                            statusCode: 500,
                            headers: corsHeaders,
                            body: JSON.stringify(`Error: ${err}`)
                        });
                    } else {
                        resolve({
                            statusCode: 201,
                            headers: corsHeaders,
                            body: JSON.stringify(apiKeyId)
                        });
                    }
                });
            });

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

const handleRetrieveServerList = async (event) => {
    if (event.routeKey === 'OPTIONS /servers') {
        return corsOptionsResponse;

    } else {

        const webappApiKey = await authenticateWebappRequest(event.headers);

        if (webappApiKey === null) {
            return unknownWebappApiKeyIdResponse;
        }

        const queryParamsServers = {
            TableName: 'servers',
            KeyConditionExpression: 'users_id = :users_id',
            ExpressionAttributeValues: {
                ':users_id': webappApiKey.users_id
            }
        };

        const serversFromDb = [];
        const serversFromDbResult = await new Promise((resolve, reject) => {
            docClient.query(queryParamsServers, function(err, data) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.debug('queryServersResult', data);
                    resolve(data);
                }
            });
        });

        console.debug('res', serversFromDbResult);

        for (let i = 0; i < serversFromDbResult.Items.length; i++) {
            serversFromDb.push({
                id: serversFromDbResult.Items[i].id,
                userId: serversFromDbResult.Items[i].users_id,
                apiKeyId: serversFromDbResult.Items[i].logging_api_key_id,
                title: serversFromDbResult.Items[i].title,
                events: []
            });
        }

        for (let i = 0; i < serversFromDb.length; i++) {
            const queryParamsServerEvents = {
                TableName: 'server_events',
                Limit: 100,
                ScanIndexForward: false,
                KeyConditionExpression: 'servers_id = :servers_id',
                ExpressionAttributeValues: {
                    ':servers_id': serversFromDb[i].id
                }
            };

            // See https://github.com/aws/aws-sdk-js/issues/2700#issuecomment-512243758
            // for an explanation why we don't use docClient.query().promise()
            const serverEventsFromDbResultPromise = new Promise((resolve, reject) => {
                docClient.query(queryParamsServerEvents, (err, data) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });

            const serverEventsFromDbResult = await serverEventsFromDbResultPromise;

            for (let j = 0; j < serverEventsFromDbResult.Items.length; j++) {
                serversFromDb[i].events.push({
                    createdAt: serverEventsFromDbResult.Items[j].server_event_created_at,
                    source: serverEventsFromDbResult.Items[j].server_event_source,
                    payload: serverEventsFromDbResult.Items[j].server_event_payload,
                });
            }
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(serversFromDb)
        }
    }
};

const handleCreateServer = async (event) => {

    const webappApiKey = await authenticateWebappRequest(event.headers);

    if (webappApiKey === null) {
        return unknownWebappApiKeyIdResponse
    }

    const requestBodyParsedAsJson = getRequestBodyParsedAsJson(event);

    const serverId = uuidv4();
    const loggingApiKeyId = uuidv4();

    await new Promise((resolve, reject) => {
        docClient.put(
            {
                TableName: 'servers',
                Item: {
                    id: serverId,
                    users_id: webappApiKey.users_id,
                    logging_api_key_id: loggingApiKeyId,
                    title: requestBodyParsedAsJson.title
                }
            },
            (err, data) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.debug('docClient.put.servers', data);
                    resolve(data);
                }
            }
        );
    });

    return {
        statusCode: 201,
        headers: corsHeaders,
        body: JSON.stringify({
            id: serverId,
            userId: webappApiKey.users_id,
            apiKeyId: loggingApiKeyId,
            title: requestBodyParsedAsJson.title,
            events: []
        })
    };
};

const handleInsertServerEventsRequest = async (event) => {

    const verifyAuthInformation = async (userId, apiKeyId, serverId) => {
        const params = {
            TableName: 'servers',
            KeyConditionExpression: 'users_id = :users_id',
            ExpressionAttributeValues: {
                ':users_id': userId
            }
        };

        const result = await new Promise((resolve, reject) => {
            docClient.query(params, function(err, data) {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    console.log(data);
                    for (let i = 0; i < data.Count; i++) {
                        if (   data.Items[i].users_id === userId
                            && data.Items[i].id === serverId
                            && data.Items[i].logging_api_key_id === apiKeyId
                        ) {
                            console.log(`Item ${i} looks good.`)
                            resolve(true);
                        } else {
                            console.log(`Item ${i} does not look good.`)
                        }
                    }
                    resolve(false);
                }
            })
        });
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
                    'sort_value': `${serverEvents[i].createdAt} ${uuidv1()}`,
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
    await new Promise((resolve, reject) => {
        docClient.batchWrite(params, function(err, data) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log('Success', data);
                resolve(data);
            }
        });
    });

    docClient.batchWrite(params, function(err, data) {
        if (err) {
            throw new Error(err);
        } else {
            console.log('Success', data);
        }
    });

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

    if (   event.routeKey === 'GET /servers'
        || event.routeKey === 'OPTIONS /servers'
    ) {
        return handleRetrieveServerList(event);
    }

    if (event.routeKey === 'POST /servers') {
        return handleCreateServer(event);
    }

    if (event.routeKey === 'POST /server-events') {
        return handleInsertServerEventsRequest(event);
    }

    return {
        statusCode: 404,
        body: JSON.stringify(`No handler for routeKey ${event.routeKey}.`)
    };
};
