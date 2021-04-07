import DatetimeHelper from '../../../shared/DatetimeHelper.mjs';
const { endOfToday, subDays, set } = require('date-fns');

const AWS = require('aws-sdk');
const {'v1': uuidv1, 'v4': uuidv4} = require('uuid');

const AWS_REGION = 'eu-central-1';


const consoleOp = true;
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

const corsHeaders = (event) => (
    ['http://localhost:3000', 'https://app.logbuddy.io'].includes(event.headers.origin)
        ? {
            'Access-Control-Allow-Headers' : 'Content-Type,X-Herodot-Webapp-Api-Key-Id',
            'Access-Control-Allow-Origin': event.headers.origin,
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        }
        : {}
);

const corsOptionsResponse = (event) => ({
    statusCode: 200,
    headers: corsHeaders(event),
    body: ''
});

const getRequestBody = (event) => {
    let requestBody;
    if (event.isBase64Encoded) {
        requestBody = (Buffer.from(event.body, 'base64')).toString('utf8');
    } else {
        requestBody = event.body;
    }
    return requestBody;
}

const getRequestBodyParsedAsJson = (event) => {
    const requestBody = getRequestBody(event);
    _console.debug('Event body as UTF-8: ', requestBody);
    return JSON.parse(requestBody);
};

const authenticateWebappRequest = async (eventHeaders) => {
    _console.debug('About to authenticate webapp request with api key id', eventHeaders['x-herodot-webapp-api-key-id']);
    const getParamsWebappApiKey = {
        TableName: 'webapp_api_keys',
        Key: {
            id: eventHeaders['x-herodot-webapp-api-key-id'],
        }
    };

    const getWebappApiKeyResultPromise = new Promise((resolve, reject) => {
        docClient.get(getParamsWebappApiKey, function(err, data) {
            if (err) {
                _console.error(err);
                reject(err);
            } else {
                _console.debug(data);
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
        _console.debug('About to await getWebappApiKeyResultPromise');
        getWebappApiKeyResult = await getWebappApiKeyResultPromise;
    } catch (e) {
        _console.error('await getWebappApiKeyResultPromise exception', e);
        getWebappApiKeyResult = null;
    }

    _console.debug('getWebappApiKeyResult', getWebappApiKeyResult);

    return getWebappApiKeyResult;
};


const serverBelongsToUser = (serverId, userId) => new Promise((resolve, reject) => {
    docClient.query({
        TableName: 'servers',
        KeyConditionExpression: 'users_id = :users_id',
        ExpressionAttributeValues: {
            ':users_id': userId
        }
    }, (err, data) => {
        if (err) {
            _console.error(err);
            reject(err);
        } else {
            _console.log(data);
            for (let i = 0; i < data.Count; i++) {
                if (data.Items[i].id === serverId) {
                    resolve(true);
                }
            }
            resolve(false);
        }
    });
});


const unknownWebappApiKeyIdResponse = (event) => ({
    statusCode: 403,
    headers: corsHeaders(event),
    body: JSON.stringify('Unknown webapp api key id.')
});


const handleRegisterAccountRequest = async (event) => {
    let newUserCredentialsJson;
    if (event.isBase64Encoded) {
        newUserCredentialsJson = (Buffer.from(event.body, 'base64')).toString('utf8');
    } else {
        newUserCredentialsJson = event.body;
    }
    _console.debug('newUserCredentialsJson', newUserCredentialsJson);

    const newUserCredentials = JSON.parse(newUserCredentialsJson);

    newUserCredentials.email = newUserCredentials.email.toLowerCase();

    const getParams = {
        TableName: 'credentials',
        Key: {
            email: newUserCredentials.email,
        }
    };

    const userExists = await new Promise((resolve, reject) => {
        docClient.get(getParams, function(err, data) {
            if (err) {
                _console.error(err);
                reject(err);
            } else {
                _console.debug('getCredentials result', data);
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
            headers: corsHeaders(event),
            body: JSON.stringify(`User ${newUserCredentials.email} already exists.`)
        };
    } else {

        const bcrypt = require('bcrypt');

        const hash = await bcrypt.hash(newUserCredentials.password, 8);
        const userId = uuidv1();

        _console.log('Hash: ', hash);
        _console.log('Id: ', userId);

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
                    _console.error(err);
                    reject(err);
                } else {
                    _console.debug('putCredentialsResult', data);
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
                    _console.error(err);
                    reject(err);
                } else {
                    _console.debug('putUsersResult', data);
                    resolve(data);
                }
            });
        });

        return {
            statusCode: 201,
            headers: corsHeaders(event),
            body: JSON.stringify(userId)
        };
    }
};

const handleCreateWebappApiKeyRequest = async (event) => {
    let credentialsFromRequestJson;
    if (event.isBase64Encoded) {
        credentialsFromRequestJson = (Buffer.from(event.body, 'base64')).toString('utf8');
    } else {
        credentialsFromRequestJson = event.body;
    }
    _console.debug('credentialsFromRequestJson', credentialsFromRequestJson);

    const credentialsFromRequest = JSON.parse(credentialsFromRequestJson);

    credentialsFromRequest.email = credentialsFromRequest.email.toLowerCase();

    const getParams = {
        TableName: 'credentials',
        Key: {
            email: credentialsFromRequest.email,
        }
    };


    const credentialsFromDb = await new Promise((resolve, reject) => {
        docClient.get(getParams, function(err, data) {
            if (err) {
                _console.error(err);
                reject(err);
            } else {
                _console.debug('getCredentialsResult', data);
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
                headers: corsHeaders(event),
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
                    _console.error(err);
                    resolve({
                        statusCode: 500,
                        headers: corsHeaders(event),
                        body: JSON.stringify(`Error: ${err}`)
                    });
                } else {
                    resolve({
                        statusCode: 201,
                        headers: corsHeaders(event),
                        body: JSON.stringify(apiKeyId)
                    });
                }
            });
        });

        return response;
    } else {
        return {
            statusCode: 404,
            headers: corsHeaders(event),
            body: JSON.stringify(`User ${credentialsFromRequest.email} does not exist.`)
        };
    }
};


const getSelectedTimelineIntervalValues = (event) => {
    let selectedTimelineIntervalStart;
    let selectedTimelineIntervalEnd;
    if (   !event.queryStringParameters.hasOwnProperty('selectedTimelineIntervalStart')
        || !event.queryStringParameters.hasOwnProperty('selectedTimelineIntervalEnd')
    ) {
        selectedTimelineIntervalStart =
            JSON.stringify(
                set(subDays(new Date(), 7), { hours: 0, minutes: 0, seconds: 0, milliseconds: 0 })
            ).substring(3, 22)
        ;
        selectedTimelineIntervalEnd =
            JSON.stringify(
                endOfToday()
            ).substring(3, 22);
    } else {
        selectedTimelineIntervalStart = event.queryStringParameters.selectedTimelineIntervalStart.substring(0, 19);
        selectedTimelineIntervalEnd = event.queryStringParameters.selectedTimelineIntervalEnd.substring(0, 19);
    }

    return { selectedTimelineIntervalStart, selectedTimelineIntervalEnd };
};

const handleRetrieveServerListRequest = async (event) => {
    const webappApiKey = await authenticateWebappRequest(event.headers);

    if (webappApiKey === null) {
        return unknownWebappApiKeyIdResponse(event);
    }

    const { selectedTimelineIntervalStart, selectedTimelineIntervalEnd } = getSelectedTimelineIntervalValues(event);

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
                _console.error(err);
                reject(err);
            } else {
                _console.debug('queryServersResult', data);
                resolve(data);
            }
        });
    });

    _console.debug('res', serversFromDbResult);

    for (let i = 0; i < serversFromDbResult.Items.length; i++) {

        _console.debug('serversFromDbResult.Items[i].id', serversFromDbResult.Items[i].id);
        _console.debug('selectedTimelineIntervalStart', selectedTimelineIntervalStart);
        _console.debug('selectedTimelineIntervalEnd', selectedTimelineIntervalEnd);

        let type = 'default';
        if (serversFromDbResult.Items[i].hasOwnProperty('type')) {
            type = serversFromDbResult.Items[i].type;
        }
        serversFromDb.push({
            id: serversFromDbResult.Items[i].id,
            userId: serversFromDbResult.Items[i].users_id,
            apiKeyId: serversFromDbResult.Items[i].logging_api_key_id,
            title: serversFromDbResult.Items[i].title,
            type,
            latestEventSortValue: null,
            latestEvents: [],
            latestEventsBy: []
        });
    }

    for (let i = 0; i < serversFromDb.length; i++) {
        const queryParamsServerEvents = {
            TableName: 'server_events',
            Limit: 10000,
            ScanIndexForward: false,
            KeyConditionExpression: '' +
                'servers_id = :servers_id' +
                ' AND sort_value BETWEEN :selected_timeline_interval_start AND :selected_timeline_interval_end',
            ExpressionAttributeValues: {
                ':servers_id': serversFromDb[i].id,
                ':selected_timeline_interval_start': selectedTimelineIntervalStart,
                ':selected_timeline_interval_end': selectedTimelineIntervalEnd,
            }
        };

        // See https://github.com/aws/aws-sdk-js/issues/2700#issuecomment-512243758
        // for an explanation why we don't use docClient.query().promise()
        const serverEventsFromDbResultPromise = new Promise((resolve, reject) => {
            docClient.query(queryParamsServerEvents, (err, data) => {
                if (err) {
                    _console.error(err);
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });

        const serverEventsFromDbResult = await serverEventsFromDbResultPromise;

        for (let j = 0; j < serverEventsFromDbResult.Items.length; j++) {
            if (j === 0) {
                serversFromDb[i].latestEventSortValue = serverEventsFromDbResult.Items[j].sort_value;
            }
            let id = null;
            if (serverEventsFromDbResult.Items[j].hasOwnProperty('id')) {
                id = serverEventsFromDbResult.Items[j].id;
            }
            serversFromDb[i].latestEvents.push({
                id: id,
                serverId: serverEventsFromDbResult.Items[j].servers_id,
                userId: serverEventsFromDbResult.Items[j].users_id,
                receivedAt: serverEventsFromDbResult.Items[j].received_at,
                sortValue: serverEventsFromDbResult.Items[j].sort_value,
                createdAt: serverEventsFromDbResult.Items[j].server_event_created_at,
                createdAtUtc: serverEventsFromDbResult.Items[j].server_event_created_at_utc,
                source: serverEventsFromDbResult.Items[j].server_event_source,
                payload: serverEventsFromDbResult.Items[j].server_event_payload,
            });
        }
    }

    return {
        statusCode: 200,
        headers: corsHeaders(event),
        body: JSON.stringify(serversFromDb)
    }
};


const handleRetrieveServerEventsRequest = async (event) => {
    const webappApiKey = await authenticateWebappRequest(event.headers);

    if (!(event.hasOwnProperty('pathParameters') && event.pathParameters.hasOwnProperty('serverId'))) {
        return {
            statusCode: 400,
            headers: corsHeaders(event),
            body: JSON.stringify({
                message: 'Problem with query path',
                expectedRequestPath: '/servers/{serverId}/events',
                actualRequestPath: event.rawPath
            }, null, 2)
        };
    }

    const serverId = event.pathParameters.serverId;

    if (await serverBelongsToUser(serverId, webappApiKey.users_id) === false) {
        return {
            statusCode: 403,
            headers: corsHeaders(event),
            body: JSON.stringify({
                message: `Server ${serverId} does not belong to user ${webappApiKey.users_id}.`,
            }, null, 2)
        };
    }

    const { selectedTimelineIntervalStart, selectedTimelineIntervalEnd } = getSelectedTimelineIntervalValues(event);

    const serverEvents = await new Promise((resolve, reject) => {
        docClient.query(
            {
                TableName: 'server_events',
                Limit: 10000,
                ScanIndexForward: false,
                KeyConditionExpression: '' +
                    'servers_id = :servers_id' +
                    ' AND sort_value BETWEEN :selected_timeline_interval_start AND :selected_timeline_interval_end',
                ExpressionAttributeValues: {
                    ':servers_id': serverId,
                    ':selected_timeline_interval_start': selectedTimelineIntervalStart,
                    ':selected_timeline_interval_end': selectedTimelineIntervalEnd,
                }
            }, (err, data) => {
            if (err) {
                _console.error(err);
                reject(err);
            } else {
                _console.log(data);
                let serverEvents = [];
                for (let i = 0; i < data.Count; i++) {
                    let id = null;
                    if (data.Items[i].hasOwnProperty('id')) {
                        id = data.Items[i].id;
                    }

                    if (   latestSeenSortValue === null
                        || data.Items[i].sort_value > latestSeenSortValue
                    ) {
                        serverEvents.push({
                            id: id,
                            serverId: data.Items[i].servers_id,
                            userId: data.Items[i].users_id,
                            receivedAt: data.Items[i].received_at,
                            sortValue: data.Items[i].sort_value,
                            createdAt: data.Items[i].server_event_created_at,
                            createdAtUtc: data.Items[i].server_event_created_at_utc,
                            source: data.Items[i].server_event_source,
                            payload: data.Items[i].server_event_payload,
                        });
                    }
                }
                resolve(serverEvents);
            }
        });
    });

    return {
        statusCode: 200,
        headers: corsHeaders(event),
        body: JSON.stringify(serverEvents)
    };
};


const handleCreateServerRequest = async (event) => {

    const webappApiKey = await authenticateWebappRequest(event.headers);

    if (webappApiKey === null) {
        return unknownWebappApiKeyIdResponse(event)
    }

    const requestBodyParsedAsJson = getRequestBodyParsedAsJson(event);

    if (   !requestBodyParsedAsJson.hasOwnProperty('title')
        ||  requestBodyParsedAsJson.title.trim() === ''
    ) {
        return {
            statusCode: 400,
            headers: corsHeaders(event),
            body: JSON.stringify({
                message: 'Problem with request body',
                expectedRequestBody: { title: 'x' },
                actualRequestBody: getRequestBody(event)
            }, null, 2)
        };
    }

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
                    _console.error(err);
                    reject(err);
                } else {
                    _console.debug('docClient.put.servers', data);
                    resolve(data);
                }
            }
        );
    });

    return {
        statusCode: 201,
        headers: corsHeaders(event),
        body: JSON.stringify({
            id: serverId,
            userId: webappApiKey.users_id,
            apiKeyId: loggingApiKeyId,
            title: requestBodyParsedAsJson.title,
            latestEventSortValue: null,
            latestEvents: [],
            latestEventsBy: []
        })
    };
};


const handleRetrieveYetUnseenServerEventsRequest = async (event) => {
    const webappApiKey = await authenticateWebappRequest(event.headers);

    if (webappApiKey === null) {
        return unknownWebappApiKeyIdResponse(event);
    }

    let serverId;
    let latestSeenSortValue;
    if (   !event.queryStringParameters.hasOwnProperty('serverId')
        || !event.queryStringParameters.hasOwnProperty('latestSeenSortValue')
    ) {
        return {
            statusCode: 400,
            headers: corsHeaders(event),
            body: JSON.stringify({
                message: 'Problem with query string parameters',
                expectedQueryStringParameters: { serverId: 'x', latestSeenSortValue: 'y' },
                actualQueryStringParameters: event.queryStringParameters
            }, null, 2)
        };
    } else {
        serverId = event.queryStringParameters.serverId;
        latestSeenSortValue = event.queryStringParameters.latestSeenSortValue;
        if (latestSeenSortValue === 'null') {
            latestSeenSortValue = null;
        }
    }

    if (await serverBelongsToUser(serverId, webappApiKey.users_id) === false) {
        return {
            statusCode: 403,
            headers: corsHeaders(event),
            body: JSON.stringify({
                message: `Server ${serverId} does not belong to user ${webappApiKey.users_id}.`,
            }, null, 2)
        };
    }

    const { selectedTimelineIntervalStart, selectedTimelineIntervalEnd } = getSelectedTimelineIntervalValues(event);

    const expressionAttributeValues = {
        ':servers_id': serverId,
        ':selected_timeline_interval_end': selectedTimelineIntervalEnd
    }

    if (   latestSeenSortValue === null
        || selectedTimelineIntervalStart > latestSeenSortValue
    ) {
        expressionAttributeValues[':start'] = selectedTimelineIntervalStart
    } else {
        expressionAttributeValues[':start'] = latestSeenSortValue
    }

    const yetUnseenServerEvents = await new Promise((resolve, reject) => {
        const params = {
            TableName: 'server_events',
            Limit: 10000,
            ScanIndexForward: false,
            KeyConditionExpression: '' +
                'servers_id = :servers_id' +
                ' AND sort_value BETWEEN :start AND :selected_timeline_interval_end',
            ExpressionAttributeValues: expressionAttributeValues
        };
        docClient.query(params, (err, data) => {
            if (err) {
                _console.error(err);
                reject(err);
            } else {
                _console.log(data);
                let serverEvents = [];
                for (let i = 0; i < data.Count; i++) {
                    let id = null;
                    if (data.Items[i].hasOwnProperty('id')) {
                        id = data.Items[i].id;
                    }

                    if (   latestSeenSortValue === null
                        || data.Items[i].sort_value > latestSeenSortValue
                    ) {
                        serverEvents.push({
                            id: id,
                            serverId: data.Items[i].servers_id,
                            userId: data.Items[i].users_id,
                            receivedAt: data.Items[i].received_at,
                            sortValue: data.Items[i].sort_value,
                            createdAt: data.Items[i].server_event_created_at,
                            createdAtUtc: data.Items[i].server_event_created_at_utc,
                            source: data.Items[i].server_event_source,
                            payload: data.Items[i].server_event_payload,
                        });
                    }
                }
                resolve(serverEvents);
            }
        });
    });

    return {
        statusCode: 200,
        headers: corsHeaders(event),
        body: JSON.stringify(yetUnseenServerEvents)
    };
};


const handleRetrieveServerEventsByRequest = async (event) => {
    const byNameToTablename = {
        'key': 'server_events_by_key',
        'value': 'server_events_by_value',
        'keyValue': 'server_events_by_key_value'
    };

    const byNameToPk = {
        'key': 'servers_id_key',
        'value': 'servers_id_value',
        'keyValue': 'servers_id_key_value'
    };

    const webappApiKey = await authenticateWebappRequest(event.headers);

    if (webappApiKey === null) {
        return unknownWebappApiKeyIdResponse(event);
    }

    if (   !event.queryStringParameters.hasOwnProperty('byName[0]')
        || !['key', 'value', 'keyValue'].includes(event.queryStringParameters['byName[0]'])
        || !event.queryStringParameters.hasOwnProperty('byVal[0]')
        || !event.queryStringParameters.hasOwnProperty('serverId')
    ) {
        return {
            statusCode: 400,
            headers: corsHeaders(event),
            body: JSON.stringify({
                message: 'Problem with query string parameters',
                expectedQueryStringParameters: { serverId: 'y', 'byName[n]': 'key|value|keyValue', 'byVal[n]': 'x' },
                actualQueryStringParameters: event.queryStringParameters
            }, null, 2)
        };
    }

    const reqServerId = event.queryStringParameters.serverId;

    if (await serverBelongsToUser(reqServerId, webappApiKey.users_id) === false) {
        return {
            statusCode: 403,
            headers: corsHeaders(event),
            body: JSON.stringify({
                message: `Server ${reqServerId} does not belong to user ${webappApiKey.users_id}.`,
            }, null, 2)
        };
    }

    const { selectedTimelineIntervalStart, selectedTimelineIntervalEnd } = getSelectedTimelineIntervalValues(event);

    let i = 0;
    let exhausted = false;
    let serverEvents = [];
    const promises = [];
    while (!exhausted) {
        if (!event.queryStringParameters.hasOwnProperty(`byName[${i}]`)) {
            exhausted = true;
            continue;
        }
        const reqByName = event.queryStringParameters[`byName[${i}]`];
        const reqByVal = event.queryStringParameters[`byVal[${i}]`];

        i++;

        promises.push(
            new Promise((resolve, reject) => {
                const params = {
                    TableName: byNameToTablename[reqByName],
                    Limit: 250,
                    ScanIndexForward: false,
                    KeyConditionExpression: byNameToPk[reqByName] + ' = :pk' +
                        ' AND sort_value BETWEEN :selected_timeline_interval_start AND :selected_timeline_interval_end',
                    ExpressionAttributeValues: {
                        ':pk': reqServerId + '_' + reqByVal,
                        ':selected_timeline_interval_start': selectedTimelineIntervalStart,
                        ':selected_timeline_interval_end': selectedTimelineIntervalEnd,
                    }
                };
                docClient.query(params, (err, data) => {
                    if (err) {
                        _console.error('docClient.query', err);
                        reject(err);
                    } else {
                        _console.log(data);
                        let serverEvents = [];
                        for (let i = 0; i < data.Count; i++) {
                            serverEvents.push({
                                id: data.Items[i].server_events_id,
                                serverId: data.Items[i].servers_id,
                                userId: data.Items[i].users_id,
                                receivedAt: data.Items[i].received_at,
                                sortValue: data.Items[i].sort_value,
                                createdAt: data.Items[i].server_event_created_at,
                                createdAtUtc: data.Items[i].server_event_created_at_utc,
                                source: data.Items[i].server_event_source,
                                payload: data.Items[i].server_event_payload,
                            });
                        }
                        resolve(serverEvents);
                    }
                });
            })
        );
    }

    const serverEventResultsets = await Promise.all(promises);

    let first = true;
    for (let serverEventResultset of serverEventResultsets) {
        if (first) {
            serverEvents = serverEventResultset;
            first = false;
        } else {
            const remainingServerEvents = [];
            for (let serverEvent of serverEvents) {
                for (let serverEventResult of serverEventResultset) {
                    if (serverEventResult.id === serverEvent.id) {
                        remainingServerEvents.push(serverEvent);
                    }
                }
            }
            serverEvents = remainingServerEvents;
        }
    }

    return {
        statusCode: 200,
        headers: corsHeaders(event),
        body: JSON.stringify(serverEvents)
    };
};


const handleInsertServerEventsRequest = async (event) => {

    const verifyAuthInformation = async (userId, apiKeyId, serverId) => {
        return await new Promise((resolve, reject) => {
            docClient.query({
                    TableName: 'servers',
                    KeyConditionExpression: 'users_id = :users_id',
                    ExpressionAttributeValues: {
                        ':users_id': userId
                    }
                }, (err, data) => {
                    if (err) {
                        _console.error(err);
                        reject(err);
                    } else {
                        _console.log(data);
                        for (let i = 0; i < data.Count; i++) {
                            if (   data.Items[i].users_id === userId
                                && data.Items[i].id === serverId
                                && data.Items[i].logging_api_key_id === apiKeyId
                            ) {
                                _console.log(`Item ${i} looks good.`)
                                resolve(true);
                            } else {
                                _console.log(`Item ${i} does not look good.`)
                            }
                        }
                        resolve(false);
                    }
                });
        });
    };

    _console.debug('Request body: ', event.body);

    let requestBodyJson = null;
    {
        if (event.isBase64Encoded) {
            requestBodyJson = (Buffer.from(event.body, 'base64')).toString('utf8');
        } else {
            requestBodyJson = event.body;
        }
    }

    _console.debug('Event body as UTF-8: ', requestBodyJson);

    const requestBodyObject = JSON.parse(requestBodyJson);

    const userId = requestBodyObject['userId'];
    const apiKeyId = requestBodyObject['apiKeyId'];
    const serverId = requestBodyObject['serverId'];

    _console.log('Starting verify...');
    let verificationSuccessful = await verifyAuthInformation(
        userId,
        apiKeyId,
        serverId
    );

    if (verificationSuccessful) {
        _console.log('Verification successful.');
    } else {
        _console.log('Verification not successful.');
        return {
            statusCode: 400,
            body: JSON.stringify(`Could not verify request based on auth values userId: ${userId}, apiKeyId: ${apiKeyId}, serverId: ${serverId}.`)
        };
    }

    const lambdaEventContent = JSON.stringify(event, null, 2);

    const serverEvents = requestBodyObject.events;

    const items = [];
    for (let i = 0; i < serverEvents.length; i++) {
        const createdAt = serverEvents[i].createdAt.substring(0, 1024);
        const createdAtUtc = DatetimeHelper.getUTCDatetimeString(createdAt);
        const source = serverEvents[i].source.substring(0, 1024);
        const payload = JSON.stringify(serverEvents[i].payload).substring(0, 65535);
        items.push({
            PutRequest: {
                Item: {
                    'id': uuidv4(),
                    'servers_id': serverId,
                    'sort_value': `${createdAtUtc === null ? createdAt : createdAtUtc} ${uuidv1()}`,
                    'received_at': Date.now(),
                    'users_id': userId,
                    'api_keys_id': apiKeyId,
                    'server_event_created_at': createdAt,
                    'server_event_created_at_utc': createdAtUtc,
                    'server_event_source': source,
                    'server_event_payload': payload,
                    'lambda_event_full': lambdaEventContent,
                    'lambda_event_headers_x_forwarded_for': event.headers['x-forwarded-for'],
                    'lambda_event_headers_user_agent': event.headers['user-agent'],
                }
            }
        });
    }

    _console.log('Starting write to DDB...');

    const batchWritePromises = [];
    for (let i = 0, j = items.length; i < j; i += 25) {
        const itemsBatch = items.slice(i, i + 25);

        if (itemsBatch.length > 0) {
            batchWritePromises.push(new Promise((resolve, reject) => {
                docClient.batchWrite({
                        RequestItems: {
                            'server_events': itemsBatch
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

    await Promise.all(batchWritePromises);

    return {
        statusCode: 201,
        body: JSON.stringify('Successfully stored your server events.')
    };
};

exports.handler = async (event) => {

    _console.debug('Received event:' + JSON.stringify(event, null, 2));

    if (event.requestContext.http.method === 'OPTIONS') {
        return corsOptionsResponse(event);
    }

    if (event.routeKey === 'POST /users') {
        return handleRegisterAccountRequest(event);
    }

    if (event.routeKey === 'POST /webapp-api-keys') {
        return handleCreateWebappApiKeyRequest(event);
    }

    if (event.routeKey === 'GET /servers') {
        return handleRetrieveServerListRequest(event);
    }

    if (event.routeKey === 'POST /servers') {
        return handleCreateServerRequest(event);
    }

    if (event.routeKey === 'GET /servers/{serverId}/events') {
        return handleRetrieveServerEventsRequest(event);
    }

    if (event.routeKey === 'GET /yet-unseen-server-events') {
        return handleRetrieveYetUnseenServerEventsRequest(event);
    }

    if (event.routeKey === 'GET /server-events-by') {
        return handleRetrieveServerEventsByRequest(event);
    }

    if (event.routeKey === 'POST /server-events') {
        return handleInsertServerEventsRequest(event);
    }

    return {
        statusCode: 404,
        body: JSON.stringify(`No handler for routeKey ${event.routeKey}.`)
    };
};
